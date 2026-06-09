import { renderSitemap, xmlResponse } from './_lib/seo.js'

export async function onRequestGet() {
  return xmlResponse(renderSitemap())
}
