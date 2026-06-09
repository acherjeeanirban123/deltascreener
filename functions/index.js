// v20260528-3
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'DeltaScreener — Free US Stock Screener & Stock Analysis'
  const description = 'Free US stock screener with 30+ filters, 10-year financials, and custom query language. Screen NYSE & NASDAQ stocks instantly. No sign-up required.'
  const keywords = 'stock screener, free stock screener, US stock screener, stock analysis, NYSE screener, NASDAQ screener, financial ratios, DeltaScreener'

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DeltaScreener',
      url: `${SITE_ORIGIN}/`,
      description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_ORIGIN}/stock/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DeltaScreener',
      url: `${SITE_ORIGIN}/`,
      logo: `${SITE_ORIGIN}/og-image.png`,
      sameAs: ['https://twitter.com/deltascreener'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'DeltaScreener',
      url: `${SITE_ORIGIN}/screener`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Free US stock screener with 30+ filters covering valuation, profitability, balance sheet, and income metrics for NYSE and NASDAQ stocks.',
    },
  ]

  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:40px 16px 64px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:12px">Free US stock research</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(42px,7vw,72px);line-height:1;letter-spacing:-.05em;margin:0 0 12px;color:#111827">DeltaScreener</h1>
      <p style="font-size:20px;font-weight:700;color:#0f766e;margin:0 0 14px">Better Signals. Better Stocks.</p>
      <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 28px;font-size:17px">${description}</p>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px">
        <a href="/screener" style="display:inline-flex;padding:13px 20px;border-radius:14px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:15px">Open Free Screener →</a>
        <a href="/stock/AAPL" style="display:inline-flex;padding:13px 20px;border-radius:14px;border:1px solid #d1d5db;background:#fff;color:#111827;text-decoration:none;font-weight:700;font-size:15px">View a Stock Page</a>
      </div>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 18px">What is DeltaScreener?</h2>
        <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 14px">
          DeltaScreener is a free stock screener for US-listed equities on NYSE and NASDAQ. It lets you filter over 5,000 stocks using 30+ fundamental metrics — valuation ratios like P/E and P/B, quality metrics like ROE and ROA, balance sheet filters like Debt/Equity, and income metrics like Dividend Yield.
        </p>
        <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0">
          Every screener result links to a full stock detail page with 10 years of annual financials, quarterly results, ratio history, peer comparisons, and news — no login or subscription needed.
        </p>
      </section>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 18px">Key features</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
          ${[
            ['30+ Screening Filters', 'P/E, P/B, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, and more.', '#eef8f5', '#0f766e'],
            ['5,000+ US Stocks', 'Full NYSE and NASDAQ coverage with daily-updated fundamental data.', '#f0f4ff', '#2962ff'],
            ['10-Year Financial History', 'Annual and quarterly data going back 10 years for every stock in the screener.', '#fef9ec', '#b45309'],
            ['No Sign-Up Required', 'Open the screener and start filtering immediately. Free, with no account needed.', '#f0fdf4', '#15803d'],
            ['Custom Query Builder', 'Combine any number of conditions with AND logic, then sort results by any metric.', '#fdf2f8', '#9333ea'],
            ['Curated Screen Pages', 'Pre-built screens for High ROE, Low Debt, Dividend Stocks, Undervalued Tech, and more.', '#fff7ed', '#ea580c'],
          ].map(([label, desc, bg, color]) => `
            <article style="padding:20px;border-radius:16px;background:${bg};border:1px solid rgba(0,0,0,.06)">
              <strong style="display:block;font-size:15px;font-weight:800;color:${color};margin-bottom:6px">${label}</strong>
              <p style="margin:0;font-size:13px;line-height:1.65;color:#55606d">${desc}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 18px">Popular stock screener pages</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${[
            ['High ROE Stocks', '/stocks/high-roe-stocks'],
            ['Low Debt Stocks', '/stocks/low-debt-stocks'],
            ['Undervalued Tech Stocks', '/stocks/undervalued-tech-stocks'],
            ['Dividend Stocks', '/stocks/dividend-stocks'],
            ['Low PE Stocks', '/stocks/low-pe-stocks'],
            ['High Net Margin Stocks', '/stocks/high-net-margin-stocks'],
            ['Nasdaq High ROE Stocks', '/stocks/nasdaq-high-roe-stocks'],
            ['Low PB Stocks', '/stocks/low-pb-stocks'],
          ].map(([name, href]) => `
            <a href="${href}" style="display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:14px;background:#fff;color:#111827;text-decoration:none;font-weight:700;font-size:14px">${name} →</a>
          `).join('')}
        </div>
      </section>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl: `${SITE_ORIGIN}/`,
    keywords,
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
