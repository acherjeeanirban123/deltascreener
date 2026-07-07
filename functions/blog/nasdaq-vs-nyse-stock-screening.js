import { SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  return Response.redirect(`${SITE_ORIGIN}/blog/nyse-vs-nasdaq-stock-picking`, 301)
}
