// Catch-all: return real 404 for any unrecognized route
// Functions for /stock/*, /blog/*, /stocks/*, /about, /disclaimer, /privacy, /terms, /screens/*
// take priority over this. This only fires for truly unknown paths.
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'
import { PREBUILT_SCREENS_SSR, parseQuerySSR } from './_lib/prebuilt-screens.js'

// Known valid SPA routes — each with proper canonical/meta for SEO
const VALID_EXACT = new Set(['/', '/screener', '/screeners', '/watchlist', '/portfolio', '/alerts', '/news'])
// Note: /screeners/* is NOT a blind prefix — known screens are SSR'd above the
// isValidRoute check, and unknown ones get a real 404 (avoids soft-200 pages).
const VALID_PREFIXES = ['/stock/', '/stocks/', '/screens/']
// Note: /blog and /blog/* are NOT in VALID_EXACT or VALID_PREFIXES —
// they are handled by frontend/functions/blog/index.js and blog/[slug].js

const SPA_SHELL_META = {
  '/': null, // served by index.html static asset
  '/screener': null, // handled by screener.js function
  '/screeners': {
    title: 'Stock Screens — Prebuilt & Saved Screeners | DeltaScreener',
    description: 'Ready-made stock screens for value, growth, dividends and momentum investing, plus your own saved screens. Run any screen on 5,000+ US stocks with one click.',
    canonical: '/screeners',
    robots: 'index,follow',
  },
  '/watchlist': {
    title: 'My Watchlist | DeltaScreener',
    description: 'Track and monitor your favourite stocks with DeltaScreener watchlist.',
    canonical: '/watchlist',
    robots: 'noindex,follow',
  },
  '/portfolio': {
    title: 'My Portfolio | DeltaScreener',
    description: 'Track your stock portfolio performance on DeltaScreener.',
    canonical: '/portfolio',
    robots: 'noindex,follow',
  },
  '/alerts': {
    title: 'Stock Alerts | DeltaScreener',
    description: 'Set price, percent-move, fundamental, and screen alerts and get emailed when conditions are met.',
    canonical: '/alerts',
    robots: 'noindex,follow',
  },
  '/news': {
    title: 'Stock Market News | DeltaScreener',
    description: 'Latest US stock market and company news headlines, updated throughout the day.',
    canonical: '/news',
    robots: 'index,follow',
  },
}

function isValidRoute(pathname) {
  if (VALID_EXACT.has(pathname)) return true
  for (const prefix of VALID_PREFIXES) {
    if (pathname.startsWith(prefix)) return true
  }
  return false
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const rawPathname = url.pathname
  const pathname = rawPathname.replace(/\/$/, '') || '/'

  // Let static assets through (files with extensions like .js, .css, .png, .svg etc)
  if (/\.[a-zA-Z0-9]{1,6}$/.test(pathname)) {
    return env.ASSETS.fetch(request)
  }

  // Trailing slash redirect — strip trailing slash and 301
  if (rawPathname !== '/' && rawPathname.endsWith('/')) {
    return Response.redirect(`${SITE_ORIGIN}${pathname}${url.search}`, 301)
  }

  // Screen detail pages — /screeners/:slug — full server-side render (like
  // screener.in screen pages): h1, description, query, and a real stock table
  // baked into the HTML so Google indexes complete content on first crawl.
  // Screens hub — /screeners — fully server-rendered (like screener.in/screens/):
  // h1 + all prebuilt screen links grouped by category + paginated community
  // screens as crawlable links, so Google discovers every screen page by link.
  if (pathname === '/screeners') {
    const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const hubPage = Math.min(200, Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1))
    const cache = caches.default
    const cacheKey = new Request(`${SITE_ORIGIN}/screeners?page=${hubPage}`, { method: 'GET' })
    const cached = await cache.match(cacheKey)
    if (cached) return cached

    let community = []
    let communityTotal = 0
    let communityPages = 1
    try {
      const res = await fetch(`https://api-vps.deltascreener.com/screens/public?page=${hubPage}&limit=24`, { signal: AbortSignal.timeout(6000) })
      if (res.ok) {
        const data = await res.json()
        community = data.screens || []
        communityTotal = data.total || 0
        communityPages = data.pages || 1
      }
    } catch (_) {}
    const slugify = n => String(n || 'screen').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'screen'
    const cats = [...new Set(PREBUILT_SCREENS_SSR.map(s => s.cat))]

    const hubBody = `
      <main class="container" style="padding:24px 16px 56px;max-width:1100px;margin:0 auto;font-family:Inter,system-ui,sans-serif">
        <h1 style="font-size:36px;font-weight:900;letter-spacing:-.02em;margin:0 0 6px">Stock Screens</h1>
        <p style="font-size:17px;color:#434651;margin:0 0 22px;max-width:760px">${PREBUILT_SCREENS_SSR.length} ready-made stock screens plus ${communityTotal ? communityTotal.toLocaleString('en-US') : ''} community screens created by DeltaScreener users. Every screen runs live against 5,000+ NYSE &amp; NASDAQ stocks and is fully editable. <a href="/screener" style="color:#2563eb">Or build your own from scratch →</a></p>
        ${hubPage === 1 ? cats.map(cat => `
          <section style="margin-bottom:26px">
            <h2 style="font-size:20px;font-weight:800;margin:0 0 10px">${esc(cat)} Screens</h2>
            <ul style="line-height:2;padding-left:18px;margin:0">
              ${PREBUILT_SCREENS_SSR.filter(s => s.cat === cat).map(s => `<li><a href="/screeners/${s.slug}" style="color:#2563eb;text-decoration:none;font-weight:600">${esc(s.name)}</a> — ${esc(s.desc)}</li>`).join('')}
            </ul>
          </section>`).join('') : ''}
        <section style="margin-bottom:26px">
          <h2 style="font-size:20px;font-weight:800;margin:0 0 10px">Community Screens${communityTotal ? ` <span style="font-size:13px;font-weight:600;color:#787b86">(${communityTotal.toLocaleString('en-US')} screens by users${communityPages > 1 ? ` — page ${hubPage} of ${communityPages}` : ''})</span>` : ''}</h2>
          ${community.length ? `
          <ul style="line-height:2;padding-left:18px;margin:0">
            ${community.map(s => `<li><a href="/screeners/${s.id}/${slugify(s.name)}" style="color:#2563eb;text-decoration:none;font-weight:600">${esc(String(s.name).slice(0, 80))}</a></li>`).join('')}
          </ul>` : '<p style="color:#787b86">No community screens on this page yet. Save a screen in the screener and it appears here.</p>'}
          ${communityPages > 1 ? `
          <nav style="display:flex;gap:10px;margin-top:14px;font-size:14px;font-weight:600">
            ${hubPage > 1 ? `<a href="/screeners${hubPage - 1 > 1 ? `?page=${hubPage - 1}` : ''}" style="color:#2563eb;text-decoration:none">← Prev</a>` : ''}
            ${Array.from({ length: communityPages }, (_, i) => i + 1).filter(p => p === 1 || p === communityPages || Math.abs(p - hubPage) <= 2).map(p => p === hubPage ? `<strong>${p}</strong>` : `<a href="/screeners${p > 1 ? `?page=${p}` : ''}" style="color:#2563eb;text-decoration:none">${p}</a>`).join(' ')}
            ${hubPage < communityPages ? `<a href="/screeners?page=${hubPage + 1}" style="color:#2563eb;text-decoration:none">Next →</a>` : ''}
          </nav>` : ''}
        </section>
      </main>`

    const hubResponse = new Response(renderSpaShell({
      title: `Stock Screens — ${PREBUILT_SCREENS_SSR.length}+ Free Prebuilt & Community Screeners${hubPage > 1 ? ` — Page ${hubPage}` : ''} | DeltaScreener`,
      description: 'Browse 100 ready-made stock screens for value, growth, dividend, quality and momentum investing, plus community screens by DeltaScreener users. All free, all live.',
      canonicalUrl: `${SITE_ORIGIN}/screeners${hubPage > 1 ? `?page=${hubPage}` : ''}`,
      robots: 'index,follow',
      bodyHtml: hubBody,
    }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=1800' },
    })
    context.waitUntil(cache.put(cacheKey, hubResponse.clone()))
    return hubResponse
  }

  if (pathname.startsWith('/screeners/')) {
    const rest = pathname.slice('/screeners/'.length)
    const communityMatch = rest.match(/^(\d+)(?:\/([a-z0-9-]*))?$/)
    let screen = null
    let isCommunity = false
    if (communityMatch) {
      // Community screen — /screeners/:id/:slug — fetch the (anonymized) saved
      // screen from the API and parse its query server-side.
      try {
        const apiRes = await fetch(`https://api-vps.deltascreener.com/screens/public/${communityMatch[1]}`, { signal: AbortSignal.timeout(6000) })
        if (apiRes.ok) {
          const data = await apiRes.json()
          if (data?.screen?.query) {
            const conditions = parseQuerySSR(data.screen.query)
            const queryParts = String(data.screen.query).split(/\s+AND\s+/i).filter(p => p.trim()).length
            screen = {
              name: String(data.screen.name || 'Community Screen').slice(0, 80),
              desc: 'A community stock screen created and shared by a DeltaScreener user.',
              cat: 'Community',
              q: String(data.screen.query).replace(/\s+/g, ' ').trim(),
              conditions,
              // Fully parseable = every AND-part became a condition. Partially
              // parseable screens still render but are noindexed (table wouldn't
              // match the displayed query).
              fullyParsed: conditions.length > 0 && conditions.length === queryParts,
            }
            isCommunity = true
          }
        }
      } catch (_) { /* API down/unknown id — fall through to 404 */ }
    } else if (rest && !rest.includes('/')) {
      screen = PREBUILT_SCREENS_SSR.find(s => s.slug === rest)
    }
    if (!screen) {
        // Unknown screen — fall through to the 404 below
    } else {
      {
        // Crawlable result pagination + sorting (like screener.in): ?page=N and
        // ?sort=<field>&order=asc|desc are honored server-side.
        const PAGE_SIZE = 25
        const SORTABLE = { currentPrice: 'Price', changePct: 'Change %', mktCap: 'Market Cap', pe: 'P/E', roe: 'ROE', dividendYield: 'Div Yield' }
        const resultPage = Math.min(80, Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1))
        const sortParam = url.searchParams.get('sort')
        const sortField = SORTABLE[sortParam] ? sortParam : 'mktCap'
        const sortDir = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc'
        const isSorted = !!SORTABLE[sortParam]

        // Serve from edge cache when possible (data refreshes hourly)
        const cache = caches.default
        const cacheKey = new Request(`${SITE_ORIGIN}${pathname}?page=${resultPage}&sort=${sortField}&order=${sortDir}`, { method: 'GET' })
        const cached = await cache.match(cacheKey)
        if (cached) return cached

        let rows = []
        let total = 0
        try {
          if (!screen.conditions.length) throw new Error('no parseable conditions')
          const apiRes = await fetch('https://api-vps.deltascreener.com/screener/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conditions: screen.conditions, page: resultPage, limit: PAGE_SIZE, sort: { field: sortField, dir: sortDir } }),
            signal: AbortSignal.timeout(8000),
          })
          const data = await apiRes.json()
          rows = data.results || []
          total = data.total || rows.length
        } catch (_) { /* API down — render without table, SPA fills it in */ }
        const totalPages = Math.max(1, Math.ceil(Math.min(total, 2000) / PAGE_SIZE))

        const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        const fmtUsd = v => (v == null || !Number.isFinite(Number(v))) ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const fmtPct = v => (v == null || !Number.isFinite(Number(v))) ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(2) + '%'
        const fmtPctAbs = v => (v == null || !Number.isFinite(Number(v))) ? '—' : Number(v).toFixed(2) + '%'
        const fmtNum = v => (v == null || !Number.isFinite(Number(v)) || Number(v) <= 0) ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 })
        const fmtCap = v => {
          const n = Number(v)
          if (!Number.isFinite(n) || n <= 0) return '—'
          if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
          if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
          if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
          return '$' + n.toFixed(0)
        }

        const related = isCommunity
          ? PREBUILT_SCREENS_SSR.slice(0, 6)
          : PREBUILT_SCREENS_SSR.filter(s => s.cat === screen.cat && s.slug !== rest).slice(0, 6)
        // Sortable column headers — links canonical back to the unsorted URL,
        // so Google crawls them without indexing duplicate variants.
        const sortLink = (key, label) => {
          const nextDir = (sortField === key && sortDir === 'desc') ? 'asc' : 'desc'
          return `<a href="${pathname}?sort=${key}&amp;order=${nextDir}" style="color:inherit;text-decoration:none">${label}${sortField === key && isSorted ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}</a>`
        }
        const pageQS = p => `${pathname}${p > 1 ? `?page=${p}` : ''}${isSorted ? `${p > 1 ? '&amp;' : '?'}sort=${sortField}&amp;order=${sortDir}` : ''}`
        const pagerHtml = totalPages > 1 ? `
          <nav style="display:flex;gap:10px;justify-content:center;align-items:center;margin-top:18px;font-size:14px;font-weight:600">
            ${resultPage > 1 ? `<a href="${pageQS(resultPage - 1)}" style="color:#2563eb;text-decoration:none">← Prev</a>` : ''}
            ${Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - resultPage) <= 2).map((p, i, arr) => `${i > 0 && arr[i - 1] !== p - 1 ? '<span style="color:#787b86">…</span>' : ''}${p === resultPage ? `<strong>${p}</strong>` : `<a href="${pageQS(p)}" style="color:#2563eb;text-decoration:none">${p}</a>`}`).join(' ')}
            ${resultPage < totalPages ? `<a href="${pageQS(resultPage + 1)}" style="color:#2563eb;text-decoration:none">Next →</a>` : ''}
          </nav>` : ''
        const tableHtml = rows.length ? `
          <div class="tbl-scroll"><table class="tbl">
            <thead><tr><th style="text-align:left">#</th><th style="text-align:left">Company</th><th>${sortLink('currentPrice', 'Price')}</th><th>${sortLink('changePct', 'Change %')}</th><th>${sortLink('mktCap', 'Market Cap')}</th><th>${sortLink('pe', 'P/E')}</th><th>${sortLink('roe', 'ROE')}</th><th>${sortLink('dividendYield', 'Div Yield')}</th><th>Sector</th></tr></thead>
            <tbody>
              ${rows.map((r, i) => `<tr>
                <td style="text-align:left">${(resultPage - 1) * PAGE_SIZE + i + 1}</td>
                <td style="text-align:left"><a href="/stock/${esc(r.ticker)}" style="text-decoration:none;color:inherit"><strong>${esc(r.ticker)}</strong>${r.name && r.name !== r.ticker ? ` <span style="color:#787b86;font-size:12px">${esc(String(r.name).slice(0, 40))}</span>` : ''}</a></td>
                <td>${fmtUsd(r.currentPrice ?? r.price)}</td>
                <td>${fmtPct(r.changePct)}</td>
                <td>${fmtCap(r.mktCap ?? r.marketCap)}</td>
                <td>${fmtNum(r.pe)}</td>
                <td>${fmtPctAbs(r.roe)}</td>
                <td>${fmtPctAbs(r.dividendYield)}</td>
                <td style="font-size:12px">${esc(r.sector || '—')}</td>
              </tr>`).join('')}
            </tbody>
          </table></div>` : '<p style="color:#787b86">Results are loading — open this page in a browser to see live matches.</p>'

        const bodyHtml = `
          <main class="container" style="padding:24px 16px 56px;max-width:1100px;margin:0 auto;font-family:Inter,system-ui,sans-serif">
            <nav style="font-size:13px;color:#787b86;margin-bottom:10px"><a href="/screeners" style="color:#2563eb;text-decoration:none">Screens</a> › ${esc(screen.cat)}</nav>
            <h1 style="font-size:34px;font-weight:900;letter-spacing:-.02em;margin:0 0 6px">${esc(screen.name)}</h1>
            <p style="font-size:17px;color:#434651;margin:0 0 18px;max-width:720px">${esc(screen.desc)} This is a free, ready-made stock screen on DeltaScreener that filters 5,000+ NYSE &amp; NASDAQ stocks in real time. Click any company to see its full financials, or edit the filters to make the screen your own.</p>
            <section style="background:#f8fafc;border:1px solid #e7e9f0;border-radius:12px;padding:14px 18px;margin-bottom:22px">
              <h2 style="font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#787b86;margin:0 0 6px">Search Query</h2>
              <code style="font-size:13px;color:#434651">${esc(screen.q)}</code>
            </section>
            <h2 style="font-size:20px;font-weight:800;margin:0 0 4px">Matching Stocks${total ? ` <span style="font-size:13px;font-weight:600;color:#787b86">(${total.toLocaleString('en-US')} results${totalPages > 1 ? ` — page ${resultPage} of ${totalPages}` : ''}, sorted by ${SORTABLE[sortField] || 'Market Cap'})</span>` : ''}</h2>
            ${tableHtml}
            ${pagerHtml}
            ${related.length ? `
            <h2 style="font-size:18px;font-weight:800;margin:28px 0 10px">${isCommunity ? 'Popular Prebuilt Screens' : `Related ${esc(screen.cat)} Screens`}</h2>
            <ul style="line-height:2;padding-left:18px">
              ${related.map(s => `<li><a href="/screeners/${s.slug}" style="color:#2563eb;text-decoration:none">${esc(s.name)}</a> — ${esc(s.desc)}</li>`).join('')}
            </ul>` : ''}
            <p style="margin-top:24px"><a href="/screener" style="color:#2563eb;font-weight:700;text-decoration:none">Build your own screen with 50+ ratios →</a></p>
          </main>`

        const jsonLd = [
          { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Screens', item: `${SITE_ORIGIN}/screeners` },
            { '@type': 'ListItem', position: 2, name: screen.name, item: `${SITE_ORIGIN}${pathname}` },
          ]},
          rows.length ? { '@context': 'https://schema.org', '@type': 'ItemList', name: `${screen.name} — Stock Screen`, numberOfItems: total, itemListElement: rows.slice(0, 10).map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.ticker, url: `${SITE_ORIGIN}/stock/${r.ticker}` })) } : null,
        ].filter(Boolean)

        const response = new Response(renderSpaShell({
          title: `${screen.name} — Stock Screen (${total ? total.toLocaleString('en-US') + ' Results' : 'Live Results'})${resultPage > 1 ? ` — Page ${resultPage}` : ''} | DeltaScreener`,
          description: `${screen.desc} Free ${screen.name.toLowerCase()} screen: ${screen.q.slice(0, 110)}. Live results from 5,000+ US stocks.`,
          // Paginated pages self-canonical (unique content); sorted variants
          // canonical back to the unsorted URL to avoid duplicate indexing.
          canonicalUrl: `${SITE_ORIGIN}${pathname}${resultPage > 1 ? `?page=${resultPage}` : ''}`,
          // Thin-content guard: community screens with unparseable queries or
          // fewer than 3 results are served but not indexed, so junk saved
          // screens can never hurt site-wide SEO quality.
          robots: (isCommunity && (rows.length < 3 || !screen.fullyParsed)) ? 'noindex,follow' : 'index,follow',
          jsonLd,
          bodyHtml,
        }), {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
        })
        context.waitUntil(cache.put(cacheKey, response.clone()))
        return response
      }
    }
  }

  // Let known SPA routes through
  if (isValidRoute(pathname)) {
    const meta = SPA_SHELL_META[pathname]
    // Routes with specific meta → render shell with correct canonical
    if (meta) {
      return new Response(renderSpaShell({
        title: meta.title,
        description: meta.description,
        canonicalUrl: `${SITE_ORIGIN}${meta.canonical}`,
        robots: meta.robots || 'index,follow',
      }), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
      })
    }
    // Fallback: serve index.html from static asset binding (for / and /screener handled by their own functions)
    try {
      const assetReq = new Request(`${SITE_ORIGIN}/index.html`, { headers: request.headers })
      const res = await env.ASSETS.fetch(assetReq)
      const html = await res.text()
      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' },
      })
    } catch (_) {
      // ASSETS binding unavailable — fall through to 404
    }
  }

  // Everything else → real 404
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:96px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:72px;font-weight:900;color:#e5e7eb;line-height:1;margin-bottom:20px">404</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:32px;color:#111827;margin:0 0 12px">Page not found</h1>
      <p style="color:#6b7280;font-size:16px;line-height:1.65;margin:0 0 32px;max-width:480px;margin-left:auto;margin-right:auto">
        This page doesn't exist. It may have been moved, deleted, or the URL may be wrong.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="/" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Go Home</a>
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Stock Screener</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title: 'Page Not Found | DeltaScreener',
    description: 'The page you are looking for does not exist on DeltaScreener.',
    canonicalUrl: `${SITE_ORIGIN}/`,
    robots: 'noindex,nofollow',
    bodyHtml,
  }), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
