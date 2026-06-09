import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Value Investing Stock Screener: Find Undervalued US Stocks | DeltaScreener'
  const description = 'Apply Benjamin Graham and Warren Buffett value investing criteria to screen US stocks. Find undervalued stocks with strong fundamentals free on DeltaScreener.'
  const slug = 'value-investing-stock-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Value Investing Stock Screener: Find Undervalued US Stocks',
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
        { '@type': 'Question', name: 'What is value investing?', acceptedAnswer: { '@type': 'Answer', text: 'Value investing is a strategy of buying stocks trading below their intrinsic value. Value investors use metrics like P/E, P/B, and earnings yield to find companies the market has underpriced relative to their true worth.' } },
        { '@type': 'Question', name: 'What P/E ratio is considered undervalued?', acceptedAnswer: { '@type': 'Answer', text: 'A P/E ratio below 15 is generally considered value territory, though this varies by sector. Technology stocks typically trade at higher P/E than utilities or financials, so compare within sectors.' } },
        { '@type': 'Question', name: 'How do I screen for value stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Use P/E < 15, P/B < 1.5, positive EPS growth, and low debt as your core value screening criteria. DeltaScreener lets you apply all these free across 5,000+ US stocks.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Value Investing Stock Screener', item: canonicalUrl },
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
        <li style="color:#d1d5db">Value Investing Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Value Investing Stock Screener: Find Undervalued US Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Value investing — popularized by Benjamin Graham and refined by Warren Buffett — is the practice of buying stocks for less than they are worth. The core idea is simple: the stock market misprices companies in the short run, and patient investors can profit by buying these mispriced businesses and waiting for the market to recognize their true value.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Value Investing Metrics</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the core filters value investors use when screening for undervalued stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>P/E Ratio &lt; 15</strong> — Price-to-Earnings below 15 indicates a stock may be cheap relative to its earnings power. The market average P/E is typically 18–22x.</li>
      <li><strong>P/B Ratio &lt; 1.5</strong> — Price-to-Book below 1.5 means you're paying close to (or below) the accounting value of the company's assets.</li>
      <li><strong>Earnings Yield &gt; 6%</strong> — Earnings Yield (inverse of P/E) above 6% offers a decent return compared to bonds.</li>
      <li><strong>Positive EPS growth</strong> — A cheap stock that's also growing earnings is the ideal value combination.</li>
      <li><strong>Low debt (D/E &lt; 0.5)</strong> — Value traps often have high debt; low debt reduces this risk.</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Avoiding Value Traps</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">A value trap is a stock that looks cheap on P/E or P/B but is actually declining — earnings are falling, the business model is broken, or debt is overwhelming. To avoid them, always check the 10-year earnings trend in DeltaScreener. If EPS has been declining for 3+ years, a low P/E isn't a bargain — it's a warning sign.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Also see our guide on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find genuinely undervalued stocks</a> for a deeper framework.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Value Screens on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Start with these pre-built value screens on <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a>:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">— P/E &lt; 15, the classic value entry point</span></a>
      <a href="/screens/low-pb-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/B Stocks</strong> <span style="color:#6b7280;font-size:14px">— Stocks near or below book value</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">— Avoid value traps with healthy balance sheets</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— Quality + value: cheap AND profitable</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Benjamin Graham's Classic Screen</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Graham's original "Defensive Investor" criteria from <em>The Intelligent Investor</em> included: adequate size (market cap &gt; $1B), strong current ratio, no deficit in the last 10 years, 20+ years of continuous dividends, EPS growth of at least 33% over 10 years, P/E below 15, and P/B below 1.5. This is a strict screen — but stocks passing all these criteria have historically been excellent long-term investments.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is value investing?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Buying stocks trading below their intrinsic value, then holding until the market recognizes that value. Popularized by Benjamin Graham and practiced by Warren Buffett.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What P/E ratio is undervalued?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">P/E below 15 is generally value territory. Compare within sectors — utilities and financials naturally have lower P/Es than tech or healthcare.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for value stocks free?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Use DeltaScreener — filter by P/E &lt; 15, P/B &lt; 1.5, positive EPS growth, and low debt across 5,000+ US stocks. No account required.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Value Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ US stocks by P/E, P/B, ROE and 10-year earnings history. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'value investing stock screener, undervalued stocks screener, value stocks US, benjamin graham stock screen, low PE low PB stocks free', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
