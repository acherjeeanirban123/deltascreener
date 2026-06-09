import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'
export async function onRequestGet() {
  const title = 'Stock Screener Filters Explained: P/E, ROE, P/B and More | DeltaScreener'
  const description = 'A plain-English guide to the most important stock screener filters — P/E ratio, ROE, P/B, debt-to-equity, EPS growth — and how to use each one to find better stocks.'
  const slug = 'stock-screener-filters-explained'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'Stock Screener Filters Explained: P/E, ROE, P/B and More', description, url: canonicalUrl, datePublished: '2026-06-02', author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN }, publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` }, { '@type': 'ListItem', position: 3, name: 'Stock Screener Filters Explained', item: canonicalUrl }] },
  ]
  const bodyHtml = `
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#0f766e;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">Filters Explained</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Screener Education</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Stock Screener Filters Explained: P/E, ROE, P/B and More</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 8 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Stock screener filters are ratios and metrics that let you narrow thousands of stocks down to a short list. Here's what each key filter means and how to use it effectively.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">P/E Ratio (Price-to-Earnings)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">P/E = Stock Price ÷ Earnings Per Share. A low P/E suggests a stock is cheap relative to earnings. The S&P 500 average is around 20–25x. Screen for P/E &lt; 15 to find potential value stocks. Avoid very low P/E if earnings are declining — that's a value trap.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">ROE (Return on Equity)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">ROE = Net Income ÷ Shareholders' Equity. It measures how efficiently a company generates profits from shareholder capital. ROE &gt; 15% is generally considered strong. Warren Buffett famously uses ROE as a primary quality filter. See the <a href="/screens/high-roe-stocks" style="color:#0f766e;font-weight:600">High ROE Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">P/B Ratio (Price-to-Book)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">P/B = Stock Price ÷ Book Value Per Share. Stocks trading below 1x book value are priced below their net assets. Low P/B is most meaningful for financial, industrial, and energy stocks where assets dominate. See the <a href="/screens/low-pb-stocks" style="color:#0f766e;font-weight:600">Low P/B Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">Debt-to-Equity (D/E)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">D/E = Total Debt ÷ Shareholders' Equity. A D/E below 0.5 indicates a conservatively financed business. High D/E amplifies risk — especially in rising rate environments. The <a href="/screens/low-debt-stocks" style="color:#0f766e;font-weight:600">Low Debt Stocks screen</a> sets D/E ≤ 0.5.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">ROA (Return on Assets)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">ROA = Net Income ÷ Total Assets. Unlike ROE, ROA is not inflated by leverage — making it useful for cross-sector comparisons. ROA &gt; 10% is excellent. See the <a href="/screens/high-roa-stocks" style="color:#0f766e;font-weight:600">High ROA Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">Net Margin</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Net Margin = Net Income ÷ Revenue. High net margin businesses like software, pharma, and luxury goods retain more of each dollar of revenue as profit. Screen for Net Margin &gt; 20% to find highly profitable businesses. See the <a href="/screens/high-net-margin-stocks" style="color:#0f766e;font-weight:600">High Net Margin Stocks screen</a>.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#0f766e;margin-bottom:8px">Apply These Filters Now →</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">DeltaScreener has all these filters built in — free, no sign-up required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'stock screener filters, PE ratio explained, ROE stock screen, how to use stock screener, stock filter guide', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
