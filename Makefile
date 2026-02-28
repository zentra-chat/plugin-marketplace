.PHONY: run build migrate

MARKETPLACE_DATABASE_URL ?= postgres://zentra:zentra_secure_password@localhost:5432/plugin_marketplace?sslmode=disable
MARKETPLACE_ADMIN_DATABASE_URL ?= postgres://zentra:zentra_secure_password@localhost:5432/postgres?sslmode=disable
MARKETPLACE_DB_NAME ?= plugin_marketplace

run:
	@if ! psql "$(MARKETPLACE_ADMIN_DATABASE_URL)" -tAc "SELECT 1 FROM pg_database WHERE datname = '$(MARKETPLACE_DB_NAME)'" | grep -q 1; then \
		echo "Creating database $(MARKETPLACE_DB_NAME)..."; \
		psql "$(MARKETPLACE_ADMIN_DATABASE_URL)" -c "CREATE DATABASE $(MARKETPLACE_DB_NAME);"; \
	fi
	@$(MAKE) migrate
	MARKETPLACE_DATABASE_URL=$(MARKETPLACE_DATABASE_URL) go run ./cmd/server

build:
	go build -o bin/marketplace ./cmd/server

migrate:
	psql "$(MARKETPLACE_DATABASE_URL)" -f migrations/000001_initial.up.sql

migrate-down:
	psql "$(MARKETPLACE_DATABASE_URL)" -f migrations/000001_initial.down.sql
