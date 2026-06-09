# DeltaScreener Blog Deployment Instructions

## Status
✅ Blog article created: `how-to-screen-tech-stocks-for-value-2026.js`  
✅ Blog hub updated: `/functions/blog/index.js`  
✅ Sitemap updated: `/functions/_lib/seo.js`  
✅ Git commit created: "Daily content: How to Screen Tech Stocks for Value (May 21, 2026)"  
⏳ **PENDING: Push to GitHub** ← You need to do this on your Mac

## Why You Need to Push From Your Mac

The commit exists in your local repository but hasn't been pushed to GitHub yet. Cloudflare Pages watches your GitHub repository and automatically deploys when it detects new commits. Without pushing to GitHub, Cloudflare can't see the changes.

The sandbox environment cannot complete this push because:
- GitHub no longer accepts token-based HTTPS authentication for git commands
- SSH keys are not configured in the sandbox
- GitHub CLI is not available in the sandbox

## How to Deploy (Run on Your Mac)

### Option 1: Using GitHub CLI (Recommended - Easiest)

If you don't have `gh` installed yet:
```bash
# Install GitHub CLI via Homebrew
brew install gh

# Authenticate
gh auth login
# Follow the prompts - choose HTTPS and let it set up SSH for you
```

Once authenticated, simply push:
```bash
cd /Users/anirbanacherjee/Downloads/final\ screener/frontend
git push origin master
```

### Option 2: Using SSH (If You Have SSH Keys Configured)

```bash
cd /Users/anirbanacherjee/Downloads/final\ screener/frontend
git push origin master
```

### Option 3: Using HTTPS with GitHub Token (Via Credential Manager)

If you prefer manual token entry:
```bash
cd /Users/anirbanacherjee/Downloads/final\ screener/frontend
git push origin master
```

When prompted for password, use your Personal Access Token (with `repo` scope).

---

## What Happens After You Push

1. **GitHub receives your push** (2-3 seconds)
2. **Cloudflare Pages detects the change** (15-30 seconds)
3. **Cloudflare builds and deploys** (2-5 minutes)
4. **Blog is live** at: https://deltascreener.com/blog/how-to-screen-tech-stocks-for-value-2026

You can verify deployment at: https://dash.cloudflare.com → Pages → deltascreener-frontend → Deployments tab

---

## Files Ready for Deployment

✅ `/functions/blog/how-to-screen-tech-stocks-for-value-2026.js` - 750-word blog article  
✅ `/functions/blog/index.js` - Blog hub page (updated with new article)  
✅ `/functions/_lib/seo.js` - Sitemap (updated with new article URL)  
✅ Social media drafts at `/Delta Screener/social-drafts.md` (manual posting required)

All files are committed and ready to ship.

---

## Troubleshooting

**Error: "fatal: could not read Username for 'https://github.com'"**
- Solution: Use `gh auth login` or install GitHub CLI

**Error: "Invalid username or token"**
- Your token may have expired or limited scopes
- Solution: Create a new Personal Access Token at https://github.com/settings/tokens with "repo" scope

**Error: "Host key verification failed"**
- This is expected in the sandbox; use one of the options above instead

---

## Manual Tasks (Not Automated)

After deployment, you'll want to post the social media content manually:

**Twitter/X Thread** - See `/Delta Screener/social-drafts.md`  
**Reddit Post** - See `/Delta Screener/social-drafts.md` (r/stocks subreddit)

These cannot be auto-posted but the drafts are ready for you to copy/paste.
