// v20260628-blogsearch
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
      /* Dark is the default; the blog now respects the site theme. */
      body[data-theme='dark'], html { background: #0f1117; color: #f3f4f6; }
      body[data-theme='dark'] [data-prerender-shell] { background: #0f1117; color: #f3f4f6; }
      body[data-theme='dark'] [data-prerender-shell] p,
      body[data-theme='dark'] [data-prerender-shell] li,
      body[data-theme='dark'] [data-prerender-shell] article { color: #f3f4f6; }
      body[data-theme='dark'] [data-prerender-shell] strong { color: #ffffff; }

      /* Light mode: flip the hardcoded dark inline colors to readable light ones. */
      body[data-theme='light'] { background: #ffffff !important; color: #1f2937 !important; }
      body[data-theme='light'] [data-prerender-shell],
      body[data-theme='light'] [data-prerender-shell] main { background: #ffffff !important; color: #1f2937 !important; }
      body[data-theme='light'] [data-prerender-shell] h1,
      body[data-theme='light'] [data-prerender-shell] h2,
      body[data-theme='light'] [data-prerender-shell] h3 { color: #0f172a !important; }
      body[data-theme='light'] [data-prerender-shell] p,
      body[data-theme='light'] [data-prerender-shell] li,
      body[data-theme='light'] [data-prerender-shell] article,
      body[data-theme='light'] [data-prerender-shell] td,
      body[data-theme='light'] [data-prerender-shell] div { color: #334155 !important; }
      body[data-theme='light'] [data-prerender-shell] strong { color: #0f172a !important; }
      body[data-theme='light'] [data-prerender-shell] a[href^="/blog"],
      body[data-theme='light'] [data-prerender-shell] nav a { color: #0d9488 !important; }
      /* Cards built on white-tinted overlays read as washed-out on a white page;
         give them a light-grey surface and a visible border in light mode. */
      body[data-theme='light'] [data-prerender-shell] section,
      body[data-theme='light'] [data-prerender-shell] article a[href^="/blog"] { background: #f8fafc !important; }
      body[data-theme='light'] [data-prerender-shell] section { border-color: #e2e8f0 !important; }
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

      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="width:100%;border-radius:16px;margin-bottom:36px;object-fit:cover;max-height:420px;display:block" loading="lazy">` : ''}

      <!-- Sticky top search bar: search US stocks (Apple, Microsoft, AAPL…) -->
      <div id="blog-cta-bar" style="position:fixed;top:0;left:0;right:0;z-index:1000;background:#0f2620;border-bottom:1px solid rgba(45,212,191,.3);padding:10px 16px;display:flex;align-items:center;gap:12px;transform:translateY(-100%);transition:transform .3s ease">
        <span style="font-size:13px;font-weight:700;color:#2dd4bf;white-space:nowrap;flex-shrink:0">Search any US stock</span>
        <div style="position:relative;flex:1;max-width:520px;margin:0 auto">
          <input id="blog-stock-search" type="text" autocomplete="off" spellcheck="false"
            placeholder="e.g. Apple, AAPL, Microsoft…"
            style="width:100%;box-sizing:border-box;padding:9px 14px;border-radius:10px;border:1px solid rgba(45,212,191,.35);background:#0a1814;color:#f3f4f6;font-size:14px;font-weight:500;outline:none" />
          <div id="blog-search-dd" role="listbox"
            style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;background:#0f1a16;border:1px solid rgba(45,212,191,.25);border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.45);max-height:340px;overflow-y:auto;z-index:1001"></div>
        </div>
        <a href="/screener" style="padding:8px 14px;border-radius:10px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:13px;white-space:nowrap;flex-shrink:0">Screener →</a>
      </div>
      <script>
        (function(){
          var bar = document.getElementById('blog-cta-bar');
          if(!bar) return;
          // Reveal the bar after the reader scrolls past the hero.
          window.addEventListener('scroll', function(){
            if(window.scrollY > 300) bar.style.transform = 'translateY(0)';
            else bar.style.transform = 'translateY(-100%)';
          }, {passive:true});

          var input = document.getElementById('blog-stock-search');
          var dd = document.getElementById('blog-search-dd');
          if(!input || !dd) return;
          var API = (location.host === 'deltascreener.com' || location.host.endsWith('.deltascreener.com'))
            ? 'https://api-ovh.deltascreener.com' : 'https://screenerpro1-api.acherjeeanirban.workers.dev';
          var seq = 0, timer = null, first = '';
          function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
          function go(t){ if(t) location.href = '/stock/' + encodeURIComponent(t); }
          function hide(){ dd.style.display='none'; dd.innerHTML=''; first=''; }
          function render(items, q){
            if(!items.length){
              dd.innerHTML = '<div style="padding:12px 14px;color:#9ca3af;font-size:13px">Press Enter to search \"'+esc(q)+'\"</div>';
              dd.style.display='block'; return;
            }
            first = items[0].ticker;
            dd.innerHTML = items.map(function(it){
              return '<a href="/stock/'+encodeURIComponent(it.ticker)+'" data-tk="'+esc(it.ticker)+'" '
                + 'style="display:flex;align-items:baseline;gap:10px;padding:11px 14px;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.05)">'
                + '<span style="font-weight:800;color:#2dd4bf;font-size:14px;min-width:58px">'+esc(it.ticker)+'</span>'
                + '<span style="color:#cbd5e1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(it.name||it.ticker)+'</span></a>';
            }).join('');
            dd.style.display='block';
            Array.prototype.forEach.call(dd.querySelectorAll('a'), function(a){
              a.addEventListener('click', function(e){ e.preventDefault(); go(a.getAttribute('data-tk')); });
            });
          }
          input.addEventListener('input', function(){
            var q = input.value.trim();
            if(!q){ hide(); return; }
            clearTimeout(timer);
            timer = setTimeout(function(){
              var id = ++seq;
              fetch(API + '/search?q=' + encodeURIComponent(q))
                .then(function(r){ return r.json(); })
                .then(function(d){
                  if(id !== seq) return;
                  var items = (d && Array.isArray(d.results)) ? d.results.slice(0,8).map(function(x){
                    return { ticker: x.ticker, name: x.name || x.ticker }; }) : [];
                  render(items, q);
                })
                .catch(function(){ if(id===seq) render([], q); });
            }, 180);
          });
          input.addEventListener('keydown', function(e){
            if(e.key === 'Enter'){ e.preventDefault(); go(first || input.value.trim().toUpperCase()); }
            else if(e.key === 'Escape'){ hide(); }
          });
          input.addEventListener('blur', function(){ setTimeout(hide, 200); });
        })();
      </script>

      <article style="font-size:16px;line-height:1.8;color:#f3f4f6">
        <p style="margin:0 0 20px;color:#f3f4f6;line-height:1.8">${markdownToHtml(post.content || '')}</p>
      </article>

      <!-- Mid-article CTA (inline, after article body) -->
      <div style="margin:40px 0;border-radius:16px;background:rgba(45,212,191,.08);border:1px solid rgba(45,212,191,.2);padding:22px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <div style="font-size:13px;font-weight:700;color:#2dd4bf;margin-bottom:4px">🔍 Try it yourself</div>
          <div style="font-size:15px;font-weight:600;color:#f9fafb">Apply these filters on DeltaScreener — free, no sign-up</div>
        </div>
        <a href="/screener" style="flex-shrink:0;padding:10px 18px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:14px">Open Screener →</a>
      </div>

      ${faqHtml}

      <div style="margin-top:48px;border-radius:20px;background:linear-gradient(135deg,#0f2620 0%,#0a1628 100%);border:1px solid rgba(45,212,191,.25);padding:32px">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Free Tool</div>
        <strong style="display:block;font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin-bottom:8px;line-height:1.3">Screen 5,000+ US Stocks Instantly</strong>
        <p style="margin:0 0 20px;color:#9ca3af;line-height:1.7;font-size:15px">Apply any filter from this guide — ROE, FCF, P/E, margins, and 30+ more. No sign-up required. Results in seconds.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:15px">Open Free Screener →</a>
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
