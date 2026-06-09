import { htmlResponse, renderStocksHub, withEdgeCache } from '../_lib/seo.js'

export async function onRequestGet(context) {
  return withEdgeCache(context.request, context, async () =>
    htmlResponse(renderStocksHub(), { lastModified: new Date().toISOString(), indexable: true })
  )
}
