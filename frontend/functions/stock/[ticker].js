// Stock page — validates ticker against API, returns real 404 for unknown tickers
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

const API_ORIGINS = [
  'https://api.deltascreener.com',
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
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Open Screener</a>
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

function statRow(label, value) {
  return `<tr><td style="padding:10px 14px;color:#6b7280;font-size:14px;border-bottom:1px solid #f1f5f9;white-space:nowrap">${label}</td><td style="padding:10px 14px;font-weight:700;font-size:14px;color:#111827;border-bottom:1px solid #f1f5f9;text-align:right">${value}</td></tr>`
}

function renderStockShell(ticker, overview, fin) {
  const o = overview || {}
  // Use name only if it's different from ticker (i.e. real company name, not just repeated ticker)
  const rawName = o.name && o.name !== ticker ? o.name : null
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

  const descriptionText = o.description
    ? `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 32px;max-width:760px">${escapeHtml(o.description)}</p>`
    : ''

  // Annual P&L table from financials endpoint
  let annualTableHtml = ''
  if (fin && fin.annual && fin.annual.headers && fin.annual.headers.length) {
    const a = fin.annual
    const years = a.headers.slice(-5) // last 5 years
    const startIdx = a.headers.length - years.length
    const fmtNum = (arr, i) => {
      const v = arr?.[startIdx + i]
      if (v == null || v === '' || isNaN(v)) return '—'
      const n = Number(v)
      if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(1) + 'B'
      if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
      return '$' + n.toLocaleString('en-US')
    }
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
    const fmtNum = (arr, i) => {
      const v = arr?.[startIdx + i]
      if (v == null || v === '' || isNaN(v)) return '—'
      const n = Number(v)
      if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(1) + 'B'
      if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(1) + 'M'
      return '$' + n.toLocaleString('en-US')
    }
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

  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:32px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">${escapeHtml(o.exchange || 'Stock')} · ${escapeHtml(o.industry || 'Stock Research')}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,48px);line-height:1.08;letter-spacing:-.03em;margin:0 0 12px;color:#111827">${escapeHtml(displayName)} (${escapeHtml(ticker)}) Stock</h1>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:20px">
        ${price != null ? `<span style="font-size:28px;font-weight:900;color:#111827">${fmtPrice(price)}</span>` : ''}
        ${changePct != null ? `<span style="font-size:15px;font-weight:700;color:${changeColor}">${changeSign}${fmt(changePct)}%</span>` : ''}
        <span style="padding:6px 12px;border-radius:999px;background:#eef8f5;color:#0f766e;font-weight:700;font-size:13px">${escapeHtml(o.exchange || 'NYSE/NASDAQ')}: ${escapeHtml(ticker)}</span>
        ${o.sector ? `<span style="padding:6px 12px;border-radius:999px;background:#f1f5ff;color:#2962ff;font-weight:700;font-size:13px">${escapeHtml(o.sector)}</span>` : ''}
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
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Run Stock Screener</a>
        <a href="/blog" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Investing Guides</a>
      </div>
    </main>`

  const title = rawName
    ? `${rawName} (${ticker}) Stock Price, Financials & Analysis | DeltaScreener`
    : `${ticker} Stock Price, Financials & Analysis | DeltaScreener`

  const descSnippets = []
  if (price != null) descSnippets.push(`price ${fmtPrice(price)}`)
  if (o.pe != null) descSnippets.push(`P/E ${fmt(o.pe)}`)
  if (o.roe != null) descSnippets.push(`ROE ${fmtPct(o.roe)}`)
  if (o.netMargin != null) descSnippets.push(`net margin ${fmtPct(o.netMargin)}`)
  const metaDesc = descSnippets.length
    ? `${displayName} (${ticker}) stock — ${descSnippets.join(', ')}. Full financials, valuation ratios, and analysis on DeltaScreener.`
    : `${displayName} (${ticker}) stock data, financials, valuation ratios, and analysis on DeltaScreener.`

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    'name': displayName,
    'tickerSymbol': ticker,
    ...(o.exchange ? { 'exchange': o.exchange } : {}),
    'url': `https://deltascreener.com/stock/${ticker}`,
  }

  return new Response(renderSpaShell({
    title,
    description: metaDesc,
    canonicalUrl: `${SITE_ORIGIN}/stock/${ticker}`,
    keywords: `${ticker} stock, ${displayName} stock price, ${displayName} financials, ${ticker} PE ratio, ${ticker} ROE`,
    bodyHtml,
    jsonLd,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
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

    return renderStockShell(ticker, overview, fin)
  } catch (_) {
    // API unreachable — serve shell with noindex rather than 404
    return renderStockShell(ticker, { name: ticker }, null)
  }
}
