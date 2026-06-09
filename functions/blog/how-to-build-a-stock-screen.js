// v20260603-1
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'How to Build a Stock Screen from Scratch | DeltaScreener'
  const description = 'Learn how to build a stock screen combining ROE and debt-to-equity filters. A step-by-step guide to finding quality stocks with strong fundamentals and low leverage.'
  const slug = 'how-to-build-a-stock-screen'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to Build a Stock Screen from Scratch: Combining ROE and Debt Filters for Better Results',
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
        { '@type': 'ListItem', position: 3, name: 'How to Build a Stock Screen', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What filters should I use when building a stock screen?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Start with profitability (ROE above 15%), then add a balance sheet filter (debt-to-equity below 1.0). From there, you can layer on valuation metrics like P/E or P/B depending on whether you\'re seeking growth or value.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many filters should a stock screen have?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Two to four filters is usually optimal for a starting screen. Too few and you\'ll have hundreds of results to review. Too many and you risk filtering out solid companies due to minor metric differences. Start tight, then loosen if needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is a good ROE threshold for stock screening?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most investors use ROE above 15% as a baseline for quality companies. Sectors like financials and utilities naturally run different ranges, so adjusting by sector context gives more accurate comparisons.',
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
          <li aria-current="page" style="color:#d1d5db">How to Build a Stock Screen</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">How to Build a Stock Screen from Scratch: Combining ROE and Debt Filters for Better Results</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Most investors know they should screen for quality stocks — but building a screen that actually narrows the field to useful candidates is harder than it looks. The key is choosing a small number of filters that work together, not against each other. Combining return on equity (ROE) with a debt-to-equity ceiling is one of the most effective starting points.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Why Most Screens Fail Before They Start</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The most common mistake when building a stock screen is stacking too many filters at once. An investor might screen for low P/E <em>and</em> high dividend yield <em>and</em> high ROE <em>and</em> low debt — and end up with three stocks, all in unusual niche industries. The screen technically "works," but it doesn't produce actionable results.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">A better approach is to build in layers. Start with one profitability filter and one balance sheet filter. These two dimensions — how well a company earns, and how safely it is financed — capture the essence of business quality without over-constraining the output. From there, add one valuation metric if needed.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">The S&P 500 has a broad range of ROE values by sector. Technology and consumer discretionary companies often run ROE above 20–30%, while utilities and materials companies may be in the single digits. This means sector context matters: a universal ROE threshold of 15% will filter differently depending on which part of the market you're scanning.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Building the Core Screen: ROE + Debt-to-Equity</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Here is a straightforward two-filter screen that works as a starting point for most market environments:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#d1d5db">
        <li><strong>ROE ≥ 15%</strong> — filters for companies that generate meaningful profit from shareholder equity. This removes low-quality businesses that burn capital without producing returns.</li>
        <li><strong>Debt-to-equity ≤ 1.0</strong> — ensures the company is not over-leveraged. A D/E above 2.0 is common in some sectors but adds substantial risk during rate hikes or earnings slowdowns.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Together, these two filters look for companies that are both profitable and financially stable. The median debt-to-equity for S&P 500 companies has historically hovered around 1.0–1.5, so setting a ceiling of 1.0 already places you in the cleaner half of the index.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Once you have this base screen running, look at what comes out. If you get more than 50–80 results, you can tighten ROE to 20% or lower D/E to 0.75. If you get fewer than 15, consider loosening one filter — or check whether your universe is too narrow to begin with.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Adding a Third Filter: Valuation or Growth</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Once the quality + balance sheet base is set, a third filter helps separate expensive quality from reasonably priced quality. Two common choices:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#d1d5db">
        <li><strong>P/E below 25</strong> — useful when you're looking for value within the quality universe. Avoids paying a large premium for businesses the market already loves.</li>
        <li><strong>Revenue growth above 5% year-over-year</strong> — useful when you want companies that are expanding, not just profitable on a static basis.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">These two goals are often in tension: fast-growing companies tend to trade at higher P/E multiples. Choosing which direction to go depends on whether you're building a growth screen or a value screen. The ROE + D/E foundation works for both — the third filter just tilts the output.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">One practical tip: run the screen without the third filter first. Review the list. That review is itself part of the research process — you'll often notice industry clusters, outliers worth investigating, or sectors you want to exclude before applying any more filters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">How to Run This Screen on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">You can <a href="/screener" style="color:#2dd4bf;text-decoration:underline">build a custom screen on DeltaScreener</a> using exactly these filters. Set ROE to a minimum of 15%, debt-to-equity to a maximum of 1.0, and add a P/E or revenue growth filter if desired. No account required — results update in real time across the full US market universe.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">If you want to start from a pre-built screen, the <a href="/stocks/high-roe-stocks" style="color:#2dd4bf;text-decoration:underline">high ROE stocks screener</a> already applies a quality filter that you can combine with additional criteria. You can also explore the <a href="/stocks/low-debt-high-roe" style="color:#2dd4bf;text-decoration:underline">low debt + high ROE</a> pre-set, which mirrors the two-filter strategy described above.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for stocks using ROE, debt-to-equity, P/E, and more — free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,26px);letter-spacing:-.03em;line-height:1.2;margin:48px 0 20px;color:#f9fafb">Frequently Asked Questions</h2>

      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">What filters should I use when building a stock screen?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Start with profitability (ROE above 15%), then add a balance sheet filter (debt-to-equity below 1.0). From there, layer on a valuation metric like P/E or P/B depending on whether you're seeking growth or value.</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">How many filters should a stock screen have?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Two to four filters is usually optimal. Too few and you'll have hundreds of results to sort through. Too many and you risk excluding solid companies for minor metric differences. Start with two, then adjust.</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0;border-bottom:1px solid rgba(255,255,255,.08)">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">What is a good ROE threshold for stock screening?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Most investors use ROE above 15% as a baseline for quality companies. Sectors like financials and utilities naturally run different ranges, so adjusting by sector context gives more accurate comparisons. For technology stocks, 20–25%+ is a reasonable bar.</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#6b7280;margin:32px 0 0">Looking for more screening strategies? Browse all guides on the <a href="/blog" style="color:#2dd4bf;text-decoration:underline">DeltaScreener blog</a> or jump straight to the <a href="/screener" style="color:#2dd4bf;text-decoration:underline">free screener</a>.</p>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'how to build a stock screen, stock screening strategy, ROE and debt filter, stock screener guide, build stock screen from scratch, DeltaScreener',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
