import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'How to Read a Balance Sheet as a Stock Investor | DeltaScreener'
  const description = 'Learn how to read a company balance sheet to evaluate financial health. Understand assets, liabilities, equity, and key ratios — in plain English.'
  const slug = 'how-to-read-a-balance-sheet-stocks'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to Read a Balance Sheet as a Stock Investor',
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
        { '@type': 'ListItem', position: 3, name: 'How to Read a Balance Sheet', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the most important thing to look for on a balance sheet?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Focus on the relationship between total liabilities and shareholders\' equity. A company with far more liabilities than equity carries higher financial risk. Also check current assets vs. current liabilities to assess short-term liquidity — if current liabilities exceed current assets, the company may struggle to meet near-term obligations.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a good debt-to-equity ratio for a stock?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'It depends heavily on the industry. Technology companies often maintain D/E ratios of 0.2–0.6, while utilities with stable cash flows may carry 1.0–2.0. As a general starting point, a D/E ratio below 1.0 signals conservative leverage, while above 2.0 warrants closer scrutiny — especially in cyclical sectors.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can a company have negative shareholders\' equity?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, and it is not always a red flag. Some mature companies with large share buyback programs (like certain S&P 500 consumer staples) show negative book equity because buybacks reduce the equity line. However, negative equity caused by accumulated losses is a serious warning sign and requires investigation.',
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
          <li aria-current="page" style="color:#374151">Balance Sheet Guide</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Read a Balance Sheet as a Stock Investor</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">
        The balance sheet is one of three core financial statements every public company files — and for stock investors, it answers one fundamental question: <strong>does this company own more than it owes?</strong> Learning to read a balance sheet takes less time than most investors expect, and the insights it provides can separate a financially strong stock from a ticking liability bomb.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">The Three Sections: Assets, Liabilities, and Equity</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Every balance sheet is divided into three sections, and they always follow this identity: <strong>Assets = Liabilities + Shareholders' Equity</strong>. If you remember nothing else, remember this equation — it is the foundation of everything.
      </p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:10px"><strong>Assets</strong> are what the company owns or is owed: cash, inventory, property, patents, receivables. They are split into <em>current assets</em> (convertible to cash within 12 months) and <em>non-current assets</em> (long-term holdings like equipment or goodwill).</li>
        <li style="margin-bottom:10px"><strong>Liabilities</strong> are what the company owes: short-term debt, accounts payable, long-term bonds. Like assets, they split into current (due within a year) and non-current.</li>
        <li style="margin-bottom:10px"><strong>Shareholders' Equity</strong> is the residual — what would be left for investors if you subtracted all liabilities from all assets. It includes retained earnings, paid-in capital, and any accumulated losses.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        As of Q4 2025, US corporate bonds outstanding reached $11.5 trillion — a 3.5% year-over-year increase — reflecting how heavily American companies rely on debt financing. That makes balance sheet literacy more valuable than ever for individual investors trying to assess risk.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Key Ratios Derived from the Balance Sheet</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Raw numbers on a balance sheet are hard to interpret in isolation. Ratios give you context:
      </p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:14px"><strong>Debt-to-Equity (D/E) Ratio</strong> — Total debt divided by shareholders' equity. A D/E below 1.0 is generally conservative; above 2.0 signals significant leverage. Industry matters enormously: tech companies typically run D/E ratios of 0.2–0.6, while utilities with predictable cash flows often carry 1.0–2.0 without issue.</li>
        <li style="margin-bottom:14px"><strong>Current Ratio</strong> — Current assets divided by current liabilities. A ratio above 1.5 suggests the company can comfortably cover short-term obligations. Below 1.0 is a warning that the company may struggle to pay upcoming bills.</li>
        <li style="margin-bottom:14px"><strong>Book Value per Share</strong> — Shareholders' equity divided by shares outstanding. Comparing book value to market price gives you the Price-to-Book (P/B) ratio — a popular measure of whether a stock trades at a premium or discount to its net assets.</li>
        <li style="margin-bottom:14px"><strong>Asset Turnover</strong> — Revenue divided by total assets. Higher turnover means the company is efficiently using its asset base to generate sales — useful for comparing capital-intensive businesses.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        No single ratio tells the full story. A company with a high D/E ratio might also generate strong, stable cash flows that easily service its debt. Always read ratios alongside the income statement and cash flow statement.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Red Flags and Green Flags on a Balance Sheet</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Experienced investors train themselves to spot patterns quickly. Here are the most common signals:
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 8px"><strong>Green flags:</strong></p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:8px">Cash and short-term investments growing faster than debt</li>
        <li style="margin-bottom:8px">Retained earnings consistently increasing (profits being reinvested)</li>
        <li style="margin-bottom:8px">Current ratio comfortably above 1.5</li>
        <li style="margin-bottom:8px">Goodwill as a small percentage of total assets (limits impairment risk)</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 8px"><strong>Red flags:</strong></p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:8px">Total liabilities growing significantly faster than total assets</li>
        <li style="margin-bottom:8px">Accumulated deficit (negative retained earnings) with no clear path to profitability</li>
        <li style="margin-bottom:8px">Goodwill exceeding 40–50% of total assets — a risk if acquisitions underperform</li>
        <li style="margin-bottom:8px">Sudden spikes in receivables without a corresponding increase in revenue</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        In 2026, with corporate bond issuance running at a record pace — year-to-date issuance through May reached $1.23 trillion, up 21% year-over-year according to SIFMA data — scrutinizing debt growth on balance sheets is particularly important. Companies loading up on cheap (or not-so-cheap) debt to fund AI infrastructure buildouts may look asset-rich today but carry meaningful refinancing risk.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">How to Screen for Balance Sheet Strength on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        You do not need to manually pull every balance sheet to find financially strong companies. You can <a href="/stocks/low-debt-stocks" style="color:#2563eb;text-decoration:underline">screen for low-debt stocks on DeltaScreener</a> using balance sheet filters — set a maximum debt-to-equity ratio, combine it with a minimum current ratio, and instantly surface companies with conservative leverage profiles.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        For example, filtering for D/E below 0.5 alongside positive retained earnings and a current ratio above 1.5 is a quick way to build a watchlist of financially resilient businesses — the kind of companies that tend to survive recessions and market dislocations better than their more leveraged peers.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Frequently Asked Questions</h2>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">What is the most important thing to look for on a balance sheet?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        Focus on the relationship between total liabilities and shareholders' equity. A company with far more liabilities than equity carries higher financial risk. Also check current assets vs. current liabilities to assess short-term liquidity — if current liabilities exceed current assets, the company may struggle to meet near-term obligations.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">What is a good debt-to-equity ratio for a stock?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        It depends heavily on the industry. Technology companies often maintain D/E ratios of 0.2–0.6, while utilities with stable cash flows may carry 1.0–2.0. As a general starting point, a D/E ratio below 1.0 signals conservative leverage, while above 2.0 warrants closer scrutiny — especially in cyclical sectors.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Can a company have negative shareholders' equity?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        Yes, and it is not always a red flag. Some mature companies with large share buyback programs show negative book equity because buybacks reduce the equity line. However, negative equity caused by accumulated losses is a serious warning sign and requires investigation.
      </p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        The balance sheet is not glamorous — it lacks the drama of earnings surprises or revenue growth headlines — but it is arguably the most honest snapshot of a company's financial reality. Making it a regular part of your stock research, alongside the <a href="/screener" style="color:#2563eb;text-decoration:underline">free DeltaScreener stock screener</a>, will give you an edge in identifying companies built to last.
      </p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt stocks by balance sheet strength — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'how to read a balance sheet, balance sheet investing, debt to equity ratio, current ratio stocks, balance sheet analysis, stock screener',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
