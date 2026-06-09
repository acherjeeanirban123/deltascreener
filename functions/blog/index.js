// v20260607-dark
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet({ env }) {
  const title       = 'Stock Investing Guides | DeltaScreener Blog'
  const description = 'Practical guides on stock screening, valuation metrics, and investing strategies. Learn how to use filters like ROE, P/E, and debt-to-equity to find better stocks.'
  const canonicalUrl = `${SITE_ORIGIN}/blog`

  // Static fallback article list (newest first) — shown when DB is unavailable
  const STATIC_ARTICLES = [
    {
      slug: 'roe-and-debt-screening-strategy',
      title: 'Combining ROE and Debt Filters: A Smarter Stock Screening Strategy',
      description: 'Learn how combining ROE and debt-to-equity filters narrows thousands of US stocks to a focused list of quality companies. Step-by-step stock screening strategy guide.',
      cluster: 'Strategy',
      published_at: '2026-06-07',
    },
    {
      slug: 'nasdaq-high-roe-stocks-guide',
      title: 'NASDAQ High ROE Stocks: A Practical Screening Guide',
      description: 'Learn how to screen NASDAQ-listed stocks for high return on equity (ROE). Discover why NASDAQ skews toward capital-light businesses and how to filter for quality.',
      cluster: 'Exchange Investing',
      published_at: '2026-06-06',
    },
    {
      slug: 'low-debt-stocks-investing-guide',
      title: 'Low Debt Stocks: How a Strong Balance Sheet Protects Investors',
      description: 'Learn how to screen for low debt stocks using the debt-to-equity ratio. Discover why balance sheet strength matters by industry and how to find financially resilient companies.',
      cluster: 'Balance Sheet',
      published_at: '2026-06-05',
    },
    {
      slug: 'high-roe-semiconductor-stocks',
      title: 'High ROE Semiconductor Stocks: How to Screen the Chip Sector',
      description: 'Semiconductor stocks average 31% ROE — among the highest of any sector. Learn how to screen chip stocks using ROE, P/E, and margins to find quality names.',
      cluster: 'Sector Investing',
      published_at: '2026-06-04',
    },
    {
      slug: 'how-to-screen-tech-stocks-for-value-2026',
      title: 'How to Screen Tech Stocks for Value: Finding Undervalued Technology Stocks',
      description: 'Discover how to screen technology stocks using P/E ratios, ROE, and balance sheet metrics to find undervalued tech companies without overpaying.',
      cluster: 'Sector Investing',
      published_at: '2026-05-21',
    },
    {
      slug: 'nyse-vs-nasdaq-stock-picking',
      title: 'NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know',
      description: 'Learn the key differences between NYSE and NASDAQ — market structure, sector concentration, listing requirements, and how to use exchange filters in your stock screen.',
      cluster: 'Exchange Investing',
      published_at: '2026-05-19',
    },
    {
      slug: 'how-to-screen-tech-stocks-for-value',
      title: 'How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide',
      description: 'Learn how to screen technology stocks using ROE, P/E, and debt filters to find high-quality names without overpaying.',
      cluster: 'Sector Investing',
      published_at: '2026-05-18',
    },
    {
      slug: 'what-is-roe-in-stocks',
      title: 'What Is ROE in Stocks? Why Return on Equity Matters for Investors',
      description: 'Return on equity (ROE) measures how efficiently a company uses shareholder capital to generate profit. Learn what counts as a good ROE and how to use it to screen stocks.',
      cluster: 'Quality Investing',
      published_at: '2026-05-17',
    },
    {
      slug: 'what-is-roa-in-stocks',
      title: 'What Is ROA in Stocks? Return on Assets Explained for Investors',
      description: 'Return on assets (ROA) shows how efficiently a company uses its assets to generate profit. Learn how to interpret ROA and use it in your stock screens.',
      cluster: 'Quality Investing',
      published_at: '2026-05-16',
    },
    {
      slug: 'debt-to-equity-ratio-explained',
      title: 'Debt-to-Equity Ratio Explained: Why Balance Sheet Health Matters',
      description: 'The debt-to-equity ratio reveals how much a company relies on borrowed money. Learn what a good D/E ratio looks like and how to use it as a stock screen filter.',
      cluster: 'Balance Sheet',
      published_at: '2026-05-15',
    },
    {
      slug: 'best-dividend-stock-screening-criteria',
      title: 'Best Dividend Stock Screening Criteria for Passive Income Investors',
      description: 'Learn the key filters for finding reliable dividend stocks: yield, payout ratio, debt levels, and dividend growth. A practical guide for income investors.',
      cluster: 'Income Investing',
      published_at: '2026-05-14',
    },
    {
      slug: 'how-to-build-a-stock-screen',
      title: 'How to Build a Stock Screen from Scratch',
      description: 'A step-by-step guide to building your first stock screen. Learn which filters matter most and how to combine ROE, P/E, and debt criteria to find better stocks.',
      cluster: 'Strategy',
      published_at: '2026-05-13',
    },
    {
      slug: 'nasdaq-vs-nyse-stock-screening',
      title: 'NASDAQ vs NYSE: What Every Stock Screener Should Know',
      description: 'Understand the structural differences between NASDAQ and NYSE and how exchange filters can sharpen your stock screening strategy.',
      cluster: 'Exchange Investing',
      published_at: '2026-05-12',
    },
  ]

  // Fetch posts dynamically from D1
  let posts = []
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, title, description, cluster, published_at
       FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all()
    posts = results && results.length > 0 ? results : STATIC_ARTICLES
  } catch (_) {
    // DB not ready yet — fall back to static list
    posts = STATIC_ARTICLES
  }

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

  const articleCards = posts.length === 0
    ? `<div style="text-align:center;padding:60px 20px;color:#9ca3af">
        <p style="font-size:18px;font-weight:600;color:#e5e7eb;margin:0 0 8px">New guides coming soon</p>
        <p style="font-size:14px;margin:0">We publish stock screening and investing guides regularly. Check back tomorrow!</p>
       </div>`
    : posts.map(article => `
      <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;margin-bottom:14px;transition:box-shadow .15s,transform .15s,background .15s;color:#f3f4f6" onmouseover="this.style.background='rgba(255,255,255,.07)';this.style.boxShadow='0 4px 24px rgba(0,0,0,.35)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.boxShadow='none';this.style.transform='none'">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px">${article.cluster}</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:21px;line-height:1.28;letter-spacing:-.03em;margin:0 0 10px;color:#f9fafb">${article.title}</h2>
        <p style="margin:0 0 10px;color:#9ca3af;font-size:14px;line-height:1.6">${article.description}</p>
        <span style="font-size:12px;color:#6b7280">${new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </a>
    `).join('')

  const bodyHtml = `
    <style>
      body, html { background: #0f1117 !important; color: #f3f4f6 !important; }
      body[data-theme='light'] { background: #0f1117 !important; color: #f3f4f6 !important; }
    </style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#6b7280">/</li>
          <li aria-current="page" style="color:#9ca3af">Blog</li>
        </ol>
      </nav>
      <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing Guides</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 12px;color:#f9fafb">DeltaScreener Blog</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies — written for investors who want to understand what the numbers mean.</p>
      <div>${articleCards}</div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.18)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#9ca3af;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter combination — no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
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
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
