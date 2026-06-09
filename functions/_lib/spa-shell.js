// v20260528-3
export const SITE_ORIGIN = 'https://deltascreener.com'
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`
export const DEFAULT_TWITTER_SITE = '@deltascreener'
export const API_FALLBACKS = [
  'https://api.deltascreener.com',
  'https://screenerpro1-api.acherjeeanirban.workers.dev',
]

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

function formatUsd(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null
}

function formatCompactUsd(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

function formatNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : null
}

export function stockCanonicalPath(ticker) {
  return `/stock/${encodeURIComponent(String(ticker || '').trim().toUpperCase())}`
}

export function buildStockSeo(ticker, overview = {}, ratios = {}) {
  const normalizedTicker = String(ticker || '').trim().toUpperCase()
  const companyName = overview?.name && overview.name.trim() && overview.name.trim().toUpperCase() !== normalizedTicker
    ? overview.name.trim()
    : normalizedTicker
  const canonicalPath = stockCanonicalPath(normalizedTicker)
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`
  const price = formatUsd(overview?.price)
  const pe = formatNumber(ratios?.pe ?? overview?.pe)
  const marketCap = formatCompactUsd(overview?.mktCap)
  const exchange = overview?.exchange || 'NYSE/NASDAQ'
  const description = (price && pe && marketCap)
    ? `${companyName} (${normalizedTicker}) — ${price}, P/E ${pe}, Market Cap ${marketCap}. View 10-year financials, quarterly results, ratios, peers, and news.`
    : `${companyName} (${normalizedTicker}) stock price, financials, valuation ratios, quarterly results, peers, and news on DeltaScreener.`
  const title = companyName !== normalizedTicker
    ? `${companyName} (${normalizedTicker}) Stock Price, Financials & Ratios | DeltaScreener`
    : `${normalizedTicker} Stock Price, Financials & Ratios | DeltaScreener`
  return {
    title,
    description: stripHtml(description).slice(0, 280),
    canonicalPath,
    canonicalUrl,
    exchange,
    keywords: [
      `${normalizedTicker} stock`,
      `${companyName} stock price`,
      `${companyName} financials`,
      `${companyName} ratios`,
      `${normalizedTicker} stock analysis`,
      'US stock screener',
    ].join(', '),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${companyName} Stock Analysis`,
      description: stripHtml(description).slice(0, 280),
      url: canonicalUrl,
      about: {
        '@type': 'Corporation',
        name: companyName,
        tickerSymbol: normalizedTicker,
        exchange,
      }
    },
  }
}

export async function fetchJson(origins, path) {
  let lastError = null
  for (const origin of origins) {
    if (!origin) continue
    try {
      const res = await fetch(`${origin}${path}`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DeltaScreener-SEO/1.0',
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

export function renderSpaShell({
  title,
  description,
  canonicalUrl,
  keywords = '',
  ogTitle = title,
  ogDescription = description,
  ogUrl = canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  robots = 'index,follow',
  jsonLd = null,
  bodyHtml = '',
  prerender = null,
  lightMode = false,
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:site" content="${escapeHtml(DEFAULT_TWITTER_SITE)}" />
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
  <link rel="icon" type="image/svg+xml" href="/favicon2.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon2-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260607-blog-dark2" />
  ${lightMode ? `<style>
    html { color-scheme: light !important; }
    html, body { background: #ffffff !important; color: #111827 !important; }
    body[data-theme='dark'] { background: #ffffff !important; color: #111827 !important; }
    body[data-theme='dark'] * { color: inherit; }
    body[data-theme='dark'] h1, body[data-theme='dark'] h2, body[data-theme='dark'] h3 { color: #111827 !important; }
    body[data-theme='dark'] p { color: #374151 !important; }
    body[data-theme='dark'] a { color: #0f766e !important; }
    body[data-theme='dark'] a[style*="background:#0f766e"], body[data-theme='dark'] a[style*="background: #0f766e"] { color: #ffffff !important; }
    body[data-theme='dark'] header, body[data-theme='dark'] footer { display: none !important; }
    body[data-theme='dark'] .card, body[data-theme='dark'] section, body[data-theme='dark'] main { background: transparent !important; }
    [data-prerender-shell] { color: #111827 !important; }
    [data-prerender-shell] h1, [data-prerender-shell] h2, [data-prerender-shell] h3 { color: #111827 !important; }
    [data-prerender-shell] p, [data-prerender-shell] li { color: #374151 !important; }
    [data-prerender-shell] a { color: #0f766e !important; }
    [data-prerender-shell] a[style*="background:#0f766e"], [data-prerender-shell] a[style*="background: #0f766e"] { color: #ffffff !important; }
    [data-prerender-shell] a h2 { color: #111827 !important; }
  </style>` : ''}
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-40Y2P275ZZ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-40Y2P275ZZ', { send_page_view: false });
  </script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <div id="app">${bodyHtml ? `<div data-prerender-shell="1">${bodyHtml}</div>` : ''}</div>
  ${prerender ? `<script>window.__DS_PRERENDER__ = ${JSON.stringify(prerender)};</script>` : ''}
      <script>
window.__DS_PRESET_QUERIES__ = [
  { name: '🏆 Warren Buffett', q: 'ROE > 20 AND Average ROE 5Years > 18 AND ROCE > 15 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Interest Coverage Ratio > 5 AND Market Cap > 5000' },
  { name: '🚀 Momentum', q: 'Change % > 5 AND YOY Qtr profit growth > 20 AND YOY Qtr sales growth > 15 AND ROE > 15 AND Net Margin > 8 AND Market Cap > 2000' },
  { name: '📈 High Growth', q: 'PEG Ratio > 0 AND PEG Ratio < 1 AND Sales growth 3Years > 15 AND Profit growth 3Years > 20 AND Sales growth 5Years > 12 AND Gross Margin > 40 AND Debt to Equity < 0.8 AND Market Cap > 1000' },
  { name: '💰 Undervalued', q: 'P/E > 0 AND P/E < 15 AND P/B < 1.5 AND Current ratio > 2 AND Earnings yield > 6 AND Debt to Equity < 1 AND ROE > 10 AND Market Cap > 1000' },
  { name: '💵 Dividend Income', q: 'Dividend Yield > 2.5 AND Dividend Yield < 8 AND ROE > 12 AND Net Margin > 10 AND Interest Coverage Ratio > 4 AND Debt to Equity < 1 AND Market Cap > 5000' },
  { name: 'Large Cap Value', q: 'Market Cap > 10000 AND P/E < 20 AND Return on Equity > 15' },
  { name: 'High Dividend', q: 'Dividend Yield > 3 AND Market Cap > 5000' },
  { name: 'Growth at Reasonable Price', q: 'P/E < 25 AND ROE > 20 AND Net Margin > 15' },
  { name: 'Mega Caps', q: 'Market Cap > 200000' },
  { name: 'Low Debt Quality', q: 'Debt to Equity < 0.5 AND ROE > 15 AND Market Cap > 5000' },
  { name: 'Tech High Growth', q: 'Sector = Technology AND Market Cap > 20000 AND Net Margin > 15' }
];
// Set forced query from server-injected prerender data OR ?preset=N URL param
(function() {
  // Priority 1: server-side injected query (most reliable - no cache issues)
  var serverQuery = window.__DS_PRERENDER__ && window.__DS_PRERENDER__.query;
  // Priority 2: ?preset=N in URL
  var idx = new URLSearchParams(location.search).get('preset');
  var urlQuery = null;
  if (idx !== null && window.__DS_PRESET_QUERIES__) {
    var pq = window.__DS_PRESET_QUERIES__[parseInt(idx)];
    if (pq) urlQuery = pq.q;
  }
  var finalQuery = serverQuery || urlQuery;
  if (finalQuery) {
    try { sessionStorage.setItem('ds-query', finalQuery); } catch(e){}
    window.__DS_FORCED_QUERY__ = finalQuery;
    // NUCLEAR OPTION: directly write textarea, bypassing any cached JS
    var __ds_fq = finalQuery.replace(/ AND /g, ' AND' + String.fromCharCode(10));
    function __ds_apply_query__() {
      var ta = document.getElementById('query-textarea');
      if (ta && ta.value !== __ds_fq) { ta.value = __ds_fq; }
    }
    document.addEventListener('DOMContentLoaded', __ds_apply_query__);
    var __ds_obs = new MutationObserver(function() {
      var ta = document.getElementById('query-textarea');
      if (ta) { ta.value = __ds_fq; __ds_obs.disconnect(); }
    });
    document.addEventListener('DOMContentLoaded', function() {
      __ds_obs.observe(document.body || document.documentElement, {childList: true, subtree: true});
      [100,300,600,1000,2000].forEach(function(d){ setTimeout(__ds_apply_query__, d); });
    });
  }
})();
// Lock setQuery
function __ds_sq__(i) {
  var q = window.__DS_PRESET_QUERIES__[i];
  if (!q) return;
  var ta = document.getElementById('query-textarea');
  if (ta) ta.value = q.q.replace(/ AND /g, ' AND' + String.fromCharCode(10));
  try { sessionStorage.setItem('ds-screener-page','1'); } catch(e){}
}
Object.defineProperty(window, 'setQuery', {
  get: function() { return __ds_sq__; },
  set: function() {},
  configurable: false
});
</script>
  <script type="module" src="/src/main2.js?v=20260607-blog-dark2"></script>
</body>
</html>`
}
