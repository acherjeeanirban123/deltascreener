// v20260607-dark
import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

function markdownToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'IBM Plex Serif\',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px">')
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
      <main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
        <div style="font-size:64px;margin-bottom:16px">📄</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
        <p style="color:#6b7280;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
        <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#2962ff;color:#fff;text-decoration:none;font-weight:700;font-size:15px">← Back to Blog</a>
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
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;transition:background .15s,transform .15s" onmouseover="this.style.background='rgba(255,255,255,.08)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.transform='none'">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>
        `).join('')}
      </div>
    </section>` : ''

  // FAQ section
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;border-radius:20px;background:#111827;border:1px solid rgba(45,212,191,.15);overflow:hidden">
      <div style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(45,212,191,.05)">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0;display:flex;align-items:center;gap:10px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(45,212,191,.15);color:#2dd4bf;font-size:16px;flex-shrink:0">?</span>
          Frequently Asked Questions
        </h2>
      </div>
      <div style="padding:8px 0">
        ${faqs.map((f,i) => `
          <div style="padding:20px 28px;${i < faqs.length-1 ? 'border-bottom:1px solid rgba(255,255,255,.05)' : ''}">
            <h3 style="font-size:15px;font-weight:700;color:#e5e7eb;margin:0 0 10px;line-height:1.4">${f.q}</h3>
            <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
          </div>`).join('')}
      </div>
    </section>` : ''

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li style="color:#6b7280">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li style="color:#6b7280">/</li>
          <li style="color:#9ca3af;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${post.title}</li>
        </ol>
      </nav>

      <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">${post.cluster}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,42px);line-height:1.1;letter-spacing:-.03em;margin:0 0 16px;color:#f9fafb">${post.title}</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 8px">${post.description}</p>
      <div style="font-size:13px;color:#6b7280;margin-bottom:36px">Published ${formattedDate} · DeltaScreener</div>

      <article style="font-size:16px;line-height:1.8;color:#d1d5db">
        ${markdownToHtml(post.content || '')}
      </article>

      ${faqHtml}

      <div style="margin-top:48px;border-radius:20px;background:linear-gradient(135deg,#0f2620 0%,#0a1628 100%);border:1px solid rgba(45,212,191,.25);padding:32px 28px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(45,212,191,.06);pointer-events:none"></div>
        <div style="position:absolute;bottom:-20px;left:40px;width:80px;height:80px;border-radius:50%;background:rgba(45,212,191,.04);pointer-events:none"></div>
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:12px">Free Tool</div>
        <strong style="display:block;font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin-bottom:10px;line-height:1.3">Screen 5,000+ US Stocks Instantly</strong>
        <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.7">Filter by ROE, P/E, debt, revenue growth and 30+ more metrics. No sign-up required.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:-.01em">
          Open Free Screener
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
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
    lightMode: true,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
