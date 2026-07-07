#!/bin/bash
cd "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/frontend"
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:?set token from SECRETS.md}" npx wrangler pages deploy . --project-name=deltascreener --commit-dirty=true
