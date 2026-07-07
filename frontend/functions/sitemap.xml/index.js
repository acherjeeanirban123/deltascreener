// Sitemap index — points to /sitemap-pages.xml (static) and /sitemap-stocks.xml (dynamic, all ~5k tickers)
import { xmlResponse } from '../_lib/seo.js'

const SITE_ORIGIN = 'https://deltascreener.com'

export async function onRequestGet() {
  const now = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_ORIGIN}/sitemap-stocks.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`
  return xmlResponse(xml)
}
