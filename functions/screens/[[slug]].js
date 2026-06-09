import { SCREEN_LOOKUP, fetchScreenResults, renderScreenPage, htmlResponse, withEdgeCache } from '../_lib/seo.js'

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const slug = url.pathname.replace('/screens/', '').replace(/\/$/, '')

  const screen = SCREEN_LOOKUP[slug]
  if (!screen) {
    return new Response('Not found', { status: 404 })
  }

  return withEdgeCache(context.request, context, async () => {
    const payload = await fetchScreenResults(context, screen)
    const html = renderScreenPage(screen, payload)
    return htmlResponse(html)
  })
}
