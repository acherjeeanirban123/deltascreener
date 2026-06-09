import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Small Cap Stock Screener: How to Find Small Cap Stocks in 2026 | DeltaScreener'
  const description = 'Use a small cap stock screener to find hidden gems before they go mainstream. Filter US small cap stocks by P/E, ROE, growth and more — free on DeltaScreener.'
  const slug = 'small-cap-stocks-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Small Cap Stock Screener: How to Find Small Cap Stocks in 2026',
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
        { '@type': 'Question', name: 'What is a small cap stock?', acceptedAnswer: { '@type': 'Answer', text: 'Small cap stocks are companies with a market capitalization between $300 million and $2 billion. They tend to have higher growth potential but also more risk than large cap stocks.' } },
        { '@type': 'Question', name: 'How do I screen for small cap stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Set market cap between $300M and $2B, then add quality filters like ROE > 12%, low debt (D/E < 0.5), and positive EPS growth to narrow down to financially healthy small caps.' } },
        { '@type': 'Question', name: 'Are small cap stocks worth it?', acceptedAnswer: { '@type': 'Answer', text: 'Small cap stocks have historically outperformed large caps over long periods, but with higher volatility. They are best suited for investors with a longer time horizon and higher risk tolerance.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Small Cap Stocks Screener', item: canonicalUrl },
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
        <li style="color:#d1d5db">Small Cap Stocks Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Small Cap Stock Screener: How to Find Small Cap Stocks in 2026</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 5 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Small cap stocks are one of the best hunting grounds for multi-bagger returns. These companies — typically with market caps between $300M and $2B — are often under-followed by Wall Street analysts, which means mispricings are common. A small cap stock screener helps you surface financially solid small companies before the broader market notices them.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Counts as a Small Cap Stock?</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Micro cap</strong>: Market cap $50M – $300M (very high risk)</li>
      <li><strong>Small cap</strong>: Market cap $300M – $2B (high risk, high potential)</li>
      <li><strong>Mid cap</strong>: Market cap $2B – $10B (moderate risk)</li>
      <li><strong>Large cap</strong>: Market cap &gt; $10B (lower risk, lower growth)</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Most institutional funds can't easily buy small caps due to liquidity constraints, which is why retail investors have an edge in this segment.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Best Filters for a Small Cap Screen</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Use these filters to find quality small cap stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Market Cap $300M – $2B</strong> — Classic small cap range</li>
      <li><strong>ROE &gt; 12%</strong> — Signals the business is generating decent returns</li>
      <li><strong>Debt/Equity &lt; 0.5</strong> — Low debt is critical for small caps, as they have less access to capital markets</li>
      <li><strong>EPS Growth &gt; 10%</strong> — Growing earnings validate the business model</li>
      <li><strong>Net Margin &gt; 8%</strong> — Healthy margins mean the company isn't just burning cash to grow</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made Screens to Start With</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Try these screens on <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> — free, no account needed:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">— Financially healthy companies with D/E &lt; 0.5</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— Quality businesses with strong return on equity</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">— Value plays trading at below-market multiples</span></a>
      <a href="/screens/penny-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Penny Stocks</strong> <span style="color:#6b7280;font-size:14px">— Very low price stocks for speculative screening</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Risks of Small Cap Investing</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Small caps carry real risks. Lower liquidity means wider bid-ask spreads and it can be harder to exit a position quickly. Smaller companies also have less diversified revenue, making them more sensitive to economic downturns. Always size positions carefully and use the 10-year financial history in DeltaScreener to check consistency of earnings before investing.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is a small cap stock?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Small cap stocks have market caps between $300M and $2B. They offer higher growth potential than large caps but come with more volatility and liquidity risk.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for small cap stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Set market cap to $300M–$2B, then add ROE &gt; 12%, D/E &lt; 0.5, and positive EPS growth. DeltaScreener lets you apply all these filters free across 5,000+ US stocks.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Are small cap stocks a good investment?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Historically yes — small caps have outperformed large caps over 20+ year periods. But they require more due diligence and a longer time horizon.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen Small Cap Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ NYSE & NASDAQ stocks by market cap, ROE, debt and more. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'small cap stock screener, screen small cap stocks, small cap stocks US, find small cap stocks, best small cap screener free', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
