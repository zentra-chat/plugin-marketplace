-- Plugin marketplace schema
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    author VARCHAR(200) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '0.1.0',
    homepage_url TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    icon_url TEXT NOT NULL DEFAULT '',
    requested_permissions INTEGER NOT NULL DEFAULT 0,
    manifest JSONB NOT NULL DEFAULT '{}',
    built_in BOOLEAN NOT NULL DEFAULT false,
    source VARCHAR(100) NOT NULL DEFAULT 'marketplace',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    downloads INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plugins_slug ON plugins(slug);
CREATE INDEX IF NOT EXISTS idx_plugins_author ON plugins(author);
CREATE INDEX IF NOT EXISTS idx_plugins_downloads ON plugins(downloads DESC);
