// Stock comparison pages — /compare/amd-vs-nvda
// Fully server-rendered from live API data for SEO ("AMD vs NVDA stock" queries).
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'
import { COMPARE_PAIRS } from '../_lib/seo.js'

const API = 'https://api.deltascreener.com'

const METRIC_ROWS = [
  // [label, key, source, format, betterDirection] — direction: 'low' | 'high' | null
  ['Stock Price', 'price', 'overview', 'usd', null],
  ['Market Cap', 'mktCap', 'overview', 'cap', null],
  ['P/E Ratio', 'pe', 'ratios', 'num', 'low'],
  ['P/B Ratio', 'pb', 'ratios', 'num', 'low'],
  ['P/S Ratio', 'ps', 'ratios', 'num', 'low'],
  ['EV/EBITDA', 'evEbitda', 'ratios', 'num', 'low'],
  ['PEG Ratio', 'peg', 'ratios', 'num', 'low'],
  ['Return on Equity', 'roe', 'ratios', 'pct', 'high'],
  ['ROCE', 'roce', 'ratios', 'pct', 'high'],
  ['Return on Assets', 'roa', 'ratios', 'pct', 'high'],
  ['Gross Margin', 'grossMargin', 'ratios', 'pct', 'high'],
  ['Net Margin', 'netMargin', 'ratios', 'pct', 'high'],
  ['Revenue Growth (1y)', 'salesGrowth', 'ratios', 'pctS', 'high'],
  ['Profit Growth (1y)', 'profitGrowth', 'ratios', 'pctS', 'high'],
  ['Debt / Equity', 'debtToEquity', 'ratios', 'num', 'low'],
  ['Current Ratio', 'currentRatio', 'ratios', 'num', 'high'],
  ['Interest Coverage', 'interestCoverage', 'ratios', 'num', 'high'],
  ['Dividend Yield', 'dividendYield', 'ratios', 'pct', 'high'],
  ['Beta', 'beta', 'ratios', 'num', null],
  ['1-Year Return', 'return1y', 'ratios', 'pctS', 'high'],
]

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const fin = v => v != null && Number.isFinite(Number(v))
const fmtVal = (v, kind) => {
  if (!fin(v)) return '—'
  const n = Number(v)
  if (kind === 'usd') return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (kind === 'cap') {
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
    return '$' + (n / 1e6).toFixed(0) + 'M'
  }
  if (kind === 'pct') return n.toFixed(2) + '%'
  if (kind === 'pctS') return (n > 0 ? '+' : '') + n.toFixed(2) + '%'
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

async function fetchStock(t) {
  const [ovRes, raRes] = await Promise.all([
    fetch(`${API}/stock/${t}/overview`, { signal: AbortSignal.timeout(8000) }),
    fetch(`${API}/stock/${t}/ratios`, { signal: AbortSignal.timeout(8000) }),
  ])
  if (!ovRes.ok) return null
  const ovJ = await ovRes.json().catch(() => null)
  const raJ = raRes.ok ? await raRes.json().catch(() => null) : null
  const overview = ovJ?.overview || ovJ
  const ratios = raJ?.ratios || raJ || {}
  if (!overview?.ticker || overview?.error) return null
  return { overview, ratios: ratios.error ? {} : ratios }
}

export async function onRequestGet(context) {
  const { params, request } = context
  const slug = String(params.slug || '').toLowerCase()
  const m = slug.match(/^([a-z0-9.]{1,8})-vs-([a-z0-9.]{1,8})$/)
  if (!m) return notFound()
  const [a, b] = [m[1].toUpperCase(), m[2].toUpperCase()]
  if (a === b) return notFound()

  const cache = caches.default
  const cacheKey = new Request(`${SITE_ORIGIN}/compare/${slug}`, { method: 'GET' })
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  let sa = null, sb = null
  try {
    [sa, sb] = await Promise.all([fetchStock(a).catch(() => null), fetchStock(b).catch(() => null)])
  } catch (_) {}
  if (!sa || !sb) return notFound()

  const nameA = sa.overview.companyName || sa.overview.name || a
  const nameB = sb.overview.companyName || sb.overview.name || b
  const get = (s, key, src) => src === 'overview' ? s.overview[key] : s.ratios[key]

  let winsA = 0, winsB = 0
  const rowsHtml = METRIC_ROWS.map(([label, key, src, kind, dir]) => {
    const va = get(sa, key, src), vb = get(sb, key, src)
    let boldA = false, boldB = false
    if (dir && fin(va) && fin(vb) && Number(va) !== Number(vb)) {
      const aNum = Number(va), bNum = Number(vb)
      const skipNeg = dir === 'low' && (aNum <= 0 || bNum <= 0) // negative P/E etc. isn't "better"
      if (!skipNeg) {
        const aWins = dir === 'low' ? aNum < bNum : aNum > bNum
        boldA = aWins; boldB = !aWins
        if (aWins) winsA++; else winsB++
      }
    }
    return `<tr>
      <td style="text-align:left;padding:10px 14px;color:#434651;font-weight:600;border-bottom:1px solid #eef1f5">${label}</td>
      <td style="text-align:center;padding:10px 14px;border-bottom:1px solid #eef1f5;${boldA ? 'font-weight:800;color:#16a34a' : ''}">${fmtVal(va, kind)}</td>
      <td style="text-align:center;padding:10px 14px;border-bottom:1px solid #eef1f5;${boldB ? 'font-weight:800;color:#16a34a' : ''}">${fmtVal(vb, kind)}</td>
    </tr>`
  }).join('')

  const peA = sa.ratios.pe, peB = sb.ratios.pe, roeA = sa.ratios.roe, roeB = sb.ratios.roe
  const summaryBits = []
  if (fin(peA) && fin(peB) && peA > 0 && peB > 0) summaryBits.push(`${peA < peB ? a : b} trades at the lower earnings multiple (${fmtVal(Math.min(peA, peB), 'num')}x vs ${fmtVal(Math.max(peA, peB), 'num')}x)`)
  if (fin(roeA) && fin(roeB)) summaryBits.push(`${roeA > roeB ? a : b} generates the higher return on equity (${fmtVal(Math.max(roeA, roeB), 'pct')} vs ${fmtVal(Math.min(roeA, roeB), 'pct')})`)
  const summary = summaryBits.length ? summaryBits.join(', while ') + '.' : ''

  const related = COMPARE_PAIRS.filter(p => p !== slug && (p.includes(a.toLowerCase()) || p.includes(b.toLowerCase()))).slice(0, 4)
  const relatedMore = COMPARE_PAIRS.filter(p => p !== slug && !related.includes(p)).slice(0, 6 - related.length)
  const relatedAll = [...related, ...relatedMore]

  const bodyHtml = `
    <main class="container" style="padding:24px 16px 56px;max-width:900px;margin:0 auto;font-family:Inter,system-ui,sans-serif">
      <nav style="font-size:13px;color:#787b86;margin-bottom:10px"><a href="/" style="color:#2563eb;text-decoration:none">Home</a> › Compare</nav>
      <h1 style="font-size:32px;font-weight:900;letter-spacing:-.02em;margin:0 0 6px">${esc(a)} vs ${esc(b)}: Stock Comparison</h1>
      <p style="font-size:16px;color:#434651;margin:0 0 8px;max-width:720px">${esc(nameA)} (${esc(a)}) and ${esc(nameB)} (${esc(b)}) compared side by side on ${METRIC_ROWS.length} fundamental metrics — valuation, profitability, growth, balance sheet, and returns. Live data, updated hourly.</p>
      ${summary ? `<p style="font-size:15px;color:#5a6273;margin:0 0 18px;max-width:720px">${summary}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e7e9f0;border-radius:12px;overflow:hidden;font-size:14px">
        <thead><tr style="background:#f8fafc">
          <th style="text-align:left;padding:12px 14px;color:#787b86;font-size:12px;text-transform:uppercase;letter-spacing:.06em">Metric</th>
          <th style="padding:12px 14px"><a href="/stock/${esc(a)}" style="color:#2563eb;text-decoration:none;font-weight:800">${esc(a)}</a></th>
          <th style="padding:12px 14px"><a href="/stock/${esc(b)}" style="color:#2563eb;text-decoration:none;font-weight:800">${esc(b)}</a></th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="font-size:13px;color:#787b86;margin:12px 0 0">Green bold marks the stronger value on each metric. ${a} leads on ${winsA}, ${b} leads on ${winsB}. Metric counts are not investment advice — context matters (sector norms, one-off items, growth stage).</p>
      <p style="margin:20px 0 0"><a href="/stock/${esc(a)}" style="color:#2563eb;font-weight:700;text-decoration:none">Full ${esc(a)} analysis →</a> &nbsp;·&nbsp; <a href="/stock/${esc(b)}" style="color:#2563eb;font-weight:700;text-decoration:none">Full ${esc(b)} analysis →</a> &nbsp;·&nbsp; <a href="/screener" style="color:#2563eb;font-weight:700;text-decoration:none">Screen 4,900+ stocks →</a></p>
      ${relatedAll.length ? `
      <h2 style="font-size:18px;font-weight:800;margin:28px 0 10px">More Comparisons</h2>
      <ul style="line-height:2;padding-left:18px">
        ${relatedAll.map(p => { const [x, y] = p.split('-vs-'); return `<li><a href="/compare/${p}" style="color:#2563eb;text-decoration:none">${x.toUpperCase()} vs ${y.toUpperCase()}</a></li>` }).join('')}
      </ul>` : ''}
    </main>`

  const jsonLd = [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
      { '@type': 'ListItem', position: 2, name: `${a} vs ${b}`, item: `${SITE_ORIGIN}/compare/${slug}` },
    ],
  }]

  const response = new Response(renderSpaShell({
    title: `${a} vs ${b} Stock Comparison — Which Is Better? (${new Date().getFullYear()}) | DeltaScreener`,
    description: `${a} vs ${b} compared on P/E, ROE, margins, growth, debt and ${METRIC_ROWS.length - 5}+ more metrics with live data. ${summary.slice(0, 120)}`,
    canonicalUrl: `${SITE_ORIGIN}/compare/${slug}`,
    robots: 'index,follow',
    jsonLd,
    bodyHtml,
  }), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  })
  context.waitUntil(cache.put(cacheKey, response.clone()))
  return response
}

function notFound() {
  return new Response(renderSpaShell({
    title: 'Comparison Not Found | DeltaScreener',
    description: 'This stock comparison does not exist.',
    canonicalUrl: `${SITE_ORIGIN}/`,
    robots: 'noindex,nofollow',
    bodyHtml: '<main style="max-width:700px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif"><h1>Comparison not found</h1><p style="color:#6b7280">Use the format /compare/aapl-vs-msft with two valid US tickers.</p><p><a href="/screener" style="color:#2563eb">Open the screener →</a></p></main>',
  }), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
