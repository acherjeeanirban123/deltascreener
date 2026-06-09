import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Best Dividend Stock Screening Criteria | DeltaScreener'
  const description = 'Learn the 5 key criteria for screening dividend stocks: yield, payout ratio, debt levels, dividend growth, and free cash flow coverage. Find sustainable income stocks.'
  const slug = 'best-dividend-stock-screening-criteria'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Best Dividend Stock Screening Criteria for Passive Income Investors',
      description,
      url: canonicalUrl,
      datePublished: '2026-05-31',
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'Best Dividend Stock Screening Criteria', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good dividend yield to screen for?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A yield between 2% and 5% is generally a sweet spot for most sectors. The S&P 500 average yield is around 1% as of 2026, so anything meaningfully above that deserves a closer look. Yields above 6–7% can signal dividend risk — always check the payout ratio before trusting a high yield.',
          },
        },
        {
          '@type': 'Question',
          name: 'What payout ratio is safe for dividend stocks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'For most companies, a payout ratio between 40% and 60% is considered healthy. REITs and utilities can sustain 70–80% due to stable cash flows. A ratio consistently above 80–90% is a red flag — it leaves little room for earnings shortfalls.',
          },
        },
        {
          '@type': 'Question',
          name: 'Should I include debt filters when screening for dividend stocks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. High debt is one of the most common reasons dividends get cut. A debt-to-equity ratio under 1.0 is a reasonable starting filter for non-financial, non-utility sectors. Companies with net debt to capital below 50% tend to have more financial flexibility to maintain dividends through economic cycles.',
          },
        },
      ],
    },
  ]

  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Dividend Screening Criteria</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Income Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Best Dividend Stock Screening Criteria for Passive Income Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date('2026-05-31').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 28px">The S&P 500's average dividend yield sits at just 1.05% as of May 2026 — near a multi-decade low. That makes screening for dividend stocks harder, not easier: with so many companies offering thin yields, you need precise criteria to separate sustainable income from yield traps. Here are the five filters that matter most.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">1. Dividend Yield: Target the 2–5% Range</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A yield between 2% and 5% is typically the best starting point. It's meaningfully above the market average without triggering the warning signs that come with very high yields. Stocks yielding 6%, 8%, or more often do so because their share price has fallen — a potential sign that the market expects a dividend cut.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">This doesn't mean high-yield stocks are always bad. Utilities and REITs structurally pay higher dividends. But sector context matters — a 7% yield from a telecom is different from a 7% yield from a mid-cap industrial that cut earnings last quarter.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">2. Payout Ratio: The Most Important Safety Filter</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">The payout ratio tells you what percentage of earnings a company pays out as dividends. A ratio between 40% and 60% is healthy for most sectors — it means the company is sharing profits while retaining enough to reinvest and weather downturns. For utilities and REITs, 70–80% is acceptable given their regulated, stable cash flows.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A payout ratio consistently above 80–90% is a red flag for most businesses. When earnings dip — which they always eventually do — there's no buffer. Companies in this position often face a dividend cut or a painful debt-funded payout that weakens the balance sheet over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">3. Debt-to-Equity: Low Debt Protects Dividends</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">High debt is one of the most common reasons dividends get cut. When interest costs climb or revenue dips, over-leveraged companies prioritize debt service over shareholder distributions. For non-financial, non-utility companies, a debt-to-equity ratio under 1.0 is a reasonable screen. For net-debt-to-capital, under 50% is a widely used threshold.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">This filter is especially important today. Rates have remained elevated compared to the near-zero era of the 2010s, which means the cost of carrying debt is real and ongoing. Companies that were fine with high leverage at 1% rates are under more pressure at 4–5%.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">4. Dividend Growth Rate: Look for 5%+ Annual Increases</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A dividend that doesn't grow is a dividend that loses purchasing power. Inflation compounds over time, and a flat $1 dividend is worth less every year in real terms. Screening for companies with a 5-year dividend growth rate of at least 5% annually filters for businesses that are genuinely growing and have the confidence to return more capital each year.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">Companies with long records of consecutive annual dividend increases — Dividend Aristocrats have 25+ years — offer a different kind of signal. They've maintained payouts through recessions, rate cycles, and sector disruption. That track record isn't a guarantee, but it reflects management discipline that matters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">5. Free Cash Flow Coverage: The Real Dividend Backstop</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">Dividends are paid in cash, not reported earnings. A company can have positive net income and still pay dividends from borrowed money if its free cash flow (FCF) is weak. The most rigorous filter is to check whether dividends are covered by FCF — ideally at a 1.5x or better ratio. This means the company generates $1.50 in free cash flow for every $1 it pays in dividends.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">FCF coverage also tells you about future dividend growth capacity. A company with FCF well above its dividend has room to raise it. One barely covering its payout is in a more precarious position, regardless of what the earnings-based payout ratio shows.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">How to Screen for Dividend Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">You can apply these filters directly on DeltaScreener without signing up. The screener lets you combine yield ranges, payout ratio caps, debt-to-equity limits, and other fundamental filters across US-listed stocks in real time. Start with the <a href="/stocks/low-debt-dividend-stocks" style="color:#2dd4bf;font-weight:600">low debt dividend stocks screen</a> for a pre-built starting point, or build your own combination on the <a href="/screener" style="color:#2dd4bf;font-weight:600">free screener</a>.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 28px">The most durable dividend portfolios combine moderate yield with low debt and consistent cash flow. High yield alone is not a strategy — it's a starting point that needs the rest of these filters to become one.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">Frequently Asked Questions</h2>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What is a good dividend yield to screen for?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">A yield between 2% and 5% is generally a sweet spot for most sectors. The S&P 500 average yield is around 1% as of 2026, so anything meaningfully above that deserves a closer look. Yields above 6–7% can signal dividend risk — always check the payout ratio before trusting a high yield.</p>
      </div>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What payout ratio is safe for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">For most companies, a payout ratio between 40% and 60% is considered healthy. REITs and utilities can sustain 70–80% due to stable cash flows. A ratio consistently above 80–90% is a red flag — it leaves little room for earnings shortfalls.</p>
      </div>

      <div style="margin-bottom:36px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">Should I include debt filters when screening for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Yes. High debt is one of the most common reasons dividends get cut. A debt-to-equity ratio under 1.0 is a reasonable starting filter for non-financial, non-utility sectors. Companies with net debt to capital below 50% tend to have more financial flexibility to maintain dividends through economic cycles.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for low-debt dividend stocks using yield, payout ratio, and debt filters — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'dividend stock screening criteria, best dividend stocks, payout ratio, dividend yield, low debt dividend stocks, passive income stocks, dividend investing 2026',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
