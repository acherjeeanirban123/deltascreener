#!/bin/bash
# DeltaScreener Blog Deployment Script
# Run this on your Mac to deploy the blog article to production

set -e

echo "🚀 DeltaScreener Blog Deployment"
echo "=================================="
echo ""
echo "Pushing May 21, 2026 blog article to GitHub..."
echo ""

cd /Users/anirbanacherjee/Downloads/final\ screener/frontend

# Verify we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository!"
    echo "Please navigate to: /Users/anirbanacherjee/Downloads/final\ screener/frontend"
    exit 1
fi

# Show what we're about to push
echo "📋 Commit to push:"
git log --oneline -1
echo ""

# Push to GitHub
echo "⏳ Authenticating with GitHub and pushing..."
git push origin master

echo ""
echo "✅ Push successful!"
echo ""
echo "🔄 Cloudflare Pages will automatically deploy in 2-5 minutes"
echo "📍 Blog will be live at: https://deltascreener.com/blog/how-to-screen-tech-stocks-for-value-2026"
echo ""
echo "📊 Check deployment status: https://dash.cloudflare.com → Pages → deltascreener-frontend → Deployments"
