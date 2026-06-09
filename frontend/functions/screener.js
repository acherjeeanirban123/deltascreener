// Screener page — serves SPA shell with correct canonical (strips query params for SEO)
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet(context) {
  const { request, env } = context

  const html = renderSpaShell({
    title: 'Stock Screener — Filter 4,900+ US Stocks | DeltaScreener',
    description: 'Free stock screener with 30+ filters. Screen NYSE and NASDAQ stocks by PE, ROE, debt, margins, returns and more. Custom query language included.',
    canonicalUrl: `${SITE_ORIGIN}/screener`,
    robots: 'index,follow',
    keywords: 'stock screener, US stock screener, NYSE screener, NASDAQ screener, fundamental stock screener',
  })

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
