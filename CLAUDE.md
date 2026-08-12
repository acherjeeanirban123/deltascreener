# DeltaScreener — Project Notes

## Stack
- **Frontend**: Cloudflare Pages (`/frontend/`)
- **Backend**: Cloudflare Worker (`api.deltascreener.com`)
- **Database**: Cloudflare D1 + KV
- **Data source**: FMP (Financial Modeling Prep) Starter plan

## Deploy Command
```bash
cd "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/frontend"
CLOUDFLARE_API_TOKEN="<see SECRETS.md>" npx wrangler pages deploy . --project-name=deltascreener --commit-dirty=true
```

## Credentials
Stored in SECRETS.md (gitignored — never committed).
- **Cloudflare Account ID**: `2c46b2a79ec379ad9e5d58836b0566ef`
- **Cloudflare Zone ID**: `f88271377095a32616ea32622f40e0a6`
- **Node path**: `/usr/bin/node` (v22.22.0), **npx**: `/usr/bin/npx`

## Key Files
- `frontend/src/app5.js` — main SPA JS (all UI logic)
- `frontend/src/styles.css` — all styles
- `frontend/functions/[[catchall]].js` — real 404s for unknown routes
- `frontend/functions/stock/[ticker].js` — stock page SSR shell + 404 for bad tickers
- `frontend/functions/blog/[slug].js` — 404 for unknown blog slugs
- `frontend/functions/about.js`, `disclaimer.js`, `privacy.js`, `terms.js` — trust pages
- `frontend/functions/screens/[[slug]].js` — 301 redirect to /stocks/*
- `frontend/functions/_lib/spa-shell.js` — shared HTML shell renderer
- `frontend/_redirects` — Cloudflare Pages redirect rules

## URLs
- Production: https://deltascreener.com
- Pages preview: https://deltascreener.pages.dev
- API (primary): https://api.deltascreener.com
- API (fallback): https://screenerpro1-api.acherjeeanirban.workers.dev

## Version strings
CSS/JS cache-busted with `?v=20260812-ovh`

## Backend topology (as of 2026-08-12)
- Primary API origin: OVH VPS (`api-ovh.deltascreener.com`, 149.56.102.211) — Node + Postgres + Redis + Nginx, systemd-managed. See `server/README.md` and `server/RUNBOOK.md`.
- Rollback origin: AWS Lightsail (`api-vps.deltascreener.com`, 44.213.148.192) — kept running as fallback. To roll back, revert `api-ovh.deltascreener.com` → `api-vps.deltascreener.com` in the frontend files listed below and redeploy.
- Frontend files that hardcode the API origin (grep for `api-ovh.deltascreener.com` to find all): `frontend/src/app5.js`, `frontend/functions/[[catchall]].js`, `frontend/functions/_lib/seo.js`, `frontend/functions/blog/[slug].js`, `frontend/functions/compare/[slug].js`, `frontend/functions/screener.js`, `frontend/functions/sitemap-community.xml/index.js`, `frontend/functions/sitemap-stocks.xml/index.js`, `frontend/functions/stock/[ticker].js`.
- Cloudflare Worker/D1 (original backend) is retired from serving traffic but not yet deleted.
