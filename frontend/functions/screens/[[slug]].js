// 301 redirect all /screens/* → /stocks/* permanently
export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const slug = url.pathname.replace(/^\/screens\//, '').replace(/\/$/, '')
  const destination = slug ? `/stocks/${slug}` : '/stocks'
  return Response.redirect(`https://deltascreener.com${destination}`, 301)
}
