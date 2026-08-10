// Screener page — SSR for Google + SPA shell for interactive use
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

const API = 'https://api-vps.deltascreener.com'

// Default preset shown on plain /screener — real stocks Google can read
const DEFAULT_CONDITIONS = [
  { metric: 'marketCap', op: '>', value: 1000 },
]
const DEFAULT_SORT = { col: 'marketCap', dir: 'desc' }

// Preset screens shown as quick-filter links below the table
const PRESET_SCREENS = [
  { label: 'High ROE Stocks', url: '/stocks/high-roe-stocks' },
  { label: 'Low Debt Stocks', url: '/stocks/low-debt-stocks' },
  { label: 'Dividend Stocks', url: '/stocks/dividend-stocks' },
  { label: 'Undervalued Tech', url: '/stocks/undervalued-tech-stocks' },
  { label: 'Low P/E Stocks', url: '/stocks/low-pe-stocks' },
  { label: 'High Net Margin', url: '/stocks/high-net-margin-stocks' },
]

function fmt(v, decimals = 1) {
  if (v == null || !Number.isFinite(Number(v))) return '—'
  return Number(v).toFixed(decimals)
}
function fmtCap(v) {
  if (!v) return '—'
  const n = Number(v)
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(0) + 'M'
  return '$' + n.toFixed(0)
}

async function fetchDefault() {
  try {
    const res = await fetch(`${API}/screener/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conditions: DEFAULT_CONDITIONS, page: 1, limit: 25, sort: DEFAULT_SORT }),
    })
    if (!res.ok) return []
    const d = await res.json()
    return d.results || []
  } catch { return [] }
}

const METRIC_MAP = {
  'return on equity': 'roe', 'roe': 'roe',
  'price to earning': 'pe', 'p/e': 'pe', 'pe': 'pe',
  'market cap': 'marketCap',
  'debt to equity': 'debtToEquity',
  'net margin': 'netMargin',
  'dividend yield': 'dividendYield',
  'price to book': 'pb', 'p/b': 'pb', 'pb': 'pb',
  'return on assets': 'roa', 'roa': 'roa',
  'gross margin': 'grossMargin',
  'current ratio': 'currentRatio',
}

async function fetchScreenerResults(query) {
  const lines = query.split(/\bAND\b/i).map(s => s.trim()).filter(Boolean)
  const conditions = []
  for (const line of lines) {
    const m = line.match(/^(.+?)\s*(>=|<=|>|<|=)\s*(-?[\d.]+)$/)
    if (!m) continue
    const rawMetric = m[1].trim().toLowerCase()
    const metric = METRIC_MAP[rawMetric] || rawMetric.replace(/\s+/g, '')
    const value = parseFloat(m[3])
    if (!isNaN(value)) conditions.push({ metric, op: m[2], value })
  }
  if (!conditions.length) return null
  try {
    const res = await fetch(`${API}/screener/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, limit: 30, conditions, sort: { col: 'marketCap', dir: 'desc' } }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function makeScreenTitle(query) {
  const parts = query.split(/\bAND\b/i).map(s => s.trim()).filter(Boolean).slice(0, 3)
  return parts.length ? parts.join(' · ') : 'Custom Screen'
}

function renderDefaultTable(stocks) {
  if (!stocks.length) return ''
  return `
  <section style="margin-top:32px">
    <h2 style="font-size:18px;font-weight:700;color:#f9fafb;margin:0 0 4px">Top US Stocks by Market Cap</h2>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 16px">Showing ${stocks.length} large-cap stocks. Use the screener above to filter by any metric.</p>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(255,255,255,.08)">
      <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:640px">
        <thead>
          <tr style="background:rgba(255,255,255,.04);text-align:left">
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">#</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Ticker</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Company</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Mkt Cap</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Price</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">P/E</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">ROE %</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Net Margin %</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Sector</th>
          </tr>
        </thead>
        <tbody>
          ${stocks.map((s, i) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.05);${i % 2 === 1 ? 'background:rgba(255,255,255,.02)' : ''}">
              <td style="padding:11px 14px;color:#6b7280;font-size:13px">${i + 1}</td>
              <td style="padding:11px 14px"><a href="/stock/${s.ticker}" style="color:#2dd4bf;font-weight:800;text-decoration:none;font-size:14px">${s.ticker}</a></td>
              <td style="padding:11px 14px;color:#e5e7eb;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.name || s.ticker).replace(/&/g,'&amp;')}</td>
              <td style="padding:11px 14px;color:#f3f4f6;font-weight:600;text-align:right;font-variant-numeric:tabular-nums">${fmtCap(s.marketCap || s.mktCap)}</td>
              <td style="padding:11px 14px;color:#e5e7eb;text-align:right;font-variant-numeric:tabular-nums">$${fmt(s.price || s.currentPrice, 2)}</td>
              <td style="padding:11px 14px;color:#e5e7eb;text-align:right;font-variant-numeric:tabular-nums">${fmt(s.pe)}</td>
              <td style="padding:11px 14px;text-align:right;font-variant-numeric:tabular-nums;color:${s.roe > 0 ? '#2dd4bf' : '#e5e7eb'}">${fmt(s.roe)}%</td>
              <td style="padding:11px 14px;text-align:right;font-variant-numeric:tabular-nums;color:${s.netMargin > 0 ? '#2dd4bf' : '#e5e7eb'}">${fmt(s.netMargin)}%</td>
              <td style="padding:11px 14px;color:#9ca3af;font-size:13px;white-space:nowrap">${s.sector || '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#6b7280">Data updates daily. <a href="/screener" style="color:#2dd4bf;text-decoration:none">Apply your own filters →</a></p>
  </section>`
}

export async function onRequestGet(context) {
  const { request } = context
  const url = new URL(request.url)
  const q = url.searchParams.get('q')

  // ── No query — SSR the default screener page with real stock data ──────────
  if (!q || q.trim().length < 3) {
    const stocks = await fetchDefault()

    const presetLinks = PRESET_SCREENS.map(p =>
      `<a href="${p.url}" style="display:inline-flex;align-items:center;padding:7px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.1);color:#d1d5db;font-size:13px;font-weight:600;text-decoration:none;background:rgba(255,255,255,.04)">${p.label}</a>`
    ).join('')

    const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1200px;margin:0 auto;padding:40px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">

      <div style="margin-bottom:28px">
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.03em;margin:0 0 12px;color:#f9fafb">Free US Stock Screener</h1>
        <p style="font-size:17px;color:#9ca3af;line-height:1.7;margin:0 0 20px;max-width:640px">Filter 5,000+ NYSE and NASDAQ stocks by P/E ratio, ROE, net margin, debt-to-equity, dividend yield, and 30+ more metrics. No sign-up required.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:12px;background:linear-gradient(135deg,#2dd4bf,#0d9488);color:#0f1117;text-decoration:none;font-weight:800;font-size:15px">🔍 Open Interactive Screener →</a>
      </div>

      <div style="margin-bottom:28px">
        <p style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px">Popular screens</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${presetLinks}</div>
      </div>

      <section style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px;margin-bottom:32px">
        <h2 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 12px">How to use the screener</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">1. Choose metrics</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Pick from 30+ filters — P/E, ROE, net margin, debt/equity, dividend yield and more</div></div>
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">2. Set thresholds</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Type conditions like "ROE > 15 AND Debt to Equity < 0.5 AND Market Cap > 1000"</div></div>
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">3. Run the screen</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Results from 5,000+ stocks appear instantly. Export to Excel with Pro.</div></div>
        </div>
      </section>

      ${renderDefaultTable(stocks)}

      <section style="margin-top:48px">
        <h2 style="font-size:20px;font-weight:700;color:#f9fafb;margin:0 0 16px">Available screening metrics</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">
          ${[
            'P/E Ratio','P/B Ratio','P/S Ratio','EV/EBITDA','PEG Ratio',
            'Return on Equity (ROE)','Return on Assets (ROA)','ROCE',
            'Net Margin','Gross Margin','Operating Margin','FCF Margin',
            'Debt to Equity','Current Ratio','Interest Coverage',
            'Revenue Growth (3Y)','Profit Growth (3Y)','EPS Growth',
            'Dividend Yield','Payout Ratio','Market Cap','52-Week High/Low',
            'Beta','Earnings Yield','Free Cash Flow',
          ].map(m => `<div style="padding:8px 12px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);color:#d1d5db;font-size:13px">${m}</div>`).join('')}
        </div>
      </section>

    </main>`

    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'DeltaScreener — Free US Stock Screener',
        url: `${SITE_ORIGIN}/screener`,
        description: 'Free stock screener for 5,000+ US stocks. Filter by P/E, ROE, debt, margins, dividends and 30+ more metrics.',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
          { '@type': 'ListItem', position: 2, name: 'Stock Screener', item: `${SITE_ORIGIN}/screener` },
        ],
      },
    ]

    return new Response(renderSpaShell({
      title: 'Free US Stock Screener — Filter 5,000+ Stocks | DeltaScreener',
      description: 'Screen 5,000+ NYSE and NASDAQ stocks free. Filter by P/E ratio, ROE, net margin, debt/equity, dividend yield, market cap and 30+ metrics. No sign-up needed.',
      canonicalUrl: `${SITE_ORIGIN}/screener`,
      robots: 'index,follow',
      keywords: 'free stock screener, US stock screener, NYSE screener, NASDAQ screener, stock filter, PE ratio screener, ROE screener, dividend stock screener',
      jsonLd,
      bodyHtml,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600',
      },
    })
  }

  // Has ?q= — render shareable screen with SSR content for SEO
  const screenTitle = makeScreenTitle(q)
  const canonicalUrl = `${SITE_ORIGIN}/screener?q=${encodeURIComponent(q)}`
  const title = `${screenTitle} | DeltaScreener Stock Screen`
  const description = `Stock screen: ${q.replace(/\n/g, ' ').slice(0, 150)}. Filter US stocks free on DeltaScreener — no sign-up required.`

  let payload = null
  try { payload = await fetchScreenerResults(q, env) } catch {}

  const resultRows = payload?.results?.slice(0, 20) || []
  const total = payload?.total || 0

  const ssrTable = resultRows.length > 0 ? `
    <div style="margin-top:24px;overflow-x:auto">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 12px">${total} stocks matched · Showing top ${resultRows.length}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:500px">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,.1);color:#6b7280;text-align:left">
            <th style="padding:8px 12px">Ticker</th>
            <th style="padding:8px 12px">Company</th>
            <th style="padding:8px 12px;text-align:right">Mkt Cap</th>
            <th style="padding:8px 12px;text-align:right">P/E</th>
            <th style="padding:8px 12px;text-align:right">ROE %</th>
          </tr>
        </thead>
        <tbody>
          ${resultRows.map(s => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.05)">
              <td style="padding:8px 12px"><a href="/stock/${s.ticker}" style="color:#2dd4bf;font-weight:700;text-decoration:none">${s.ticker}</a></td>
              <td style="padding:8px 12px;color:#d1d5db">${s.name || ''}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.mktCap ? '$' + (s.mktCap / 1000).toFixed(1) + 'B' : '—'}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.pe ? s.pe.toFixed(1) : '—'}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.roe ? s.roe.toFixed(1) + '%' : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<p style="color:#6b7280;margin-top:24px">Run this screen on DeltaScreener to see matching stocks.</p>`

  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1100px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li style="color:#6b7280">/</li>
          <li><a href="/screener" style="color:#2dd4bf;text-decoration:none">Screener</a></li>
          <li style="color:#6b7280">/</li>
          <li style="color:#9ca3af">Custom Screen</li>
        </ol>
      </nav>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(22px,4vw,36px);line-height:1.2;letter-spacing:-.03em;margin:0 0 12px;color:#f9fafb">${screenTitle}</h1>
      <code style="display:block;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 16px;font-size:13px;color:#a3e635;margin-bottom:12px;white-space:pre-wrap">${q.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>
      <a href="/screener?q=${encodeURIComponent(q)}" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px">→ Run this screen live</a>
      <span style="color:#6b7280;font-size:13px;margin-left:12px">Free · No sign-up</span>
      ${ssrTable}
    </main>`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: title,
    description,
    url: canonicalUrl,
    creator: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
  }

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    robots: 'index,follow',
    keywords: `stock screen, ${q.replace(/[><=\n]/g, ' ').replace(/\s+/g, ' ').trim()}, US stocks, DeltaScreener`,
    jsonLd: [jsonLd],
    bodyHtml,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  })
}
