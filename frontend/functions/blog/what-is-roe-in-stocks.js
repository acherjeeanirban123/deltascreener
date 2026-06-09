// v20260530-1
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'What Is ROE in Stocks? Why Return on Equity Matters for Investors | DeltaScreener'
  const description = 'Return on equity (ROE) measures how efficiently a company uses shareholder capital to generate profit. Learn what counts as a good ROE and how to use it to screen stocks.'
  const slug = 'what-is-roe-in-stocks'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'What Is ROE in Stocks? Why Return on Equity Matters for Investors',
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
        { '@type': 'ListItem', position: 3, name: 'What Is ROE in Stocks?', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good ROE for a stock?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A ROE of 15% or higher is generally considered good for most industries. The US market average across all sectors was about 17% as of early 2026. However, "good" varies by sector — capital-light businesses like software typically run 25–40%+ ROE, while capital-intensive industries like utilities or auto manufacturers often fall in the 10–15% range.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can ROE be misleading?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. A company can boost its ROE by taking on more debt, which reduces the equity base in the denominator without necessarily improving business quality. That is why it is important to look at ROE alongside the debt-to-equity ratio. A high ROE combined with low debt is a much stronger signal than high ROE with heavy leverage.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is ROE calculated?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ROE is calculated by dividing net income by average shareholders\' equity, then expressing the result as a percentage. For example, if a company earns $200 million in net income and has $1 billion in equity, its ROE is 20%.',
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
          <li aria-current="page" style="color:#374151">What Is ROE?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">What Is ROE in Stocks? Why Return on Equity Matters for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">Return on equity (ROE) is one of the most widely used metrics for measuring how efficiently a company converts shareholder capital into profit. For investors learning to screen stocks, understanding ROE can help separate capital-efficient businesses from those that consume resources without generating proportionate returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How ROE Is Calculated</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Return on equity is calculated by dividing a company's net income by its average shareholders' equity, then expressing the result as a percentage:</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 20px;border:1px solid #e2e8f0;font-family:monospace;font-size:15px;color:#1e293b">
        ROE = Net Income ÷ Average Shareholders' Equity × 100
      </div>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">For example: a company that earns $300 million in net income with $1.5 billion in equity has an ROE of 20%. That means for every dollar shareholders have invested, the company generated 20 cents of profit over the year.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Analysts sometimes use <em>average</em> equity (beginning plus ending, divided by two) rather than ending equity alone, to smooth out fluctuations during the year. Most financial data providers and screeners, including DeltaScreener, use trailing twelve-month figures.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">What Is a Good ROE?</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">As of January 2026, the average ROE across all US-listed companies tracked in the Damodaran dataset was <strong>17.2%</strong>. That figure gives a useful baseline, but the answer varies substantially by sector:</p>
      <ul style="margin:0 0 20px;padding-left:22px;color:#374151;font-size:15px;line-height:2">
        <li><strong>Software (System &amp; Application):</strong> ~30% average ROE — capital-light business models allow high returns on equity</li>
        <li><strong>Semiconductors:</strong> ~31% — strong intellectual property and recurring demand from tech supply chains</li>
        <li><strong>Financial Services (non-bank):</strong> ~29% — leverage-driven businesses can achieve high ROE even with thin margins</li>
        <li><strong>Utilities:</strong> ~10% — regulated, capital-intensive operations structurally constrain returns</li>
        <li><strong>Auto manufacturers:</strong> ~3% — thin margins and heavy asset bases keep ROE low even in strong years</li>
      </ul>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">A common rule of thumb: ROE above 15% signals a reasonably capital-efficient business in most sectors. Anything consistently above 20% is a high bar that relatively few companies sustain over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Why ROE Can Be Misleading — and How to Adjust for It</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">ROE has one well-known flaw: it can be inflated by debt. Because equity = assets minus liabilities, a company that borrows heavily has a smaller equity base — which makes its ROE look higher even if its actual profitability hasn't improved.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Consider two companies each earning $100 million in net income. Company A has $500 million in equity (ROE: 20%). Company B has $200 million in equity because it borrowed aggressively (ROE: 50%). Company B's ROE looks impressive, but its balance sheet carries more risk.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">The practical fix: always look at ROE alongside the <strong>debt-to-equity ratio</strong>. A stock with 25% ROE and debt-to-equity below 1 is a materially different proposition than one with 25% ROE and debt-to-equity of 4. The DuPont framework expands ROE into three components — net margin, asset turnover, and financial leverage — giving a clearer view of where the return is actually coming from.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Return on assets (ROA) is another useful cross-check. Unlike ROE, ROA is not affected by capital structure, so a company with high ROE and high ROA simultaneously is typically generating genuine operating efficiency rather than leveraged returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How to Use DeltaScreener to Find High-ROE Stocks</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">The fastest way to apply these ideas is to run a pre-built screen. You can <a href="/stocks/high-roe-stocks" style="color:#0f766e;text-decoration:none;font-weight:600">screen for high ROE stocks on DeltaScreener</a> — the page shows US stocks with ROE of at least 18%, positive price-to-book, and debt-to-equity below 3, updated automatically.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">If you want to go deeper, the interactive screener lets you combine ROE with any other metric — for example, filtering for ROE above 20%, ROA above 10%, and net margin above 15% gives a much tighter list of companies with broad-based profitability rather than leverage-driven returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Frequently Asked Questions</h2>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">What is a good ROE for a stock?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">A ROE of 15% or higher is generally considered good for most industries. The US market average across all sectors was about 17% as of early 2026. However, "good" varies by sector — capital-light businesses like software typically run 25–40%+ ROE, while capital-intensive industries like utilities or auto manufacturers often fall in the 10–15% range.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Can ROE be misleading?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">Yes. A company can boost its ROE by taking on more debt, which reduces the equity base in the denominator without necessarily improving business quality. That is why it is important to look at ROE alongside the debt-to-equity ratio. A high ROE combined with low debt is a much stronger signal than high ROE with heavy leverage.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">How is ROE calculated?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">ROE is calculated by dividing net income by average shareholders' equity, then expressing the result as a percentage. For example, if a company earns $200 million in net income and has $1 billion in equity, its ROE is 20%.</p>
      </div>

      <p style="font-size:15px;line-height:1.75;color:#374151;margin:32px 0 0">ROE is a useful starting filter but works best as part of a broader checklist. Pair it with ROA, net margin, and debt metrics to get a fuller picture of whether a company's quality is genuine. Explore all these filters together on the <a href="/screener" style="color:#0f766e;text-decoration:none;font-weight:600">DeltaScreener free screener</a>.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROE stocks with live data — filter by ROE, debt-to-equity, ROA, and more. Free, no sign-up required.</p>
        <a href="/stocks/high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View High ROE Stocks →</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#fff;color:#0f766e;text-decoration:none;font-weight:800;font-size:14px;border:1.5px solid #0f766e">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'what is ROE in stocks, return on equity, good ROE, ROE stock screener, high ROE stocks, return on equity explained',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
