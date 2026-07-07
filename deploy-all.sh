#!/bin/bash
# Deploy BOTH the API worker (news endpoint) and the frontend (light mode + news UI).
# Run this on your computer (where node + wrangler are set up). From the project root:
#   bash deploy-all.sh
set -e
ROOT="/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener"

echo "==> 1/2  Deploying API worker (adds /market/news endpoint)…"
cd "$ROOT"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:?set token from SECRETS.md}" \
  npx wrangler deploy

echo ""
echo "==> 2/2  Deploying frontend Pages (light mode + toggle + news section)…"
cd "$ROOT/frontend"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:?set token from SECRETS.md}" \
  npx wrangler pages deploy . --project-name=deltascreener --commit-dirty=true

echo ""
echo "==> Done. Check https://deltascreener.com (hard-refresh: Cmd+Shift+R)."
echo "    Toggle is top-right in the header. News section is on the home page."
