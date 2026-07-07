// Static sitemap: all non-stock pages (screens, blog, tools)
import { renderSitemap, xmlResponse } from '../_lib/seo.js'

export async function onRequestGet() {
  return xmlResponse(renderSitemap())
}
