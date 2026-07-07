import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'How to Find Undervalued Stocks Using a Stock Screener | DeltaScreener'
  const description = 'Learn how to find undervalued stocks using P/E, P/B, and ROE filters in a free stock screener. Step-by-step guide for US investors on NYSE and NASDAQ.'
  const slug = 'how-to-find-undervalued-stocks'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'How to Find Undervalued Stocks Using a Stock Screener', description, url: canonicalUrl, datePublished: '2026-06-04', dateModified: '2026-06-04', author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN }, publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` }, { '@type': 'ListItem', position: 3, name: 'How to Find Undervalued Stocks', item: canonicalUrl }] },
  ]
  const bodyHtml = `
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">Undervalued Stocks</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Value Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Find Undervalued Stocks Using a Stock Screener</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 7 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Undervalued stocks trade below their intrinsic value — meaning the market is pricing them cheaper than what the underlying business fundamentals suggest they're worth. Stock screeners make it possible to systematically find these opportunities across thousands of US stocks in seconds.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 1: Screen for Low P/E Ratio</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">The price-to-earnings ratio (P/E) is the most widely used valuation metric. A low P/E can indicate an undervalued stock — but only when earnings are real and recurring. Use the <a href="/screener" style="color:#2563eb;font-weight:600">DeltaScreener</a> to filter for P/E &lt; 15 on NYSE and NASDAQ stocks. Pair this with a minimum EPS to exclude loss-making companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 2: Check Price-to-Book (P/B) Ratio</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">The P/B ratio compares stock price to book value per share. Stocks trading below 1x book value are technically priced below their net assets. Filter for P/B &lt; 1.5 to find asset-heavy businesses potentially on sale. This works especially well for banks, industrials, and energy companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 3: Require Quality — ROE Filter</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Cheap stocks aren't always good stocks. Combine low valuation with a minimum ROE of 10–15% to ensure the business actually generates returns for shareholders. The <a href="/screens/undervalued-tech-stocks" style="color:#2563eb;font-weight:600">undervalued tech stocks screen</a> on DeltaScreener uses this exact combination.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 4: Check Balance Sheet Health</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">A stock might look cheap because it carries excessive debt. Always add a Debt/Equity filter (D/E &lt; 1.0 is a reasonable ceiling) when screening for undervalued stocks. High debt amplifies risk — especially when rates are elevated.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Ready-Made Undervalued Stock Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Low P/E + High ROE technology stocks on US exchanges</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Low P/E Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Broad value screen across all US sectors</span></a>
      <a href="/screens/low-pb-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Low P/B Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Stocks trading near or below book value</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Screen for Undervalued Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">Use DeltaScreener's 30+ filters to build your own undervalued stock screen in seconds.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'how to find undervalued stocks, undervalued stock screener, low PE stocks, value investing screener, P/E ratio screen', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
