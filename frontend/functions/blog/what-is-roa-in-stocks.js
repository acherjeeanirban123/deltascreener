// v20260602-1
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'What Is ROA in Stocks? Return on Assets Explained for Investors | DeltaScreener'
  const description = 'ROA (Return on Assets) measures how efficiently a company uses its assets to generate profit. Learn what a good ROA is and how to screen for high-ROA stocks.'
  const slug = 'what-is-roa-in-stocks'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'What Is ROA in Stocks? Return on Assets Explained for Investors',
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
        { '@type': 'ListItem', position: 3, name: 'What Is ROA in Stocks?', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is a good ROA for a stock?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A ROA above 5% is generally considered decent, and above 10% is strong. Asset-light businesses like software companies often post ROA of 15–25%, while capital-intensive industries like utilities or manufacturers typically see 1–5%.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is the difference between ROA and ROE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ROE (Return on Equity) measures profit relative to shareholders\' equity, while ROA (Return on Assets) measures profit relative to total assets including debt. ROA is a purer measure of operational efficiency because it is not inflated by financial leverage.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can you compare ROA across different industries?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ROA comparisons are most meaningful within the same industry. A bank with 1% ROA may be excellent, while a software company with the same figure would be considered poor. Always benchmark ROA against sector peers.',
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
          <li aria-current="page" style="color:#374151">What Is ROA?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">What Is ROA in Stocks? Return on Assets Explained for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">
        Return on Assets (ROA) is one of the clearest signals of how well a company actually runs its business. Unlike earnings per share, which can be engineered through buybacks, or ROE, which can be inflated by heavy borrowing, ROA cuts through to a simple question: for every dollar of assets this company controls, how much profit does it produce?
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">How ROA Is Calculated</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        The formula is straightforward:
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin:0 0 20px;font-family:monospace;font-size:15px;color:#111827">
        ROA = Net Income ÷ Total Assets × 100
      </div>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        If a company earns $500 million in net income and has $5 billion in total assets, its ROA is 10%. That 10% tells you the company generates ten cents of profit for every dollar of assets on its balance sheet — factories, inventory, cash, intellectual property, everything included.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Some analysts use operating income instead of net income to strip out the effect of interest expenses. Either version works, as long as you're consistent when comparing companies.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">What Is a Good ROA?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Context matters enormously here. Industries that require massive physical infrastructure — utilities, steel mills, airlines — will naturally have lower ROA because their asset base is enormous relative to their profits. A utility running at 2–3% ROA may be doing perfectly well. A software company at 2% ROA has a problem.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        As a rough general benchmark:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 5%:</strong> Acceptable for capital-intensive industries; weak for asset-light businesses</li>
        <li style="margin-bottom:8px"><strong>5–10%:</strong> Solid — the company is using its asset base efficiently</li>
        <li style="margin-bottom:8px"><strong>Above 10%:</strong> Strong — a sign of real competitive advantage or operating leverage</li>
        <li style="margin-bottom:8px"><strong>Above 15–20%:</strong> Exceptional — typically seen in software, consumer brands, or businesses with strong intangible assets</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Warren Buffett has long used ROE as a quality filter, preferring companies that sustain 15–20% returns on equity. ROA adds an important check on that — if ROE is high but ROA is low, it likely means the company is borrowing heavily to juice its equity returns. High ROA without excessive leverage is the quality signal serious investors look for.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">ROA vs. ROE: Which Should You Use?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Both metrics measure profitability, but they answer slightly different questions. ROE tells you how much profit the company generates per dollar of shareholder equity. ROA tells you how much profit it generates per dollar of total assets — equity plus debt.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        The gap between the two reveals leverage. A company with 20% ROE and 12% ROA is using moderate debt to amplify returns. A company with 40% ROE and 4% ROA is heavily leveraged — the high ROE looks impressive on the surface, but it rests on a fragile foundation. In a downturn, that debt becomes a burden.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        For this reason, many quality-focused investors look at ROA first. It is harder to inflate and gives a cleaner picture of how efficiently management deploys the resources under its control. Companies that sustain high ROA over many years — 10% or above through full economic cycles — tend to have genuine competitive advantages: pricing power, network effects, low-cost production, or strong brand loyalty.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">ROA Trends Matter as Much as the Number</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        A single year's ROA can be misleading. A company might have an exceptional quarter that inflates the annual figure, or a one-time asset write-down that suppresses it. What you want to see is consistency. A company that has maintained 10–15% ROA for five or ten consecutive years is demonstrating something real — durable operational excellence that doesn't depend on favorable conditions or accounting adjustments.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Conversely, a declining ROA trend is worth taking seriously. If a company's ROA has dropped from 14% three years ago to 7% today, the business may be adding assets (acquisitions, new plants, inventory build-up) faster than it can generate earnings from them — a warning sign about capital allocation.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">How to Screen for High-ROA Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        You can <a href="/stocks/high-roa-stocks" style="color:#0f766e;font-weight:600">screen for high ROA stocks on DeltaScreener</a> using the ROA filter in the free screener. A practical starting setup for quality-focused investors:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">ROA ≥ 10% (filters for efficient asset use)</li>
        <li style="margin-bottom:8px">Debt-to-equity ≤ 1.0 (confirms the ROA isn't debt-driven)</li>
        <li style="margin-bottom:8px">Net margin ≥ 10% (pairs profitability with efficiency)</li>
        <li style="margin-bottom:8px">Market cap ≥ $500M (filters for established businesses)</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        This combination tends to surface companies with real competitive advantages rather than those simply operating with high leverage. No sign-up required — filters update in real time on the <a href="/screener" style="color:#0f766e;font-weight:600">DeltaScreener free screener</a>.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">Frequently Asked Questions</h2>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">What is a good ROA for a stock?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">
        A ROA above 5% is generally considered decent, and above 10% is strong. Asset-light businesses like software companies often post ROA of 15–25%, while capital-intensive industries like utilities or manufacturers typically see 1–5%. Always compare within the same sector for meaningful benchmarking.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">What is the difference between ROA and ROE?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">
        ROE measures profit relative to shareholders' equity, while ROA measures profit relative to total assets including debt. ROA is a purer measure of operational efficiency because it is not inflated by financial leverage — a company with high ROE but low ROA is likely using debt to amplify equity returns.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">Can you compare ROA across different industries?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        ROA comparisons are most meaningful within the same industry. A bank with 1% ROA may be excellent, while a software company with the same figure would be considered poor. Always benchmark ROA against sector peers rather than using a single universal threshold.
      </p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        ROA is one of the most reliable filters for finding companies that genuinely earn their keep. Pair it with low leverage and consistent net margins, and you have a solid foundation for a quality-first investment screen. Head to the <a href="/screener" style="color:#0f766e;font-weight:600">DeltaScreener free screener</a> to run your own filters — no account needed.
      </p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROA stocks using these exact criteria — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'what is ROA, return on assets stocks, high ROA stocks, ROA vs ROE, good ROA ratio, stock quality screening',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
