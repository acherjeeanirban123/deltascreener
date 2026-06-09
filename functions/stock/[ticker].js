// v20260609-seo-full-financials
import {
  API_FALLBACKS,
  SITE_ORIGIN,
  buildStockSeo,
  fetchJson,
  renderSpaShell,
} from '../_lib/spa-shell.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function compactUsd(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

function usd(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'
}

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'
}

function pct(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : '—'
}

function fmtM(value) {
  // Format a raw number (already in millions from API) as compact USD
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}T`
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}B`
  return `$${n.toFixed(0)}M`
}

const TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:13px;'
const TH_STYLE = 'padding:8px 10px;text-align:right;font-weight:700;color:#6b7280;border-bottom:2px solid #e5e7eb;white-space:nowrap;'
const TH_LABEL_STYLE = 'padding:8px 10px;text-align:left;font-weight:700;color:#6b7280;border-bottom:2px solid #e5e7eb;'
const TD_STYLE = 'padding:7px 10px;text-align:right;color:#111827;border-bottom:1px solid #f3f4f6;white-space:nowrap;'
const TD_LABEL_STYLE = 'padding:7px 10px;text-align:left;font-weight:600;color:#374151;border-bottom:1px solid #f3f4f6;'
const SECTION_STYLE = 'margin-bottom:40px;border-radius:16px;border:1px solid #e5e7eb;overflow:auto;background:#fff;'
const H2_STYLE = 'font-family:"IBM Plex Serif",Georgia,serif;font-size:20px;font-weight:700;color:#111827;margin:0 0 16px;'

function renderFinancialTable(title, headers, rows) {
  if (!headers || !headers.length) return ''
  const colCount = headers.length
  // Show last 5 years/quarters max to keep page lean but content-rich
  const maxCols = Math.min(colCount, 5)
  const sliceStart = colCount - maxCols
  const shownHeaders = headers.slice(sliceStart)

  const headerRow = `<tr>
    <th style="${TH_LABEL_STYLE}">Item</th>
    ${shownHeaders.map(h => `<th style="${TH_STYLE}">${escapeHtml(String(h))}</th>`).join('')}
  </tr>`

  const bodyRows = rows.map(([label, data, formatter]) => {
    const vals = (data || []).slice(sliceStart)
    return `<tr>
      <td style="${TD_LABEL_STYLE}">${escapeHtml(label)}</td>
      ${vals.map(v => `<td style="${TD_STYLE}">${formatter ? formatter(v) : escapeHtml(String(v ?? '—'))}</td>`).join('')}
    </tr>`
  }).join('')

  return `
    <div style="${SECTION_STYLE}">
      <div style="padding:20px 20px 0">
        <h2 style="${H2_STYLE}">${escapeHtml(title)}</h2>
      </div>
      <div style="overflow-x:auto;padding:0 0 4px">
        <table style="${TABLE_STYLE}">
          <thead>${headerRow}</thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    </div>`
}

function renderGrowthTable(growth) {
  if (!growth) return ''
  const rows = [
    ['Sales Growth', [growth.salesGrowth?.ttm, growth.salesGrowth?.['3y'], growth.salesGrowth?.['5y'], growth.salesGrowth?.['10y']]],
    ['Profit Growth', [growth.profitGrowth?.ttm, growth.profitGrowth?.['3y'], growth.profitGrowth?.['5y'], growth.profitGrowth?.['10y']]],
    ['Stock Price CAGR', [growth.stockCagr?.['1y'], growth.stockCagr?.['3y'], growth.stockCagr?.['5y'], growth.stockCagr?.['10y']]],
    ['Return on Equity', [growth.roe?.lastYear, growth.roe?.['3y'], growth.roe?.['5y'], growth.roe?.['10y']]],
  ]
  const headers = ['TTM / 1Y', '3 Years', '5 Years', '10 Years']
  return `
    <div style="${SECTION_STYLE}">
      <div style="padding:20px 20px 0">
        <h2 style="${H2_STYLE}">Compounded Growth Rates</h2>
      </div>
      <div style="overflow-x:auto;padding:0 0 4px">
        <table style="${TABLE_STYLE}">
          <thead><tr>
            <th style="${TH_LABEL_STYLE}">Metric</th>
            ${headers.map(h => `<th style="${TH_STYLE}">${h}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${rows.map(([label, vals]) => `<tr>
              <td style="${TD_LABEL_STYLE}">${escapeHtml(label)}</td>
              ${vals.map(v => `<td style="${TD_STYLE}">${pct(v)}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`
}

function renderStockShell(ticker, overview = {}, ratios = {}, financials = null) {
  const seo = buildStockSeo(ticker, overview, ratios)

  const keyStats = [
    ['Price', usd(overview?.price)],
    ['Market Cap', compactUsd(overview?.mktCap)],
    ['P/E Ratio', num(ratios?.pe ?? overview?.pe)],
    ['EPS (TTM)', usd(overview?.eps)],
    ['ROE', pct(ratios?.roe ?? overview?.roe)],
    ['ROCE', pct(overview?.roce)],
    ['Net Margin', pct(ratios?.netMargin ?? overview?.netMargin)],
    ['Div Yield', pct(overview?.dividendYield)],
    ['52W High', usd(overview?.high52)],
    ['52W Low', usd(overview?.low52)],
    ['P/B Ratio', num(overview?.pb)],
    ['Debt/Equity', num(overview?.debtToEquity)],
  ]

  // Build financial table sections from API data
  let financialTablesHtml = ''
  if (financials) {
    const { annual, quarterly, balance, cashflow, growth } = financials

    if (annual?.headers) {
      financialTablesHtml += renderFinancialTable('Annual Profit & Loss (USD Millions)', annual.headers, [
        ['Revenue ($M)', annual.sales, fmtM],
        ['Expenses ($M)', annual.expenses, fmtM],
        ['Operating Profit ($M)', annual.opProfit, fmtM],
        ['OPM %', annual.opm, pct],
        ['Net Profit ($M)', annual.netProfit, fmtM],
        ['EPS ($)', annual.eps, v => `$${Number(v).toFixed(2)}`],
      ])
    }

    if (quarterly?.headers) {
      financialTablesHtml += renderFinancialTable('Quarterly Results (USD Millions)', quarterly.headers, [
        ['Revenue ($M)', quarterly.sales, fmtM],
        ['Operating Profit ($M)', quarterly.opProfit, fmtM],
        ['OPM %', quarterly.opm, pct],
        ['Net Profit ($M)', quarterly.netProfit, fmtM],
        ['EPS ($)', quarterly.eps, v => `$${Number(v).toFixed(2)}`],
      ])
    }

    if (balance?.headers) {
      financialTablesHtml += renderFinancialTable('Balance Sheet (USD Millions)', balance.headers, [
        ['Total Assets ($M)', balance.totalAssets, fmtM],
        ['Total Liabilities ($M)', balance.totalLiabilities, fmtM],
        ['Equity ($M)', balance.equity, fmtM],
        ['Borrowings ($M)', balance.borrowings, fmtM],
        ['Cash ($M)', balance.cash, fmtM],
        ['Receivables ($M)', balance.receivables, fmtM],
      ])
    }

    if (cashflow?.headers) {
      financialTablesHtml += renderFinancialTable('Cash Flow (USD Millions)', cashflow.headers, [
        ['Operating Cash Flow ($M)', cashflow.fromOperating, fmtM],
        ['Investing Cash Flow ($M)', cashflow.fromInvesting, fmtM],
        ['Financing Cash Flow ($M)', cashflow.fromFinancing, fmtM],
        ['Free Cash Flow ($M)', cashflow.freeCashFlow, fmtM],
      ])
    }

    if (growth) {
      financialTablesHtml += renderGrowthTable(growth)
    }
  }

  // Build JSON-LD with FinancialProduct schema for richer Google results
  const jsonLd = [
    seo.jsonLd,
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Stocks', item: `${SITE_ORIGIN}/screener` },
        { '@type': 'ListItem', position: 3, name: `${overview?.name || ticker} (${ticker})`, item: seo.canonicalUrl },
      ],
    },
  ]

  const bodyHtml = `
    <style>
      body, html { background: #f9fafb !important; color: #111827 !important; }
      [data-prerender-shell] { background: #f9fafb; color: #111827; }
    </style>
    <main style="max-width:1100px;margin:0 auto;padding:32px 16px 64px;font-family:Inter,system-ui,sans-serif;color:#111827;background:#f9fafb;">

      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;flex-wrap:wrap">
          <li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li>
          <li style="color:#9ca3af">/</li>
          <li><a href="/screener" style="color:#0f766e;text-decoration:none">Screener</a></li>
          <li style="color:#9ca3af">/</li>
          <li style="color:#6b7280">${escapeHtml(ticker)}</li>
        </ol>
      </nav>

      <!-- Header -->
      <div style="margin-bottom:28px">
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(30px,5vw,48px);line-height:1.05;letter-spacing:-.03em;margin:0 0 12px;color:#111827">
          ${escapeHtml(overview?.name || ticker)}
          <span style="font-size:0.55em;font-weight:400;color:#6b7280;margin-left:8px">(${escapeHtml(ticker)})</span>
        </h1>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <span style="padding:6px 12px;border-radius:999px;background:#ecfdf5;color:#0f766e;font-weight:700;font-size:13px">${escapeHtml(overview?.exchange || 'NASDAQ/NYSE')}: ${escapeHtml(ticker)}</span>
          ${overview?.sector ? `<span style="padding:6px 12px;border-radius:999px;background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:13px">${escapeHtml(overview.sector)}</span>` : ''}
          ${overview?.industry ? `<span style="padding:6px 12px;border-radius:999px;background:#f9fafb;color:#374151;font-weight:600;font-size:13px;border:1px solid #e5e7eb">${escapeHtml(overview.industry)}</span>` : ''}
        </div>
        <p style="max-width:760px;line-height:1.75;color:#55606d;font-size:15px;margin:0">${escapeHtml(seo.description)}</p>
      </div>

      <!-- Key Stats Grid -->
      <section aria-label="Key statistics for ${escapeHtml(ticker)}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:36px">
        ${keyStats.map(([label, value]) => `
          <div style="padding:14px 16px;border:1px solid #e5e7eb;border-radius:14px;background:#fff">
            <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${escapeHtml(label)}</div>
            <div style="font-size:20px;font-weight:800;color:#111827">${escapeHtml(value)}</div>
          </div>`).join('')}
      </section>

      <!-- Financial Tables -->
      ${financialTablesHtml}

      <!-- CTA -->
      <div style="margin-top:40px;padding:28px;border-radius:16px;background:#0f2620;border:1px solid rgba(45,212,191,.2)">
        <strong style="display:block;font-family:'IBM Plex Serif',Georgia,serif;font-size:20px;color:#f9fafb;margin-bottom:8px">Screen 5,000+ US Stocks</strong>
        <p style="margin:0 0 18px;color:#9ca3af;font-size:14px;line-height:1.7">Filter by ROE, P/E, revenue growth, debt, margins and 30+ more metrics. No sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:11px 20px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return renderSpaShell({
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonicalUrl,
    keywords: seo.keywords,
    jsonLd,
    bodyHtml,
    prerender: {
      route: `/stock/${ticker}`,
      overview,
      ratios,
    },
    lightMode: true,
  })
}

export async function onRequestGet(context) {
  const ticker = String(context.params?.ticker || '').trim().toUpperCase()
  if (!ticker) return new Response('Missing ticker', { status: 400 })

  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS].filter(Boolean)

  try {
    const [overview, ratios, financials] = await Promise.all([
      fetchJson(apiOrigins, `/stock/${encodeURIComponent(ticker)}/overview`),
      fetchJson(apiOrigins, `/stock/${encodeURIComponent(ticker)}/ratios`).catch(() => null),
      fetchJson(apiOrigins, `/stock/${encodeURIComponent(ticker)}/financials`).catch(() => null),
    ])

    if (!overview || overview.error) {
      return new Response('Not found', {
        status: 404,
        headers: { 'X-Robots-Tag': 'noindex' },
      })
    }

    return new Response(renderStockShell(ticker, overview, ratios || {}, financials), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
      },
    })
  } catch {
    const seo = buildStockSeo(ticker)
    return new Response(renderSpaShell({
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.title,
      ogDescription: seo.description,
      ogUrl: seo.canonicalUrl,
      keywords: seo.keywords,
      jsonLd: seo.jsonLd,
      robots: 'noindex,follow',
      bodyHtml: `<main style="max-width:1100px;margin:0 auto;padding:32px 16px 56px;font-family:Inter,system-ui,sans-serif"><h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(38px,6vw,58px);line-height:1.05;letter-spacing:-.04em;color:#111827;margin-bottom:12px">${escapeHtml(ticker)}</h1><p style="max-width:760px;line-height:1.75;color:#55606d">${escapeHtml(seo.description)}</p></main>`,
      prerender: { route: `/stock/${ticker}` },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, follow',
      },
    })
  }
}
