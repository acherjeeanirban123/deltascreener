// v20260609-darkmode
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

function markdownToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'IBM Plex Serif\',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f3f4f6;font-weight:700">$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:8px;color:#f3f4f6">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:16px 0;color:#f3f4f6">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 20px;color:#f3f4f6;line-height:1.8">')
    .replace(/^(?!<[h|u|l])(.+)$/gm, (m) => m.startsWith('<') ? m : m)
    .replace(/^<\/p><p[^>]*>(<h[23])/gm, '$1')
    .replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, '$1')
    .trim()
}

export async function onRequestGet({ params, env }) {
  const slug = params.slug

  // Fetch the post from D1
  let post = null
  let relatedPosts = []
  try {
    post = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first()

    if (post) {
      const { results } = await env.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts
         WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all()
      relatedPosts = results || []
    }
  } catch (_) {}

  // 404 page
  if (!post) {
    const notFoundHtml = `
      <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
      <main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#0f1117;color:#f3f4f6">
        <div style="font-size:64px;margin-bottom:16px">📄</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
        <p style="color:#9ca3af;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
        <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:700;font-size:15px">← Back to Blog</a>
      </main>`
    return new Response(renderSpaShell({
      title: 'Article Not Found | DeltaScreener',
      description: 'This blog post could not be found.',
      canonicalUrl: `${SITE_ORIGIN}/blog`,
      robots: 'noindex,nofollow',
      bodyHtml: notFoundHtml,
    }), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`
  const title        = `${post.title} | DeltaScreener`
  const description  = post.description

  // Parse FAQs (handle double-encoded JSON)
  let faqs = []
  try {
    let raw = post.faqs || '[]'
    let parsed = JSON.parse(raw)
    // If still a string (double-encoded), parse again
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    faqs = Array.isArray(parsed) ? parsed : []
  } catch (_) {}

  // Build JSON-LD
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      url: canonicalUrl,
      datePublished: post.published_at,
      dateModified: post.published_at,
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
      ],
    },
    ...(faqs.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    }] : []),
  ]

  // Related posts section
  const relatedHtml = relatedPosts.length > 0 ? `
    <section style="margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.08)">
      <h3 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0 0 20px">Related Articles</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${relatedPosts.map(r => `
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.08)'" onmouseout="this.style.background='rgba(255,255,255,.04)'">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>
        `).join('')}
      </div>
    </section>` : ''

  // FAQ section
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:0 0 20px">Frequently Asked Questions</h2>
      ${faqs.map(f => `
        <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.07)">
          <h3 style="font-size:16px;font-weight:700;color:#e5e7eb;margin:0 0 8px">${f.q}</h3>
          <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
        </div>
      `).join('')}
    </section>` : ''

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const bodyHtml = `
    <style>
      body, html { background: #0f1117 !important; color: #f3f4f6 !important; }
      body[data-theme='light'] { background: #0f1117 !important; color: #f3f4f6 !important; }
      [data-prerender-shell] { background: #0f1117; color: #f3f4f6; }
      [data-prerender-shell] p { color: #f3f4f6; }
      [data-prerender-shell] li { color: #f3f4f6; }
      [data-prerender-shell] strong { color: #ffffff; }
      [data-prerender-shell] article { color: #f3f4f6; }
    </style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6;background:#0f1117">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;flex-wrap:wrap">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li style="color:#4b5563">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li style="color:#4b5563">/</li>
          <li style="color:#6b7280;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${post.title}</li>
        </ol>
      </nav>

      <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">${post.cluster}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,42px);line-height:1.1;letter-spacing:-.03em;margin:0 0 16px;color:#f9fafb">${post.title}</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 8px">${post.description}</p>
      <div style="font-size:13px;color:#6b7280;margin-bottom:36px">Published ${formattedDate} · DeltaScreener</div>

      <article style="font-size:16px;line-height:1.8;color:#f3f4f6">
        <p style="margin:0 0 20px;color:#f3f4f6;line-height:1.8">${markdownToHtml(post.content || '')}</p>
      </article>

      ${faqHtml}

      <div style="margin-top:48px;border-radius:20px;background:linear-gradient(135deg,#0f2620 0%,#0a1628 100%);border:1px solid rgba(45,212,191,.25);padding:28px">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Free Tool</div>
        <strong style="display:block;font-family:'IBM Plex Serif',Georgia,serif;font-size:20px;font-weight:700;color:#f9fafb;margin-bottom:8px;line-height:1.3">Screen 5,000+ US Stocks Instantly</strong>
        <p style="margin:0 0 20px;color:#9ca3af;line-height:1.7;font-size:14px">Apply any filter from this guide — ROE, FCF, P/E, margins, and 30+ more. No sign-up required.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>

      ${relatedHtml}

      <div style="margin-top:40px">
        <a href="/blog" style="color:#2dd4bf;font-weight:600;font-size:14px;text-decoration:none">← Back to Blog</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    ogTitle: post.title,
    ogDescription: post.description,
    ogUrl: canonicalUrl,
    keywords: `${post.cluster}, stock screening, ${post.title}, DeltaScreener`,
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
