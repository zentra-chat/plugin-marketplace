# plugin-marketplace

Marketplace for discovering and hosting Zentra plugin builds.

## What it does

- serves plugin catalog APIs under `/api/v1`
- serves uploaded plugin builds under `/builds/...`
- accepts packaged plugin uploads at `/api/v1/builds/upload`

## Environment

- `PORT` (default: `8090`)
- `MARKETPLACE_DATABASE_URL` / `DATABASE_URL`
- `WEB_DIR` (default: `web/build`)
- `BUILDS_DIR` (default: `builds`)
- `MARKETPLACE_PUBLIC_URL` (optional, used for absolute build URLs in upload responses)

## Build upload flow

1. Plugin author runs `zentra-plugin package` in their plugin project.
2. Uploads the generated `.zplugin.zip` from marketplace `/submit`.
3. Marketplace extracts the archive to `BUILDS_DIR/<slug>/<version>/`.
4. Response includes `manifest.frontendBundle` pointing to hosted `/builds/...` entry URL.
