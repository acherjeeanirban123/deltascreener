#!/bin/bash
# Simple Cloudflare Deployment Script
# Run this to deploy the blog article

set -e

echo "🚀 Deploying Blog Article to Cloudflare"
echo "========================================"
echo ""

# Path to your project
PROJECT="/Users/anirbanacherjee/Downloads/final screener/frontend"

# Check if project exists
if [ ! -d "$PROJECT" ]; then
    echo "❌ Project not found at: $PROJECT"
    echo "Please update the PROJECT path in this script"
    exit 1
fi

cd "$PROJECT"
echo "📁 Working in: $PROJECT"
echo ""

# Copy the updated blog files
echo "📋 Copying updated blog files..."
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/seo.js functions/_lib/
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/blog-index.js functions/blog/index.js
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/how-to-screen-tech-stocks-for-value-2026.js functions/blog/

echo "✅ Files copied to your project"
echo ""

# Check if this is a git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "🔄 Deploying via Git..."
    git status
    echo ""
    echo "📌 Ready to commit. Do you want to continue? (y/n)"
    read -r response

    if [[ "$response" == "y" ]]; then
        git add functions/_lib/seo.js functions/blog/index.js functions/blog/how-to-screen-tech-stocks-for-value-2026.js
        git commit -m "Deploy: May 21 blog article - How to Screen Tech Stocks for Value"
        git push origin master
        echo "✅ Pushed to GitHub! Cloudflare will deploy in 2-5 minutes"
    fi
else
    echo "⚠️  This directory is not a git repository"
    echo ""
    echo "The files have been copied to your project directory:"
    echo "  ✓ functions/_lib/seo.js"
    echo "  ✓ functions/blog/index.js"
    echo "  ✓ functions/blog/how-to-screen-tech-stocks-for-value-2026.js"
    echo ""
    echo "Next steps:"
    echo "1. Open GitHub Desktop or use 'git push'"
    echo "2. Or upload these files directly to Cloudflare Pages"
fi

echo ""
echo "🎉 Done!"
