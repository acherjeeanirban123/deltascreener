// /stocks/[slug] — serves programmatic screen pages with SSR content for SEO
import { SCREEN_LOOKUP, SCREEN_PAGES, renderScreenPage, renderStocksHub, fetchScreenResults, htmlResponse, withEdgeCache } from '../_lib/seo.js'

export async function onRequestGet(context) {
  const { request } = context
  const url = new URL(request.url)
  const slug = url.pathname.replace(/^\/stocks\/?/, '').replace(/\/$/, '')

  // Hub page: /stocks
  if (!slug) {
    return withEdgeCache(request, context, async () => {
      const html = renderStocksHub()
      return htmlResponse(html)
    })
  }

  // Individual screen page: /stocks/[slug]
  const screen = SCREEN_LOOKUP[slug]
  if (!screen) {
    // Unknown slug — real 404
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
  }

  return withEdgeCache(request, context, async () => {
    let payload = {}
    try {
      payload = await fetchScreenResults(context, screen)
    } catch (_) {
      // API unreachable — render with empty results, noindex
      payload = { results: [], total: 0 }
    }
    const { html, lastModified, indexable } = renderScreenPage(screen, payload)
    return htmlResponse(html, { lastModified, indexable })
  })
}
