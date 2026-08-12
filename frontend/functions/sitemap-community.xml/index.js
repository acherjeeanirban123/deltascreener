// Dynamic sitemap for community screens (/screeners/:id/:slug).
// Pulls all public (anonymized) saved screens from the API, capped at 2,000 URLs.
import { xmlResponse } from '../_lib/seo.js'

const SITE_ORIGIN = 'https://deltascreener.com'
const slugify = n => String(n || 'screen').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'screen'

export async function onRequestGet() {
  const urls = []
  try {
    let page = 1
    while (page <= 40) { // 40 × 50 = 2,000 URL cap
      const res = await fetch(`https://api-ovh.deltascreener.com/screens/public?page=${page}&limit=50`, {
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) break
      const data = await res.json()
      const screens = data.screens || []
      for (const s of screens) {
        urls.push({ loc: `${SITE_ORIGIN}/screeners/${s.id}/${slugify(s.name)}`, lastmod: (s.created_at || '').split(' ')[0] || undefined })
      }
      if (page >= (data.pages || 1)) break
      page++
    }
  } catch (_) { /* API down — serve whatever we collected (possibly empty) */ }

  const now = new Date().toISOString().split('T')[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}
</urlset>`
  return xmlResponse(xml)
}
