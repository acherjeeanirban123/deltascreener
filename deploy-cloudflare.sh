#!/bin/bash
# Deploy Blog Files to Cloudflare Pages
# This script uploads the updated blog files directly to Cloudflare

set -e

echo "🚀 DeltaScreener Cloudflare Deployment"
echo "========================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler (Cloudflare CLI)..."
    npm install -g wrangler
    echo "✅ Wrangler installed"
fi

# Navigate to project directory (adjust path if needed)
PROJECT_DIR="/Users/anirbanacherjee/Downloads/final screener/frontend"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directory not found: $PROJECT_DIR"
    echo "Please update the PROJECT_DIR path in this script"
    exit 1
fi

cd "$PROJECT_DIR"
echo "📁 Working directory: $PROJECT_DIR"
echo ""

# Copy the updated files
echo "📋 Copying updated files..."
cp "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/seo.js" functions/_lib/seo.js
cp "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/blog-index.js" functions/blog/index.js
cp "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener/how-to-screen-tech-stocks-for-value-2026.js" functions/blog/how-to-screen-tech-stocks-for-value-2026.js
echo "✅ Files copied"
echo ""

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔄 Cloudflare is building and deploying your site..."
echo "⏱️  This usually takes 2-5 minutes"
echo ""
echo "📍 Check deployment at: https://dash.cloudflare.com → Pages → deltascreener-frontend"
echo "🌍 Blog will be live at: https://deltascreener.com/blog/how-to-screen-tech-stocks-for-value-2026"
echo ""
echo "Done! Your blog article should be live soon."
