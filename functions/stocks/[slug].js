import {
  SCREEN_LOOKUP,
  fetchScreenResults,
  htmlResponse,
  renderScreenPage,
  withEdgeCache,
} from '../_lib/seo.js'

export async function onRequestGet(context) {
  const slug = String(context.params?.slug || '').trim()
  const screen = SCREEN_LOOKUP[slug]
  if (!screen) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
      },
    })
  }

  return withEdgeCache(context.request, context, async () => {
    try {
      const payload = await fetchScreenResults(context, screen)
      const rendered = renderScreenPage(screen, payload)
      return htmlResponse(rendered.html, {
        lastModified: rendered.lastModified,
        indexable: rendered.indexable,
      })
    } catch {
      const rendered = renderScreenPage(screen, { total: 0, results: [], updatedAt: new Date().toISOString() })
      return htmlResponse(rendered.html, {
        lastModified: new Date().toISOString(),
        indexable: false,
      })
    }
  })
}
