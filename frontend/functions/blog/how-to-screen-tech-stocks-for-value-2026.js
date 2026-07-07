import { SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  return Response.redirect(`${SITE_ORIGIN}/blog/how-to-screen-tech-stocks-for-value`, 301)
}

