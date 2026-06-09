import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Stock Screener for Beginners: How to Start Screening Stocks | DeltaScreener'
  const description = 'New to stock screening? This beginner guide explains what a stock screener is, which filters to use first, and how to find your first stocks free on DeltaScreener.'
  const slug = 'stock-screener-for-beginners'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Stock Screener for Beginners: How to Start Screening Stocks',
      description,
      url: canonicalUrl,
      datePublished: '2026-06-05',
      dateModified: '2026-06-05',
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is a stock screener?', acceptedAnswer: { '@type': 'Answer', text: 'A stock screener is a tool that filters thousands of publicly traded companies down to a shortlist based on financial criteria you set — such as P/E ratio, ROE, dividend yield, and market cap.' } },
        { '@type': 'Question', name: 'What filters should a beginner use on a stock screener?', acceptedAnswer: { '@type': 'Answer', text: 'Beginners should start with simple filters: market cap (stick to large or mid cap for stability), P/E ratio below 20 for value, ROE above 12% for quality, and low debt/equity. These four filters alone narrow 5,000 stocks to a manageable list.' } },
        { '@type': 'Question', name: 'Is a stock screener free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — DeltaScreener is completely free to use with no account required. It covers 5,000+ NYSE and NASDAQ stocks with 30+ filters and 10-year financial data.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Stock Screener for Beginners', item: canonicalUrl },
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
        <li style="color:#d1d5db">Stock Screener for Beginners</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Beginner's Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Stock Screener for Beginners: How to Start Screening Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">There are over 5,000 publicly traded stocks on US exchanges. A stock screener is the tool that turns that overwhelming universe into a manageable shortlist. This guide walks you through what a screener is, how to use one, and which filters to start with as a beginner.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Is a Stock Screener?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">A stock screener is a filter tool. You set criteria — like "P/E ratio below 15" or "ROE above 18%" — and the screener instantly shows you every US stock that meets those conditions. Instead of manually researching thousands of companies, you apply filters and get a focused list to investigate further.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Think of it like a search engine for stocks. You describe what you want, and it finds candidates. The actual investment decision still requires your judgment — but the screener does the initial heavy lifting.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">The 4 Beginner Filters to Start With</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Don't get overwhelmed by 30+ available filters. Start with these four:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Market Cap &gt; $2B</strong> — Stick to larger, more stable companies as a beginner. Smaller companies carry more risk and are harder to research.</li>
      <li><strong>P/E Ratio &lt; 20</strong> — The Price-to-Earnings ratio tells you how much you pay per dollar of earnings. Below 20 generally means reasonable value.</li>
      <li><strong>ROE &gt; 12%</strong> — Return on Equity above 12% shows the company is generating good returns for shareholders.</li>
      <li><strong>Debt/Equity &lt; 1.0</strong> — Companies with more debt than equity are riskier. Keep it below 1.0 to start.</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">These four filters alone will typically reduce 5,000+ stocks to 50–200 candidates — a much more manageable list to research. For a deeper explanation of each filter, see our guide on <a href="/blog/stock-screener-filters-explained" style="color:#2dd4bf;font-weight:600">stock screener filters explained</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made Screens for Beginners</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">DeltaScreener has pre-built screens you can use immediately — no setup required:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">— A good starting point for value-oriented beginners</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— Quality companies for beginners who want reliable businesses</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">— Safer balance sheets, lower risk for new investors</span></a>
      <a href="/screens/dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">— Income-paying stocks ideal for long-term, conservative investing</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener Step-by-Step</h2>
    <ol style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li>Go to <a href="/screener" style="color:#2dd4bf;font-weight:600">deltascreener.com/screener</a></li>
      <li>Set your filters on the left panel (P/E, ROE, Market Cap, etc.)</li>
      <li>Results update instantly — browse the matching stocks</li>
      <li>Click any stock ticker to see its 10-year financial history</li>
      <li>Add interesting stocks to your watchlist for further research</li>
    </ol>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">No account required — everything is free and instant.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is a stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">A stock screener filters thousands of stocks down to a shortlist based on criteria you set — like P/E ratio, ROE, market cap, or dividend yield.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What filters should a beginner use?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Start with Market Cap &gt; $2B, P/E &lt; 20, ROE &gt; 12%, and D/E &lt; 1.0. These four filters give you a solid beginner shortlist without getting overwhelmed.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Is DeltaScreener free for beginners?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes, completely free. No account, no email, no credit card. All 30+ filters and 5,000+ stocks are available immediately.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Start Screening Stocks for Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">5,000+ NYSE & NASDAQ stocks, 30+ filters, 10-year financials. No sign-up needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'stock screener for beginners, how to use a stock screener, beginner stock screener, learn stock screening, free stock screener beginners', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
