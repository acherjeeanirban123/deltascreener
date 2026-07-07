// Dynamic sitemap for all ~5,000 stock pages — fetched from the screener API in parallel
// Cached at edge for 6 hours so Google's crawler doesn't hammer the API
import { xmlResponse } from '../_lib/seo.js'

const SITE_ORIGIN = 'https://deltascreener.com'
const API_ORIGINS = [
  'https://api.deltascreener.com',
  'https://screenerpro1-api.acherjeeanirban.workers.dev',
]
const PAGE_SIZE = 100
const MAX_PARALLEL = 50  // fetch up to 50 pages (5000 tickers)
const MAX_TICKERS = 5000  // include all stocks — pages have real SSR content now
// GOOG is a duplicate of GOOGL (same company) — exclude to prevent canonical confusion
const EXCLUDE_TICKERS = new Set(['GOOG'])

async function fetchPage(origin, page) {
  const res = await fetch(`${origin}/screener/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': 'DeltaScreener-Sitemap/1.0' },
    body: JSON.stringify({
      conditions: [],
      page,
      limit: PAGE_SIZE,
      sort: { col: 'marketCap', dir: 'desc' },
    }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function fetchAllTickers(context) {
  const apiOrigins = [context?.env?.API_ORIGIN, ...API_ORIGINS].filter(Boolean)
  let origin = apiOrigins[0]

  // First call to get total count
  let first
  for (const o of apiOrigins) {
    try {
      first = await fetchPage(o, 1)
      origin = o
      break
    } catch (_) {}
  }
  if (!first) return []

  const total = first.total || 0
  const tickers = (first.results || []).map(r => r.ticker).filter(Boolean)

  if (total <= PAGE_SIZE || tickers.length >= MAX_TICKERS) return tickers.slice(0, MAX_TICKERS)

  // Fetch remaining pages in parallel batches of 10
  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PARALLEL)
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
  const BATCH = 10
  for (let i = 0; i < remainingPages.length; i += BATCH) {
    const batch = remainingPages.slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(p => fetchPage(origin, p)))
    for (const r of results) {
      if (r.status === 'fulfilled') {
        tickers.push(...(r.value.results || []).map(r => r.ticker).filter(Boolean))
      }
    }
    if (tickers.length >= MAX_TICKERS) break
  }

  return [...new Set(tickers)].slice(0, MAX_TICKERS)
}

// Bump this to invalidate a poisoned edge-cache entry (the key changes, so the old
// cached copy is abandoned and the sitemap regenerates from scratch on next hit).
const CACHE_VERSION = 'v2'

export async function onRequestGet(context) {
  // Check edge cache first. Version the key so we can force-abandon stale copies.
  const cache = caches.default
  const keyUrl = new URL(context.request.url)
  keyUrl.searchParams.set('cv', CACHE_VERSION)
  const cacheKey = new Request(keyUrl.toString())
  const hit = await cache.match(cacheKey)
  if (hit) {
    const headers = new Headers(hit.headers)
    headers.set('X-Sitemap-Cache', 'edge')
    return new Response(hit.body, { status: hit.status, headers })
  }

  let tickers = []
  let isFallback = false
  try {
    tickers = await fetchAllTickers(context)
  } catch (_) {
    // On API failure, fall back to top 200 tickers so sitemap still works
    isFallback = true
    tickers = ['NVDA','AAPL','GOOGL','MSFT','AMZN','TSM','AVGO','TSLA','META','MU','BRK.B','BRK.A','LLY','WMT','JPM','AMD','ASML','V','INTC','ORCL','XOM','JNJ','CSCO','MA','COST','CAT','LRCX','BAC','ABBV','KLAC','QCOM','KO','TM','GE','SAP','AXP','NFLX','CVX','WFC','TMO','GS','MS','AMAT','AMGN','MRK','PG','ABT','TXN','ISRG','NEE','SNOW','SPGI','NVO','CRM','PLTR','NOW','RTX','PDD','BKNG','ARM','GEV','PANW','HON','SHW','DIS','T','LOW','ETN','VZ','UNH','LIN','ADP','BSX','DE','MCD','IBM','ADSK','MSTR','TT','BX','REGN','CI','PH','UNP','MMC','ANET','COIN','APP','EMR','TJX','CB','FTNT','VRTX','GD','ELV','NSC','ADI','WELL','SYK','COF','TDG','HCA','AJG','AON','MSI','SO','PGR','ECL','FICO','ITW','KKR','D','HWM','ROP','CME','CTAS','FI','MDLZ','APO','MCO','CRWD','UBER','NUE','BDX','HLT','NOC','EW','ZTS','APH','AMT','MET','AFL','OTIS','PSA','USB','OKE','GWW','PNC','DHI','TRV','AIG','DLR','MPWR','LDOS','FCX','ODFL','NXPI','PCAR','PWR','CARR','SRE','WM','CSGP','LHX','O','VRSK','HES','COR','ACGL','TRGP','KMB','FAST','MNST','AXON','SPG','CCI','GIS','PRU','TEL','VLO','DECK','WAB','F','GM','MSCI','MTB','GEHC','TSCO','EXC','AEP','CTVA','NEM','PSX','WMB','MPC','RCL','CDW','XEL','IP','URI','DD','EFX','CTSH','IRM','FIS','CINF','FANG']
  }

  const now = new Date().toISOString().split('T')[0]
  const urlEntries = tickers.filter(t => !EXCLUDE_TICKERS.has(t)).map(ticker => `  <url>
    <loc>${SITE_ORIGIN}/stock/${encodeURIComponent(ticker)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  // A healthy full crawl returns thousands of tickers. If we got the fallback list
  // or a suspiciously small result (e.g. API returned only a partial first page),
  // serve it but DO NOT cache it — otherwise a transient API hiccup poisons the
  // edge cache with a tiny sitemap for 6 hours and Google de-indexes stock pages.
  const isHealthy = !isFallback && tickers.length >= 1000

  const response = new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': isHealthy
        ? 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400'
        : 'no-store',
      'X-Stock-Count': String(tickers.length),
      'X-Sitemap-Healthy': String(isHealthy),
    },
  })

  // Only store complete sitemaps in the edge cache
  if (isHealthy) context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}
