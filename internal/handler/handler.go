package handler

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/zentra/plugin-marketplace/internal/store"
)

type Handler struct {
	store         *store.Store
	buildsDir     string
	publicBaseURL string
}

func New(s *store.Store, buildsDir string, publicBaseURL string) *Handler {
	return &Handler{store: s, buildsDir: buildsDir, publicBaseURL: strings.TrimSuffix(publicBaseURL, "/")}
}

func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()

	// Public catalog - this is what Zentra instances fetch from
	r.Get("/plugins", h.ListPlugins)
	r.Get("/plugins/search", h.SearchPlugins)
	r.Get("/plugins/{id}", h.GetPlugin)
	r.Post("/plugins/{id}/download", h.TrackDownload)

	// Plugin submission (would normally need auth, but keeping it simple for now)
	r.Post("/plugins", h.SubmitPlugin)
	r.Post("/builds/upload", h.UploadBuildPackage)
	r.Put("/plugins/{id}", h.UpdatePlugin)
	r.Delete("/plugins/{id}", h.DeletePlugin)

	// Admin endpoints
	r.Patch("/plugins/{id}/verify", h.SetVerified)

	return r
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": data,
	})
}

func respondError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}

// ListPlugins returns all plugins in the marketplace.
// This is the endpoint that Zentra instances call when syncing from a source.
func (h *Handler) ListPlugins(w http.ResponseWriter, r *http.Request) {
	plugins, err := h.store.ListPlugins(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to list plugins")
		return
	}

	if plugins == nil {
		plugins = []*store.Plugin{}
	}

	respondJSON(w, http.StatusOK, plugins)
}

func (h *Handler) SearchPlugins(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if q == "" {
		respondError(w, http.StatusBadRequest, "Search query required")
		return
	}

	plugins, err := h.store.SearchPlugins(r.Context(), q)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Search failed")
		return
	}

	if plugins == nil {
		plugins = []*store.Plugin{}
	}

	respondJSON(w, http.StatusOK, plugins)
}

func (h *Handler) GetPlugin(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	plugin, err := h.store.GetPlugin(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Plugin not found")
		return
	}

	respondJSON(w, http.StatusOK, plugin)
}

func (h *Handler) TrackDownload(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.store.IncrementDownloads(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to track download")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) SubmitPlugin(w http.ResponseWriter, r *http.Request) {
	var input store.CreatePluginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if input.Slug == "" || input.Name == "" || input.Author == "" || input.Version == "" {
		respondError(w, http.StatusBadRequest, "slug, name, author, and version are required")
		return
	}

	// Upsert by slug so plugin authors can publish new versions without creating new slugs.
	if existing, err := h.store.GetPluginBySlug(r.Context(), input.Slug); err == nil && existing != nil {
		plugin, updateErr := h.store.UpdatePlugin(r.Context(), existing.ID, &input)
		if updateErr != nil {
			respondError(w, http.StatusInternalServerError, "Failed to update plugin")
			return
		}

		respondJSON(w, http.StatusOK, plugin)
		return
	}

	plugin, err := h.store.CreatePlugin(r.Context(), &input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create plugin")
		return
	}

	respondJSON(w, http.StatusCreated, plugin)
}

func (h *Handler) UpdatePlugin(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var input store.CreatePluginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	plugin, err := h.store.UpdatePlugin(r.Context(), id, &input)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update plugin")
		return
	}

	respondJSON(w, http.StatusOK, plugin)
}

func (h *Handler) DeletePlugin(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.store.DeletePlugin(r.Context(), id); err != nil {
		respondError(w, http.StatusNotFound, "Plugin not found or cannot be deleted")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) SetVerified(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var body struct {
		Verified bool `json:"verified"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := h.store.SetVerified(r.Context(), id, body.Verified); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update verification status")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

type uploadedManifest struct {
	Slug        string          `json:"slug"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Author      string          `json:"author"`
	Version     string          `json:"version"`
	HomepageURL string          `json:"homepageUrl,omitempty"`
	SourceURL   string          `json:"sourceUrl,omitempty"`
	IconURL     string          `json:"iconUrl,omitempty"`
	Permissions json.RawMessage `json:"requestedPermissions,omitempty"`
	Manifest    json.RawMessage `json:"manifest,omitempty"`
}

type uploadedPluginManifest struct {
	Slug                 string   `json:"slug"`
	Name                 string   `json:"name"`
	Version              string   `json:"version"`
	Description          string   `json:"description"`
	Author               string   `json:"author"`
	RequestedPermissions int      `json:"requestedPermissions,omitempty"`
	HomepageURL          string   `json:"homepageUrl,omitempty"`
	SourceURL            string   `json:"sourceUrl,omitempty"`
	IconURL              string   `json:"iconUrl,omitempty"`
	Icon                 string   `json:"icon,omitempty"`
	ChannelTypes         []string `json:"channelTypes,omitempty"`
	Commands             []string `json:"commands,omitempty"`
	Triggers             []string `json:"triggers,omitempty"`
	Hooks                []string `json:"hooks,omitempty"`
	FrontendBundle       string   `json:"frontendBundle,omitempty"`
}

var permissionByName = map[string]int{
	"readmessages":    1 << 0,
	"sendmessages":    1 << 1,
	"managemessages":  1 << 2,
	"readmembers":     1 << 3,
	"managemembers":   1 << 4,
	"readchannels":    1 << 5,
	"managechannels":  1 << 6,
	"addchanneltypes": 1 << 7,
	"addcommands":     1 << 8,
	"serverinfo":      1 << 9,
	"webhooks":        1 << 10,
	"reacttomessages": 1 << 11,

	// snake_case aliases
	"read_messages":     1 << 0,
	"send_messages":     1 << 1,
	"manage_messages":   1 << 2,
	"read_members":      1 << 3,
	"manage_members":    1 << 4,
	"read_channels":     1 << 5,
	"manage_channels":   1 << 6,
	"add_channel_types": 1 << 7,
	"add_commands":      1 << 8,
	"server_info":       1 << 9,
	"react_to_messages": 1 << 11,
}

func parseRequestedPermissions(raw json.RawMessage) (int, error) {
	if len(raw) == 0 {
		return 0, nil
	}

	var asInt int
	if err := json.Unmarshal(raw, &asInt); err == nil {
		if asInt < 0 {
			return 0, fmt.Errorf("requestedPermissions cannot be negative")
		}
		return asInt, nil
	}

	var asString string
	if err := json.Unmarshal(raw, &asString); err == nil {
		asString = strings.TrimSpace(asString)
		if asString == "" {
			return 0, nil
		}
		parsed, err := strconv.Atoi(asString)
		if err != nil || parsed < 0 {
			return 0, fmt.Errorf("requestedPermissions string must be a non-negative integer")
		}
		return parsed, nil
	}

	var asNames []string
	if err := json.Unmarshal(raw, &asNames); err == nil {
		bitmask := 0
		for _, name := range asNames {
			normalized := strings.ToLower(strings.TrimSpace(name))
			perm, ok := permissionByName[normalized]
			if !ok {
				return 0, fmt.Errorf("unknown permission name %q", name)
			}
			bitmask |= perm
		}
		return bitmask, nil
	}

	return 0, fmt.Errorf("requestedPermissions must be a number, numeric string, or string[]")
}

func resolvePackagedAssetURL(baseURL, slug, version, rawPath string) string {
	assetPath := strings.TrimSpace(rawPath)
	assetPath = strings.TrimPrefix(assetPath, "./")
	assetPath = strings.TrimPrefix(assetPath, "/")
	if assetPath == "" {
		return ""
	}
	if strings.HasPrefix(assetPath, "http://") || strings.HasPrefix(assetPath, "https://") {
		return assetPath
	}
	return fmt.Sprintf("%s/builds/%s/%s/%s", baseURL, slug, version, assetPath)
}

func sanitizePathPart(v string) string {
	v = strings.TrimSpace(strings.ToLower(v))
	v = strings.ReplaceAll(v, " ", "-")
	v = strings.ReplaceAll(v, "_", "-")
	v = strings.Trim(v, "-")
	if v == "" {
		return "plugin"
	}
	var b strings.Builder
	for _, r := range v {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' || r == '.' {
			b.WriteRune(r)
		}
	}
	clean := strings.Trim(b.String(), "-")
	if clean == "" {
		return "plugin"
	}
	return clean
}

func parseManifestContent(content []byte) (*uploadedPluginManifest, error) {
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(content, &raw); err != nil {
		return nil, err
	}

	requestedPermissions, err := parseRequestedPermissions(raw["requestedPermissions"])
	if err != nil {
		return nil, err
	}

	type uploadedPluginManifestPayload struct {
		Slug           string   `json:"slug"`
		Name           string   `json:"name"`
		Version        string   `json:"version"`
		Description    string   `json:"description"`
		Author         string   `json:"author"`
		HomepageURL    string   `json:"homepageUrl,omitempty"`
		SourceURL      string   `json:"sourceUrl,omitempty"`
		IconURL        string   `json:"iconUrl,omitempty"`
		Icon           string   `json:"icon,omitempty"`
		ChannelTypes   []string `json:"channelTypes,omitempty"`
		Commands       []string `json:"commands,omitempty"`
		Triggers       []string `json:"triggers,omitempty"`
		Hooks          []string `json:"hooks,omitempty"`
		FrontendBundle string   `json:"frontendBundle,omitempty"`
	}

	payload := &uploadedPluginManifestPayload{}
	if err := json.Unmarshal(content, payload); err == nil && payload.Slug != "" {
		return &uploadedPluginManifest{
			Slug:                 payload.Slug,
			Name:                 payload.Name,
			Version:              payload.Version,
			Description:          payload.Description,
			Author:               payload.Author,
			RequestedPermissions: requestedPermissions,
			HomepageURL:          payload.HomepageURL,
			SourceURL:            payload.SourceURL,
			IconURL:              payload.IconURL,
			Icon:                 payload.Icon,
			ChannelTypes:         payload.ChannelTypes,
			Commands:             payload.Commands,
			Triggers:             payload.Triggers,
			Hooks:                payload.Hooks,
			FrontendBundle:       payload.FrontendBundle,
		}, nil
	}

	wrapped := &uploadedManifest{}
	if err := json.Unmarshal(content, wrapped); err != nil {
		return nil, err
	}

	parsed := &uploadedPluginManifest{
		Slug:                 wrapped.Slug,
		Name:                 wrapped.Name,
		Description:          wrapped.Description,
		Author:               wrapped.Author,
		Version:              wrapped.Version,
		HomepageURL:          wrapped.HomepageURL,
		SourceURL:            wrapped.SourceURL,
		IconURL:              wrapped.IconURL,
		RequestedPermissions: requestedPermissions,
	}
	if parsed.RequestedPermissions == 0 {
		if wrappedPermissions, err := parseRequestedPermissions(wrapped.Permissions); err == nil {
			parsed.RequestedPermissions = wrappedPermissions
		}
	}

	if len(wrapped.Manifest) > 0 {
		var embedded uploadedPluginManifest
		if err := json.Unmarshal(wrapped.Manifest, &embedded); err == nil {
			if parsed.RequestedPermissions == 0 {
				var embeddedRaw map[string]json.RawMessage
				if err := json.Unmarshal(wrapped.Manifest, &embeddedRaw); err == nil {
					if embeddedPermissions, err := parseRequestedPermissions(embeddedRaw["requestedPermissions"]); err == nil {
						parsed.RequestedPermissions = embeddedPermissions
					}
				}
			}
			if embedded.ChannelTypes != nil {
				parsed.ChannelTypes = embedded.ChannelTypes
			}
			if embedded.Commands != nil {
				parsed.Commands = embedded.Commands
			}
			if embedded.Triggers != nil {
				parsed.Triggers = embedded.Triggers
			}
			if embedded.Hooks != nil {
				parsed.Hooks = embedded.Hooks
			}
			if embedded.FrontendBundle != "" {
				parsed.FrontendBundle = embedded.FrontendBundle
			}
			if embedded.Icon != "" {
				parsed.Icon = embedded.Icon
			}
			if embedded.IconURL != "" {
				parsed.IconURL = embedded.IconURL
			}
		}
	}

	return parsed, nil
}

func (h *Handler) resolveBaseURL(r *http.Request) string {
	if h.publicBaseURL != "" {
		return h.publicBaseURL
	}
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if forwardedProto := r.Header.Get("X-Forwarded-Proto"); forwardedProto != "" {
		scheme = strings.Split(forwardedProto, ",")[0]
	}
	host := r.Header.Get("X-Forwarded-Host")
	if host == "" {
		host = r.Host
	}
	return fmt.Sprintf("%s://%s", scheme, host)
}

func (h *Handler) UploadBuildPackage(w http.ResponseWriter, r *http.Request) {
	if h.buildsDir == "" {
		respondError(w, http.StatusInternalServerError, "Build storage is not configured")
		return
	}

	if err := r.ParseMultipartForm(200 << 20); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid form data")
		return
	}

	file, _, err := r.FormFile("package")
	if err != nil {
		respondError(w, http.StatusBadRequest, "Missing package upload")
		return
	}
	defer file.Close()

	archiveBytes, err := io.ReadAll(io.LimitReader(file, 250<<20))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Failed to read package file")
		return
	}

	zipReader, err := zip.NewReader(bytes.NewReader(archiveBytes), int64(len(archiveBytes)))
	if err != nil {
		respondError(w, http.StatusBadRequest, "Uploaded file is not a valid zip package")
		return
	}

	var manifest *uploadedPluginManifest
	var manifestParseErr error
	manifestCandidates := []string{"manifest.json", "plugin.json", "zentra-plugin.json"}

	for _, candidate := range manifestCandidates {
		for _, f := range zipReader.File {
			name := strings.TrimPrefix(filepath.ToSlash(f.Name), "./")
			base := strings.ToLower(filepath.Base(name))
			if base != strings.ToLower(candidate) {
				continue
			}

			reader, openErr := f.Open()
			if openErr != nil {
				continue
			}
			content, readErr := io.ReadAll(reader)
			reader.Close()
			if readErr != nil {
				continue
			}

			parsed, parseErr := parseManifestContent(content)
			if parseErr == nil {
				manifest = parsed
				break
			}

			manifestParseErr = parseErr
		}
		if manifest != nil {
			break
		}
	}

	if manifest == nil || manifest.Slug == "" || manifest.Version == "" {
		if manifestParseErr != nil {
			respondError(w, http.StatusBadRequest, fmt.Sprintf("Package manifest could not be parsed: %v", manifestParseErr))
			return
		}
		respondError(w, http.StatusBadRequest, "Package must contain a manifest with slug and version")
		return
	}

	slug := sanitizePathPart(manifest.Slug)
	version := sanitizePathPart(manifest.Version)
	targetRoot := filepath.Join(h.buildsDir, slug, version)
	if err := os.RemoveAll(targetRoot); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to prepare build storage")
		return
	}
	if err := os.MkdirAll(targetRoot, 0o755); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create build storage")
		return
	}

	for _, f := range zipReader.File {
		cleanName := filepath.Clean(strings.TrimPrefix(f.Name, "/"))
		if cleanName == "." || strings.HasPrefix(cleanName, "..") {
			continue
		}

		targetPath := filepath.Join(targetRoot, cleanName)
		if !strings.HasPrefix(targetPath, targetRoot+string(os.PathSeparator)) && targetPath != targetRoot {
			continue
		}

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(targetPath, 0o755); err != nil {
				respondError(w, http.StatusInternalServerError, "Failed to unpack package")
				return
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(targetPath), 0o755); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to unpack package")
			return
		}

		src, openErr := f.Open()
		if openErr != nil {
			respondError(w, http.StatusInternalServerError, "Failed to unpack package")
			return
		}

		dst, createErr := os.Create(targetPath)
		if createErr != nil {
			src.Close()
			respondError(w, http.StatusInternalServerError, "Failed to unpack package")
			return
		}

		if _, copyErr := io.Copy(dst, src); copyErr != nil {
			dst.Close()
			src.Close()
			respondError(w, http.StatusInternalServerError, "Failed to unpack package")
			return
		}
		dst.Close()
		src.Close()
	}

	entry := strings.TrimSpace(manifest.FrontendBundle)
	entry = strings.TrimPrefix(entry, "./")
	entry = strings.TrimPrefix(entry, "/")
	if entry == "" {
		entries, err := filepath.Glob(filepath.Join(targetRoot, "dist", "*.js"))
		if err == nil && len(entries) > 0 {
			sort.Slice(entries, func(i, j int) bool {
				return len(filepath.Base(entries[i])) < len(filepath.Base(entries[j]))
			})
			entry = filepath.ToSlash(strings.TrimPrefix(entries[0], targetRoot+string(os.PathSeparator)))
		}
	}

	if entry == "" {
		respondError(w, http.StatusBadRequest, "Could not determine plugin frontend entry file")
		return
	}

	if _, err := os.Stat(filepath.Join(targetRoot, filepath.FromSlash(entry))); err != nil {
		respondError(w, http.StatusBadRequest, "Frontend entry file was not found in uploaded package")
		return
	}

	bundleURL := fmt.Sprintf("%s/builds/%s/%s/%s", h.resolveBaseURL(r), slug, version, entry)
	iconURL := manifest.IconURL
	if iconURL == "" {
		iconURL = resolvePackagedAssetURL(h.resolveBaseURL(r), slug, version, manifest.Icon)
	} else {
		iconURL = resolvePackagedAssetURL(h.resolveBaseURL(r), slug, version, iconURL)
	}

	manifestResponse := map[string]any{
		"channelTypes":   manifest.ChannelTypes,
		"commands":       manifest.Commands,
		"triggers":       manifest.Triggers,
		"hooks":          manifest.Hooks,
		"frontendBundle": bundleURL,
		"icon":           manifest.Icon,
		"iconUrl":        iconURL,
	}

	respondJSON(w, http.StatusCreated, map[string]any{
		"slug":                 manifest.Slug,
		"name":                 manifest.Name,
		"description":          manifest.Description,
		"author":               manifest.Author,
		"version":              manifest.Version,
		"homepageUrl":          manifest.HomepageURL,
		"sourceUrl":            manifest.SourceURL,
		"iconUrl":              iconURL,
		"requestedPermissions": manifest.RequestedPermissions,
		"manifest":             manifestResponse,
		"buildBaseUrl":         fmt.Sprintf("%s/builds/%s/%s/", h.resolveBaseURL(r), slug, version),
		"frontendBundleUrl":    bundleURL,
	})
}
