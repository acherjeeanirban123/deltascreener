// v20260623-minimal4
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Combining ROE and Debt Filters: A Smarter Stock Screening Strategy | DeltaScreener'
  const description = 'Learn how combining ROE and debt-to-equity filters narrows thousands of US stocks to a focused list of quality companies. Step-by-step stock screening strategy guide.'
  const slug = 'roe-and-debt-screening-strategy'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Combining ROE and Debt Filters: A Smarter Stock Screening Strategy',
      description,
      url: canonicalUrl,
      datePublished: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'ROE and Debt Screening Strategy', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good ROE threshold for stock screening?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most investors look for ROE above 15% as a starting point. ROE above 20% is generally considered strong. However, thresholds vary by sector — capital-light technology companies often achieve ROE of 30%+ while utilities and banks operate at lower levels. Always compare ROE within the same industry.',
          },
        },
        {
          '@type': 'Question',
          name: 'What debt-to-equity ratio is safe when screening stocks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A debt-to-equity ratio below 1.0 is considered conservative for most non-financial sectors. Many quality-focused screeners use 0.5 or lower as a filter. Again, context matters — some industries like utilities carry higher structural debt that should not automatically disqualify a company.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I combine ROE and debt-to-equity filters for free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. DeltaScreener lets you filter US stocks by ROE, debt-to-equity, net margin, and dozens of other criteria for free with no sign-up required at deltascreener.com/screener.',
          },
        },
      ],
    },
  ]

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">ROE &amp; Debt Screening Strategy</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Screening Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Combining ROE and Debt Filters: A Smarter Stock Screening Strategy</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.8;color:#1f2937;margin:0 0 24px">There are over 6,000 publicly traded companies in the US market. Running a single filter narrows that list — but combining two complementary metrics like <strong>Return on Equity (ROE)</strong> and <strong>debt-to-equity ratio</strong> turns a broad universe into a focused watchlist of genuinely strong businesses. This guide walks through exactly how to do it, and why the combination works so well together.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Why Use Two Filters Instead of One?</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A single metric can mislead. A company with an outstanding ROE of 40% might look like a dream investment — until you discover it's achieved by loading up on debt. Leverage amplifies returns on equity mathematically, but it also amplifies risk. A company borrowing heavily to manufacture earnings growth is a fundamentally different (and riskier) proposition than one achieving the same ROE through genuine operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Conversely, a company with a pristine balance sheet and near-zero debt might score low on ROE simply because it holds large cash reserves it hasn't deployed yet. No single number tells the full story.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Pairing ROE with a debt filter addresses this directly. When a company achieves high ROE <em>and</em> maintains low leverage, there's a much higher probability the profitability is real, sustainable, and not borrowed against future risk.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Setting the Right Thresholds</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">There's no universal right answer, but here's a practical starting framework for US equities:</p>
      <ul style="font-size:16px;line-height:1.9;color:#374151;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE ≥ 15%</strong> — Filters out companies that are destroying or barely earning their cost of equity. For a tighter screen, raise this to 20%.</li>
        <li style="margin-bottom:8px"><strong>Debt-to-Equity ≤ 1.0</strong> — Keeps companies where total debt doesn't exceed shareholder equity. For a conservative screen, use 0.5 or lower.</li>
        <li style="margin-bottom:8px"><strong>Market cap ≥ $500M</strong> — Optional, but helps exclude micro-caps with limited liquidity or data reliability.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">With these three inputs applied to the full US market, you'll typically move from 6,000+ stocks to somewhere between 150 and 400 candidates — a manageable list for deeper research. With the S&P 500 currently trading at a P/E ratio of around 25.6 (as of June 2026), disciplined screening on fundamentals matters more than ever for investors trying to find reasonably valued quality companies.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Sector Context: Don't Screen Blind</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Screening thresholds should be calibrated to the sector you're looking at. Capital-light software and consumer brands can deliver ROE well above 30% with minimal debt. Heavy-capital industries like utilities, telecommunications, and infrastructure typically carry higher debt loads structurally — comparing them on a flat 0.5 D/E filter would exclude most of the sector regardless of quality.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A practical approach: run your broad ROE + D/E screen first, then look at results by sector. If you notice a sector is entirely absent, consider whether your threshold is appropriate for that industry's typical capital structure — or whether that sector is genuinely avoiding your criteria for the wrong reasons.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Technology and healthcare tend to pass strict ROE + low-debt screens in relatively high numbers. Financials are a special case where debt-to-equity comparisons don't translate well — banks use leverage as a core business mechanic, not just a capital structure choice.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Adding a Third Filter: Net Margin</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Once you're comfortable with the two-filter approach, adding net margin as a third input meaningfully improves result quality. Net margin measures how much of each dollar of revenue a company actually retains as profit after all costs — it's a direct measure of operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A three-filter screen combining:</p>
      <ul style="font-size:16px;line-height:1.9;color:#374151;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE ≥ 15%</strong></li>
        <li style="margin-bottom:8px"><strong>D/E ≤ 1.0</strong></li>
        <li style="margin-bottom:8px"><strong>Net margin ≥ 10%</strong></li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">…produces a list where profitability is confirmed at multiple levels: at the equity level (ROE), at the balance sheet level (D/E), and at the revenue level (net margin). Companies passing all three tend to be durable businesses with real competitive advantages — not one-time earners or firms temporarily inflated by financial engineering.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">This is exactly the type of multi-factor screen you can run on DeltaScreener. You can <a href="/screener" style="color:#2563eb;text-decoration:none;font-weight:600">screen for high ROE, low debt stocks on DeltaScreener</a> with all three filters in seconds — free, no sign-up required.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">FAQ</h2>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">What is a good ROE threshold for stock screening?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">Most investors look for ROE above 15% as a starting point. ROE above 20% is generally considered strong. However, thresholds vary by sector — capital-light technology companies often achieve ROE of 30%+ while utilities and banks operate at lower levels. Always compare ROE within the same industry.</p>
      </div>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">What debt-to-equity ratio is safe when screening stocks?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">A debt-to-equity ratio below 1.0 is considered conservative for most non-financial sectors. Many quality-focused screeners use 0.5 or lower as a filter. Context matters — some industries like utilities carry higher structural debt that should not automatically disqualify a company.</p>
      </div>

      <div style="margin-bottom:40px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">Can I combine ROE and debt-to-equity filters for free?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">Yes. DeltaScreener lets you filter US stocks by ROE, debt-to-equity, net margin, and dozens of other criteria for free with no sign-up required.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Screening is not a replacement for analysis — it's the front door to it. A well-constructed multi-factor screen cuts the universe down to a set of candidates worth spending time on. Start with ROE and debt, refine with margin, and you'll have a process that surfaces quality businesses consistently. <a href="/screener" style="color:#2563eb;text-decoration:none;font-weight:600">Open the free DeltaScreener screener</a> to apply these filters yourself.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high ROE, low debt US stocks — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'stock screening strategy, ROE filter stocks, debt to equity stock screen, combine ROE debt screening, high ROE low debt stocks, stock screener filters guide',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
