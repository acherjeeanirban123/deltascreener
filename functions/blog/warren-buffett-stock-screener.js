import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Warren Buffett Stock Screener: How to Find Buffett-Style Stocks | DeltaScreener'
  const description = 'Screen for Warren Buffett-style stocks using ROE, low debt, and consistent earnings growth. Find quality US stocks the Buffett way — free on DeltaScreener.'
  const slug = 'warren-buffett-stock-screener'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Warren Buffett Stock Screener: How to Find Buffett-Style Stocks',
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
        { '@type': 'Question', name: 'What metrics does Warren Buffett look for in stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Warren Buffett looks for high ROE (above 15%), low debt, consistent earnings growth over 10 years, high net margins, and a durable competitive advantage (moat). He also prefers businesses he can understand.' } },
        { '@type': 'Question', name: 'How do you screen for Buffett-style stocks?', acceptedAnswer: { '@type': 'Answer', text: 'Use ROE > 15%, Debt/Equity < 0.5, Net Margin > 15%, and consistent EPS growth over 5–10 years as your core filters. These criteria narrow down to the kind of quality businesses Buffett favors.' } },
        { '@type': 'Question', name: 'What P/E ratio does Warren Buffett prefer?', acceptedAnswer: { '@type': 'Answer', text: 'Buffett does not focus on P/E ratios alone. He is willing to pay fair prices for wonderful companies rather than bargain prices for mediocre ones. That said, he avoids stocks with sky-high valuations disconnected from earnings power.' } },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Warren Buffett Stock Screener', item: canonicalUrl },
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
        <li style="color:#d1d5db">Warren Buffett Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Warren Buffett Stock Screener: How to Find Buffett-Style Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 · 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Warren Buffett's investing philosophy can be distilled into a few key principles: buy wonderful businesses at fair prices, hold for the long term, and never lose money. His focus on Return on Equity, low debt, consistent earnings, and durable competitive advantages (moats) can be quantified and screened for — which is exactly what this guide shows you how to do.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Buffett's Core Stock Criteria</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the key quantitative metrics that align with Buffett's investment approach:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>ROE &gt; 15% consistently</strong> — Buffett wants companies that earn strong returns on shareholder equity year after year. One good year isn't enough; he looks for 5–10 years of high ROE.</li>
      <li><strong>Low debt (D/E &lt; 0.5)</strong> — Buffett avoids highly leveraged companies. Low debt means the company doesn't need to borrow to grow.</li>
      <li><strong>Net Margin &gt; 15%</strong> — Wide profit margins signal a moat — pricing power that competitors can't easily erode.</li>
      <li><strong>Consistent EPS growth</strong> — Earnings growing steadily over a decade shows the business compound value reliably.</li>
      <li><strong>High Return on Assets (ROA &gt; 8%)</strong> — Efficient use of assets is a Buffett hallmark.</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Why 10-Year Financials Are Essential</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Buffett always looks at multi-year track records. A single year of high ROE or strong margins could be a one-off event. DeltaScreener shows 10 years of annual financial data for every stock — so you can see whether a company's quality metrics are consistent or just a recent blip. This is exactly the kind of analysis Buffett's team does before buying.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">For a broader guide on finding undervalued quality businesses, see our article on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find undervalued stocks</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Buffett-Style Screens on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Use these <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> pre-built screens as a starting point for Buffett-style stock picking:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">— ROE &gt; 18%, the first Buffett filter</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">— D/E &lt; 0.5, businesses that don't need leverage to grow</span></a>
      <a href="/screens/high-net-margin-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High Net Margin Stocks</strong> <span style="color:#6b7280;font-size:14px">— Wide margins signal the moat Buffett looks for</span></a>
      <a href="/screens/low-debt-dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">— Quality dividend payers with healthy balance sheets</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Qualitative Factors Buffett Looks For</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Numbers only go so far. Buffett also considers:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Durable competitive advantage</strong> — Brand, network effects, switching costs, or cost advantages that protect the business</li>
      <li><strong>Understandable business model</strong> — If you can't explain how the company makes money in one sentence, Buffett would likely pass</li>
      <li><strong>Honest, capable management</strong> — Look at capital allocation history; do they buy back stock wisely or dilute shareholders?</li>
      <li><strong>Long runway for growth</strong> — Is the market large enough for the company to keep reinvesting at high returns for years?</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What metrics does Buffett look for?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">High ROE (&gt;15%), low debt (D/E &lt;0.5), wide net margins (&gt;15%), consistent earnings growth over 10 years, and a durable competitive advantage.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for Buffett-style stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Set ROE &gt; 15%, D/E &lt; 0.5, net margin &gt; 15% on DeltaScreener and review the 10-year financial history to confirm consistency.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Does Buffett care about P/E ratio?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Not primarily. He focuses on intrinsic value vs price. He'd rather pay 25x for a wonderful business than 10x for a mediocre one.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen for Buffett-Style Stocks Free →</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ NYSE & NASDAQ stocks by ROE, debt, margins and 10-year earnings history. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
    </div>
  </main>`

  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: 'warren buffett stock screener, buffett style stocks, how to find buffett stocks, ROE stock screener, quality stock screener free', jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  })
}
