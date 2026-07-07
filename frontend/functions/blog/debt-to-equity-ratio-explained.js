// v20260601-1
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers | DeltaScreener'
  const description = 'Learn what the debt-to-equity ratio is, what counts as a good D/E ratio by industry, and how to use it to screen for financially healthy stocks — free on DeltaScreener.'
  const slug = 'debt-to-equity-ratio-explained'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers',
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
        { '@type': 'ListItem', position: 3, name: 'Debt-to-Equity Ratio Explained', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good debt-to-equity ratio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A D/E ratio below 1.0 is generally considered conservative and low-risk. Between 1.0 and 2.0 is acceptable for most industries. Above 2.0 warrants closer scrutiny, though capital-intensive sectors like utilities routinely carry higher ratios. The S&P 500 average D/E ratio was 0.61 as of Q4 2024.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does a high debt-to-equity ratio mean a stock is bad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Not necessarily. Context matters enormously. A utility company with a D/E of 2.5 is operating normally for its sector; a software firm with the same ratio would raise red flags. Always compare D/E ratios within the same industry and check whether the company generates enough cash flow to service its debt comfortably.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I find stocks with low debt-to-equity ratios?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You can screen for low-debt stocks using DeltaScreener\'s free screener at deltascreener.com/screener. Set a maximum D/E filter and combine it with profitability metrics like ROE or net margin to find financially strong companies.',
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
          <li aria-current="page" style="color:#374151">Debt-to-Equity Ratio</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Balance Sheet</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">The debt-to-equity ratio (D/E ratio) is one of the most important metrics on a company's balance sheet — yet many investors skip it in favor of flashier growth numbers. In an environment where corporate bankruptcies rose 14% year-over-year in Q1 2026, understanding how much debt a company carries relative to its equity could be the difference between a solid investment and a costly mistake.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">What Is the Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The debt-to-equity ratio compares a company's total liabilities to its shareholders' equity. The formula is straightforward:</p>
      <div style="background:#f3f4f6;border-radius:12px;padding:16px 20px;font-family:monospace;font-size:15px;color:#1f2937;margin:0 0 20px">D/E Ratio = Total Liabilities ÷ Shareholders' Equity</div>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">If a company has $500 million in total debt and $250 million in shareholder equity, its D/E ratio is 2.0 — meaning it owes $2 for every $1 of equity owned by shareholders. The higher the ratio, the more leveraged the company is, and the more sensitive it is to economic downturns, rising interest rates, or a slowdown in revenue.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The ratio appears in a company's balance sheet, which is published quarterly in SEC filings and summarized on most financial data platforms.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">What Is a Good Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">There is no single "good" D/E ratio that applies to every company, because different industries operate with fundamentally different capital structures. That said, there are useful benchmarks to keep in mind.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The S&P 500 average D/E ratio stood at <strong>0.61 as of Q4 2024</strong>, which is a reasonable anchor for large-cap US stocks. In general:</p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 1.0</strong> — Conservative. The company finances more of its operations with equity than debt. Often a sign of financial strength, particularly for technology, healthcare, and consumer discretionary companies.</li>
        <li style="margin-bottom:8px"><strong>1.0 to 2.0</strong> — Moderate. Acceptable for most industries. The company uses leverage, but not excessively. Warrants checking interest coverage to ensure cash flows cover debt payments.</li>
        <li style="margin-bottom:8px"><strong>Above 2.0</strong> — Elevated. Red flags in most sectors, though utilities, REITs, and telecoms routinely carry ratios of 2.5 or higher because their cash flows are predictable and stable.</li>
        <li style="margin-bottom:8px"><strong>Above 4.0</strong> — High risk. The company is predominantly financed by creditors. Requires exceptional and consistent cash generation to justify the leverage.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The key rule: <strong>always compare within the same industry</strong>. A software company with a D/E of 0.3 is unremarkable; the same ratio at a utility would suggest it is extremely underleveraged for its sector.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">Why Rising Rates Make D/E Ratio More Important</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">When interest rates rise, companies with heavy debt loads face a double hit: existing variable-rate debt becomes more expensive, and refinancing maturing debt costs more. This is precisely why corporate bankruptcy filings climbed to a 14-year high in 2024, and why Q1 2026 saw filings up 14% year-over-year. Elevated D/E ratios that looked manageable in a low-rate environment can become unsustainable when rates stay high for longer.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">For stock pickers, this means D/E ratio is not just a balance sheet checkbox — it is a forward-looking risk signal. A company with D/E of 3.0 may trade at an attractive P/E multiple precisely because the market is pricing in bankruptcy risk. That discount is not always a buying opportunity.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Two useful metrics to pair with D/E are the <strong>interest coverage ratio</strong> (EBIT divided by interest expense — above 3x is generally safe) and <strong>free cash flow</strong>. A company with high debt but strong, consistent free cash flow is in a very different position from one that is cash-flow negative.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">How to Screen for Low-Debt Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">You can <a href="/stocks/low-debt-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">screen for low debt-to-equity stocks on DeltaScreener</a> using the balance sheet filters in the free screener. A simple, effective starting screen might look like this:</p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">Debt/Equity &lt; 0.5</li>
        <li style="margin-bottom:8px">ROE &gt; 12%</li>
        <li style="margin-bottom:8px">Net Margin &gt; 8%</li>
        <li style="margin-bottom:8px">Market Cap &gt; $500M</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">This combination targets companies that are both financially conservative <em>and</em> profitable — not just companies that happen to have no debt because they cannot borrow. Adding a sector filter lets you compare only within your chosen industry, making the D/E signal much more meaningful.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">No sign-up required. You can run and save screens instantly on the <a href="/screener" style="color:#2563eb;font-weight:600;text-decoration:none">DeltaScreener free screener</a>.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">Frequently Asked Questions</h2>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">What is a good debt-to-equity ratio?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">A D/E ratio below 1.0 is generally considered conservative and low-risk. Between 1.0 and 2.0 is acceptable for most industries. Above 2.0 warrants closer scrutiny, though capital-intensive sectors like utilities routinely carry higher ratios. The S&P 500 average D/E ratio was 0.61 as of Q4 2024.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">Does a high debt-to-equity ratio mean a stock is bad?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Not necessarily. Context matters enormously. A utility company with a D/E of 2.5 is operating normally for its sector; a software firm with the same ratio would raise red flags. Always compare D/E ratios within the same industry and check whether the company generates enough cash flow to service its debt comfortably.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:40px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">How do I find stocks with low debt-to-equity ratios?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Use DeltaScreener's free screener at deltascreener.com/screener. Set a maximum D/E filter and combine it with profitability metrics like ROE or net margin to find financially strong companies.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt stocks using the exact filters described above — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'debt to equity ratio, D/E ratio, balance sheet investing, low debt stocks, financial health stocks, stock screening',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
