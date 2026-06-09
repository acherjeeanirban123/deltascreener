// v20260528-3
const SITE_ORIGIN = 'https://deltascreener.com'
const API_FALLBACKS = [
  'https://api.deltascreener.com',
  'https://screenerpro1-api.acherjeeanirban.workers.dev',
]

const HTML_CACHE_CONTROL = 'public, max-age=900, s-maxage=7200, stale-while-revalidate=86400'
const XML_CACHE_CONTROL = 'public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400'

export const SCREEN_PAGES = [
  {
    slug: 'high-roe-stocks',
    title: 'High ROE Stocks',
    h1: 'High ROE Stocks',
    cluster: 'Quality',
    intro: 'These US stocks currently rank for strong return on equity, which can help surface businesses converting shareholder capital into profit efficiently.',
    metaDescription: 'Explore US high ROE stocks with live price, market cap, valuation, and profitability data. Updated automatically on DeltaScreener.',
    conditions: [
      { metric: 'roe', op: '>=', value: 18 },
      { metric: 'pb', op: '>', value: 0 },
      { metric: 'debtToEquity', op: '<=', value: 3 },
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['low-debt-stocks', 'high-roa-stocks', 'undervalued-tech-stocks'],
    faqs: [
      ['What counts as high ROE?', 'This screen currently looks for stocks with return on equity of at least 18% and positive price-to-book coverage.'],
      ['Why include debt filters?', 'High ROE can be artificially boosted by leverage, so the screen also caps debt-to-equity to keep the list more investable.'],
    ],
  },
  {
    slug: 'low-debt-stocks',
    title: 'Low Debt Stocks',
    h1: 'Low Debt Stocks',
    cluster: 'Balance Sheet',
    intro: 'This screen focuses on stocks with conservative debt loads, which can help investors find companies with stronger balance sheet flexibility.',
    metaDescription: 'Browse US low debt stocks with live financial ratios, valuation data, and market cap filters. Auto-updated on DeltaScreener.',
    conditions: [
      { metric: 'debtToEquity', op: '<=', value: 0.5 },
      { metric: 'roe', op: '>=', value: 8 },
      { metric: 'pb', op: '>', value: 0 },
    ],
    sort: { field: 'debtToEquity', dir: 'asc' },
    related: ['low-debt-dividend-stocks', 'high-roe-stocks', 'nyse-low-debt-stocks'],
    faqs: [
      ['What is a low debt stock here?', 'This page uses debt-to-equity of 0.5 or lower and also requires usable profitability data.'],
      ['Why are some banks missing?', 'Bank balance sheets work differently, so many financial firms are filtered out by conservative debt thresholds.'],
    ],
  },
  {
    slug: 'high-roa-stocks',
    title: 'High ROA Stocks',
    h1: 'High ROA Stocks',
    cluster: 'Quality',
    intro: 'Return on assets can highlight companies that generate strong earnings from the asset base they control, which is useful for cross-sector quality screening.',
    metaDescription: 'Find US high ROA stocks with current valuation, profitability, and market cap data. Freshly updated stock screener results.',
    conditions: [
      { metric: 'roa', op: '>=', value: 10 },
      { metric: 'pb', op: '>', value: 0 },
    ],
    sort: { field: 'roa', dir: 'desc' },
    related: ['high-roe-stocks', 'high-net-margin-stocks', 'low-pe-stocks'],
    faqs: [
      ['Why use ROA?', 'ROA is a useful quality signal when you want a profitability measure less influenced by leverage than ROE.'],
      ['Is this a US-only screen?', 'Yes. These pages are built from the current US stock universe tracked by DeltaScreener.'],
    ],
  },
  {
    slug: 'high-net-margin-stocks',
    title: 'High Net Margin Stocks',
    h1: 'High Net Margin Stocks',
    cluster: 'Profitability',
    intro: 'High net margin stocks can point to businesses with strong pricing power, disciplined costs, or structurally attractive economics.',
    metaDescription: 'Discover US high net margin stocks with live market cap, price, ROE, and balance sheet data. Updated throughout the week.',
    conditions: [
      { metric: 'netMargin', op: '>=', value: 20 },
      { metric: 'roa', op: '>=', value: 5 },
    ],
    sort: { field: 'netMargin', dir: 'desc' },
    related: ['high-roa-stocks', 'high-roe-stocks', 'low-pb-stocks'],
    faqs: [
      ['Why require ROA as well?', 'A margin filter alone can be noisy, so this page also looks for companies converting assets into profit effectively.'],
      ['Do margins update automatically?', 'Yes. The page data refreshes from your backend on a recurring Cloudflare schedule.'],
    ],
  },
  {
    slug: 'low-pe-stocks',
    title: 'Low PE Stocks',
    h1: 'Low PE Stocks',
    cluster: 'Value',
    intro: 'This page highlights lower P/E names that still show usable profitability metrics, helping avoid the weakest corners of value screens.',
    metaDescription: 'Screen US low PE stocks with live valuation, profitability, and balance sheet metrics. Programmatic SEO page updated automatically.',
    conditions: [
      { metric: 'pe', op: '<=', value: 15 },
      { metric: 'roe', op: '>=', value: 8 },
      { metric: 'pb', op: '>', value: 0 },
    ],
    sort: { field: 'pe', dir: 'asc' },
    related: ['low-pb-stocks', 'undervalued-tech-stocks', 'low-debt-stocks'],
    faqs: [
      ['Why not sort only by cheapest P/E?', 'Extremely low P/E stocks can be low quality or cyclical, so this screen keeps a minimum profitability floor.'],
      ['Are negative earners included?', 'No. A valid P/E ratio is required for this screen.'],
    ],
  },
  {
    slug: 'low-pb-stocks',
    title: 'Low PB Stocks',
    h1: 'Low PB Stocks',
    cluster: 'Value',
    intro: 'Low price-to-book screens can help surface asset-backed value opportunities, especially when paired with positive returns on equity.',
    metaDescription: 'Browse US low price-to-book stocks with live valuation, ROE, debt, and market cap data on DeltaScreener.',
    conditions: [
      { metric: 'pb', op: '<=', value: 2 },
      { metric: 'roe', op: '>=', value: 8 },
    ],
    sort: { field: 'pb', dir: 'asc' },
    related: ['low-pe-stocks', 'low-debt-stocks', 'dividend-stocks'],
    faqs: [
      ['Why combine low PB with ROE?', 'Low PB without profitability can produce weak lists, so this page keeps a minimum ROE threshold.'],
      ['Will financial firms appear here?', 'Yes, if they meet the current screen rules and have complete fundamentals in the backend.'],
    ],
  },
  {
    slug: 'dividend-stocks',
    title: 'Dividend Stocks',
    h1: 'Dividend Stocks',
    cluster: 'Income',
    intro: 'This page tracks US dividend-paying stocks with current yield data and balance sheet filters to keep the list more actionable.',
    metaDescription: 'Find dividend-paying US stocks with yield, valuation, ROE, and debt metrics. SEO page refreshed automatically on Cloudflare.',
    conditions: [
      { metric: 'dividendYield', op: '>=', value: 2.5 },
      { metric: 'debtToEquity', op: '<=', value: 2.5 },
    ],
    sort: { field: 'dividendYield', dir: 'desc' },
    related: ['low-debt-dividend-stocks', 'low-debt-stocks', 'low-pe-stocks'],
    faqs: [
      ['Does this page show current yield or dividend growth?', 'This screen is based on current dividend yield and supporting fundamentals, not a historical dividend growth series.'],
      ['Why can some high-yield stocks be missing?', 'Names with missing or weak core fundamentals are filtered out to avoid low-quality pages and results.'],
    ],
  },
  {
    slug: 'low-debt-dividend-stocks',
    title: 'Low Debt Dividend Stocks',
    h1: 'Low Debt Dividend Stocks',
    cluster: 'Income',
    intro: 'Low debt dividend stocks can be useful for investors who want current yield without leaning too heavily on stretched balance sheets.',
    metaDescription: 'Explore low debt dividend stocks in the US market with live yield, ROE, PE, and debt-to-equity data.',
    conditions: [
      { metric: 'dividendYield', op: '>=', value: 1.5 },
      { metric: 'debtToEquity', op: '<=', value: 1 },
      { metric: 'roe', op: '>=', value: 8 },
    ],
    sort: { field: 'dividendYield', dir: 'desc' },
    related: ['dividend-stocks', 'low-debt-stocks', 'nyse-low-debt-stocks'],
    faqs: [
      ['What makes this different from the general dividend page?', 'This version adds a tighter debt ceiling to prioritize stronger balance sheets.'],
      ['How often does the list refresh?', 'The page is cached at the edge and refreshed from fresh screener data every few hours.'],
    ],
  },
  {
    slug: 'undervalued-tech-stocks',
    title: 'Undervalued Tech Stocks',
    h1: 'Undervalued Tech Stocks',
    cluster: 'Sector Value',
    intro: 'Undervalued technology stocks are screened here using sector membership plus conservative valuation and profitability filters.',
    metaDescription: 'Browse undervalued technology stocks with live PE, PB, ROE, and market cap data for the US market.',
    conditions: [
      { metric: 'sector', op: '=', value: 'Technology' },
      { metric: 'pe', op: '<=', value: 25 },
      { metric: 'pb', op: '<=', value: 8 },
      { metric: 'roe', op: '>=', value: 10 },
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['high-roe-tech-stocks', 'low-pe-stocks', 'high-roe-stocks'],
    faqs: [
      ['How do you define undervalued here?', 'This page uses sector = Technology plus capped PE and PB ratios, then keeps a minimum ROE floor.'],
      ['Is this only mega-cap tech?', 'No. The list can include smaller US tech names as long as they meet the active universe and financial coverage rules.'],
    ],
  },
  {
    slug: 'high-roe-tech-stocks',
    title: 'High ROE Tech Stocks',
    h1: 'High ROE Tech Stocks',
    cluster: 'Sector Quality',
    intro: 'This page narrows the tech universe to companies with strong return on equity and usable balance-sheet coverage.',
    metaDescription: 'Screen high ROE technology stocks in the US market with live price, ROE, PB, and debt metrics.',
    conditions: [
      { metric: 'sector', op: '=', value: 'Technology' },
      { metric: 'roe', op: '>=', value: 18 },
      { metric: 'debtToEquity', op: '<=', value: 2 },
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['undervalued-tech-stocks', 'high-roe-stocks', 'nasdaq-high-roe-stocks'],
    faqs: [
      ['Why combine tech and ROE?', 'It helps surface efficient technology businesses while filtering away weaker balance-sheet setups.'],
      ['Can software and semis both appear?', 'Yes. Technology here is driven by the sector label from your backend dataset.'],
    ],
  },
  {
    slug: 'nasdaq-high-roe-stocks',
    title: 'Nasdaq High ROE Stocks',
    h1: 'Nasdaq High ROE Stocks',
    cluster: 'Exchange',
    intro: 'This page focuses on NASDAQ-listed stocks with strong return on equity, giving you a cleaner long-tail screen for exchange-specific searches.',
    metaDescription: 'View NASDAQ high ROE stocks with live price, market cap, PB, and debt metrics. Auto-updated on DeltaScreener.',
    conditions: [
      { metric: 'exchange', op: '=', value: 'NASDAQ' },
      { metric: 'roe', op: '>=', value: 18 },
      { metric: 'pb', op: '>', value: 0 },
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['high-roe-tech-stocks', 'high-roe-stocks', 'penny-stocks'],
    faqs: [
      ['Why make an exchange-specific page?', 'Exchange-qualified pages are useful for long-tail search intent and help avoid mixing different listing universes.'],
      ['Are all results US-listed?', 'Yes. The current backend universe is focused on US-listed names.'],
    ],
  },
  {
    slug: 'nyse-low-debt-stocks',
    title: 'NYSE Low Debt Stocks',
    h1: 'NYSE Low Debt Stocks',
    cluster: 'Exchange',
    intro: 'NYSE low debt stocks can be useful when you want exchange-specific balance sheet screens with up-to-date profitability data.',
    metaDescription: 'Explore NYSE low debt stocks with live ROE, PE, debt-to-equity, and market cap data.',
    conditions: [
      { metric: 'exchange', op: '=', value: 'NYSE' },
      { metric: 'debtToEquity', op: '<=', value: 0.5 },
      { metric: 'roe', op: '>=', value: 8 },
    ],
    sort: { field: 'debtToEquity', dir: 'asc' },
    related: ['low-debt-stocks', 'low-debt-dividend-stocks', 'low-pb-stocks'],
    faqs: [
      ['What qualifies as NYSE here?', 'The route uses the normalized exchange value stored in your stock dataset and filters it to NYSE.'],
      ['Why require ROE too?', 'That helps keep the page from becoming a thin list of low-leverage but low-quality businesses.'],
    ],
  },
  {
    slug: 'penny-stocks',
    title: 'Penny Stocks',
    h1: 'Penny Stocks',
    cluster: 'Price',
    intro: 'This page surfaces lower-priced US stocks while keeping a minimum market-cap and balance-sheet floor to reduce the noisiest names.',
    metaDescription: 'Browse US penny stocks with current price, market cap, debt, and valuation data. Updated automatically on DeltaScreener.',
    conditions: [
      { metric: 'price', op: '<=', value: 5 },
      { metric: 'marketCap', op: '>=', value: 200000000 },
      { metric: 'debtToEquity', op: '<=', value: 3 },
    ],
    sort: { field: 'marketCap', dir: 'desc' },
    related: ['nasdaq-high-roe-stocks', 'low-pe-stocks', 'low-pb-stocks'],
    faqs: [
      ['Why add a market cap floor?', 'It helps remove the thinnest micro-cap names so the page stays more useful and less spammy.'],
      ['Is this financial advice?', 'No. These pages are data-driven screens meant for research and idea generation.'],
    ],
  },
]

export const SCREEN_LOOKUP = Object.fromEntries(SCREEN_PAGES.map(screen => [screen.slug, screen]))

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function numberOrNull(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function compactUsd(value) {
  const n = numberOrNull(value)
  if (n == null || n <= 0) return '—'
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

function usd(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function num(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function pct(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : `${n.toFixed(2)}%`
}

function average(values) {
  const nums = values.map(numberOrNull).filter(v => v != null)
  if (!nums.length) return null
  return nums.reduce((sum, value) => sum + value, 0) / nums.length
}

function median(values) {
  const nums = values.map(numberOrNull).filter(v => v != null).sort((a, b) => a - b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

function topBuckets(rows, field, limit = 3) {
  const counts = new Map()
  for (const row of rows) {
    const key = String(row?.[field] || '').trim()
    if (!key || key === '—') continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function humanDate(value) {
  return new Date(isoDate(value)).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  })
}

function conditionLabel(condition) {
  const labels = {
    roe: 'ROE',
    roa: 'ROA',
    pb: 'P/B',
    pe: 'P/E',
    ps: 'P/S',
    netMargin: 'Net margin',
    debtToEquity: 'Debt to equity',
    dividendYield: 'Dividend yield',
    sector: 'Sector',
    exchange: 'Exchange',
    price: 'Price',
    marketCap: 'Market cap',
  }
  const metric = labels[condition.metric] || condition.metric
  const value = typeof condition.value === 'number'
    ? (condition.metric === 'marketCap' ? compactUsd(condition.value) : num(condition.value))
    : String(condition.value)
  const op = ({
    '>=': 'at least',
    '>': 'above',
    '<=': 'at most',
    '<': 'below',
    '=': 'equal to',
  })[condition.op] || condition.op
  return `${metric} ${op} ${value}`
}

async function fetchJson(origins, path, init = {}) {
  let lastError = null
  for (const origin of origins) {
    if (!origin) continue
    try {
      const res = await fetch(`${origin}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'DeltaScreener-SEO/1.0',
          ...(init.headers || {}),
        },
      })
      if (!res.ok) {
        lastError = new Error(`API ${res.status}`)
        continue
      }
      return await res.json()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Could not fetch API data')
}

export async function fetchScreenResults(context, screen) {
  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS].filter(Boolean)
  return fetchJson(apiOrigins, '/screener/custom', {
    method: 'POST',
    body: JSON.stringify({
      page: 1,
      limit: 40,
      sort: screen.sort,
      conditions: screen.conditions,
    }),
  })
}

function screenStats(results = []) {
  const rows = Array.isArray(results) ? results : []
  const sectors = topBuckets(rows, 'sector', 3)
  return {
    avgRoe: average(rows.map(row => row.roe)),
    avgDebt: average(rows.map(row => row.debtToEquity)),
    medianPe: median(rows.map(row => row.pe)),
    medianPb: median(rows.map(row => row.pb)),
    medianMarketCap: median(rows.map(row => row.mktCap)),
    sectors,
  }
}

function relatedLinks(screen) {
  return (screen.related || [])
    .map(slug => SCREEN_LOOKUP[slug])
    .filter(Boolean)
}

function screenPageJsonLd(screen, payload, url) {
  const topResults = (payload?.results || []).slice(0, 10)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: screen.h1,
      url,
      description: screen.metaDescription,
      dateModified: isoDate(payload?.updatedAt),
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Stocks', item: `${SITE_ORIGIN}/stocks` },
        { '@type': 'ListItem', position: 3, name: screen.h1, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: topResults.map((row, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_ORIGIN}/stock/${encodeURIComponent(row.ticker)}`,
        name: row.ticker,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (screen.faqs || []).map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
  ]
}

function layout({ title, description, canonical, robots, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE_ORIGIN}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN}/og-image.png" />
  <meta name="twitter:site" content="@deltascreener" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260425-4" />
  <style>
    :root { color-scheme: light; }
    body{margin:0;background:linear-gradient(180deg,#f5f6f0 0%,#fbfbf8 30%,#ffffff 100%);color:#14202b;font-family:Inter,system-ui,sans-serif}
    .seo-wrap{max-width:1180px;margin:0 auto;padding:32px 16px 64px}
    .seo-nav{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774}
    .seo-nav ol{list-style:none;padding:0;margin:0;display:flex;align-items:center;gap:6px}
    .seo-nav li{display:inline-flex;align-items:center;gap:6px}
    .seo-nav a{color:#0f766e;text-decoration:none}
    .seo-nav li+li::before{content:"/";color:#9ca3af;font-weight:400}
    .seo-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.9fr);gap:22px;align-items:start;margin-top:18px}
    .seo-card{background:rgba(255,255,255,.92);border:1px solid rgba(208,214,222,.95);border-radius:24px;box-shadow:0 20px 48px rgba(15,23,42,.06)}
    .seo-hero-main{padding:28px}
    .seo-hero-side{padding:24px;background:linear-gradient(180deg,#fffdf4 0%,#fff 100%)}
    .seo-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px}
    .seo-hero h1{margin:0 0 14px;font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(34px,5vw,58px);line-height:1;letter-spacing:-.05em}
    .seo-hero p{margin:0;color:#55606d;line-height:1.75;font-size:16px}
    .seo-badges{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0}
    .seo-badges span{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:#eef8f5;color:#0f766e;font-size:13px;font-weight:700}
    .seo-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:24px 0}
    .seo-stat{padding:18px;border-radius:20px;border:1px solid rgba(208,214,222,.95);background:#fff}
    .seo-stat strong{display:block;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
    .seo-stat span{display:block;font-size:26px;font-weight:800;color:#0f172a}
    .seo-sections{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,.95fr);gap:22px;margin-top:22px}
    .seo-section{padding:24px}
    .seo-section h2{margin:0 0 14px;font-size:22px;letter-spacing:-.03em}
    .seo-section p,.seo-section li{color:#55606d;line-height:1.75}
    .seo-methodology{margin:0;padding-left:18px}
    .seo-table{width:100%;border-collapse:collapse}
    .seo-table th,.seo-table td{padding:12px 10px;border-bottom:1px solid rgba(226,232,240,.95);text-align:left;font-size:14px}
    .seo-table th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
    .seo-table a{color:#0f766e;text-decoration:none;font-weight:700}
    .seo-chip-grid{display:grid;gap:10px}
    .seo-chip{display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:18px;background:#fff;color:#14202b;text-decoration:none}
    .seo-chip strong{display:block;font-size:15px}
    .seo-chip span{display:block;margin-top:4px;font-size:13px;color:#667180}
    .seo-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .seo-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;font-weight:800;text-decoration:none}
    .seo-btn-primary{background:#0f766e;color:#fff}
    .seo-btn-secondary{background:#fff;color:#14202b;border:1px solid rgba(208,214,222,.95)}
    .seo-faq-item + .seo-faq-item{margin-top:14px}
    .seo-muted{color:#6b7280;font-size:14px}
    @media (max-width: 920px){
      .seo-hero,.seo-sections{grid-template-columns:1fr}
    }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
${body}
</body>
</html>`
}

export function renderScreenPage(screen, payload = {}) {
  const results = Array.isArray(payload.results) ? payload.results : []
  const stats = screenStats(results)
  const topSectorText = stats.sectors.length
    ? stats.sectors.map(([name, count]) => `${name} (${count})`).join(', ')
    : 'Mixed sectors'
  const related = relatedLinks(screen)
  const canonical = `${SITE_ORIGIN}/stocks/${screen.slug}`
  const indexable = results.length >= 10
  const robots = indexable ? 'index,follow' : 'noindex,follow'
  const updatedAt = isoDate(payload.updatedAt)
  const title = `${screen.title} (${payload.total || results.length || 0} US Stocks) | DeltaScreener`
  const jsonLd = screenPageJsonLd(screen, payload, canonical)
  const tableRows = results.slice(0, 25).map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><a href="/stock/${encodeURIComponent(row.ticker)}">${escapeHtml(row.ticker)}</a></td>
      <td>${escapeHtml(row.name || row.ticker)}</td>
      <td>${escapeHtml(row.exchange || '—')}</td>
      <td>${usd(row.price)}</td>
      <td>${compactUsd(row.mktCap)}</td>
      <td>${num(row.pe)}</td>
      <td>${num(row.pb)}</td>
      <td>${pct(row.roe)}</td>
      <td>${pct(row.roa)}</td>
      <td>${pct(row.netMargin)}</td>
      <td>${num(row.debtToEquity)}</td>
    </tr>
  `).join('')

  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/stocks">Stocks</a></li>
        <li aria-current="page">${escapeHtml(screen.h1)}</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">${escapeHtml(screen.cluster)} screen</div>
        <h1>${escapeHtml(screen.h1)}</h1>
        <p>${escapeHtml(screen.intro)}</p>
        <div class="seo-badges">
          <span>${escapeHtml(`${payload.total || results.length || 0} matching stocks`)}</span>
          <span>${escapeHtml(`Updated ${humanDate(updatedAt)} ET`)}</span>
          <span>${escapeHtml(`${payload.screenableUniverse || '—'} stock screenable universe`)}</span>
        </div>
        <div class="seo-summary">
          <div class="seo-stat"><strong>Average ROE</strong><span>${pct(stats.avgRoe)}</span></div>
          <div class="seo-stat"><strong>Average Debt / Equity</strong><span>${num(stats.avgDebt)}</span></div>
          <div class="seo-stat"><strong>Median P/E</strong><span>${num(stats.medianPe)}</span></div>
          <div class="seo-stat"><strong>Median Market Cap</strong><span>${compactUsd(stats.medianMarketCap)}</span></div>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Why this page exists</div>
        <p>This route is server-rendered on Cloudflare Pages Functions, refreshed from your screener backend, and only indexed when the result set stays useful enough to avoid thin-page SEO.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open live screener</a>
          <a class="seo-btn seo-btn-secondary" href="/stock/${encodeURIComponent(results[0]?.ticker || 'AAPL')}">Open a stock page</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Methodology</h2>
        <p>DeltaScreener currently builds this page from your US-listed stock universe using the following rules:</p>
        <ul class="seo-methodology">
          ${screen.conditions.map(condition => `<li>${escapeHtml(conditionLabel(condition))}</li>`).join('')}
        </ul>
        <p class="seo-muted">Top sectors in the current result set: ${escapeHtml(topSectorText)}.</p>
      </article>
      <aside class="seo-card seo-section">
        <h2>Related Screens</h2>
        <div class="seo-chip-grid">
          ${related.map(item => `
            <a class="seo-chip" href="/stocks/${item.slug}">
              <strong>${escapeHtml(item.h1)}</strong>
              <span>${escapeHtml(item.cluster)} screen</span>
            </a>
          `).join('')}
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Current Results</h2>
        <p>The table below links directly into stock detail pages, giving Google and users real crawlable depth instead of thin filter combinations.</p>
        <div style="overflow:auto">
          <table class="seo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Exchange</th>
                <th>Price</th>
                <th>Market Cap</th>
                <th>P/E</th>
                <th>P/B</th>
                <th>ROE</th>
                <th>ROA</th>
                <th>Net Margin</th>
                <th>D/E</th>
              </tr>
            </thead>
            <tbody>${tableRows || '<tr><td colspan="12">No qualifying stocks were returned for this refresh.</td></tr>'}</tbody>
          </table>
        </div>
      </article>
      <aside class="seo-card seo-section">
        <h2>FAQ</h2>
        ${(screen.faqs || []).map(([question, answer]) => `
          <div class="seo-faq-item">
            <strong>${escapeHtml(question)}</strong>
            <p>${escapeHtml(answer)}</p>
          </div>
        `).join('')}
      </aside>
    </section>
  </main>`

  return {
    html: layout({
      title,
      description: screen.metaDescription,
      canonical,
      robots,
      body,
      jsonLd,
    }),
    lastModified: updatedAt,
    indexable,
  }
}

export function renderStocksHub() {
  const clusters = new Map()
  for (const screen of SCREEN_PAGES) {
    const list = clusters.get(screen.cluster) || []
    list.push(screen)
    clusters.set(screen.cluster, list)
  }
  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Stocks</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">Programmatic stock screens</div>
        <h1>US Stock Screener Pages</h1>
        <p>These crawlable stock screener pages are rendered on Cloudflare Pages Functions and refreshed from your Worker-backed stock dataset. Only curated, high-signal pages are published so the SEO layer stays useful instead of turning into thin filter spam.</p>
        <div class="seo-badges">
          <span>${SCREEN_PAGES.length} curated long-tail pages</span>
          <span>Cloudflare Pages Functions</span>
          <span>US stock universe focus</span>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">SEO guardrails</div>
        <p>This hub intentionally links only to pages backed by real metrics already available in your backend. Unsupported combinations like RSI or breakout pages are not auto-published yet, which keeps index quality high.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open interactive screener</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections" style="grid-template-columns:1fr">
      ${[...clusters.entries()].map(([cluster, screens]) => `
        <article class="seo-card seo-section">
          <h2>${escapeHtml(cluster)} Screens</h2>
          <div class="seo-chip-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            ${screens.map(screen => `
              <a class="seo-chip" href="/stocks/${screen.slug}">
                <strong>${escapeHtml(screen.h1)}</strong>
                <span>${escapeHtml(stripHtml(screen.intro).slice(0, 110))}</span>
              </a>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </section>
  </main>`

  return layout({
    title: 'US Stock Screener Pages | DeltaScreener',
    description: 'Browse curated long-tail US stock screener pages rendered on Cloudflare Pages Functions and refreshed from live screener data.',
    canonical: `${SITE_ORIGIN}/stocks`,
    robots: 'index,follow',
    body,
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'US Stock Screener Pages',
      url: `${SITE_ORIGIN}/stocks`,
      inLanguage: 'en-US',
    }],
  })
}

export function renderSitemap() {
  const now = new Date().toISOString().split('T')[0]
  const staticUrls = [
    { loc: `${SITE_ORIGIN}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/screener`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/stocks`, changefreq: 'weekly', priority: '0.8' },
  ]
  const screenUrls = SCREEN_PAGES.map(screen => ({
    loc: `${SITE_ORIGIN}/stocks/${screen.slug}`,
    changefreq: 'daily',
    priority: '0.7',
  }))
  const blogUrls = [
    { loc: `${SITE_ORIGIN}/blog`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${SITE_ORIGIN}/blog/nasdaq-vs-nyse-stock-screening`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/nyse-vs-nasdaq-stock-picking`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/how-to-screen-tech-stocks-for-value-2026`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/how-to-screen-tech-stocks-for-value`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/what-is-roe-in-stocks`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/best-dividend-stock-screening-criteria`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/debt-to-equity-ratio-explained`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/what-is-roa-in-stocks`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/how-to-build-a-stock-screen`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/high-roe-semiconductor-stocks`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/low-debt-stocks-investing-guide`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/nasdaq-high-roe-stocks-guide`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${SITE_ORIGIN}/blog/roe-and-debt-screening-strategy`, changefreq: 'monthly', priority: '0.6' },
  ]
  // Top 100 US stocks for programmatic SEO
  const TOP_TICKERS = ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK.B','JPM','V',
    'UNH','XOM','LLY','JNJ','WMT','MA','AVGO','HD','CVX','MRK','ABBV','COST','PEP','ADBE',
    'KO','CRM','ACN','TMO','MCD','BAC','CSCO','ABT','NFLX','QCOM','PFE','AMD','TXN','DHR',
    'LIN','AMGN','PM','NKE','UPS','MS','RTX','NEE','T','LOW','INTC','INTU','SPGI','CAT',
    'GS','BLK','ELV','SCHW','AMAT','DE','ADP','NOW','ISRG','GILD','MU','LRCX','PLD','AMT',
    'CI','SYK','REGN','MDLZ','CB','EOG','MO','DUK','SO','CL','MMC','ICE','ZTS','ITW',
    'FDX','CME','GE','AON','KLAC','PGR','APD','HUM','SHW','SNPS','MCO','CDNS','ETN',
    'BSX','NOC','WM','ORLY','ROP','AZO','PAYX','MCHP']
  const stockUrls = TOP_TICKERS.map(ticker => ({
    loc: `${SITE_ORIGIN}/stock/${ticker}`,
    changefreq: 'daily',
    priority: '0.8',
  }))

  const allUrls = [...staticUrls, ...screenUrls, ...blogUrls, ...stockUrls]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export function htmlResponse(html, { lastModified = null, indexable = true } = {}) {
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': HTML_CACHE_CONTROL,
  })
  if (lastModified) headers.set('Last-Modified', new Date(isoDate(lastModified)).toUTCString())
  if (!indexable) headers.set('X-Robots-Tag', 'noindex, follow')
  return new Response(html, { status: 200, headers })
}

export function xmlResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': XML_CACHE_CONTROL,
    },
  })
}

export async function withEdgeCache(request, context, buildResponse) {
  const cache = caches.default
  const cacheKey = new Request(request.url, request)
  const hit = await cache.match(cacheKey)
  if (hit) {
    const headers = new Headers(hit.headers)
    headers.set('X-SEO-Cache', 'edge')
    return new Response(hit.body, { status: hit.status, headers })
  }
  const response = await buildResponse()
  if (response.ok) context.waitUntil(cache.put(cacheKey, response.clone()))
  const headers = new Headers(response.headers)
  headers.set('X-SEO-Cache', 'miss')
  return new Response(response.body, { status: response.status, headers })
}
