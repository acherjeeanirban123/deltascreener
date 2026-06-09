#!/bin/bash
cd "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/frontend"
CLOUDFLARE_API_TOKEN="<see SECRETS.md>" /usr/bin/npx wrangler pages deploy . --project-name=deltascreener --no-bundle --commit-dirty=true
echo ""
echo "✅ Deploy complete! Press any key to close."
read -n 1
