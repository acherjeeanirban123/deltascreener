export const SITE_ORIGIN = 'https://deltascreener.com'

export function renderSpaShell({ title, description, canonicalUrl, keywords = '', jsonLd = [], bodyHtml = '', robots = 'index,follow' }) {
  const jsonLdStr = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])
  // Wrap bodyHtml in a prerender-shell marker so the SPA knows SSR content exists
  // and doesn't trigger a full-page reload on blog/stock pages
  const shellContent = bodyHtml
    ? `<div data-prerender-shell="1">${bodyHtml}</div>`
    : ''
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://deltascreener.com/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="https://deltascreener.com/og-image.png" />
  <meta name="twitter:site" content="@deltascreener" />
  <script type="application/ld+json">${jsonLdStr}</script>
  <link rel="icon" type="image/svg+xml" href="/favicon2.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles.css?v=20260607-fixes" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-40Y2P275ZZ"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-40Y2P275ZZ', { send_page_view: false });
  </script>
</head>
<body>
  <div id="app">${shellContent}</div>
  <script type="module" src="/src/main2.js?v=20260607-fixes"></script>
</body>
</html>`
}
