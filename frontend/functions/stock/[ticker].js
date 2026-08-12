// Stock page — validates ticker against API, returns real 404 for unknown tickers
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

const API_ORIGINS = [
  'https://api-ovh.deltascreener.com',
  'https://screenerpro1-api.acherjeeanirban.workers.dev',
]

function escapeHtml(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function render404(ticker) {
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:96px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:64px;font-weight:900;color:#e5e7eb;line-height:1;margin-bottom:16px">404</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:30px;color:#111827;margin:0 0 12px">Stock not found</h1>
      <p style="color:#6b7280;font-size:16px;margin:0 0 8px"><strong>${escapeHtml(ticker)}</strong> is not in our database.</p>
      <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Check the ticker symbol or search for a different stock.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Open Screener</a>
        <a href="/" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Go Home</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title: `${escapeHtml(ticker)} — Stock Not Found | DeltaScreener`,
    description: `${ticker} could not be found in the DeltaScreener database.`,
    canonicalUrl: `${SITE_ORIGIN}/screener`,
    robots: 'noindex,nofollow',
    bodyHtml,
  }), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  })
}

function fmt(v, decimals = 2) {
  if (v == null || v === '' || isNaN(v)) return '—'
  return Number(v).toFixed(decimals)
}

function fmtPct(v) {
  if (v == null || v === '' || isNaN(v)) return '—'
  return Number(v).toFixed(2) + '%'
}

function fmtPrice(v) {
  if (v == null || v === '' || isNaN(v)) return '—'
  return '$' + Number(v).toFixed(2)
}

function fmtMktCap(v) {
  if (v == null || isNaN(v)) return '—'
  const n = Number(v)
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
  return '$' + n.toFixed(0)
}

// Formats an ISO date string as "Apr 19, 2026" for the news list.
function fmtNewsDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

function fmtShares(v) {
  if (v == null || isNaN(v)) return '—'
  return Number(v).toLocaleString('en-US')
}

function statRow(label, value) {
  return `<tr><td style="padding:10px 14px;color:#6b7280;font-size:14px;border-bottom:1px solid #f1f5f9;white-space:nowrap">${label}</td><td style="padding:10px 14px;font-weight:700;font-size:14px;color:#111827;border-bottom:1px solid #f1f5f9;text-align:right">${value}</td></tr>`
}

function extractCompanyName(overview, ticker) {
  // 1. Use name field if it's a real company name (not just the ticker repeated)
  if (overview?.name && overview.name !== ticker && overview.name.length > ticker.length + 1) {
    return overview.name
  }
  // 2. Extract from description first sentence
  const desc = overview?.description || ''
  if (desc.length > 10) {
    const m = desc.match(/^([\w\s,\.&']+?(?:Inc\.|Corp\.|Ltd\.|LLC|Co\.|plc|SE|AG|NV|SA|LP|PLC|Limited|Corporation|Company|Holdings|Group|Trust|Partners|Bancorp|Bancshares|Financial|Technologies|Solutions|Systems|Services|Networks|Communications|Pharmaceuticals|Therapeutics|Sciences|Energy|Industries|International|Enterprises|Properties|Realty|Capital)\.?)/)
    if (m) {
      const extracted = m[1].trim().replace(/\.$/, '')
      if (extracted.length > ticker.length + 2) return extracted
    }
  }
  return null
}

// Maps an FMP sector value to the URL slug fragment used by the generated
// sector screen pages in _lib/seo.js (GEN_SECTORS). Keep in sync with that list.
const SECTOR_SLUG = {
  'Technology': 'technology',
  'Healthcare': 'healthcare',
  'Financial Services': 'financial',
  'Energy': 'energy',
  'Industrials': 'industrial',
  'Consumer Cyclical': 'consumer-cyclical',
  'Consumer Defensive': 'consumer-defensive',
  'Utilities': 'utility',
  'Real Estate': 'real-estate',
  'Basic Materials': 'basic-materials',
  'Communication Services': 'communication',
}

// Metric screens, in display order. Each entry's slug must exist in
// SCREEN_LOOKUP — sector slugs are `${key}-${sectorSlug}-stocks`, base slugs
// are `${key}-stocks`. Both forms are generated/curated in _lib/seo.js.
const METRIC_SCREENS = [
  { key: 'high-roe', label: 'High ROE' },
  { key: 'low-pe', label: 'Low P/E' },
  { key: 'high-net-margin', label: 'High Net Margin' },
  { key: 'dividend', label: 'Dividend' },
  { key: 'low-debt', label: 'Low Debt' },
]

// Renders upward internal links from this stock into the screen pages it
// plausibly belongs to (its sector screens + the all-market base screens).
// This gives the ~5k stock pages a referring link into every screen page,
// which is the main crawl-discovery signal for the /stocks/* pages.
function renderScreenLinks(sector, exchange) {
  const sectorSlug = SECTOR_SLUG[sector]
  const links = []
  for (const m of METRIC_SCREENS) {
    if (sectorSlug) {
      links.push({ href: `/stocks/${m.key}-${sectorSlug}-stocks`, label: `${m.label} ${sector} Stocks` })
    } else {
      links.push({ href: `/stocks/${m.key}-stocks`, label: `${m.label} Stocks` })
    }
  }
  // One exchange screen if we can resolve the exchange.
  const ex = String(exchange || '').toUpperCase()
  if (ex.includes('NASDAQ')) links.push({ href: '/stocks/nasdaq-high-roe-stocks', label: 'Nasdaq High ROE Stocks' })
  else if (ex.includes('NYSE')) links.push({ href: '/stocks/nyse-high-roe-stocks', label: 'NYSE High ROE Stocks' })
  // Always link the hub so crawlers reach the full screen index.
  links.push({ href: '/stocks', label: 'All stock screens' })

  const chipStyle = 'display:inline-block;padding:8px 14px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;text-decoration:none;font-size:13px;font-weight:600;color:#1d4ed8;box-shadow:0 1px 2px rgba(0,0,0,.04)'
  const chips = links.map(l => `<a href="${escapeHtml(l.href)}" style="${chipStyle}">${escapeHtml(l.label)}</a>`).join('')
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Screens featuring this stock</h2>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
    </div>`
}

function renderRelatedBlock(ticker, sector, peers) {
  const list = (peers || []).filter(p => p && p.ticker && p.ticker !== ticker).slice(0, 12)
  if (!list.length) return ''
  const cardStyle = 'display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.04)'
  const cards = list.map(p => {
    const chg = p.changePct
    const chgColor = chg != null && chg >= 0 ? '#16a34a' : '#dc2626'
    const chgTxt = chg != null ? `${chg >= 0 ? '+' : ''}${Number(chg).toFixed(2)}%` : ''
    return `<a href="/stock/${escapeHtml(p.ticker)}" style="${cardStyle}">
      <span style="font-weight:800;font-size:15px;color:#111827">${escapeHtml(p.ticker)}</span>
      <span style="font-size:13px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(p.name && p.name !== p.ticker ? p.name : (p.industry || ''))}</span>
      <span style="display:flex;gap:8px;align-items:baseline;margin-top:2px">
        ${p.currentPrice != null ? `<span style="font-weight:700;font-size:14px;color:#111827">${fmtPrice(p.currentPrice)}</span>` : ''}
        ${chgTxt ? `<span style="font-size:12px;font-weight:700;color:${chgColor}">${chgTxt}</span>` : ''}
      </span>
    </a>`
  }).join('')
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Related ${escapeHtml(sector || '')} Stocks</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">${cards}</div>
    </div>`
}

// Static popular-stocks link row: gives every one of the ~5,000 stock pages a
// link to the highest-traffic pages (and vice versa via their own rows), which
// concentrates internal PageRank and gives Googlebot short crawl paths.
const POPULAR_TICKERS = [
  ['AAPL', 'Apple'], ['MSFT', 'Microsoft'], ['NVDA', 'NVIDIA'], ['GOOGL', 'Alphabet'],
  ['AMZN', 'Amazon'], ['META', 'Meta'], ['TSLA', 'Tesla'], ['AVGO', 'Broadcom'],
  ['LLY', 'Eli Lilly'], ['JPM', 'JPMorgan'], ['V', 'Visa'], ['XOM', 'Exxon Mobil'],
  ['WMT', 'Walmart'], ['UNH', 'UnitedHealth'],
]
function renderPopularBlock(ticker, peers) {
  const peerSet = new Set((peers || []).map(p => p && p.ticker).filter(Boolean))
  const list = POPULAR_TICKERS.filter(([t]) => t !== ticker && !peerSet.has(t)).slice(0, 10)
  if (!list.length) return ''
  const chipStyle = 'display:inline-flex;padding:7px 12px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;text-decoration:none;font-size:13px;font-weight:600;color:#374151'
  const chips = list.map(([t, n]) => `<a href="/stock/${t}" style="${chipStyle}">${escapeHtml(n)} (${t})</a>`).join('')
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Popular Stocks</h2>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
    </div>`
}

// Annual P&L / balance-sheet series are stored in $ millions.
function fmtMillions(v, decimals = 1) {
  if (v == null || v === '' || isNaN(v)) return '—'
  const n = Number(v) * 1e6
  if (Math.abs(n) >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(decimals) + 'B'
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(decimals) + 'M'
  return '$' + n.toLocaleString('en-US')
}

function lastOf(arr) {
  if (!Array.isArray(arr)) return null
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null && !isNaN(arr[i])) return Number(arr[i])
  }
  return null
}

function calcCagr(arr, maxYears = 5) {
  if (!Array.isArray(arr)) return null
  const clean = arr.filter(v => v != null && !isNaN(v)).map(Number)
  if (clean.length < 3) return null
  const n = Math.min(maxYears, clean.length - 1)
  const start = clean[clean.length - 1 - n]
  const end = clean[clean.length - 1]
  if (start <= 0 || end <= 0) return null
  return (Math.pow(end / start, 1 / n) - 1) * 100
}

// Detailed, server-rendered About section — the unique indexable content that
// gives each stock page real SEO depth. Very detailed for large caps (≈ top 500
// by market cap), standard depth for the rest.
function renderAboutSection(ticker, name, o, fin) {
  const deep = (o.mktCap || o.marketCap || 0) >= 15e9
  const paras = []

  if (o.description) paras.push(escapeHtml(o.description))

  const facts = []
  if (o.ceo) facts.push(`led by CEO ${o.ceo}`)
  if (o.employees) facts.push(`employs ${Number(o.employees).toLocaleString()} people`)
  if (o.city || o.country) facts.push(`headquartered in ${[o.city, o.country].filter(Boolean).join(', ')}`)
  if (o.ipoDate) facts.push(`publicly traded since ${String(o.ipoDate).slice(0, 4)}`)
  if (facts.length) paras.push(escapeHtml(`${name} is ${facts.join(', ')}.`))

  // Valuation & market position
  const price = o.currentPrice || o.price
  const val = []
  if (price != null && (o.mktCap || o.marketCap)) val.push(`${name === ticker ? ticker : `${name} (${ticker})`} stock trades at ${fmtPrice(price)} with a market capitalization of ${fmtMktCap(o.mktCap || o.marketCap)}`)
  const mults = []
  if (o.pe != null) mults.push(`a price-to-earnings (P/E) ratio of ${fmt(o.pe)}`)
  if (o.pb != null) mults.push(`price-to-book of ${fmt(o.pb)}`)
  if (o.ps != null) mults.push(`price-to-sales of ${fmt(o.ps)}`)
  if (mults.length) val.push(`the stock is valued at ${mults.join(', ')}`)
  if (o.high52 != null && o.low52 != null && price != null) {
    const offHigh = ((o.high52 - price) / o.high52) * 100
    val.push(`over the past 52 weeks the stock has ranged between ${fmtPrice(o.low52)} and ${fmtPrice(o.high52)}, and currently trades ${offHigh <= 1 ? 'at' : fmt(offHigh, 1) + '% below'} its 52-week high`)
  }
  if (o.dividendYield != null && o.dividendYield > 0) val.push(`it pays a dividend yielding ${fmtPct(o.dividendYield)}`)
  if (val.length) paras.push(escapeHtml(val.join('. ').replace(/\. the/g, '. The').replace(/\. over/g, '. Over').replace(/\. it/g, '. It') + '.'))

  // Profitability
  const prof = []
  if (o.roe != null) prof.push(`a return on equity (ROE) of ${fmtPct(o.roe)}${o.roe > 20 ? ' — well above the market average, a sign of a high-quality business' : o.roe > 12 ? ', above the typical market average' : ''}`)
  if (o.roce != null) prof.push(`return on capital employed of ${fmtPct(o.roce)}`)
  if (o.opMargin != null) prof.push(`an operating margin of ${fmtPct(o.opMargin)}`)
  if (o.netMargin != null) prof.push(`a net profit margin of ${fmtPct(o.netMargin)}`)
  if (prof.length) paras.push(escapeHtml(`On profitability, ${name} generates ${prof.join(', ')}.`))

  // Growth & scale (deep tier) — from annual P&L series
  if (deep && fin && fin.annual) {
    const a = fin.annual
    const rev = lastOf(a.sales)
    const np = lastOf(a.netProfit)
    const revCagr = calcCagr(a.sales)
    const npCagr = calcCagr(a.netProfit)
    const g = []
    if (rev != null) g.push(`${name} reported annual revenue of ${fmtMillions(rev)}`)
    if (np != null) g.push(`net profit of ${fmtMillions(np)}`)
    if (revCagr != null) g.push(`revenue has compounded at ${fmt(revCagr, 1)}% a year over the last five years`)
    if (npCagr != null) g.push(`profit at ${fmt(npCagr, 1)}% a year`)
    if (g.length) paras.push(escapeHtml(`In its most recent fiscal year, ${g.join(', ')}.${revCagr != null && npCagr != null && npCagr > revCagr ? ' Profit growing faster than revenue points to expanding margins.' : ''}`))
  }

  // Balance sheet strength (deep tier)
  if (deep) {
    const b = []
    if (o.debtToEquity != null) b.push(`a debt-to-equity ratio of ${fmt(o.debtToEquity)}${o.debtToEquity < 0.5 ? ' — a conservative balance sheet with little leverage risk' : o.debtToEquity > 2 ? ' — a leveraged balance sheet worth monitoring' : ''}`)
    if (o.currentRatio != null) b.push(`a current ratio of ${fmt(o.currentRatio)}`)
    if (fin && fin.balance) {
      const assets = lastOf(fin.balance.totalAssets)
      const cash = lastOf(fin.balance.cash)
      if (assets != null) b.push(`total assets of ${fmtMillions(assets)}`)
      if (cash != null) b.push(`${fmtMillions(cash)} in cash and equivalents`)
    }
    if (b.length) paras.push(escapeHtml(`The balance sheet shows ${b.join(', ')}.`))
  }

  // Trading profile (deep tier)
  if (deep) {
    const tr = []
    if (o.avgVolume) tr.push(`an average daily trading volume of ${Number(o.avgVolume).toLocaleString()} shares`)
    if (o.beta != null) tr.push(`a beta of ${fmt(o.beta)}${o.beta > 1.3 ? ' (more volatile than the overall market)' : o.beta < 0.8 ? ' (less volatile than the overall market)' : ''}`)
    if (o.sharesOutstanding) tr.push(`${(o.sharesOutstanding / 1e9).toFixed(2)}B shares outstanding`)
    if (tr.length) paras.push(escapeHtml(`${ticker} has ${tr.join(', ')}.`))
  }

  if (!paras.length) return ''
  const pStyle = 'color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px'
  return `
    <section style="margin-bottom:32px;max-width:820px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">About ${escapeHtml(name)}</h2>
      ${paras.map(p => `<p style="${pStyle}">${p}</p>`).join('')}
      ${o.website ? `<p style="${pStyle}">Official website: <a href="${escapeHtml(o.website)}" rel="nofollow noopener" target="_blank" style="color:#2563eb">${escapeHtml(String(o.website).replace(/^https?:\/\//, ''))}</a></p>` : ''}
    </section>`
}

function renderStockShell(ticker, overview, fin, peers, opts) {
  const o = overview || {}
  const noindex = opts && opts.noindex
  const rawName = extractCompanyName(o, ticker)
  const name = rawName || ticker
  const displayName = rawName || ticker

  const price = o.currentPrice || o.price
  const changePct = o.changePct
  const changeSign = changePct != null && changePct >= 0 ? '+' : ''
  const changeColor = changePct != null && changePct >= 0 ? '#16a34a' : '#dc2626'

  // Valuation table
  const valuationRows = [
    statRow('Price', fmtPrice(price)),
    statRow('Market Cap', fmtMktCap(o.mktCap || o.marketCap)),
    statRow('P/E Ratio', fmt(o.pe)),
    statRow('P/B Ratio', fmt(o.pb)),
    statRow('P/S Ratio', fmt(o.ps)),
    statRow('EPS (TTM)', o.epsTtm != null ? '$' + fmt(o.epsTtm) : '—'),
    statRow('52-Week High', fmtPrice(o.high52)),
    statRow('52-Week Low', fmtPrice(o.low52)),
    statRow('Dividend Yield', fmtPct(o.dividendYield)),
  ].join('')

  // Financials table
  const financialRows = [
    statRow('ROE', fmtPct(o.roe)),
    statRow('ROA', fmtPct(o.roa)),
    statRow('ROCE', fmtPct(o.roce)),
    statRow('Gross Margin', fmtPct(o.grossMargin)),
    statRow('Operating Margin', fmtPct(o.opMargin)),
    statRow('Net Margin', fmtPct(o.netMargin)),
    statRow('Debt/Equity', fmt(o.debtToEquity)),
    statRow('Current Ratio', fmt(o.currentRatio)),
  ].join('')

  const tableStyle = 'width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)'
  const thStyle = 'padding:12px 14px;text-align:left;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0'

  // Short lead under the H1 — first two sentences only; the full description
  // lives in the About section further down.
  const descLead = o.description
    ? String(o.description).split(/(?<=\.)\s+/).slice(0, 2).join(' ')
    : ''
  const descriptionText = descLead
    ? `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 32px;max-width:760px">${escapeHtml(descLead)}</p>`
    : ''

  // Annual P&L table from financials endpoint
  let annualTableHtml = ''
  if (fin && fin.annual && fin.annual.headers && fin.annual.headers.length) {
    const a = fin.annual
    const years = a.headers.slice(-5) // last 5 years
    const startIdx = a.headers.length - years.length
    const fmtNum = (arr, i) => fmtMillions(arr?.[startIdx + i])
    const fmtPctArr = (arr, i) => {
      const v = arr?.[startIdx + i]
      return (v == null || isNaN(v)) ? '—' : Number(v).toFixed(1) + '%'
    }
    const tdS = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600'
    const td1S = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#6b7280;white-space:nowrap'
    const thSA = 'padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right'
    const metrics = [
      { label: 'Revenue', arr: a.sales, fmt: fmtNum },
      { label: 'Operating Profit', arr: a.opProfit, fmt: fmtNum },
      { label: 'Net Profit', arr: a.netProfit, fmt: fmtNum },
      { label: 'EPS', arr: a.eps, fmt: (arr, i) => { const v = arr?.[startIdx+i]; return (v==null||isNaN(v)) ? '—' : '$'+Number(v).toFixed(2) } },
      { label: 'Op Margin', arr: a.opm, fmt: fmtPctArr },
    ]
    const headerCols = years.map(y => `<th style="${thSA}">${y}</th>`).join('')
    const bodyRows = metrics.map(m =>
      `<tr><td style="${td1S}">${m.label}</td>${years.map((_,i) => `<td style="${tdS}">${m.fmt(m.arr, i)}</td>`).join('')}</tr>`
    ).join('')
    annualTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Annual Financials (USD)</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Metric</th>${headerCols}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`
  }

  // Balance sheet summary if available
  let balanceTableHtml = ''
  if (fin && fin.balance && fin.balance.headers && fin.balance.headers.length) {
    const b = fin.balance
    const years = b.headers.slice(-5)
    const startIdx = b.headers.length - years.length
    const fmtNum = (arr, i) => fmtMillions(arr?.[startIdx + i])
    const tdS = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600'
    const td1S = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#6b7280;white-space:nowrap'
    const thSA = 'padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right'
    const metrics = [
      { label: 'Total Assets', arr: b.totalAssets },
      { label: 'Total Liabilities', arr: b.totalLiabilities },
      { label: 'Cash', arr: b.cash },
      { label: 'Borrowings', arr: b.borrowings },
    ]
    const headerCols = years.map(y => `<th style="${thSA}">${y}</th>`).join('')
    const bodyRows = metrics.map(m =>
      `<tr><td style="${td1S}">${m.label}</td>${years.map((_,i) => `<td style="${tdS}">${fmtNum(m.arr, i)}</td>`).join('')}</tr>`
    ).join('')
    balanceTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Balance Sheet (USD)</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Metric</th>${headerCols}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`
  }

  // Cash Flow table — same style as balanceTableHtml, last 5 years, $ millions.
  let cashflowTableHtml = ''
  if (fin && fin.cashflow && fin.cashflow.headers && fin.cashflow.headers.length) {
    const c = fin.cashflow
    const years = c.headers.slice(-5)
    const startIdx = c.headers.length - years.length
    const fmtNum = (arr, i) => fmtMillions(arr?.[startIdx + i])
    const tdS = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600'
    const td1S = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#6b7280;white-space:nowrap'
    const thSA = 'padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right'
    const metrics = [
      { label: 'Operating Cash Flow', arr: c.fromOperating },
      { label: 'Investing Cash Flow', arr: c.fromInvesting },
      { label: 'Financing Cash Flow', arr: c.fromFinancing },
      { label: 'Net Cash Flow', arr: c.netCashFlow },
      { label: 'Free Cash Flow', arr: c.freeCashFlow },
    ]
    const headerCols = years.map(y => `<th style="${thSA}">${y}</th>`).join('')
    const bodyRows = metrics.map(m =>
      `<tr><td style="${td1S}">${m.label}</td>${years.map((_,i) => `<td style="${tdS}">${fmtNum(m.arr, i)}</td>`).join('')}</tr>`
    ).join('')
    cashflowTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Cash Flow (USD)</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Metric</th>${headerCols}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`
  }

  // Ratios section — fields NOT already in the Financials & Margins table.
  let ratiosTableHtml = ''
  const ratios = opts && opts.ratios
  if (ratios && !ratios.error) {
    const ratioRows = [
      statRow('PEG Ratio', fmt(ratios.peg)),
      statRow('EV / EBITDA', fmt(ratios.evEbitda)),
      statRow('FCF Yield', fmtPct(ratios.fcfYield)),
      statRow('Quick Ratio', fmt(ratios.quickRatio)),
      statRow('Interest Coverage', fmt(ratios.interestCoverage)),
      statRow('Return 1Y', fmtPct(ratios.return1y)),
      statRow('Return 3Y', fmtPct(ratios.return3y)),
      statRow('Return 5Y', fmtPct(ratios.return5y)),
    ].join('')
    ratiosTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Valuation &amp; Return Ratios</h2>
        <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Metric</th><th style="${thStyle};text-align:right">Value</th></tr></thead><tbody>${ratioRows}</tbody></table>
      </div>`
  }

  // Ownership section — ownership summary stat cards + top 5 institutional holders.
  let ownershipHtml = ''
  const shareholders = opts && opts.shareholders
  if (shareholders && !shareholders.error) {
    const own = Array.isArray(shareholders.ownership) ? shareholders.ownership : []
    const inst = Array.isArray(shareholders.institutional) ? shareholders.institutional.slice(0, 5) : []
    if (own.length || inst.length) {
      const cardStyle = 'display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)'
      const cards = own.length
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px">${own.map(r => `<div style="${cardStyle}"><span style="font-size:13px;color:#6b7280">${escapeHtml(r.label)}</span><span style="font-size:20px;font-weight:900;color:#111827">${fmtPct(r.value)}</span></div>`).join('')}</div>`
        : ''
      let instTable = ''
      if (inst.length) {
        const tdS = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600'
        const td1S = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#111827;font-weight:600'
        const thSA = 'padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right'
        const rows = inst.map(h =>
          `<tr><td style="${td1S}">${escapeHtml(h.name)}</td><td style="${tdS}">${fmtShares(h.shares)}</td><td style="${tdS}">${escapeHtml(h.reportDate?.fmt || '—')}</td></tr>`
        ).join('')
        instTable = `
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
              <thead><tr><th style="${thSA};text-align:left">Institutional Holder</th><th style="${thSA}">Shares</th><th style="${thSA}">Report Date</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
      }
      ownershipHtml = `
        <div style="margin-bottom:32px">
          <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Ownership</h2>
          ${cards}${instTable}
        </div>`
    }
  }

  // Latest News section — top 5 items, freshness signal (placed first below).
  let newsHtml = ''
  const newsData = opts && opts.news
  const newsItems = newsData && Array.isArray(newsData.news) ? newsData.news.slice(0, 5) : []
  if (newsItems.length) {
    const rowStyle = 'display:block;padding:12px 0;border-bottom:1px solid #f1f5f9;text-decoration:none'
    const items = newsItems.map(n => `
      <a href="${escapeHtml(n.url)}" rel="nofollow noopener" target="_blank" style="${rowStyle}">
        <span style="display:block;font-weight:700;font-size:15px;color:#111827;line-height:1.4;margin-bottom:4px">${escapeHtml(n.title)}</span>
        <span style="font-size:13px;color:#6b7280">${escapeHtml(n.source || '')}${n.source && n.publishedDate ? ' · ' : ''}${escapeHtml(fmtNewsDate(n.publishedDate))}</span>
      </a>`).join('')
    newsHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 6px">Latest News</h2>
        <div>${items}</div>
      </div>`
  }

  // Peer Comparison table — from the dedicated /peers endpoint.
  let peerCompareHtml = ''
  const comparePeers = opts && Array.isArray(opts.comparePeers)
    ? opts.comparePeers.filter(p => p && p.ticker && p.ticker !== ticker).slice(0, 8)
    : []
  if (comparePeers.length) {
    const tdS = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600'
    const td1S = 'padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left'
    const thSA = 'padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right'
    const rows = comparePeers.map(p => {
      const chg = p.changePct
      const chgColor = chg != null && chg >= 0 ? '#16a34a' : '#dc2626'
      const chgTxt = chg != null ? `${chg >= 0 ? '+' : ''}${Number(chg).toFixed(2)}%` : '—'
      return `<tr>
        <td style="${td1S}"><a href="/stock/${escapeHtml(p.ticker)}" style="color:#1d4ed8;font-weight:700;text-decoration:none">${escapeHtml(p.ticker)}</a><span style="display:block;font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">${escapeHtml(p.name && p.name !== p.ticker ? p.name : '')}</span></td>
        <td style="${tdS}">${fmtPrice(p.price)}</td>
        <td style="${tdS};color:${chgColor}">${chgTxt}</td>
        <td style="${tdS}">${fmt(p.pe)}</td>
        <td style="${tdS}">${fmtMktCap(p.mktCap)}</td>
        <td style="${tdS}">${fmtPct(p.dividendYield)}</td>
      </tr>`
    }).join('')
    peerCompareHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Peer Comparison</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Ticker</th><th style="${thSA}">Price</th><th style="${thSA}">Change</th><th style="${thSA}">P/E</th><th style="${thSA}">Market Cap</th><th style="${thSA}">Div Yield</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`
  }

  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:32px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">${escapeHtml(o.exchange || 'Stock')} · ${escapeHtml(o.industry || 'Stock Research')}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,48px);line-height:1.08;letter-spacing:-.03em;margin:0 0 12px;color:#111827">${escapeHtml(displayName)} (${escapeHtml(ticker)}) Stock</h1>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:20px">
        ${price != null ? `<span style="font-size:28px;font-weight:900;color:#111827">${fmtPrice(price)}</span>` : ''}
        ${changePct != null ? `<span style="font-size:15px;font-weight:700;color:${changeColor}">${changeSign}${fmt(changePct)}%</span>` : ''}
        <span style="padding:6px 12px;border-radius:999px;background:#eef8f5;color:#2563eb;font-weight:700;font-size:13px">${escapeHtml(o.exchange || 'NYSE/NASDAQ')}: ${escapeHtml(ticker)}</span>
        ${o.sector ? `<span style="padding:6px 12px;border-radius:999px;background:#f1f5ff;color:#2563eb;font-weight:700;font-size:13px">${escapeHtml(o.sector)}</span>` : ''}
      </div>
      ${descriptionText}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:32px">
        <div>
          <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Valuation</h2>
          <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Metric</th><th style="${thStyle};text-align:right">Value</th></tr></thead><tbody>${valuationRows}</tbody></table>
        </div>
        <div>
          <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Financials &amp; Margins</h2>
          <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Metric</th><th style="${thStyle};text-align:right">Value</th></tr></thead><tbody>${financialRows}</tbody></table>
        </div>
      </div>
      ${annualTableHtml}
      ${balanceTableHtml}
      ${newsHtml}
      ${cashflowTableHtml}
      ${ratiosTableHtml}
      ${ownershipHtml}
      ${peerCompareHtml}
      ${renderAboutSection(ticker, displayName, o, fin)}
      ${renderRelatedBlock(ticker, o.sector, peers)}
      ${renderPopularBlock(ticker, peers)}
      ${renderScreenLinks(o.sector, o.exchange || o.exchangeShortName)}
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Run Stock Screener</a>
        <a href="/blog" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Investing Guides</a>
      </div>
    </main>`

  // Title: lead with the exact high-intent phrase people search ("<TICKER> Stock
  // Price"), include the live price + current year for freshness/CTR. Google
  // shows ~60 chars, so we keep the front of the title tight and put the brand last.
  const seoYear = new Date().getUTCFullYear()
  const priceTxt = price != null ? fmtPrice(price) : null
  const title = rawName
    ? (priceTxt
        ? `${ticker} Stock Price ${priceTxt} — ${rawName} P/E, ROE & Financials ${seoYear} | DeltaScreener`
        : `${rawName} (${ticker}) Stock Price, P/E, ROE & Financials ${seoYear} | DeltaScreener`)
    : (priceTxt
        ? `${ticker} Stock Price ${priceTxt} — P/E, ROE & Financials ${seoYear} | DeltaScreener`
        : `${ticker} Stock Price, P/E, ROE & Financials ${seoYear} | DeltaScreener`)

  // Meta: front-load the live price (the thing searchers want) and read like a
  // direct answer, then list the data on offer. Higher CTR than a generic blurb.
  const descSnippets = []
  if (o.pe != null) descSnippets.push(`P/E ${fmt(o.pe)}`)
  if (o.roe != null) descSnippets.push(`ROE ${fmtPct(o.roe)}`)
  if (o.netMargin != null) descSnippets.push(`net margin ${fmtPct(o.netMargin)}`)
  if (o.dividendYield != null) descSnippets.push(`dividend yield ${fmtPct(o.dividendYield)}`)
  // Only append "(TICKER)" when the display name isn't already the ticker,
  // so we never render awkward duplicates like "AAPL (AAPL)".
  const nameWithTicker = displayName && displayName !== ticker ? `${displayName} (${ticker})` : ticker
  const metaLead = priceTxt
    ? `${nameWithTicker} stock price is ${priceTxt}${changePct != null ? ` (${changeSign}${Math.abs(fmt(changePct))}% today)` : ''}.`
    : `${nameWithTicker} stock data and financials.`
  const metaDesc = descSnippets.length
    ? `${metaLead} See ${descSnippets.join(', ')}, plus 10-year financials, valuation ratios, and key stats — free on DeltaScreener.`
    : `${metaLead} Get full financials, valuation ratios, key stats, and 10-year data — free on DeltaScreener.`

  // FAQ schema — drives rich results for "[TICKER] stock" queries
  const faqItems = []
  if (price != null) faqItems.push({
    '@type': 'Question',
    'name': `What is ${displayName} (${ticker}) stock price today?`,
    'acceptedAnswer': { '@type': 'Answer', 'text': `${displayName} (${ticker}) is currently trading at ${fmtPrice(price)}${o.changePct != null ? `, ${o.changePct >= 0 ? 'up' : 'down'} ${Math.abs(fmt(o.changePct))}% today` : ''}.` }
  })
  if (o.pe != null) faqItems.push({
    '@type': 'Question',
    'name': `What is ${ticker} P/E ratio?`,
    'acceptedAnswer': { '@type': 'Answer', 'text': `${displayName}'s P/E ratio is ${fmt(o.pe)}. ${o.pe < 15 ? 'This is below the market average, suggesting the stock may be undervalued relative to earnings.' : o.pe > 30 ? 'This is above the market average, reflecting high growth expectations.' : 'This is near the market average.'}` }
  })
  if (o.roe != null) faqItems.push({
    '@type': 'Question',
    'name': `What is ${ticker} return on equity (ROE)?`,
    'acceptedAnswer': { '@type': 'Answer', 'text': `${displayName}'s return on equity (ROE) is ${fmtPct(o.roe)}, indicating how efficiently the company generates profit from shareholders' equity. ${o.roe > 20 ? 'This is considered high quality.' : o.roe > 12 ? 'This is above the market average.' : 'This is below the typical market average of 12-15%.'}` }
  })
  if (o.mktCap || o.marketCap) faqItems.push({
    '@type': 'Question',
    'name': `What is ${displayName}'s market cap?`,
    'acceptedAnswer': { '@type': 'Answer', 'text': `${displayName} has a market capitalization of ${fmtMktCap(o.mktCap || o.marketCap)}.` }
  })

  // JSON-LD structured data
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Corporation',
      'name': displayName,
      'tickerSymbol': ticker,
      ...(o.exchange ? { 'exchange': o.exchange } : {}),
      ...(o.sector ? { 'industry': o.sector } : {}),
      ...(o.website ? { 'url': o.website } : {}),
      ...(o.employees ? { 'numberOfEmployees': { '@type': 'QuantitativeValue', 'value': o.employees } } : {}),
      ...(o.image ? { 'logo': o.image } : {}),
      ...(o.description ? { 'description': String(o.description).slice(0, 300) } : {}),
      ...(o.city || o.country ? { 'address': { '@type': 'PostalAddress', ...(o.city ? { 'addressLocality': o.city } : {}), ...(o.country ? { 'addressCountry': o.country } : {}) } } : {}),
      'mainEntityOfPage': `https://deltascreener.com/stock/${ticker}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://deltascreener.com' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Stock Screener', 'item': 'https://deltascreener.com/screener' },
        { '@type': 'ListItem', 'position': 3, 'name': `${displayName} (${ticker})`, 'item': `https://deltascreener.com/stock/${ticker}` },
      ],
    },
    ...(faqItems.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': faqItems }] : []),
  ]

  // Use stock logo for og:image if available
  const ogImage = o.image || 'https://deltascreener.com/og-image.png'

  return new Response(renderSpaShell({
    title,
    description: metaDesc,
    canonicalUrl: `${SITE_ORIGIN}/stock/${ticker}`,
    robots: noindex ? 'noindex,follow' : undefined,
    keywords: `${ticker} stock, ${displayName} stock price, ${displayName} financials, ${ticker} PE ratio, ${ticker} ROE, ${displayName} annual report`,
    bodyHtml,
    jsonLd,
    ogImage,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(noindex ? { 'X-Robots-Tag': 'noindex, follow' } : {}),
      'Cache-Control': noindex
        ? 'no-store'
        : 'public, max-age=600, s-maxage=7200',
    },
  })
}

export async function onRequestGet(context) {
  const ticker = String(context.params?.ticker || '').trim().toUpperCase()

  // Reject obviously invalid tickers immediately
  if (!ticker || !/^[A-Z0-9.\-]{1,10}$/.test(ticker)) {
    return render404(ticker || 'UNKNOWN')
  }

  // Try the API — fetch overview + financials in parallel
  try {
    let overview = null
    let fin = null

    for (const origin of API_ORIGINS) {
      try {
        const [ovRes, finRes] = await Promise.all([
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/overview`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 300, cacheEverything: false },
          }),
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/financials`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 3600, cacheEverything: false },
          }),
        ])
        if (ovRes.ok) {
          overview = await ovRes.json()
          if (finRes.ok) {
            try { fin = await finRes.json() } catch (_) {}
          }
          break
        }
      } catch (_) {}
    }

    if (!overview || overview.error || !overview.name) {
      return render404(ticker)
    }

    // Fetch a few same-sector peers so we can render internal links between
    // stock pages. This is what lets Googlebot crawl the ~5,000 stock pages as
    // a connected web instead of sitemap-only orphans — the main lever on
    // crawl rate / indexing speed.
    let peers = []
    const sector = overview.sector
    if (sector) {
      for (const origin of API_ORIGINS) {
        try {
          const pr = await fetch(`${origin}/screener/custom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            body: JSON.stringify({
              conditions: [{ metric: 'sector', op: '=', value: sector }],
              page: 1,
              limit: 16,
              sort: { col: 'marketCap', dir: 'desc' },
            }),
            cf: { cacheTtl: 1800, cacheEverything: false },
          })
          if (pr.ok) {
            const pj = await pr.json()
            peers = (pj.results || [])
            break
          }
        } catch (_) {}
      }
    }

    // Enriched-section data: ratios, shareholders, news, and dedicated peer
    // list (separate from the screener/custom peers used for internal linking).
    // Each has independent cache TTLs; all failures degrade gracefully to an
    // omitted section.
    let ratios = null, shareholders = null, news = null, comparePeers = []
    for (const origin of API_ORIGINS) {
      try {
        const [ratRes, shRes, nwRes, prRes] = await Promise.all([
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/ratios`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 3600, cacheEverything: false },
          }),
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/shareholders`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 21600, cacheEverything: false },
          }),
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/news`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 900, cacheEverything: false },
          }),
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/peers`, {
            headers: { Accept: 'application/json', 'User-Agent': 'DeltaScreener-Pages/1.0' },
            cf: { cacheTtl: 3600, cacheEverything: false },
          }),
        ])
        if (ratRes.ok || shRes.ok || nwRes.ok || prRes.ok) {
          if (ratRes.ok) { try { ratios = await ratRes.json() } catch (_) {} }
          if (shRes.ok) { try { shareholders = await shRes.json() } catch (_) {} }
          if (nwRes.ok) { try { news = await nwRes.json() } catch (_) {} }
          if (prRes.ok) { try { const pj = await prRes.json(); comparePeers = pj.peers || [] } catch (_) {} }
          break
        }
      } catch (_) {}
    }

    return renderStockShell(ticker, overview, fin, peers, { ratios, shareholders, news, comparePeers })
  } catch (_) {
    // API unreachable — serve a noindex shell so a transient failure never
    // feeds Googlebot a blank-but-indexable page (which erodes crawl trust for
    // the whole /stock/* section and slows indexing).
    return renderStockShell(ticker, { name: ticker }, null, [], { noindex: true })
  }
}
