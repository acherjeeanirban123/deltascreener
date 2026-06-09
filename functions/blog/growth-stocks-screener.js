import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Growth Stocks Screener: How to Find High-Growth US Stocks | DeltaScreener'
  const description = 'Learn how to screen for growth stocks using EPS growth, revenue growth, and ROE filters. Find high-growth NYSE and NASDAQ stocks free on DeltaScreener.'
  const slug = 'growth-stocks-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Growth Stocks Screener: How to Find High-Growth US Stocks',
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
        { '@type': 'Question', name: 'How do you screen for growth stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Screen for growth stocks using EPS growth > 15%, revenue growth > 10%, and ROE > 15%. Also look for expanding margins and low debt to ensure growth is sustainable.' } },
        { '@type': 'Question', name: 'What is a good EPS growth rate for growth stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Most growth investors look for EPS growth of at least 15–20% per year. Stocks with 25%+ EPS growth are considered high-growth but also command higher valuations.' } },
        { '@type': 'Question', name: 'Is there a free growth stock screener?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. DeltaScreener is a free growth stock screener that lets you filter by EPS growth, revenue growth, ROE and more across 5,000+ NYSE and NASDAQ stocks with no sign-up.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Growth Stocks Screener', item: canonicalUrl },
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
        <li style="color:#d1d5db">Growth Stocks Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Growth Stocks Screener: How to Find High-Growth US Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 6 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Growth investing is about finding companies that are expanding faster than the market — and buying them before the crowd catches on. The challenge is separating genuine high-growth businesses from hype. A good growth stocks screener does the heavy lifting by filtering thousands of companies down to those with real, measurable growth in earnings and revenue.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Filters for Screening Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the most important metrics to use when screening for growth stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>EPS Growth &gt; 15%</strong> — Earnings per share growing consistently is the clearest signal of a quality growth company</li>
      <li><strong>Revenue Growth &gt; 10%</strong> — Top-line growth shows the business is expanding, not just cutting costs</li>
      <li><strong>ROE &gt; 15%</strong> — Return on equity above 15% shows management is reinvesting capital productively</li>
      <li><strong>Net Margin expanding</strong> — Margins improving over time indicates the business has pricing power</li>
      <li><strong>Low or manageable debt</strong> — High debt can cripple a growth company if growth slows; look for D/E &lt; 1.0</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Growth vs Value: What's the Difference?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Growth stocks typically trade at higher P/E ratios than value stocks because investors pay a premium for future earnings. A stock with a P/E of 30–50x isn't necessarily overvalued if it's growing earnings at 25%+ annually. The PEG ratio (P/E divided by EPS growth rate) is a useful check — a PEG below 1.0 suggests a growth stock may be undervalued relative to its growth rate.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">If you also want to find undervalued stocks, see our guide on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find undervalued stocks using a screener</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener to Find Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px"><a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> lets you filter 5,000+ NYSE and NASDAQ stocks by EPS growth, revenue growth, ROE, and more — completely free, no account needed. Try these ready-made screens:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— Companies with ROE &gt; 18%, a hallmark of quality growth businesses</span></a>
      <a href="/screens/high-net-margin-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High Net Margin Stocks</strong> <span style="color:#6b7280;font-size:14px">— Companies with strong pricing power and expanding margins</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong> <span style="color:#6b7280;font-size:14px">— Tech growth stocks at reasonable valuations</span></a>
      <a href="/screens/nasdaq-high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">NASDAQ High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— High-quality growth names on the NASDAQ</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">10-Year Financials: Why History Matters</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">DeltaScreener shows 10 years of annual financial data for every stock. This matters for growth investing because a company with two years of strong earnings growth could be a cyclical rebound — not a true compounder. Seeing 7–10 years of consistent growth in EPS and revenue is a much stronger signal. Click any ticker in the screener to see the full financial history.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do you screen for growth stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Use EPS growth &gt; 15%, revenue growth &gt; 10%, and ROE &gt; 15% as your starting filters. Add a debt/equity check to ensure the growth is sustainable, not debt-fueled.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What EPS growth rate is good for growth stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">15–20% annual EPS growth is a solid baseline. Stocks growing earnings at 25%+ are considered high-growth, though they often trade at premium valuations.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Is there a free growth stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes — DeltaScreener is free with no sign-up required. Filter 5,000+ US stocks by growth metrics instantly.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Growth Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ NYSE & NASDAQ stocks by EPS growth, revenue growth, ROE and more. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'growth stocks screener, screen for growth stocks, high growth US stocks, EPS growth stock filter, best growth stock screener free', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
