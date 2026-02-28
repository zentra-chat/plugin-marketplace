package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PluginManifest struct {
	ChannelTypes   []string `json:"channelTypes,omitempty"`
	Commands       []string `json:"commands,omitempty"`
	Triggers       []string `json:"triggers,omitempty"`
	Hooks          []string `json:"hooks,omitempty"`
	FrontendBundle string   `json:"frontendBundle,omitempty"`
}

type Plugin struct {
	ID                   string          `json:"id"`
	Slug                 string          `json:"slug"`
	Name                 string          `json:"name"`
	Description          string          `json:"description"`
	Author               string          `json:"author"`
	Version              string          `json:"version"`
	HomepageURL          string          `json:"homepageUrl,omitempty"`
	SourceURL            string          `json:"sourceUrl,omitempty"`
	IconURL              string          `json:"iconUrl,omitempty"`
	RequestedPermissions int             `json:"requestedPermissions"`
	Manifest             json.RawMessage `json:"manifest"`
	BuiltIn              bool            `json:"builtIn"`
	Source               string          `json:"source"`
	IsVerified           bool            `json:"isVerified"`
	Downloads            int             `json:"downloads"`
	CreatedAt            time.Time       `json:"createdAt"`
	UpdatedAt            time.Time       `json:"updatedAt"`
}

type CreatePluginInput struct {
	Slug                 string          `json:"slug"`
	Name                 string          `json:"name"`
	Description          string          `json:"description"`
	Author               string          `json:"author"`
	Version              string          `json:"version"`
	HomepageURL          string          `json:"homepageUrl"`
	SourceURL            string          `json:"sourceUrl"`
	IconURL              string          `json:"iconUrl"`
	RequestedPermissions int             `json:"requestedPermissions"`
	Manifest             json.RawMessage `json:"manifest"`
}

type Store struct {
	db *pgxpool.Pool
}

func New(db *pgxpool.Pool) *Store {
	return &Store{db: db}
}

func (s *Store) ListPlugins(ctx context.Context) ([]*Plugin, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, slug, name, description, author, version,
		        homepage_url, source_url, icon_url,
		        requested_permissions, manifest, built_in, source,
		        is_verified, downloads, created_at, updated_at
		 FROM plugins
		 ORDER BY downloads DESC, name ASC`)
	if err != nil {
		return nil, fmt.Errorf("query plugins: %w", err)
	}
	defer rows.Close()

	var plugins []*Plugin
	for rows.Next() {
		p := &Plugin{}
		if err := rows.Scan(
			&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
			&p.HomepageURL, &p.SourceURL, &p.IconURL,
			&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
			&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan plugin: %w", err)
		}
		plugins = append(plugins, p)
	}

	return plugins, nil
}

func (s *Store) SearchPlugins(ctx context.Context, query string) ([]*Plugin, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, slug, name, description, author, version,
		        homepage_url, source_url, icon_url,
		        requested_permissions, manifest, built_in, source,
		        is_verified, downloads, created_at, updated_at
		 FROM plugins
		 WHERE name ILIKE '%' || $1 || '%'
		    OR description ILIKE '%' || $1 || '%'
		    OR slug ILIKE '%' || $1 || '%'
		    OR author ILIKE '%' || $1 || '%'
		 ORDER BY downloads DESC, name ASC`, query)
	if err != nil {
		return nil, fmt.Errorf("search plugins: %w", err)
	}
	defer rows.Close()

	var plugins []*Plugin
	for rows.Next() {
		p := &Plugin{}
		if err := rows.Scan(
			&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
			&p.HomepageURL, &p.SourceURL, &p.IconURL,
			&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
			&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan plugin: %w", err)
		}
		plugins = append(plugins, p)
	}

	return plugins, nil
}

func (s *Store) GetPlugin(ctx context.Context, id string) (*Plugin, error) {
	p := &Plugin{}
	err := s.db.QueryRow(ctx,
		`SELECT id, slug, name, description, author, version,
		        homepage_url, source_url, icon_url,
		        requested_permissions, manifest, built_in, source,
		        is_verified, downloads, created_at, updated_at
		 FROM plugins WHERE id = $1`, id).Scan(
		&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
		&p.HomepageURL, &p.SourceURL, &p.IconURL,
		&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
		&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get plugin: %w", err)
	}
	return p, nil
}

func (s *Store) GetPluginBySlug(ctx context.Context, slug string) (*Plugin, error) {
	p := &Plugin{}
	err := s.db.QueryRow(ctx,
		`SELECT id, slug, name, description, author, version,
		        homepage_url, source_url, icon_url,
		        requested_permissions, manifest, built_in, source,
		        is_verified, downloads, created_at, updated_at
		 FROM plugins WHERE slug = $1`, slug).Scan(
		&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
		&p.HomepageURL, &p.SourceURL, &p.IconURL,
		&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
		&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("get plugin by slug: %w", err)
	}
	return p, nil
}

func (s *Store) CreatePlugin(ctx context.Context, input *CreatePluginInput) (*Plugin, error) {
	id := uuid.New().String()

	manifest := input.Manifest
	if manifest == nil {
		manifest = json.RawMessage("{}")
	}

	p := &Plugin{}
	err := s.db.QueryRow(ctx,
		`INSERT INTO plugins (id, slug, name, description, author, version,
		                       homepage_url, source_url, icon_url,
		                       requested_permissions, manifest, source)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'marketplace')
		 RETURNING id, slug, name, description, author, version,
		           homepage_url, source_url, icon_url,
		           requested_permissions, manifest, built_in, source,
		           is_verified, downloads, created_at, updated_at`,
		id, input.Slug, input.Name, input.Description, input.Author, input.Version,
		input.HomepageURL, input.SourceURL, input.IconURL,
		input.RequestedPermissions, manifest,
	).Scan(
		&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
		&p.HomepageURL, &p.SourceURL, &p.IconURL,
		&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
		&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create plugin: %w", err)
	}
	return p, nil
}

func (s *Store) UpdatePlugin(ctx context.Context, id string, input *CreatePluginInput) (*Plugin, error) {
	manifest := input.Manifest
	if manifest == nil {
		manifest = json.RawMessage("{}")
	}

	p := &Plugin{}
	err := s.db.QueryRow(ctx,
		`UPDATE plugins
		 SET name = $2, description = $3, author = $4, version = $5,
		     homepage_url = $6, source_url = $7, icon_url = $8,
		     requested_permissions = $9, manifest = $10, updated_at = NOW()
		 WHERE id = $1
		 RETURNING id, slug, name, description, author, version,
		           homepage_url, source_url, icon_url,
		           requested_permissions, manifest, built_in, source,
		           is_verified, downloads, created_at, updated_at`,
		id, input.Name, input.Description, input.Author, input.Version,
		input.HomepageURL, input.SourceURL, input.IconURL,
		input.RequestedPermissions, manifest,
	).Scan(
		&p.ID, &p.Slug, &p.Name, &p.Description, &p.Author, &p.Version,
		&p.HomepageURL, &p.SourceURL, &p.IconURL,
		&p.RequestedPermissions, &p.Manifest, &p.BuiltIn, &p.Source,
		&p.IsVerified, &p.Downloads, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update plugin: %w", err)
	}
	return p, nil
}

func (s *Store) DeletePlugin(ctx context.Context, id string) error {
	tag, err := s.db.Exec(ctx, `DELETE FROM plugins WHERE id = $1 AND built_in = false`, id)
	if err != nil {
		return fmt.Errorf("delete plugin: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("plugin not found or is built-in")
	}
	return nil
}

func (s *Store) IncrementDownloads(ctx context.Context, id string) error {
	_, err := s.db.Exec(ctx, `UPDATE plugins SET downloads = downloads + 1 WHERE id = $1`, id)
	return err
}

func (s *Store) SetVerified(ctx context.Context, id string, verified bool) error {
	_, err := s.db.Exec(ctx, `UPDATE plugins SET is_verified = $2 WHERE id = $1`, id, verified)
	return err
}
