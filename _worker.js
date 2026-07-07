var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _lib/spa-shell.js
var SITE_ORIGIN = "https://deltascreener.com";
var DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;
var DEFAULT_TWITTER_SITE = "@deltascreener";
var API_FALLBACKS = [
  "https://api.deltascreener.com",
  "https://screenerpro1-api.acherjeeanirban.workers.dev"
];
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml, "escapeHtml");
function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
__name(stripHtml, "stripHtml");
function formatUsd(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null;
}
__name(formatUsd, "formatUsd");
function formatCompactUsd(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}
__name(formatCompactUsd, "formatCompactUsd");
function formatNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : null;
}
__name(formatNumber, "formatNumber");
function stockCanonicalPath(ticker) {
  return `/stock/${encodeURIComponent(String(ticker || "").trim().toUpperCase())}`;
}
__name(stockCanonicalPath, "stockCanonicalPath");
function buildStockSeo(ticker, overview = {}, ratios = {}) {
  const normalizedTicker = String(ticker || "").trim().toUpperCase();
  const companyName = overview?.name && overview.name.trim() && overview.name.trim().toUpperCase() !== normalizedTicker ? overview.name.trim() : normalizedTicker;
  const canonicalPath = stockCanonicalPath(normalizedTicker);
  const canonicalUrl = `${SITE_ORIGIN}${canonicalPath}`;
  const price = formatUsd(overview?.price);
  const pe = formatNumber(ratios?.pe ?? overview?.pe);
  const marketCap = formatCompactUsd(overview?.mktCap);
  const exchange = overview?.exchange || "NYSE/NASDAQ";
  const description = price && pe && marketCap ? `${companyName} (${normalizedTicker}) \u2014 ${price}, P/E ${pe}, Market Cap ${marketCap}. View 10-year financials, quarterly results, ratios, peers, and news.` : `${companyName} (${normalizedTicker}) stock price, financials, valuation ratios, quarterly results, peers, and news on DeltaScreener.`;
  const title = companyName !== normalizedTicker ? `${companyName} (${normalizedTicker}) Stock Price, Financials & Ratios | DeltaScreener` : `${normalizedTicker} Stock Price, Financials & Ratios | DeltaScreener`;
  return {
    title,
    description: stripHtml(description).slice(0, 280),
    canonicalPath,
    canonicalUrl,
    exchange,
    keywords: [
      `${normalizedTicker} stock`,
      `${companyName} stock price`,
      `${companyName} financials`,
      `${companyName} ratios`,
      `${normalizedTicker} stock analysis`,
      "US stock screener"
    ].join(", "),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${companyName} Stock Analysis`,
      description: stripHtml(description).slice(0, 280),
      url: canonicalUrl,
      about: {
        "@type": "Corporation",
        name: companyName,
        tickerSymbol: normalizedTicker,
        exchange
      }
    }
  };
}
__name(buildStockSeo, "buildStockSeo");
async function fetchJson(origins, path) {
  let lastError = null;
  for (const origin of origins) {
    if (!origin) continue;
    try {
      const res = await fetch(`${origin}${path}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "DeltaScreener-SEO/1.0"
        }
      });
      if (!res.ok) {
        lastError = new Error(`API ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not fetch API data");
}
__name(fetchJson, "fetchJson");
function renderSpaShell({
  title,
  description,
  canonicalUrl,
  keywords = "",
  ogTitle = title,
  ogDescription = description,
  ogUrl = canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  robots = "index,follow",
  jsonLd = null,
  bodyHtml = "",
  prerender = null,
  lightMode = false
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="keywords" content="${escapeHtml(keywords)}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(ogTitle)}" />
  <meta property="og:description" content="${escapeHtml(ogDescription)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(ogUrl)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <meta name="twitter:site" content="${escapeHtml(DEFAULT_TWITTER_SITE)}" />
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>` : ""}
  <link rel="icon" type="image/svg+xml" href="/favicon2.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon2-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260607-blog-dark2" />
  ${lightMode ? `<style>
    html { color-scheme: light !important; }
    html, body { background: #ffffff !important; color: #111827 !important; }
    body[data-theme='dark'] { background: #ffffff !important; color: #111827 !important; }
    body[data-theme='dark'] * { color: inherit; }
    body[data-theme='dark'] h1, body[data-theme='dark'] h2, body[data-theme='dark'] h3 { color: #111827 !important; }
    body[data-theme='dark'] p { color: #374151 !important; }
    body[data-theme='dark'] a { color: #0f766e !important; }
    body[data-theme='dark'] a[style*="background:#0f766e"], body[data-theme='dark'] a[style*="background: #0f766e"] { color: #ffffff !important; }
    body[data-theme='dark'] header, body[data-theme='dark'] footer { display: none !important; }
    body[data-theme='dark'] .card, body[data-theme='dark'] section, body[data-theme='dark'] main { background: transparent !important; }
    [data-prerender-shell] { color: #111827 !important; }
    [data-prerender-shell] h1, [data-prerender-shell] h2, [data-prerender-shell] h3 { color: #111827 !important; }
    [data-prerender-shell] p, [data-prerender-shell] li { color: #374151 !important; }
    [data-prerender-shell] a { color: #0f766e !important; }
    [data-prerender-shell] a[style*="background:#0f766e"], [data-prerender-shell] a[style*="background: #0f766e"] { color: #ffffff !important; }
    [data-prerender-shell] a h2 { color: #111827 !important; }
  </style>` : ""}
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-40Y2P275ZZ"><\/script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-40Y2P275ZZ', { send_page_view: false });
  <\/script>
  <script src="https://accounts.google.com/gsi/client" async defer><\/script>
</head>
<body>
  <div id="app">${bodyHtml ? `<div data-prerender-shell="1">${bodyHtml}</div>` : ""}</div>
  ${prerender ? `<script>window.__DS_PRERENDER__ = ${JSON.stringify(prerender)};<\/script>` : ""}
      <script>
window.__DS_PRESET_QUERIES__ = [
  { name: '\u{1F3C6} Warren Buffett', q: 'ROE > 20 AND Average ROE 5Years > 18 AND ROCE > 15 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Interest Coverage Ratio > 5 AND Market Cap > 5000' },
  { name: '\u{1F680} Momentum', q: 'Change % > 5 AND YOY Qtr profit growth > 20 AND YOY Qtr sales growth > 15 AND ROE > 15 AND Net Margin > 8 AND Market Cap > 2000' },
  { name: '\u{1F4C8} High Growth', q: 'PEG Ratio > 0 AND PEG Ratio < 1 AND Sales growth 3Years > 15 AND Profit growth 3Years > 20 AND Sales growth 5Years > 12 AND Gross Margin > 40 AND Debt to Equity < 0.8 AND Market Cap > 1000' },
  { name: '\u{1F4B0} Undervalued', q: 'P/E > 0 AND P/E < 15 AND P/B < 1.5 AND Current ratio > 2 AND Earnings yield > 6 AND Debt to Equity < 1 AND ROE > 10 AND Market Cap > 1000' },
  { name: '\u{1F4B5} Dividend Income', q: 'Dividend Yield > 2.5 AND Dividend Yield < 8 AND ROE > 12 AND Net Margin > 10 AND Interest Coverage Ratio > 4 AND Debt to Equity < 1 AND Market Cap > 5000' },
  { name: 'Large Cap Value', q: 'Market Cap > 10000 AND P/E < 20 AND Return on Equity > 15' },
  { name: 'High Dividend', q: 'Dividend Yield > 3 AND Market Cap > 5000' },
  { name: 'Growth at Reasonable Price', q: 'P/E < 25 AND ROE > 20 AND Net Margin > 15' },
  { name: 'Mega Caps', q: 'Market Cap > 200000' },
  { name: 'Low Debt Quality', q: 'Debt to Equity < 0.5 AND ROE > 15 AND Market Cap > 5000' },
  { name: 'Tech High Growth', q: 'Sector = Technology AND Market Cap > 20000 AND Net Margin > 15' }
];
// Set forced query from server-injected prerender data OR ?preset=N URL param
(function() {
  // Priority 1: server-side injected query (most reliable - no cache issues)
  var serverQuery = window.__DS_PRERENDER__ && window.__DS_PRERENDER__.query;
  // Priority 2: ?preset=N in URL
  var idx = new URLSearchParams(location.search).get('preset');
  var urlQuery = null;
  if (idx !== null && window.__DS_PRESET_QUERIES__) {
    var pq = window.__DS_PRESET_QUERIES__[parseInt(idx)];
    if (pq) urlQuery = pq.q;
  }
  var finalQuery = serverQuery || urlQuery;
  if (finalQuery) {
    try { sessionStorage.setItem('ds-query', finalQuery); } catch(e){}
    window.__DS_FORCED_QUERY__ = finalQuery;
    // NUCLEAR OPTION: directly write textarea, bypassing any cached JS
    var __ds_fq = finalQuery.replace(/ AND /g, ' AND' + String.fromCharCode(10));
    function __ds_apply_query__() {
      var ta = document.getElementById('query-textarea');
      if (ta && ta.value !== __ds_fq) { ta.value = __ds_fq; }
    }
    document.addEventListener('DOMContentLoaded', __ds_apply_query__);
    var __ds_obs = new MutationObserver(function() {
      var ta = document.getElementById('query-textarea');
      if (ta) { ta.value = __ds_fq; __ds_obs.disconnect(); }
    });
    document.addEventListener('DOMContentLoaded', function() {
      __ds_obs.observe(document.body || document.documentElement, {childList: true, subtree: true});
      [100,300,600,1000,2000].forEach(function(d){ setTimeout(__ds_apply_query__, d); });
    });
  }
})();
// Lock setQuery
function __ds_sq__(i) {
  var q = window.__DS_PRESET_QUERIES__[i];
  if (!q) return;
  var ta = document.getElementById('query-textarea');
  if (ta) ta.value = q.q.replace(/ AND /g, ' AND' + String.fromCharCode(10));
  try { sessionStorage.setItem('ds-screener-page','1'); } catch(e){}
}
Object.defineProperty(window, 'setQuery', {
  get: function() { return __ds_sq__; },
  set: function() {},
  configurable: false
});
<\/script>
  <script type="module" src="/src/main2.js?v=20260607-blog-dark2"><\/script>
</body>
</html>`;
}
__name(renderSpaShell, "renderSpaShell");

// blog/_slug.js
function markdownToHtml(md) {
  return md.replace(/^## (.+)$/gm, `<h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>`).replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>').replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>').replace(/\n\n/g, '</p><p style="margin:0 0 16px">').replace(/^(?!<[h|u|l])(.+)$/gm, (m) => m.startsWith("<") ? m : m).replace(/^<\/p><p[^>]*>(<h[23])/gm, "$1").replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, "$1").trim();
}
__name(markdownToHtml, "markdownToHtml");
async function onRequestGet({ params, env }) {
  const slug = params.slug;
  let post = null;
  let relatedPosts = [];
  try {
    post = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();
    if (post) {
      const { results } = await env.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts
         WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all();
      relatedPosts = results || [];
    }
  } catch (_) {
  }
  if (!post) {
    const notFoundHtml = `
      <main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
        <div style="font-size:64px;margin-bottom:16px">\u{1F4C4}</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
        <p style="color:#6b7280;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
        <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#2962ff;color:#fff;text-decoration:none;font-weight:700;font-size:15px">\u2190 Back to Blog</a>
      </main>`;
    return new Response(renderSpaShell({
      title: "Article Not Found | DeltaScreener",
      description: "This blog post could not be found.",
      canonicalUrl: `${SITE_ORIGIN}/blog`,
      robots: "noindex,nofollow",
      bodyHtml: notFoundHtml
    }), { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const title = `${post.title} | DeltaScreener`;
  const description = post.description;
  let faqs = [];
  try {
    let raw = post.faqs || "[]";
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    faqs = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
  }
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      url: canonicalUrl,
      datePublished: post.published_at,
      dateModified: post.published_at,
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl }
      ]
    },
    ...faqs.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
    }] : []
  ];
  const relatedHtml = relatedPosts.length > 0 ? `
    <section style="margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.08)">
      <h3 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0 0 20px">Related Articles</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${relatedPosts.map((r) => `
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#0f1117;text-decoration:none;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow='none'">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>
        `).join("")}
      </div>
    </section>` : "";
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;padding:28px;border-radius:16px;background:#111827;border:1px solid rgba(255,255,255,.08)">
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:0 0 20px">Frequently Asked Questions</h2>
      ${faqs.map((f) => `
        <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.08)">
          <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 8px">${f.q}</h3>
          <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0">${f.a}</p>
        </div>
      `).join("")}
    </section>` : "";
  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#6b7280;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${post.title}</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">${post.cluster}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,42px);line-height:1.1;letter-spacing:-.03em;margin:0 0 16px;color:#f9fafb">${post.title}</h1>
      <p style="color:#6b7280;font-size:16px;line-height:1.65;margin:0 0 8px">${post.description}</p>
      <div style="font-size:13px;color:#9ca3af;margin-bottom:36px">Published ${formattedDate} \xB7 DeltaScreener</div>

      <article style="font-size:16px;line-height:1.8;color:#6b7280">
        ${markdownToHtml(post.content || "")}
      </article>

      ${faqHtml}

      <div style="margin-top:48px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Put this into practice</strong>
        <p style="margin:0 0 12px;color:#6b7280;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter from this guide \u2014 no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>

      ${relatedHtml}

      <div style="margin-top:40px">
        <a href="/blog" style="display:inline-flex;align-items:center;gap:6px;color:#2dd4bf;font-weight:600;font-size:14px;text-decoration:none">\u2190 Back to Blog</a>
      </div>
    </main>`;
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
    lightMode: true
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet, "onRequestGet");

// blog/best-dividend-stock-screening-criteria.js
async function onRequestGet2() {
  const title = "Best Dividend Stock Screening Criteria | DeltaScreener";
  const description = "Learn the 5 key criteria for screening dividend stocks: yield, payout ratio, debt levels, dividend growth, and free cash flow coverage. Find sustainable income stocks.";
  const slug = "best-dividend-stock-screening-criteria";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Best Dividend Stock Screening Criteria for Passive Income Investors",
      description,
      url: canonicalUrl,
      datePublished: "2026-05-31",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Best Dividend Stock Screening Criteria", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good dividend yield to screen for?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A yield between 2% and 5% is generally a sweet spot for most sectors. The S&P 500 average yield is around 1% as of 2026, so anything meaningfully above that deserves a closer look. Yields above 6\u20137% can signal dividend risk \u2014 always check the payout ratio before trusting a high yield."
          }
        },
        {
          "@type": "Question",
          name: "What payout ratio is safe for dividend stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For most companies, a payout ratio between 40% and 60% is considered healthy. REITs and utilities can sustain 70\u201380% due to stable cash flows. A ratio consistently above 80\u201390% is a red flag \u2014 it leaves little room for earnings shortfalls."
          }
        },
        {
          "@type": "Question",
          name: "Should I include debt filters when screening for dividend stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. High debt is one of the most common reasons dividends get cut. A debt-to-equity ratio under 1.0 is a reasonable starting filter for non-financial, non-utility sectors. Companies with net debt to capital below 50% tend to have more financial flexibility to maintain dividends through economic cycles."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Dividend Screening Criteria</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Income Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Best Dividend Stock Screening Criteria for Passive Income Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date("2026-05-31")).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 28px">The S&P 500's average dividend yield sits at just 1.05% as of May 2026 \u2014 near a multi-decade low. That makes screening for dividend stocks harder, not easier: with so many companies offering thin yields, you need precise criteria to separate sustainable income from yield traps. Here are the five filters that matter most.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">1. Dividend Yield: Target the 2\u20135% Range</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A yield between 2% and 5% is typically the best starting point. It's meaningfully above the market average without triggering the warning signs that come with very high yields. Stocks yielding 6%, 8%, or more often do so because their share price has fallen \u2014 a potential sign that the market expects a dividend cut.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">This doesn't mean high-yield stocks are always bad. Utilities and REITs structurally pay higher dividends. But sector context matters \u2014 a 7% yield from a telecom is different from a 7% yield from a mid-cap industrial that cut earnings last quarter.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">2. Payout Ratio: The Most Important Safety Filter</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">The payout ratio tells you what percentage of earnings a company pays out as dividends. A ratio between 40% and 60% is healthy for most sectors \u2014 it means the company is sharing profits while retaining enough to reinvest and weather downturns. For utilities and REITs, 70\u201380% is acceptable given their regulated, stable cash flows.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A payout ratio consistently above 80\u201390% is a red flag for most businesses. When earnings dip \u2014 which they always eventually do \u2014 there's no buffer. Companies in this position often face a dividend cut or a painful debt-funded payout that weakens the balance sheet over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">3. Debt-to-Equity: Low Debt Protects Dividends</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">High debt is one of the most common reasons dividends get cut. When interest costs climb or revenue dips, over-leveraged companies prioritize debt service over shareholder distributions. For non-financial, non-utility companies, a debt-to-equity ratio under 1.0 is a reasonable screen. For net-debt-to-capital, under 50% is a widely used threshold.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">This filter is especially important today. Rates have remained elevated compared to the near-zero era of the 2010s, which means the cost of carrying debt is real and ongoing. Companies that were fine with high leverage at 1% rates are under more pressure at 4\u20135%.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">4. Dividend Growth Rate: Look for 5%+ Annual Increases</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">A dividend that doesn't grow is a dividend that loses purchasing power. Inflation compounds over time, and a flat $1 dividend is worth less every year in real terms. Screening for companies with a 5-year dividend growth rate of at least 5% annually filters for businesses that are genuinely growing and have the confidence to return more capital each year.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">Companies with long records of consecutive annual dividend increases \u2014 Dividend Aristocrats have 25+ years \u2014 offer a different kind of signal. They've maintained payouts through recessions, rate cycles, and sector disruption. That track record isn't a guarantee, but it reflects management discipline that matters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">5. Free Cash Flow Coverage: The Real Dividend Backstop</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">Dividends are paid in cash, not reported earnings. A company can have positive net income and still pay dividends from borrowed money if its free cash flow (FCF) is weak. The most rigorous filter is to check whether dividends are covered by FCF \u2014 ideally at a 1.5x or better ratio. This means the company generates $1.50 in free cash flow for every $1 it pays in dividends.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">FCF coverage also tells you about future dividend growth capacity. A company with FCF well above its dividend has room to raise it. One barely covering its payout is in a more precarious position, regardless of what the earnings-based payout ratio shows.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">How to Screen for Dividend Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">You can apply these filters directly on DeltaScreener without signing up. The screener lets you combine yield ranges, payout ratio caps, debt-to-equity limits, and other fundamental filters across US-listed stocks in real time. Start with the <a href="/stocks/low-debt-dividend-stocks" style="color:#2dd4bf;font-weight:600">low debt dividend stocks screen</a> for a pre-built starting point, or build your own combination on the <a href="/screener" style="color:#2dd4bf;font-weight:600">free screener</a>.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 28px">The most durable dividend portfolios combine moderate yield with low debt and consistent cash flow. High yield alone is not a strategy \u2014 it's a starting point that needs the rest of these filters to become one.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">Frequently Asked Questions</h2>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What is a good dividend yield to screen for?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">A yield between 2% and 5% is generally a sweet spot for most sectors. The S&P 500 average yield is around 1% as of 2026, so anything meaningfully above that deserves a closer look. Yields above 6\u20137% can signal dividend risk \u2014 always check the payout ratio before trusting a high yield.</p>
      </div>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What payout ratio is safe for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">For most companies, a payout ratio between 40% and 60% is considered healthy. REITs and utilities can sustain 70\u201380% due to stable cash flows. A ratio consistently above 80\u201390% is a red flag \u2014 it leaves little room for earnings shortfalls.</p>
      </div>

      <div style="margin-bottom:36px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">Should I include debt filters when screening for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Yes. High debt is one of the most common reasons dividends get cut. A debt-to-equity ratio under 1.0 is a reasonable starting filter for non-financial, non-utility sectors. Companies with net debt to capital below 50% tend to have more financial flexibility to maintain dividends through economic cycles.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for low-debt dividend stocks using yield, payout ratio, and debt filters \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "dividend stock screening criteria, best dividend stocks, payout ratio, dividend yield, low debt dividend stocks, passive income stocks, dividend investing 2026",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet2, "onRequestGet");

// blog/best-free-stock-screener.js
async function onRequestGet3() {
  const title = "Best Free Stock Screener for US Stocks in 2026 | DeltaScreener";
  const description = "Looking for the best free stock screener? DeltaScreener offers 30+ filters, 10-year financials, and custom queries for NYSE & NASDAQ stocks. No sign-up required.";
  const slug = "best-free-stock-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Best Free Stock Screener for US Stocks in 2026",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-04",
      dateModified: "2026-06-04",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is the best free stock screener?", acceptedAnswer: { "@type": "Answer", text: "DeltaScreener is a top free stock screener offering 30+ filters, 10-year historical financials, and a custom query language for NYSE and NASDAQ stocks \u2014 with no sign-up required." } },
        { "@type": "Question", name: "Can I screen stocks for free?", acceptedAnswer: { "@type": "Answer", text: "Yes. DeltaScreener is completely free to use. You can filter 5,000+ US stocks by P/E, ROE, debt, market cap, and more without creating an account." } },
        { "@type": "Question", name: "What filters does a free stock screener need?", acceptedAnswer: { "@type": "Answer", text: "A good free stock screener should have P/E ratio, P/B ratio, ROE, debt-to-equity, market cap, dividend yield, EPS growth, and revenue growth filters at minimum." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Best Free Stock Screener", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Best Free Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Best Free Stock Screener for US Stocks in 2026</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 6 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Finding a free stock screener that covers all the filters you need without hidden paywalls is harder than it sounds. Most tools limit their best filters to paid tiers or require an account just to see results. This guide covers what to look for \u2014 and why DeltaScreener is one of the few genuinely free options for US investors.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Makes a Good Free Stock Screener?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">A useful free stock screener needs at least these capabilities:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Valuation filters</strong> \u2014 P/E, P/B, EV/EBITDA to find cheap or reasonably priced stocks</li>
      <li><strong>Profitability filters</strong> \u2014 ROE, ROA, net margin to identify quality businesses</li>
      <li><strong>Balance sheet filters</strong> \u2014 Debt/Equity, current ratio to spot financial strength</li>
      <li><strong>Growth filters</strong> \u2014 EPS growth, revenue growth to find expanding businesses</li>
      <li><strong>Market cap & exchange filters</strong> \u2014 NYSE vs NASDAQ, large cap vs small cap</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Beyond filters, a good screener gives you historical data \u2014 not just trailing twelve months. Seeing 5\u201310 years of financials tells you whether quality is consistent or just a one-year anomaly.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">DeltaScreener: 30+ Filters, No Account Required</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px"><a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> covers over 5,000 NYSE and NASDAQ stocks with 30+ fundamental filters and 10 years of annual financial data. Key features:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li>Filter by P/E, P/B, ROE, ROA, Net Margin, Debt/Equity, Dividend Yield, EPS Growth, Revenue Growth, Market Cap, and more</li>
      <li>Custom query language \u2014 combine any number of filters with AND logic</li>
      <li>Sort results by any metric</li>
      <li>Click any stock to see a full 10-year financial history</li>
      <li>No sign-up, no email, no credit card \u2014 completely free</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Popular Stock Screens to Try</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Here are some ready-made screens on DeltaScreener:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality companies with strong return on equity</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Value stocks trading below market average</span></a>
      <a href="/screens/dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Stocks with consistent dividend yield</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Tech stocks at reasonable valuations</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is the best free stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">DeltaScreener is one of the best free stock screeners with 30+ filters, 10-year financials, and no sign-up required. Others worth trying include Finviz (basic free tier) and Stock Analysis.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Can I screen stocks for free?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes. DeltaScreener is completely free \u2014 no account, no email, no credit card required. All 30+ filters and 5,000+ stocks are accessible instantly.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Does DeltaScreener have a mobile version?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes, DeltaScreener is fully responsive and works on mobile browsers without needing to install any app.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Try DeltaScreener Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ US stocks with 30+ filters. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "best free stock screener, free stock screener US, stock screener no sign up, NYSE stock screener, NASDAQ screener free", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet3, "onRequestGet");

// blog/debt-to-equity-ratio-explained.js
async function onRequestGet4() {
  const title = "Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers | DeltaScreener";
  const description = "Learn what the debt-to-equity ratio is, what counts as a good D/E ratio by industry, and how to use it to screen for financially healthy stocks \u2014 free on DeltaScreener.";
  const slug = "debt-to-equity-ratio-explained";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Debt-to-Equity Ratio Explained", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good debt-to-equity ratio?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A D/E ratio below 1.0 is generally considered conservative and low-risk. Between 1.0 and 2.0 is acceptable for most industries. Above 2.0 warrants closer scrutiny, though capital-intensive sectors like utilities routinely carry higher ratios. The S&P 500 average D/E ratio was 0.61 as of Q4 2024."
          }
        },
        {
          "@type": "Question",
          name: "Does a high debt-to-equity ratio mean a stock is bad?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not necessarily. Context matters enormously. A utility company with a D/E of 2.5 is operating normally for its sector; a software firm with the same ratio would raise red flags. Always compare D/E ratios within the same industry and check whether the company generates enough cash flow to service its debt comfortably."
          }
        },
        {
          "@type": "Question",
          name: "How do I find stocks with low debt-to-equity ratios?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can screen for low-debt stocks using DeltaScreener's free screener at deltascreener.com/screener. Set a maximum D/E filter and combine it with profitability metrics like ROE or net margin to find financially strong companies."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Debt-to-Equity Ratio</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Balance Sheet</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#e5e7eb;margin:0 0 24px">The debt-to-equity ratio (D/E ratio) is one of the most important metrics on a company's balance sheet \u2014 yet many investors skip it in favor of flashier growth numbers. In an environment where corporate bankruptcies rose 14% year-over-year in Q1 2026, understanding how much debt a company carries relative to its equity could be the difference between a solid investment and a costly mistake.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 14px">What Is the Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The debt-to-equity ratio compares a company's total liabilities to its shareholders' equity. The formula is straightforward:</p>
      <div style="background:#f3f4f6;border-radius:12px;padding:16px 20px;font-family:monospace;font-size:15px;color:#e5e7eb;margin:0 0 20px">D/E Ratio = Total Liabilities \xF7 Shareholders' Equity</div>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">If a company has $500 million in total debt and $250 million in shareholder equity, its D/E ratio is 2.0 \u2014 meaning it owes $2 for every $1 of equity owned by shareholders. The higher the ratio, the more leveraged the company is, and the more sensitive it is to economic downturns, rising interest rates, or a slowdown in revenue.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The ratio appears in a company's balance sheet, which is published quarterly in SEC filings and summarized on most financial data platforms.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 14px">What Is a Good Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">There is no single "good" D/E ratio that applies to every company, because different industries operate with fundamentally different capital structures. That said, there are useful benchmarks to keep in mind.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The S&P 500 average D/E ratio stood at <strong>0.61 as of Q4 2024</strong>, which is a reasonable anchor for large-cap US stocks. In general:</p>
      <ul style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 1.0</strong> \u2014 Conservative. The company finances more of its operations with equity than debt. Often a sign of financial strength, particularly for technology, healthcare, and consumer discretionary companies.</li>
        <li style="margin-bottom:8px"><strong>1.0 to 2.0</strong> \u2014 Moderate. Acceptable for most industries. The company uses leverage, but not excessively. Warrants checking interest coverage to ensure cash flows cover debt payments.</li>
        <li style="margin-bottom:8px"><strong>Above 2.0</strong> \u2014 Elevated. Red flags in most sectors, though utilities, REITs, and telecoms routinely carry ratios of 2.5 or higher because their cash flows are predictable and stable.</li>
        <li style="margin-bottom:8px"><strong>Above 4.0</strong> \u2014 High risk. The company is predominantly financed by creditors. Requires exceptional and consistent cash generation to justify the leverage.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The key rule: <strong>always compare within the same industry</strong>. A software company with a D/E of 0.3 is unremarkable; the same ratio at a utility would suggest it is extremely underleveraged for its sector.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 14px">Why Rising Rates Make D/E Ratio More Important</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">When interest rates rise, companies with heavy debt loads face a double hit: existing variable-rate debt becomes more expensive, and refinancing maturing debt costs more. This is precisely why corporate bankruptcy filings climbed to a 14-year high in 2024, and why Q1 2026 saw filings up 14% year-over-year. Elevated D/E ratios that looked manageable in a low-rate environment can become unsustainable when rates stay high for longer.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">For stock pickers, this means D/E ratio is not just a balance sheet checkbox \u2014 it is a forward-looking risk signal. A company with D/E of 3.0 may trade at an attractive P/E multiple precisely because the market is pricing in bankruptcy risk. That discount is not always a buying opportunity.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Two useful metrics to pair with D/E are the <strong>interest coverage ratio</strong> (EBIT divided by interest expense \u2014 above 3x is generally safe) and <strong>free cash flow</strong>. A company with high debt but strong, consistent free cash flow is in a very different position from one that is cash-flow negative.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 14px">How to Screen for Low-Debt Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">You can <a href="/stocks/low-debt-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">screen for low debt-to-equity stocks on DeltaScreener</a> using the balance sheet filters in the free screener. A simple, effective starting screen might look like this:</p>
      <ul style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">Debt/Equity &lt; 0.5</li>
        <li style="margin-bottom:8px">ROE &gt; 12%</li>
        <li style="margin-bottom:8px">Net Margin &gt; 8%</li>
        <li style="margin-bottom:8px">Market Cap &gt; $500M</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">This combination targets companies that are both financially conservative <em>and</em> profitable \u2014 not just companies that happen to have no debt because they cannot borrow. Adding a sector filter lets you compare only within your chosen industry, making the D/E signal much more meaningful.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">No sign-up required. You can run and save screens instantly on the <a href="/screener" style="color:#2dd4bf;font-weight:600;text-decoration:none">DeltaScreener free screener</a>.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 14px">Frequently Asked Questions</h2>

      <div style="border-left:3px solid #0f766e;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">What is a good debt-to-equity ratio?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">A D/E ratio below 1.0 is generally considered conservative and low-risk. Between 1.0 and 2.0 is acceptable for most industries. Above 2.0 warrants closer scrutiny, though capital-intensive sectors like utilities routinely carry higher ratios. The S&P 500 average D/E ratio was 0.61 as of Q4 2024.</p>
      </div>

      <div style="border-left:3px solid #0f766e;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">Does a high debt-to-equity ratio mean a stock is bad?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Not necessarily. Context matters enormously. A utility company with a D/E of 2.5 is operating normally for its sector; a software firm with the same ratio would raise red flags. Always compare D/E ratios within the same industry and check whether the company generates enough cash flow to service its debt comfortably.</p>
      </div>

      <div style="border-left:3px solid #0f766e;padding-left:18px;margin-bottom:40px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">How do I find stocks with low debt-to-equity ratios?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Use DeltaScreener's free screener at deltascreener.com/screener. Set a maximum D/E filter and combine it with profitability metrics like ROE or net margin to find financially strong companies.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for low-debt stocks using the exact filters described above \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "debt to equity ratio, D/E ratio, balance sheet investing, low debt stocks, financial health stocks, stock screening",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet4, "onRequestGet");

// blog/dividend-stock-screener-guide.js
async function onRequestGet5() {
  const title = "Dividend Stock Screener: How to Find High-Yield US Dividend Stocks | DeltaScreener";
  const description = "Use a free dividend stock screener to find high-yield US stocks on NYSE and NASDAQ. Filter by dividend yield, payout ratio, and earnings stability.";
  const slug = "dividend-stock-screener-guide";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: "Dividend Stock Screener: How to Find High-Yield US Dividend Stocks", description, url: canonicalUrl, datePublished: "2026-06-03", author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` }, { "@type": "ListItem", position: 3, name: "Dividend Stock Screener Guide", item: canonicalUrl }] }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">Dividend Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Income Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Dividend Stock Screener: How to Find High-Yield US Dividend Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 6 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Dividend investing is one of the most reliable ways to build passive income from stocks. A dividend stock screener helps you systematically find US companies that pay consistent, growing dividends \u2014 without manually checking thousands of stocks.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Filters for Dividend Stock Screening</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Dividend Yield &gt; 2%</strong> \u2014 Minimum threshold for meaningful income</li>
      <li><strong>Payout Ratio &lt; 70%</strong> \u2014 Ensures dividends are sustainable from earnings</li>
      <li><strong>ROE &gt; 10%</strong> \u2014 Companies with strong returns can sustain payouts</li>
      <li><strong>Debt/Equity &lt; 1.0</strong> \u2014 Low debt keeps dividend payments safer</li>
      <li><strong>EPS Growth &gt; 0</strong> \u2014 Growing earnings support growing dividends</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Screen for Dividend Stocks on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Open the <a href="/screener" style="color:#2dd4bf;font-weight:600">free screener</a> and set these filters: Dividend Yield &gt;= 2, Debt/Equity &lt;= 1, ROE &gt;= 10. Sort by Dividend Yield descending to find the highest-yielding qualifying stocks at the top.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">You can also use the pre-built <a href="/screens/dividend-stocks" style="color:#2dd4bf;font-weight:600">Dividend Stocks screen</a> and <a href="/screens/low-debt-dividend-stocks" style="color:#2dd4bf;font-weight:600">Low Debt Dividend Stocks screen</a> for instant results.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">High Yield vs. Dividend Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">High yield stocks pay more income now but may grow slower. Dividend growth stocks \u2014 companies raising dividends every year \u2014 may yield less initially but compound income over time. The best dividend stock screener lets you filter for both approaches. Try setting EPS Growth &gt; 10% alongside a moderate yield to find growth-oriented dividend payers.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Dividend Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ US stocks by dividend yield, payout ratio, ROE and more.</p>
      <a href="/screens/dividend-stocks" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">View Dividend Stocks Screen \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "dividend stock screener, high yield stocks, dividend investing, free dividend screener, US dividend stocks", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet5, "onRequestGet");

// blog/growth-stocks-screener.js
async function onRequestGet6() {
  const title = "Growth Stocks Screener: How to Find High-Growth US Stocks | DeltaScreener";
  const description = "Learn how to screen for growth stocks using EPS growth, revenue growth, and ROE filters. Find high-growth NYSE and NASDAQ stocks free on DeltaScreener.";
  const slug = "growth-stocks-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Growth Stocks Screener: How to Find High-Growth US Stocks",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-05",
      dateModified: "2026-06-05",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do you screen for growth stocks?", acceptedAnswer: { "@type": "Answer", text: "Screen for growth stocks using EPS growth > 15%, revenue growth > 10%, and ROE > 15%. Also look for expanding margins and low debt to ensure growth is sustainable." } },
        { "@type": "Question", name: "What is a good EPS growth rate for growth stocks?", acceptedAnswer: { "@type": "Answer", text: "Most growth investors look for EPS growth of at least 15\u201320% per year. Stocks with 25%+ EPS growth are considered high-growth but also command higher valuations." } },
        { "@type": "Question", name: "Is there a free growth stock screener?", acceptedAnswer: { "@type": "Answer", text: "Yes. DeltaScreener is a free growth stock screener that lets you filter by EPS growth, revenue growth, ROE and more across 5,000+ NYSE and NASDAQ stocks with no sign-up." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Growth Stocks Screener", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Growth Stocks Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Growth Stocks Screener: How to Find High-Growth US Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 6 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Growth investing is about finding companies that are expanding faster than the market \u2014 and buying them before the crowd catches on. The challenge is separating genuine high-growth businesses from hype. A good growth stocks screener does the heavy lifting by filtering thousands of companies down to those with real, measurable growth in earnings and revenue.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Filters for Screening Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the most important metrics to use when screening for growth stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>EPS Growth &gt; 15%</strong> \u2014 Earnings per share growing consistently is the clearest signal of a quality growth company</li>
      <li><strong>Revenue Growth &gt; 10%</strong> \u2014 Top-line growth shows the business is expanding, not just cutting costs</li>
      <li><strong>ROE &gt; 15%</strong> \u2014 Return on equity above 15% shows management is reinvesting capital productively</li>
      <li><strong>Net Margin expanding</strong> \u2014 Margins improving over time indicates the business has pricing power</li>
      <li><strong>Low or manageable debt</strong> \u2014 High debt can cripple a growth company if growth slows; look for D/E &lt; 1.0</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Growth vs Value: What's the Difference?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Growth stocks typically trade at higher P/E ratios than value stocks because investors pay a premium for future earnings. A stock with a P/E of 30\u201350x isn't necessarily overvalued if it's growing earnings at 25%+ annually. The PEG ratio (P/E divided by EPS growth rate) is a useful check \u2014 a PEG below 1.0 suggests a growth stock may be undervalued relative to its growth rate.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">If you also want to find undervalued stocks, see our guide on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find undervalued stocks using a screener</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener to Find Growth Stocks</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px"><a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> lets you filter 5,000+ NYSE and NASDAQ stocks by EPS growth, revenue growth, ROE, and more \u2014 completely free, no account needed. Try these ready-made screens:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Companies with ROE &gt; 18%, a hallmark of quality growth businesses</span></a>
      <a href="/screens/high-net-margin-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High Net Margin Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Companies with strong pricing power and expanding margins</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Tech growth stocks at reasonable valuations</span></a>
      <a href="/screens/nasdaq-high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">NASDAQ High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 High-quality growth names on the NASDAQ</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">10-Year Financials: Why History Matters</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">DeltaScreener shows 10 years of annual financial data for every stock. This matters for growth investing because a company with two years of strong earnings growth could be a cyclical rebound \u2014 not a true compounder. Seeing 7\u201310 years of consistent growth in EPS and revenue is a much stronger signal. Click any ticker in the screener to see the full financial history.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do you screen for growth stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Use EPS growth &gt; 15%, revenue growth &gt; 10%, and ROE &gt; 15% as your starting filters. Add a debt/equity check to ensure the growth is sustainable, not debt-fueled.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What EPS growth rate is good for growth stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">15\u201320% annual EPS growth is a solid baseline. Stocks growing earnings at 25%+ are considered high-growth, though they often trade at premium valuations.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Is there a free growth stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes \u2014 DeltaScreener is free with no sign-up required. Filter 5,000+ US stocks by growth metrics instantly.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Growth Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ NYSE & NASDAQ stocks by EPS growth, revenue growth, ROE and more. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "growth stocks screener, screen for growth stocks, high growth US stocks, EPS growth stock filter, best growth stock screener free", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet6, "onRequestGet");

// blog/high-roe-semiconductor-stocks.js
async function onRequestGet7() {
  const title = "High ROE Semiconductor Stocks: How to Screen the Chip Sector | DeltaScreener";
  const description = "Semiconductor stocks average 31% ROE \u2014 among the highest of any sector. Learn how to screen chip stocks using ROE, P/E, and margins to find quality names.";
  const slug = "high-roe-semiconductor-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "High ROE Semiconductor Stocks: How to Screen the Chip Sector",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "High ROE Semiconductor Stocks", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good ROE for a semiconductor company?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The semiconductor sector averages around 31% ROE (January 2026 data from NYU Stern). A semiconductor stock with ROE above 25% is generally considered strong. Elite chip designers like those with fabless models can sustain ROE above 50% due to minimal capital intensity."
          }
        },
        {
          "@type": "Question",
          name: "Why do semiconductor stocks have such high ROE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Fabless chip designers (companies that design chips but outsource manufacturing) have very low asset bases relative to their earnings power. This means a large net income gets divided by a modest equity base \u2014 producing high ROE figures. Companies that own fabs (fabrication plants) tend to have lower ROE due to massive capital expenditure."
          }
        },
        {
          "@type": "Question",
          name: "How do I screen for high ROE semiconductor stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Set a minimum ROE filter of 20\u201325%, add a sector filter for semiconductors or technology, and optionally layer in a debt-to-equity filter below 1.0 to avoid over-leveraged names. Tools like DeltaScreener let you combine these filters for free without a sign-up."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">High ROE Semiconductor Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Sector Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">High ROE Semiconductor Stocks: How to Screen the Chip Sector</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#e5e7eb;margin:0 0 24px">Semiconductors are one of the most profitable sectors in the US market \u2014 and the data backs it up. According to NYU Stern's January 2026 sector analysis, the semiconductor industry averages a <strong>31.36% return on equity</strong>, well above the broad market average of 17.2%. For investors focused on capital efficiency, the chip sector deserves a close look.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#f9fafb;margin:40px 0 12px">Why Semiconductors Tend to Generate High Returns on Equity</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Return on equity (ROE) measures how much profit a company generates for every dollar of shareholder equity. The semiconductor sector splits into two very different business models \u2014 and understanding the difference is critical before applying any ROE screen.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px"><strong>Fabless chip designers</strong> \u2014 companies that design chips but outsource manufacturing to foundries like TSMC \u2014 carry relatively small balance sheets. Because their equity base is modest compared to their earnings power, their ROE can be extraordinarily high. Some of the most well-known names in consumer chips, networking, and AI accelerators operate this way.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px"><strong>Integrated device manufacturers (IDMs)</strong> own their own fabrication plants, which requires billions in capital expenditure. This inflates the equity base and typically compresses ROE, even if absolute profits are large. When screening for capital-efficient chip stocks, fabless and asset-light models will naturally rise to the top.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#f9fafb;margin:40px 0 12px">Valuation Context: Tech Trades at a Premium</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">High ROE doesn't automatically mean a stock is cheap. As of mid-2026, the S&P 500 Information Technology sector trades at a forward P/E of approximately <strong>28.3x</strong> \u2014 well above the broad S&P 500's forward P/E of around 21.2x. Semiconductor equipment makers (semiconductor equipment sector ROE: 35.8% per NYU Stern) often trade at even steeper multiples given their leverage to the AI and advanced-node capex cycle.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">This means a raw ROE filter alone isn't enough. A high ROE chip stock trading at 60x earnings requires sustained growth just to justify its price. Combining ROE with a P/E ceiling \u2014 say, ROE above 25% and P/E below 35x \u2014 narrows the field to names that are both capital-efficient and not already priced to perfection.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Net margin is another useful secondary filter. Chip designers with net margins consistently above 20% tend to have durable competitive positions \u2014 either through proprietary architectures, customer lock-in, or dominant market share in a specific end market.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#f9fafb;margin:40px 0 12px">How to Build a Semiconductor Stock Screen</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">A practical screening approach for this sector might look like this:</p>
      <ul style="line-height:1.9;color:#d1d5db;padding-left:24px;margin:0 0 20px">
        <li><strong>ROE \u2265 20%</strong> \u2014 captures companies generating strong returns on invested equity, filters out capital-heavy IDMs with compressed returns</li>
        <li><strong>Net margin \u2265 15%</strong> \u2014 identifies chip designers with real pricing power and cost discipline</li>
        <li><strong>Debt-to-equity \u2264 1.0</strong> \u2014 avoids over-leveraged names where high ROE is partly a function of financial engineering rather than operational strength</li>
        <li><strong>P/E \u2264 40x</strong> (optional) \u2014 adds a valuation guardrail so you're not buying quality at any price</li>
      </ul>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">This combination is intentionally strict. In a sector where valuations run high, it's reasonable to expect a shorter list of results \u2014 which is actually the point. You want stocks that clear a high bar on both quality and price.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 20px">You can <a href="/stocks/high-roe-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> and layer in additional filters to narrow the results to the semiconductor names that best fit your criteria.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#f9fafb;margin:40px 0 12px">Frequently Asked Questions</h2>

      <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:24px 0 8px">What is a good ROE for a semiconductor company?</h3>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 20px">The semiconductor sector averages around 31% ROE (January 2026, NYU Stern data). A chip stock with ROE above 25% is generally considered strong. Elite fabless designers can sustain ROE above 50% because their asset base is small relative to earnings.</p>

      <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:24px 0 8px">Why do semiconductor stocks have such high ROE?</h3>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 20px">Fabless chip companies design chips but outsource manufacturing, so they carry minimal fixed assets. A large net income divided by a modest equity base produces a high ROE. Companies that own fabs have much larger equity bases and tend to show lower ROE despite being profitable.</p>

      <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:24px 0 8px">How do I screen for high ROE semiconductor stocks?</h3>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 32px">Set a minimum ROE of 20\u201325%, filter by technology or semiconductor sector, and optionally add a debt-to-equity ceiling below 1.0. Free tools like DeltaScreener let you combine these filters instantly \u2014 no account required.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for high ROE semiconductor and tech stocks using exact criteria \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "high roe semiconductor stocks, chip sector screening, semiconductor stock screener, best semiconductor stocks ROE, fabless chip stocks",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet7, "onRequestGet");

// blog/how-to-build-a-stock-screen.js
async function onRequestGet8() {
  const title = "How to Build a Stock Screen from Scratch | DeltaScreener";
  const description = "Learn how to build a stock screen combining ROE and debt-to-equity filters. A step-by-step guide to finding quality stocks with strong fundamentals and low leverage.";
  const slug = "how-to-build-a-stock-screen";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Build a Stock Screen from Scratch: Combining ROE and Debt Filters for Better Results",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "How to Build a Stock Screen", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What filters should I use when building a stock screen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Start with profitability (ROE above 15%), then add a balance sheet filter (debt-to-equity below 1.0). From there, you can layer on valuation metrics like P/E or P/B depending on whether you're seeking growth or value."
          }
        },
        {
          "@type": "Question",
          name: "How many filters should a stock screen have?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Two to four filters is usually optimal for a starting screen. Too few and you'll have hundreds of results to review. Too many and you risk filtering out solid companies due to minor metric differences. Start tight, then loosen if needed."
          }
        },
        {
          "@type": "Question",
          name: "What is a good ROE threshold for stock screening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most investors use ROE above 15% as a baseline for quality companies. Sectors like financials and utilities naturally run different ranges, so adjusting by sector context gives more accurate comparisons."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">How to Build a Stock Screen</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">How to Build a Stock Screen from Scratch: Combining ROE and Debt Filters for Better Results</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Most investors know they should screen for quality stocks \u2014 but building a screen that actually narrows the field to useful candidates is harder than it looks. The key is choosing a small number of filters that work together, not against each other. Combining return on equity (ROE) with a debt-to-equity ceiling is one of the most effective starting points.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Why Most Screens Fail Before They Start</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The most common mistake when building a stock screen is stacking too many filters at once. An investor might screen for low P/E <em>and</em> high dividend yield <em>and</em> high ROE <em>and</em> low debt \u2014 and end up with three stocks, all in unusual niche industries. The screen technically "works," but it doesn't produce actionable results.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">A better approach is to build in layers. Start with one profitability filter and one balance sheet filter. These two dimensions \u2014 how well a company earns, and how safely it is financed \u2014 capture the essence of business quality without over-constraining the output. From there, add one valuation metric if needed.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">The S&P 500 has a broad range of ROE values by sector. Technology and consumer discretionary companies often run ROE above 20\u201330%, while utilities and materials companies may be in the single digits. This means sector context matters: a universal ROE threshold of 15% will filter differently depending on which part of the market you're scanning.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Building the Core Screen: ROE + Debt-to-Equity</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Here is a straightforward two-filter screen that works as a starting point for most market environments:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#d1d5db">
        <li><strong>ROE \u2265 15%</strong> \u2014 filters for companies that generate meaningful profit from shareholder equity. This removes low-quality businesses that burn capital without producing returns.</li>
        <li><strong>Debt-to-equity \u2264 1.0</strong> \u2014 ensures the company is not over-leveraged. A D/E above 2.0 is common in some sectors but adds substantial risk during rate hikes or earnings slowdowns.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Together, these two filters look for companies that are both profitable and financially stable. The median debt-to-equity for S&P 500 companies has historically hovered around 1.0\u20131.5, so setting a ceiling of 1.0 already places you in the cleaner half of the index.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Once you have this base screen running, look at what comes out. If you get more than 50\u201380 results, you can tighten ROE to 20% or lower D/E to 0.75. If you get fewer than 15, consider loosening one filter \u2014 or check whether your universe is too narrow to begin with.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">Adding a Third Filter: Valuation or Growth</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Once the quality + balance sheet base is set, a third filter helps separate expensive quality from reasonably priced quality. Two common choices:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#d1d5db">
        <li><strong>P/E below 25</strong> \u2014 useful when you're looking for value within the quality universe. Avoids paying a large premium for businesses the market already loves.</li>
        <li><strong>Revenue growth above 5% year-over-year</strong> \u2014 useful when you want companies that are expanding, not just profitable on a static basis.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">These two goals are often in tension: fast-growing companies tend to trade at higher P/E multiples. Choosing which direction to go depends on whether you're building a growth screen or a value screen. The ROE + D/E foundation works for both \u2014 the third filter just tilts the output.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">One practical tip: run the screen without the third filter first. Review the list. That review is itself part of the research process \u2014 you'll often notice industry clusters, outliers worth investigating, or sectors you want to exclude before applying any more filters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#f9fafb">How to Run This Screen on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">You can <a href="/screener" style="color:#2dd4bf;text-decoration:underline">build a custom screen on DeltaScreener</a> using exactly these filters. Set ROE to a minimum of 15%, debt-to-equity to a maximum of 1.0, and add a P/E or revenue growth filter if desired. No account required \u2014 results update in real time across the full US market universe.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">If you want to start from a pre-built screen, the <a href="/stocks/high-roe-stocks" style="color:#2dd4bf;text-decoration:underline">high ROE stocks screener</a> already applies a quality filter that you can combine with additional criteria. You can also explore the <a href="/stocks/low-debt-high-roe" style="color:#2dd4bf;text-decoration:underline">low debt + high ROE</a> pre-set, which mirrors the two-filter strategy described above.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for stocks using ROE, debt-to-equity, P/E, and more \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,26px);letter-spacing:-.03em;line-height:1.2;margin:48px 0 20px;color:#f9fafb">Frequently Asked Questions</h2>

      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">What filters should I use when building a stock screen?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Start with profitability (ROE above 15%), then add a balance sheet filter (debt-to-equity below 1.0). From there, layer on a valuation metric like P/E or P/B depending on whether you're seeking growth or value.</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">How many filters should a stock screen have?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Two to four filters is usually optimal. Too few and you'll have hundreds of results to sort through. Too many and you risk excluding solid companies for minor metric differences. Start with two, then adjust.</p>
      </div>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding:24px 0;border-bottom:1px solid rgba(255,255,255,.08)">
        <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 10px">What is a good ROE threshold for stock screening?</h3>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Most investors use ROE above 15% as a baseline for quality companies. Sectors like financials and utilities naturally run different ranges, so adjusting by sector context gives more accurate comparisons. For technology stocks, 20\u201325%+ is a reasonable bar.</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#6b7280;margin:32px 0 0">Looking for more screening strategies? Browse all guides on the <a href="/blog" style="color:#2dd4bf;text-decoration:underline">DeltaScreener blog</a> or jump straight to the <a href="/screener" style="color:#2dd4bf;text-decoration:underline">free screener</a>.</p>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "how to build a stock screen, stock screening strategy, ROE and debt filter, stock screener guide, build stock screen from scratch, DeltaScreener",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet8, "onRequestGet");

// blog/how-to-find-undervalued-stocks.js
async function onRequestGet9() {
  const title = "How to Find Undervalued Stocks Using a Stock Screener | DeltaScreener";
  const description = "Learn how to find undervalued stocks using P/E, P/B, and ROE filters in a free stock screener. Step-by-step guide for US investors on NYSE and NASDAQ.";
  const slug = "how-to-find-undervalued-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: "How to Find Undervalued Stocks Using a Stock Screener", description, url: canonicalUrl, datePublished: "2026-06-04", dateModified: "2026-06-04", author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` }, { "@type": "ListItem", position: 3, name: "How to Find Undervalued Stocks", item: canonicalUrl }] }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">Undervalued Stocks</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Value Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">How to Find Undervalued Stocks Using a Stock Screener</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 7 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Undervalued stocks trade below their intrinsic value \u2014 meaning the market is pricing them cheaper than what the underlying business fundamentals suggest they're worth. Stock screeners make it possible to systematically find these opportunities across thousands of US stocks in seconds.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Step 1: Screen for Low P/E Ratio</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">The price-to-earnings ratio (P/E) is the most widely used valuation metric. A low P/E can indicate an undervalued stock \u2014 but only when earnings are real and recurring. Use the <a href="/screener" style="color:#2dd4bf;font-weight:600">DeltaScreener</a> to filter for P/E &lt; 15 on NYSE and NASDAQ stocks. Pair this with a minimum EPS to exclude loss-making companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Step 2: Check Price-to-Book (P/B) Ratio</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">The P/B ratio compares stock price to book value per share. Stocks trading below 1x book value are technically priced below their net assets. Filter for P/B &lt; 1.5 to find asset-heavy businesses potentially on sale. This works especially well for banks, industrials, and energy companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Step 3: Require Quality \u2014 ROE Filter</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Cheap stocks aren't always good stocks. Combine low valuation with a minimum ROE of 10\u201315% to ensure the business actually generates returns for shareholders. The <a href="/screens/undervalued-tech-stocks" style="color:#2dd4bf;font-weight:600">undervalued tech stocks screen</a> on DeltaScreener uses this exact combination.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Step 4: Check Balance Sheet Health</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">A stock might look cheap because it carries excessive debt. Always add a Debt/Equity filter (D/E &lt; 1.0 is a reasonable ceiling) when screening for undervalued stocks. High debt amplifies risk \u2014 especially when rates are elevated.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made Undervalued Stock Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Low P/E + High ROE technology stocks on US exchanges</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Broad value screen across all US sectors</span></a>
      <a href="/screens/low-pb-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/B Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Stocks trading near or below book value</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen for Undervalued Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Use DeltaScreener's 30+ filters to build your own undervalued stock screen in seconds.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "how to find undervalued stocks, undervalued stock screener, low PE stocks, value investing screener, P/E ratio screen", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet9, "onRequestGet");

// blog/how-to-screen-tech-stocks-for-value.js
async function onRequestGet10() {
  const title = "How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide | DeltaScreener";
  const description = "Learn how to screen technology stocks using ROE, P/E, and debt filters. Discover what makes high-quality tech stocks stand out and how to find them.";
  const slug = "how-to-screen-tech-stocks-for-value";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "How to Screen Tech Stocks for Value", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good ROE for a technology stock?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For technology companies, an ROE above 18\u201320% is generally considered strong. Software and platform businesses often post ROE well above 30% because they require little physical capital to scale. Hardware and semiconductor firms tend to run lower. Context matters: compare within sub-sectors rather than using a single universal threshold."
          }
        },
        {
          "@type": "Question",
          name: "Should I use P/E or P/B when screening tech stocks for value?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both can be useful, but for technology stocks P/E is typically more informative than P/B. Tech companies often have low book value relative to earnings power because their main assets are intellectual property and talent, which do not appear on the balance sheet. A P/E screen combined with an ROE floor tends to surface higher-quality opportunities than a P/B screen alone."
          }
        },
        {
          "@type": "Question",
          name: "How do I avoid high-debt tech stocks when screening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Add a debt-to-equity filter alongside your ROE or P/E criteria. A debt-to-equity ratio below 1.5\u20132.0 removes the most leveraged names. This is important because ROE can be artificially inflated by leverage \u2014 a company with a lot of debt can show a high ROE even if its underlying business returns are modest."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Screening Tech Stocks for Value</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Sector Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Technology stocks tend to attract investors with two very different goals: growth at any price, and quality at a reasonable price. If you fall into the second camp, a simple ROE-and-valuation screen can cut through hundreds of names and leave you with a shorter, more investable list \u2014 without needing to read every 10-K.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Why Tech Stocks Tend to Have High ROE</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Return on equity (ROE) measures how much profit a company generates relative to the shareholders' equity on its balance sheet. Technology companies \u2014 especially software, platforms, and semiconductor IP businesses \u2014 tend to score well on this metric for a structural reason: they do not need to own factories, warehouses, or heavy machinery to scale revenue. Once the product is built, the marginal cost of serving an additional customer is close to zero.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The result is that earnings grow faster than book value, pushing ROE higher year after year. The S&P 500 Information Technology sector reported a net profit margin of roughly 29.7% in Q1 2026, up from 25.4% in Q1 2025 \u2014 a sign that operating leverage in the sector is still compounding. That profit flows through to equity holders without requiring proportional reinvestment in tangible assets.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The caveat: ROE can also look high because a company has bought back so many shares that its equity base has shrunk. A buyback-inflated ROE says something different about quality than one driven by genuine earnings growth. That is why ROE screens work best when combined with at least one supporting filter.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">The Three-Filter Tech Screen</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">A practical starting point for screening technology stocks for quality and value uses three filters together:</p>
      <ul style="line-height:1.9;color:#d1d5db;margin:0 0 20px;padding-left:22px">
        <li style="margin-bottom:10px"><strong>Sector = Technology.</strong> This restricts the universe to companies whose primary business is in hardware, software, semiconductors, or tech services. It avoids situations where a high-ROE industrial company ends up in a "tech screen" because it has a strong software division.</li>
        <li style="margin-bottom:10px"><strong>ROE \u2265 18%.</strong> A threshold around 18\u201320% filters out low-quality or loss-making names while still leaving a reasonable number of results across large, mid, and small cap. You can tighten this to 25% or higher if you want only the top tier.</li>
        <li style="margin-bottom:10px"><strong>Debt-to-equity \u2264 2.0.</strong> This removes the most leveraged names, which is important because leverage inflates ROE. A company with $10 in assets, $8 in debt, and $2 in equity can show a 50% ROE on very modest earnings. The debt filter keeps the list grounded in genuine capital efficiency.</li>
      </ul>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">If you also want a valuation check, add <strong>P/E \u2264 30</strong> or <strong>P/B \u2264 10</strong> to the screen. The S&P 500 Information Technology sector's earnings growth rate has run above 50% year-over-year in recent quarters, which compresses forward multiples \u2014 meaning stocks that look expensive on trailing P/E may look more reasonable on a forward or PEG basis. Use a P/E cap as a rough filter, not a hard signal.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What to Watch After the Screen</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Screeners surface candidates; they do not replace analysis. Once you have a short list of high-ROE tech stocks, there are a few things worth checking before going deeper.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px"><strong>Trend in ROE over 3\u20135 years.</strong> A company that has expanded ROE from 12% to 22% tells a very different story than one that has held flat at 20% or slipped from 35% to 18%. Improving ROE often reflects widening margins or more efficient capital use. Declining ROE can signal competitive pressure or balance-sheet erosion.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px"><strong>Stock-based compensation.</strong> Many technology companies pay employees heavily in equity. This does not show up as cash leaving the business, but it does dilute shareholders and affects the equity denominator in ROE. A company with strong reported ROE but heavy share issuance deserves a closer look at diluted earnings per share over time.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px"><strong>Capital expenditure trends.</strong> The AI investment cycle has pushed capex sharply higher for large platform companies. High and rising capex can compress free cash flow even when net income stays strong, which matters if you are thinking about sustainability of returns rather than just trailing ROE.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener for This</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">DeltaScreener has a pre-built page for exactly this filter combination. You can <a href="/stocks/high-roe-tech-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">screen for high ROE tech stocks on DeltaScreener</a> to see a live, auto-updated list of US technology stocks with ROE above 18% and debt-to-equity below 2. The page pulls from fresh data and updates automatically, so you do not need to run the screen manually each time.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">If you want to adjust the thresholds \u2014 for example, tightening ROE to 25% or adding a P/E cap \u2014 the <a href="/screener" style="color:#2dd4bf;font-weight:600;text-decoration:none">interactive screener</a> lets you build custom filter combinations from scratch with no sign-up required.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:20px">
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">What is a good ROE for a technology stock?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">For technology companies, an ROE above 18\u201320% is generally considered strong. Software and platform businesses often post ROE well above 30% because they require little physical capital to scale. Hardware and semiconductor firms tend to run lower. Context matters: compare within sub-sectors rather than using a single universal threshold.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">Should I use P/E or P/B when screening tech stocks for value?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">Both can be useful, but for technology stocks P/E is typically more informative than P/B. Tech companies often have low book value relative to earnings power because their main assets are intellectual property and talent, which do not appear on the balance sheet. A P/E screen combined with an ROE floor tends to surface higher-quality opportunities than a P/B screen alone.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">How do I avoid high-debt tech stocks when screening?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">Add a debt-to-equity filter alongside your ROE or P/E criteria. A debt-to-equity ratio below 1.5\u20132.0 removes the most leveraged names. This is important because ROE can be artificially inflated by leverage \u2014 a company with a lot of debt can show a high ROE even if its underlying business returns are modest.</p>
        </div>
      </div>

      <p style="line-height:1.75;color:#d1d5db;margin:32px 0 24px">Screening for high-ROE technology stocks is a reasonable starting point for investors who want quality-focused exposure to the sector without overpaying. The filters above will not catch every great stock, and they will occasionally include ones you would reject on closer look \u2014 but they do remove most of the noise efficiently. The next step is always to dig into the individual names the screen surfaces.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for high-ROE technology stocks using live US market data \u2014 free, no sign-up required.</p>
        <a href="/stocks/high-roe-tech-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View High ROE Tech Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f1117;color:#2dd4bf;text-decoration:none;font-weight:800;font-size:14px;border:1px solid #0f766e">Open Custom Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "screen tech stocks for value, high ROE technology stocks, technology stock screener, ROE tech stocks 2026, how to screen tech stocks",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet10, "onRequestGet");

// blog/how-to-screen-tech-stocks-for-value-2026.js
async function onRequestGet11() {
  const title = "How to Screen Tech Stocks for Value | DeltaScreener";
  const description = "Find undervalued tech stocks using value screening criteria. Learn how to filter for low P/E, high ROE, and solid balance sheets in the technology sector.";
  const slug = "how-to-screen-tech-stocks-for-value-2026";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Screen Tech Stocks for Value",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "How to Screen Tech Stocks for Value", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good P/E ratio for technology stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "As of May 2026, the S&P 500 Information Technology sector has an average P/E ratio of 34.37, down from 39.91 in January. A P/E below this sector average may indicate undervaluation, though what constitutes good depends on the companys growth rate and profitability. Look for tech stocks trading at a P/E discount to both their sector and the broader market while maintaining strong ROE."
          }
        },
        {
          "@type": "Question",
          name: "How important is ROE when screening tech stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ROE (Return on Equity) is crucial for tech stock screening because it measures how efficiently a company generates profit from shareholder capital. Tech companies with high ROE typically have strong competitive moats and efficient business models. A combination of below-market P/E with above-average ROE identifies tech stocks with good value potential."
          }
        },
        {
          "@type": "Question",
          name: "Should I avoid tech stocks with high P/E ratios?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Not necessarily. A higher P/E may be justified if a tech company has exceptional growth prospects or returns on equity. However, for value-focused investors, screening for tech stocks below the sectors P/E average (34.37) combined with filters for profitability (high ROE, positive net margin) creates a more conservative selection of undervalued opportunities."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">How to Screen Tech Stocks for Value</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">How to Screen Tech Stocks for Value</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 May 21, 2026</p>

      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Finding value in the technology sector can feel counterintuitive. Tech stocks often trade at premium valuations, but that doesn't mean undervalued tech opportunities don't exist. The key is knowing which screening criteria to combine to identify tech companies trading below their intrinsic value while maintaining strong fundamentals.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:32px 0 16px;color:#f9fafb">Why Tech Valuations Matter</h2>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">The Information Technology sector accounts for 35% of the S&P 500, making it the dominant force in the broader market. As of May 2026, the average P/E ratio for tech stocks is 34.37\u2014significantly higher than many other sectors. This elevated multiple reflects investor confidence in tech's growth potential, but it also means selective screening is essential to avoid overpaying.</p>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">The concentration of earnings is extreme: the top 10% of technology companies account for 75% of the sector's total net income. This means that finding genuinely undervalued tech stocks requires drilling past the mega-cap names and identifying solid mid-cap and smaller-cap opportunities with strong fundamentals.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:32px 0 16px;color:#f9fafb">The Core Screening Filters for Value Tech</h2>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">To screen for undervalued tech stocks, focus on three complementary filters:</p>
      <ul style="margin:0 0 20px;padding-left:20px;color:#d1d5db;line-height:1.8">
        <li><strong>P/E Ratio Below Sector Average:</strong> Look for tech stocks with a P/E below 34\u2014the current sector median. This immediately excludes the most expensive names and focuses your search on relatively cheaper opportunities.</li>
        <li><strong>High Return on Equity (ROE):</strong> A tech company with a P/E of 25 is only a value play if it's generating strong returns on capital. Screen for ROE above 15%\u2014preferably 20% or higher. This ensures the company is converting shareholder capital into profit efficiently, which is especially important in tech where intangible assets (IP, talent, software) drive value.</li>
        <li><strong>Solid Net Margin:</strong> Tech companies can have high ROE while burning cash if margins are deteriorating. Filter for net profit margin above 10% to ensure profitability is real and sustainable. Software companies often exceed this; hardware often falls below it.</li>
      </ul>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:32px 0 16px;color:#f9fafb">The Balance Sheet Check</h2>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Tech companies can be capital-efficient but also prone to debt accumulation during downturns. Add a balance sheet filter: debt-to-equity ratio below 1.0, or for SaaS and software companies, below 0.5. This ensures your value find isn't overleveraged and has room to invest in innovation or weather industry downturns.</p>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Additionally, check that current ratio is above 1.5 (current assets to current liabilities). Tech companies with weak liquidity can face sudden pressure when growth slows, erasing any valuation advantage you identified.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:32px 0 16px;color:#f9fafb">Avoiding the Value Trap</h2>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">A tech stock may trade cheap for a reason. Before committing, verify that the low P/E and high ROE aren't temporary artifacts of a declining business. Check revenue growth year-over-year: you want to see at least 5\u201310% annual growth in the tech sector. Stagnating or shrinking revenue is a red flag even if ROE and margin look good.</p>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Also examine free cash flow. A company can report high earnings while burning cash if working capital is expanding or capital expenditures are rising. Screen for positive free cash flow that's at least 60% of net income\u2014this indicates earnings are being converted into actual cash the company can deploy.</p>

      <div style="margin:40px 0">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 16px;color:#f9fafb">How to Use DeltaScreener</h2>
        <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Building this screen manually would take hours, but you can screen for value tech stocks on DeltaScreener in seconds. Set these filters:</p>
        <ul style="margin:0 0 20px;padding-left:20px;color:#d1d5db;line-height:1.8">
          <li>Sector: Information Technology</li>
          <li>P/E Ratio: 10 to 35</li>
          <li>ROE: 15% or higher</li>
          <li>Net Margin: 10% or higher</li>
          <li>Debt-to-Equity: Below 1.0</li>
          <li>Current Ratio: Above 1.5</li>
          <li>Revenue Growth: 5% or higher</li>
        </ul>
        <p style="line-height:1.7;color:#d1d5db;margin:0 0 20px">Run the screen and sort by P/E (lowest first) to identify the cheapest quality tech opportunities available today.</p>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;line-height:1.2;margin:32px 0 16px;color:#f9fafb">FAQs</h2>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 16px"><strong>What is a good P/E ratio for technology stocks?</strong><br>The current sector average is 34.37. Below this is considered relatively cheap for tech. However, always pair P/E with ROE: a P/E of 25 combined with 25% ROE is better value than a P/E of 20 with 10% ROE.</p>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 16px"><strong>How important is ROE when screening tech stocks?</strong><br>Extremely important. Tech companies with high ROE have built durable competitive advantages. ROE above 20% is exceptional; 15\u201320% is solid; below 10% is concerning even if the P/E is cheap.</p>
      <p style="line-height:1.7;color:#d1d5db;margin:0 0 16px"><strong>Should I avoid tech stocks with high P/E ratios?</strong><br>Not always. A higher P/E may be justified for fast-growing, highly profitable tech companies. But for a systematic value screen, filtering for below-sector P/E combined with strong fundamentals creates a disciplined entry point.</p>

      <p style="line-height:1.7;color:#d1d5db;margin:32px 0 0">Tech stock screening doesn't require complex analysis\u2014just consistent application of valuation and quality filters. By combining below-sector P/E with high ROE, solid margins, and a strong balance sheet, you can identify tech companies with genuine value potential. Start screening today using <a href="/screener" style="color:#2dd4bf;font-weight:600;text-decoration:underline">DeltaScreener's free stock screener</a> to find these opportunities.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for undervalued tech stocks using these exact criteria \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "tech stocks, value stocks, stock screening, P/E ratio, ROE, technology sector",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet11, "onRequestGet");

// blog/low-debt-stocks-investing-guide.js
async function onRequestGet12() {
  const title = "Low Debt Stocks: How a Strong Balance Sheet Protects Investors | DeltaScreener";
  const description = "Learn how to screen for low debt stocks using the debt-to-equity ratio. Discover why balance sheet strength matters by industry and how to find financially resilient companies.";
  const slug = "low-debt-stocks-investing-guide";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Low Debt Stocks: How a Strong Balance Sheet Protects Investors",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Low Debt Stocks Investing Guide", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: 'What debt-to-equity ratio counts as "low debt"?',
          acceptedAnswer: {
            "@type": "Answer",
            text: "A debt-to-equity ratio below 0.5 is generally considered low for most non-financial sectors. For technology companies, even 0.1\u20130.3 is common. Context matters: utilities and REITs routinely run D/E ratios above 1.0 because of stable, predictable cash flows \u2014 that is not necessarily a red flag for those industries."
          }
        },
        {
          "@type": "Question",
          name: "Why do low-debt companies tend to outperform during downturns?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Companies with little debt have lower fixed interest obligations, so a drop in revenue is less likely to threaten solvency. They also retain more flexibility to invest or acquire competitors when credit markets tighten and weaker peers are forced to sell assets at a discount."
          }
        },
        {
          "@type": "Question",
          name: "Can I screen for low-debt stocks for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DeltaScreener offers a free, no-sign-up screener with a dedicated low debt stocks page pre-filtered by debt-to-equity ratio. You can further combine it with dividend yield, ROE, or sector filters at no cost."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Low Debt Stocks Guide</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Balance Sheet Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Low Debt Stocks: How a Strong Balance Sheet Protects Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">When markets get choppy, balance sheet quality quickly separates durable businesses from fragile ones. Companies with low debt can survive a revenue slowdown, keep investing, and sometimes acquire struggling competitors at a discount \u2014 all while highly leveraged peers scramble to service interest payments. Understanding how to screen for low-debt stocks is one of the most practical skills a long-term investor can develop.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">What the Debt-to-Equity Ratio Actually Measures</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The debt-to-equity (D/E) ratio divides a company's total debt by its shareholders' equity. A ratio of 0.5 means the company has 50 cents of debt for every dollar of equity. A ratio of 2.0 means debt is twice the equity base \u2014 a much more leveraged position.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">What counts as "low" depends heavily on the sector. Across 94 industry groups tracked in 2026, market debt-to-capital ratios range from roughly 2% in software companies all the way to 78% in capital-intensive manufacturing sectors like rubber and tire production. Technology companies such as Alphabet and Microsoft routinely carry D/E ratios well below 0.3, partly because they generate strong cash flows without needing large fixed-asset bases. Utilities, by contrast, often run D/E ratios above 1.0 \u2014 but that is generally acceptable because regulated utilities have predictable, contracted revenues that comfortably cover interest.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The key takeaway: always compare a company's debt ratio against its own industry peers, not against some universal number.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Why Low-Debt Companies Tend to Be More Resilient</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Debt is a fixed obligation. When revenue falls during a recession or industry downturn, a company with heavy debt still owes interest and principal on schedule. If cash runs short, it may need to issue dilutive equity, sell assets at bad prices, or in the worst case face bankruptcy. None of those outcomes benefit shareholders.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">A company with minimal debt has the opposite problem \u2014 a good one. Its fixed costs are lower, so the same revenue drop is far less threatening. Beyond survival, low-debt companies often emerge from downturns stronger than before: they have the financial flexibility to hire talent that competitors are laying off, invest in R&D when peers are cutting budgets, or acquire distressed assets cheaply. This "optionality" is a real competitive advantage, even if it does not show up directly in earnings per share in a calm market.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">It is also worth noting that interest expense directly reduces pre-tax income. A company earning $100 million in operating income but paying $30 million in interest reports just $70 million in taxable income. Strip that leverage away and the same business looks considerably more profitable \u2014 which is why some investors screen for EBIT or operating income in addition to reported earnings when comparing highly leveraged and debt-free peers.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">How to Use Balance Sheet Filters in Stock Screening</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Effective balance sheet screening usually combines two or three filters rather than relying on D/E alone:</p>
      <ul style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:10px"><strong>Debt-to-equity &lt; 0.5</strong> \u2014 a reasonable starting threshold for most non-financial sectors. Tighten to &lt;0.3 if you want genuinely fortress-like balance sheets.</li>
        <li style="margin-bottom:10px"><strong>Current ratio &gt; 1.5</strong> \u2014 confirms the company can cover short-term obligations without stress, even if D/E looks fine on paper.</li>
        <li style="margin-bottom:10px"><strong>Interest coverage &gt; 5x</strong> \u2014 operating income should comfortably exceed interest expense. Companies below 3x deserve extra scrutiny.</li>
        <li style="margin-bottom:10px"><strong>Positive free cash flow</strong> \u2014 a company generating consistent free cash flow is organically deleveraging over time, even if the debt balance has not changed yet.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Pairing these balance sheet filters with a profitability metric \u2014 return on equity above 15%, for instance \u2014 tends to surface companies that are not just debt-free but are actually efficient with the capital they do employ. That combination narrows a universe of thousands of stocks to a more manageable, higher-quality shortlist.</p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">You can <a href="/stocks/low-debt-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">screen for low debt stocks on DeltaScreener</a> \u2014 the page is pre-filtered by debt-to-equity ratio across the full US market, no sign-up required. From there you can layer in additional criteria like dividend yield or sector.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>

      <div style="border-left:3px solid #0f766e;padding-left:20px;margin-bottom:28px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">What debt-to-equity ratio counts as "low debt"?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">A D/E ratio below 0.5 is generally considered low for most non-financial sectors. Technology companies often sit between 0.1 and 0.3. Context matters: utilities and REITs routinely exceed 1.0 because their cash flows are stable and predictable \u2014 that is not necessarily a red flag in those industries.</p>
      </div>

      <div style="border-left:3px solid #0f766e;padding-left:20px;margin-bottom:28px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">Why do low-debt companies tend to outperform during downturns?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Lower fixed interest obligations mean a revenue drop is less likely to threaten solvency. These companies also retain flexibility to invest or acquire competitors when credit markets tighten and weaker peers are forced to sell assets at steep discounts.</p>
      </div>

      <div style="border-left:3px solid #0f766e;padding-left:20px;margin-bottom:40px">
        <p style="font-size:15px;font-weight:700;color:#f9fafb;margin:0 0 8px">Can I screen for low-debt stocks for free?</p>
        <p style="font-size:15px;line-height:1.7;color:#d1d5db;margin:0">Yes. DeltaScreener's <a href="/stocks/low-debt-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">low debt stocks screener</a> is free with no account required. You can also combine debt filters with other criteria on the <a href="/screener" style="color:#2dd4bf;font-weight:600;text-decoration:none">full screener</a>.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for low-debt US stocks using real balance sheet data \u2014 free, no sign-up required.</p>
        <a href="/stocks/low-debt-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View Low Debt Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:transparent;color:#2dd4bf;text-decoration:none;font-weight:800;font-size:14px;border:2px solid #0f766e">Open Full Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "low debt stocks, debt to equity ratio, balance sheet investing, stock screening, financial strength stocks, low leverage stocks",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet12, "onRequestGet");

// blog/nasdaq-high-roe-stocks-guide.js
async function onRequestGet13() {
  const title = "NASDAQ High ROE Stocks: A Practical Screening Guide | DeltaScreener";
  const description = "Learn how to screen NASDAQ-listed stocks for high return on equity (ROE). Discover why NASDAQ skews toward capital-light businesses and how to filter for quality.";
  const slug = "nasdaq-high-roe-stocks-guide";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "NASDAQ High ROE Stocks: A Practical Screening Guide",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "NASDAQ High ROE Stocks Guide", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why do NASDAQ stocks tend to have higher ROE than NYSE stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NASDAQ has a heavy concentration of technology, software, and biotech companies. These businesses are often capital-light \u2014 they generate earnings from intellectual property and recurring subscriptions rather than physical assets. Less equity on the balance sheet relative to earnings produces naturally higher ROE figures."
          }
        },
        {
          "@type": "Question",
          name: "What is a good ROE threshold for NASDAQ stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A general benchmark is 15% or higher. For NASDAQ tech and software stocks, many quality names exceed 20\u201330%. However, ROE above 50% should be cross-checked \u2014 it can result from high leverage rather than genuine profitability."
          }
        },
        {
          "@type": "Question",
          name: "How is NASDAQ different from the NYSE for stock screening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The NYSE lists around 2,000 companies with a combined domestic market cap of roughly $38 trillion, skewing toward industrials, financials, and blue chips. NASDAQ lists over 3,000 companies and is dominated by technology and growth names. Filtering by exchange lets you target different sectors and business models in your screen."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">NASDAQ High ROE Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">NASDAQ High ROE Stocks: A Practical Screening Guide</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Return on equity (ROE) measures how efficiently a company turns shareholder capital into profit. When you combine that filter with an exchange filter \u2014 specifically NASDAQ \u2014 you're targeting a market dominated by capital-light, technology-driven businesses that structurally tend to produce high ROE. Here's how to think about that screen and why it works.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#f9fafb;margin:40px 0 12px">Why Exchange Matters in a Stock Screen</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">The NYSE and NASDAQ are both U.S. equity exchanges, but they list very different types of companies. As of 2026, the NYSE hosts roughly 2,000 domestic companies with a combined market cap of about $38 trillion \u2014 the bulk of that in financials, industrials, energy, and consumer staples. NASDAQ lists over 3,000 companies and leans heavily toward technology, software, semiconductors, and biotech.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">That compositional difference matters when you're screening for quality metrics like ROE. A diversified financial on the NYSE carries a large asset base that naturally compresses ROE. A software company on NASDAQ might generate hundreds of millions in net income with very little equity on the balance sheet \u2014 producing ROE of 30%, 50%, or more.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 24px">Filtering by exchange isn't a shortcut \u2014 it's a way to pre-select the universe of companies where a particular financial profile is more likely to appear.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#f9fafb;margin:40px 0 12px">What Makes NASDAQ Companies Structurally High-ROE</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">ROE is calculated as net income divided by shareholders' equity. For ROE to be high, a company either needs strong earnings or a lean equity base \u2014 ideally both. NASDAQ-listed technology and software businesses often check both boxes:</p>
      <ul style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Low asset intensity.</strong> A software company's main assets are its codebase and customer relationships \u2014 neither shows up as a large line item on the balance sheet. Contrast that with a manufacturer that must hold billions in property, plant, and equipment.</li>
        <li style="margin-bottom:8px"><strong>Recurring revenue with high margins.</strong> Subscription-based SaaS businesses can generate very high net margins (often 20\u201335%) at scale, which flows directly into stronger earnings and thus higher ROE.</li>
        <li style="margin-bottom:8px"><strong>Share buybacks over time.</strong> Many mature NASDAQ tech companies buy back stock aggressively, which reduces equity and mechanically lifts ROE \u2014 worth being aware of when interpreting the number.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 24px">During the first half of 2025, NASDAQ outpaced the NYSE in IPO activity with 79 traditional listings raising roughly $9 billion \u2014 a signal that high-growth, capital-light businesses continue to prefer NASDAQ as their listing home.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#f9fafb;margin:40px 0 12px">How to Build the Screen: NASDAQ + High ROE</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">A basic version of this screen uses three filters:</p>
      <ul style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Exchange: NASDAQ</strong> \u2014 narrows the universe to ~3,000+ companies skewed toward tech and growth.</li>
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong> \u2014 a widely used threshold for capital efficiency. Raise to 20\u201325% if you want only elite earners.</li>
        <li style="margin-bottom:8px"><strong>Debt-to-equity \u2264 1.0</strong> \u2014 this is optional but important. A company can inflate ROE by taking on debt (more earnings, less equity). Adding a debt filter ensures the ROE is genuinely organic.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">From there, you can layer in market cap minimums (to avoid microcaps), net margin floors (to confirm profitability quality), or sector filters (to target pure software vs. hardware vs. biotech).</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 24px">One caution: very high ROE (above 50%) deserves scrutiny. It could reflect genuine competitive advantage, but it can also indicate negative equity from large buybacks or leveraged capital structures. Always pair ROE with a debt check before drawing conclusions.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#f9fafb;margin:40px 0 12px">How to Use DeltaScreener for This</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 16px">You can <a href="/stocks/high-roe-stocks" style="color:#2dd4bf;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> and add an exchange filter to narrow to NASDAQ listings specifically. The screener lets you combine ROE, debt-to-equity, market cap, and sector filters in one view \u2014 no sign-up required.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 24px">The results update with current fundamental data, so you're working with the latest reported figures rather than stale snapshots.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#f9fafb;margin:40px 0 12px">FAQ</h2>

      <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:24px;margin-top:8px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">Why do NASDAQ stocks tend to have higher ROE than NYSE stocks?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 24px">NASDAQ has a heavy concentration of technology, software, and biotech companies. These businesses are often capital-light \u2014 they generate earnings from intellectual property and recurring subscriptions rather than physical assets. Less equity on the balance sheet relative to earnings produces naturally higher ROE figures.</p>

        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What is a good ROE threshold for NASDAQ stocks?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 24px">A general benchmark is 15% or higher. For NASDAQ tech and software stocks, many quality names exceed 20\u201330%. However, ROE above 50% should be cross-checked \u2014 it can result from high leverage rather than genuine profitability.</p>

        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">How is NASDAQ different from the NYSE for stock screening?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 8px">The NYSE lists around 2,000 companies with a combined domestic market cap of roughly $38 trillion, skewing toward industrials, financials, and blue chips. NASDAQ lists over 3,000 companies and is dominated by technology and growth names. Filtering by exchange lets you target different sectors and business models in your screen.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:32px 0 24px">The NASDAQ + high ROE combination is one of the more practical entry points for investors looking for quality businesses without having to manually comb through thousands of names. With the right filters in place, you can surface a shortlist of capital-efficient compounders \u2014 and then do the deeper fundamental work from there. <a href="/screener" style="color:#2dd4bf;text-decoration:underline">Start building your screen on DeltaScreener</a> today.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for NASDAQ high ROE stocks using these exact criteria \u2014 free, no sign-up required.</p>
        <a href="/stocks/high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Screen High ROE Stocks \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "NASDAQ high ROE stocks, return on equity NASDAQ, stock screening ROE, NASDAQ vs NYSE stock picking, high ROE technology stocks 2026",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet13, "onRequestGet");

// blog/nasdaq-stock-screener.js
async function onRequestGet14() {
  const title = "NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free | DeltaScreener";
  const description = "Free NASDAQ stock screener with 30+ filters. Screen NASDAQ-listed stocks by P/E, ROE, market cap, growth and more. No sign-up required.";
  const slug = "nasdaq-stock-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: "NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free", description, url: canonicalUrl, datePublished: "2026-06-01", author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` }, { "@type": "ListItem", position: 3, name: "NASDAQ Stock Screener", item: canonicalUrl }] }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">NASDAQ Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Exchange Screening</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 5 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">The NASDAQ is home to over 3,000 stocks \u2014 dominated by technology, biotech, and high-growth companies. Screening NASDAQ stocks requires filters tuned for higher-growth, higher-valuation businesses compared to NYSE-listed companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Makes NASDAQ Stocks Different</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">NASDAQ stocks typically have higher P/E ratios than NYSE companies because they tend to be faster-growing. Technology, semiconductors, and biotech dominate the index. When screening NASDAQ stocks, consider using growth metrics (EPS growth, revenue growth) alongside quality filters rather than pure value screens.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Best Filters for NASDAQ Stock Screening</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>ROE &gt; 15%</strong> \u2014 Quality filter for high-growth NASDAQ names</li>
      <li><strong>EPS Growth &gt; 10%</strong> \u2014 Identifies expanding businesses</li>
      <li><strong>Net Margin &gt; 15%</strong> \u2014 Software and tech businesses with strong economics</li>
      <li><strong>Market Cap &gt; $1B</strong> \u2014 Focus on established names with liquidity</li>
      <li><strong>Debt/Equity &lt; 1.5</strong> \u2014 NASDAQ firms can carry more debt if growth is strong</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made NASDAQ Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/nasdaq-high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">NASDAQ High ROE Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Quality NASDAQ companies by return on equity</span></a>
      <a href="/screens/high-roe-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Technology sector quality screen</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Tech stocks at reasonable valuations</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen NASDAQ Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">DeltaScreener covers all NASDAQ-listed stocks with 30+ filters. No account required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "NASDAQ stock screener, NASDAQ stocks filter, free NASDAQ screener, screen NASDAQ stocks, NASDAQ high ROE", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet14, "onRequestGet");

// blog/nasdaq-vs-nyse-stock-screening.js
async function onRequestGet15() {
  const title = "NYSE vs NASDAQ: Key Differences for Stock Pickers | DeltaScreener";
  const description = "Understand NYSE vs NASDAQ exchanges. Learn listing requirements, trading volumes, and how to screen tech vs traditional stocks effectively.";
  const slug = "nasdaq-vs-nyse-stock-screening";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "NYSE vs NASDAQ: Key Differences for Stock Pickers",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "NYSE vs NASDAQ", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the main difference between NYSE and NASDAQ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The NYSE uses a hybrid floor-based specialist model with Designated Market Makers who maintain fair markets, while NASDAQ operates as a fully electronic dealer market with no physical trading floor. This makes NASDAQ faster and more modern, while NYSE maintains a traditional approach."
          }
        },
        {
          "@type": "Question",
          name: "Which exchange is better for tech stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "NASDAQ is widely known for hosting tech-focused companies and is seen as the more modern exchange. Many of the largest tech firms like Apple, Amazon, and Microsoft trade on NASDAQ. However, both exchanges have companies from all sectors."
          }
        },
        {
          "@type": "Question",
          name: "Are there different listing requirements for NYSE and NASDAQ?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. NYSE requires companies to have a $100M market cap and three years of earnings history, while NASDAQ allows a $50M market cap with lower earnings thresholds. It is typically 70-80% cheaper to list on NASDAQ compared to NYSE."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">NYSE vs NASDAQ</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">NYSE vs NASDAQ: Key Differences for Stock Pickers</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">If you're building a stock screen or researching companies, you've probably noticed that different stocks trade on different exchanges. The two largest in the US are the New York Stock Exchange (NYSE) and the NASDAQ. But what's the difference between them, and does it matter for your investing? Understanding these exchanges will help you build better screens and identify stocks that fit your strategy.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">How the NYSE and NASDAQ Actually Trade</h2>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">The most fundamental difference between these exchanges is <strong>how they execute trades</strong>. The NYSE uses a hybrid floor-based specialist model. This means human traders (Designated Market Makers, or DMMs) work on the physical trading floor in New York to match buyers and sellers. These specialists are responsible for maintaining fair and orderly markets in specific stocks and must continuously quote bid and ask prices.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">NASDAQ, on the other hand, is fully electronic. There is no physical trading floor. Instead, trades are matched through computer systems operated by market makers and dealers who compete electronically. This electronic model generally means faster order execution and tighter bid-ask spreads, especially for liquid stocks.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">In practice, both exchanges handle enormous daily trading volumes. The NYSE processes around 4\u20135 billion shares per day, while NASDAQ handles 5\u20136 billion shares daily, reflecting their comparable scale and importance to the US stock market.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">Listing Requirements: Easier on NASDAQ</h2>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Not all companies can list on the NYSE or NASDAQ\u2014each exchange has standards that must be met. And these standards differ significantly, which is worth understanding if you're screening for newer or smaller companies.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">The <strong>NYSE requires</strong> companies to have a market capitalization of at least $100 million and a minimum of three years of profitability history. The exchange also has stricter governance and financial standards overall, reflecting its more traditional, conservative reputation.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">The <strong>NASDAQ requires</strong> only a $50 million market cap and has lower earnings thresholds. This lower barrier to entry is one reason why growth-stage and tech companies often choose NASDAQ. Listing on NASDAQ is typically 70\u201380% cheaper than listing on the NYSE, making it more accessible to smaller companies looking to go public.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">If you're screening for established, profitable companies with strong track records, you'll find more of them on the NYSE. If you're interested in growth-stage tech firms or companies earlier in their public journey, NASDAQ will have a larger pool.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">Sector Concentration: Tech on NASDAQ, Diversified on NYSE</h2>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">NASDAQ has earned its reputation as the "tech exchange." Companies like Apple, Microsoft, Amazon, Alphabet, and NVIDIA\u2014some of the largest and most successful tech firms in the world\u2014trade on NASDAQ. This dominance of high-growth, high-ROE technology companies gives NASDAQ a distinctly different character.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">The NYSE, by contrast, is more diversified. You'll find major financial institutions, industrial companies, consumer staples, utilities, and energy firms on the NYSE. This reflects its longer history and traditional role as the primary market for established US corporations across all sectors.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">This sector distribution matters when you're screening. If you want to isolate high-ROE tech stocks, you'll find a richer selection on NASDAQ. If you're looking for high-ROE companies across utilities, financials, or energy, the NYSE will have more options.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">Market Cap and Scale</h2>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Both the NYSE and NASDAQ are enormous markets with roughly equal total market capitalization. As of 2026, they hold a combined market cap in the trillions, and they're nearly balanced in size. This means neither exchange has a monopoly on the largest companies\u2014both have mega-cap firms trading on them.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">However, the composition differs. NASDAQ leans toward larger tech and biotech names, while the NYSE has more traditional large-cap corporations. When you're screening, this distinction helps: if you want to avoid overexposure to any single sector or trading pattern, it's valuable to understand which exchange a stock trades on.</p>

      <div style="margin:32px 0;padding:16px;border-left:4px solid #0f766e;background:#f0fdf9">
        <h3 style="font-size:16px;font-weight:700;color:#2dd4bf;margin:0 0 8px">Key Takeaway for Stock Screeners</h3>
        <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0">When you're building a stock screen, knowing which exchange a company trades on gives you insight into its profile. NASDAQ leans tech and growth; NYSE is more diversified and traditional. Use this knowledge to refine your filters\u2014screen for high-ROE tech on NASDAQ or stable dividend payers on the NYSE.</p>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">How to Use DeltaScreener to Screen by Exchange</h2>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Now that you understand the differences, you can use this knowledge in your screening strategy. DeltaScreener lets you filter stocks by exchange, sector, and financial metrics like ROE, debt-to-equity, and dividend yield. This means you can build screens tailored to each exchange's characteristics.</p>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">For example, you could <a href="/screener" style="color:#2dd4bf;text-decoration:underline">screen for high-ROE NASDAQ stocks</a> to isolate profitable tech companies, or filter for dividend-paying NYSE stocks to find stable income generators. By combining exchange selection with other filters, you'll uncover stocks that match your exact investment criteria.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#f9fafb">FAQs</h2>

      <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:16px 0 8px">Which exchange is better for investing?</h3>
      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Neither is inherently "better"\u2014they're different. Choose based on your investment goals. If you want exposure to tech growth, NASDAQ has more options. If you want diversified sectors and established blue-chips, the NYSE is stronger.</p>

      <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:16px 0 8px">Do stocks move differently on NYSE vs NASDAQ?</h3>
      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Not inherently, but broader market trends and sector momentum affect them differently. NASDAQ is more volatile because of its tech concentration. NYSE tends to be more stable due to its mix of sectors. This is reflected in volatility metrics and correlations.</p>

      <h3 style="font-size:16px;font-weight:700;color:#f9fafb;margin:16px 0 8px">Can I screen for stocks from both exchanges at once?</h3>
      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:0 0 16px">Yes. On DeltaScreener, you can apply all your filters (ROE, debt levels, sector) across both exchanges, or select one exchange to narrow your focus. This flexibility lets you compare high-ROE companies across the whole market or zoom into specific exchange characteristics.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Filter stocks by exchange, ROE, sector, and more\u2014all free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>

      <p style="color:#d1d5db;line-height:1.7;font-size:15px;margin:40px 0 0">Understanding NYSE and NASDAQ gives you a strategic edge when screening for stocks. Each exchange reflects different investor appetites, growth profiles, and sectors. Use this knowledge to refine your searches and find stocks that truly fit your criteria. Start exploring with our free stock screener today.</p>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "NYSE vs NASDAQ, stock exchange differences, listing requirements, tech stocks, stock screening",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet15, "onRequestGet");

// blog/nyse-vs-nasdaq-stock-picking.js
async function onRequestGet16() {
  const title = "NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know | DeltaScreener";
  const description = "Learn the key differences between NYSE and NASDAQ for stock pickers \u2014 market structure, listing requirements, sector concentration, and how to use exchange filters in your screen.";
  const slug = "nyse-vs-nasdaq-stock-picking";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "NYSE vs NASDAQ: Key Differences for Stock Pickers", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is NYSE or NASDAQ better for stock picking?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Neither exchange is inherently better for stock picking \u2014 the right choice depends on your strategy. NYSE tends to list more established, dividend-paying companies in industrials, financials, and energy. NASDAQ skews toward technology and growth companies. Screening within a specific exchange can help when your strategy is built around the characteristics more common to one listing universe."
          }
        },
        {
          "@type": "Question",
          name: "Do stocks listed on NYSE vs NASDAQ perform differently?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Performance differences are mostly explained by sector composition rather than the exchange itself. NASDAQ-listed stocks outperformed in 2025 largely because technology \u2014 which makes up about 61% of the NASDAQ-100 by weight \u2014 had a strong year. NYSE-listed stocks include more defensive and value-oriented sectors that behave differently across cycles."
          }
        },
        {
          "@type": "Question",
          name: "Can I screen stocks by exchange on DeltaScreener?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DeltaScreener supports exchange filters for both NYSE and NASDAQ. You can use the interactive screener to add an exchange condition alongside any other metric, or browse pre-built pages like NASDAQ high ROE stocks or NYSE low debt stocks directly."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">NYSE vs NASDAQ</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Exchange Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">When you screen US stocks, every result carries an exchange label \u2014 NYSE or NASDAQ. Most investors scroll past it. But for stock pickers who care about sector exposure, listing quality, and market structure, the exchange a company trades on tells you something real about what kind of business it is likely to be.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How the Two Exchanges Are Structured Differently</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The New York Stock Exchange and the Nasdaq Stock Market are the two largest equities exchanges in the world. Together they support a combined US stock market valued at roughly <strong>$69 trillion</strong> as of early 2026 \u2014 but they operate in meaningfully different ways.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The NYSE functions as an <strong>auction market</strong>. Buyers and sellers meet at a central point \u2014 historically a physical trading floor \u2014 and a designated market maker facilitates price discovery by matching orders directly. The process is designed to reduce volatility around the open and close, which matters for large institutional trades in high-volume stocks.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Nasdaq, by contrast, is a <strong>dealer market</strong>. Trades happen electronically through a network of competing market makers rather than at a single central point. There is no physical floor. This structure made Nasdaq the natural home for technology companies in the 1970s and 1980s, when many fast-growing businesses were too small or unconventional to meet NYSE listing requirements \u2014 and it shaped the DNA of both exchanges ever since.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">In practice, for most retail investors, the structural difference does not affect how you buy or sell a stock. But it does affect what kinds of companies tend to list where, and that has real consequences for stock screening.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Sector Composition: The Real Difference for Stock Pickers</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The practical implication of exchange history is sector skew. <strong>About 70% of S&P 500 companies are listed on the NYSE</strong>, including the majority of large-cap industrials, financials, healthcare, energy, and consumer staples names. These sectors tend to produce steady cash flows, pay dividends, and carry more leverage \u2014 traits that fit comfortably with NYSE's reputation as the home of established, institutional-grade companies.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Nasdaq skews heavily toward technology. The technology sector makes up approximately <strong>61% of the NASDAQ-100 by weight</strong>, and it drove 88% of the index's total return in 2025. That year, the NASDAQ-100 delivered a 21% total return, outpacing the S&P 500 by 3 percentage points \u2014 a gap that was almost entirely explained by tech sector performance.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">This has real implications for stock screens. If you run an ROE filter on the full US market without an exchange filter, you will likely see Nasdaq-heavy results \u2014 because technology companies structurally tend to produce higher returns on equity than capital-intensive industries. Adding an exchange filter changes the universe you are working within, and with it, the average quality characteristics of the results.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Listing Requirements: What They Signal About Quality</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Both exchanges have minimum listing requirements \u2014 thresholds for market cap, share price, profitability, and corporate governance. NYSE requirements are generally viewed as slightly more stringent overall, which is one reason it is associated with larger, more established companies. Nasdaq has three listing tiers \u2014 the Nasdaq Global Select Market, the Nasdaq Global Market, and the Nasdaq Capital Market \u2014 with descending requirements at each level.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Both exchanges require companies to maintain a minimum bid price of at least $1.00 per share. Companies that fall below this threshold are given a grace period to regain compliance \u2014 though recent rule changes in 2025 tightened the terms around reverse stock splits as a remediation tool on both exchanges.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">For stock pickers, the key takeaway is this: exchange membership alone is not a quality filter, but it is a useful proxy for the type of company you are likely to find. A stock on the NYSE main market is almost certainly a large or mid-cap business with sustained profitability. A stock on the Nasdaq Capital Market tier may be earlier-stage or carrying more risk.</p>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">That is why exchange-specific screens can be a useful complement to fundamental filters. An NYSE low-debt screen produces a different universe than a Nasdaq low-debt screen \u2014 not because debt-to-equity is calculated differently, but because the underlying companies are structurally different.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use Exchange Filters in Your Stock Screen</h2>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">Exchange filters work best as a secondary constraint alongside primary fundamental filters, not as a standalone screen. Here are a few practical combinations worth trying:</p>
      <ul style="line-height:1.9;color:#d1d5db;margin:0 0 20px;padding-left:22px">
        <li style="margin-bottom:10px"><strong>NASDAQ + High ROE:</strong> Narrows the Nasdaq universe to capital-efficient businesses, which tends to surface technology and software companies with strong underlying economics. You can <a href="/stocks/nasdaq-high-roe-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">screen for NASDAQ high ROE stocks on DeltaScreener</a> directly.</li>
        <li style="margin-bottom:10px"><strong>NYSE + Low Debt:</strong> Targets established companies with conservative balance sheets \u2014 a common starting point for dividend-focused or defensive investors. DeltaScreener's <a href="/stocks/nyse-low-debt-stocks" style="color:#2dd4bf;font-weight:600;text-decoration:none">NYSE low debt stocks page</a> runs this filter automatically.</li>
        <li style="margin-bottom:10px"><strong>Exchange + Sector:</strong> Layering an exchange filter on top of a sector filter (e.g., Nasdaq + Technology + ROE \u2265 20%) can reduce the universe to a manageable size without losing too much breadth.</li>
      </ul>
      <p style="line-height:1.75;color:#d1d5db;margin:0 0 16px">The goal is not to pick stocks based on which exchange they trade on. The goal is to use exchange membership as one lens among many \u2014 a proxy for listing history, size, and sector \u2014 that makes your fundamental screens more coherent.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
      <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:20px">
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">Is NYSE or NASDAQ better for stock picking?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">Neither exchange is inherently better \u2014 it depends on your strategy. NYSE tends to list more established, dividend-paying companies in industrials, financials, and energy. NASDAQ skews toward technology and growth companies. Screening within a specific exchange can help when your strategy is built around the characteristics more common to one listing universe.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">Do stocks listed on NYSE vs NASDAQ perform differently?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">Performance differences are mostly explained by sector composition rather than the exchange itself. NASDAQ-listed stocks outperformed in 2025 largely because technology \u2014 which makes up about 61% of the NASDAQ-100 by weight \u2014 had a strong year. NYSE-listed stocks include more defensive and value-oriented sectors that behave differently across cycles.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#f9fafb;margin:0 0 8px;font-size:16px">Can I screen stocks by exchange on DeltaScreener?</p>
          <p style="line-height:1.75;color:#d1d5db;margin:0">Yes. DeltaScreener supports exchange filters for both NYSE and NASDAQ. You can use the interactive screener to add an exchange condition alongside any other metric, or browse pre-built pages like NASDAQ high ROE stocks or NYSE low debt stocks directly.</p>
        </div>
      </div>

      <p style="line-height:1.75;color:#d1d5db;margin:32px 0 24px">NYSE and NASDAQ are not interchangeable labels \u2014 they represent meaningfully different listing universes with different sector tilts, size distributions, and historical profiles. Understanding the difference helps you build tighter, more intentional stock screens rather than running filters against a mixed pool where the results are harder to interpret. Start with the fundamentals, then use exchange as a secondary lens to sharpen the universe you are working within.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for NYSE or NASDAQ stocks using ROE, debt, valuation, and sector filters \u2014 free, no sign-up required.</p>
        <a href="/stocks/nasdaq-high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">NASDAQ High ROE Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f1117;color:#2dd4bf;text-decoration:none;font-weight:800;font-size:14px;border:1px solid #0f766e">Open Custom Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "NYSE vs NASDAQ, NYSE NASDAQ differences, stock picking exchange, NASDAQ high ROE stocks, NYSE low debt stocks, exchange stock screener 2026",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet16, "onRequestGet");

// blog/roe-and-debt-screening-strategy.js
async function onRequestGet17() {
  const title = "Combining ROE and Debt Filters: A Smarter Stock Screening Strategy | DeltaScreener";
  const description = "Learn how combining ROE and debt-to-equity filters narrows thousands of US stocks to a focused list of quality companies. Step-by-step stock screening strategy guide.";
  const slug = "roe-and-debt-screening-strategy";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Combining ROE and Debt Filters: A Smarter Stock Screening Strategy",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "ROE and Debt Screening Strategy", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good ROE threshold for stock screening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most investors look for ROE above 15% as a starting point. ROE above 20% is generally considered strong. However, thresholds vary by sector \u2014 capital-light technology companies often achieve ROE of 30%+ while utilities and banks operate at lower levels. Always compare ROE within the same industry."
          }
        },
        {
          "@type": "Question",
          name: "What debt-to-equity ratio is safe when screening stocks?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A debt-to-equity ratio below 1.0 is considered conservative for most non-financial sectors. Many quality-focused screeners use 0.5 or lower as a filter. Again, context matters \u2014 some industries like utilities carry higher structural debt that should not automatically disqualify a company."
          }
        },
        {
          "@type": "Question",
          name: "Can I combine ROE and debt-to-equity filters for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. DeltaScreener lets you filter US stocks by ROE, debt-to-equity, net margin, and dozens of other criteria for free with no sign-up required at deltascreener.com/screener."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">ROE &amp; Debt Screening Strategy</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screening Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Combining ROE and Debt Filters: A Smarter Stock Screening Strategy</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.8;color:#e5e7eb;margin:0 0 24px">There are over 6,000 publicly traded companies in the US market. Running a single filter narrows that list \u2014 but combining two complementary metrics like <strong>Return on Equity (ROE)</strong> and <strong>debt-to-equity ratio</strong> turns a broad universe into a focused watchlist of genuinely strong businesses. This guide walks through exactly how to do it, and why the combination works so well together.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Why Use Two Filters Instead of One?</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">A single metric can mislead. A company with an outstanding ROE of 40% might look like a dream investment \u2014 until you discover it's achieved by loading up on debt. Leverage amplifies returns on equity mathematically, but it also amplifies risk. A company borrowing heavily to manufacture earnings growth is a fundamentally different (and riskier) proposition than one achieving the same ROE through genuine operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">Conversely, a company with a pristine balance sheet and near-zero debt might score low on ROE simply because it holds large cash reserves it hasn't deployed yet. No single number tells the full story.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">Pairing ROE with a debt filter addresses this directly. When a company achieves high ROE <em>and</em> maintains low leverage, there's a much higher probability the profitability is real, sustainable, and not borrowed against future risk.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Setting the Right Thresholds</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">There's no universal right answer, but here's a practical starting framework for US equities:</p>
      <ul style="font-size:16px;line-height:1.9;color:#d1d5db;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong> \u2014 Filters out companies that are destroying or barely earning their cost of equity. For a tighter screen, raise this to 20%.</li>
        <li style="margin-bottom:8px"><strong>Debt-to-Equity \u2264 1.0</strong> \u2014 Keeps companies where total debt doesn't exceed shareholder equity. For a conservative screen, use 0.5 or lower.</li>
        <li style="margin-bottom:8px"><strong>Market cap \u2265 $500M</strong> \u2014 Optional, but helps exclude micro-caps with limited liquidity or data reliability.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">With these three inputs applied to the full US market, you'll typically move from 6,000+ stocks to somewhere between 150 and 400 candidates \u2014 a manageable list for deeper research. With the S&P 500 currently trading at a P/E ratio of around 25.6 (as of June 2026), disciplined screening on fundamentals matters more than ever for investors trying to find reasonably valued quality companies.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Sector Context: Don't Screen Blind</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">Screening thresholds should be calibrated to the sector you're looking at. Capital-light software and consumer brands can deliver ROE well above 30% with minimal debt. Heavy-capital industries like utilities, telecommunications, and infrastructure typically carry higher debt loads structurally \u2014 comparing them on a flat 0.5 D/E filter would exclude most of the sector regardless of quality.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">A practical approach: run your broad ROE + D/E screen first, then look at results by sector. If you notice a sector is entirely absent, consider whether your threshold is appropriate for that industry's typical capital structure \u2014 or whether that sector is genuinely avoiding your criteria for the wrong reasons.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">Technology and healthcare tend to pass strict ROE + low-debt screens in relatively high numbers. Financials are a special case where debt-to-equity comparisons don't translate well \u2014 banks use leverage as a core business mechanic, not just a capital structure choice.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">Adding a Third Filter: Net Margin</h2>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">Once you're comfortable with the two-filter approach, adding net margin as a third input meaningfully improves result quality. Net margin measures how much of each dollar of revenue a company actually retains as profit after all costs \u2014 it's a direct measure of operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">A three-filter screen combining:</p>
      <ul style="font-size:16px;line-height:1.9;color:#d1d5db;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong></li>
        <li style="margin-bottom:8px"><strong>D/E \u2264 1.0</strong></li>
        <li style="margin-bottom:8px"><strong>Net margin \u2265 10%</strong></li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">\u2026produces a list where profitability is confirmed at multiple levels: at the equity level (ROE), at the balance sheet level (D/E), and at the revenue level (net margin). Companies passing all three tend to be durable businesses with real competitive advantages \u2014 not one-time earners or firms temporarily inflated by financial engineering.</p>
      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 18px">This is exactly the type of multi-factor screen you can run on DeltaScreener. You can <a href="/screener" style="color:#2dd4bf;text-decoration:none;font-weight:600">screen for high ROE, low debt stocks on DeltaScreener</a> with all three filters in seconds \u2014 free, no sign-up required.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#f9fafb">FAQ</h2>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 6px">What is a good ROE threshold for stock screening?</p>
        <p style="font-size:15px;line-height:1.8;color:#d1d5db;margin:0">Most investors look for ROE above 15% as a starting point. ROE above 20% is generally considered strong. However, thresholds vary by sector \u2014 capital-light technology companies often achieve ROE of 30%+ while utilities and banks operate at lower levels. Always compare ROE within the same industry.</p>
      </div>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 6px">What debt-to-equity ratio is safe when screening stocks?</p>
        <p style="font-size:15px;line-height:1.8;color:#d1d5db;margin:0">A debt-to-equity ratio below 1.0 is considered conservative for most non-financial sectors. Many quality-focused screeners use 0.5 or lower as a filter. Context matters \u2014 some industries like utilities carry higher structural debt that should not automatically disqualify a company.</p>
      </div>

      <div style="margin-bottom:40px">
        <p style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 6px">Can I combine ROE and debt-to-equity filters for free?</p>
        <p style="font-size:15px;line-height:1.8;color:#d1d5db;margin:0">Yes. DeltaScreener lets you filter US stocks by ROE, debt-to-equity, net margin, and dozens of other criteria for free with no sign-up required.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#d1d5db;margin:0 0 32px">Screening is not a replacement for analysis \u2014 it's the front door to it. A well-constructed multi-factor screen cuts the universe down to a set of candidates worth spending time on. Start with ROE and debt, refine with margin, and you'll have a process that surfaces quality businesses consistently. <a href="/screener" style="color:#2dd4bf;text-decoration:none;font-weight:600">Open the free DeltaScreener screener</a> to apply these filters yourself.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for high ROE, low debt US stocks \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "stock screening strategy, ROE filter stocks, debt to equity stock screen, combine ROE debt screening, high ROE low debt stocks, stock screener filters guide",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet17, "onRequestGet");

// blog/small-cap-stocks-screener.js
async function onRequestGet18() {
  const title = "Small Cap Stock Screener: How to Find Small Cap Stocks in 2026 | DeltaScreener";
  const description = "Use a small cap stock screener to find hidden gems before they go mainstream. Filter US small cap stocks by P/E, ROE, growth and more \u2014 free on DeltaScreener.";
  const slug = "small-cap-stocks-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Small Cap Stock Screener: How to Find Small Cap Stocks in 2026",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-05",
      dateModified: "2026-06-05",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is a small cap stock?", acceptedAnswer: { "@type": "Answer", text: "Small cap stocks are companies with a market capitalization between $300 million and $2 billion. They tend to have higher growth potential but also more risk than large cap stocks." } },
        { "@type": "Question", name: "How do I screen for small cap stocks?", acceptedAnswer: { "@type": "Answer", text: "Set market cap between $300M and $2B, then add quality filters like ROE > 12%, low debt (D/E < 0.5), and positive EPS growth to narrow down to financially healthy small caps." } },
        { "@type": "Question", name: "Are small cap stocks worth it?", acceptedAnswer: { "@type": "Answer", text: "Small cap stocks have historically outperformed large caps over long periods, but with higher volatility. They are best suited for investors with a longer time horizon and higher risk tolerance." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Small Cap Stocks Screener", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Small Cap Stocks Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Small Cap Stock Screener: How to Find Small Cap Stocks in 2026</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 5 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Small cap stocks are one of the best hunting grounds for multi-bagger returns. These companies \u2014 typically with market caps between $300M and $2B \u2014 are often under-followed by Wall Street analysts, which means mispricings are common. A small cap stock screener helps you surface financially solid small companies before the broader market notices them.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Counts as a Small Cap Stock?</h2>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Micro cap</strong>: Market cap $50M \u2013 $300M (very high risk)</li>
      <li><strong>Small cap</strong>: Market cap $300M \u2013 $2B (high risk, high potential)</li>
      <li><strong>Mid cap</strong>: Market cap $2B \u2013 $10B (moderate risk)</li>
      <li><strong>Large cap</strong>: Market cap &gt; $10B (lower risk, lower growth)</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Most institutional funds can't easily buy small caps due to liquidity constraints, which is why retail investors have an edge in this segment.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Best Filters for a Small Cap Screen</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Use these filters to find quality small cap stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Market Cap $300M \u2013 $2B</strong> \u2014 Classic small cap range</li>
      <li><strong>ROE &gt; 12%</strong> \u2014 Signals the business is generating decent returns</li>
      <li><strong>Debt/Equity &lt; 0.5</strong> \u2014 Low debt is critical for small caps, as they have less access to capital markets</li>
      <li><strong>EPS Growth &gt; 10%</strong> \u2014 Growing earnings validate the business model</li>
      <li><strong>Net Margin &gt; 8%</strong> \u2014 Healthy margins mean the company isn't just burning cash to grow</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made Screens to Start With</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Try these screens on <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> \u2014 free, no account needed:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Financially healthy companies with D/E &lt; 0.5</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality businesses with strong return on equity</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Value plays trading at below-market multiples</span></a>
      <a href="/screens/penny-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Penny Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Very low price stocks for speculative screening</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Risks of Small Cap Investing</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Small caps carry real risks. Lower liquidity means wider bid-ask spreads and it can be harder to exit a position quickly. Smaller companies also have less diversified revenue, making them more sensitive to economic downturns. Always size positions carefully and use the 10-year financial history in DeltaScreener to check consistency of earnings before investing.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is a small cap stock?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Small cap stocks have market caps between $300M and $2B. They offer higher growth potential than large caps but come with more volatility and liquidity risk.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for small cap stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Set market cap to $300M\u2013$2B, then add ROE &gt; 12%, D/E &lt; 0.5, and positive EPS growth. DeltaScreener lets you apply all these filters free across 5,000+ US stocks.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Are small cap stocks a good investment?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Historically yes \u2014 small caps have outperformed large caps over 20+ year periods. But they require more due diligence and a longer time horizon.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen Small Cap Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ NYSE & NASDAQ stocks by market cap, ROE, debt and more. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "small cap stock screener, screen small cap stocks, small cap stocks US, find small cap stocks, best small cap screener free", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet18, "onRequestGet");

// blog/stock-screener-filters-explained.js
async function onRequestGet19() {
  const title = "Stock Screener Filters Explained: P/E, ROE, P/B and More | DeltaScreener";
  const description = "A plain-English guide to the most important stock screener filters \u2014 P/E ratio, ROE, P/B, debt-to-equity, EPS growth \u2014 and how to use each one to find better stocks.";
  const slug = "stock-screener-filters-explained";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: "Stock Screener Filters Explained: P/E, ROE, P/B and More", description, url: canonicalUrl, datePublished: "2026-06-02", author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` }, { "@type": "ListItem", position: 3, name: "Stock Screener Filters Explained", item: canonicalUrl }] }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af"><li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#d1d5db">Filters Explained</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Screener Education</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Stock Screener Filters Explained: P/E, ROE, P/B and More</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 8 min read</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Stock screener filters are ratios and metrics that let you narrow thousands of stocks down to a short list. Here's what each key filter means and how to use it effectively.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">P/E Ratio (Price-to-Earnings)</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">P/E = Stock Price \xF7 Earnings Per Share. A low P/E suggests a stock is cheap relative to earnings. The S&P 500 average is around 20\u201325x. Screen for P/E &lt; 15 to find potential value stocks. Avoid very low P/E if earnings are declining \u2014 that's a value trap.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">ROE (Return on Equity)</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">ROE = Net Income \xF7 Shareholders' Equity. It measures how efficiently a company generates profits from shareholder capital. ROE &gt; 15% is generally considered strong. Warren Buffett famously uses ROE as a primary quality filter. See the <a href="/screens/high-roe-stocks" style="color:#2dd4bf;font-weight:600">High ROE Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">P/B Ratio (Price-to-Book)</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">P/B = Stock Price \xF7 Book Value Per Share. Stocks trading below 1x book value are priced below their net assets. Low P/B is most meaningful for financial, industrial, and energy stocks where assets dominate. See the <a href="/screens/low-pb-stocks" style="color:#2dd4bf;font-weight:600">Low P/B Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">Debt-to-Equity (D/E)</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">D/E = Total Debt \xF7 Shareholders' Equity. A D/E below 0.5 indicates a conservatively financed business. High D/E amplifies risk \u2014 especially in rising rate environments. The <a href="/screens/low-debt-stocks" style="color:#2dd4bf;font-weight:600">Low Debt Stocks screen</a> sets D/E \u2264 0.5.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">ROA (Return on Assets)</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">ROA = Net Income \xF7 Total Assets. Unlike ROE, ROA is not inflated by leverage \u2014 making it useful for cross-sector comparisons. ROA &gt; 10% is excellent. See the <a href="/screens/high-roa-stocks" style="color:#2dd4bf;font-weight:600">High ROA Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#f9fafb">Net Margin</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Net Margin = Net Income \xF7 Revenue. High net margin businesses like software, pharma, and luxury goods retain more of each dollar of revenue as profit. Screen for Net Margin &gt; 20% to find highly profitable businesses. See the <a href="/screens/high-net-margin-stocks" style="color:#2dd4bf;font-weight:600">High Net Margin Stocks screen</a>.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Apply These Filters Now \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">DeltaScreener has all these filters built in \u2014 free, no sign-up required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "stock screener filters, PE ratio explained, ROE stock screen, how to use stock screener, stock filter guide", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet19, "onRequestGet");

// blog/stock-screener-for-beginners.js
async function onRequestGet20() {
  const title = "Stock Screener for Beginners: How to Start Screening Stocks | DeltaScreener";
  const description = "New to stock screening? This beginner guide explains what a stock screener is, which filters to use first, and how to find your first stocks free on DeltaScreener.";
  const slug = "stock-screener-for-beginners";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Stock Screener for Beginners: How to Start Screening Stocks",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-05",
      dateModified: "2026-06-05",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is a stock screener?", acceptedAnswer: { "@type": "Answer", text: "A stock screener is a tool that filters thousands of publicly traded companies down to a shortlist based on financial criteria you set \u2014 such as P/E ratio, ROE, dividend yield, and market cap." } },
        { "@type": "Question", name: "What filters should a beginner use on a stock screener?", acceptedAnswer: { "@type": "Answer", text: "Beginners should start with simple filters: market cap (stick to large or mid cap for stability), P/E ratio below 20 for value, ROE above 12% for quality, and low debt/equity. These four filters alone narrow 5,000 stocks to a manageable list." } },
        { "@type": "Question", name: "Is a stock screener free to use?", acceptedAnswer: { "@type": "Answer", text: "Yes \u2014 DeltaScreener is completely free to use with no account required. It covers 5,000+ NYSE and NASDAQ stocks with 30+ filters and 10-year financial data." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Stock Screener for Beginners", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Stock Screener for Beginners</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Beginner's Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Stock Screener for Beginners: How to Start Screening Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">There are over 5,000 publicly traded stocks on US exchanges. A stock screener is the tool that turns that overwhelming universe into a manageable shortlist. This guide walks you through what a screener is, how to use one, and which filters to start with as a beginner.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Is a Stock Screener?</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">A stock screener is a filter tool. You set criteria \u2014 like "P/E ratio below 15" or "ROE above 18%" \u2014 and the screener instantly shows you every US stock that meets those conditions. Instead of manually researching thousands of companies, you apply filters and get a focused list to investigate further.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Think of it like a search engine for stocks. You describe what you want, and it finds candidates. The actual investment decision still requires your judgment \u2014 but the screener does the initial heavy lifting.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">The 4 Beginner Filters to Start With</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Don't get overwhelmed by 30+ available filters. Start with these four:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Market Cap &gt; $2B</strong> \u2014 Stick to larger, more stable companies as a beginner. Smaller companies carry more risk and are harder to research.</li>
      <li><strong>P/E Ratio &lt; 20</strong> \u2014 The Price-to-Earnings ratio tells you how much you pay per dollar of earnings. Below 20 generally means reasonable value.</li>
      <li><strong>ROE &gt; 12%</strong> \u2014 Return on Equity above 12% shows the company is generating good returns for shareholders.</li>
      <li><strong>Debt/Equity &lt; 1.0</strong> \u2014 Companies with more debt than equity are riskier. Keep it below 1.0 to start.</li>
    </ul>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">These four filters alone will typically reduce 5,000+ stocks to 50\u2013200 candidates \u2014 a much more manageable list to research. For a deeper explanation of each filter, see our guide on <a href="/blog/stock-screener-filters-explained" style="color:#2dd4bf;font-weight:600">stock screener filters explained</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Ready-Made Screens for Beginners</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">DeltaScreener has pre-built screens you can use immediately \u2014 no setup required:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 A good starting point for value-oriented beginners</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality companies for beginners who want reliable businesses</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Safer balance sheets, lower risk for new investors</span></a>
      <a href="/screens/dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Income-paying stocks ideal for long-term, conservative investing</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener Step-by-Step</h2>
    <ol style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li>Go to <a href="/screener" style="color:#2dd4bf;font-weight:600">deltascreener.com/screener</a></li>
      <li>Set your filters on the left panel (P/E, ROE, Market Cap, etc.)</li>
      <li>Results update instantly \u2014 browse the matching stocks</li>
      <li>Click any stock ticker to see its 10-year financial history</li>
      <li>Add interesting stocks to your watchlist for further research</li>
    </ol>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">No account required \u2014 everything is free and instant.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is a stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">A stock screener filters thousands of stocks down to a shortlist based on criteria you set \u2014 like P/E ratio, ROE, market cap, or dividend yield.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What filters should a beginner use?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Start with Market Cap &gt; $2B, P/E &lt; 20, ROE &gt; 12%, and D/E &lt; 1.0. These four filters give you a solid beginner shortlist without getting overwhelmed.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Is DeltaScreener free for beginners?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes, completely free. No account, no email, no credit card. All 30+ filters and 5,000+ stocks are available immediately.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Start Screening Stocks for Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">5,000+ NYSE & NASDAQ stocks, 30+ filters, 10-year financials. No sign-up needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "stock screener for beginners, how to use a stock screener, beginner stock screener, learn stock screening, free stock screener beginners", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet20, "onRequestGet");

// blog/value-investing-stock-screener.js
async function onRequestGet21() {
  const title = "Value Investing Stock Screener: Find Undervalued US Stocks | DeltaScreener";
  const description = "Apply Benjamin Graham and Warren Buffett value investing criteria to screen US stocks. Find undervalued stocks with strong fundamentals free on DeltaScreener.";
  const slug = "value-investing-stock-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Value Investing Stock Screener: Find Undervalued US Stocks",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-05",
      dateModified: "2026-06-05",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is value investing?", acceptedAnswer: { "@type": "Answer", text: "Value investing is a strategy of buying stocks trading below their intrinsic value. Value investors use metrics like P/E, P/B, and earnings yield to find companies the market has underpriced relative to their true worth." } },
        { "@type": "Question", name: "What P/E ratio is considered undervalued?", acceptedAnswer: { "@type": "Answer", text: "A P/E ratio below 15 is generally considered value territory, though this varies by sector. Technology stocks typically trade at higher P/E than utilities or financials, so compare within sectors." } },
        { "@type": "Question", name: "How do I screen for value stocks?", acceptedAnswer: { "@type": "Answer", text: "Use P/E < 15, P/B < 1.5, positive EPS growth, and low debt as your core value screening criteria. DeltaScreener lets you apply all these free across 5,000+ US stocks." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Value Investing Stock Screener", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Value Investing Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Value Investing Stock Screener: Find Undervalued US Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Value investing \u2014 popularized by Benjamin Graham and refined by Warren Buffett \u2014 is the practice of buying stocks for less than they are worth. The core idea is simple: the stock market misprices companies in the short run, and patient investors can profit by buying these mispriced businesses and waiting for the market to recognize their true value.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Key Value Investing Metrics</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the core filters value investors use when screening for undervalued stocks:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>P/E Ratio &lt; 15</strong> \u2014 Price-to-Earnings below 15 indicates a stock may be cheap relative to its earnings power. The market average P/E is typically 18\u201322x.</li>
      <li><strong>P/B Ratio &lt; 1.5</strong> \u2014 Price-to-Book below 1.5 means you're paying close to (or below) the accounting value of the company's assets.</li>
      <li><strong>Earnings Yield &gt; 6%</strong> \u2014 Earnings Yield (inverse of P/E) above 6% offers a decent return compared to bonds.</li>
      <li><strong>Positive EPS growth</strong> \u2014 A cheap stock that's also growing earnings is the ideal value combination.</li>
      <li><strong>Low debt (D/E &lt; 0.5)</strong> \u2014 Value traps often have high debt; low debt reduces this risk.</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Avoiding Value Traps</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">A value trap is a stock that looks cheap on P/E or P/B but is actually declining \u2014 earnings are falling, the business model is broken, or debt is overwhelming. To avoid them, always check the 10-year earnings trend in DeltaScreener. If EPS has been declining for 3+ years, a low P/E isn't a bargain \u2014 it's a warning sign.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Also see our guide on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find genuinely undervalued stocks</a> for a deeper framework.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Value Screens on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Start with these pre-built value screens on <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a>:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 P/E &lt; 15, the classic value entry point</span></a>
      <a href="/screens/low-pb-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low P/B Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Stocks near or below book value</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Avoid value traps with healthy balance sheets</span></a>
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality + value: cheap AND profitable</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Benjamin Graham's Classic Screen</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Graham's original "Defensive Investor" criteria from <em>The Intelligent Investor</em> included: adequate size (market cap &gt; $1B), strong current ratio, no deficit in the last 10 years, 20+ years of continuous dividends, EPS growth of at least 33% over 10 years, P/E below 15, and P/B below 1.5. This is a strict screen \u2014 but stocks passing all these criteria have historically been excellent long-term investments.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What is value investing?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Buying stocks trading below their intrinsic value, then holding until the market recognizes that value. Popularized by Benjamin Graham and practiced by Warren Buffett.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What P/E ratio is undervalued?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">P/E below 15 is generally value territory. Compare within sectors \u2014 utilities and financials naturally have lower P/Es than tech or healthcare.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for value stocks free?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Use DeltaScreener \u2014 filter by P/E &lt; 15, P/B &lt; 1.5, positive EPS growth, and low debt across 5,000+ US stocks. No account required.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Find Value Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Screen 5,000+ US stocks by P/E, P/B, ROE and 10-year earnings history. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "value investing stock screener, undervalued stocks screener, value stocks US, benjamin graham stock screen, low PE low PB stocks free", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet21, "onRequestGet");

// blog/warren-buffett-stock-screener.js
async function onRequestGet22() {
  const title = "Warren Buffett Stock Screener: How to Find Buffett-Style Stocks | DeltaScreener";
  const description = "Screen for Warren Buffett-style stocks using ROE, low debt, and consistent earnings growth. Find quality US stocks the Buffett way \u2014 free on DeltaScreener.";
  const slug = "warren-buffett-stock-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Warren Buffett Stock Screener: How to Find Buffett-Style Stocks",
      description,
      url: canonicalUrl,
      datePublished: "2026-06-05",
      dateModified: "2026-06-05",
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What metrics does Warren Buffett look for in stocks?", acceptedAnswer: { "@type": "Answer", text: "Warren Buffett looks for high ROE (above 15%), low debt, consistent earnings growth over 10 years, high net margins, and a durable competitive advantage (moat). He also prefers businesses he can understand." } },
        { "@type": "Question", name: "How do you screen for Buffett-style stocks?", acceptedAnswer: { "@type": "Answer", text: "Use ROE > 15%, Debt/Equity < 0.5, Net Margin > 15%, and consistent EPS growth over 5\u201310 years as your core filters. These criteria narrow down to the kind of quality businesses Buffett favors." } },
        { "@type": "Question", name: "What P/E ratio does Warren Buffett prefer?", acceptedAnswer: { "@type": "Answer", text: "Buffett does not focus on P/E ratios alone. He is willing to pay fair prices for wonderful companies rather than bargain prices for mediocre ones. That said, he avoids stocks with sky-high valuations disconnected from earnings power." } }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "Warren Buffett Stock Screener", item: canonicalUrl }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
        <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#d1d5db">Warren Buffett Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">Warren Buffett Stock Screener: How to Find Buffett-Style Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 7 min read</p>

    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Warren Buffett's investing philosophy can be distilled into a few key principles: buy wonderful businesses at fair prices, hold for the long term, and never lose money. His focus on Return on Equity, low debt, consistent earnings, and durable competitive advantages (moats) can be quantified and screened for \u2014 which is exactly what this guide shows you how to do.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Buffett's Core Stock Criteria</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">These are the key quantitative metrics that align with Buffett's investment approach:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>ROE &gt; 15% consistently</strong> \u2014 Buffett wants companies that earn strong returns on shareholder equity year after year. One good year isn't enough; he looks for 5\u201310 years of high ROE.</li>
      <li><strong>Low debt (D/E &lt; 0.5)</strong> \u2014 Buffett avoids highly leveraged companies. Low debt means the company doesn't need to borrow to grow.</li>
      <li><strong>Net Margin &gt; 15%</strong> \u2014 Wide profit margins signal a moat \u2014 pricing power that competitors can't easily erode.</li>
      <li><strong>Consistent EPS growth</strong> \u2014 Earnings growing steadily over a decade shows the business compound value reliably.</li>
      <li><strong>High Return on Assets (ROA &gt; 8%)</strong> \u2014 Efficient use of assets is a Buffett hallmark.</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Why 10-Year Financials Are Essential</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Buffett always looks at multi-year track records. A single year of high ROE or strong margins could be a one-off event. DeltaScreener shows 10 years of annual financial data for every stock \u2014 so you can see whether a company's quality metrics are consistent or just a recent blip. This is exactly the kind of analysis Buffett's team does before buying.</p>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">For a broader guide on finding undervalued quality businesses, see our article on <a href="/blog/how-to-find-undervalued-stocks" style="color:#2dd4bf;font-weight:600">how to find undervalued stocks</a>.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Buffett-Style Screens on DeltaScreener</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 16px">Use these <a href="/screener" style="color:#2dd4bf;font-weight:700">DeltaScreener</a> pre-built screens as a starting point for Buffett-style stock picking:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 ROE &gt; 18%, the first Buffett filter</span></a>
      <a href="/screens/low-debt-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 D/E &lt; 0.5, businesses that don't need leverage to grow</span></a>
      <a href="/screens/high-net-margin-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">High Net Margin Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Wide margins signal the moat Buffett looks for</span></a>
      <a href="/screens/low-debt-dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2dd4bf">Low Debt Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality dividend payers with healthy balance sheets</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Qualitative Factors Buffett Looks For</h2>
    <p style="line-height:1.8;color:#d1d5db;font-size:16px;margin:0 0 20px">Numbers only go so far. Buffett also considers:</p>
    <ul style="line-height:2;color:#d1d5db;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Durable competitive advantage</strong> \u2014 Brand, network effects, switching costs, or cost advantages that protect the business</li>
      <li><strong>Understandable business model</strong> \u2014 If you can't explain how the company makes money in one sentence, Buffett would likely pass</li>
      <li><strong>Honest, capable management</strong> \u2014 Look at capital allocation history; do they buy back stock wisely or dilute shareholders?</li>
      <li><strong>Long runway for growth</strong> \u2014 Is the market large enough for the company to keep reinvesting at high returns for years?</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>
    <div style="border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">What metrics does Buffett look for?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">High ROE (&gt;15%), low debt (D/E &lt;0.5), wide net margins (&gt;15%), consistent earnings growth over 10 years, and a durable competitive advantage.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">How do I screen for Buffett-style stocks?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Set ROE &gt; 15%, D/E &lt; 0.5, net margin &gt; 15% on DeltaScreener and review the 10-year financial history to confirm consistency.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#f9fafb;display:block;margin-bottom:8px">Does Buffett care about P/E ratio?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Not primarily. He focuses on intrinsic value vs price. He'd rather pay 25x for a wonderful business than 10x for a mediocre one.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2dd4bf;margin-bottom:8px">Screen for Buffett-Style Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#d1d5db;line-height:1.7;font-size:14px">Filter 5,000+ NYSE & NASDAQ stocks by ROE, debt, margins and 10-year earnings history. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "warren buffett stock screener, buffett style stocks, how to find buffett stocks, ROE stock screener, quality stock screener free", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet22, "onRequestGet");

// blog/what-is-roa-in-stocks.js
async function onRequestGet23() {
  const title = "What Is ROA in Stocks? Return on Assets Explained for Investors | DeltaScreener";
  const description = "ROA (Return on Assets) measures how efficiently a company uses its assets to generate profit. Learn what a good ROA is and how to screen for high-ROA stocks.";
  const slug = "what-is-roa-in-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "What Is ROA in Stocks? Return on Assets Explained for Investors",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "What Is ROA in Stocks?", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good ROA for a stock?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A ROA above 5% is generally considered decent, and above 10% is strong. Asset-light businesses like software companies often post ROA of 15\u201325%, while capital-intensive industries like utilities or manufacturers typically see 1\u20135%."
          }
        },
        {
          "@type": "Question",
          name: "What is the difference between ROA and ROE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ROE (Return on Equity) measures profit relative to shareholders' equity, while ROA (Return on Assets) measures profit relative to total assets including debt. ROA is a purer measure of operational efficiency because it is not inflated by financial leverage."
          }
        },
        {
          "@type": "Question",
          name: "Can you compare ROA across different industries?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ROA comparisons are most meaningful within the same industry. A bank with 1% ROA may be excellent, while a software company with the same figure would be considered poor. Always benchmark ROA against sector peers."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">What Is ROA?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">What Is ROA in Stocks? Return on Assets Explained for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#d1d5db;margin:0 0 24px">
        Return on Assets (ROA) is one of the clearest signals of how well a company actually runs its business. Unlike earnings per share, which can be engineered through buybacks, or ROE, which can be inflated by heavy borrowing, ROA cuts through to a simple question: for every dollar of assets this company controls, how much profit does it produce?
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">How ROA Is Calculated</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        The formula is straightforward:
      </p>
      <div style="background:#f9fafb;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px 20px;margin:0 0 20px;font-family:monospace;font-size:15px;color:#f9fafb">
        ROA = Net Income \xF7 Total Assets \xD7 100
      </div>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        If a company earns $500 million in net income and has $5 billion in total assets, its ROA is 10%. That 10% tells you the company generates ten cents of profit for every dollar of assets on its balance sheet \u2014 factories, inventory, cash, intellectual property, everything included.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        Some analysts use operating income instead of net income to strip out the effect of interest expenses. Either version works, as long as you're consistent when comparing companies.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">What Is a Good ROA?</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        Context matters enormously here. Industries that require massive physical infrastructure \u2014 utilities, steel mills, airlines \u2014 will naturally have lower ROA because their asset base is enormous relative to their profits. A utility running at 2\u20133% ROA may be doing perfectly well. A software company at 2% ROA has a problem.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        As a rough general benchmark:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 5%:</strong> Acceptable for capital-intensive industries; weak for asset-light businesses</li>
        <li style="margin-bottom:8px"><strong>5\u201310%:</strong> Solid \u2014 the company is using its asset base efficiently</li>
        <li style="margin-bottom:8px"><strong>Above 10%:</strong> Strong \u2014 a sign of real competitive advantage or operating leverage</li>
        <li style="margin-bottom:8px"><strong>Above 15\u201320%:</strong> Exceptional \u2014 typically seen in software, consumer brands, or businesses with strong intangible assets</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        Warren Buffett has long used ROE as a quality filter, preferring companies that sustain 15\u201320% returns on equity. ROA adds an important check on that \u2014 if ROE is high but ROA is low, it likely means the company is borrowing heavily to juice its equity returns. High ROA without excessive leverage is the quality signal serious investors look for.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">ROA vs. ROE: Which Should You Use?</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        Both metrics measure profitability, but they answer slightly different questions. ROE tells you how much profit the company generates per dollar of shareholder equity. ROA tells you how much profit it generates per dollar of total assets \u2014 equity plus debt.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        The gap between the two reveals leverage. A company with 20% ROE and 12% ROA is using moderate debt to amplify returns. A company with 40% ROE and 4% ROA is heavily leveraged \u2014 the high ROE looks impressive on the surface, but it rests on a fragile foundation. In a downturn, that debt becomes a burden.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        For this reason, many quality-focused investors look at ROA first. It is harder to inflate and gives a cleaner picture of how efficiently management deploys the resources under its control. Companies that sustain high ROA over many years \u2014 10% or above through full economic cycles \u2014 tend to have genuine competitive advantages: pricing power, network effects, low-cost production, or strong brand loyalty.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">ROA Trends Matter as Much as the Number</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        A single year's ROA can be misleading. A company might have an exceptional quarter that inflates the annual figure, or a one-time asset write-down that suppresses it. What you want to see is consistency. A company that has maintained 10\u201315% ROA for five or ten consecutive years is demonstrating something real \u2014 durable operational excellence that doesn't depend on favorable conditions or accounting adjustments.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        Conversely, a declining ROA trend is worth taking seriously. If a company's ROA has dropped from 14% three years ago to 7% today, the business may be adding assets (acquisitions, new plants, inventory build-up) faster than it can generate earnings from them \u2014 a warning sign about capital allocation.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">How to Screen for High-ROA Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        You can <a href="/stocks/high-roa-stocks" style="color:#2dd4bf;font-weight:600">screen for high ROA stocks on DeltaScreener</a> using the ROA filter in the free screener. A practical starting setup for quality-focused investors:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">ROA \u2265 10% (filters for efficient asset use)</li>
        <li style="margin-bottom:8px">Debt-to-equity \u2264 1.0 (confirms the ROA isn't debt-driven)</li>
        <li style="margin-bottom:8px">Net margin \u2265 10% (pairs profitability with efficiency)</li>
        <li style="margin-bottom:8px">Market cap \u2265 $500M (filters for established businesses)</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 16px">
        This combination tends to surface companies with real competitive advantages rather than those simply operating with high leverage. No sign-up required \u2014 filters update in real time on the <a href="/screener" style="color:#2dd4bf;font-weight:600">DeltaScreener free screener</a>.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#f9fafb;margin:40px 0 16px">Frequently Asked Questions</h2>

      <h3 style="font-size:18px;font-weight:700;color:#f9fafb;margin:24px 0 8px">What is a good ROA for a stock?</h3>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">
        A ROA above 5% is generally considered decent, and above 10% is strong. Asset-light businesses like software companies often post ROA of 15\u201325%, while capital-intensive industries like utilities or manufacturers typically see 1\u20135%. Always compare within the same sector for meaningful benchmarking.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#f9fafb;margin:24px 0 8px">What is the difference between ROA and ROE?</h3>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 20px">
        ROE measures profit relative to shareholders' equity, while ROA measures profit relative to total assets including debt. ROA is a purer measure of operational efficiency because it is not inflated by financial leverage \u2014 a company with high ROE but low ROA is likely using debt to amplify equity returns.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#f9fafb;margin:24px 0 8px">Can you compare ROA across different industries?</h3>
      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">
        ROA comparisons are most meaningful within the same industry. A bank with 1% ROA may be excellent, while a software company with the same figure would be considered poor. Always benchmark ROA against sector peers rather than using a single universal threshold.
      </p>

      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 32px">
        ROA is one of the most reliable filters for finding companies that genuinely earn their keep. Pair it with low leverage and consistent net margins, and you have a solid foundation for a quality-first investment screen. Head to the <a href="/screener" style="color:#2dd4bf;font-weight:600">DeltaScreener free screener</a> to run your own filters \u2014 no account needed.
      </p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for high-ROA stocks using these exact criteria \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "what is ROA, return on assets stocks, high ROA stocks, ROA vs ROE, good ROA ratio, stock quality screening",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet23, "onRequestGet");

// blog/what-is-roe-in-stocks.js
async function onRequestGet24() {
  const title = "What Is ROE in Stocks? Why Return on Equity Matters for Investors | DeltaScreener";
  const description = "Return on equity (ROE) measures how efficiently a company uses shareholder capital to generate profit. Learn what counts as a good ROE and how to use it to screen stocks.";
  const slug = "what-is-roe-in-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "What Is ROE in Stocks? Why Return on Equity Matters for Investors",
      description,
      url: canonicalUrl,
      datePublished: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: "What Is ROE in Stocks?", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a good ROE for a stock?",
          acceptedAnswer: {
            "@type": "Answer",
            text: 'A ROE of 15% or higher is generally considered good for most industries. The US market average across all sectors was about 17% as of early 2026. However, "good" varies by sector \u2014 capital-light businesses like software typically run 25\u201340%+ ROE, while capital-intensive industries like utilities or auto manufacturers often fall in the 10\u201315% range.'
          }
        },
        {
          "@type": "Question",
          name: "Can ROE be misleading?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. A company can boost its ROE by taking on more debt, which reduces the equity base in the denominator without necessarily improving business quality. That is why it is important to look at ROE alongside the debt-to-equity ratio. A high ROE combined with low debt is a much stronger signal than high ROE with heavy leverage."
          }
        },
        {
          "@type": "Question",
          name: "How is ROE calculated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ROE is calculated by dividing net income by average shareholders' equity, then expressing the result as a percentage. For example, if a company earns $200 million in net income and has $1 billion in equity, its ROE is 20%."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2dd4bf;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">What Is ROE?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#f9fafb">What Is ROE in Stocks? Why Return on Equity Matters for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:16px;line-height:1.75;color:#d1d5db;margin:0 0 24px">Return on equity (ROE) is one of the most widely used metrics for measuring how efficiently a company converts shareholder capital into profit. For investors learning to screen stocks, understanding ROE can help separate capital-efficient businesses from those that consume resources without generating proportionate returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How ROE Is Calculated</h2>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Return on equity is calculated by dividing a company's net income by its average shareholders' equity, then expressing the result as a percentage:</p>
      <div style="background:#111827;border-radius:12px;padding:20px 24px;margin:0 0 20px;border:1px solid #e2e8f0;font-family:monospace;font-size:15px;color:#f1f5f9">
        ROE = Net Income \xF7 Average Shareholders' Equity \xD7 100
      </div>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">For example: a company that earns $300 million in net income with $1.5 billion in equity has an ROE of 20%. That means for every dollar shareholders have invested, the company generated 20 cents of profit over the year.</p>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Analysts sometimes use <em>average</em> equity (beginning plus ending, divided by two) rather than ending equity alone, to smooth out fluctuations during the year. Most financial data providers and screeners, including DeltaScreener, use trailing twelve-month figures.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">What Is a Good ROE?</h2>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">As of January 2026, the average ROE across all US-listed companies tracked in the Damodaran dataset was <strong>17.2%</strong>. That figure gives a useful baseline, but the answer varies substantially by sector:</p>
      <ul style="margin:0 0 20px;padding-left:22px;color:#d1d5db;font-size:15px;line-height:2">
        <li><strong>Software (System &amp; Application):</strong> ~30% average ROE \u2014 capital-light business models allow high returns on equity</li>
        <li><strong>Semiconductors:</strong> ~31% \u2014 strong intellectual property and recurring demand from tech supply chains</li>
        <li><strong>Financial Services (non-bank):</strong> ~29% \u2014 leverage-driven businesses can achieve high ROE even with thin margins</li>
        <li><strong>Utilities:</strong> ~10% \u2014 regulated, capital-intensive operations structurally constrain returns</li>
        <li><strong>Auto manufacturers:</strong> ~3% \u2014 thin margins and heavy asset bases keep ROE low even in strong years</li>
      </ul>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">A common rule of thumb: ROE above 15% signals a reasonably capital-efficient business in most sectors. Anything consistently above 20% is a high bar that relatively few companies sustain over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Why ROE Can Be Misleading \u2014 and How to Adjust for It</h2>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">ROE has one well-known flaw: it can be inflated by debt. Because equity = assets minus liabilities, a company that borrows heavily has a smaller equity base \u2014 which makes its ROE look higher even if its actual profitability hasn't improved.</p>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Consider two companies each earning $100 million in net income. Company A has $500 million in equity (ROE: 20%). Company B has $200 million in equity because it borrowed aggressively (ROE: 50%). Company B's ROE looks impressive, but its balance sheet carries more risk.</p>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The practical fix: always look at ROE alongside the <strong>debt-to-equity ratio</strong>. A stock with 25% ROE and debt-to-equity below 1 is a materially different proposition than one with 25% ROE and debt-to-equity of 4. The DuPont framework expands ROE into three components \u2014 net margin, asset turnover, and financial leverage \u2014 giving a clearer view of where the return is actually coming from.</p>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">Return on assets (ROA) is another useful cross-check. Unlike ROE, ROA is not affected by capital structure, so a company with high ROE and high ROA simultaneously is typically generating genuine operating efficiency rather than leveraged returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">How to Use DeltaScreener to Find High-ROE Stocks</h2>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">The fastest way to apply these ideas is to run a pre-built screen. You can <a href="/stocks/high-roe-stocks" style="color:#2dd4bf;text-decoration:none;font-weight:600">screen for high ROE stocks on DeltaScreener</a> \u2014 the page shows US stocks with ROE of at least 18%, positive price-to-book, and debt-to-equity below 3, updated automatically.</p>
      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0 0 16px">If you want to go deeper, the interactive screener lets you combine ROE with any other metric \u2014 for example, filtering for ROE above 20%, ROA above 10%, and net margin above 15% gives a much tighter list of companies with broad-based profitability rather than leverage-driven returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#f9fafb">Frequently Asked Questions</h2>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">What is a good ROE for a stock?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0">A ROE of 15% or higher is generally considered good for most industries. The US market average across all sectors was about 17% as of early 2026. However, "good" varies by sector \u2014 capital-light businesses like software typically run 25\u201340%+ ROE, while capital-intensive industries like utilities or auto manufacturers often fall in the 10\u201315% range.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">Can ROE be misleading?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0">Yes. A company can boost its ROE by taking on more debt, which reduces the equity base in the denominator without necessarily improving business quality. That is why it is important to look at ROE alongside the debt-to-equity ratio. A high ROE combined with low debt is a much stronger signal than high ROE with heavy leverage.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#f9fafb;margin:0 0 8px">How is ROE calculated?</h3>
        <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:0">ROE is calculated by dividing net income by average shareholders' equity, then expressing the result as a percentage. For example, if a company earns $200 million in net income and has $1 billion in equity, its ROE is 20%.</p>
      </div>

      <p style="font-size:15px;line-height:1.75;color:#d1d5db;margin:32px 0 0">ROE is a useful starting filter but works best as part of a broader checklist. Pair it with ROA, net margin, and debt metrics to get a fuller picture of whether a company's quality is genuine. Explore all these filters together on the <a href="/screener" style="color:#2dd4bf;text-decoration:none;font-weight:600">DeltaScreener free screener</a>.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#d1d5db;line-height:1.7;font-size:14px">Screen for high-ROE stocks with live data \u2014 filter by ROE, debt-to-equity, ROA, and more. Free, no sign-up required.</p>
        <a href="/stocks/high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View High ROE Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f1117;color:#2dd4bf;text-decoration:none;font-weight:800;font-size:14px;border:1.5px solid #0f766e">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "what is ROE in stocks, return on equity, good ROE, ROE stock screener, high ROE stocks, return on equity explained",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet24, "onRequestGet");

// blog/[slug].js
function markdownToHtml2(md) {
  return md.replace(/^## (.+)$/gm, `<h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>`).replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>').replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>').replace(/\n\n/g, '</p><p style="margin:0 0 16px">').replace(/^(?!<[h|u|l])(.+)$/gm, (m) => m.startsWith("<") ? m : m).replace(/^<\/p><p[^>]*>(<h[23])/gm, "$1").replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, "$1").trim();
}
__name(markdownToHtml2, "markdownToHtml");
async function onRequestGet25({ params, env }) {
  const slug = params.slug;
  let post = null;
  let relatedPosts = [];
  try {
    post = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();
    if (post) {
      const { results } = await env.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts
         WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all();
      relatedPosts = results || [];
    }
  } catch (_) {
  }
  if (!post) {
    const notFoundHtml = `
      <main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
        <div style="font-size:64px;margin-bottom:16px">\u{1F4C4}</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
        <p style="color:#6b7280;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
        <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#2962ff;color:#fff;text-decoration:none;font-weight:700;font-size:15px">\u2190 Back to Blog</a>
      </main>`;
    return new Response(renderSpaShell({
      title: "Article Not Found | DeltaScreener",
      description: "This blog post could not be found.",
      canonicalUrl: `${SITE_ORIGIN}/blog`,
      robots: "noindex,nofollow",
      bodyHtml: notFoundHtml
    }), { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const title = `${post.title} | DeltaScreener`;
  const description = post.description;
  let faqs = [];
  try {
    let raw = post.faqs || "[]";
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    faqs = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
  }
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      url: canonicalUrl,
      datePublished: post.published_at,
      dateModified: post.published_at,
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
        { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl }
      ]
    },
    ...faqs.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
    }] : []
  ];
  const relatedHtml = relatedPosts.length > 0 ? `
    <section style="margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.08)">
      <h3 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0 0 20px">Related Articles</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${relatedPosts.map((r) => `
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;transition:background .15s,transform .15s" onmouseover="this.style.background='rgba(255,255,255,.08)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.transform='none'">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>
        `).join("")}
      </div>
    </section>` : "";
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;border-radius:20px;background:#111827;border:1px solid rgba(45,212,191,.15);overflow:hidden">
      <div style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(45,212,191,.05)">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0;display:flex;align-items:center;gap:10px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(45,212,191,.15);color:#2dd4bf;font-size:16px;flex-shrink:0">?</span>
          Frequently Asked Questions
        </h2>
      </div>
      <div style="padding:8px 0">
        ${faqs.map((f, i) => `
          <div style="padding:20px 28px;${i < faqs.length - 1 ? "border-bottom:1px solid rgba(255,255,255,.05)" : ""}">
            <h3 style="font-size:15px;font-weight:700;color:#e5e7eb;margin:0 0 10px;line-height:1.4">${f.q}</h3>
            <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
          </div>`).join("")}
      </div>
    </section>` : "";
  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
      <div style="font-size:13px;color:#6b7280;margin-bottom:36px">Published ${formattedDate} \xB7 DeltaScreener</div>

      <article style="font-size:16px;line-height:1.8;color:#d1d5db">
        ${markdownToHtml2(post.content || "")}
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
        <a href="/blog" style="color:#2dd4bf;font-weight:600;font-size:14px;text-decoration:none">\u2190 Back to Blog</a>
      </div>
    </main>`;
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
    lightMode: true
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet25, "onRequestGet");

// stock/[ticker].js
function escapeHtml2(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml2, "escapeHtml");
function compactUsd(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "\u2014";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}
__name(compactUsd, "compactUsd");
function usd(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "\u2014";
}
__name(usd, "usd");
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "\u2014";
}
__name(num, "num");
function pct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(2)}%` : "\u2014";
}
__name(pct, "pct");
function renderStockShell(ticker, overview = {}, ratios = {}) {
  const seo = buildStockSeo(ticker, overview, ratios);
  const keyStats = [
    ["Price", usd(overview?.price)],
    ["Market Cap", compactUsd(overview?.mktCap)],
    ["P/E", num(ratios?.pe ?? overview?.pe)],
    ["ROE", pct(ratios?.roe ?? overview?.roe)],
    ["Net Margin", pct(ratios?.netMargin ?? overview?.netMargin)],
    ["Dividend Yield", pct(overview?.dividendYield)]
  ];
  const bodyHtml = `
    <main class="seo-stock-shell" style="max-width:1120px;margin:0 auto;padding:32px 16px 56px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock research</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(38px,6vw,58px);line-height:1.05;letter-spacing:-.04em;margin-bottom:12px;color:#f9fafb">${escapeHtml2(overview?.name || ticker)}</h1>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 22px">
        <span style="padding:8px 12px;border-radius:999px;background:rgba(45,212,191,.07);color:#2dd4bf;font-weight:700">${escapeHtml2(overview?.exchange || "NYSE/NASDAQ")}: ${escapeHtml2(ticker)}</span>
        ${overview?.sector ? `<span style="padding:8px 12px;border-radius:999px;background:#f1f5ff;color:#2962ff;font-weight:700">${escapeHtml2(overview.sector)}</span>` : ""}
        ${overview?.industry ? `<span style="padding:8px 12px;border-radius:999px;background:#f9fafb;color:#d1d5db;font-weight:700">${escapeHtml2(overview.industry)}</span>` : ""}
      </div>
      <p style="max-width:760px;line-height:1.75;color:#55606d">${escapeHtml2(seo.description)}</p>
      <section aria-label="Key stock statistics" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:24px 0">
        ${keyStats.map(([label, value]) => `
          <article style="padding:16px 18px;border:1px solid rgba(216,225,238,.95);border-radius:18px;background:rgba(255,255,255,.92)">
            <strong style="display:block;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${escapeHtml2(label)}</strong>
            <span style="font-size:24px;font-weight:800;color:#f9fafb">${escapeHtml2(value)}</span>
          </article>
        `).join("")}
      </section>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">
        <a class="btn btn-primary" href="/stock/${encodeURIComponent(ticker)}">Open interactive stock page</a>
        <a class="btn btn-outline" href="/screener">Run stock screener</a>
      </div>
    </main>`;
  return renderSpaShell({
    title: seo.title,
    description: seo.description,
    canonicalUrl: seo.canonicalUrl,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonicalUrl,
    keywords: seo.keywords,
    jsonLd: seo.jsonLd,
    bodyHtml,
    prerender: {
      route: `/stock/${ticker}`,
      overview,
      ratios
    }
  });
}
__name(renderStockShell, "renderStockShell");
async function onRequestGet26(context) {
  const ticker = String(context.params?.ticker || "").trim().toUpperCase();
  if (!ticker) return new Response("Missing ticker", { status: 400 });
  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS].filter(Boolean);
  try {
    const [overview, ratios] = await Promise.all([
      fetchJson(apiOrigins, `/stock/${encodeURIComponent(ticker)}/overview`),
      fetchJson(apiOrigins, `/stock/${encodeURIComponent(ticker)}/ratios`).catch(() => null)
    ]);
    if (!overview || overview.error) {
      return new Response("Not found", {
        status: 404,
        headers: { "X-Robots-Tag": "noindex" }
      });
    }
    return new Response(renderStockShell(ticker, overview, ratios || {}), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch {
    const seo = buildStockSeo(ticker);
    return new Response(renderSpaShell({
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      ogTitle: seo.title,
      ogDescription: seo.description,
      ogUrl: seo.canonicalUrl,
      keywords: seo.keywords,
      jsonLd: seo.jsonLd,
      robots: "noindex,follow",
      bodyHtml: `<main class="seo-stock-shell" style="max-width:1120px;margin:0 auto;padding:32px 16px 56px;font-family:Inter,system-ui,sans-serif"><h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(38px,6vw,58px);line-height:1.05;letter-spacing:-.04em;color:#f9fafb;margin-bottom:12px">${escapeHtml2(ticker)}</h1><p style="max-width:760px;line-height:1.75;color:#55606d">${escapeHtml2(seo.description)}</p></main>`,
      prerender: { route: `/stock/${ticker}` }
    }), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, follow"
      }
    });
  }
}
__name(onRequestGet26, "onRequestGet");

// _lib/seo.js
var SITE_ORIGIN2 = "https://deltascreener.com";
var API_FALLBACKS2 = [
  "https://api.deltascreener.com",
  "https://screenerpro1-api.acherjeeanirban.workers.dev"
];
var HTML_CACHE_CONTROL = "public, max-age=900, s-maxage=7200, stale-while-revalidate=86400";
var XML_CACHE_CONTROL = "public, max-age=1800, s-maxage=21600, stale-while-revalidate=86400";
var SCREEN_PAGES = [
  {
    slug: "high-roe-stocks",
    title: "High ROE Stocks",
    h1: "High ROE Stocks",
    cluster: "Quality",
    intro: "These US stocks currently rank for strong return on equity, which can help surface businesses converting shareholder capital into profit efficiently.",
    metaDescription: "Explore US high ROE stocks with live price, market cap, valuation, and profitability data. Updated automatically on DeltaScreener.",
    conditions: [
      { metric: "roe", op: ">=", value: 18 },
      { metric: "pb", op: ">", value: 0 },
      { metric: "debtToEquity", op: "<=", value: 3 }
    ],
    sort: { field: "roe", dir: "desc" },
    related: ["low-debt-stocks", "high-roa-stocks", "undervalued-tech-stocks"],
    faqs: [
      ["What counts as high ROE?", "This screen currently looks for stocks with return on equity of at least 18% and positive price-to-book coverage."],
      ["Why include debt filters?", "High ROE can be artificially boosted by leverage, so the screen also caps debt-to-equity to keep the list more investable."]
    ]
  },
  {
    slug: "low-debt-stocks",
    title: "Low Debt Stocks",
    h1: "Low Debt Stocks",
    cluster: "Balance Sheet",
    intro: "This screen focuses on stocks with conservative debt loads, which can help investors find companies with stronger balance sheet flexibility.",
    metaDescription: "Browse US low debt stocks with live financial ratios, valuation data, and market cap filters. Auto-updated on DeltaScreener.",
    conditions: [
      { metric: "debtToEquity", op: "<=", value: 0.5 },
      { metric: "roe", op: ">=", value: 8 },
      { metric: "pb", op: ">", value: 0 }
    ],
    sort: { field: "debtToEquity", dir: "asc" },
    related: ["low-debt-dividend-stocks", "high-roe-stocks", "nyse-low-debt-stocks"],
    faqs: [
      ["What is a low debt stock here?", "This page uses debt-to-equity of 0.5 or lower and also requires usable profitability data."],
      ["Why are some banks missing?", "Bank balance sheets work differently, so many financial firms are filtered out by conservative debt thresholds."]
    ]
  },
  {
    slug: "high-roa-stocks",
    title: "High ROA Stocks",
    h1: "High ROA Stocks",
    cluster: "Quality",
    intro: "Return on assets can highlight companies that generate strong earnings from the asset base they control, which is useful for cross-sector quality screening.",
    metaDescription: "Find US high ROA stocks with current valuation, profitability, and market cap data. Freshly updated stock screener results.",
    conditions: [
      { metric: "roa", op: ">=", value: 10 },
      { metric: "pb", op: ">", value: 0 }
    ],
    sort: { field: "roa", dir: "desc" },
    related: ["high-roe-stocks", "high-net-margin-stocks", "low-pe-stocks"],
    faqs: [
      ["Why use ROA?", "ROA is a useful quality signal when you want a profitability measure less influenced by leverage than ROE."],
      ["Is this a US-only screen?", "Yes. These pages are built from the current US stock universe tracked by DeltaScreener."]
    ]
  },
  {
    slug: "high-net-margin-stocks",
    title: "High Net Margin Stocks",
    h1: "High Net Margin Stocks",
    cluster: "Profitability",
    intro: "High net margin stocks can point to businesses with strong pricing power, disciplined costs, or structurally attractive economics.",
    metaDescription: "Discover US high net margin stocks with live market cap, price, ROE, and balance sheet data. Updated throughout the week.",
    conditions: [
      { metric: "netMargin", op: ">=", value: 20 },
      { metric: "roa", op: ">=", value: 5 }
    ],
    sort: { field: "netMargin", dir: "desc" },
    related: ["high-roa-stocks", "high-roe-stocks", "low-pb-stocks"],
    faqs: [
      ["Why require ROA as well?", "A margin filter alone can be noisy, so this page also looks for companies converting assets into profit effectively."],
      ["Do margins update automatically?", "Yes. The page data refreshes from your backend on a recurring Cloudflare schedule."]
    ]
  },
  {
    slug: "low-pe-stocks",
    title: "Low PE Stocks",
    h1: "Low PE Stocks",
    cluster: "Value",
    intro: "This page highlights lower P/E names that still show usable profitability metrics, helping avoid the weakest corners of value screens.",
    metaDescription: "Screen US low PE stocks with live valuation, profitability, and balance sheet metrics. Programmatic SEO page updated automatically.",
    conditions: [
      { metric: "pe", op: "<=", value: 15 },
      { metric: "roe", op: ">=", value: 8 },
      { metric: "pb", op: ">", value: 0 }
    ],
    sort: { field: "pe", dir: "asc" },
    related: ["low-pb-stocks", "undervalued-tech-stocks", "low-debt-stocks"],
    faqs: [
      ["Why not sort only by cheapest P/E?", "Extremely low P/E stocks can be low quality or cyclical, so this screen keeps a minimum profitability floor."],
      ["Are negative earners included?", "No. A valid P/E ratio is required for this screen."]
    ]
  },
  {
    slug: "low-pb-stocks",
    title: "Low PB Stocks",
    h1: "Low PB Stocks",
    cluster: "Value",
    intro: "Low price-to-book screens can help surface asset-backed value opportunities, especially when paired with positive returns on equity.",
    metaDescription: "Browse US low price-to-book stocks with live valuation, ROE, debt, and market cap data on DeltaScreener.",
    conditions: [
      { metric: "pb", op: "<=", value: 2 },
      { metric: "roe", op: ">=", value: 8 }
    ],
    sort: { field: "pb", dir: "asc" },
    related: ["low-pe-stocks", "low-debt-stocks", "dividend-stocks"],
    faqs: [
      ["Why combine low PB with ROE?", "Low PB without profitability can produce weak lists, so this page keeps a minimum ROE threshold."],
      ["Will financial firms appear here?", "Yes, if they meet the current screen rules and have complete fundamentals in the backend."]
    ]
  },
  {
    slug: "dividend-stocks",
    title: "Dividend Stocks",
    h1: "Dividend Stocks",
    cluster: "Income",
    intro: "This page tracks US dividend-paying stocks with current yield data and balance sheet filters to keep the list more actionable.",
    metaDescription: "Find dividend-paying US stocks with yield, valuation, ROE, and debt metrics. SEO page refreshed automatically on Cloudflare.",
    conditions: [
      { metric: "dividendYield", op: ">=", value: 2.5 },
      { metric: "debtToEquity", op: "<=", value: 2.5 }
    ],
    sort: { field: "dividendYield", dir: "desc" },
    related: ["low-debt-dividend-stocks", "low-debt-stocks", "low-pe-stocks"],
    faqs: [
      ["Does this page show current yield or dividend growth?", "This screen is based on current dividend yield and supporting fundamentals, not a historical dividend growth series."],
      ["Why can some high-yield stocks be missing?", "Names with missing or weak core fundamentals are filtered out to avoid low-quality pages and results."]
    ]
  },
  {
    slug: "low-debt-dividend-stocks",
    title: "Low Debt Dividend Stocks",
    h1: "Low Debt Dividend Stocks",
    cluster: "Income",
    intro: "Low debt dividend stocks can be useful for investors who want current yield without leaning too heavily on stretched balance sheets.",
    metaDescription: "Explore low debt dividend stocks in the US market with live yield, ROE, PE, and debt-to-equity data.",
    conditions: [
      { metric: "dividendYield", op: ">=", value: 1.5 },
      { metric: "debtToEquity", op: "<=", value: 1 },
      { metric: "roe", op: ">=", value: 8 }
    ],
    sort: { field: "dividendYield", dir: "desc" },
    related: ["dividend-stocks", "low-debt-stocks", "nyse-low-debt-stocks"],
    faqs: [
      ["What makes this different from the general dividend page?", "This version adds a tighter debt ceiling to prioritize stronger balance sheets."],
      ["How often does the list refresh?", "The page is cached at the edge and refreshed from fresh screener data every few hours."]
    ]
  },
  {
    slug: "undervalued-tech-stocks",
    title: "Undervalued Tech Stocks",
    h1: "Undervalued Tech Stocks",
    cluster: "Sector Value",
    intro: "Undervalued technology stocks are screened here using sector membership plus conservative valuation and profitability filters.",
    metaDescription: "Browse undervalued technology stocks with live PE, PB, ROE, and market cap data for the US market.",
    conditions: [
      { metric: "sector", op: "=", value: "Technology" },
      { metric: "pe", op: "<=", value: 25 },
      { metric: "pb", op: "<=", value: 8 },
      { metric: "roe", op: ">=", value: 10 }
    ],
    sort: { field: "roe", dir: "desc" },
    related: ["high-roe-tech-stocks", "low-pe-stocks", "high-roe-stocks"],
    faqs: [
      ["How do you define undervalued here?", "This page uses sector = Technology plus capped PE and PB ratios, then keeps a minimum ROE floor."],
      ["Is this only mega-cap tech?", "No. The list can include smaller US tech names as long as they meet the active universe and financial coverage rules."]
    ]
  },
  {
    slug: "high-roe-tech-stocks",
    title: "High ROE Tech Stocks",
    h1: "High ROE Tech Stocks",
    cluster: "Sector Quality",
    intro: "This page narrows the tech universe to companies with strong return on equity and usable balance-sheet coverage.",
    metaDescription: "Screen high ROE technology stocks in the US market with live price, ROE, PB, and debt metrics.",
    conditions: [
      { metric: "sector", op: "=", value: "Technology" },
      { metric: "roe", op: ">=", value: 18 },
      { metric: "debtToEquity", op: "<=", value: 2 }
    ],
    sort: { field: "roe", dir: "desc" },
    related: ["undervalued-tech-stocks", "high-roe-stocks", "nasdaq-high-roe-stocks"],
    faqs: [
      ["Why combine tech and ROE?", "It helps surface efficient technology businesses while filtering away weaker balance-sheet setups."],
      ["Can software and semis both appear?", "Yes. Technology here is driven by the sector label from your backend dataset."]
    ]
  },
  {
    slug: "nasdaq-high-roe-stocks",
    title: "Nasdaq High ROE Stocks",
    h1: "Nasdaq High ROE Stocks",
    cluster: "Exchange",
    intro: "This page focuses on NASDAQ-listed stocks with strong return on equity, giving you a cleaner long-tail screen for exchange-specific searches.",
    metaDescription: "View NASDAQ high ROE stocks with live price, market cap, PB, and debt metrics. Auto-updated on DeltaScreener.",
    conditions: [
      { metric: "exchange", op: "=", value: "NASDAQ" },
      { metric: "roe", op: ">=", value: 18 },
      { metric: "pb", op: ">", value: 0 }
    ],
    sort: { field: "roe", dir: "desc" },
    related: ["high-roe-tech-stocks", "high-roe-stocks", "penny-stocks"],
    faqs: [
      ["Why make an exchange-specific page?", "Exchange-qualified pages are useful for long-tail search intent and help avoid mixing different listing universes."],
      ["Are all results US-listed?", "Yes. The current backend universe is focused on US-listed names."]
    ]
  },
  {
    slug: "nyse-low-debt-stocks",
    title: "NYSE Low Debt Stocks",
    h1: "NYSE Low Debt Stocks",
    cluster: "Exchange",
    intro: "NYSE low debt stocks can be useful when you want exchange-specific balance sheet screens with up-to-date profitability data.",
    metaDescription: "Explore NYSE low debt stocks with live ROE, PE, debt-to-equity, and market cap data.",
    conditions: [
      { metric: "exchange", op: "=", value: "NYSE" },
      { metric: "debtToEquity", op: "<=", value: 0.5 },
      { metric: "roe", op: ">=", value: 8 }
    ],
    sort: { field: "debtToEquity", dir: "asc" },
    related: ["low-debt-stocks", "low-debt-dividend-stocks", "low-pb-stocks"],
    faqs: [
      ["What qualifies as NYSE here?", "The route uses the normalized exchange value stored in your stock dataset and filters it to NYSE."],
      ["Why require ROE too?", "That helps keep the page from becoming a thin list of low-leverage but low-quality businesses."]
    ]
  },
  {
    slug: "penny-stocks",
    title: "Penny Stocks",
    h1: "Penny Stocks",
    cluster: "Price",
    intro: "This page surfaces lower-priced US stocks while keeping a minimum market-cap and balance-sheet floor to reduce the noisiest names.",
    metaDescription: "Browse US penny stocks with current price, market cap, debt, and valuation data. Updated automatically on DeltaScreener.",
    conditions: [
      { metric: "price", op: "<=", value: 5 },
      { metric: "marketCap", op: ">=", value: 2e8 },
      { metric: "debtToEquity", op: "<=", value: 3 }
    ],
    sort: { field: "marketCap", dir: "desc" },
    related: ["nasdaq-high-roe-stocks", "low-pe-stocks", "low-pb-stocks"],
    faqs: [
      ["Why add a market cap floor?", "It helps remove the thinnest micro-cap names so the page stays more useful and less spammy."],
      ["Is this financial advice?", "No. These pages are data-driven screens meant for research and idea generation."]
    ]
  }
];
var SCREEN_LOOKUP = Object.fromEntries(SCREEN_PAGES.map((screen) => [screen.slug, screen]));
function escapeHtml3(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml3, "escapeHtml");
function stripHtml2(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
__name(stripHtml2, "stripHtml");
function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
__name(numberOrNull, "numberOrNull");
function compactUsd2(value) {
  const n = numberOrNull(value);
  if (n == null || n <= 0) return "\u2014";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}
__name(compactUsd2, "compactUsd");
function usd2(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
__name(usd2, "usd");
function num2(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
__name(num2, "num");
function pct2(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : `${n.toFixed(2)}%`;
}
__name(pct2, "pct");
function average(values) {
  const nums = values.map(numberOrNull).filter((v) => v != null);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}
__name(average, "average");
function median(values) {
  const nums = values.map(numberOrNull).filter((v) => v != null).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}
__name(median, "median");
function topBuckets(rows, field, limit = 3) {
  const counts = /* @__PURE__ */ new Map();
  for (const row of rows) {
    const key = String(row?.[field] || "").trim();
    if (!key || key === "\u2014") continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}
__name(topBuckets, "topBuckets");
function isoDate(value) {
  const date = value ? new Date(value) : /* @__PURE__ */ new Date();
  return Number.isNaN(date.getTime()) ? (/* @__PURE__ */ new Date()).toISOString() : date.toISOString();
}
__name(isoDate, "isoDate");
function humanDate(value) {
  return new Date(isoDate(value)).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York"
  });
}
__name(humanDate, "humanDate");
function conditionLabel(condition) {
  const labels = {
    roe: "ROE",
    roa: "ROA",
    pb: "P/B",
    pe: "P/E",
    ps: "P/S",
    netMargin: "Net margin",
    debtToEquity: "Debt to equity",
    dividendYield: "Dividend yield",
    sector: "Sector",
    exchange: "Exchange",
    price: "Price",
    marketCap: "Market cap"
  };
  const metric = labels[condition.metric] || condition.metric;
  const value = typeof condition.value === "number" ? condition.metric === "marketCap" ? compactUsd2(condition.value) : num2(condition.value) : String(condition.value);
  const op = {
    ">=": "at least",
    ">": "above",
    "<=": "at most",
    "<": "below",
    "=": "equal to"
  }[condition.op] || condition.op;
  return `${metric} ${op} ${value}`;
}
__name(conditionLabel, "conditionLabel");
async function fetchJson2(origins, path, init = {}) {
  let lastError = null;
  for (const origin of origins) {
    if (!origin) continue;
    try {
      const res = await fetch(`${origin}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "DeltaScreener-SEO/1.0",
          ...init.headers || {}
        }
      });
      if (!res.ok) {
        lastError = new Error(`API ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Could not fetch API data");
}
__name(fetchJson2, "fetchJson");
async function fetchScreenResults(context, screen) {
  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS2].filter(Boolean);
  return fetchJson2(apiOrigins, "/screener/custom", {
    method: "POST",
    body: JSON.stringify({
      page: 1,
      limit: 40,
      sort: screen.sort,
      conditions: screen.conditions
    })
  });
}
__name(fetchScreenResults, "fetchScreenResults");
function screenStats(results = []) {
  const rows = Array.isArray(results) ? results : [];
  const sectors = topBuckets(rows, "sector", 3);
  return {
    avgRoe: average(rows.map((row) => row.roe)),
    avgDebt: average(rows.map((row) => row.debtToEquity)),
    medianPe: median(rows.map((row) => row.pe)),
    medianPb: median(rows.map((row) => row.pb)),
    medianMarketCap: median(rows.map((row) => row.mktCap)),
    sectors
  };
}
__name(screenStats, "screenStats");
function relatedLinks(screen) {
  return (screen.related || []).map((slug) => SCREEN_LOOKUP[slug]).filter(Boolean);
}
__name(relatedLinks, "relatedLinks");
function screenPageJsonLd(screen, payload, url) {
  const topResults = (payload?.results || []).slice(0, 10);
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: screen.h1,
      url,
      description: screen.metaDescription,
      dateModified: isoDate(payload?.updatedAt),
      inLanguage: "en-US"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN2 },
        { "@type": "ListItem", position: 2, name: "Stocks", item: `${SITE_ORIGIN2}/stocks` },
        { "@type": "ListItem", position: 3, name: screen.h1, item: url }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: topResults.map((row, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_ORIGIN2}/stock/${encodeURIComponent(row.ticker)}`,
        name: row.ticker
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (screen.faqs || []).map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer
        }
      }))
    }
  ];
}
__name(screenPageJsonLd, "screenPageJsonLd");
function layout({ title, description, canonical, robots, body, jsonLd }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml3(title)}</title>
  <meta name="description" content="${escapeHtml3(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml3(title)}" />
  <meta property="og:description" content="${escapeHtml3(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE_ORIGIN2}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml3(title)}" />
  <meta name="twitter:description" content="${escapeHtml3(description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN2}/og-image.png" />
  <meta name="twitter:site" content="@deltascreener" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260425-4" />
  <style>
    :root { color-scheme: light; }
    body{margin:0;background:linear-gradient(180deg,#f5f6f0 0%,#fbfbf8 30%,#ffffff 100%);color:#14202b;font-family:Inter,system-ui,sans-serif}
    .seo-wrap{max-width:1180px;margin:0 auto;padding:32px 16px 64px}
    .seo-nav{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774}
    .seo-nav ol{list-style:none;padding:0;margin:0;display:flex;align-items:center;gap:6px}
    .seo-nav li{display:inline-flex;align-items:center;gap:6px}
    .seo-nav a{color:#2dd4bf;text-decoration:none}
    .seo-nav li+li::before{content:"/";color:#9ca3af;font-weight:400}
    .seo-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.9fr);gap:22px;align-items:start;margin-top:18px}
    .seo-card{background:rgba(255,255,255,.92);border:1px solid rgba(208,214,222,.95);border-radius:24px;box-shadow:0 20px 48px rgba(15,23,42,.06)}
    .seo-hero-main{padding:28px}
    .seo-hero-side{padding:24px;background:linear-gradient(180deg,#fffdf4 0%,#fff 100%)}
    .seo-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px}
    .seo-hero h1{margin:0 0 14px;font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(34px,5vw,58px);line-height:1;letter-spacing:-.05em}
    .seo-hero p{margin:0;color:#55606d;line-height:1.75;font-size:16px}
    .seo-badges{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0}
    .seo-badges span{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:rgba(45,212,191,.07);color:#2dd4bf;font-size:13px;font-weight:700}
    .seo-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:24px 0}
    .seo-stat{padding:18px;border-radius:20px;border:1px solid rgba(208,214,222,.95);background:#0f1117}
    .seo-stat strong{display:block;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
    .seo-stat span{display:block;font-size:26px;font-weight:800;color:#0f172a}
    .seo-sections{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,.95fr);gap:22px;margin-top:22px}
    .seo-section{padding:24px}
    .seo-section h2{margin:0 0 14px;font-size:22px;letter-spacing:-.03em}
    .seo-section p,.seo-section li{color:#55606d;line-height:1.75}
    .seo-methodology{margin:0;padding-left:18px}
    .seo-table{width:100%;border-collapse:collapse}
    .seo-table th,.seo-table td{padding:12px 10px;border-bottom:1px solid rgba(226,232,240,.95);text-align:left;font-size:14px}
    .seo-table th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280}
    .seo-table a{color:#2dd4bf;text-decoration:none;font-weight:700}
    .seo-chip-grid{display:grid;gap:10px}
    .seo-chip{display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:18px;background:#0f1117;color:#14202b;text-decoration:none}
    .seo-chip strong{display:block;font-size:15px}
    .seo-chip span{display:block;margin-top:4px;font-size:13px;color:#667180}
    .seo-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .seo-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;font-weight:800;text-decoration:none}
    .seo-btn-primary{background:#0f766e;color:#fff}
    .seo-btn-secondary{background:#0f1117;color:#14202b;border:1px solid rgba(208,214,222,.95)}
    .seo-faq-item + .seo-faq-item{margin-top:14px}
    .seo-muted{color:#6b7280;font-size:14px}
    @media (max-width: 920px){
      .seo-hero,.seo-sections{grid-template-columns:1fr}
    }
  </style>
  <script type="application/ld+json">${JSON.stringify(jsonLd)}<\/script>
</head>
<body>
${body}
</body>
</html>`;
}
__name(layout, "layout");
function renderScreenPage(screen, payload = {}) {
  const results = Array.isArray(payload.results) ? payload.results : [];
  const stats = screenStats(results);
  const topSectorText = stats.sectors.length ? stats.sectors.map(([name, count]) => `${name} (${count})`).join(", ") : "Mixed sectors";
  const related = relatedLinks(screen);
  const canonical = `${SITE_ORIGIN2}/stocks/${screen.slug}`;
  const indexable = results.length >= 10;
  const robots = indexable ? "index,follow" : "noindex,follow";
  const updatedAt = isoDate(payload.updatedAt);
  const title = `${screen.title} (${payload.total || results.length || 0} US Stocks) | DeltaScreener`;
  const jsonLd = screenPageJsonLd(screen, payload, canonical);
  const tableRows = results.slice(0, 25).map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><a href="/stock/${encodeURIComponent(row.ticker)}">${escapeHtml3(row.ticker)}</a></td>
      <td>${escapeHtml3(row.name || row.ticker)}</td>
      <td>${escapeHtml3(row.exchange || "\u2014")}</td>
      <td>${usd2(row.price)}</td>
      <td>${compactUsd2(row.mktCap)}</td>
      <td>${num2(row.pe)}</td>
      <td>${num2(row.pb)}</td>
      <td>${pct2(row.roe)}</td>
      <td>${pct2(row.roa)}</td>
      <td>${pct2(row.netMargin)}</td>
      <td>${num2(row.debtToEquity)}</td>
    </tr>
  `).join("");
  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/stocks">Stocks</a></li>
        <li aria-current="page">${escapeHtml3(screen.h1)}</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">${escapeHtml3(screen.cluster)} screen</div>
        <h1>${escapeHtml3(screen.h1)}</h1>
        <p>${escapeHtml3(screen.intro)}</p>
        <div class="seo-badges">
          <span>${escapeHtml3(`${payload.total || results.length || 0} matching stocks`)}</span>
          <span>${escapeHtml3(`Updated ${humanDate(updatedAt)} ET`)}</span>
          <span>${escapeHtml3(`${payload.screenableUniverse || "\u2014"} stock screenable universe`)}</span>
        </div>
        <div class="seo-summary">
          <div class="seo-stat"><strong>Average ROE</strong><span>${pct2(stats.avgRoe)}</span></div>
          <div class="seo-stat"><strong>Average Debt / Equity</strong><span>${num2(stats.avgDebt)}</span></div>
          <div class="seo-stat"><strong>Median P/E</strong><span>${num2(stats.medianPe)}</span></div>
          <div class="seo-stat"><strong>Median Market Cap</strong><span>${compactUsd2(stats.medianMarketCap)}</span></div>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Why this page exists</div>
        <p>This route is server-rendered on Cloudflare Pages Functions, refreshed from your screener backend, and only indexed when the result set stays useful enough to avoid thin-page SEO.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open live screener</a>
          <a class="seo-btn seo-btn-secondary" href="/stock/${encodeURIComponent(results[0]?.ticker || "AAPL")}">Open a stock page</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Methodology</h2>
        <p>DeltaScreener currently builds this page from your US-listed stock universe using the following rules:</p>
        <ul class="seo-methodology">
          ${screen.conditions.map((condition) => `<li>${escapeHtml3(conditionLabel(condition))}</li>`).join("")}
        </ul>
        <p class="seo-muted">Top sectors in the current result set: ${escapeHtml3(topSectorText)}.</p>
      </article>
      <aside class="seo-card seo-section">
        <h2>Related Screens</h2>
        <div class="seo-chip-grid">
          ${related.map((item) => `
            <a class="seo-chip" href="/stocks/${item.slug}">
              <strong>${escapeHtml3(item.h1)}</strong>
              <span>${escapeHtml3(item.cluster)} screen</span>
            </a>
          `).join("")}
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Current Results</h2>
        <p>The table below links directly into stock detail pages, giving Google and users real crawlable depth instead of thin filter combinations.</p>
        <div style="overflow:auto">
          <table class="seo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Exchange</th>
                <th>Price</th>
                <th>Market Cap</th>
                <th>P/E</th>
                <th>P/B</th>
                <th>ROE</th>
                <th>ROA</th>
                <th>Net Margin</th>
                <th>D/E</th>
              </tr>
            </thead>
            <tbody>${tableRows || '<tr><td colspan="12">No qualifying stocks were returned for this refresh.</td></tr>'}</tbody>
          </table>
        </div>
      </article>
      <aside class="seo-card seo-section">
        <h2>FAQ</h2>
        ${(screen.faqs || []).map(([question, answer]) => `
          <div class="seo-faq-item">
            <strong>${escapeHtml3(question)}</strong>
            <p>${escapeHtml3(answer)}</p>
          </div>
        `).join("")}
      </aside>
    </section>
  </main>`;
  return {
    html: layout({
      title,
      description: screen.metaDescription,
      canonical,
      robots,
      body,
      jsonLd
    }),
    lastModified: updatedAt,
    indexable
  };
}
__name(renderScreenPage, "renderScreenPage");
function renderStocksHub() {
  const clusters = /* @__PURE__ */ new Map();
  for (const screen of SCREEN_PAGES) {
    const list = clusters.get(screen.cluster) || [];
    list.push(screen);
    clusters.set(screen.cluster, list);
  }
  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li aria-current="page">Stocks</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">Programmatic stock screens</div>
        <h1>US Stock Screener Pages</h1>
        <p>These crawlable stock screener pages are rendered on Cloudflare Pages Functions and refreshed from your Worker-backed stock dataset. Only curated, high-signal pages are published so the SEO layer stays useful instead of turning into thin filter spam.</p>
        <div class="seo-badges">
          <span>${SCREEN_PAGES.length} curated long-tail pages</span>
          <span>Cloudflare Pages Functions</span>
          <span>US stock universe focus</span>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">SEO guardrails</div>
        <p>This hub intentionally links only to pages backed by real metrics already available in your backend. Unsupported combinations like RSI or breakout pages are not auto-published yet, which keeps index quality high.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open interactive screener</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections" style="grid-template-columns:1fr">
      ${[...clusters.entries()].map(([cluster, screens]) => `
        <article class="seo-card seo-section">
          <h2>${escapeHtml3(cluster)} Screens</h2>
          <div class="seo-chip-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            ${screens.map((screen) => `
              <a class="seo-chip" href="/stocks/${screen.slug}">
                <strong>${escapeHtml3(screen.h1)}</strong>
                <span>${escapeHtml3(stripHtml2(screen.intro).slice(0, 110))}</span>
              </a>
            `).join("")}
          </div>
        </article>
      `).join("")}
    </section>
  </main>`;
  return layout({
    title: "US Stock Screener Pages | DeltaScreener",
    description: "Browse curated long-tail US stock screener pages rendered on Cloudflare Pages Functions and refreshed from live screener data.",
    canonical: `${SITE_ORIGIN2}/stocks`,
    robots: "index,follow",
    body,
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "US Stock Screener Pages",
      url: `${SITE_ORIGIN2}/stocks`,
      inLanguage: "en-US"
    }]
  });
}
__name(renderStocksHub, "renderStocksHub");
function renderSitemap() {
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const staticUrls = [
    { loc: `${SITE_ORIGIN2}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_ORIGIN2}/screener`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_ORIGIN2}/stocks`, changefreq: "weekly", priority: "0.8" }
  ];
  const screenUrls = SCREEN_PAGES.map((screen) => ({
    loc: `${SITE_ORIGIN2}/stocks/${screen.slug}`,
    changefreq: "daily",
    priority: "0.7"
  }));
  const blogUrls = [
    { loc: `${SITE_ORIGIN2}/blog`, changefreq: "weekly", priority: "0.7" },
    { loc: `${SITE_ORIGIN2}/blog/nasdaq-vs-nyse-stock-screening`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/nyse-vs-nasdaq-stock-picking`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/how-to-screen-tech-stocks-for-value-2026`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/how-to-screen-tech-stocks-for-value`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/what-is-roe-in-stocks`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/best-dividend-stock-screening-criteria`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/debt-to-equity-ratio-explained`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/what-is-roa-in-stocks`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/how-to-build-a-stock-screen`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/high-roe-semiconductor-stocks`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/low-debt-stocks-investing-guide`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/nasdaq-high-roe-stocks-guide`, changefreq: "monthly", priority: "0.6" },
    { loc: `${SITE_ORIGIN2}/blog/roe-and-debt-screening-strategy`, changefreq: "monthly", priority: "0.6" }
  ];
  const TOP_TICKERS = [
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "BRK.B",
    "JPM",
    "V",
    "UNH",
    "XOM",
    "LLY",
    "JNJ",
    "WMT",
    "MA",
    "AVGO",
    "HD",
    "CVX",
    "MRK",
    "ABBV",
    "COST",
    "PEP",
    "ADBE",
    "KO",
    "CRM",
    "ACN",
    "TMO",
    "MCD",
    "BAC",
    "CSCO",
    "ABT",
    "NFLX",
    "QCOM",
    "PFE",
    "AMD",
    "TXN",
    "DHR",
    "LIN",
    "AMGN",
    "PM",
    "NKE",
    "UPS",
    "MS",
    "RTX",
    "NEE",
    "T",
    "LOW",
    "INTC",
    "INTU",
    "SPGI",
    "CAT",
    "GS",
    "BLK",
    "ELV",
    "SCHW",
    "AMAT",
    "DE",
    "ADP",
    "NOW",
    "ISRG",
    "GILD",
    "MU",
    "LRCX",
    "PLD",
    "AMT",
    "CI",
    "SYK",
    "REGN",
    "MDLZ",
    "CB",
    "EOG",
    "MO",
    "DUK",
    "SO",
    "CL",
    "MMC",
    "ICE",
    "ZTS",
    "ITW",
    "FDX",
    "CME",
    "GE",
    "AON",
    "KLAC",
    "PGR",
    "APD",
    "HUM",
    "SHW",
    "SNPS",
    "MCO",
    "CDNS",
    "ETN",
    "BSX",
    "NOC",
    "WM",
    "ORLY",
    "ROP",
    "AZO",
    "PAYX",
    "MCHP"
  ];
  const stockUrls = TOP_TICKERS.map((ticker) => ({
    loc: `${SITE_ORIGIN2}/stock/${ticker}`,
    changefreq: "daily",
    priority: "0.8"
  }));
  const allUrls = [...staticUrls, ...screenUrls, ...blogUrls, ...stockUrls];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}
__name(renderSitemap, "renderSitemap");
function htmlResponse(html, { lastModified = null, indexable = true } = {}) {
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": HTML_CACHE_CONTROL
  });
  if (lastModified) headers.set("Last-Modified", new Date(isoDate(lastModified)).toUTCString());
  if (!indexable) headers.set("X-Robots-Tag", "noindex, follow");
  return new Response(html, { status: 200, headers });
}
__name(htmlResponse, "htmlResponse");
function xmlResponse(xml) {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": XML_CACHE_CONTROL
    }
  });
}
__name(xmlResponse, "xmlResponse");
async function withEdgeCache(request, context, buildResponse) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  const hit = await cache.match(cacheKey);
  if (hit) {
    const headers2 = new Headers(hit.headers);
    headers2.set("X-SEO-Cache", "edge");
    return new Response(hit.body, { status: hit.status, headers: headers2 });
  }
  const response = await buildResponse();
  if (response.ok) context.waitUntil(cache.put(cacheKey, response.clone()));
  const headers = new Headers(response.headers);
  headers.set("X-SEO-Cache", "miss");
  return new Response(response.body, { status: response.status, headers });
}
__name(withEdgeCache, "withEdgeCache");

// stocks/[slug].js
async function onRequestGet27(context) {
  const slug = String(context.params?.slug || "").trim();
  const screen = SCREEN_LOOKUP[slug];
  if (!screen) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex"
      }
    });
  }
  return withEdgeCache(context.request, context, async () => {
    try {
      const payload = await fetchScreenResults(context, screen);
      const rendered = renderScreenPage(screen, payload);
      return htmlResponse(rendered.html, {
        lastModified: rendered.lastModified,
        indexable: rendered.indexable
      });
    } catch {
      const rendered = renderScreenPage(screen, { total: 0, results: [], updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      return htmlResponse(rendered.html, {
        lastModified: (/* @__PURE__ */ new Date()).toISOString(),
        indexable: false
      });
    }
  });
}
__name(onRequestGet27, "onRequestGet");

// screens/[[slug]].js
async function onRequestGet28(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.replace("/screens/", "").replace(/\/$/, "");
  const screen = SCREEN_LOOKUP[slug];
  if (!screen) {
    return new Response("Not found", { status: 404 });
  }
  return withEdgeCache(context.request, context, async () => {
    const payload = await fetchScreenResults(context, screen);
    const html = renderScreenPage(screen, payload);
    return htmlResponse(html);
  });
}
__name(onRequestGet28, "onRequestGet");

// blog/index.js
async function onRequestGet29({ env }) {
  const title = "Stock Investing Guides | DeltaScreener Blog";
  const description = "Practical guides on stock screening, valuation metrics, and investing strategies. Learn how to use filters like ROE, P/E, and debt-to-equity to find better stocks.";
  const canonicalUrl = `${SITE_ORIGIN}/blog`;
  const STATIC_ARTICLES = [
    {
      slug: "roe-and-debt-screening-strategy",
      title: "Combining ROE and Debt Filters: A Smarter Stock Screening Strategy",
      description: "Learn how combining ROE and debt-to-equity filters narrows thousands of US stocks to a focused list of quality companies. Step-by-step stock screening strategy guide.",
      cluster: "Strategy",
      published_at: "2026-06-07"
    },
    {
      slug: "nasdaq-high-roe-stocks-guide",
      title: "NASDAQ High ROE Stocks: A Practical Screening Guide",
      description: "Learn how to screen NASDAQ-listed stocks for high return on equity (ROE). Discover why NASDAQ skews toward capital-light businesses and how to filter for quality.",
      cluster: "Exchange Investing",
      published_at: "2026-06-06"
    },
    {
      slug: "low-debt-stocks-investing-guide",
      title: "Low Debt Stocks: How a Strong Balance Sheet Protects Investors",
      description: "Learn how to screen for low debt stocks using the debt-to-equity ratio. Discover why balance sheet strength matters by industry and how to find financially resilient companies.",
      cluster: "Balance Sheet",
      published_at: "2026-06-05"
    },
    {
      slug: "high-roe-semiconductor-stocks",
      title: "High ROE Semiconductor Stocks: How to Screen the Chip Sector",
      description: "Semiconductor stocks average 31% ROE \u2014 among the highest of any sector. Learn how to screen chip stocks using ROE, P/E, and margins to find quality names.",
      cluster: "Sector Investing",
      published_at: "2026-06-04"
    },
    {
      slug: "how-to-screen-tech-stocks-for-value-2026",
      title: "How to Screen Tech Stocks for Value: Finding Undervalued Technology Stocks",
      description: "Discover how to screen technology stocks using P/E ratios, ROE, and balance sheet metrics to find undervalued tech companies without overpaying.",
      cluster: "Sector Investing",
      published_at: "2026-05-21"
    },
    {
      slug: "nyse-vs-nasdaq-stock-picking",
      title: "NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know",
      description: "Learn the key differences between NYSE and NASDAQ \u2014 market structure, sector concentration, listing requirements, and how to use exchange filters in your stock screen.",
      cluster: "Exchange Investing",
      published_at: "2026-05-19"
    },
    {
      slug: "how-to-screen-tech-stocks-for-value",
      title: "How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide",
      description: "Learn how to screen technology stocks using ROE, P/E, and debt filters to find high-quality names without overpaying.",
      cluster: "Sector Investing",
      published_at: "2026-05-18"
    },
    {
      slug: "what-is-roe-in-stocks",
      title: "What Is ROE in Stocks? Why Return on Equity Matters for Investors",
      description: "Return on equity (ROE) measures how efficiently a company uses shareholder capital to generate profit. Learn what counts as a good ROE and how to use it to screen stocks.",
      cluster: "Quality Investing",
      published_at: "2026-05-17"
    },
    {
      slug: "what-is-roa-in-stocks",
      title: "What Is ROA in Stocks? Return on Assets Explained for Investors",
      description: "Return on assets (ROA) shows how efficiently a company uses its assets to generate profit. Learn how to interpret ROA and use it in your stock screens.",
      cluster: "Quality Investing",
      published_at: "2026-05-16"
    },
    {
      slug: "debt-to-equity-ratio-explained",
      title: "Debt-to-Equity Ratio Explained: Why Balance Sheet Health Matters",
      description: "The debt-to-equity ratio reveals how much a company relies on borrowed money. Learn what a good D/E ratio looks like and how to use it as a stock screen filter.",
      cluster: "Balance Sheet",
      published_at: "2026-05-15"
    },
    {
      slug: "best-dividend-stock-screening-criteria",
      title: "Best Dividend Stock Screening Criteria for Passive Income Investors",
      description: "Learn the key filters for finding reliable dividend stocks: yield, payout ratio, debt levels, and dividend growth. A practical guide for income investors.",
      cluster: "Income Investing",
      published_at: "2026-05-14"
    },
    {
      slug: "how-to-build-a-stock-screen",
      title: "How to Build a Stock Screen from Scratch",
      description: "A step-by-step guide to building your first stock screen. Learn which filters matter most and how to combine ROE, P/E, and debt criteria to find better stocks.",
      cluster: "Strategy",
      published_at: "2026-05-13"
    },
    {
      slug: "nasdaq-vs-nyse-stock-screening",
      title: "NASDAQ vs NYSE: What Every Stock Screener Should Know",
      description: "Understand the structural differences between NASDAQ and NYSE and how exchange filters can sharpen your stock screening strategy.",
      cluster: "Exchange Investing",
      published_at: "2026-05-12"
    }
  ];
  let posts = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, title, description, cluster, published_at
       FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all();
    posts = results && results.length > 0 ? results : STATIC_ARTICLES;
  } catch (_) {
    posts = STATIC_ARTICLES;
  }
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "DeltaScreener Blog",
      description,
      url: canonicalUrl,
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl }
      ]
    }
  ];
  const articleCards = posts.length === 0 ? `<div style="text-align:center;padding:60px 20px;color:#9ca3af">
        <p style="font-size:18px;font-weight:600;color:#e5e7eb;margin:0 0 8px">New guides coming soon</p>
        <p style="font-size:14px;margin:0">We publish stock screening and investing guides regularly. Check back tomorrow!</p>
       </div>` : posts.map((article) => `
      <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;margin-bottom:14px;transition:box-shadow .15s,transform .15s,background .15s;color:#f3f4f6" onmouseover="this.style.background='rgba(255,255,255,.07)';this.style.boxShadow='0 4px 24px rgba(0,0,0,.35)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.boxShadow='none';this.style.transform='none'">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px">${article.cluster}</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:21px;line-height:1.28;letter-spacing:-.03em;margin:0 0 10px;color:#f9fafb">${article.title}</h2>
        <p style="margin:0 0 10px;color:#9ca3af;font-size:14px;line-height:1.6">${article.description}</p>
        <span style="font-size:12px;color:#6b7280">${new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </a>
    `).join("");
  const bodyHtml = `
    <style>
      body, html { background: #0f1117 !important; color: #f3f4f6 !important; }
      body[data-theme='light'] { background: #0f1117 !important; color: #f3f4f6 !important; }
    </style>
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#6b7280">/</li>
          <li aria-current="page" style="color:#9ca3af">Blog</li>
        </ol>
      </nav>
      <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Stock Investing Guides</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 12px;color:#f9fafb">DeltaScreener Blog</h1>
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies \u2014 written for investors who want to understand what the numbers mean.</p>
      <div>${articleCards}</div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.18)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#9ca3af;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter combination \u2014 no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "stock investing guides, stock screening blog, ROE investing, how to screen stocks, DeltaScreener blog",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet29, "onRequestGet");

// robots.txt.js
var SITE_ORIGIN3 = "https://deltascreener.com";
async function onRequestGet30() {
  const content = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Block API and auth routes from crawlers",
    "Disallow: /api/",
    "Disallow: /auth/",
    "",
    `Sitemap: ${SITE_ORIGIN3}/sitemap.xml`
  ].join("\n");
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
__name(onRequestGet30, "onRequestGet");

// screener.js
var PRESET_QUERIES = [
  "ROE > 20 AND Average ROE 5Years > 18 AND ROCE > 15 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Interest Coverage Ratio > 5 AND Market Cap > 5000",
  "Change % > 5 AND YOY Qtr profit growth > 20 AND YOY Qtr sales growth > 15 AND ROE > 15 AND Net Margin > 8 AND Market Cap > 2000",
  "PEG Ratio > 0 AND PEG Ratio < 1 AND Sales growth 3Years > 15 AND Profit growth 3Years > 20 AND Sales growth 5Years > 12 AND Gross Margin > 40 AND Debt to Equity < 0.8 AND Market Cap > 1000",
  "P/E > 0 AND P/E < 15 AND P/B < 1.5 AND Current ratio > 2 AND Earnings yield > 6 AND Debt to Equity < 1 AND ROE > 10 AND Market Cap > 1000",
  "Dividend Yield > 2.5 AND Dividend Yield < 8 AND ROE > 12 AND Net Margin > 10 AND Interest Coverage Ratio > 4 AND Debt to Equity < 1 AND Market Cap > 5000"
];
async function onRequestGet31({ request }) {
  const url = new URL(request.url);
  const presetIdx = parseInt(url.searchParams.get("preset") ?? "-1");
  const presetQuery = presetIdx >= 0 && presetIdx < PRESET_QUERIES.length ? PRESET_QUERIES[presetIdx] : null;
  const title = "Free Stock Screener \u2014 Filter 5,000+ US Stocks | DeltaScreener";
  const description = "Screen 5,000+ US stocks with 30+ filters: P/E, ROE, Market Cap, Net Margin, Debt/Equity, Dividend Yield and more. Free, fast, no sign-up required.";
  const keywords = "stock screener, free stock screener, US stock screener, stock filter, PE screener, ROE screener, market cap screener, NASDAQ screener, NYSE screener, DeltaScreener";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "DeltaScreener Stock Screener",
      url: `${SITE_ORIGIN}/screener`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      featureList: [
        "Filter by P/E, P/B, ROE, ROA, Net Margin",
        "Filter by Debt/Equity, Market Cap, Dividend Yield",
        "Sort across 5,000+ US-listed stocks",
        "NYSE and NASDAQ coverage",
        "10-year financial history on each stock",
        "No sign-up required"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
        { "@type": "ListItem", position: 2, name: "Stock Screener", item: `${SITE_ORIGIN}/screener` }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is DeltaScreener free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The core stock screener on DeltaScreener is completely free with no sign-up required. You can filter 5,000+ US-listed stocks by valuation, profitability, and balance sheet metrics instantly."
          }
        },
        {
          "@type": "Question",
          name: "What stocks can I screen on DeltaScreener?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeltaScreener covers US-listed stocks on NYSE and NASDAQ. The screenable universe includes over 5,000 stocks with complete fundamental data."
          }
        },
        {
          "@type": "Question",
          name: "What filters are available in the stock screener?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeltaScreener supports 30+ filters including P/E ratio, P/B ratio, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, and exchange. You can combine any number of conditions to build a custom screen."
          }
        },
        {
          "@type": "Question",
          name: "How is DeltaScreener different from other stock screeners?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "DeltaScreener is built for speed and simplicity. You get instant results, direct links to 10-year financial history for every stock, and curated screener pages for common strategies like high ROE, low debt, and dividend investing \u2014 all without logging in."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:40px 16px 64px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#d1d5db">Stock Screener</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:12px">Custom stock filters</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(38px,6vw,64px);line-height:1.05;letter-spacing:-.05em;margin:0 0 14px;color:#f9fafb">Free Stock Screener</h1>
      <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 28px;font-size:17px">${description}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:0 0 32px">
        ${[
    ["Valuation", "P/E, P/B, P/S ratios", "#eef8f5", "#0f766e"],
    ["Profitability", "ROE, ROA, Net Margin", "#f0f4ff", "#2962ff"],
    ["Balance Sheet", "Debt/Equity, current ratio", "#fef9ec", "#b45309"],
    ["Income", "Dividend Yield, payout", "#fdf2f8", "#9333ea"],
    ["Size", "Market Cap, price range", "#f0fdf4", "#15803d"],
    ["Sector / Exchange", "NYSE, NASDAQ, tech, finance", "#fff7ed", "#ea580c"]
  ].map(([label, desc, bg, color]) => `
          <div style="padding:18px 20px;border-radius:16px;background:${bg};border:1px solid rgba(0,0,0,.06)">
            <strong style="display:block;font-size:14px;font-weight:800;color:${color};margin-bottom:4px">${label}</strong>
            <span style="font-size:13px;color:#55606d">${desc}</span>
          </div>
        `).join("")}
      </div>

      <a href="/screener" style="display:inline-flex;padding:13px 20px;border-radius:14px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:15px;margin-bottom:48px">Launch Interactive Screener \u2192</a>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 12px">How the stock screener works</h2>
        <p style="max-width:760px;line-height:1.75;color:#55606d">
          DeltaScreener lets you build a custom stock screen by combining any number of metric conditions. Choose a metric (like ROE or P/E), set an operator (at least, at most, equal to), and enter a value. Add as many conditions as you need, then sort the results by any column. Each result links to a full stock detail page with 10 years of financials, quarterly data, valuation ratios, peers, and news \u2014 all in one place.
        </p>
      </section>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 16px">Popular stock screens</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${[
    ["High ROE Stocks", "/stocks/high-roe-stocks"],
    ["Low Debt Stocks", "/stocks/low-debt-stocks"],
    ["Undervalued Tech Stocks", "/stocks/undervalued-tech-stocks"],
    ["Dividend Stocks", "/stocks/dividend-stocks"],
    ["Low PE Stocks", "/stocks/low-pe-stocks"],
    ["High Net Margin Stocks", "/stocks/high-net-margin-stocks"]
  ].map(([name, href]) => `
            <a href="${href}" style="display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:14px;background:#0f1117;color:#f9fafb;text-decoration:none;font-weight:700;font-size:14px">${name} \u2192</a>
          `).join("")}
        </div>
      </section>

      <section style="margin-bottom:40px">
        <h2 style="font-size:22px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 16px">Frequently asked questions</h2>
        ${[
    ["Is DeltaScreener free to use?", "Yes. The core stock screener is completely free with no sign-up required. Filter 5,000+ US-listed stocks by valuation, profitability, and balance sheet metrics instantly."],
    ["What stocks can I screen?", "DeltaScreener covers US-listed stocks on NYSE and NASDAQ \u2014 over 5,000 names with complete fundamental data."],
    ["What filters are available?", "DeltaScreener supports 30+ filters: P/E, P/B, P/S, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, exchange, and more. Combine any number of conditions."],
    ["How is this different from other screeners?", "DeltaScreener is built for speed. Instant results, 10-year financial history per stock, and curated screener pages for common strategies \u2014 no login required."]
  ].map(([q, a]) => `
          <div style="margin-bottom:18px">
            <strong style="display:block;font-size:15px;color:#f9fafb;margin-bottom:6px">${q}</strong>
            <p style="margin:0;line-height:1.75;color:#55606d;font-size:14px">${a}</p>
          </div>
        `).join("")}
      </section>
    </main>`;
  const presetPrerender = presetQuery ? { query: presetQuery } : null;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl: `${SITE_ORIGIN}/screener`,
    keywords,
    jsonLd,
    bodyHtml,
    prerender: presetPrerender
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Never cache /screener — presets must always be fresh
      "Cache-Control": "no-store"
    }
  });
}
__name(onRequestGet31, "onRequestGet");

// sitemap.xml/index.js
async function onRequestGet32() {
  return xmlResponse(renderSitemap());
}
__name(onRequestGet32, "onRequestGet");

// stocks/index.js
async function onRequestGet33(context) {
  return withEdgeCache(
    context.request,
    context,
    async () => htmlResponse(renderStocksHub(), { lastModified: (/* @__PURE__ */ new Date()).toISOString(), indexable: true })
  );
}
__name(onRequestGet33, "onRequestGet");

// [[catchall]].js
function markdownToHtml3(md) {
  return md.replace(/^## (.+)$/gm, `<h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>`).replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>').replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:12px 0">$&</ul>').replace(/\n\n/g, '</p><p style="margin:0 0 16px">').replace(/^<\/p><p[^>]*>(<h[23])/gm, "$1").replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, "$1").trim();
}
__name(markdownToHtml3, "markdownToHtml");
async function handleBlogIndex({ env }) {
  const title = "Stock Investing Guides | DeltaScreener Blog";
  const description = "Practical guides on stock screening, valuation metrics, and investing strategies.";
  const canonicalUrl = `${SITE_ORIGIN}/blog`;
  let posts = [];
  try {
    const { results } = await env.DB.prepare(
      `SELECT slug, title, description, cluster, published_at FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all();
    posts = results && results.length > 0 ? results : [];
  } catch (_) {
  }
  const articleCards = posts.length === 0 ? `<p style="color:#9ca3af;text-align:center;padding:40px">No articles yet.</p>` : posts.map((article) => `
      <a href="/blog/${article.slug}" style="display:block;padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;margin-bottom:14px;transition:background .15s,transform .15s" onmouseover="this.style.background='rgba(255,255,255,.07)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,.04)';this.style.transform='none'">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:8px">${article.cluster}</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:21px;line-height:1.28;letter-spacing:-.03em;margin:0 0 10px;color:#f9fafb">${article.title}</h2>
        <p style="margin:0 0 10px;color:#9ca3af;font-size:14px;line-height:1.6">${article.description}</p>
        <span style="font-size:12px;color:#6b7280">${new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
      </a>`).join("");
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
        <p style="margin:0 0 12px;color:#9ca3af;font-size:14px;line-height:1.7">Use the free DeltaScreener interactive screener \u2014 no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "DeltaScreener Blog",
      description,
      url: canonicalUrl,
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      { "@type": "ListItem", position: 2, name: "Blog", item: canonicalUrl }
    ] }
  ];
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "stock investing guides, stock screening blog, ROE investing, DeltaScreener blog",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400"
    }
  });
}
__name(handleBlogIndex, "handleBlogIndex");
async function handleBlogSlug({ slug, env }) {
  let post = null, relatedPosts = [];
  try {
    post = await env.DB.prepare(`SELECT * FROM blog_posts WHERE slug = ?`).bind(slug).first();
    if (post) {
      const { results } = await env.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all();
      relatedPosts = results || [];
    }
  } catch (_) {
  }
  if (!post) {
    const bodyHtml2 = `<main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#0f1117;color:#f3f4f6">
      <div style="font-size:64px;margin-bottom:16px">\u{1F4C4}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
      <p style="color:#9ca3af;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
      <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700;font-size:15px">\u2190 Back to Blog</a>
    </main>`;
    return new Response(
      renderSpaShell({
        title: "Article Not Found | DeltaScreener",
        description: "This blog post could not be found.",
        canonicalUrl: `${SITE_ORIGIN}/blog`,
        robots: "noindex,nofollow",
        bodyHtml: bodyHtml2
      }),
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const title = `${post.title} | DeltaScreener`;
  let faqs = [];
  try {
    let raw = post.faqs || "[]";
    let parsed = JSON.parse(raw);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    faqs = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
  }
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      url: canonicalUrl,
      datePublished: post.published_at,
      dateModified: post.published_at,
      author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl }
    ] },
    ...faqs.length > 0 ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
    }] : []
  ];
  const relatedHtml = relatedPosts.length > 0 ? `
    <section style="margin-top:56px;padding-top:32px;border-top:1px solid rgba(255,255,255,.1)">
      <h3 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0 0 20px">Related Articles</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
        ${relatedPosts.map((r) => `
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>`).join("")}
      </div>
    </section>` : "";
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;border-radius:20px;background:#111827;border:1px solid rgba(45,212,191,.15);overflow:hidden">
      <div style="padding:24px 28px 20px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(45,212,191,.05)">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin:0;display:flex;align-items:center;gap:10px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:rgba(45,212,191,.15);color:#2dd4bf;font-size:16px;flex-shrink:0">?</span>
          Frequently Asked Questions
        </h2>
      </div>
      <div style="padding:8px 0">
        ${faqs.map((f, i) => `
          <div style="padding:20px 28px;${i < faqs.length - 1 ? "border-bottom:1px solid rgba(255,255,255,.05)" : ""}">
            <h3 style="font-size:15px;font-weight:700;color:#e5e7eb;margin:0 0 10px;line-height:1.4">${f.q}</h3>
            <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
          </div>`).join("")}
      </div>
    </section>` : "";
  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
      <div style="font-size:13px;color:#6b7280;margin-bottom:36px">Published ${formattedDate} \xB7 DeltaScreener</div>
      ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="${escapeHtml(post.title)}" style="width:100%;border-radius:16px;margin-bottom:36px;object-fit:cover;max-height:420px;display:block" loading="lazy">` : ""}
      <article style="font-size:16px;line-height:1.8;color:#d1d5db">
        ${markdownToHtml3(post.content || "")}
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
        <a href="/blog" style="color:#2dd4bf;font-weight:600;font-size:14px;text-decoration:none">\u2190 Back to Blog</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description: post.description,
    canonicalUrl,
    ogTitle: post.title,
    ogDescription: post.description,
    ogUrl: canonicalUrl,
    keywords: `${post.cluster}, stock screening, ${post.title}, DeltaScreener`,
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(handleBlogSlug, "handleBlogSlug");
async function onRequestGet34(ctx) {
  const url = new URL(ctx.request.url);
  const path = url.pathname;
  if (path === "/blog" || path === "/blog/") return handleBlogIndex(ctx);
  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "").replace(/\/$/, "");
    return handleBlogSlug({ slug, env: ctx.env });
  }
  const title = "DeltaScreener \u2014 Free US Stock Screener & Stock Analysis";
  const description = "Free US stock screener with 30+ filters, 10-year financials, and custom query language. Screen NYSE & NASDAQ stocks instantly. No sign-up required.";
  const homeBodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1120px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <div style="text-align:center;max-width:760px;margin:0 auto 64px">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:16px">Free US Stock Screener</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(36px,6vw,64px);line-height:1.05;letter-spacing:-.04em;margin:0 0 20px;color:#f9fafb">Screen 5,000+ US Stocks.<br>Find Better Investments.</h1>
        <p style="color:#9ca3af;font-size:18px;line-height:1.65;margin:0 0 32px">Filter NYSE &amp; NASDAQ stocks by ROE, P/E ratio, debt, revenue growth, and 30+ more metrics. No sign-up required.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:14px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:16px">Open Free Screener \u2192</a>
          <a href="/blog" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:14px;background:rgba(255,255,255,.06);color:#f9fafb;text-decoration:none;font-weight:700;font-size:16px;border:1px solid rgba(255,255,255,.1)">Investing Guides</a>
        </div>
      </div>
      <section style="margin-bottom:64px">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 24px;text-align:center">Popular Stock Screens</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
          ${[
    ["High ROE Stocks", "/stocks/high-roe-stocks", "Companies with Return on Equity above 20%"],
    ["Low Debt Stocks", "/stocks/low-debt-stocks", "Debt-to-equity ratio under 0.5"],
    ["Low P/E Stocks", "/stocks/low-pe-stocks", "Price-to-earnings ratio under 15"],
    ["NASDAQ Screener", "/screener?exchange=NASDAQ", "Filter NASDAQ-listed companies"],
    ["NYSE Screener", "/screener?exchange=NYSE", "Filter NYSE-listed companies"],
    ["Dividend Stocks", "/screener?dividendYield=2", "Stocks paying 2%+ dividend yield"]
  ].map(([name, href, desc]) => `
          <a href="${href}" style="display:block;padding:18px 20px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);text-decoration:none;transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background='rgba(255,255,255,.03)'">
            <div style="font-weight:700;color:#f9fafb;font-size:15px;margin-bottom:4px">${name}</div>
            <div style="color:#6b7280;font-size:13px;line-height:1.5">${desc}</div>
          </a>`).join("")}
        </div>
      </section>
      <section style="margin-bottom:64px">
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 24px;text-align:center">Why DeltaScreener?</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
          ${[
    ["30+ Screening Filters", "P/E, P/B, ROE, ROA, debt/equity, revenue growth, market cap, dividend yield, and more."],
    ["10-Year Financial History", "See a decade of income statements, balance sheets, and cash flow \u2014 free."],
    ["No Sign-Up Required", "Open the screener and start filtering immediately. No account needed."],
    ["Custom Query Language", 'Write advanced filters like: roe > 20 AND debtToEquity < 0.5 AND sector = "Technology".']
  ].map(([t, d]) => `
          <div style="padding:22px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)">
            <div style="font-weight:700;color:#2dd4bf;font-size:15px;margin-bottom:8px">${t}</div>
            <div style="color:#9ca3af;font-size:14px;line-height:1.65">${d}</div>
          </div>`).join("")}
        </div>
      </section>
      <section>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:28px;font-weight:700;color:#f9fafb;margin:0 0 20px;text-align:center">From the Blog</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
          ${[
    ["What Is ROE in Stocks?", "/blog/what-is-roe-in-stocks", "Stock Quality"],
    ["How to Screen Tech Stocks for Value", "/blog/how-to-screen-tech-stocks-for-value", "Tech Investing"],
    ["Warren Buffett Stock Screener", "/blog/warren-buffett-stock-screener", "Value Investing"]
  ].map(([t, href, cluster]) => `
          <a href="${href}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);text-decoration:none">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${t}</div>
          </a>`).join("")}
        </div>
      </section>
    </main>`;
  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "DeltaScreener",
      description,
      url: `${SITE_ORIGIN}/`,
      applicationCategory: "FinanceApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: "Is DeltaScreener free?", acceptedAnswer: { "@type": "Answer", text: "Yes, DeltaScreener is completely free. No sign-up or credit card required." } },
      { "@type": "Question", name: "What stocks does DeltaScreener cover?", acceptedAnswer: { "@type": "Answer", text: "DeltaScreener covers 5,000+ NYSE and NASDAQ listed US stocks with 30+ screening filters." } },
      { "@type": "Question", name: "What filters are available?", acceptedAnswer: { "@type": "Answer", text: "Filters include ROE, P/E ratio, P/B ratio, debt-to-equity, revenue growth, net margin, dividend yield, market cap, sector, and more." } }
    ] }
  ];
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl: `${SITE_ORIGIN}/`,
    keywords: "stock screener, free stock screener, US stock screener, NYSE screener, NASDAQ screener",
    jsonLd: homeJsonLd,
    bodyHtml: homeBodyHtml
  }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60, s-maxage=300" }
  });
}
__name(onRequestGet34, "onRequestGet");

// index.js
async function onRequestGet35() {
  const title = "DeltaScreener \u2014 Free US Stock Screener & Stock Analysis";
  const description = "Free US stock screener with 30+ filters, 10-year financials, and custom query language. Screen NYSE & NASDAQ stocks instantly. No sign-up required.";
  const keywords = "stock screener, free stock screener, US stock screener, stock analysis, NYSE screener, NASDAQ screener, financial ratios, DeltaScreener";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "DeltaScreener",
      url: `${SITE_ORIGIN}/`,
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_ORIGIN}/stock/{search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "DeltaScreener",
      url: `${SITE_ORIGIN}/`,
      logo: `${SITE_ORIGIN}/og-image.png`,
      sameAs: ["https://twitter.com/deltascreener"]
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "DeltaScreener",
      url: `${SITE_ORIGIN}/screener`,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      },
      description: "Free US stock screener with 30+ filters covering valuation, profitability, balance sheet, and income metrics for NYSE and NASDAQ stocks."
    }
  ];
  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:40px 16px 64px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:12px">Free US stock research</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(42px,7vw,72px);line-height:1;letter-spacing:-.05em;margin:0 0 12px;color:#f9fafb">DeltaScreener</h1>
      <p style="font-size:20px;font-weight:700;color:#2dd4bf;margin:0 0 14px">Better Signals. Better Stocks.</p>
      <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 28px;font-size:17px">${description}</p>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:52px">
        <a href="/screener" style="display:inline-flex;padding:13px 20px;border-radius:14px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:15px">Open Free Screener \u2192</a>
        <a href="/stock/AAPL" style="display:inline-flex;padding:13px 20px;border-radius:14px;border:1px solid #d1d5db;background:#0f1117;color:#f9fafb;text-decoration:none;font-weight:700;font-size:15px">View a Stock Page</a>
      </div>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 18px">What is DeltaScreener?</h2>
        <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0 0 14px">
          DeltaScreener is a free stock screener for US-listed equities on NYSE and NASDAQ. It lets you filter over 5,000 stocks using 30+ fundamental metrics \u2014 valuation ratios like P/E and P/B, quality metrics like ROE and ROA, balance sheet filters like Debt/Equity, and income metrics like Dividend Yield.
        </p>
        <p style="max-width:760px;line-height:1.75;color:#55606d;margin:0">
          Every screener result links to a full stock detail page with 10 years of annual financials, quarterly results, ratio history, peer comparisons, and news \u2014 no login or subscription needed.
        </p>
      </section>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 18px">Key features</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
          ${[
    ["30+ Screening Filters", "P/E, P/B, ROE, ROA, Net Margin, Debt/Equity, Market Cap, Dividend Yield, sector, and more.", "#eef8f5", "#0f766e"],
    ["5,000+ US Stocks", "Full NYSE and NASDAQ coverage with daily-updated fundamental data.", "#f0f4ff", "#2962ff"],
    ["10-Year Financial History", "Annual and quarterly data going back 10 years for every stock in the screener.", "#fef9ec", "#b45309"],
    ["No Sign-Up Required", "Open the screener and start filtering immediately. Free, with no account needed.", "#f0fdf4", "#15803d"],
    ["Custom Query Builder", "Combine any number of conditions with AND logic, then sort results by any metric.", "#fdf2f8", "#9333ea"],
    ["Curated Screen Pages", "Pre-built screens for High ROE, Low Debt, Dividend Stocks, Undervalued Tech, and more.", "#fff7ed", "#ea580c"]
  ].map(([label, desc, bg, color]) => `
            <article style="padding:20px;border-radius:16px;background:${bg};border:1px solid rgba(0,0,0,.06)">
              <strong style="display:block;font-size:15px;font-weight:800;color:${color};margin-bottom:6px">${label}</strong>
              <p style="margin:0;font-size:13px;line-height:1.65;color:#55606d">${desc}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section style="margin-bottom:52px">
        <h2 style="font-size:24px;font-weight:800;color:#f9fafb;letter-spacing:-.03em;margin:0 0 18px">Popular stock screener pages</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          ${[
    ["High ROE Stocks", "/stocks/high-roe-stocks"],
    ["Low Debt Stocks", "/stocks/low-debt-stocks"],
    ["Undervalued Tech Stocks", "/stocks/undervalued-tech-stocks"],
    ["Dividend Stocks", "/stocks/dividend-stocks"],
    ["Low PE Stocks", "/stocks/low-pe-stocks"],
    ["High Net Margin Stocks", "/stocks/high-net-margin-stocks"],
    ["Nasdaq High ROE Stocks", "/stocks/nasdaq-high-roe-stocks"],
    ["Low PB Stocks", "/stocks/low-pb-stocks"]
  ].map(([name, href]) => `
            <a href="${href}" style="display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:14px;background:#0f1117;color:#f9fafb;text-decoration:none;font-weight:700;font-size:14px">${name} \u2192</a>
          `).join("")}
        </div>
      </section>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl: `${SITE_ORIGIN}/`,
    keywords,
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet35, "onRequestGet");

// ../../../.wrangler/tmp/pages-saN9hC/functionsRoutes-0.9013240603730985.mjs
var routes = [
  {
    routePath: "/blog/_slug",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/blog/best-dividend-stock-screening-criteria",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/blog/best-free-stock-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/blog/debt-to-equity-ratio-explained",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/blog/dividend-stock-screener-guide",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/blog/growth-stocks-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet6]
  },
  {
    routePath: "/blog/high-roe-semiconductor-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet7]
  },
  {
    routePath: "/blog/how-to-build-a-stock-screen",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet8]
  },
  {
    routePath: "/blog/how-to-find-undervalued-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet9]
  },
  {
    routePath: "/blog/how-to-screen-tech-stocks-for-value",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/blog/how-to-screen-tech-stocks-for-value-2026",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/blog/low-debt-stocks-investing-guide",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/blog/nasdaq-high-roe-stocks-guide",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/blog/nasdaq-stock-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/blog/nasdaq-vs-nyse-stock-screening",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/blog/nyse-vs-nasdaq-stock-picking",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/blog/roe-and-debt-screening-strategy",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/blog/small-cap-stocks-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet18]
  },
  {
    routePath: "/blog/stock-screener-filters-explained",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet19]
  },
  {
    routePath: "/blog/stock-screener-for-beginners",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/blog/value-investing-stock-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/blog/warren-buffett-stock-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/blog/what-is-roa-in-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/blog/what-is-roe-in-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet24]
  },
  {
    routePath: "/blog/:slug",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet25]
  },
  {
    routePath: "/stock/:ticker",
    mountPath: "/stock",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet26]
  },
  {
    routePath: "/stocks/:slug",
    mountPath: "/stocks",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet27]
  },
  {
    routePath: "/screens/:slug*",
    mountPath: "/screens",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet28]
  },
  {
    routePath: "/blog",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet29]
  },
  {
    routePath: "/robots.txt",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet30]
  },
  {
    routePath: "/screener",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet31]
  },
  {
    routePath: "/sitemap.xml",
    mountPath: "/sitemap.xml",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet32]
  },
  {
    routePath: "/stocks",
    mountPath: "/stocks",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet33]
  },
  {
    routePath: "/:catchall*",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet34]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet35]
  }
];

// ../../../lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
