#!/bin/bash
# Deploy DeltaScreener Twitter Worker to Cloudflare
# Run this ONCE to set up. Then it runs automatically 5x/day forever.

set -e
cd "$(dirname "$0")"

echo "🚀 Deploying DeltaScreener Twitter Worker..."

# Deploy the worker
npx wrangler@latest deploy

echo ""
echo "✅ Worker deployed! Now set your secrets (run each line and paste the value):"
echo ""
echo "npx wrangler@latest secret put TWITTER_API_KEY"
echo "npx wrangler@latest secret put TWITTER_API_SECRET"
echo "npx wrangler@latest secret put TWITTER_ACCESS_TOKEN"
echo "npx wrangler@latest secret put TWITTER_ACCESS_TOKEN_SECRET"
echo "npx wrangler@latest secret put ANTHROPIC_API_KEY"
echo "npx wrangler@latest secret put FMP_API_KEY"
echo "npx wrangler@latest secret put TRIGGER_SECRET"
echo ""
echo "After setting secrets, the worker will post tweets automatically."
echo "You can test manually: curl 'https://deltascreener-twitter-agent.<your-subdomain>.workers.dev/trigger?slot=1&secret=YOUR_SECRET'"
