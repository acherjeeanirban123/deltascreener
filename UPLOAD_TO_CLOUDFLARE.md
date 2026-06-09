# Upload Blog Files to Cloudflare Pages

## Files Ready to Upload

Your **Delta Screener** folder contains:
- `cloudflare-upload.zip` - Contains the updated functions directory
- `seo.js` - Individual file (36KB)
- `blog-index.js` - Individual file (5.2KB)  
- `how-to-screen-tech-stocks-for-value-2026.js` - Individual file (13KB)

---

## Method 1: Upload Zip File (Easiest)

### Step 1: Go to Cloudflare Dashboard
- Open: https://dash.cloudflare.com
- Sign in if needed

### Step 2: Navigate to Pages
- Click: **Workers & Pages** (left sidebar)
- Select: **deltascreener** project

### Step 3: Create New Deployment
- Click: **Create deployment** button (top right)

### Step 4: Upload the Zip
1. You'll see: "Deploy a site by uploading your project"
2. Click in the gray upload box OR drag and drop
3. Select: `cloudflare-upload.zip` from your **Desktop/Delta Screener** folder
4. Cloudflare will automatically extract it

### Step 5: Deploy
1. Environment: Select **Production** (already selected)
2. Click: **Save and deploy** button
3. Wait 2-5 minutes for Cloudflare to build and deploy

---

## Method 2: Upload Individual Files (If Zip Fails)

### Step 1: Create Folder Structure
In Finder:
1. Create a new folder called `functions`
2. Inside `functions`, create:
   - Folder: `_lib`
   - Folder: `blog`

### Step 2: Copy Files
- Copy `seo.js` → `functions/_lib/seo.js`
- Copy `blog-index.js` → `functions/blog/index.js`
- Copy `how-to-screen-tech-stocks-for-value-2026.js` → `functions/blog/how-to-screen-tech-stocks-for-value-2026.js`

### Step 3: Upload to Cloudflare
1. Follow Steps 1-3 above
2. Drag the `functions` folder into the Cloudflare upload box
3. Click **Save and deploy**

---

## Method 3: Using Git Push (Most Reliable)

If you find your actual DeltaScreener repository, use git:

```bash
# Find your project
find ~ -name "*deltascreener*" -type d

# Navigate to it
cd [your-deltascreener-path]/frontend

# Copy the files
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/seo.js functions/_lib/
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/blog-index.js functions/blog/index.js
cp ~/Desktop/delta\ screener\ 1/Delta\ Screener/how-to-screen-tech-stocks-for-value-2026.js functions/blog/

# Commit and push
git add functions/
git commit -m "Deploy: May 21 blog article"
git push origin master
```

---

## Verify Deployment

### After Upload (Wait 2-5 minutes):

1. **Check Deployments**
   - Cloudflare dashboard → Deployments tab
   - Should show new deployment with status "Success"

2. **Visit Blog Hub**
   - https://deltascreener.com/blog
   - Should show new article at top
   - NO 404 error

3. **Visit Article**
   - https://deltascreener.com/blog/how-to-screen-tech-stocks-for-value-2026
   - Should display full 750-word article
   - Formatted with headings and paragraphs

4. **Check Sitemap**
   - https://deltascreener.com/sitemap.xml
   - Search for: `how-to-screen-tech-stocks-for-value-2026`
   - Should be present

---

## Troubleshooting

**Cloudflare won't accept the upload?**
- Try Method 2 (individual files)
- Or try uploading just the `functions` folder (not the zip)

**Still seeing 404 after deployment?**
- Clear browser cache (Cmd+Shift+R on Mac)
- Wait another 2-3 minutes for CDN to update
- Check Cloudflare Deployments tab for "Success" status

**Upload succeeds but blog doesn't show?**
- Check file names are exactly correct
- Verify files are in correct subdirectories
- Look at Cloudflare build logs for errors

---

## Summary

✅ **Files ready in: ~/Desktop/delta screener 1/Delta Screener/**
- `cloudflare-upload.zip` (recommended)
- Individual .js files (backup option)

📍 **Deployment URL**: https://deltascreener.com/blog/how-to-screen-tech-stocks-for-value-2026

⏱️ **Time to live**: 2-5 minutes after upload

🎯 **Next step**: Upload the zip file via Cloudflare dashboard
