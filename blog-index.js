import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

const BLOG_ARTICLES = [
  {
    slug: 'how-to-screen-tech-stocks-for-value-2026',
    title: 'How to Screen Tech Stocks for Value: Finding Undervalued Technology Stocks',
    description: 'Discover how to screen technology stocks using P/E ratios, ROE, and balance sheet metrics to find undervalued tech companies without overpaying.',
    date: '2026-05-21',
    cluster: 'Sector Investing',
  },
  {
    slug: 'nyse-vs-nasdaq-stock-picking',
    title: 'NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know',
    description: 'Learn the key differences between NYSE and NASDAQ — market structure, sector concentration, listing requirements, and how to use exchange filters in your stock screen.',
    date: '2026-05-19',
    cluster: 'Exchange Investing',
  },
  {
    slug: 'how-to-screen-tech-stocks-for-value',
    title: 'How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide',
    description: 'Learn how to screen technology stocks using ROE, P/E, and debt filters to find high-quality names without overpaying.',
    date: '2026-05-18',
    cluster: 'Sector Investing',
  },
]

export async function onRequestGet() {
  const title = 'Stock Investing Guides | DeltaScreener Blog'
  const description = 'Practical guides on stock screening, valuation metrics, and investing strategies. Learn how to use filters like ROE, P/E, and debt-to-equity to find better stocks.'
  const canonicalUrl = `${SITE_ORIGIN}/blog`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'DeltaScreener Blog',
      description,
      url: canonicalUrl,
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
      ],
    },
  ]

  const articleCards = BLOG_ARTICLES.map(article => `
    <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(208,214,222,.95);background:#fff;text-decoration:none;margin-bottom:16px;transition:box-shadow .15s">
      <div style="font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#0f766e;margin-bottom:8px">${article.cluster}</div>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;line-height:1.25;letter-spacing:-.03em;margin:0 0 10px;color:#111827">${article.title}</h2>
      <p style="margin:0 0 10px;color:#6b7280;font-size:14px;line-height:1.6">${article.description}</p>
      <span style="font-size:13px;color:#9ca3af">${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </a>
  `).join('')

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Blog</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Stock Investing Guides</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 12px;color:#111827">DeltaScreener Blog</h1>
      <p style="color:#6b7280;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies — written for investors who want to understand what the numbers mean.</p>
      <div>
        ${articleCards}
      </div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter combination — no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'stock investing guides, stock screening blog, ROE investing, how to screen stocks, DeltaScreener blog',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
