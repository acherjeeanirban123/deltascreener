// v20260528-3
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

const PRESET_QUERIES = [
  'ROE > 20 AND Average ROE 5Years > 18 AND ROCE > 15 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Interest Coverage Ratio > 5 AND Market Cap > 5000',
  'Change % > 5 AND YOY Qtr profit growth > 20 AND YOY Qtr sales growth > 15 AND ROE > 15 AND Net Margin > 8 AND Market Cap > 2000',
  'PEG Ratio > 0 AND PEG Ratio < 1 AND Sales growth 3Years > 15 AND Profit growth 3Years > 20 AND Sales growth 5Years > 12 AND Gross Margin > 40 AND Debt to Equity < 0.8 AND Market Cap > 1000',
  'P/E > 0 AND P/E < 15 AND P/B < 1.5 AND Current ratio > 2 AND Earnings yield > 6 AND Debt to Equity < 1 AND ROE > 10 AND Market Cap > 1000',
  'Dividend Yield > 2.5 AND Dividend Yield < 8 AND ROE > 12 AND Net Margin > 10 AND Interest Coverage Ratio > 4 AND Debt to Equity < 1 AND Market Cap > 5000',
]

export async function onRequestGet({ request }) {
  const url = new URL(request.url)
  const presetIdx = parseInt(url.searchParams.get('preset') ?? '-1')
  const presetQuery = (presetIdx >= 0 && presetIdx < PRESET_QUERIES.length) ? PRESET_QUERIES[presetIdx] : null
  const title = 'Free Stock Screener — Filter 5,000+ US Stocks | DeltaScreener'
  const description = 'Screen 5,000+ US stocks with 30+ filters: P/E, ROE, Market Cap, Net Margin, Debt/Equity, Dividend Yield and more. Free, fast, no sign-up required.'
  const keywords = 'stock screener, free stock screener, US stock screener, stock filter, PE screener, ROE screener, market cap screener, NASDAQ screener, NYSE screener, DeltaScreener'

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'DeltaScreener Stock Screener',
      url: `${SITE_ORIGIN}/screener`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Filter by P/E, P/B, ROE, ROA, Net Margin',
        'Filter by Debt/Equity, Market Cap, Dividend Yield',
        'Sort across 5,000+ US-listed stocks',
        'NYSE and NASDAQ coverage',
        '10-year financial history on each stock',
        'No sign-up required',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Stock Screener', item: `${SITE_ORIGIN}/screener` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is DeltaScreener free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The core stock screener on DeltaScreener is completely free with no sign-up required. You can filter 5,000+ US-listed stocks by valuation, profitability, and balance sheet metrics instantly.',
          },
        },
        {
          '@type': 'Question',
          name: 'What stocks can I screen on DeltaScreener?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DeltaScreener covers US-listed stocks on NYSE and NASDAQ. The screenable universe includes over 5,000 stocks with complete fundamental data.',
          },
        },
        {
          '@type': 'Question',
          name: 'What filters are available in the stock screener?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DeltaScreener supports 30+ filters including P/E ratio, P/B ratio, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, and exchange. You can combine any number of conditions to build a custom screen.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is DeltaScreener different from other stock screeners?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'DeltaScreener is built for speed and simplicity. You get instant results, direct links to 10-year financial history for every stock, and curated screener pages for common strategies like high ROE, low debt, and dividend investing — all without logging in.',
          },
        },
      ],
    },
  ]

  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:40px 16px 64px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Stock Screener</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:12px">Custom stock filters</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(38px,6vw,64px);line-height:1.05;letter-spacing:-.05em;margin:0 0 14px;color:#111827">Free Stock Screener</h1>
      <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 28px;font-size:17px">${description}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:0 0 32px">
        ${[
          ['Valuation', 'P/E, P/B, P/S ratios', '#eef8f5', '#0f766e'],
          ['Profitability', 'ROE, ROA, Net Margin', '#f0f4ff', '#2962ff'],
          ['Balance Sheet', 'Debt/Equity, current ratio', '#fef9ec', '#b45309'],
          ['Income', 'Dividend Yield, payout', '#fdf2f8', '#9333ea'],
          ['Size', 'Market Cap, price range', '#f0fdf4', '#15803d'],
          ['Sector / Exchange', 'NYSE, NASDAQ, tech, finance', '#fff7ed', '#ea580c'],
        ].map(([label, desc, bg, color]) => `
          <div style="padding:18px 20px;border-radius:16px;background:${bg};border:1px solid rgba(0,0,0,.06)">
            <strong style="display:block;font-size:14px;font-weight:800;color:${color};margin-bottom:4px">${label}</strong>
            <span style="font-size:13px;color:#55606d">${desc}</span>
          </div>
        `).join('')}
      </div>

      <a href="/screener" style="display:inline-flex;padding:13px 20px;border-radius:14px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:15px;margin-bottom:48px">Launch Interactive Screener →</a>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 12px">How the stock screener works</h2>
        <p style="max-width:760px;line-height:1.75;color:#55606d">
          DeltaScreener lets you build a custom stock screen by combining any number of metric conditions. Choose a metric (like ROE or P/E), set an operator (at least, at most, equal to), and enter a value. Add as many conditions as you need, then sort the results by any column. Each result links to a full stock detail page with 10 years of financials, quarterly data, valuation ratios, peers, and news — all in one place.
        </p>
      </section>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 16px">Popular stock screens</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${[
            ['High ROE Stocks', '/stocks/high-roe-stocks'],
            ['Low Debt Stocks', '/stocks/low-debt-stocks'],
            ['Undervalued Tech Stocks', '/stocks/undervalued-tech-stocks'],
            ['Dividend Stocks', '/stocks/dividend-stocks'],
            ['Low PE Stocks', '/stocks/low-pe-stocks'],
            ['High Net Margin Stocks', '/stocks/high-net-margin-stocks'],
          ].map(([name, href]) => `
            <a href="${href}" style="display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:14px;background:#fff;color:#111827;text-decoration:none;font-weight:700;font-size:14px">${name} →</a>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-.03em;margin:0 0 16px">Frequently asked questions</h2>
        ${[
          ['Is DeltaScreener free to use?', 'Yes. The core stock screener is completely free with no sign-up required. Filter 5,000+ US-listed stocks by valuation, profitability, and balance sheet metrics instantly.'],
          ['What stocks can I screen?', 'DeltaScreener covers US-listed stocks on NYSE and NASDAQ — over 5,000 names with complete fundamental data.'],
          ['What filters are available?', 'DeltaScreener supports 30+ filters: P/E, P/B, P/S, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, exchange, and more. Combine any number of conditions.'],
          ['How is this different from other screeners?', 'DeltaScreener is built for speed. Instant results, 10-year financial history per stock, and curated screener pages for common strategies — no login required.'],
        ].map(([q, a]) => `
          <div style="margin-bottom:18px">
            <strong style="display:block;font-size:15px;color:#111827;margin-bottom:6px">${q}</strong>
            <p style="margin:0;line-height:1.75;color:#55606d;font-size:14px">${a}</p>
          </div>
        `).join('')}
      </section>
    </main>`

  // Inject preset query server-side so it works regardless of browser JS module cache
  const presetPrerender = presetQuery ? { query: presetQuery } : null

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl: `${SITE_ORIGIN}/screener`,
    keywords,
    jsonLd,
    bodyHtml,
    prerender: presetPrerender,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Never cache /screener — presets must always be fresh
      'Cache-Control': 'no-store',
    },
  })
}
