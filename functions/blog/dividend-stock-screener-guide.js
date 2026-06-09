import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'
export async function onRequestGet() {
  const title = 'Dividend Stock Screener: How to Find High-Yield US Dividend Stocks | DeltaScreener'
  const description = 'Use a free dividend stock screener to find high-yield US stocks on NYSE and NASDAQ. Filter by dividend yield, payout ratio, and earnings stability.'
  const slug = 'dividend-stock-screener-guide'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: 'Dividend Stock Screener: How to Find High-Yield US Dividend Stocks', description, url: canonicalUrl, datePublished: '2026-06-03', author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN }, publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` }, { '@type': 'ListItem', position: 3, name: 'Dividend Stock Screener Guide', item: canonicalUrl }] },
  ]
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">Dividend Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Income Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Dividend Stock Screener: How to Find High-Yield US Dividend Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 6 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Dividend investing is one of the most reliable ways to build passive income from stocks. A dividend stock screener helps you systematically find US companies that pay consistent, growing dividends — without manually checking thousands of stocks.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Filters for Dividend Stock Screening</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Dividend Yield &gt; 2%</strong> — Minimum threshold for meaningful income</li>
      <li><strong>Payout Ratio &lt; 70%</strong> — Ensures dividends are sustainable from earnings</li>
      <li><strong>ROE &gt; 10%</strong> — Companies with strong returns can sustain payouts</li>
      <li><strong>Debt/Equity &lt; 1.0</strong> — Low debt keeps dividend payments safer</li>
      <li><strong>EPS Growth &gt; 0</strong> — Growing earnings support growing dividends</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Screen for Dividend Stocks on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Open the <a href="/screener" style="color:#2dd4bf;font-weight:600">free screener</a> and set these filters: Dividend Yield &gt;= 2, Debt/Equity &lt;= 1, ROE &gt;= 10. Sort by Dividend Yield descending to find the highest-yielding qualifying stocks at the top.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">You can also use the pre-built <a href="/screens/dividend-stocks" style="color:#2dd4bf;font-weight:600">Dividend Stocks screen</a> and <a href="/screens/low-debt-dividend-stocks" style="color:#2dd4bf;font-weight:600">Low Debt Dividend Stocks screen</a> for instant results.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">High Yield vs. Dividend Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">High yield stocks pay more income now but may grow slower. Dividend growth stocks — companies raising dividends every year — may yield less initially but compound income over time. The best dividend stock screener lets you filter for both approaches. Try setting EPS Growth &gt; 10% alongside a moderate yield to find growth-oriented dividend payers.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Dividend Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ US stocks by dividend yield, payout ratio, ROE and more.</p>
      <a href="/screens/dividend-stocks" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">View Dividend Stocks Screen →</a>
    </div>
  </main>`
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'dividend stock screener, high yield stocks, dividend investing, free dividend screener, US dividend stocks', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
