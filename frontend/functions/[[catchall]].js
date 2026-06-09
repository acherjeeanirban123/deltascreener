// Catch-all: return real 404 for any unrecognized route
// Functions for /stock/*, /blog/*, /stocks/*, /about, /disclaimer, /privacy, /terms, /screens/*
// take priority over this. This only fires for truly unknown paths.
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

// Known valid SPA routes — each with proper canonical/meta for SEO
const VALID_EXACT = new Set(['/', '/screener', '/watchlist', '/portfolio'])
const VALID_PREFIXES = ['/stock/', '/stocks/', '/screens/']
// Note: /blog and /blog/* are NOT in VALID_EXACT or VALID_PREFIXES —
// they are handled by frontend/functions/blog/index.js and blog/[slug].js

const SPA_SHELL_META = {
  '/': null, // served by index.html static asset
  '/screener': null, // handled by screener.js function
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
        <a href="/" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Go Home</a>
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
