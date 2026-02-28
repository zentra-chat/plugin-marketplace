package main

import (
	"context"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/zentra/plugin-marketplace/internal/handler"
	"github.com/zentra/plugin-marketplace/internal/store"
)

func main() {
	ctx := context.Background()

	dbURL := os.Getenv("MARKETPLACE_DATABASE_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DATABASE_URL")
	}
	if dbURL == "" {
		dbURL = "postgres://zentra:zentra_secure_password@localhost:5432/plugin_marketplace?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	webDir := os.Getenv("WEB_DIR")
	if webDir == "" {
		webDir = "web/build"
	}

	buildsDir := os.Getenv("BUILDS_DIR")
	if buildsDir == "" {
		buildsDir = "builds"
	}

	publicBaseURL := strings.TrimSuffix(os.Getenv("MARKETPLACE_PUBLIC_URL"), "/")

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Database ping failed: %v", err)
	}
	log.Println("Connected to database")

	s := store.New(pool)
	h := handler.New(s, buildsDir, publicBaseURL)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Mount("/api/v1", h.Routes())

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "ok")
	})

	if err := os.MkdirAll(buildsDir, 0o755); err != nil {
		log.Fatalf("Failed to create builds directory: %v", err)
	}
	log.Printf("Serving plugin builds from %s", buildsDir)
	r.Handle("/builds/*", http.StripPrefix("/builds/", http.FileServer(http.Dir(buildsDir))))

	// Serve the SvelteKit web frontend if the build directory exists.
	// For any path that doesn't match a static file, serve index.html
	// so SvelteKit's client-side router can handle it.
	if info, err := os.Stat(webDir); err == nil && info.IsDir() {
		log.Printf("Serving web frontend from %s", webDir)
		fileServer := http.FileServer(http.Dir(webDir))

		serveStatic := func(w http.ResponseWriter, r *http.Request) {
			path := strings.TrimPrefix(r.URL.Path, "/")

			// Serve static files if they exist on disk
			if path != "" {
				if _, err := fs.Stat(os.DirFS(webDir), path); err == nil {
					fileServer.ServeHTTP(w, r)
					return
				}
			}

			// Everything else goes to index.html for SPA client-side routing
			http.ServeFile(w, r, filepath.Join(webDir, "index.html"))
		}

		// chi's /* wildcard doesn't match the bare root path,
		// so we need both routes for the SPA to work
		r.Get("/", serveStatic)
		r.Get("/*", serveStatic)
	} else {
		log.Println("Web frontend not found at", webDir, "- only API endpoints will be available")
		log.Println("Run 'cd web && pnpm install && pnpm build' to build the frontend")

		// At least serve something useful on the root instead of 404
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, `<!DOCTYPE html>
<html><head><title>Zentra Plugin Marketplace</title></head>
<body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f0f12;color:#e4e4e8">
<div style="text-align:center">
<h1>Zentra Plugin Marketplace</h1>
<p style="color:#8b8b9a">API is running. The web frontend hasn't been built yet.</p>
<p style="color:#8b8b9a;font-size:14px">Run <code style="background:#24242b;padding:2px 8px;border-radius:4px">cd web && pnpm install && pnpm build</code></p>
<p style="margin-top:24px"><a href="/api/v1/plugins" style="color:#6c63ff">View API &rarr;</a></p>
</div></body></html>`)
		})
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		log.Printf("Plugin marketplace listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	<-stop
	fmt.Println()
	log.Println("Shutting down...")

	shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Shutdown error: %v", err)
	}

	log.Println("Server stopped")
}
