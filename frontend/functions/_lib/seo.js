// v20260719-compare
// Shared quality floors applied to screen pages: a market-cap floor keeps
// micro-cap shells with junk fundamentals out, and a non-negative D/E
// requirement excludes negative-equity companies whose ROE is meaningless.
const MCAP_FLOOR = { metric: 'marketCap', op: '>=', value: 50000000 }
const POSITIVE_EQUITY = { metric: 'debtToEquity', op: '>=', value: 0 }
const ROE_SANITY_CAP = { metric: 'roe', op: '<=', value: 300 }
const SITE_ORIGIN = 'https://deltascreener.com'
const API_FALLBACKS = [
  'https://api-ovh.deltascreener.com',
  'https://screenerpro1-api.acherjeeanirban.workers.dev',
]

const HTML_CACHE_CONTROL = 'public, max-age=900, s-maxage=7200, stale-while-revalidate=86400'
const XML_CACHE_CONTROL = 'public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400'

export const SCREEN_PAGES = [
  {
    slug: 'high-roe-stocks',
    title: 'High ROE Stocks',
    h1: 'High ROE Stocks',
    cluster: 'Quality',
    intro: 'These US stocks currently rank for strong return on equity, which can help surface businesses converting shareholder capital into profit efficiently.',
    metaDescription: 'Explore US high ROE stocks with live price, market cap, valuation, and profitability data. Updated automatically on DeltaScreener.',
    conditions: [
      { metric: 'roe', op: '>=', value: 18 },
      ROE_SANITY_CAP,
      { metric: 'pb', op: '>', value: 0 },
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 3 },
      MCAP_FLOOR,
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['low-debt-stocks', 'high-roa-stocks', 'undervalued-tech-stocks'],
    faqs: [
      ['What counts as high ROE?', 'This screen currently looks for stocks with return on equity of at least 18% and positive price-to-book coverage.'],
      ['Why include debt filters?', 'High ROE can be artificially boosted by leverage, so the screen also caps debt-to-equity to keep the list more investable.'],
    ],
  },
  {
    slug: 'low-debt-stocks',
    title: 'Low Debt Stocks',
    h1: 'Low Debt Stocks',
    cluster: 'Balance Sheet',
    intro: 'This screen focuses on stocks with conservative debt loads, which can help investors find companies with stronger balance sheet flexibility.',
    metaDescription: 'Browse US low debt stocks with live financial ratios, valuation data, and market cap filters. Auto-updated on DeltaScreener.',
    conditions: [
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 0.5 },
      { metric: 'roe', op: '>=', value: 8 },
      { metric: 'pb', op: '>', value: 0 },
      MCAP_FLOOR,
    ],
    sort: { field: 'debtToEquity', dir: 'asc' },
    related: ['low-debt-dividend-stocks', 'high-roe-stocks', 'nyse-low-debt-stocks'],
    faqs: [
      ['What is a low debt stock here?', 'This page uses debt-to-equity of 0.5 or lower and also requires usable profitability data.'],
      ['Why are some banks missing?', 'Bank balance sheets work differently, so many financial firms are filtered out by conservative debt thresholds.'],
    ],
  },
  {
    slug: 'high-roa-stocks',
    title: 'High ROA Stocks',
    h1: 'High ROA Stocks',
    cluster: 'Quality',
    intro: 'Return on assets can highlight companies that generate strong earnings from the asset base they control, which is useful for cross-sector quality screening.',
    metaDescription: 'Find US high ROA stocks with current valuation, profitability, and market cap data. Freshly updated stock screener results.',
    conditions: [
      { metric: 'roa', op: '>=', value: 10 },
      { metric: 'roa', op: '<=', value: 200 },
      { metric: 'pb', op: '>', value: 0 },
      MCAP_FLOOR,
    ],
    sort: { field: 'roa', dir: 'desc' },
    related: ['high-roe-stocks', 'high-net-margin-stocks', 'low-pe-stocks'],
    faqs: [
      ['Why use ROA?', 'ROA is a useful quality signal when you want a profitability measure less influenced by leverage than ROE.'],
      ['Is this a US-only screen?', 'Yes. These pages are built from the current US stock universe tracked by DeltaScreener.'],
    ],
  },
  {
    slug: 'high-net-margin-stocks',
    title: 'High Net Margin Stocks',
    h1: 'High Net Margin Stocks',
    cluster: 'Profitability',
    intro: 'High net margin stocks can point to businesses with strong pricing power, disciplined costs, or structurally attractive economics.',
    metaDescription: 'Discover US high net margin stocks with live market cap, price, ROE, and balance sheet data. Updated throughout the week.',
    conditions: [
      { metric: 'netMargin', op: '>=', value: 20 },
      { metric: 'netMargin', op: '<=', value: 200 },
      { metric: 'roa', op: '>=', value: 5 },
      MCAP_FLOOR,
    ],
    sort: { field: 'netMargin', dir: 'desc' },
    related: ['high-roa-stocks', 'high-roe-stocks', 'low-pb-stocks'],
    faqs: [
      ['Why require ROA as well?', 'A margin filter alone can be noisy, so this page also looks for companies converting assets into profit effectively.'],
      ['Do margins update automatically?', 'Yes. The page data refreshes from your backend on a recurring Cloudflare schedule.'],
    ],
  },
  {
    slug: 'low-pe-stocks',
    title: 'Low PE Stocks',
    h1: 'Low PE Stocks',
    cluster: 'Value',
    intro: 'This page highlights lower P/E names that still show usable profitability metrics, helping avoid the weakest corners of value screens.',
    metaDescription: 'Screen US low PE stocks with live valuation, profitability, and balance sheet metrics. Programmatic SEO page updated automatically.',
    conditions: [
      { metric: 'pe', op: '>=', value: 1 },
      { metric: 'pe', op: '<=', value: 15 },
      { metric: 'roe', op: '>=', value: 8 },
      { metric: 'pb', op: '>', value: 0 },
      POSITIVE_EQUITY,
      MCAP_FLOOR,
    ],
    sort: { field: 'pe', dir: 'asc' },
    related: ['low-pb-stocks', 'undervalued-tech-stocks', 'low-debt-stocks'],
    faqs: [
      ['Why not sort only by cheapest P/E?', 'Extremely low P/E stocks can be low quality or cyclical, so this screen keeps a minimum profitability floor.'],
      ['Are negative earners included?', 'No. A valid P/E ratio is required for this screen.'],
    ],
  },
  {
    slug: 'low-pb-stocks',
    title: 'Low PB Stocks',
    h1: 'Low PB Stocks',
    cluster: 'Value',
    intro: 'Low price-to-book screens can help surface asset-backed value opportunities, especially when paired with positive returns on equity.',
    metaDescription: 'Browse US low price-to-book stocks with live valuation, ROE, debt, and market cap data on DeltaScreener.',
    conditions: [
      { metric: 'pb', op: '>', value: 0 },
      { metric: 'pb', op: '<=', value: 2 },
      { metric: 'roe', op: '>=', value: 8 },
      POSITIVE_EQUITY,
      MCAP_FLOOR,
    ],
    sort: { field: 'pb', dir: 'asc' },
    related: ['low-pe-stocks', 'low-debt-stocks', 'dividend-stocks'],
    faqs: [
      ['Why combine low PB with ROE?', 'Low PB without profitability can produce weak lists, so this page keeps a minimum ROE threshold.'],
      ['Will financial firms appear here?', 'Yes, if they meet the current screen rules and have complete fundamentals in the backend.'],
    ],
  },
  {
    slug: 'dividend-stocks',
    title: 'Dividend Stocks',
    h1: 'Dividend Stocks',
    cluster: 'Income',
    intro: 'This page tracks US dividend-paying stocks with current yield data and balance sheet filters to keep the list more actionable.',
    metaDescription: 'Find dividend-paying US stocks with yield, valuation, ROE, and debt metrics. SEO page refreshed automatically on Cloudflare.',
    conditions: [
      { metric: 'dividendYield', op: '>=', value: 2.5 },
      { metric: 'dividendYield', op: '<=', value: 50 },
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 2.5 },
      MCAP_FLOOR,
    ],
    sort: { field: 'dividendYield', dir: 'desc' },
    related: ['low-debt-dividend-stocks', 'low-debt-stocks', 'low-pe-stocks'],
    faqs: [
      ['Does this page show current yield or dividend growth?', 'This screen is based on current dividend yield and supporting fundamentals, not a historical dividend growth series.'],
      ['Why can some high-yield stocks be missing?', 'Names with missing or weak core fundamentals are filtered out to avoid low-quality pages and results.'],
    ],
  },
  {
    slug: 'low-debt-dividend-stocks',
    title: 'Low Debt Dividend Stocks',
    h1: 'Low Debt Dividend Stocks',
    cluster: 'Income',
    intro: 'Low debt dividend stocks can be useful for investors who want current yield without leaning too heavily on stretched balance sheets.',
    metaDescription: 'Explore low debt dividend stocks in the US market with live yield, ROE, PE, and debt-to-equity data.',
    conditions: [
      { metric: 'dividendYield', op: '>=', value: 1.5 },
      { metric: 'dividendYield', op: '<=', value: 50 },
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 1 },
      { metric: 'roe', op: '>=', value: 8 },
      MCAP_FLOOR,
    ],
    sort: { field: 'dividendYield', dir: 'desc' },
    related: ['dividend-stocks', 'low-debt-stocks', 'nyse-low-debt-stocks'],
    faqs: [
      ['What makes this different from the general dividend page?', 'This version adds a tighter debt ceiling to prioritize stronger balance sheets.'],
      ['How often does the list refresh?', 'The page is cached at the edge and refreshed from fresh screener data every few hours.'],
    ],
  },
  {
    slug: 'undervalued-tech-stocks',
    title: 'Undervalued Tech Stocks',
    h1: 'Undervalued Tech Stocks',
    cluster: 'Sector Value',
    intro: 'Undervalued technology stocks are screened here using sector membership plus conservative valuation and profitability filters.',
    metaDescription: 'Browse undervalued technology stocks with live PE, PB, ROE, and market cap data for the US market.',
    conditions: [
      { metric: 'sector', op: '=', value: 'Technology' },
      { metric: 'pe', op: '>=', value: 1 },
      { metric: 'pe', op: '<=', value: 25 },
      { metric: 'pb', op: '<=', value: 8 },
      { metric: 'roe', op: '>=', value: 10 },
      ROE_SANITY_CAP,
      POSITIVE_EQUITY,
      MCAP_FLOOR,
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['high-roe-tech-stocks', 'low-pe-stocks', 'high-roe-stocks'],
    faqs: [
      ['How do you define undervalued here?', 'This page uses sector = Technology plus capped PE and PB ratios, then keeps a minimum ROE floor.'],
      ['Is this only mega-cap tech?', 'No. The list can include smaller US tech names as long as they meet the active universe and financial coverage rules.'],
    ],
  },
  {
    slug: 'high-roe-tech-stocks',
    title: 'High ROE Tech Stocks',
    h1: 'High ROE Tech Stocks',
    cluster: 'Sector Quality',
    intro: 'This page narrows the tech universe to companies with strong return on equity and usable balance-sheet coverage.',
    metaDescription: 'Screen high ROE technology stocks in the US market with live price, ROE, PB, and debt metrics.',
    conditions: [
      { metric: 'sector', op: '=', value: 'Technology' },
      { metric: 'roe', op: '>=', value: 18 },
      ROE_SANITY_CAP,
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 2 },
      MCAP_FLOOR,
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['undervalued-tech-stocks', 'high-roe-stocks', 'nasdaq-high-roe-stocks'],
    faqs: [
      ['Why combine tech and ROE?', 'It helps surface efficient technology businesses while filtering away weaker balance-sheet setups.'],
      ['Can software and semis both appear?', 'Yes. Technology here is driven by the sector label from your backend dataset.'],
    ],
  },
  {
    slug: 'nasdaq-high-roe-stocks',
    title: 'Nasdaq High ROE Stocks',
    h1: 'Nasdaq High ROE Stocks',
    cluster: 'Exchange',
    intro: 'This page focuses on NASDAQ-listed stocks with strong return on equity, giving you a cleaner long-tail screen for exchange-specific searches.',
    metaDescription: 'View NASDAQ high ROE stocks with live price, market cap, PB, and debt metrics. Auto-updated on DeltaScreener.',
    conditions: [
      { metric: 'exchange', op: '=', value: 'NASDAQ' },
      { metric: 'roe', op: '>=', value: 18 },
      ROE_SANITY_CAP,
      { metric: 'pb', op: '>', value: 0 },
      POSITIVE_EQUITY,
      MCAP_FLOOR,
    ],
    sort: { field: 'roe', dir: 'desc' },
    related: ['high-roe-tech-stocks', 'high-roe-stocks', 'penny-stocks'],
    faqs: [
      ['Why make an exchange-specific page?', 'Exchange-qualified pages are useful for long-tail search intent and help avoid mixing different listing universes.'],
      ['Are all results US-listed?', 'Yes. The current backend universe is focused on US-listed names.'],
    ],
  },
  {
    slug: 'nyse-low-debt-stocks',
    title: 'NYSE Low Debt Stocks',
    h1: 'NYSE Low Debt Stocks',
    cluster: 'Exchange',
    intro: 'NYSE low debt stocks can be useful when you want exchange-specific balance sheet screens with up-to-date profitability data.',
    metaDescription: 'Explore NYSE low debt stocks with live ROE, PE, debt-to-equity, and market cap data.',
    conditions: [
      { metric: 'exchange', op: '=', value: 'NYSE' },
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 0.5 },
      { metric: 'roe', op: '>=', value: 8 },
      MCAP_FLOOR,
    ],
    sort: { field: 'debtToEquity', dir: 'asc' },
    related: ['low-debt-stocks', 'low-debt-dividend-stocks', 'low-pb-stocks'],
    faqs: [
      ['What qualifies as NYSE here?', 'The route uses the normalized exchange value stored in your stock dataset and filters it to NYSE.'],
      ['Why require ROE too?', 'That helps keep the page from becoming a thin list of low-leverage but low-quality businesses.'],
    ],
  },
  {
    slug: 'penny-stocks',
    title: 'Penny Stocks',
    h1: 'Penny Stocks',
    cluster: 'Price',
    intro: 'This page surfaces lower-priced US stocks while keeping a minimum market-cap and balance-sheet floor to reduce the noisiest names.',
    metaDescription: 'Browse US penny stocks with current price, market cap, debt, and valuation data. Updated automatically on DeltaScreener.',
    conditions: [
      { metric: 'price', op: '<=', value: 5 },
      { metric: 'marketCap', op: '>=', value: 200000000 },
      POSITIVE_EQUITY,
      { metric: 'debtToEquity', op: '<=', value: 3 },
    ],
    sort: { field: 'marketCap', dir: 'desc' },
    related: ['nasdaq-high-roe-stocks', 'low-pe-stocks', 'low-pb-stocks'],
    faqs: [
      ['Why add a market cap floor?', 'It helps remove the thinnest micro-cap names so the page stays more useful and less spammy.'],
      ['Is this financial advice?', 'No. These pages are data-driven screens meant for research and idea generation.'],
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────
// PROGRAMMATIC GENERATOR — Tier 1: metric × sector screens.
// Produces SCREEN_PAGES-shaped objects so the hub, sitemap, lookup, and
// renderScreenPage all pick them up with zero downstream changes. The
// `results.length >= 3` guard in renderScreenPage noindexes any thin combo,
// so empty permutations never publish a low-quality page.
// ──────────────────────────────────────────────────────────────────────────

// Each metric defines its slug fragment, display label, screen conditions
// (the base profitability/quality filters), sort, and a couple of copy
// variants so generated pages aren't byte-identical boilerplate.
const GEN_METRICS = [
  {
    key: 'high-roe', label: 'High ROE', cluster: 'Sector Quality',
    conditions: [{ metric: 'roe', op: '>=', value: 18 }, ROE_SANITY_CAP, POSITIVE_EQUITY, { metric: 'debtToEquity', op: '<=', value: 3 }, MCAP_FLOOR],
    sort: { field: 'roe', dir: 'desc' },
    blurb: 'companies generating strong return on equity',
    why: 'Return on equity highlights how efficiently a business turns shareholder capital into profit, and a debt ceiling keeps leverage-inflated names out of the list.',
    faq: ['What counts as high ROE here?', 'This screen looks for return on equity of at least 18% alongside a debt-to-equity cap, so the quality signal is not just a product of leverage.'],
  },
  {
    key: 'high-roa', label: 'High ROA', cluster: 'Sector Quality',
    conditions: [{ metric: 'roa', op: '>=', value: 10 }, { metric: 'roa', op: '<=', value: 200 }, { metric: 'pb', op: '>', value: 0 }, MCAP_FLOOR],
    sort: { field: 'roa', dir: 'desc' },
    blurb: 'businesses earning strong returns on their asset base',
    why: 'Return on assets is a quality measure that is less sensitive to leverage than ROE, which makes it useful for comparing companies across very different balance sheets.',
    faq: ['Why screen by ROA?', 'ROA rewards companies that generate profit from the assets they control, so it surfaces operational efficiency rather than financial engineering.'],
  },
  {
    key: 'high-net-margin', label: 'High Net Margin', cluster: 'Sector Profitability',
    conditions: [{ metric: 'netMargin', op: '>=', value: 18 }, { metric: 'netMargin', op: '<=', value: 200 }, { metric: 'roa', op: '>=', value: 5 }, MCAP_FLOOR],
    sort: { field: 'netMargin', dir: 'desc' },
    blurb: 'companies with strong net profit margins',
    why: 'High net margins can point to pricing power, cost discipline, or structurally attractive economics, and a minimum ROA keeps the list grounded in real asset productivity.',
    faq: ['What does a high net margin tell you?', 'A consistently high net margin often signals durable competitive advantages, though margins should always be read in the context of the sector.'],
  },
  {
    key: 'low-pe', label: 'Low PE', cluster: 'Sector Value',
    conditions: [{ metric: 'pe', op: '<=', value: 18 }, { metric: 'pe', op: '>=', value: 1 }, { metric: 'roe', op: '>=', value: 8 }, POSITIVE_EQUITY, MCAP_FLOOR],
    sort: { field: 'pe', dir: 'asc' },
    blurb: 'lower-P/E names that still post usable profitability',
    why: 'A low price-to-earnings ratio can flag value, but a minimum ROE floor helps avoid the cheapest-for-a-reason corners of the market.',
    faq: ['Are loss-making companies included?', 'No. A valid positive P/E is required, so deeply unprofitable names are filtered out of this screen.'],
  },
  {
    key: 'low-pb', label: 'Low PB', cluster: 'Sector Value',
    conditions: [{ metric: 'pb', op: '<=', value: 2 }, { metric: 'pb', op: '>', value: 0 }, { metric: 'roe', op: '>=', value: 8 }, POSITIVE_EQUITY, MCAP_FLOOR],
    sort: { field: 'pb', dir: 'asc' },
    blurb: 'asset-backed value names trading at low price-to-book',
    why: 'Low price-to-book can surface asset-rich value opportunities, and pairing it with a return-on-equity floor avoids the weakest, value-trap end of the screen.',
    faq: ['Why combine low P/B with ROE?', 'Low book multiples without profitability often produce weak lists, so this page keeps a minimum ROE requirement.'],
  },
  {
    key: 'dividend', label: 'Dividend', cluster: 'Sector Income',
    conditions: [{ metric: 'dividendYield', op: '>=', value: 2 }, { metric: 'dividendYield', op: '<=', value: 50 }, POSITIVE_EQUITY, { metric: 'debtToEquity', op: '<=', value: 2.5 }, MCAP_FLOOR],
    sort: { field: 'dividendYield', dir: 'desc' },
    blurb: 'dividend-paying companies with reasonable balance sheets',
    why: 'Current yield is the starting point for income screens, and a debt ceiling helps filter out payouts that may be propped up by an overstretched balance sheet.',
    faq: ['Is this based on current yield?', 'Yes. The screen uses current dividend yield plus a debt filter; it is not a dividend-growth-streak screen.'],
  },
  {
    key: 'low-debt', label: 'Low Debt', cluster: 'Sector Balance Sheet',
    conditions: [POSITIVE_EQUITY, { metric: 'debtToEquity', op: '<=', value: 0.5 }, { metric: 'roe', op: '>=', value: 8 }, MCAP_FLOOR],
    sort: { field: 'debtToEquity', dir: 'asc' },
    blurb: 'companies carrying conservative debt loads',
    why: 'A low debt-to-equity ratio signals balance-sheet flexibility, and a profitability floor keeps the list from filling up with low-leverage but low-quality businesses.',
    faq: ['Why are some banks missing?', 'Financial-sector balance sheets work differently, so many lenders are filtered out by a conservative debt-to-equity threshold.'],
  },
]

// Sectors as stored in the backend dataset, with a URL-friendly slug fragment
// and a natural-language label used in copy.
const GEN_SECTORS = [
  { slug: 'technology', value: 'Technology', label: 'Technology' },
  { slug: 'healthcare', value: 'Healthcare', label: 'Healthcare' },
  { slug: 'financial', value: 'Financial Services', label: 'Financial' },
  { slug: 'energy', value: 'Energy', label: 'Energy' },
  { slug: 'industrial', value: 'Industrials', label: 'Industrial' },
  { slug: 'consumer-cyclical', value: 'Consumer Cyclical', label: 'Consumer Cyclical' },
  { slug: 'consumer-defensive', value: 'Consumer Defensive', label: 'Consumer Defensive' },
  { slug: 'utility', value: 'Utilities', label: 'Utility' },
  { slug: 'real-estate', value: 'Real Estate', label: 'Real Estate' },
  { slug: 'basic-materials', value: 'Basic Materials', label: 'Basic Materials' },
  { slug: 'communication', value: 'Communication Services', label: 'Communication' },
]

function generateScreens() {
  const out = []
  for (const m of GEN_METRICS) {
    for (const s of GEN_SECTORS) {
      const slug = `${m.key}-${s.slug}-stocks`
      const title = `${m.label} ${s.label} Stocks`
      // Pick 3 related screens: same metric in two other sectors + the
      // hand-curated all-sector version of this metric if one exists.
      const sectorSiblings = GEN_SECTORS
        .filter(x => x.slug !== s.slug)
        .slice(0, 2)
        .map(x => `${m.key}-${x.slug}-stocks`)
      const related = [`${m.key}-stocks`, ...sectorSiblings].slice(0, 3)
      out.push({
        slug,
        title,
        h1: title,
        cluster: m.cluster,
        intro: `This page screens the US ${s.label.toLowerCase()} sector for ${m.blurb}, refreshed automatically from live data.`,
        metaDescription: `${m.label} ${s.label.toLowerCase()} stocks in the US market with live price, valuation, and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [{ metric: 'sector', op: '=', value: s.value }, ...m.conditions],
        sort: m.sort,
        related,
        faqs: [
          m.faq,
          [`Is this screen limited to ${s.label.toLowerCase()} stocks?`, `Yes. Every result is filtered to the US ${s.label.toLowerCase()} sector, so the list stays focused on one part of the market. ${m.why}`],
        ],
        generated: true,
      })
    }
  }
  return out
}

// ──────────────────────────────────────────────────────────────────────────
// PROGRAMMATIC GENERATOR — Tier 2: price-tier and exchange slices.
// These attach a single high-intent modifier (price ceiling, or listing
// exchange) to the all-sector version of each metric. We deliberately do NOT
// take the full metric × sector × price × exchange cartesian product — that
// would produce tens of thousands of mostly-thin, near-duplicate pages. Each
// page here targets a distinct, commonly-searched query ("high roe stocks
// under $10", "nasdaq dividend stocks"). The results.length >= 3 guard in
// renderScreenPage still noindexes any combo that comes up short.
// ──────────────────────────────────────────────────────────────────────────
const GEN_PRICE_TIERS = [
  { slug: 'under-5', value: 5, label: 'Under $5' },
  { slug: 'under-10', value: 10, label: 'Under $10' },
  { slug: 'under-50', value: 50, label: 'Under $50' },
]

const GEN_EXCHANGES = [
  { slug: 'nasdaq', value: 'NASDAQ', label: 'Nasdaq' },
  { slug: 'nyse', value: 'NYSE', label: 'NYSE' },
]

function generateTier2() {
  const out = []

  // Price-tier slices: <metric> stocks under $X
  for (const m of GEN_METRICS) {
    for (const p of GEN_PRICE_TIERS) {
      const slug = `${m.key}-stocks-${p.slug}`
      const title = `${m.label} Stocks ${p.label}`
      const siblings = GEN_PRICE_TIERS.filter(x => x.slug !== p.slug).map(x => `${m.key}-stocks-${x.slug}`)
      out.push({
        slug,
        title,
        h1: title,
        cluster: 'Price Tier',
        intro: `This page screens the US market for ${m.blurb}, limited to shares trading at ${p.label.toLowerCase().replace('under ', 'under ')}. Refreshed automatically from live data.`,
        metaDescription: `${m.label} US stocks priced ${p.label.toLowerCase()} with live valuation and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [...m.conditions, { metric: 'price', op: '<=', value: p.value }],
        sort: m.sort,
        related: [`${m.key}-stocks`, ...siblings].slice(0, 3),
        faqs: [
          m.faq,
          [`Are these all priced ${p.label.toLowerCase()}?`, `Yes. Every result trades at or below $${p.value} per share. ${m.why} A low share price alone says nothing about value, so always read it alongside the fundamentals shown on each page.`],
        ],
        generated: true,
      })
    }
  }

  // Exchange slices: <exchange> <metric> stocks
  for (const m of GEN_METRICS) {
    for (const x of GEN_EXCHANGES) {
      const slug = `${x.slug}-${m.key}-stocks`
      const title = `${x.label} ${m.label} Stocks`
      const siblings = GEN_EXCHANGES.filter(e => e.slug !== x.slug).map(e => `${e.slug}-${m.key}-stocks`)
      out.push({
        slug,
        title,
        h1: title,
        cluster: 'Exchange',
        intro: `This page screens ${x.label}-listed US stocks for ${m.blurb}, refreshed automatically from live data.`,
        metaDescription: `${x.label} ${m.label.toLowerCase()} stocks with live price, valuation, and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [{ metric: 'exchange', op: '=', value: x.value }, ...m.conditions],
        sort: m.sort,
        related: [`${m.key}-stocks`, ...siblings].slice(0, 3),
        faqs: [
          m.faq,
          [`Are all results listed on ${x.label}?`, `Yes. This screen is filtered to ${x.label}-listed US stocks, which is useful for exchange-specific search and avoids mixing listing universes. ${m.why}`],
        ],
        generated: true,
      })
    }
  }

  return out
}

export const GENERATED_SCREENS = [...generateScreens(), ...generateTier2()]

// Hand-curated screens take precedence on any slug collision (better copy).
const _curatedSlugs = new Set(SCREEN_PAGES.map(s => s.slug))
const _seen = new Set(_curatedSlugs)
for (const s of GENERATED_SCREENS) {
  if (_seen.has(s.slug)) continue
  _seen.add(s.slug)
  SCREEN_PAGES.push(s)
}

export const SCREEN_LOOKUP = Object.fromEntries(SCREEN_PAGES.map(screen => [screen.slug, screen]))

// ──────────────────────────────────────────────────────────────────────────
// Single source of truth for blog articles.
// The sitemap (renderSitemap) and the blog index (/blog) BOTH derive from this
// list so the two can never drift apart. Newest first. Every slug here must
// have a matching functions/blog/<slug>.js renderer.
// ──────────────────────────────────────────────────────────────────────────
// Live set mirrors the D1 `blog_posts` table (what /blog actually links).
// Keep in sync with the database; the sitemap derives from this list.
export const BLOG_POSTS = [
  { slug: 'buffett-checklist-only-20-us-stocks-pass-2026', title: "We Ran Buffett's Checklist on 4,907 US Stocks. Only 20 Passed.", description: 'We screened every US stock through seven Buffett-style quality filters — high sustained ROE, fat margins, low debt. Just 0.4% passed. Here are all 20 names, with the data.', cluster: 'Value Investing', published_at: '2026-07-19' },
  { slug: 'debt-to-equity-ratio-stock-screening', title: 'Debt-to-Equity Ratio: How to Screen for Low-Debt Stocks', description: 'Learn how to use the debt-to-equity ratio to screen for financially sound, low-debt stocks — and why balance sheet strength matters across industries.', cluster: 'Financial Metrics', published_at: '2026-06-19' },
  { slug: 'debt-to-equity-ratio-stock-screening-guide', title: 'Debt-to-Equity Ratio: How to Screen for Financially Sound Stocks', description: 'A practical guide to screening stocks by debt-to-equity ratio. Understand what a healthy D/E looks like by sector and how to filter for resilient companies.', cluster: 'Financial Metrics', published_at: '2026-06-18' },
  { slug: 'how-to-screen-healthcare-stocks-filters', title: 'How to Screen for Healthcare Stocks in Any Market', description: 'Learn which filters matter most when screening healthcare stocks — margins, R&D, pipeline risk, and valuation — to find quality names in any market.', cluster: 'Sector Investing', published_at: '2026-06-17' },
  { slug: 'high-roe-stock-screening-guide', title: 'Return on Equity Explained: How to Screen for High-ROE Stocks', description: 'Return on equity measures how efficiently a company turns shareholder capital into profit. Learn how to screen for sustainable high-ROE stocks.', cluster: 'Financial Metrics', published_at: '2026-06-15' },
  { slug: 'return-on-equity-roe-stock-screening', title: 'Return on Equity (ROE): How to Screen for Quality Stocks', description: 'Learn how to use ROE to screen for quality businesses, what counts as a good ROE, and how to avoid ROE inflated by debt.', cluster: 'Financial Metrics', published_at: '2026-06-14' },
  { slug: 'price-to-sales-ratio-stock-screening', title: 'Price-to-Sales Ratio: How to Screen Stocks Without Earnings', description: 'The price-to-sales ratio helps you value companies that are not yet profitable. Learn how to use P/S to screen growth and turnaround stocks.', cluster: 'Financial Metrics', published_at: '2026-06-13' },
  { slug: 'growth-vs-value-stock-screening-strategies', title: 'Growth vs Value Stock Screening: Filters That Actually Work', description: 'Compare growth and value screening strategies and learn which filters actually identify each style of stock — with practical screen examples.', cluster: 'Growth Investing', published_at: '2026-06-11' },
  { slug: 'free-cash-flow-screening-find-quality-stocks', title: 'Free Cash Flow Screening: Find Stocks That Actually Generate Cash', description: 'Free cash flow reveals which companies truly generate cash after investment. Learn how to screen for strong FCF and avoid earnings mirages.', cluster: 'Financial Metrics', published_at: '2026-06-09' },
  { slug: 'how-to-avoid-value-traps-stock-screening', title: 'How to Avoid Value Traps When Screening Stocks', description: 'Cheap stocks are not always good value. Learn the warning signs of value traps and which filters help you avoid them when screening.', cluster: 'Value Investing', published_at: '2026-06-08' },
  { slug: 'sector-rotation-strategies-us-stock-screening', title: 'Sector Rotation Strategies for US Stock Screeners', description: 'Learn how sector rotation works across the economic cycle and how to build screens that adapt to leading and lagging sectors.', cluster: 'Sector Investing', published_at: '2026-06-07' },
  { slug: 'ev-ebitda-valuation-ratio-stock-screening', title: 'EV/EBITDA Explained: The Valuation Ratio Serious Screeners Use', description: 'EV/EBITDA accounts for debt and capital structure in a way P/E cannot. Learn how to use it to screen for fairly valued stocks.', cluster: 'Value Investing', published_at: '2026-06-05' },
  { slug: 'how-to-screen-dividend-stocks-practical-guide', title: 'How to Screen for Dividend Stocks: A Practical Guide', description: 'A practical guide to screening dividend stocks by yield, payout ratio, and dividend growth — and how to spot payouts at risk.', cluster: 'Dividend Investing', published_at: '2026-05-31' },
  { slug: 'momentum-stock-screening-systematic-approach', title: 'Momentum Stock Screening: A Systematic Approach', description: 'Learn how to build a systematic momentum screen using price strength, volume, and earnings revisions to find stocks in strong uptrends.', cluster: 'Market Strategy', published_at: '2026-05-29' },
  { slug: 'how-to-screen-us-stocks-like-a-pro-2026', title: 'How to Screen US Stocks Like a Pro: A Complete Guide for 2026', description: 'A complete 2026 guide to screening US stocks — which filters matter, how to combine them, and how to turn a screen into a focused watchlist.', cluster: 'Screening Guides', published_at: '2026-05-28' },
]

export const BLOG_LOOKUP = Object.fromEntries(BLOG_POSTS.map(p => [p.slug, p]))

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function numberOrNull(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function compactUsd(value) {
  const n = numberOrNull(value)
  if (n == null || n <= 0) return '—'
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function usd(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function num(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function pct(value) {
  const n = numberOrNull(value)
  return n == null ? '—' : `${n.toFixed(2)}%`
}

function average(values) {
  const nums = values.map(numberOrNull).filter(v => v != null)
  if (!nums.length) return null
  return nums.reduce((sum, value) => sum + value, 0) / nums.length
}

function median(values) {
  const nums = values.map(numberOrNull).filter(v => v != null).sort((a, b) => a - b)
  if (!nums.length) return null
  const mid = Math.floor(nums.length / 2)
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

function topBuckets(rows, field, limit = 3) {
  const counts = new Map()
  for (const row of rows) {
    const key = String(row?.[field] || '').trim()
    if (!key || key === '—') continue
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
}

function isoDate(value) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

function humanDate(value) {
  return new Date(isoDate(value)).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/New_York',
  })
}

function conditionLabel(condition) {
  const labels = {
    roe: 'ROE',
    roa: 'ROA',
    pb: 'P/B',
    pe: 'P/E',
    ps: 'P/S',
    netMargin: 'Net margin',
    debtToEquity: 'Debt to equity',
    dividendYield: 'Dividend yield',
    sector: 'Sector',
    exchange: 'Exchange',
    price: 'Price',
    marketCap: 'Market cap',
  }
  const metric = labels[condition.metric] || condition.metric
  const value = typeof condition.value === 'number'
    ? (condition.metric === 'marketCap' ? compactUsd(condition.value) : num(condition.value))
    : String(condition.value)
  const op = ({
    '>=': 'at least',
    '>': 'above',
    '<=': 'at most',
    '<': 'below',
    '=': 'equal to',
  })[condition.op] || condition.op
  return `${metric} ${op} ${value}`
}

async function fetchJson(origins, path, init = {}) {
  let lastError = null
  for (const origin of origins) {
    if (!origin) continue
    try {
      const res = await fetch(`${origin}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'DeltaScreener-SEO/1.0',
          ...(init.headers || {}),
        },
      })
      if (!res.ok) {
        lastError = new Error(`API ${res.status}`)
        continue
      }
      return await res.json()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('Could not fetch API data')
}

export async function fetchScreenResults(context, screen) {
  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS].filter(Boolean)
  return fetchJson(apiOrigins, '/screener/custom', {
    method: 'POST',
    body: JSON.stringify({
      page: 1,
      limit: 40,
      sort: screen.sort,
      conditions: screen.conditions,
    }),
  })
}

// Defensive scrub mirroring the worker's sanitizeScreenerRatios — nulls
// impossible values so junk data never renders even if the API lags a deploy.
function scrubSeoRow(row) {
  if (!row || typeof row !== 'object') return row
  const bad = (v, lim) => v != null && Number.isFinite(Number(v)) && Math.abs(Number(v)) > lim
  const out = { ...row }
  if (out.debtToEquity != null && out.debtToEquity < 0) out.roe = null
  if (bad(out.roe, 300)) out.roe = null
  if (bad(out.roa, 200)) out.roa = null
  if (bad(out.netMargin, 200)) out.netMargin = null
  if (out.pe != null && (out.pe <= 0 || out.pe > 2000)) out.pe = null
  return out
}

function screenStats(results = []) {
  const rows = Array.isArray(results) ? results : []
  const sectors = topBuckets(rows, 'sector', 3)
  return {
    // Medians, not means — a single leftover outlier can't distort the header.
    medianRoe: median(rows.map(row => row.roe)),
    medianDebt: median(rows.map(row => row.debtToEquity)),
    medianPe: median(rows.map(row => row.pe)),
    medianPb: median(rows.map(row => row.pb)),
    medianMarketCap: median(rows.map(row => row.mktCap)),
    sectors,
  }
}

function relatedLinks(screen) {
  return (screen.related || [])
    .map(slug => SCREEN_LOOKUP[slug])
    .filter(Boolean)
}

function screenPageJsonLd(screen, payload, url) {
  const topResults = (payload?.results || []).slice(0, 10)
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: screen.h1,
      url,
      description: screen.metaDescription,
      dateModified: isoDate(payload?.updatedAt),
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Stocks', item: `${SITE_ORIGIN}/stocks` },
        { '@type': 'ListItem', position: 3, name: screen.h1, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: topResults.map((row, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_ORIGIN}/stock/${encodeURIComponent(row.ticker)}`,
        name: row.ticker,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (screen.faqs || []).map(([question, answer]) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    },
  ]
}

function layout({ title, description, canonical, robots, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE_ORIGIN}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN}/og-image.png" />
  <meta name="twitter:site" content="@deltascreener" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260812-ovh" />
  <style>
    :root { color-scheme: light; }
    body{margin:0;background:linear-gradient(180deg,#f5f6f0 0%,#fbfbf8 30%,#ffffff 100%);color:#14202b;font-family:Inter,system-ui,sans-serif}
    .seo-wrap{max-width:1180px;margin:0 auto;padding:32px 16px 64px}
    .seo-nav{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774}
    .seo-nav ol{list-style:none;padding:0;margin:0;display:flex;align-items:center;gap:6px}
    .seo-nav li{display:inline-flex;align-items:center;gap:6px}
    .seo-nav a{color:#2563eb;text-decoration:none}
    .seo-nav li+li::before{content:"/";color:#9ca3af;font-weight:400}
    .seo-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.9fr);gap:22px;align-items:start;margin-top:18px}
    .seo-card{background:rgba(255,255,255,.92);border:1px solid rgba(208,214,222,.95);border-radius:24px;box-shadow:0 20px 48px rgba(15,23,42,.06)}
    .seo-hero-main{padding:28px}
    .seo-hero-side{padding:24px;background:linear-gradient(180deg,#fffdf4 0%,#fff 100%)}
    .seo-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px}
    .seo-hero h1{margin:0 0 14px;font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(34px,5vw,58px);line-height:1;letter-spacing:-.05em}
    .seo-hero p{margin:0;color:#55606d;line-height:1.75;font-size:16px}
    .seo-badges{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0}
    .seo-badges span{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:#eef8f5;color:#2563eb;font-size:13px;font-weight:700}
    .seo-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:24px 0}
    .seo-stat{padding:18px;border-radius:20px;border:1px solid rgba(208,214,222,.95);background:#fff}
    .seo-stat strong{display:block;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
    .seo-stat span{display:block;font-size:26px;font-weight:800;color:#0f172a}
    .seo-sections{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,.95fr);gap:22px;margin-top:22px}
    .seo-section{padding:24px}
    .seo-section h2{margin:0 0 14px;font-size:22px;letter-spacing:-.03em}
    .seo-section p,.seo-section li{color:#55606d;line-height:1.75}
    .seo-methodology{margin:0;padding-left:18px}
    .seo-table{width:100%;border-collapse:collapse}
    .seo-table th,.seo-table td{padding:12px 10px;border-bottom:1px solid rgba(226,232,240,.95);text-align:left;font-size:14px}
    .seo-table th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
    .seo-table a{color:#2563eb;text-decoration:none;font-weight:700}
    .seo-chip-grid{display:grid;gap:10px}
    .seo-chip{display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:18px;background:#fff;color:#14202b;text-decoration:none}
    .seo-chip strong{display:block;font-size:15px}
    .seo-chip span{display:block;margin-top:4px;font-size:13px;color:#667180}
    .seo-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .seo-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;font-weight:800;text-decoration:none}
    .seo-btn-primary{background:#2563eb;color:#fff}
    .seo-btn-secondary{background:#fff;color:#14202b;border:1px solid rgba(208,214,222,.95)}
    .seo-faq-item + .seo-faq-item{margin-top:14px}
    .seo-muted{color:#6b7280;font-size:14px}
    .seo-sitebar{background:#fff;border-bottom:1px solid rgba(208,214,222,.95)}
    .seo-sitebar-inner{max-width:1180px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;gap:22px;flex-wrap:wrap}
    .seo-sitebar-logo{font-family:"IBM Plex Serif",Georgia,serif;font-weight:700;font-size:18px;color:#14202b;text-decoration:none;letter-spacing:-.02em}
    .seo-sitebar-logo .accent{color:#2563eb}
    .seo-sitebar-links{display:flex;gap:18px;flex-wrap:wrap}
    .seo-sitebar-links a{color:#55606d;text-decoration:none;font-size:14px;font-weight:600}
    .seo-sitebar-links a:hover{color:#2563eb}
    .seo-sitefooter{border-top:1px solid rgba(208,214,222,.95);margin-top:40px}
    .seo-sitefooter-inner{max-width:1180px;margin:0 auto;padding:24px 16px;display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center;justify-content:space-between;font-size:13px;color:#6b7280}
    .seo-sitefooter-links{display:flex;flex-wrap:wrap;gap:16px}
    .seo-sitefooter-links a{color:#6b7280;text-decoration:none}
    .seo-sitefooter-links a:hover{color:#2563eb}
    @media (max-width: 920px){
      .seo-hero,.seo-sections{grid-template-columns:1fr}
    }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
  <div class="seo-sitebar">
    <div class="seo-sitebar-inner">
      <a class="seo-sitebar-logo" href="/">DELTA<span class="accent">SCREENER</span></a>
      <nav class="seo-sitebar-links" aria-label="Site">
        <a href="/screener">Screener</a>
        <a href="/screeners">Screens</a>
        <a href="/stocks">Stocks</a>
        <a href="/blog">Blog</a>
        <a href="/news">News</a>
      </nav>
    </div>
  </div>
${body}
  <footer class="seo-sitefooter">
    <div class="seo-sitefooter-inner">
      <span>© ${new Date().getFullYear()} DeltaScreener</span>
      <nav class="seo-sitefooter-links" aria-label="Footer">
        <a href="/">Home</a>
        <a href="/screener">Screener</a>
        <a href="/screeners">Screens</a>
        <a href="/stocks">Stocks</a>
        <a href="/blog">Blog</a>
        <a href="/news">News</a>
        <a href="/pricing">Pricing</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
      </nav>
    </div>
  </footer>
</body>
</html>`
}

export function renderScreenPage(screen, payload = {}) {
  const results = (Array.isArray(payload.results) ? payload.results : []).map(scrubSeoRow)
  const stats = screenStats(results)
  const topSectorText = stats.sectors.length
    ? stats.sectors.map(([name, count]) => `${name} (${count})`).join(', ')
    : 'Mixed sectors'
  const related = relatedLinks(screen)
  const canonical = `${SITE_ORIGIN}/stocks/${screen.slug}`
  const indexable = results.length >= 3
  const robots = indexable ? 'index,follow' : 'noindex,follow'
  const updatedAt = isoDate(payload.updatedAt)
  const title = `${screen.title} (${payload.total || results.length || 0} US Stocks) | DeltaScreener`
  const jsonLd = screenPageJsonLd(screen, payload, canonical)
  const tableRows = results.slice(0, 25).map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><a href="/stock/${encodeURIComponent(row.ticker)}">${escapeHtml(row.ticker)}</a></td>
      <td>${escapeHtml(row.name || row.ticker)}</td>
      <td>${escapeHtml(row.exchange || '—')}</td>
      <td>${usd(row.price)}</td>
      <td>${compactUsd(row.mktCap)}</td>
      <td>${num(row.pe)}</td>
      <td>${num(row.pb)}</td>
      <td>${pct(row.roe)}</td>
      <td>${pct(row.roa)}</td>
      <td>${pct(row.netMargin)}</td>
      <td>${num(row.debtToEquity)}</td>
    </tr>
  `).join('')

  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/stocks">Stocks</a></li>
        <li aria-current="page">${escapeHtml(screen.h1)}</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">${escapeHtml(screen.cluster)} screen</div>
        <h1>${escapeHtml(screen.h1)}</h1>
        <p>${escapeHtml(screen.intro)}</p>
        <div class="seo-badges">
          <span>${escapeHtml(`${payload.total || results.length || 0} matching stocks`)}</span>
          <span>${escapeHtml(`Updated ${humanDate(updatedAt)} ET`)}</span>
          <span>${escapeHtml(`${payload.screenableUniverse || '—'} stock screenable universe`)}</span>
        </div>
        <div class="seo-summary">
          <div class="seo-stat"><strong>Median ROE</strong><span>${pct(stats.medianRoe)}</span></div>
          <div class="seo-stat"><strong>Median Debt / Equity</strong><span>${num(stats.medianDebt)}</span></div>
          <div class="seo-stat"><strong>Median P/E</strong><span>${num(stats.medianPe)}</span></div>
          <div class="seo-stat"><strong>Median Market Cap</strong><span>${compactUsd(stats.medianMarketCap)}</span></div>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Screen further</div>
        <p>Use the interactive screener to build custom filters, adjust thresholds, and export results. Over 30 metrics available across the full US stock universe.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open live screener</a>
          <a class="seo-btn seo-btn-secondary" href="/stock/${encodeURIComponent([...results].sort((a, b) => (b.mktCap || 0) - (a.mktCap || 0))[0]?.ticker || 'AAPL')}">View a stock</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Methodology</h2>
        <p>DeltaScreener currently builds this page from your US-listed stock universe using the following rules:</p>
        <ul class="seo-methodology">
          ${screen.conditions.map(condition => `<li>${escapeHtml(conditionLabel(condition))}</li>`).join('')}
        </ul>
        <p class="seo-muted">Top sectors in the current result set: ${escapeHtml(topSectorText)}.</p>
      </article>
      <aside class="seo-card seo-section">
        <h2>Related Screens</h2>
        <div class="seo-chip-grid">
          ${related.map(item => `
            <a class="seo-chip" href="/stocks/${item.slug}">
              <strong>${escapeHtml(item.h1)}</strong>
              <span>${escapeHtml(item.cluster)} screen</span>
            </a>
          `).join('')}
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Current Results</h2>
        <p>Click any ticker to open the full stock detail page with financials, valuation history, and more.</p>
        <div style="overflow:auto">
          <table class="seo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Exchange</th>
                <th>Price</th>
                <th>Market Cap</th>
                <th>P/E</th>
                <th>P/B</th>
                <th>ROE</th>
                <th>ROA</th>
                <th>Net Margin</th>
                <th>D/E</th>
              </tr>
            </thead>
            <tbody>${tableRows || '<tr><td colspan="12">No qualifying stocks were returned for this refresh.</td></tr>'}</tbody>
          </table>
        </div>
      </article>
      <aside class="seo-card seo-section">
        <h2>FAQ</h2>
        ${(screen.faqs || []).map(([question, answer]) => `
          <div class="seo-faq-item">
            <strong>${escapeHtml(question)}</strong>
            <p>${escapeHtml(answer)}</p>
          </div>
        `).join('')}
      </aside>
    </section>
  </main>`

  return {
    html: layout({
      title,
      description: screen.metaDescription,
      canonical,
      robots,
      body,
      jsonLd,
    }),
    lastModified: updatedAt,
    indexable,
  }
}

export function renderStocksHub() {
  const clusters = new Map()
  for (const screen of SCREEN_PAGES) {
    const list = clusters.get(screen.cluster) || []
    list.push(screen)
    clusters.set(screen.cluster, list)
  }
  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Stocks</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">Curated stock screens</div>
        <h1>US Stock Screener Pages</h1>
        <p>Explore curated screens across the US stock universe — quality, value, income, and sector filters, each backed by live fundamental data. Every page links directly to individual stock profiles so you can dig deeper instantly.</p>
        <div class="seo-badges">
          <span>${SCREEN_PAGES.length} curated screens</span>
          <span>Live fundamental data</span>
          <span>NYSE &amp; NASDAQ universe</span>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Build your own screen</div>
        <p>The screens below use preset filters. For full control — custom thresholds, additional metrics, and sorting — use the interactive screener to build your own query.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open interactive screener</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections" style="grid-template-columns:1fr">
      ${[...clusters.entries()].map(([cluster, screens]) => `
        <article class="seo-card seo-section">
          <h2>${escapeHtml(cluster)} Screens</h2>
          <div class="seo-chip-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            ${screens.map(screen => `
              <a class="seo-chip" href="/stocks/${screen.slug}">
                <strong>${escapeHtml(screen.h1)}</strong>
                <span>${escapeHtml(stripHtml(screen.intro).slice(0, 110))}</span>
              </a>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </section>
  </main>`

  return layout({
    title: 'US Stock Screener Pages | DeltaScreener',
    description: 'Browse curated long-tail US stock screener pages rendered on Cloudflare Pages Functions and refreshed from live screener data.',
    canonical: `${SITE_ORIGIN}/stocks`,
    robots: 'index,follow',
    body,
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'US Stock Screener Pages',
      url: `${SITE_ORIGIN}/stocks`,
      inLanguage: 'en-US',
    }],
  })
}

// Prebuilt screener detail pages (/screeners/:slug) — keep in sync with
// PREBUILT_SCREENS in frontend/src/app5.js (slug = screenSlug(name)).
const PREBUILT_SCREENER_SLUGS = ['undervalued-stocks', 'low-pe-stocks', 'low-pb-stocks', 'cheap-stocks-to-buy-now', 'best-value-stocks', 'undervalued-growth-stocks', 'stocks-below-intrinsic-value', 'low-peg-ratio-stocks', 'undervalued-large-cap-stocks', 'undervalued-dividend-stocks', 'growth-stocks', 'high-growth-stocks', 'best-growth-stocks-to-buy', 'small-cap-growth-stocks', 'growth-technology-stocks', 'high-revenue-growth-stocks', 'high-eps-growth-stocks', 'aggressive-small-caps', 'mid-cap-growth-stocks', 'fastest-growing-stocks', 'high-dividend-stocks', 'dividend-stocks', 'best-dividend-stocks', 'dividend-aristocrats', 'dividend-kings', 'monthly-dividend-stocks', 'high-yield-dividend-stocks', 'safe-dividend-stocks', 'dividend-growth-stocks', 'reit-dividend-stocks', 'dividend-stocks-under-5', 'dividend-stocks-under-10', 'low-debt-dividend-stocks', 'dividend-payout-ratio-stocks', 'blue-chip-dividend-stocks', 's-p-500-dividend-stocks', 'high-roe-stocks', 'quality-stocks', 'wide-moat-stocks', 'low-debt-stocks', 'high-profit-margin-stocks', 'high-free-cash-flow-stocks', 'strong-balance-sheet-stocks', 'high-roa-stocks', 'companies-with-highest-roe', 'low-debt-high-roe-stocks', '52-week-high-stocks', 'stocks-near-52-week-high', '52-week-low-stocks', 'oversold-stocks', 'overbought-stocks', 'momentum-stocks', 'breakout-stocks', 'most-active-stocks', 'day-gainers-stocks', 'day-losers-stocks', 'high-volume-stocks', 'stocks-with-unusual-volume', 'penny-stocks', 'penny-stocks-to-buy', 'best-penny-stocks', 'small-cap-stocks', 'large-cap-stocks', 'blue-chip-stocks', 'stocks-under-5', 'stocks-under-10', 'stocks-under-1', 'mega-cap-stocks', 'analyst-strong-buy-stocks', 'stocks-with-insider-buying', 'most-institutionally-bought-stocks', 'stock-buybacks-list', 'hedge-fund-favorite-stocks', 'stocks-warren-buffett-owns', 'recently-upgraded-stocks', 'rising-institutional-ownership-stocks', 'most-shorted-stocks', 'high-short-interest-stocks', 'low-volatility-stocks', 'high-beta-stocks', 'defensive-stocks', 'recession-proof-stocks', 'safe-stocks-to-buy', 'ai-stocks-to-buy', 'semiconductor-stocks', 'ev-stocks', 'tech-stocks-to-buy', 'energy-stocks', 'healthcare-stocks-to-buy', 'bank-stocks', 'cybersecurity-stocks', 'clean-energy-stocks', 'quantum-computing-stocks', 'stock-screener-starter', 'free-stock-screener-picks', 'best-stock-screener-combo', 'nasdaq-style-tech-screen', 'stocks-to-buy-now', 'best-stocks-to-buy-right-now', 'how-to-find-undervalued-stocks']

// Curated comparison pairs (/compare/:a-vs-:b) — high-search-volume matchups.
// Any valid pair works dynamically; these are the ones in the sitemap.
export const COMPARE_PAIRS = [
  'amd-vs-nvda', 'amd-vs-intc', 'nvda-vs-intc', 'nvda-vs-avgo', 'nvda-vs-tsm', 'amd-vs-avgo',
  'aapl-vs-msft', 'msft-vs-googl', 'googl-vs-meta', 'aapl-vs-googl', 'amzn-vs-googl', 'msft-vs-amzn',
  'v-vs-ma', 'jpm-vs-bac', 'jpm-vs-wfc', 'gs-vs-ms', 'axp-vs-v', 'pypl-vs-v',
  'ko-vs-pep', 'wmt-vs-tgt', 'wmt-vs-cost', 'hd-vs-low', 'mcd-vs-sbux', 'nke-vs-lulu',
  'tsla-vs-f', 'tsla-vs-gm', 'f-vs-gm', 'tsla-vs-rivn', 'uber-vs-lyft', 'abnb-vs-bkng',
  'xom-vs-cvx', 'cop-vs-xom', 'oxy-vs-cvx',
  'unh-vs-cvs', 'pfe-vs-mrk', 'lly-vs-pfe', 'jnj-vs-pfe', 'abbv-vs-mrk',
  't-vs-vz', 'tmus-vs-vz', 'dis-vs-nflx', 'cmcsa-vs-dis',
  'crm-vs-orcl', 'adbe-vs-crm', 'ibm-vs-orcl', 'csco-vs-avgo', 'qcom-vs-avgo', 'mu-vs-nvda',
  'ba-vs-lmt', 'cat-vs-de', 'ge-vs-hon', 'ups-vs-fdx',
  'pg-vs-ul', 'pg-vs-cl', 'cost-vs-tgt', 'amzn-vs-wmt',
  'pltr-vs-snow', 'sofi-vs-hood', 'coin-vs-hood', 'shop-vs-amzn',
]

// renderSitemap now only covers static + screen + blog pages.
// Stock pages (~5k) are in /sitemap-stocks.xml (dynamic, fetches all tickers from the API).
// /sitemap.xml is now a sitemap index pointing to both.
export function renderSitemap() {
  const now = new Date().toISOString().split('T')[0]
  const staticUrls = [
    { loc: `${SITE_ORIGIN}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_ORIGIN}/screener`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_ORIGIN}/stocks`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${SITE_ORIGIN}/pricing`, changefreq: 'monthly', priority: '0.5' },
  ]
  const screenUrls = SCREEN_PAGES.map(screen => ({
    loc: `${SITE_ORIGIN}/stocks/${screen.slug}`,
    changefreq: 'daily',
    priority: '0.7',
  }))
  const screenerUrls = [
    { loc: `${SITE_ORIGIN}/screeners`, changefreq: 'weekly', priority: '0.8' },
    ...PREBUILT_SCREENER_SLUGS.map(slug => ({
      loc: `${SITE_ORIGIN}/screeners/${slug}`,
      changefreq: 'daily',
      priority: '0.7',
    })),
  ]
  const compareUrls = COMPARE_PAIRS.map(pair => ({
    loc: `${SITE_ORIGIN}/compare/${pair}`,
    changefreq: 'daily',
    priority: '0.6',
  }))
  // Derived from the single BLOG_POSTS source of truth so the sitemap and the
  // live /blog index can never drift apart again.
  const blogUrls = [
    { loc: `${SITE_ORIGIN}/blog`, changefreq: 'weekly', priority: '0.7' },
    ...BLOG_POSTS.map(post => ({
      loc: `${SITE_ORIGIN}/blog/${post.slug}`,
      lastmod: post.published_at,
      changefreq: 'monthly',
      priority: '0.6',
    })),
  ]
  const allUrls = [...staticUrls, ...screenUrls, ...screenerUrls, ...compareUrls, ...blogUrls]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export function htmlResponse(html, { lastModified = null, indexable = true } = {}) {
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': HTML_CACHE_CONTROL,
  })
  if (lastModified) headers.set('Last-Modified', new Date(isoDate(lastModified)).toUTCString())
  if (!indexable) headers.set('X-Robots-Tag', 'noindex, follow')
  return new Response(html, { status: 200, headers })
}

export function xmlResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': XML_CACHE_CONTROL,
    },
  })
}

export async function withEdgeCache(request, context, buildResponse) {
  const cache = caches.default
  const cacheKey = new Request(request.url, request)
  const hit = await cache.match(cacheKey)
  if (hit) {
    const headers = new Headers(hit.headers)
    headers.set('X-SEO-Cache', 'edge')
    return new Response(hit.body, { status: hit.status, headers })
  }
  const response = await buildResponse()
  if (response.ok) context.waitUntil(cache.put(cacheKey, response.clone()))
  const headers = new Headers(response.headers)
  headers.set('X-SEO-Cache', 'miss')
  return new Response(response.body, { status: response.status, headers })
}
