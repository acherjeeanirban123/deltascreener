import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Best Free Stock Screener for US Stocks in 2026 | DeltaScreener'
  const description = 'Looking for the best free stock screener? DeltaScreener offers 30+ filters, 10-year financials, and custom queries for NYSE & NASDAQ stocks. No sign-up required.'
  const slug = 'best-free-stock-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Best Free Stock Screener for US Stocks in 2026',
      description,
      url: canonicalUrl,
      datePublished: '2026-06-04',
      dateModified: '2026-06-04',
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is the best free stock screener?', acceptedAnswer: { '@type': 'Answer', text: 'DeltaScreener is a top free stock screener offering 30+ filters, 10-year historical financials, and a custom query language for NYSE and NASDAQ stocks — with no sign-up required.' } },
        { '@type': 'Question', name: 'Can I screen stocks for free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. DeltaScreener is completely free to use. You can filter 5,000+ US stocks by P/E, ROE, debt, market cap, and more without creating an account.' } },
        { '@type': 'Question', name: 'What filters does a free stock screener need?', acceptedAnswer: { '@type': 'Answer', text: 'A good free stock screener should have P/E ratio, P/B ratio, ROE, debt-to-equity, market cap, dividend yield, EPS growth, and revenue growth filters at minimum.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Best Free Stock Screener', item: canonicalUrl },
      ],
    },
  ]

  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Best Free Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Best Free Stock Screener for US Stocks in 2026</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 6 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Finding a free stock screener that covers all the filters you need without hidden paywalls is harder than it sounds. Most tools limit their best filters to paid tiers or require an account just to see results. This guide covers what to look for — and why DeltaScreener is one of the few genuinely free options for US investors.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Makes a Good Free Stock Screener?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">A useful free stock screener needs at least these capabilities:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Valuation filters</strong> — P/E, P/B, EV/EBITDA to find cheap or reasonably priced stocks</li>
      <li><strong>Profitability filters</strong> — ROE, ROA, net margin to identify quality businesses</li>
      <li><strong>Balance sheet filters</strong> — Debt/Equity, current ratio to spot financial strength</li>
      <li><strong>Growth filters</strong> — EPS growth, revenue growth to find expanding businesses</li>
      <li><strong>Market cap & exchange filters</strong> — NYSE vs NASDAQ, large cap vs small cap</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Beyond filters, a good screener gives you historical data — not just trailing twelve months. Seeing 5–10 years of financials tells you whether quality is consistent or just a one-year anomaly.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">DeltaScreener: 30+ Filters, No Account Required</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px"><a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> covers over 5,000 NYSE and NASDAQ stocks with 30+ fundamental filters and 10 years of annual financial data. Key features:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li>Filter by P/E, P/B, ROE, ROA, Net Margin, Debt/Equity, Dividend Yield, EPS Growth, Revenue Growth, Market Cap, and more</li>
      <li>Custom query language — combine any number of filters with AND logic</li>
      <li>Sort results by any metric</li>
      <li>Click any stock to see a full 10-year financial history</li>
      <li>No sign-up, no email, no credit card — completely free</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Popular Stock Screens to Try</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Here are some ready-made screens on DeltaScreener:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— Quality companies with strong return on equity</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">— Value stocks trading below market average</span></a>
      <a href="/screens/dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">— Stocks with consistent dividend yield</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong> <span style="color:#6b7280;font-size:14px">— Tech stocks at reasonable valuations</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is the best free stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">DeltaScreener is one of the best free stock screeners with 30+ filters, 10-year financials, and no sign-up required. Others worth trying include Finviz (basic free tier) and Stock Analysis.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Can I screen stocks for free?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes. DeltaScreener is completely free — no account, no email, no credit card required. All 30+ filters and 5,000+ stocks are accessible instantly.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Does DeltaScreener have a mobile version?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes, DeltaScreener is fully responsive and works on mobile browsers without needing to install any app.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Try DeltaScreener Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ US stocks with 30+ filters. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'best free stock screener, free stock screener US, stock screener no sign up, NYSE stock screener, NASDAQ screener free', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
