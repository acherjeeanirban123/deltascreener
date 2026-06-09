const SITE_ORIGIN = 'https://deltascreener.com'

export async function onRequestGet() {
  const content = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Block API and auth routes from crawlers',
    'Disallow: /api/',
    'Disallow: /auth/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
  ].join('\n')

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
