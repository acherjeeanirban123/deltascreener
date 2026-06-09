import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'High ROE, Low Debt Stocks: The Quality Combination That Matters | DeltaScreener'
  const description = 'Learn why combining high return on equity with low debt reveals truly exceptional businesses — and how to screen for these quality stocks free on DeltaScreener.'
  const slug = 'high-roe-low-debt-stocks'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'High ROE, Low Debt Stocks: The Quality Combination That Matters',
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
        { '@type': 'ListItem', position: 3, name: 'High ROE Low Debt Stocks', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What ROE is considered high?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most analysts consider ROE above 15% solid, and above 20% excellent. The long-run median for S&P 500 companies sits around 13–15%, so a sustained ROE above 20% without heavy debt signals a genuinely competitive business.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why does debt inflate ROE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ROE is net income divided by shareholders\' equity. When a company takes on debt, equity shrinks relative to assets, so the same earnings produce a higher ROE number. A company with a 30% ROE but a debt-to-equity ratio of 3× is far riskier than one earning 20% ROE with no debt.',
          },
        },
        {
          '@type': 'Question',
          name: 'What debt-to-equity ratio should I pair with ROE screening?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A debt-to-equity ratio below 0.5 is a common conservative threshold. For capital-light businesses like software or consumer brands, even below 0.3 is reasonable. Avoid using a single threshold for capital-intensive sectors like utilities or real estate, where moderate debt is structural.',
          },
        },
      ],
    },
  ]

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#0f766e;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">High ROE, Low Debt Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Stock Investing · Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">High ROE, Low Debt Stocks: The Quality Combination That Matters</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">Return on equity (ROE) is one of the most-cited quality metrics in stock analysis — but used alone, it can mislead you. A high ROE that's built on a mountain of debt is fundamentally different from a high ROE earned through genuine business efficiency. Pairing ROE with a low debt filter is one of the cleanest ways to find companies that are truly exceptional rather than just financially engineered.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">Why ROE Alone Can Deceive You</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">ROE is calculated as net income divided by shareholders' equity. The formula is simple, but the math creates a trap: equity is what's left after you subtract liabilities from assets. A company that loads up on debt shrinks its equity base, which automatically pushes the ROE figure higher — even if actual profitability hasn't changed at all.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Consider two hypothetical companies, each earning $10 million in net income. Company A has $50 million in equity and no debt — ROE of 20%. Company B has $50 million in assets but $30 million in debt, leaving only $20 million in equity — ROE of 50%. On a raw screen, Company B looks dramatically better. But Company B carries three times the leverage and is far more vulnerable to a downturn, rising interest rates, or a disruption in its business model.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">This is why investors like Warren Buffett specifically look for companies that sustain high ROE <em>without</em> needing significant debt to do it. The S&P 500's long-run median ROE sits around 13–15%. A company that consistently earns 20%+ ROE with a debt-to-equity ratio below 0.5 is genuinely rare — and genuinely valuable.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">What the Combination Tells You About a Business</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">When a company earns a high ROE without borrowing heavily, it signals several things at once. First, the business has strong pricing power or cost efficiency — it's generating outsized profit relative to the capital its owners have put in. Second, management doesn't need to lever up the balance sheet to hit attractive return metrics. Third, the company has room to absorb shocks: it can service less debt, retain more earnings, or return capital to shareholders.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">These characteristics tend to cluster in specific types of businesses. Consumer brands with loyal customers and minimal capital requirements often show this profile — think companies with strong intellectual property, recurring revenue, or dominant market positions in niche categories. Capital-light technology and software businesses frequently exhibit it too, as do certain specialty industrials that have carved out defensible niches.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">By contrast, capital-intensive industries — utilities, steel, shipping, real estate — structurally require debt to fund their asset bases. For these sectors, applying a strict low-debt filter will screen out almost every company, including perfectly well-run ones. The high-ROE, low-debt combination works best as a filter within sectors where capital efficiency genuinely matters, or as a cross-sector quality signal when evaluated relative to industry norms.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">Practical Thresholds for Screening</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Most serious quality investors use thresholds somewhere in this range:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#374151">
        <li><strong>ROE ≥ 15%</strong> — the minimum bar. Below this, the business is earning roughly what a diversified equity portfolio might return passively.</li>
        <li><strong>ROE ≥ 20%</strong> — the quality bar. Companies consistently above this are genuinely outperforming on equity efficiency.</li>
        <li><strong>Debt-to-equity ≤ 0.5</strong> — a conservative starting point for non-financial sectors. This means debt is less than half of equity — a relatively lean balance sheet.</li>
        <li><strong>Debt-to-equity ≤ 1.0</strong> — a broader cut for sectors with moderate structural debt, like industrials or healthcare.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Consistency matters as much as the current number. A company that earned 25% ROE with low debt for five consecutive years is far more interesting than one that hit 30% once. Look for sustained, multi-year performance rather than a single-year spike that might reflect a one-time event or favorable market conditions.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">It also helps to layer in a minimum profitability filter — net margin above 10%, for instance — to ensure the ROE is driven by real earnings rather than by equity shrinkage from buybacks (another mechanism that can mechanically lift ROE without improving underlying returns).</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">How to Screen for These Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">You can <a href="/stocks/high-roe-stocks" style="color:#0f766e;font-weight:600;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> using the free, no-signup screener. Set the ROE filter to 20% or higher, then add a debt-to-equity filter at 0.5 or below. This combination will typically surface a focused list of 30–80 US stocks depending on market conditions — far more actionable than the thousands of names that pass a single-metric filter.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">From there, consider adding a market cap minimum (to filter out micro-caps with potentially volatile metrics) and sorting by ROE descending to see the strongest performers at the top. The results give you a starting universe for deeper research — not a buy list, but a curated shortlist of businesses that have demonstrated genuine capital efficiency without financial leverage distortion.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">FAQ</h2>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">What ROE is considered high?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">Most analysts consider ROE above 15% solid, and above 20% excellent. The long-run median for S&P 500 companies sits around 13–15%, so a sustained ROE above 20% without heavy debt signals a genuinely competitive business.</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">Why does debt inflate ROE?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">ROE is net income divided by shareholders' equity. When a company takes on debt, equity shrinks relative to assets, so the same earnings produce a higher ROE number. A company with a 30% ROE but a debt-to-equity ratio of 3× is far riskier than one earning 20% ROE with no debt at all.</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:40px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">What debt-to-equity ratio should I pair with ROE screening?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">A debt-to-equity ratio below 0.5 is a common conservative threshold. For capital-light businesses like software or consumer brands, even below 0.3 is reasonable. Avoid applying a single threshold to capital-intensive sectors like utilities or real estate, where moderate debt is structural.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 40px">The high-ROE, low-debt filter is one of the most durable quality screens in fundamental investing. It doesn't guarantee outperformance, and it works best as the start of a research process rather than the end of one. But as a first-pass filter for identifying businesses worth studying, it's hard to beat. Explore it further with the <a href="/screener" style="color:#0f766e;font-weight:600;text-decoration:underline">DeltaScreener free screener</a>.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROE, low-debt stocks free — no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'high ROE low debt stocks, return on equity stock screening, quality stocks filter, ROE debt to equity, stock screener quality',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
