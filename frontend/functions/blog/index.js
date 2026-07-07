// v20260628-themefix
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'
import { BLOG_POSTS } from '../_lib/seo.js'

export async function onRequestGet({ env }) {
  const title       = 'Stock Investing Guides | DeltaScreener Blog'
  const description = 'Practical guides on stock screening, valuation metrics, and investing strategies. Learn how to use filters like ROE, P/E, and debt-to-equity to find better stocks.'
  const canonicalUrl = `${SITE_ORIGIN}/blog`

  // Static fallback article list (newest first) — shown when DB is unavailable.
  // Derived from the shared BLOG_POSTS source of truth so the blog index and the
  // sitemap can never list different articles.
  const STATIC_ARTICLES = BLOG_POSTS

  // Fetch posts dynamically from D1
  let posts = []
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, title, description, cluster, published_at
       FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all()
    posts = results && results.length > 0 ? results : STATIC_ARTICLES
  } catch (_) {
    // DB not ready yet — fall back to static list
    posts = STATIC_ARTICLES
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'DeltaScreener Blog',
      description,
      url: canonicalUrl,
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: canonicalUrl },
      ],
    },
  ]

  const articleCards = posts.length === 0
    ? `<div style="text-align:center;padding:60px 20px;color:#9ca3af">
        <p style="font-size:18px;font-weight:600;color:#e5e7eb;margin:0 0 8px">New guides coming soon</p>
        <p style="font-size:14px;margin:0">We publish stock screening and investing guides regularly. Check back tomorrow!</p>
       </div>`
    : posts.map(article => `
      <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;margin-bottom:14px;transition:box-shadow .15s,transform .15s,background .15s;color:#f3f4f6" onmouseover="this.style.background='rgba(255,255,255,.07)';this.style.boxShadow='0 4px 24px rgba(0,0,0,.35)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.boxShadow='none';this.style.transform='none'">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px">${article.cluster}</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:21px;line-height:1.28;letter-spacing:-.03em;margin:0 0 10px;color:#f9fafb">${article.title}</h2>
        <p style="margin:0 0 10px;color:#9ca3af;font-size:14px;line-height:1.6">${article.description}</p>
        <span style="font-size:12px;color:#6b7280">${new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </a>
    `).join('')

  const bodyHtml = `
    <style>
      /* Dark is the default; the blog index now respects the site theme. */
      body[data-theme='dark'], html { background: #0f1117; color: #f3f4f6; }

      /* Light mode: flip the hardcoded dark inline colors to readable light ones. */
      body[data-theme='light'] { background: #ffffff !important; color: #1f2937 !important; }
      body[data-theme='light'] [data-prerender-shell],
      body[data-theme='light'] [data-prerender-shell] main { background: #ffffff !important; color: #1f2937 !important; }
      body[data-theme='light'] [data-prerender-shell] h1,
      body[data-theme='light'] [data-prerender-shell] h2 { color: #0f172a !important; }
      body[data-theme='light'] [data-prerender-shell] p,
      body[data-theme='light'] [data-prerender-shell] li,
      body[data-theme='light'] [data-prerender-shell] span { color: #334155 !important; }
      body[data-theme='light'] [data-prerender-shell] strong { color: #0f172a !important; }
      /* Article cards: light-grey surface + visible border instead of the dark overlay. */
      body[data-theme='light'] [data-prerender-shell] a[href^="/blog"] {
        background: #f8fafc !important; border-color: #e2e8f0 !important; color: #334155 !important;
      }
      body[data-theme='light'] [data-prerender-shell] nav a,
      body[data-theme='light'] [data-prerender-shell] a[href^="/blog"] h2 { color: #0f172a !important; }
    </style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#374151">/</li>
          <li aria-current="page" style="color:#9ca3af">Blog</li>
        </ol>
      </nav>
      <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing Guides</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 12px;color:#f9fafb">DeltaScreener Blog</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies — written for investors who want to understand what the numbers mean.</p>
      <div>${articleCards}</div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.18)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#9ca3af;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter combination — no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'stock investing guides, stock screening blog, ROE investing, how to screen stocks, DeltaScreener blog',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
