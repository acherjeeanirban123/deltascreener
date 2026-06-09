// v20260607-unified
// Unified catch-all: handles /blog, /blog/[slug], and SPA fallback
import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

function markdownToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-family:\'IBM Plex Serif\',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 16px">')
    .replace(/^<\/p><p[^>]*>(<h[23])/gm, '$1')
    .replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, '$1')
    .trim()
}

async function handleBlogIndex({ env }) {
  const title       = 'Stock Investing Guides | DeltaScreener Blog'
  const description = 'Practical guides on stock screening, valuation metrics, and investing strategies.'
  const canonicalUrl = `${SITE_ORIGIN}/blog`

  let posts = []
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, title, description, cluster, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all()
    posts = results && results.length > 0 ? results : []
  } catch (_) {}

  const articleCards = posts.length === 0
    ? `<p style="color:#9ca3af;text-align:center;padding:40px">No articles yet.</p>`
    : posts.map(article => `
      <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;margin-bottom:14px;transition:background .15s,transform .15s" onmouseover="this.style.background='rgba(255,255,255,.07)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.transform='none'">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px">${article.cluster}</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:21px;line-height:1.28;letter-spacing:-.03em;margin:0 0 10px;color:#f9fafb">${article.title}</h2>
        <p style="margin:0 0 10px;color:#9ca3af;font-size:14px;line-height:1.6">${article.description}</p>
        <span style="font-size:12px;color:#6b7280">${new Date(article.published_at).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</span>
      </a>`).join('')

  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li style="color:#6b7280">/</li>
          <li style="color:#9ca3af">Blog</li>
        </ol>
      </nav>
      <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing Guides</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 12px;color:#f9fafb">DeltaScreener Blog</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies.</p>
      <div>${articleCards}</div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.18)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#9ca3af;font-size:14px;line-height:1.7">Use the free DeltaScreener interactive screener — no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  const jsonLd = [
    { '@context':'https://schema.org','@type':'Blog', name:'DeltaScreener Blog', description, url: canonicalUrl,
      publisher:{'@type':'Organization',name:'DeltaScreener',url:SITE_ORIGIN} },
    { '@context':'https://schema.org','@type':'BreadcrumbList', itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:SITE_ORIGIN},
      {'@type':'ListItem',position:2,name:'Blog',item:canonicalUrl}
    ]}
  ]

  return new Response(renderSpaShell({ title, description, canonicalUrl,
    keywords: 'stock investing guides, stock screening blog, ROE investing, DeltaScreener blog',
    jsonLd, bodyHtml }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400' }
  })
}

async function handleBlogSlug({ slug, env }) {
  let post = null, relatedPosts = []
  try {
    post = await env.DB.prepare(`SELECT * FROM blog_posts WHERE slug = ?`).bind(slug).first()
    if (post) {
      const { results } = await env.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all()
      relatedPosts = results || []
    }
  } catch (_) {}

  if (!post) {
    const bodyHtml = `<main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#0f1117;color:#f3f4f6">
      <div style="font-size:64px;margin-bottom:16px">📄</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
      <p style="color:#9ca3af;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
      <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:15px">← Back to Blog</a>
    </main>`
    return new Response(renderSpaShell({ title:'Article Not Found | DeltaScreener',
      description:'This blog post could not be found.', canonicalUrl:`${SITE_ORIGIN}/blog`,
      robots:'noindex,nofollow', bodyHtml }),
      { status:404, headers:{'Content-Type':'text/html; charset=utf-8'} })
  }

  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`
  const title = `${post.title} | DeltaScreener`

  let faqs = []
  try {
    let raw = post.faqs || '[]'
    let parsed = JSON.parse(raw)
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    faqs = Array.isArray(parsed) ? parsed : []
  } catch (_) {}

  const jsonLd = [
    { '@context':'https://schema.org','@type':'Article', headline:post.title, description:post.description,
      url:canonicalUrl, datePublished:post.published_at, dateModified:post.published_at,
      author:{'@type':'Organization',name:'DeltaScreener',url:SITE_ORIGIN},
      publisher:{'@type':'Organization',name:'DeltaScreener',url:SITE_ORIGIN} },
    { '@context':'https://schema.org','@type':'BreadcrumbList', itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:SITE_ORIGIN},
      {'@type':'ListItem',position:2,name:'Blog',item:`${SITE_ORIGIN}/blog`},
      {'@type':'ListItem',position:3,name:post.title,item:canonicalUrl}
    ]},
    ...(faqs.length > 0 ? [{'@context':'https://schema.org','@type':'FAQPage',
      mainEntity:faqs.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))}] : [])
  ]

  const relatedHtml = relatedPosts.length > 0 ? `
    <section style="margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.1)">
      <h3 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0 0 20px">Related Articles</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${relatedPosts.map(r=>`
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>`).join('')}
      </div>
    </section>` : ''

  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;border-radius:20px;background:#111827;border:1px solid rgba(45,212,191,.15);overflow:hidden">
      <div style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(45,212,191,.05)">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0;display:flex;align-items:center;gap:10px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(45,212,191,.15);color:#2dd4bf;font-size:16px;flex-shrink:0">?</span>
          Frequently Asked Questions
        </h2>
      </div>
      <div style="padding:8px 0">
        ${faqs.map((f,i)=>`
          <div style="padding:20px 28px;${i < faqs.length-1 ? 'border-bottom:1px solid rgba(255,255,255,.05)' : ''}">
            <h3 style="font-size:15px;font-weight:700;color:#e5e7eb;margin:0 0 10px;line-height:1.4">${f.q}</h3>
            <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
          </div>`).join('')}
      </div>
    </section>` : ''

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})

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

  return new Response(renderSpaShell({ title, description:post.description, canonicalUrl,
    ogTitle:post.title, ogDescription:post.description, ogUrl:canonicalUrl,
    keywords:`${post.cluster}, stock screening, ${post.title}, DeltaScreener`,
    jsonLd, bodyHtml }), {
    headers: { 'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' }
  })
}

export async function onRequestGet(ctx) {
  const url = new URL(ctx.request.url)
  const path = url.pathname

  // www → non-www 301 redirect
  if (url.hostname === 'www.deltascreener.com') {
    return Response.redirect(`https://deltascreener.com${path}${url.search}`, 301)
  }

  // Clean robots.txt (override Cloudflare's content signals injection)
  if (path === '/robots.txt') {
    return new Response(
      'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /auth/\n\nSitemap: https://deltascreener.com/sitemap.xml\n',
      { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } }
    )
  }

  if (path === '/blog' || path === '/blog/') return handleBlogIndex(ctx)
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '').replace(/\/$/, '')
    return handleBlogSlug({ slug, env: ctx.env })
  }

  const title = 'DeltaScreener — Free US Stock Screener & Stock Analysis'
  const description = 'Free US stock screener with 30+ filters, 10-year financials, and custom query language. Screen NYSE & NASDAQ stocks instantly. No sign-up required.'

  // Prerendered homepage body for SEO crawlers
  const homeBodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1120px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <div style="text-align:center;max-width:760px;margin:0 auto 64px">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:16px">Free US Stock Screener</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(36px,6vw,64px);line-height:1.05;letter-spacing:-.04em;margin:0 0 20px;color:#f9fafb">Screen 5,000+ US Stocks.<br>Find Better Investments.</h1>
        <p style="color:#9ca3af;font-size:18px;line-height:1.65;margin:0 0 32px">Filter NYSE &amp; NASDAQ stocks by ROE, P/E ratio, debt, revenue growth, and 30+ more metrics. No sign-up required.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:14px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:16px">Open Free Screener →</a>
          <a href="/blog" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:14px;background:rgba(255,255,255,.06);color:#f9fafb;text-decoration:none;font-weight:700;font-size:16px;border:1px solid rgba(255,255,255,.1)">Investing Guides</a>
        </div>
      </div>
      <section style="margin-bottom:64px">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 24px;text-align:center">Popular Stock Screens</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          ${[
            ['High ROE Stocks','/stocks/high-roe-stocks','Companies with Return on Equity above 20%'],
            ['Low Debt Stocks','/stocks/low-debt-stocks','Debt-to-equity ratio under 0.5'],
            ['Low P/E Stocks','/stocks/low-pe-stocks','Price-to-earnings ratio under 15'],
            ['NASDAQ Screener','/screener?exchange=NASDAQ','Filter NASDAQ-listed companies'],
            ['NYSE Screener','/screener?exchange=NYSE','Filter NYSE-listed companies'],
            ['Dividend Stocks','/screener?dividendYield=2','Stocks paying 2%+ dividend yield'],
          ].map(([name,href,desc])=>`
          <a href="${href}" style="display:block;padding:18px 20px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);text-decoration:none;transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background='rgba(255,255,255,.03)'">
            <div style="font-weight:700;color:#f9fafb;font-size:15px;margin-bottom:4px">${name}</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">${desc}</div>
          </a>`).join('')}
        </div>
      </section>
      <section style="margin-bottom:64px">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 24px;text-align:center">Why DeltaScreener?</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
          ${[
            ['30+ Screening Filters','P/E, P/B, ROE, ROA, debt/equity, revenue growth, market cap, dividend yield, and more.'],
            ['10-Year Financial History','See a decade of income statements, balance sheets, and cash flow — free.'],
            ['No Sign-Up Required','Open the screener and start filtering immediately. No account needed.'],
            ['Custom Query Language','Write advanced filters like: roe > 20 AND debtToEquity < 0.5 AND sector = "Technology".'],
          ].map(([t,d])=>`
          <div style="padding:22px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)">
            <div style="font-weight:700;color:#2dd4bf;font-size:15px;margin-bottom:8px">${t}</div>
            <div style="color:#9ca3af;font-size:14px;line-height:1.65">${d}</div>
          </div>`).join('')}
        </div>
      </section>
      <section>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 20px;text-align:center">From the Blog</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
          ${[
            ['What Is ROE in Stocks?','/blog/what-is-roe-in-stocks','Stock Quality'],
            ['How to Screen Tech Stocks for Value','/blog/how-to-screen-tech-stocks-for-value','Tech Investing'],
            ['Warren Buffett Stock Screener','/blog/warren-buffett-stock-screener','Value Investing'],
          ].map(([t,href,cluster])=>`
          <a href="${href}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);text-decoration:none">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${t}</div>
          </a>`).join('')}
        </div>
      </section>
    </main>`

  const homeJsonLd = [
    {'@context':'https://schema.org','@type':'WebApplication',name:'DeltaScreener',
     description,url:`${SITE_ORIGIN}/`,applicationCategory:'FinanceApplication',
     offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},
     publisher:{'@type':'Organization',name:'DeltaScreener',url:SITE_ORIGIN}},
    {'@context':'https://schema.org','@type':'FAQPage',mainEntity:[
      {'@type':'Question',name:'Is DeltaScreener free?',acceptedAnswer:{'@type':'Answer',text:'Yes, DeltaScreener is completely free. No sign-up or credit card required.'}},
      {'@type':'Question',name:'What stocks does DeltaScreener cover?',acceptedAnswer:{'@type':'Answer',text:'DeltaScreener covers 5,000+ NYSE and NASDAQ listed US stocks with 30+ screening filters.'}},
      {'@type':'Question',name:'What filters are available?',acceptedAnswer:{'@type':'Answer',text:'Filters include ROE, P/E ratio, P/B ratio, debt-to-equity, revenue growth, net margin, dividend yield, market cap, sector, and more.'}},
    ]}
  ]

  return new Response(renderSpaShell({ title, description, canonicalUrl:`${SITE_ORIGIN}/`,
    keywords:'stock screener, free stock screener, US stock screener, NYSE screener, NASDAQ screener',
    jsonLd:homeJsonLd, bodyHtml:homeBodyHtml }), {
    headers: { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'public, max-age=60, s-maxage=300' }
  })
}
