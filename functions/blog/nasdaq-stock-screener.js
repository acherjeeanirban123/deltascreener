import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'
export async function onRequestGet() {
  const title = 'NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free | DeltaScreener'
  const description = 'Free NASDAQ stock screener with 30+ filters. Screen NASDAQ-listed stocks by P/E, ROE, market cap, growth and more. No sign-up required.'
  const slug = 'nasdaq-stock-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free', description, url: canonicalUrl, datePublished: '2026-06-01', author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN }, publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` }, { '@type': 'ListItem', position: 3, name: 'NASDAQ Stock Screener', item: canonicalUrl }] },
  ]
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">NASDAQ Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Exchange Screening</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 5 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">The NASDAQ is home to over 3,000 stocks — dominated by technology, biotech, and high-growth companies. Screening NASDAQ stocks requires filters tuned for higher-growth, higher-valuation businesses compared to NYSE-listed companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Makes NASDAQ Stocks Different</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">NASDAQ stocks typically have higher P/E ratios than NYSE companies because they tend to be faster-growing. Technology, semiconductors, and biotech dominate the index. When screening NASDAQ stocks, consider using growth metrics (EPS growth, revenue growth) alongside quality filters rather than pure value screens.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Best Filters for NASDAQ Stock Screening</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>ROE &gt; 15%</strong> — Quality filter for high-growth NASDAQ names</li>
      <li><strong>EPS Growth &gt; 10%</strong> — Identifies expanding businesses</li>
      <li><strong>Net Margin &gt; 15%</strong> — Software and tech businesses with strong economics</li>
      <li><strong>Market Cap &gt; $1B</strong> — Focus on established names with liquidity</li>
      <li><strong>Debt/Equity &lt; 1.5</strong> — NASDAQ firms can carry more debt if growth is strong</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made NASDAQ Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/nasdaq-high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">NASDAQ High ROE Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Quality NASDAQ companies by return on equity</span></a>
      <a href="/screens/high-roe-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Technology sector quality screen</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Tech stocks at reasonable valuations</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen NASDAQ Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">DeltaScreener covers all NASDAQ-listed stocks with 30+ filters. No account required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'NASDAQ stock screener, NASDAQ stocks filter, free NASDAQ screener, screen NASDAQ stocks, NASDAQ high ROE', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
