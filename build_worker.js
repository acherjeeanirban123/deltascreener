var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/gumroad-ping.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
__name(onRequestOptions, "onRequestOptions");
async function onRequestPost({ request, env: env2 }) {
  try {
    const ct = request.headers.get("content-type") || "";
    let data = {};
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await request.formData();
      for (const [k, v] of fd.entries()) data[k] = v;
    } else {
      data = await request.json().catch(() => ({}));
    }
    const email = (data.email || data.purchaser_email || "").toLowerCase().trim();
    const productId = data.product_id || data.product_permalink || "";
    const saleId = data.sale_id || data.subscription_id || "";
    const refunded = data.refunded === "true" || data.refunded === true;
    const cancelled = data.cancelled === "true" || data.cancelled === true || data.subscription_cancelled === "true";
    const reactivated = data.subscription_reactivated === "true";
    if (!email) return new Response("missing email", { status: 400, headers: CORS });
    const db = env2.DB;
    if (refunded || cancelled) {
      await db.prepare(
        `UPDATE pro_users SET status='cancelled', cancelled_at=datetime('now') WHERE email=?`
      ).bind(email).run();
    } else if (reactivated) {
      await db.prepare(
        `UPDATE pro_users SET status='active', cancelled_at=NULL WHERE email=?`
      ).bind(email).run();
    } else {
      await db.prepare(
        `INSERT INTO pro_users (email, status, product_id, sale_id, created_at)
         VALUES (?, 'active', ?, ?, datetime('now'))
         ON CONFLICT(email) DO UPDATE SET status='active', product_id=excluded.product_id, sale_id=excluded.sale_id, cancelled_at=NULL`
      ).bind(email, productId, saleId).run();
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");

// api/pro-status.js
var CORS2 = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
async function onRequestOptions2() {
  return new Response(null, { status: 204, headers: CORS2 });
}
__name(onRequestOptions2, "onRequestOptions");
async function onRequestGet({ request, env: env2 }) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("email") || "").toLowerCase().trim();
  if (!email) {
    return new Response(JSON.stringify({ pro: false }), {
      headers: { ...CORS2, "Content-Type": "application/json" }
    });
  }
  try {
    const row = await env2.DB.prepare(
      `SELECT status FROM pro_users WHERE email=? LIMIT 1`
    ).bind(email).first();
    const isPro = row?.status === "active";
    return new Response(JSON.stringify({ pro: isPro, status: row?.status || null }), {
      headers: { ...CORS2, "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ pro: false, error: e.message }), {
      headers: { ...CORS2, "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet, "onRequestGet");

// _lib/spa-shell.js
var SITE_ORIGIN = "https://deltascreener.com";
function renderSpaShell({ title, description, canonicalUrl, keywords = "", jsonLd = [], bodyHtml = "", robots = "index,follow", ogImage = "https://deltascreener.com/og-image.png" }) {
  const jsonLdStr = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
  const shellContent = bodyHtml ? `<div data-prerender-shell="1">${bodyHtml}</div>` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  ${keywords ? `<meta name="keywords" content="${keywords}" />` : ""}
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:site" content="@deltascreener" />
  <script type="application/ld+json">${jsonLdStr}<\/script>
  <link rel="icon" type="image/svg+xml" href="/favicon2.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/src/styles.css?v=20260704-fixes3" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-40Y2P275ZZ"><\/script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-40Y2P275ZZ', { send_page_view: false });
  <\/script>
</head>
<body>
  <script>try{document.body.setAttribute('data-theme',localStorage.getItem('theme')||'light')}catch(e){}<\/script>
  <div id="app">${shellContent}</div>
  <script type="module" src="/src/main2.js?v=20260704-fixes3"><\/script>
</body>
</html>`;
}
__name(renderSpaShell, "renderSpaShell");

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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Dividend Screening Criteria</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Income Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Best Dividend Stock Screening Criteria for Passive Income Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date("2026-05-31")).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 28px">The S&P 500's average dividend yield sits at just 1.05% as of May 2026 \u2014 near a multi-decade low. That makes screening for dividend stocks harder, not easier: with so many companies offering thin yields, you need precise criteria to separate sustainable income from yield traps. Here are the five filters that matter most.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">1. Dividend Yield: Target the 2\u20135% Range</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">A yield between 2% and 5% is typically the best starting point. It's meaningfully above the market average without triggering the warning signs that come with very high yields. Stocks yielding 6%, 8%, or more often do so because their share price has fallen \u2014 a potential sign that the market expects a dividend cut.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">This doesn't mean high-yield stocks are always bad. Utilities and REITs structurally pay higher dividends. But sector context matters \u2014 a 7% yield from a telecom is different from a 7% yield from a mid-cap industrial that cut earnings last quarter.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">2. Payout Ratio: The Most Important Safety Filter</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">The payout ratio tells you what percentage of earnings a company pays out as dividends. A ratio between 40% and 60% is healthy for most sectors \u2014 it means the company is sharing profits while retaining enough to reinvest and weather downturns. For utilities and REITs, 70\u201380% is acceptable given their regulated, stable cash flows.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">A payout ratio consistently above 80\u201390% is a red flag for most businesses. When earnings dip \u2014 which they always eventually do \u2014 there's no buffer. Companies in this position often face a dividend cut or a painful debt-funded payout that weakens the balance sheet over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">3. Debt-to-Equity: Low Debt Protects Dividends</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">High debt is one of the most common reasons dividends get cut. When interest costs climb or revenue dips, over-leveraged companies prioritize debt service over shareholder distributions. For non-financial, non-utility companies, a debt-to-equity ratio under 1.0 is a reasonable screen. For net-debt-to-capital, under 50% is a widely used threshold.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">This filter is especially important today. Rates have remained elevated compared to the near-zero era of the 2010s, which means the cost of carrying debt is real and ongoing. Companies that were fine with high leverage at 1% rates are under more pressure at 4\u20135%.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">4. Dividend Growth Rate: Look for 5%+ Annual Increases</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">A dividend that doesn't grow is a dividend that loses purchasing power. Inflation compounds over time, and a flat $1 dividend is worth less every year in real terms. Screening for companies with a 5-year dividend growth rate of at least 5% annually filters for businesses that are genuinely growing and have the confidence to return more capital each year.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">Companies with long records of consecutive annual dividend increases \u2014 Dividend Aristocrats have 25+ years \u2014 offer a different kind of signal. They've maintained payouts through recessions, rate cycles, and sector disruption. That track record isn't a guarantee, but it reflects management discipline that matters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">5. Free Cash Flow Coverage: The Real Dividend Backstop</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">Dividends are paid in cash, not reported earnings. A company can have positive net income and still pay dividends from borrowed money if its free cash flow (FCF) is weak. The most rigorous filter is to check whether dividends are covered by FCF \u2014 ideally at a 1.5x or better ratio. This means the company generates $1.50 in free cash flow for every $1 it pays in dividends.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">FCF coverage also tells you about future dividend growth capacity. A company with FCF well above its dividend has room to raise it. One barely covering its payout is in a more precarious position, regardless of what the earnings-based payout ratio shows.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">How to Screen for Dividend Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">You can apply these filters directly on DeltaScreener without signing up. The screener lets you combine yield ranges, payout ratio caps, debt-to-equity limits, and other fundamental filters across US-listed stocks in real time. Start with the <a href="/stocks/low-debt-dividend-stocks" style="color:#2563eb;font-weight:600">low debt dividend stocks screen</a> for a pre-built starting point, or build your own combination on the <a href="/screener" style="color:#2563eb;font-weight:600">free screener</a>.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 28px">The most durable dividend portfolios combine moderate yield with low debt and consistent cash flow. High yield alone is not a strategy \u2014 it's a starting point that needs the rest of these filters to become one.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">Frequently Asked Questions</h2>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">What is a good dividend yield to screen for?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">A yield between 2% and 5% is generally a sweet spot for most sectors. The S&P 500 average yield is around 1% as of 2026, so anything meaningfully above that deserves a closer look. Yields above 6\u20137% can signal dividend risk \u2014 always check the payout ratio before trusting a high yield.</p>
      </div>

      <div style="margin-bottom:24px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">What payout ratio is safe for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">For most companies, a payout ratio between 40% and 60% is considered healthy. REITs and utilities can sustain 70\u201380% due to stable cash flows. A ratio consistently above 80\u201390% is a red flag \u2014 it leaves little room for earnings shortfalls.</p>
      </div>

      <div style="margin-bottom:36px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Should I include debt filters when screening for dividend stocks?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Yes. High debt is one of the most common reasons dividends get cut. A debt-to-equity ratio under 1.0 is a reasonable starting filter for non-financial, non-utility sectors. Companies with net debt to capital below 50% tend to have more financial flexibility to maintain dividends through economic cycles.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt dividend stocks using yield, payout ratio, and debt filters \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px">
      <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
        <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
        <li style="color:#9ca3af">/</li>
        <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
        <li style="color:#9ca3af">/</li>
        <li style="color:#374151">Best Free Stock Screener</li>
      </ol>
    </nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Screener Guide</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Best Free Stock Screener for US Stocks in 2026</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 6 min read</p>

    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Finding a free stock screener that covers all the filters you need without hidden paywalls is harder than it sounds. Most tools limit their best filters to paid tiers or require an account just to see results. This guide covers what to look for \u2014 and why DeltaScreener is one of the few genuinely free options for US investors.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">What Makes a Good Free Stock Screener?</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">A useful free stock screener needs at least these capabilities:</p>
    <ul style="line-height:2;color:#374151;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Valuation filters</strong> \u2014 P/E, P/B, EV/EBITDA to find cheap or reasonably priced stocks</li>
      <li><strong>Profitability filters</strong> \u2014 ROE, ROA, net margin to identify quality businesses</li>
      <li><strong>Balance sheet filters</strong> \u2014 Debt/Equity, current ratio to spot financial strength</li>
      <li><strong>Growth filters</strong> \u2014 EPS growth, revenue growth to find expanding businesses</li>
      <li><strong>Market cap & exchange filters</strong> \u2014 NYSE vs NASDAQ, large cap vs small cap</li>
    </ul>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Beyond filters, a good screener gives you historical data \u2014 not just trailing twelve months. Seeing 5\u201310 years of financials tells you whether quality is consistent or just a one-year anomaly.</p>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">DeltaScreener: 30+ Filters, No Account Required</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px"><a href="/screener" style="color:#2563eb;font-weight:700">DeltaScreener</a> covers over 5,000 NYSE and NASDAQ stocks with 30+ fundamental filters and 10 years of annual financial data. Key features:</p>
    <ul style="line-height:2;color:#374151;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li>Filter by P/E, P/B, ROE, ROA, Net Margin, Debt/Equity, Dividend Yield, EPS Growth, Revenue Growth, Market Cap, and more</li>
      <li>Custom query language \u2014 combine any number of filters with AND logic</li>
      <li>Sort results by any metric</li>
      <li>Click any stock to see a full 10-year financial history</li>
      <li>No sign-up, no email, no credit card \u2014 completely free</li>
    </ul>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Popular Stock Screens to Try</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Here are some ready-made screens on DeltaScreener:</p>
    <div style="display:grid;gap:12px;margin:0 0 28px">
      <a href="/screens/high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">High ROE Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Quality companies with strong return on equity</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Low P/E Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Value stocks trading below market average</span></a>
      <a href="/screens/dividend-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Dividend Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Stocks with consistent dividend yield</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Undervalued Tech Stocks</strong> <span style="color:#6b7280;font-size:14px">\u2014 Tech stocks at reasonable valuations</span></a>
    </div>

    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Frequently Asked Questions</h2>
    <div style="border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin:0 0 32px">
      <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb">
        <strong style="color:#111827;display:block;margin-bottom:8px">What is the best free stock screener?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">DeltaScreener is one of the best free stock screeners with 30+ filters, 10-year financials, and no sign-up required. Others worth trying include Finviz (basic free tier) and Stock Analysis.</p>
      </div>
      <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb">
        <strong style="color:#111827;display:block;margin-bottom:8px">Can I screen stocks for free?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes. DeltaScreener is completely free \u2014 no account, no email, no credit card required. All 30+ filters and 5,000+ stocks are accessible instantly.</p>
      </div>
      <div style="padding:20px 24px">
        <strong style="color:#111827;display:block;margin-bottom:8px">Does DeltaScreener have a mobile version?</strong>
        <p style="margin:0;color:#6b7280;line-height:1.7;font-size:15px">Yes, DeltaScreener is fully responsive and works on mobile browsers without needing to install any app.</p>
      </div>
    </div>

    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Try DeltaScreener Free \u2192</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">Screen 5,000+ US stocks with 30+ filters. No account needed.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Debt-to-Equity Ratio</li>
        </ol>
      </nav>

      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Balance Sheet</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Debt-to-Equity Ratio Explained: Why the Balance Sheet Matters for Stock Pickers</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">The debt-to-equity ratio (D/E ratio) is one of the most important metrics on a company's balance sheet \u2014 yet many investors skip it in favor of flashier growth numbers. In an environment where corporate bankruptcies rose 14% year-over-year in Q1 2026, understanding how much debt a company carries relative to its equity could be the difference between a solid investment and a costly mistake.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">What Is the Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The debt-to-equity ratio compares a company's total liabilities to its shareholders' equity. The formula is straightforward:</p>
      <div style="background:#f3f4f6;border-radius:12px;padding:16px 20px;font-family:monospace;font-size:15px;color:#1f2937;margin:0 0 20px">D/E Ratio = Total Liabilities \xF7 Shareholders' Equity</div>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">If a company has $500 million in total debt and $250 million in shareholder equity, its D/E ratio is 2.0 \u2014 meaning it owes $2 for every $1 of equity owned by shareholders. The higher the ratio, the more leveraged the company is, and the more sensitive it is to economic downturns, rising interest rates, or a slowdown in revenue.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The ratio appears in a company's balance sheet, which is published quarterly in SEC filings and summarized on most financial data platforms.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">What Is a Good Debt-to-Equity Ratio?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">There is no single "good" D/E ratio that applies to every company, because different industries operate with fundamentally different capital structures. That said, there are useful benchmarks to keep in mind.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The S&P 500 average D/E ratio stood at <strong>0.61 as of Q4 2024</strong>, which is a reasonable anchor for large-cap US stocks. In general:</p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 1.0</strong> \u2014 Conservative. The company finances more of its operations with equity than debt. Often a sign of financial strength, particularly for technology, healthcare, and consumer discretionary companies.</li>
        <li style="margin-bottom:8px"><strong>1.0 to 2.0</strong> \u2014 Moderate. Acceptable for most industries. The company uses leverage, but not excessively. Warrants checking interest coverage to ensure cash flows cover debt payments.</li>
        <li style="margin-bottom:8px"><strong>Above 2.0</strong> \u2014 Elevated. Red flags in most sectors, though utilities, REITs, and telecoms routinely carry ratios of 2.5 or higher because their cash flows are predictable and stable.</li>
        <li style="margin-bottom:8px"><strong>Above 4.0</strong> \u2014 High risk. The company is predominantly financed by creditors. Requires exceptional and consistent cash generation to justify the leverage.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The key rule: <strong>always compare within the same industry</strong>. A software company with a D/E of 0.3 is unremarkable; the same ratio at a utility would suggest it is extremely underleveraged for its sector.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">Why Rising Rates Make D/E Ratio More Important</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">When interest rates rise, companies with heavy debt loads face a double hit: existing variable-rate debt becomes more expensive, and refinancing maturing debt costs more. This is precisely why corporate bankruptcy filings climbed to a 14-year high in 2024, and why Q1 2026 saw filings up 14% year-over-year. Elevated D/E ratios that looked manageable in a low-rate environment can become unsustainable when rates stay high for longer.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">For stock pickers, this means D/E ratio is not just a balance sheet checkbox \u2014 it is a forward-looking risk signal. A company with D/E of 3.0 may trade at an attractive P/E multiple precisely because the market is pricing in bankruptcy risk. That discount is not always a buying opportunity.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Two useful metrics to pair with D/E are the <strong>interest coverage ratio</strong> (EBIT divided by interest expense \u2014 above 3x is generally safe) and <strong>free cash flow</strong>. A company with high debt but strong, consistent free cash flow is in a very different position from one that is cash-flow negative.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">How to Screen for Low-Debt Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">You can <a href="/stocks/low-debt-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">screen for low debt-to-equity stocks on DeltaScreener</a> using the balance sheet filters in the free screener. A simple, effective starting screen might look like this:</p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">Debt/Equity &lt; 0.5</li>
        <li style="margin-bottom:8px">ROE &gt; 12%</li>
        <li style="margin-bottom:8px">Net Margin &gt; 8%</li>
        <li style="margin-bottom:8px">Market Cap &gt; $500M</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">This combination targets companies that are both financially conservative <em>and</em> profitable \u2014 not just companies that happen to have no debt because they cannot borrow. Adding a sector filter lets you compare only within your chosen industry, making the D/E signal much more meaningful.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">No sign-up required. You can run and save screens instantly on the <a href="/screener" style="color:#2563eb;font-weight:600;text-decoration:none">DeltaScreener free screener</a>.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;color:#111827;margin:40px 0 14px">Frequently Asked Questions</h2>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">What is a good debt-to-equity ratio?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">A D/E ratio below 1.0 is generally considered conservative and low-risk. Between 1.0 and 2.0 is acceptable for most industries. Above 2.0 warrants closer scrutiny, though capital-intensive sectors like utilities routinely carry higher ratios. The S&P 500 average D/E ratio was 0.61 as of Q4 2024.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:24px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">Does a high debt-to-equity ratio mean a stock is bad?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Not necessarily. Context matters enormously. A utility company with a D/E of 2.5 is operating normally for its sector; a software firm with the same ratio would raise red flags. Always compare D/E ratios within the same industry and check whether the company generates enough cash flow to service its debt comfortably.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:18px;margin-bottom:40px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">How do I find stocks with low debt-to-equity ratios?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Use DeltaScreener's free screener at deltascreener.com/screener. Set a maximum D/E filter and combine it with profitability metrics like ROE or net margin to find financially strong companies.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt stocks using the exact filters described above \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">Dividend Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Income Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Dividend Stock Screener: How to Find High-Yield US Dividend Stocks</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 6 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Dividend investing is one of the most reliable ways to build passive income from stocks. A dividend stock screener helps you systematically find US companies that pay consistent, growing dividends \u2014 without manually checking thousands of stocks.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Key Filters for Dividend Stock Screening</h2>
    <ul style="line-height:2;color:#374151;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>Dividend Yield &gt; 2%</strong> \u2014 Minimum threshold for meaningful income</li>
      <li><strong>Payout Ratio &lt; 70%</strong> \u2014 Ensures dividends are sustainable from earnings</li>
      <li><strong>ROE &gt; 10%</strong> \u2014 Companies with strong returns can sustain payouts</li>
      <li><strong>Debt/Equity &lt; 1.0</strong> \u2014 Low debt keeps dividend payments safer</li>
      <li><strong>EPS Growth &gt; 0</strong> \u2014 Growing earnings support growing dividends</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How to Screen for Dividend Stocks on DeltaScreener</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Open the <a href="/screener" style="color:#2563eb;font-weight:600">free screener</a> and set these filters: Dividend Yield &gt;= 2, Debt/Equity &lt;= 1, ROE &gt;= 10. Sort by Dividend Yield descending to find the highest-yielding qualifying stocks at the top.</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">You can also use the pre-built <a href="/screens/dividend-stocks" style="color:#2563eb;font-weight:600">Dividend Stocks screen</a> and <a href="/screens/low-debt-dividend-stocks" style="color:#2563eb;font-weight:600">Low Debt Dividend Stocks screen</a> for instant results.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">High Yield vs. Dividend Growth Stocks</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">High yield stocks pay more income now but may grow slower. Dividend growth stocks \u2014 companies raising dividends every year \u2014 may yield less initially but compound income over time. The best dividend stock screener lets you filter for both approaches. Try setting EPS Growth &gt; 10% alongside a moderate yield to find growth-oriented dividend payers.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Find Dividend Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">Filter 5,000+ US stocks by dividend yield, payout ratio, ROE and more.</p>
      <a href="/screens/dividend-stocks" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">View Dividend Stocks Screen \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "dividend stock screener, high yield stocks, dividend investing, free dividend screener, US dividend stocks", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet5, "onRequestGet");

// blog/high-roe-low-debt-stocks.js
async function onRequestGet6() {
  const title = "High ROE, Low Debt Stocks: The Quality Combination That Matters | DeltaScreener";
  const description = "Learn why combining high return on equity with low debt reveals truly exceptional businesses \u2014 and how to screen for these quality stocks free on DeltaScreener.";
  const slug = "high-roe-low-debt-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "High ROE, Low Debt Stocks: The Quality Combination That Matters",
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
        { "@type": "ListItem", position: 3, name: "High ROE Low Debt Stocks", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What ROE is considered high?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most analysts consider ROE above 15% solid, and above 20% excellent. The long-run median for S&P 500 companies sits around 13\u201315%, so a sustained ROE above 20% without heavy debt signals a genuinely competitive business."
          }
        },
        {
          "@type": "Question",
          name: "Why does debt inflate ROE?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ROE is net income divided by shareholders' equity. When a company takes on debt, equity shrinks relative to assets, so the same earnings produce a higher ROE number. A company with a 30% ROE but a debt-to-equity ratio of 3\xD7 is far riskier than one earning 20% ROE with no debt."
          }
        },
        {
          "@type": "Question",
          name: "What debt-to-equity ratio should I pair with ROE screening?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A debt-to-equity ratio below 0.5 is a common conservative threshold. For capital-light businesses like software or consumer brands, even below 0.3 is reasonable. Avoid using a single threshold for capital-intensive sectors like utilities or real estate, where moderate debt is structural."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">High ROE, Low Debt Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Investing \xB7 Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">High ROE, Low Debt Stocks: The Quality Combination That Matters</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">Return on equity (ROE) is one of the most-cited quality metrics in stock analysis \u2014 but used alone, it can mislead you. A high ROE that's built on a mountain of debt is fundamentally different from a high ROE earned through genuine business efficiency. Pairing ROE with a low debt filter is one of the cleanest ways to find companies that are truly exceptional rather than just financially engineered.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">Why ROE Alone Can Deceive You</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">ROE is calculated as net income divided by shareholders' equity. The formula is simple, but the math creates a trap: equity is what's left after you subtract liabilities from assets. A company that loads up on debt shrinks its equity base, which automatically pushes the ROE figure higher \u2014 even if actual profitability hasn't changed at all.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Consider two hypothetical companies, each earning $10 million in net income. Company A has $50 million in equity and no debt \u2014 ROE of 20%. Company B has $50 million in assets but $30 million in debt, leaving only $20 million in equity \u2014 ROE of 50%. On a raw screen, Company B looks dramatically better. But Company B carries three times the leverage and is far more vulnerable to a downturn, rising interest rates, or a disruption in its business model.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">This is why investors like Warren Buffett specifically look for companies that sustain high ROE <em>without</em> needing significant debt to do it. The S&P 500's long-run median ROE sits around 13\u201315%. A company that consistently earns 20%+ ROE with a debt-to-equity ratio below 0.5 is genuinely rare \u2014 and genuinely valuable.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">What the Combination Tells You About a Business</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">When a company earns a high ROE without borrowing heavily, it signals several things at once. First, the business has strong pricing power or cost efficiency \u2014 it's generating outsized profit relative to the capital its owners have put in. Second, management doesn't need to lever up the balance sheet to hit attractive return metrics. Third, the company has room to absorb shocks: it can service less debt, retain more earnings, or return capital to shareholders.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">These characteristics tend to cluster in specific types of businesses. Consumer brands with loyal customers and minimal capital requirements often show this profile \u2014 think companies with strong intellectual property, recurring revenue, or dominant market positions in niche categories. Capital-light technology and software businesses frequently exhibit it too, as do certain specialty industrials that have carved out defensible niches.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">By contrast, capital-intensive industries \u2014 utilities, steel, shipping, real estate \u2014 structurally require debt to fund their asset bases. For these sectors, applying a strict low-debt filter will screen out almost every company, including perfectly well-run ones. The high-ROE, low-debt combination works best as a filter within sectors where capital efficiency genuinely matters, or as a cross-sector quality signal when evaluated relative to industry norms.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">Practical Thresholds for Screening</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Most serious quality investors use thresholds somewhere in this range:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#374151">
        <li><strong>ROE \u2265 15%</strong> \u2014 the minimum bar. Below this, the business is earning roughly what a diversified equity portfolio might return passively.</li>
        <li><strong>ROE \u2265 20%</strong> \u2014 the quality bar. Companies consistently above this are genuinely outperforming on equity efficiency.</li>
        <li><strong>Debt-to-equity \u2264 0.5</strong> \u2014 a conservative starting point for non-financial sectors. This means debt is less than half of equity \u2014 a relatively lean balance sheet.</li>
        <li><strong>Debt-to-equity \u2264 1.0</strong> \u2014 a broader cut for sectors with moderate structural debt, like industrials or healthcare.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Consistency matters as much as the current number. A company that earned 25% ROE with low debt for five consecutive years is far more interesting than one that hit 30% once. Look for sustained, multi-year performance rather than a single-year spike that might reflect a one-time event or favorable market conditions.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">It also helps to layer in a minimum profitability filter \u2014 net margin above 10%, for instance \u2014 to ensure the ROE is driven by real earnings rather than by equity shrinkage from buybacks (another mechanism that can mechanically lift ROE without improving underlying returns).</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">How to Screen for These Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">You can <a href="/stocks/high-roe-stocks" style="color:#2563eb;font-weight:600;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> using the free, no-signup screener. Set the ROE filter to 20% or higher, then add a debt-to-equity filter at 0.5 or below. This combination will typically surface a focused list of 30\u201380 US stocks depending on market conditions \u2014 far more actionable than the thousands of names that pass a single-metric filter.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">From there, consider adding a market cap minimum (to filter out micro-caps with potentially volatile metrics) and sorting by ROE descending to see the strongest performers at the top. The results give you a starting universe for deeper research \u2014 not a buy list, but a curated shortlist of businesses that have demonstrated genuine capital efficiency without financial leverage distortion.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.02em;margin:40px 0 16px;color:#111827">FAQ</h2>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">What ROE is considered high?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">Most analysts consider ROE above 15% solid, and above 20% excellent. The long-run median for S&P 500 companies sits around 13\u201315%, so a sustained ROE above 20% without heavy debt signals a genuinely competitive business.</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">Why does debt inflate ROE?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">ROE is net income divided by shareholders' equity. When a company takes on debt, equity shrinks relative to assets, so the same earnings produce a higher ROE number. A company with a 30% ROE but a debt-to-equity ratio of 3\xD7 is far riskier than one earning 20% ROE with no debt at all.</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-bottom:40px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 8px">What debt-to-equity ratio should I pair with ROE screening?</p>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">A debt-to-equity ratio below 0.5 is a common conservative threshold. For capital-light businesses like software or consumer brands, even below 0.3 is reasonable. Avoid applying a single threshold to capital-intensive sectors like utilities or real estate, where moderate debt is structural.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 40px">The high-ROE, low-debt filter is one of the most durable quality screens in fundamental investing. It doesn't guarantee outperformance, and it works best as the start of a research process rather than the end of one. But as a first-pass filter for identifying businesses worth studying, it's hard to beat. Explore it further with the <a href="/screener" style="color:#2563eb;font-weight:600;text-decoration:underline">DeltaScreener free screener</a>.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROE, low-debt stocks free \u2014 no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "high ROE low debt stocks, return on equity stock screening, quality stocks filter, ROE debt to equity, stock screener quality",
    jsonLd,
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">High ROE Semiconductor Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Sector Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">High ROE Semiconductor Stocks: How to Screen the Chip Sector</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">Semiconductors are one of the most profitable sectors in the US market \u2014 and the data backs it up. According to NYU Stern's January 2026 sector analysis, the semiconductor industry averages a <strong>31.36% return on equity</strong>, well above the broad market average of 17.2%. For investors focused on capital efficiency, the chip sector deserves a close look.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#111827;margin:40px 0 12px">Why Semiconductors Tend to Generate High Returns on Equity</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Return on equity (ROE) measures how much profit a company generates for every dollar of shareholder equity. The semiconductor sector splits into two very different business models \u2014 and understanding the difference is critical before applying any ROE screen.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px"><strong>Fabless chip designers</strong> \u2014 companies that design chips but outsource manufacturing to foundries like TSMC \u2014 carry relatively small balance sheets. Because their equity base is modest compared to their earnings power, their ROE can be extraordinarily high. Some of the most well-known names in consumer chips, networking, and AI accelerators operate this way.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px"><strong>Integrated device manufacturers (IDMs)</strong> own their own fabrication plants, which requires billions in capital expenditure. This inflates the equity base and typically compresses ROE, even if absolute profits are large. When screening for capital-efficient chip stocks, fabless and asset-light models will naturally rise to the top.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#111827;margin:40px 0 12px">Valuation Context: Tech Trades at a Premium</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">High ROE doesn't automatically mean a stock is cheap. As of mid-2026, the S&P 500 Information Technology sector trades at a forward P/E of approximately <strong>28.3x</strong> \u2014 well above the broad S&P 500's forward P/E of around 21.2x. Semiconductor equipment makers (semiconductor equipment sector ROE: 35.8% per NYU Stern) often trade at even steeper multiples given their leverage to the AI and advanced-node capex cycle.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">This means a raw ROE filter alone isn't enough. A high ROE chip stock trading at 60x earnings requires sustained growth just to justify its price. Combining ROE with a P/E ceiling \u2014 say, ROE above 25% and P/E below 35x \u2014 narrows the field to names that are both capital-efficient and not already priced to perfection.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Net margin is another useful secondary filter. Chip designers with net margins consistently above 20% tend to have durable competitive positions \u2014 either through proprietary architectures, customer lock-in, or dominant market share in a specific end market.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#111827;margin:40px 0 12px">How to Build a Semiconductor Stock Screen</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">A practical screening approach for this sector might look like this:</p>
      <ul style="line-height:1.9;color:#374151;padding-left:24px;margin:0 0 20px">
        <li><strong>ROE \u2265 20%</strong> \u2014 captures companies generating strong returns on invested equity, filters out capital-heavy IDMs with compressed returns</li>
        <li><strong>Net margin \u2265 15%</strong> \u2014 identifies chip designers with real pricing power and cost discipline</li>
        <li><strong>Debt-to-equity \u2264 1.0</strong> \u2014 avoids over-leveraged names where high ROE is partly a function of financial engineering rather than operational strength</li>
        <li><strong>P/E \u2264 40x</strong> (optional) \u2014 adds a valuation guardrail so you're not buying quality at any price</li>
      </ul>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">This combination is intentionally strict. In a sector where valuations run high, it's reasonable to expect a shorter list of results \u2014 which is actually the point. You want stocks that clear a high bar on both quality and price.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 20px">You can <a href="/stocks/high-roe-stocks" style="color:#2563eb;font-weight:600;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> and layer in additional filters to narrow the results to the semiconductor names that best fit your criteria.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;color:#111827;margin:40px 0 12px">Frequently Asked Questions</h2>

      <h3 style="font-size:17px;font-weight:700;color:#111827;margin:24px 0 8px">What is a good ROE for a semiconductor company?</h3>
      <p style="line-height:1.75;color:#374151;margin:0 0 20px">The semiconductor sector averages around 31% ROE (January 2026, NYU Stern data). A chip stock with ROE above 25% is generally considered strong. Elite fabless designers can sustain ROE above 50% because their asset base is small relative to earnings.</p>

      <h3 style="font-size:17px;font-weight:700;color:#111827;margin:24px 0 8px">Why do semiconductor stocks have such high ROE?</h3>
      <p style="line-height:1.75;color:#374151;margin:0 0 20px">Fabless chip companies design chips but outsource manufacturing, so they carry minimal fixed assets. A large net income divided by a modest equity base produces a high ROE. Companies that own fabs have much larger equity bases and tend to show lower ROE despite being profitable.</p>

      <h3 style="font-size:17px;font-weight:700;color:#111827;margin:24px 0 8px">How do I screen for high ROE semiconductor stocks?</h3>
      <p style="line-height:1.75;color:#374151;margin:0 0 32px">Set a minimum ROE of 20\u201325%, filter by technology or semiconductor sector, and optionally add a debt-to-equity ceiling below 1.0. Free tools like DeltaScreener let you combine these filters instantly \u2014 no account required.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high ROE semiconductor and tech stocks using exact criteria \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">How to Build a Stock Screen</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Build a Stock Screen from Scratch: Combining ROE and Debt Filters for Better Results</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">Most investors know they should screen for quality stocks \u2014 but building a screen that actually narrows the field to useful candidates is harder than it looks. The key is choosing a small number of filters that work together, not against each other. Combining return on equity (ROE) with a debt-to-equity ceiling is one of the most effective starting points.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#111827">Why Most Screens Fail Before They Start</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The most common mistake when building a stock screen is stacking too many filters at once. An investor might screen for low P/E <em>and</em> high dividend yield <em>and</em> high ROE <em>and</em> low debt \u2014 and end up with three stocks, all in unusual niche industries. The screen technically "works," but it doesn't produce actionable results.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">A better approach is to build in layers. Start with one profitability filter and one balance sheet filter. These two dimensions \u2014 how well a company earns, and how safely it is financed \u2014 capture the essence of business quality without over-constraining the output. From there, add one valuation metric if needed.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">The S&P 500 has a broad range of ROE values by sector. Technology and consumer discretionary companies often run ROE above 20\u201330%, while utilities and materials companies may be in the single digits. This means sector context matters: a universal ROE threshold of 15% will filter differently depending on which part of the market you're scanning.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#111827">Building the Core Screen: ROE + Debt-to-Equity</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Here is a straightforward two-filter screen that works as a starting point for most market environments:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#374151">
        <li><strong>ROE \u2265 15%</strong> \u2014 filters for companies that generate meaningful profit from shareholder equity. This removes low-quality businesses that burn capital without producing returns.</li>
        <li><strong>Debt-to-equity \u2264 1.0</strong> \u2014 ensures the company is not over-leveraged. A D/E above 2.0 is common in some sectors but adds substantial risk during rate hikes or earnings slowdowns.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Together, these two filters look for companies that are both profitable and financially stable. The median debt-to-equity for S&P 500 companies has historically hovered around 1.0\u20131.5, so setting a ceiling of 1.0 already places you in the cleaner half of the index.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">Once you have this base screen running, look at what comes out. If you get more than 50\u201380 results, you can tighten ROE to 20% or lower D/E to 0.75. If you get fewer than 15, consider loosening one filter \u2014 or check whether your universe is too narrow to begin with.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#111827">Adding a Third Filter: Valuation or Growth</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Once the quality + balance sheet base is set, a third filter helps separate expensive quality from reasonably priced quality. Two common choices:</p>
      <ul style="margin:0 0 20px;padding-left:24px;font-size:16px;line-height:1.9;color:#374151">
        <li><strong>P/E below 25</strong> \u2014 useful when you're looking for value within the quality universe. Avoids paying a large premium for businesses the market already loves.</li>
        <li><strong>Revenue growth above 5% year-over-year</strong> \u2014 useful when you want companies that are expanding, not just profitable on a static basis.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">These two goals are often in tension: fast-growing companies tend to trade at higher P/E multiples. Choosing which direction to go depends on whether you're building a growth screen or a value screen. The ROE + D/E foundation works for both \u2014 the third filter just tilts the output.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">One practical tip: run the screen without the third filter first. Review the list. That review is itself part of the research process \u2014 you'll often notice industry clusters, outliers worth investigating, or sectors you want to exclude before applying any more filters.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,28px);letter-spacing:-.03em;line-height:1.2;margin:40px 0 16px;color:#111827">How to Run This Screen on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">You can <a href="/screener" style="color:#2563eb;text-decoration:underline">build a custom screen on DeltaScreener</a> using exactly these filters. Set ROE to a minimum of 15%, debt-to-equity to a maximum of 1.0, and add a P/E or revenue growth filter if desired. No account required \u2014 results update in real time across the full US market universe.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">If you want to start from a pre-built screen, the <a href="/stocks/high-roe-stocks" style="color:#2563eb;text-decoration:underline">high ROE stocks screener</a> already applies a quality filter that you can combine with additional criteria. You can also explore the <a href="/stocks/low-debt-high-roe" style="color:#2563eb;text-decoration:underline">low debt + high ROE</a> pre-set, which mirrors the two-filter strategy described above.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for stocks using ROE, debt-to-equity, P/E, and more \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(20px,3vw,26px);letter-spacing:-.03em;line-height:1.2;margin:48px 0 20px;color:#111827">Frequently Asked Questions</h2>

      <div style="border-top:1px solid #e5e7eb;padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 10px">What filters should I use when building a stock screen?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Start with profitability (ROE above 15%), then add a balance sheet filter (debt-to-equity below 1.0). From there, layer on a valuation metric like P/E or P/B depending on whether you're seeking growth or value.</p>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:24px 0">
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 10px">How many filters should a stock screen have?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Two to four filters is usually optimal. Too few and you'll have hundreds of results to sort through. Too many and you risk excluding solid companies for minor metric differences. Start with two, then adjust.</p>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:24px 0;border-bottom:1px solid #e5e7eb">
        <h3 style="font-size:16px;font-weight:700;color:#111827;margin:0 0 10px">What is a good ROE threshold for stock screening?</h3>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Most investors use ROE above 15% as a baseline for quality companies. Sectors like financials and utilities naturally run different ranges, so adjusting by sector context gives more accurate comparisons. For technology stocks, 20\u201325%+ is a reasonable bar.</p>
      </div>

      <p style="font-size:15px;line-height:1.7;color:#6b7280;margin:32px 0 0">Looking for more screening strategies? Browse all guides on the <a href="/blog" style="color:#2563eb;text-decoration:underline">DeltaScreener blog</a> or jump straight to the <a href="/screener" style="color:#2563eb;text-decoration:underline">free screener</a>.</p>
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
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">Undervalued Stocks</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Value Investing</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Find Undervalued Stocks Using a Stock Screener</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 7 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Undervalued stocks trade below their intrinsic value \u2014 meaning the market is pricing them cheaper than what the underlying business fundamentals suggest they're worth. Stock screeners make it possible to systematically find these opportunities across thousands of US stocks in seconds.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 1: Screen for Low P/E Ratio</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">The price-to-earnings ratio (P/E) is the most widely used valuation metric. A low P/E can indicate an undervalued stock \u2014 but only when earnings are real and recurring. Use the <a href="/screener" style="color:#2563eb;font-weight:600">DeltaScreener</a> to filter for P/E &lt; 15 on NYSE and NASDAQ stocks. Pair this with a minimum EPS to exclude loss-making companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 2: Check Price-to-Book (P/B) Ratio</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">The P/B ratio compares stock price to book value per share. Stocks trading below 1x book value are technically priced below their net assets. Filter for P/B &lt; 1.5 to find asset-heavy businesses potentially on sale. This works especially well for banks, industrials, and energy companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 3: Require Quality \u2014 ROE Filter</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Cheap stocks aren't always good stocks. Combine low valuation with a minimum ROE of 10\u201315% to ensure the business actually generates returns for shareholders. The <a href="/screens/undervalued-tech-stocks" style="color:#2563eb;font-weight:600">undervalued tech stocks screen</a> on DeltaScreener uses this exact combination.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Step 4: Check Balance Sheet Health</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">A stock might look cheap because it carries excessive debt. Always add a Debt/Equity filter (D/E &lt; 1.0 is a reasonable ceiling) when screening for undervalued stocks. High debt amplifies risk \u2014 especially when rates are elevated.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Ready-Made Undervalued Stock Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Low P/E + High ROE technology stocks on US exchanges</span></a>
      <a href="/screens/low-pe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Low P/E Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Broad value screen across all US sectors</span></a>
      <a href="/screens/low-pb-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Low P/B Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Stocks trading near or below book value</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Screen for Undervalued Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">Use DeltaScreener's 30+ filters to build your own undervalued stock screen in seconds.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "how to find undervalued stocks, undervalued stock screener, low PE stocks, value investing screener, P/E ratio screen", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet9, "onRequestGet");

// blog/how-to-read-a-balance-sheet-stocks.js
async function onRequestGet10() {
  const title = "How to Read a Balance Sheet as a Stock Investor | DeltaScreener";
  const description = "Learn how to read a company balance sheet to evaluate financial health. Understand assets, liabilities, equity, and key ratios \u2014 in plain English.";
  const slug = "how-to-read-a-balance-sheet-stocks";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "How to Read a Balance Sheet as a Stock Investor",
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
        { "@type": "ListItem", position: 3, name: "How to Read a Balance Sheet", item: canonicalUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the most important thing to look for on a balance sheet?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Focus on the relationship between total liabilities and shareholders' equity. A company with far more liabilities than equity carries higher financial risk. Also check current assets vs. current liabilities to assess short-term liquidity \u2014 if current liabilities exceed current assets, the company may struggle to meet near-term obligations."
          }
        },
        {
          "@type": "Question",
          name: "What is a good debt-to-equity ratio for a stock?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It depends heavily on the industry. Technology companies often maintain D/E ratios of 0.2\u20130.6, while utilities with stable cash flows may carry 1.0\u20132.0. As a general starting point, a D/E ratio below 1.0 signals conservative leverage, while above 2.0 warrants closer scrutiny \u2014 especially in cyclical sectors."
          }
        },
        {
          "@type": "Question",
          name: "Can a company have negative shareholders' equity?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, and it is not always a red flag. Some mature companies with large share buyback programs (like certain S&P 500 consumer staples) show negative book equity because buybacks reduce the equity line. However, negative equity caused by accumulated losses is a serious warning sign and requires investigation."
          }
        }
      ]
    }
  ];
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Balance Sheet Guide</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Read a Balance Sheet as a Stock Investor</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#1f2937;margin:0 0 24px">
        The balance sheet is one of three core financial statements every public company files \u2014 and for stock investors, it answers one fundamental question: <strong>does this company own more than it owes?</strong> Learning to read a balance sheet takes less time than most investors expect, and the insights it provides can separate a financially strong stock from a ticking liability bomb.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">The Three Sections: Assets, Liabilities, and Equity</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Every balance sheet is divided into three sections, and they always follow this identity: <strong>Assets = Liabilities + Shareholders' Equity</strong>. If you remember nothing else, remember this equation \u2014 it is the foundation of everything.
      </p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:10px"><strong>Assets</strong> are what the company owns or is owed: cash, inventory, property, patents, receivables. They are split into <em>current assets</em> (convertible to cash within 12 months) and <em>non-current assets</em> (long-term holdings like equipment or goodwill).</li>
        <li style="margin-bottom:10px"><strong>Liabilities</strong> are what the company owes: short-term debt, accounts payable, long-term bonds. Like assets, they split into current (due within a year) and non-current.</li>
        <li style="margin-bottom:10px"><strong>Shareholders' Equity</strong> is the residual \u2014 what would be left for investors if you subtracted all liabilities from all assets. It includes retained earnings, paid-in capital, and any accumulated losses.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        As of Q4 2025, US corporate bonds outstanding reached $11.5 trillion \u2014 a 3.5% year-over-year increase \u2014 reflecting how heavily American companies rely on debt financing. That makes balance sheet literacy more valuable than ever for individual investors trying to assess risk.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Key Ratios Derived from the Balance Sheet</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Raw numbers on a balance sheet are hard to interpret in isolation. Ratios give you context:
      </p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:14px"><strong>Debt-to-Equity (D/E) Ratio</strong> \u2014 Total debt divided by shareholders' equity. A D/E below 1.0 is generally conservative; above 2.0 signals significant leverage. Industry matters enormously: tech companies typically run D/E ratios of 0.2\u20130.6, while utilities with predictable cash flows often carry 1.0\u20132.0 without issue.</li>
        <li style="margin-bottom:14px"><strong>Current Ratio</strong> \u2014 Current assets divided by current liabilities. A ratio above 1.5 suggests the company can comfortably cover short-term obligations. Below 1.0 is a warning that the company may struggle to pay upcoming bills.</li>
        <li style="margin-bottom:14px"><strong>Book Value per Share</strong> \u2014 Shareholders' equity divided by shares outstanding. Comparing book value to market price gives you the Price-to-Book (P/B) ratio \u2014 a popular measure of whether a stock trades at a premium or discount to its net assets.</li>
        <li style="margin-bottom:14px"><strong>Asset Turnover</strong> \u2014 Revenue divided by total assets. Higher turnover means the company is efficiently using its asset base to generate sales \u2014 useful for comparing capital-intensive businesses.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        No single ratio tells the full story. A company with a high D/E ratio might also generate strong, stable cash flows that easily service its debt. Always read ratios alongside the income statement and cash flow statement.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Red Flags and Green Flags on a Balance Sheet</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Experienced investors train themselves to spot patterns quickly. Here are the most common signals:
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 8px"><strong>Green flags:</strong></p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:8px">Cash and short-term investments growing faster than debt</li>
        <li style="margin-bottom:8px">Retained earnings consistently increasing (profits being reinvested)</li>
        <li style="margin-bottom:8px">Current ratio comfortably above 1.5</li>
        <li style="margin-bottom:8px">Goodwill as a small percentage of total assets (limits impairment risk)</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 8px"><strong>Red flags:</strong></p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:20px;margin:0 0 16px">
        <li style="margin-bottom:8px">Total liabilities growing significantly faster than total assets</li>
        <li style="margin-bottom:8px">Accumulated deficit (negative retained earnings) with no clear path to profitability</li>
        <li style="margin-bottom:8px">Goodwill exceeding 40\u201350% of total assets \u2014 a risk if acquisitions underperform</li>
        <li style="margin-bottom:8px">Sudden spikes in receivables without a corresponding increase in revenue</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        In 2026, with corporate bond issuance running at a record pace \u2014 year-to-date issuance through May reached $1.23 trillion, up 21% year-over-year according to SIFMA data \u2014 scrutinizing debt growth on balance sheets is particularly important. Companies loading up on cheap (or not-so-cheap) debt to fund AI infrastructure buildouts may look asset-rich today but carry meaningful refinancing risk.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">How to Screen for Balance Sheet Strength on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        You do not need to manually pull every balance sheet to find financially strong companies. You can <a href="/stocks/low-debt-stocks" style="color:#2563eb;text-decoration:underline">screen for low-debt stocks on DeltaScreener</a> using balance sheet filters \u2014 set a maximum debt-to-equity ratio, combine it with a minimum current ratio, and instantly surface companies with conservative leverage profiles.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        For example, filtering for D/E below 0.5 alongside positive retained earnings and a current ratio above 1.5 is a quick way to build a watchlist of financially resilient businesses \u2014 the kind of companies that tend to survive recessions and market dislocations better than their more leveraged peers.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#111827;margin:40px 0 16px">Frequently Asked Questions</h2>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">What is the most important thing to look for on a balance sheet?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        Focus on the relationship between total liabilities and shareholders' equity. A company with far more liabilities than equity carries higher financial risk. Also check current assets vs. current liabilities to assess short-term liquidity \u2014 if current liabilities exceed current assets, the company may struggle to meet near-term obligations.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">What is a good debt-to-equity ratio for a stock?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        It depends heavily on the industry. Technology companies often maintain D/E ratios of 0.2\u20130.6, while utilities with stable cash flows may carry 1.0\u20132.0. As a general starting point, a D/E ratio below 1.0 signals conservative leverage, while above 2.0 warrants closer scrutiny \u2014 especially in cyclical sectors.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:0 0 8px">Can a company have negative shareholders' equity?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        Yes, and it is not always a red flag. Some mature companies with large share buyback programs show negative book equity because buybacks reduce the equity line. However, negative equity caused by accumulated losses is a serious warning sign and requires investigation.
      </p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        The balance sheet is not glamorous \u2014 it lacks the drama of earnings surprises or revenue growth headlines \u2014 but it is arguably the most honest snapshot of a company's financial reality. Making it a regular part of your stock research, alongside the <a href="/screener" style="color:#2563eb;text-decoration:underline">free DeltaScreener stock screener</a>, will give you an edge in identifying companies built to last.
      </p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt stocks by balance sheet strength \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "how to read a balance sheet, balance sheet investing, debt to equity ratio, current ratio stocks, balance sheet analysis, stock screener",
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

// blog/how-to-screen-tech-stocks-for-value.js
async function onRequestGet11() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Screening Tech Stocks for Value</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Sector Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">How to Screen Tech Stocks for Value: High ROE Technology Stocks Guide</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">Technology stocks tend to attract investors with two very different goals: growth at any price, and quality at a reasonable price. If you fall into the second camp, a simple ROE-and-valuation screen can cut through hundreds of names and leave you with a shorter, more investable list \u2014 without needing to read every 10-K.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Why Tech Stocks Tend to Have High ROE</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Return on equity (ROE) measures how much profit a company generates relative to the shareholders' equity on its balance sheet. Technology companies \u2014 especially software, platforms, and semiconductor IP businesses \u2014 tend to score well on this metric for a structural reason: they do not need to own factories, warehouses, or heavy machinery to scale revenue. Once the product is built, the marginal cost of serving an additional customer is close to zero.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The result is that earnings grow faster than book value, pushing ROE higher year after year. The S&P 500 Information Technology sector reported a net profit margin of roughly 29.7% in Q1 2026, up from 25.4% in Q1 2025 \u2014 a sign that operating leverage in the sector is still compounding. That profit flows through to equity holders without requiring proportional reinvestment in tangible assets.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The caveat: ROE can also look high because a company has bought back so many shares that its equity base has shrunk. A buyback-inflated ROE says something different about quality than one driven by genuine earnings growth. That is why ROE screens work best when combined with at least one supporting filter.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">The Three-Filter Tech Screen</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">A practical starting point for screening technology stocks for quality and value uses three filters together:</p>
      <ul style="line-height:1.9;color:#374151;margin:0 0 20px;padding-left:22px">
        <li style="margin-bottom:10px"><strong>Sector = Technology.</strong> This restricts the universe to companies whose primary business is in hardware, software, semiconductors, or tech services. It avoids situations where a high-ROE industrial company ends up in a "tech screen" because it has a strong software division.</li>
        <li style="margin-bottom:10px"><strong>ROE \u2265 18%.</strong> A threshold around 18\u201320% filters out low-quality or loss-making names while still leaving a reasonable number of results across large, mid, and small cap. You can tighten this to 25% or higher if you want only the top tier.</li>
        <li style="margin-bottom:10px"><strong>Debt-to-equity \u2264 2.0.</strong> This removes the most leveraged names, which is important because leverage inflates ROE. A company with $10 in assets, $8 in debt, and $2 in equity can show a 50% ROE on very modest earnings. The debt filter keeps the list grounded in genuine capital efficiency.</li>
      </ul>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">If you also want a valuation check, add <strong>P/E \u2264 30</strong> or <strong>P/B \u2264 10</strong> to the screen. The S&P 500 Information Technology sector's earnings growth rate has run above 50% year-over-year in recent quarters, which compresses forward multiples \u2014 meaning stocks that look expensive on trailing P/E may look more reasonable on a forward or PEG basis. Use a P/E cap as a rough filter, not a hard signal.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">What to Watch After the Screen</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Screeners surface candidates; they do not replace analysis. Once you have a short list of high-ROE tech stocks, there are a few things worth checking before going deeper.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px"><strong>Trend in ROE over 3\u20135 years.</strong> A company that has expanded ROE from 12% to 22% tells a very different story than one that has held flat at 20% or slipped from 35% to 18%. Improving ROE often reflects widening margins or more efficient capital use. Declining ROE can signal competitive pressure or balance-sheet erosion.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px"><strong>Stock-based compensation.</strong> Many technology companies pay employees heavily in equity. This does not show up as cash leaving the business, but it does dilute shareholders and affects the equity denominator in ROE. A company with strong reported ROE but heavy share issuance deserves a closer look at diluted earnings per share over time.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px"><strong>Capital expenditure trends.</strong> The AI investment cycle has pushed capex sharply higher for large platform companies. High and rising capex can compress free cash flow even when net income stays strong, which matters if you are thinking about sustainability of returns rather than just trailing ROE.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How to Use DeltaScreener for This</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">DeltaScreener has a pre-built page for exactly this filter combination. You can <a href="/stocks/high-roe-tech-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">screen for high ROE tech stocks on DeltaScreener</a> to see a live, auto-updated list of US technology stocks with ROE above 18% and debt-to-equity below 2. The page pulls from fresh data and updates automatically, so you do not need to run the screen manually each time.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">If you want to adjust the thresholds \u2014 for example, tightening ROE to 25% or adding a P/E cap \u2014 the <a href="/screener" style="color:#2563eb;font-weight:600;text-decoration:none">interactive screener</a> lets you build custom filter combinations from scratch with no sign-up required.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Frequently Asked Questions</h2>
      <div style="border-top:1px solid #e5e7eb;padding-top:20px">
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">What is a good ROE for a technology stock?</p>
          <p style="line-height:1.75;color:#374151;margin:0">For technology companies, an ROE above 18\u201320% is generally considered strong. Software and platform businesses often post ROE well above 30% because they require little physical capital to scale. Hardware and semiconductor firms tend to run lower. Context matters: compare within sub-sectors rather than using a single universal threshold.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">Should I use P/E or P/B when screening tech stocks for value?</p>
          <p style="line-height:1.75;color:#374151;margin:0">Both can be useful, but for technology stocks P/E is typically more informative than P/B. Tech companies often have low book value relative to earnings power because their main assets are intellectual property and talent, which do not appear on the balance sheet. A P/E screen combined with an ROE floor tends to surface higher-quality opportunities than a P/B screen alone.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">How do I avoid high-debt tech stocks when screening?</p>
          <p style="line-height:1.75;color:#374151;margin:0">Add a debt-to-equity filter alongside your ROE or P/E criteria. A debt-to-equity ratio below 1.5\u20132.0 removes the most leveraged names. This is important because ROE can be artificially inflated by leverage \u2014 a company with a lot of debt can show a high ROE even if its underlying business returns are modest.</p>
        </div>
      </div>

      <p style="line-height:1.75;color:#374151;margin:32px 0 24px">Screening for high-ROE technology stocks is a reasonable starting point for investors who want quality-focused exposure to the sector without overpaying. The filters above will not catch every great stock, and they will occasionally include ones you would reject on closer look \u2014 but they do remove most of the noise efficiently. The next step is always to dig into the individual names the screen surfaces.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROE technology stocks using live US market data \u2014 free, no sign-up required.</p>
        <a href="/stocks/high-roe-tech-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View High ROE Tech Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#fff;color:#2563eb;text-decoration:none;font-weight:800;font-size:14px;border:1px solid #2563eb">Open Custom Screener \u2192</a>
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
__name(onRequestGet11, "onRequestGet");

// blog/how-to-screen-tech-stocks-for-value-2026.js
async function onRequestGet12() {
  return Response.redirect(`${SITE_ORIGIN}/blog/how-to-screen-tech-stocks-for-value`, 301);
}
__name(onRequestGet12, "onRequestGet");

// blog/low-debt-stocks-investing-guide.js
async function onRequestGet13() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">Low Debt Stocks Guide</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Balance Sheet Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Low Debt Stocks: How a Strong Balance Sheet Protects Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">When markets get choppy, balance sheet quality quickly separates durable businesses from fragile ones. Companies with low debt can survive a revenue slowdown, keep investing, and sometimes acquire struggling competitors at a discount \u2014 all while highly leveraged peers scramble to service interest payments. Understanding how to screen for low-debt stocks is one of the most practical skills a long-term investor can develop.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">What the Debt-to-Equity Ratio Actually Measures</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The debt-to-equity (D/E) ratio divides a company's total debt by its shareholders' equity. A ratio of 0.5 means the company has 50 cents of debt for every dollar of equity. A ratio of 2.0 means debt is twice the equity base \u2014 a much more leveraged position.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">What counts as "low" depends heavily on the sector. Across 94 industry groups tracked in 2026, market debt-to-capital ratios range from roughly 2% in software companies all the way to 78% in capital-intensive manufacturing sectors like rubber and tire production. Technology companies such as Alphabet and Microsoft routinely carry D/E ratios well below 0.3, partly because they generate strong cash flows without needing large fixed-asset bases. Utilities, by contrast, often run D/E ratios above 1.0 \u2014 but that is generally acceptable because regulated utilities have predictable, contracted revenues that comfortably cover interest.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">The key takeaway: always compare a company's debt ratio against its own industry peers, not against some universal number.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Why Low-Debt Companies Tend to Be More Resilient</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Debt is a fixed obligation. When revenue falls during a recession or industry downturn, a company with heavy debt still owes interest and principal on schedule. If cash runs short, it may need to issue dilutive equity, sell assets at bad prices, or in the worst case face bankruptcy. None of those outcomes benefit shareholders.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">A company with minimal debt has the opposite problem \u2014 a good one. Its fixed costs are lower, so the same revenue drop is far less threatening. Beyond survival, low-debt companies often emerge from downturns stronger than before: they have the financial flexibility to hire talent that competitors are laying off, invest in R&D when peers are cutting budgets, or acquire distressed assets cheaply. This "optionality" is a real competitive advantage, even if it does not show up directly in earnings per share in a calm market.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">It is also worth noting that interest expense directly reduces pre-tax income. A company earning $100 million in operating income but paying $30 million in interest reports just $70 million in taxable income. Strip that leverage away and the same business looks considerably more profitable \u2014 which is why some investors screen for EBIT or operating income in addition to reported earnings when comparing highly leveraged and debt-free peers.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">How to Use Balance Sheet Filters in Stock Screening</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Effective balance sheet screening usually combines two or three filters rather than relying on D/E alone:</p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:10px"><strong>Debt-to-equity &lt; 0.5</strong> \u2014 a reasonable starting threshold for most non-financial sectors. Tighten to &lt;0.3 if you want genuinely fortress-like balance sheets.</li>
        <li style="margin-bottom:10px"><strong>Current ratio &gt; 1.5</strong> \u2014 confirms the company can cover short-term obligations without stress, even if D/E looks fine on paper.</li>
        <li style="margin-bottom:10px"><strong>Interest coverage &gt; 5x</strong> \u2014 operating income should comfortably exceed interest expense. Companies below 3x deserve extra scrutiny.</li>
        <li style="margin-bottom:10px"><strong>Positive free cash flow</strong> \u2014 a company generating consistent free cash flow is organically deleveraging over time, even if the debt balance has not changed yet.</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">Pairing these balance sheet filters with a profitability metric \u2014 return on equity above 15%, for instance \u2014 tends to surface companies that are not just debt-free but are actually efficient with the capital they do employ. That combination narrows a universe of thousands of stocks to a more manageable, higher-quality shortlist.</p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">You can <a href="/stocks/low-debt-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">screen for low debt stocks on DeltaScreener</a> \u2014 the page is pre-filtered by debt-to-equity ratio across the full US market, no sign-up required. From there you can layer in additional criteria like dividend yield or sector.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Frequently Asked Questions</h2>

      <div style="border-left:3px solid #2563eb;padding-left:20px;margin-bottom:28px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">What debt-to-equity ratio counts as "low debt"?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">A D/E ratio below 0.5 is generally considered low for most non-financial sectors. Technology companies often sit between 0.1 and 0.3. Context matters: utilities and REITs routinely exceed 1.0 because their cash flows are stable and predictable \u2014 that is not necessarily a red flag in those industries.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:20px;margin-bottom:28px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">Why do low-debt companies tend to outperform during downturns?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Lower fixed interest obligations mean a revenue drop is less likely to threaten solvency. These companies also retain flexibility to invest or acquire competitors when credit markets tighten and weaker peers are forced to sell assets at steep discounts.</p>
      </div>

      <div style="border-left:3px solid #2563eb;padding-left:20px;margin-bottom:40px">
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 8px">Can I screen for low-debt stocks for free?</p>
        <p style="font-size:15px;line-height:1.7;color:#374151;margin:0">Yes. DeltaScreener's <a href="/stocks/low-debt-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">low debt stocks screener</a> is free with no account required. You can also combine debt filters with other criteria on the <a href="/screener" style="color:#2563eb;font-weight:600;text-decoration:none">full screener</a>.</p>
      </div>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for low-debt US stocks using real balance sheet data \u2014 free, no sign-up required.</p>
        <a href="/stocks/low-debt-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View Low Debt Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:transparent;color:#2563eb;text-decoration:none;font-weight:800;font-size:14px;border:2px solid #2563eb">Open Full Screener \u2192</a>
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
__name(onRequestGet13, "onRequestGet");

// blog/nasdaq-high-roe-stocks-guide.js
async function onRequestGet14() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">NASDAQ High ROE Stocks</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">NASDAQ High ROE Stocks: A Practical Screening Guide</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">Return on equity (ROE) measures how efficiently a company turns shareholder capital into profit. When you combine that filter with an exchange filter \u2014 specifically NASDAQ \u2014 you're targeting a market dominated by capital-light, technology-driven businesses that structurally tend to produce high ROE. Here's how to think about that screen and why it works.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#111827;margin:40px 0 12px">Why Exchange Matters in a Stock Screen</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">The NYSE and NASDAQ are both U.S. equity exchanges, but they list very different types of companies. As of 2026, the NYSE hosts roughly 2,000 domestic companies with a combined market cap of about $38 trillion \u2014 the bulk of that in financials, industrials, energy, and consumer staples. NASDAQ lists over 3,000 companies and leans heavily toward technology, software, semiconductors, and biotech.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">That compositional difference matters when you're screening for quality metrics like ROE. A diversified financial on the NYSE carries a large asset base that naturally compresses ROE. A software company on NASDAQ might generate hundreds of millions in net income with very little equity on the balance sheet \u2014 producing ROE of 30%, 50%, or more.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">Filtering by exchange isn't a shortcut \u2014 it's a way to pre-select the universe of companies where a particular financial profile is more likely to appear.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#111827;margin:40px 0 12px">What Makes NASDAQ Companies Structurally High-ROE</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">ROE is calculated as net income divided by shareholders' equity. For ROE to be high, a company either needs strong earnings or a lean equity base \u2014 ideally both. NASDAQ-listed technology and software businesses often check both boxes:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Low asset intensity.</strong> A software company's main assets are its codebase and customer relationships \u2014 neither shows up as a large line item on the balance sheet. Contrast that with a manufacturer that must hold billions in property, plant, and equipment.</li>
        <li style="margin-bottom:8px"><strong>Recurring revenue with high margins.</strong> Subscription-based SaaS businesses can generate very high net margins (often 20\u201335%) at scale, which flows directly into stronger earnings and thus higher ROE.</li>
        <li style="margin-bottom:8px"><strong>Share buybacks over time.</strong> Many mature NASDAQ tech companies buy back stock aggressively, which reduces equity and mechanically lifts ROE \u2014 worth being aware of when interpreting the number.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">During the first half of 2025, NASDAQ outpaced the NYSE in IPO activity with 79 traditional listings raising roughly $9 billion \u2014 a signal that high-growth, capital-light businesses continue to prefer NASDAQ as their listing home.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#111827;margin:40px 0 12px">How to Build the Screen: NASDAQ + High ROE</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">A basic version of this screen uses three filters:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Exchange: NASDAQ</strong> \u2014 narrows the universe to ~3,000+ companies skewed toward tech and growth.</li>
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong> \u2014 a widely used threshold for capital efficiency. Raise to 20\u201325% if you want only elite earners.</li>
        <li style="margin-bottom:8px"><strong>Debt-to-equity \u2264 1.0</strong> \u2014 this is optional but important. A company can inflate ROE by taking on debt (more earnings, less equity). Adding a debt filter ensures the ROE is genuinely organic.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">From there, you can layer in market cap minimums (to avoid microcaps), net margin floors (to confirm profitability quality), or sector filters (to target pure software vs. hardware vs. biotech).</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">One caution: very high ROE (above 50%) deserves scrutiny. It could reflect genuine competitive advantage, but it can also indicate negative equity from large buybacks or leveraged capital structures. Always pair ROE with a debt check before drawing conclusions.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#111827;margin:40px 0 12px">How to Use DeltaScreener for This</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">You can <a href="/stocks/high-roe-stocks" style="color:#2563eb;text-decoration:underline">screen for high ROE stocks on DeltaScreener</a> and add an exchange filter to narrow to NASDAQ listings specifically. The screener lets you combine ROE, debt-to-equity, market cap, and sector filters in one view \u2014 no sign-up required.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">The results update with current fundamental data, so you're working with the latest reported figures rather than stale snapshots.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.02em;color:#111827;margin:40px 0 12px">FAQ</h2>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;margin-top:8px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Why do NASDAQ stocks tend to have higher ROE than NYSE stocks?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 24px">NASDAQ has a heavy concentration of technology, software, and biotech companies. These businesses are often capital-light \u2014 they generate earnings from intellectual property and recurring subscriptions rather than physical assets. Less equity on the balance sheet relative to earnings produces naturally higher ROE figures.</p>

        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">What is a good ROE threshold for NASDAQ stocks?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 24px">A general benchmark is 15% or higher. For NASDAQ tech and software stocks, many quality names exceed 20\u201330%. However, ROE above 50% should be cross-checked \u2014 it can result from high leverage rather than genuine profitability.</p>

        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">How is NASDAQ different from the NYSE for stock screening?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 8px">The NYSE lists around 2,000 companies with a combined domestic market cap of roughly $38 trillion, skewing toward industrials, financials, and blue chips. NASDAQ lists over 3,000 companies and is dominated by technology and growth names. Filtering by exchange lets you target different sectors and business models in your screen.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#374151;margin:32px 0 24px">The NASDAQ + high ROE combination is one of the more practical entry points for investors looking for quality businesses without having to manually comb through thousands of names. With the right filters in place, you can surface a shortlist of capital-efficient compounders \u2014 and then do the deeper fundamental work from there. <a href="/screener" style="color:#2563eb;text-decoration:underline">Start building your screen on DeltaScreener</a> today.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for NASDAQ high ROE stocks using these exact criteria \u2014 free, no sign-up required.</p>
        <a href="/stocks/high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Screen High ROE Stocks \u2192</a>
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
__name(onRequestGet14, "onRequestGet");

// blog/nasdaq-stock-screener.js
async function onRequestGet15() {
  const title = "NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free | DeltaScreener";
  const description = "Free NASDAQ stock screener with 30+ filters. Screen NASDAQ-listed stocks by P/E, ROE, market cap, growth and more. No sign-up required.";
  const slug = "nasdaq-stock-screener";
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: "NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free", description, url: canonicalUrl, datePublished: "2026-06-01", author: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }, publisher: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_ORIGIN}/blog` }, { "@type": "ListItem", position: 3, name: "NASDAQ Stock Screener", item: canonicalUrl }] }
  ];
  const bodyHtml = `
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">NASDAQ Screener</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Exchange Screening</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 5 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">The NASDAQ is home to over 3,000 stocks \u2014 dominated by technology, biotech, and high-growth companies. Screening NASDAQ stocks requires filters tuned for higher-growth, higher-valuation businesses compared to NYSE-listed companies.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">What Makes NASDAQ Stocks Different</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">NASDAQ stocks typically have higher P/E ratios than NYSE companies because they tend to be faster-growing. Technology, semiconductors, and biotech dominate the index. When screening NASDAQ stocks, consider using growth metrics (EPS growth, revenue growth) alongside quality filters rather than pure value screens.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Best Filters for NASDAQ Stock Screening</h2>
    <ul style="line-height:2;color:#374151;font-size:16px;padding-left:24px;margin:0 0 20px">
      <li><strong>ROE &gt; 15%</strong> \u2014 Quality filter for high-growth NASDAQ names</li>
      <li><strong>EPS Growth &gt; 10%</strong> \u2014 Identifies expanding businesses</li>
      <li><strong>Net Margin &gt; 15%</strong> \u2014 Software and tech businesses with strong economics</li>
      <li><strong>Market Cap &gt; $1B</strong> \u2014 Focus on established names with liquidity</li>
      <li><strong>Debt/Equity &lt; 1.5</strong> \u2014 NASDAQ firms can carry more debt if growth is strong</li>
    </ul>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Ready-Made NASDAQ Screens</h2>
    <div style="display:grid;gap:12px;margin:0 0 32px">
      <a href="/screens/nasdaq-high-roe-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">NASDAQ High ROE Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Quality NASDAQ companies by return on equity</span></a>
      <a href="/screens/high-roe-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">High ROE Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Technology sector quality screen</span></a>
      <a href="/screens/undervalued-tech-stocks" style="padding:16px 20px;border-radius:12px;border:1px solid #e5e7eb;background:#f9fafb;text-decoration:none;display:block"><strong style="color:#2563eb">Undervalued Tech Stocks</strong><span style="color:#6b7280;font-size:14px;display:block;margin-top:4px">Tech stocks at reasonable valuations</span></a>
    </div>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Screen NASDAQ Stocks Free \u2192</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">DeltaScreener covers all NASDAQ-listed stocks with 30+ filters. No account required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "NASDAQ stock screener, NASDAQ stocks filter, free NASDAQ screener, screen NASDAQ stocks, NASDAQ high ROE", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet15, "onRequestGet");

// blog/nasdaq-vs-nyse-stock-screening.js
async function onRequestGet16() {
  return Response.redirect(`${SITE_ORIGIN}/blog/nyse-vs-nasdaq-stock-picking`, 301);
}
__name(onRequestGet16, "onRequestGet");

// blog/nyse-vs-nasdaq-stock-picking.js
async function onRequestGet17() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">NYSE vs NASDAQ</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Exchange Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">When you screen US stocks, every result carries an exchange label \u2014 NYSE or NASDAQ. Most investors scroll past it. But for stock pickers who care about sector exposure, listing quality, and market structure, the exchange a company trades on tells you something real about what kind of business it is likely to be.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How the Two Exchanges Are Structured Differently</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The New York Stock Exchange and the Nasdaq Stock Market are the two largest equities exchanges in the world. Together they support a combined US stock market valued at roughly <strong>$69 trillion</strong> as of early 2026 \u2014 but they operate in meaningfully different ways.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The NYSE functions as an <strong>auction market</strong>. Buyers and sellers meet at a central point \u2014 historically a physical trading floor \u2014 and a designated market maker facilitates price discovery by matching orders directly. The process is designed to reduce volatility around the open and close, which matters for large institutional trades in high-volume stocks.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Nasdaq, by contrast, is a <strong>dealer market</strong>. Trades happen electronically through a network of competing market makers rather than at a single central point. There is no physical floor. This structure made Nasdaq the natural home for technology companies in the 1970s and 1980s, when many fast-growing businesses were too small or unconventional to meet NYSE listing requirements \u2014 and it shaped the DNA of both exchanges ever since.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">In practice, for most retail investors, the structural difference does not affect how you buy or sell a stock. But it does affect what kinds of companies tend to list where, and that has real consequences for stock screening.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Sector Composition: The Real Difference for Stock Pickers</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The practical implication of exchange history is sector skew. <strong>About 70% of S&P 500 companies are listed on the NYSE</strong>, including the majority of large-cap industrials, financials, healthcare, energy, and consumer staples names. These sectors tend to produce steady cash flows, pay dividends, and carry more leverage \u2014 traits that fit comfortably with NYSE's reputation as the home of established, institutional-grade companies.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Nasdaq skews heavily toward technology. The technology sector makes up approximately <strong>61% of the NASDAQ-100 by weight</strong>, and it drove 88% of the index's total return in 2025. That year, the NASDAQ-100 delivered a 21% total return, outpacing the S&P 500 by 3 percentage points \u2014 a gap that was almost entirely explained by tech sector performance.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">This has real implications for stock screens. If you run an ROE filter on the full US market without an exchange filter, you will likely see Nasdaq-heavy results \u2014 because technology companies structurally tend to produce higher returns on equity than capital-intensive industries. Adding an exchange filter changes the universe you are working within, and with it, the average quality characteristics of the results.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Listing Requirements: What They Signal About Quality</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Both exchanges have minimum listing requirements \u2014 thresholds for market cap, share price, profitability, and corporate governance. NYSE requirements are generally viewed as slightly more stringent overall, which is one reason it is associated with larger, more established companies. Nasdaq has three listing tiers \u2014 the Nasdaq Global Select Market, the Nasdaq Global Market, and the Nasdaq Capital Market \u2014 with descending requirements at each level.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Both exchanges require companies to maintain a minimum bid price of at least $1.00 per share. Companies that fall below this threshold are given a grace period to regain compliance \u2014 though recent rule changes in 2025 tightened the terms around reverse stock splits as a remediation tool on both exchanges.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">For stock pickers, the key takeaway is this: exchange membership alone is not a quality filter, but it is a useful proxy for the type of company you are likely to find. A stock on the NYSE main market is almost certainly a large or mid-cap business with sustained profitability. A stock on the Nasdaq Capital Market tier may be earlier-stage or carrying more risk.</p>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">That is why exchange-specific screens can be a useful complement to fundamental filters. An NYSE low-debt screen produces a different universe than a Nasdaq low-debt screen \u2014 not because debt-to-equity is calculated differently, but because the underlying companies are structurally different.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How to Use Exchange Filters in Your Stock Screen</h2>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">Exchange filters work best as a secondary constraint alongside primary fundamental filters, not as a standalone screen. Here are a few practical combinations worth trying:</p>
      <ul style="line-height:1.9;color:#374151;margin:0 0 20px;padding-left:22px">
        <li style="margin-bottom:10px"><strong>NASDAQ + High ROE:</strong> Narrows the Nasdaq universe to capital-efficient businesses, which tends to surface technology and software companies with strong underlying economics. You can <a href="/stocks/nasdaq-high-roe-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">screen for NASDAQ high ROE stocks on DeltaScreener</a> directly.</li>
        <li style="margin-bottom:10px"><strong>NYSE + Low Debt:</strong> Targets established companies with conservative balance sheets \u2014 a common starting point for dividend-focused or defensive investors. DeltaScreener's <a href="/stocks/nyse-low-debt-stocks" style="color:#2563eb;font-weight:600;text-decoration:none">NYSE low debt stocks page</a> runs this filter automatically.</li>
        <li style="margin-bottom:10px"><strong>Exchange + Sector:</strong> Layering an exchange filter on top of a sector filter (e.g., Nasdaq + Technology + ROE \u2265 20%) can reduce the universe to a manageable size without losing too much breadth.</li>
      </ul>
      <p style="line-height:1.75;color:#374151;margin:0 0 16px">The goal is not to pick stocks based on which exchange they trade on. The goal is to use exchange membership as one lens among many \u2014 a proxy for listing history, size, and sector \u2014 that makes your fundamental screens more coherent.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Frequently Asked Questions</h2>
      <div style="border-top:1px solid #e5e7eb;padding-top:20px">
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">Is NYSE or NASDAQ better for stock picking?</p>
          <p style="line-height:1.75;color:#374151;margin:0">Neither exchange is inherently better \u2014 it depends on your strategy. NYSE tends to list more established, dividend-paying companies in industrials, financials, and energy. NASDAQ skews toward technology and growth companies. Screening within a specific exchange can help when your strategy is built around the characteristics more common to one listing universe.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">Do stocks listed on NYSE vs NASDAQ perform differently?</p>
          <p style="line-height:1.75;color:#374151;margin:0">Performance differences are mostly explained by sector composition rather than the exchange itself. NASDAQ-listed stocks outperformed in 2025 largely because technology \u2014 which makes up about 61% of the NASDAQ-100 by weight \u2014 had a strong year. NYSE-listed stocks include more defensive and value-oriented sectors that behave differently across cycles.</p>
        </div>
        <div style="margin-bottom:24px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px;font-size:16px">Can I screen stocks by exchange on DeltaScreener?</p>
          <p style="line-height:1.75;color:#374151;margin:0">Yes. DeltaScreener supports exchange filters for both NYSE and NASDAQ. You can use the interactive screener to add an exchange condition alongside any other metric, or browse pre-built pages like NASDAQ high ROE stocks or NYSE low debt stocks directly.</p>
        </div>
      </div>

      <p style="line-height:1.75;color:#374151;margin:32px 0 24px">NYSE and NASDAQ are not interchangeable labels \u2014 they represent meaningfully different listing universes with different sector tilts, size distributions, and historical profiles. Understanding the difference helps you build tighter, more intentional stock screens rather than running filters against a mixed pool where the results are harder to interpret. Start with the fundamentals, then use exchange as a secondary lens to sharpen the universe you are working within.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for NYSE or NASDAQ stocks using ROE, debt, valuation, and sector filters \u2014 free, no sign-up required.</p>
        <a href="/stocks/nasdaq-high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">NASDAQ High ROE Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#fff;color:#2563eb;text-decoration:none;font-weight:800;font-size:14px;border:1px solid #2563eb">Open Custom Screener \u2192</a>
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
__name(onRequestGet17, "onRequestGet");

// blog/roe-and-debt-screening-strategy.js
async function onRequestGet18() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">ROE &amp; Debt Screening Strategy</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Screening Strategy</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Combining ROE and Debt Filters: A Smarter Stock Screening Strategy</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.8;color:#1f2937;margin:0 0 24px">There are over 6,000 publicly traded companies in the US market. Running a single filter narrows that list \u2014 but combining two complementary metrics like <strong>Return on Equity (ROE)</strong> and <strong>debt-to-equity ratio</strong> turns a broad universe into a focused watchlist of genuinely strong businesses. This guide walks through exactly how to do it, and why the combination works so well together.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Why Use Two Filters Instead of One?</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A single metric can mislead. A company with an outstanding ROE of 40% might look like a dream investment \u2014 until you discover it's achieved by loading up on debt. Leverage amplifies returns on equity mathematically, but it also amplifies risk. A company borrowing heavily to manufacture earnings growth is a fundamentally different (and riskier) proposition than one achieving the same ROE through genuine operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Conversely, a company with a pristine balance sheet and near-zero debt might score low on ROE simply because it holds large cash reserves it hasn't deployed yet. No single number tells the full story.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Pairing ROE with a debt filter addresses this directly. When a company achieves high ROE <em>and</em> maintains low leverage, there's a much higher probability the profitability is real, sustainable, and not borrowed against future risk.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Setting the Right Thresholds</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">There's no universal right answer, but here's a practical starting framework for US equities:</p>
      <ul style="font-size:16px;line-height:1.9;color:#374151;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong> \u2014 Filters out companies that are destroying or barely earning their cost of equity. For a tighter screen, raise this to 20%.</li>
        <li style="margin-bottom:8px"><strong>Debt-to-Equity \u2264 1.0</strong> \u2014 Keeps companies where total debt doesn't exceed shareholder equity. For a conservative screen, use 0.5 or lower.</li>
        <li style="margin-bottom:8px"><strong>Market cap \u2265 $500M</strong> \u2014 Optional, but helps exclude micro-caps with limited liquidity or data reliability.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">With these three inputs applied to the full US market, you'll typically move from 6,000+ stocks to somewhere between 150 and 400 candidates \u2014 a manageable list for deeper research. With the S&P 500 currently trading at a P/E ratio of around 25.6 (as of June 2026), disciplined screening on fundamentals matters more than ever for investors trying to find reasonably valued quality companies.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Sector Context: Don't Screen Blind</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Screening thresholds should be calibrated to the sector you're looking at. Capital-light software and consumer brands can deliver ROE well above 30% with minimal debt. Heavy-capital industries like utilities, telecommunications, and infrastructure typically carry higher debt loads structurally \u2014 comparing them on a flat 0.5 D/E filter would exclude most of the sector regardless of quality.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A practical approach: run your broad ROE + D/E screen first, then look at results by sector. If you notice a sector is entirely absent, consider whether your threshold is appropriate for that industry's typical capital structure \u2014 or whether that sector is genuinely avoiding your criteria for the wrong reasons.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Technology and healthcare tend to pass strict ROE + low-debt screens in relatively high numbers. Financials are a special case where debt-to-equity comparisons don't translate well \u2014 banks use leverage as a core business mechanic, not just a capital structure choice.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">Adding a Third Filter: Net Margin</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">Once you're comfortable with the two-filter approach, adding net margin as a third input meaningfully improves result quality. Net margin measures how much of each dollar of revenue a company actually retains as profit after all costs \u2014 it's a direct measure of operational efficiency.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">A three-filter screen combining:</p>
      <ul style="font-size:16px;line-height:1.9;color:#374151;margin:0 0 18px;padding-left:20px">
        <li style="margin-bottom:8px"><strong>ROE \u2265 15%</strong></li>
        <li style="margin-bottom:8px"><strong>D/E \u2264 1.0</strong></li>
        <li style="margin-bottom:8px"><strong>Net margin \u2265 10%</strong></li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">\u2026produces a list where profitability is confirmed at multiple levels: at the equity level (ROE), at the balance sheet level (D/E), and at the revenue level (net margin). Companies passing all three tend to be durable businesses with real competitive advantages \u2014 not one-time earners or firms temporarily inflated by financial engineering.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 18px">This is exactly the type of multi-factor screen you can run on DeltaScreener. You can <a href="/screener" style="color:#2563eb;text-decoration:none;font-weight:600">screen for high ROE, low debt stocks on DeltaScreener</a> with all three filters in seconds \u2014 free, no sign-up required.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;font-weight:700;letter-spacing:-.03em;margin:40px 0 14px;color:#111827">FAQ</h2>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">What is a good ROE threshold for stock screening?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">Most investors look for ROE above 15% as a starting point. ROE above 20% is generally considered strong. However, thresholds vary by sector \u2014 capital-light technology companies often achieve ROE of 30%+ while utilities and banks operate at lower levels. Always compare ROE within the same industry.</p>
      </div>

      <div style="margin-bottom:24px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">What debt-to-equity ratio is safe when screening stocks?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">A debt-to-equity ratio below 1.0 is considered conservative for most non-financial sectors. Many quality-focused screeners use 0.5 or lower as a filter. Context matters \u2014 some industries like utilities carry higher structural debt that should not automatically disqualify a company.</p>
      </div>

      <div style="margin-bottom:40px">
        <p style="font-size:16px;font-weight:700;color:#111827;margin:0 0 6px">Can I combine ROE and debt-to-equity filters for free?</p>
        <p style="font-size:15px;line-height:1.8;color:#374151;margin:0">Yes. DeltaScreener lets you filter US stocks by ROE, debt-to-equity, net margin, and dozens of other criteria for free with no sign-up required.</p>
      </div>

      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Screening is not a replacement for analysis \u2014 it's the front door to it. A well-constructed multi-factor screen cuts the universe down to a set of candidates worth spending time on. Start with ROE and debt, refine with margin, and you'll have a process that surfaces quality businesses consistently. <a href="/screener" style="color:#2563eb;text-decoration:none;font-weight:600">Open the free DeltaScreener screener</a> to apply these filters yourself.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high ROE, low debt US stocks \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
  <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
    <nav aria-label="Breadcrumb" style="margin-bottom:20px"><ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774"><li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li><li style="color:#9ca3af">/</li><li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li><li style="color:#9ca3af">/</li><li style="color:#374151">Filters Explained</li></ol></nav>
    <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Screener Education</div>
    <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Stock Screener Filters Explained: P/E, ROE, P/B and More</h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Updated June 2026 \xB7 8 min read</p>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 20px">Stock screener filters are ratios and metrics that let you narrow thousands of stocks down to a short list. Here's what each key filter means and how to use it effectively.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">P/E Ratio (Price-to-Earnings)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">P/E = Stock Price \xF7 Earnings Per Share. A low P/E suggests a stock is cheap relative to earnings. The S&P 500 average is around 20\u201325x. Screen for P/E &lt; 15 to find potential value stocks. Avoid very low P/E if earnings are declining \u2014 that's a value trap.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">ROE (Return on Equity)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">ROE = Net Income \xF7 Shareholders' Equity. It measures how efficiently a company generates profits from shareholder capital. ROE &gt; 15% is generally considered strong. Warren Buffett famously uses ROE as a primary quality filter. See the <a href="/screens/high-roe-stocks" style="color:#2563eb;font-weight:600">High ROE Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">P/B Ratio (Price-to-Book)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">P/B = Stock Price \xF7 Book Value Per Share. Stocks trading below 1x book value are priced below their net assets. Low P/B is most meaningful for financial, industrial, and energy stocks where assets dominate. See the <a href="/screens/low-pb-stocks" style="color:#2563eb;font-weight:600">Low P/B Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">Debt-to-Equity (D/E)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">D/E = Total Debt \xF7 Shareholders' Equity. A D/E below 0.5 indicates a conservatively financed business. High D/E amplifies risk \u2014 especially in rising rate environments. The <a href="/screens/low-debt-stocks" style="color:#2563eb;font-weight:600">Low Debt Stocks screen</a> sets D/E \u2264 0.5.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">ROA (Return on Assets)</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">ROA = Net Income \xF7 Total Assets. Unlike ROE, ROA is not inflated by leverage \u2014 making it useful for cross-sector comparisons. ROA &gt; 10% is excellent. See the <a href="/screens/high-roa-stocks" style="color:#2563eb;font-weight:600">High ROA Stocks screen</a>.</p>
    <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;letter-spacing:-.03em;margin:32px 0 12px;color:#111827">Net Margin</h2>
    <p style="line-height:1.8;color:#374151;font-size:16px;margin:0 0 16px">Net Margin = Net Income \xF7 Revenue. High net margin businesses like software, pharma, and luxury goods retain more of each dollar of revenue as profit. Screen for Net Margin &gt; 20% to find highly profitable businesses. See the <a href="/screens/high-net-margin-stocks" style="color:#2563eb;font-weight:600">High Net Margin Stocks screen</a>.</p>
    <div style="margin-top:40px;padding:24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
      <strong style="display:block;font-size:16px;color:#2563eb;margin-bottom:8px">Apply These Filters Now \u2192</strong>
      <p style="margin:0 0 14px;color:#374151;line-height:1.7;font-size:14px">DeltaScreener has all these filters built in \u2014 free, no sign-up required.</p>
      <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
    </div>
  </main>`;
  return new Response(renderSpaShell({ title, description, canonicalUrl, keywords: "stock screener filters, PE ratio explained, ROE stock screen, how to use stock screener, stock filter guide", jsonLd, bodyHtml }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" }
  });
}
__name(onRequestGet19, "onRequestGet");

// blog/what-is-roa-in-stocks.js
async function onRequestGet20() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">What Is ROA?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">What Is ROA in Stocks? Return on Assets Explained for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:17px;line-height:1.75;color:#374151;margin:0 0 24px">
        Return on Assets (ROA) is one of the clearest signals of how well a company actually runs its business. Unlike earnings per share, which can be engineered through buybacks, or ROE, which can be inflated by heavy borrowing, ROA cuts through to a simple question: for every dollar of assets this company controls, how much profit does it produce?
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">How ROA Is Calculated</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        The formula is straightforward:
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin:0 0 20px;font-family:monospace;font-size:15px;color:#111827">
        ROA = Net Income \xF7 Total Assets \xD7 100
      </div>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        If a company earns $500 million in net income and has $5 billion in total assets, its ROA is 10%. That 10% tells you the company generates ten cents of profit for every dollar of assets on its balance sheet \u2014 factories, inventory, cash, intellectual property, everything included.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Some analysts use operating income instead of net income to strip out the effect of interest expenses. Either version works, as long as you're consistent when comparing companies.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">What Is a Good ROA?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Context matters enormously here. Industries that require massive physical infrastructure \u2014 utilities, steel mills, airlines \u2014 will naturally have lower ROA because their asset base is enormous relative to their profits. A utility running at 2\u20133% ROA may be doing perfectly well. A software company at 2% ROA has a problem.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        As a rough general benchmark:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px"><strong>Below 5%:</strong> Acceptable for capital-intensive industries; weak for asset-light businesses</li>
        <li style="margin-bottom:8px"><strong>5\u201310%:</strong> Solid \u2014 the company is using its asset base efficiently</li>
        <li style="margin-bottom:8px"><strong>Above 10%:</strong> Strong \u2014 a sign of real competitive advantage or operating leverage</li>
        <li style="margin-bottom:8px"><strong>Above 15\u201320%:</strong> Exceptional \u2014 typically seen in software, consumer brands, or businesses with strong intangible assets</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Warren Buffett has long used ROE as a quality filter, preferring companies that sustain 15\u201320% returns on equity. ROA adds an important check on that \u2014 if ROE is high but ROA is low, it likely means the company is borrowing heavily to juice its equity returns. High ROA without excessive leverage is the quality signal serious investors look for.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">ROA vs. ROE: Which Should You Use?</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Both metrics measure profitability, but they answer slightly different questions. ROE tells you how much profit the company generates per dollar of shareholder equity. ROA tells you how much profit it generates per dollar of total assets \u2014 equity plus debt.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        The gap between the two reveals leverage. A company with 20% ROE and 12% ROA is using moderate debt to amplify returns. A company with 40% ROE and 4% ROA is heavily leveraged \u2014 the high ROE looks impressive on the surface, but it rests on a fragile foundation. In a downturn, that debt becomes a burden.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        For this reason, many quality-focused investors look at ROA first. It is harder to inflate and gives a cleaner picture of how efficiently management deploys the resources under its control. Companies that sustain high ROA over many years \u2014 10% or above through full economic cycles \u2014 tend to have genuine competitive advantages: pricing power, network effects, low-cost production, or strong brand loyalty.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">ROA Trends Matter as Much as the Number</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        A single year's ROA can be misleading. A company might have an exceptional quarter that inflates the annual figure, or a one-time asset write-down that suppresses it. What you want to see is consistency. A company that has maintained 10\u201315% ROA for five or ten consecutive years is demonstrating something real \u2014 durable operational excellence that doesn't depend on favorable conditions or accounting adjustments.
      </p>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        Conversely, a declining ROA trend is worth taking seriously. If a company's ROA has dropped from 14% three years ago to 7% today, the business may be adding assets (acquisitions, new plants, inventory build-up) faster than it can generate earnings from them \u2014 a warning sign about capital allocation.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">How to Screen for High-ROA Stocks on DeltaScreener</h2>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        You can <a href="/stocks/high-roa-stocks" style="color:#2563eb;font-weight:600">screen for high ROA stocks on DeltaScreener</a> using the ROA filter in the free screener. A practical starting setup for quality-focused investors:
      </p>
      <ul style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px;padding-left:24px">
        <li style="margin-bottom:8px">ROA \u2265 10% (filters for efficient asset use)</li>
        <li style="margin-bottom:8px">Debt-to-equity \u2264 1.0 (confirms the ROA isn't debt-driven)</li>
        <li style="margin-bottom:8px">Net margin \u2265 10% (pairs profitability with efficiency)</li>
        <li style="margin-bottom:8px">Market cap \u2265 $500M (filters for established businesses)</li>
      </ul>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 16px">
        This combination tends to surface companies with real competitive advantages rather than those simply operating with high leverage. No sign-up required \u2014 filters update in real time on the <a href="/screener" style="color:#2563eb;font-weight:600">DeltaScreener free screener</a>.
      </p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;letter-spacing:-.03em;color:#111827;margin:40px 0 16px">Frequently Asked Questions</h2>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">What is a good ROA for a stock?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">
        A ROA above 5% is generally considered decent, and above 10% is strong. Asset-light businesses like software companies often post ROA of 15\u201325%, while capital-intensive industries like utilities or manufacturers typically see 1\u20135%. Always compare within the same sector for meaningful benchmarking.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">What is the difference between ROA and ROE?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 20px">
        ROE measures profit relative to shareholders' equity, while ROA measures profit relative to total assets including debt. ROA is a purer measure of operational efficiency because it is not inflated by financial leverage \u2014 a company with high ROE but low ROA is likely using debt to amplify equity returns.
      </p>

      <h3 style="font-size:18px;font-weight:700;color:#111827;margin:24px 0 8px">Can you compare ROA across different industries?</h3>
      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">
        ROA comparisons are most meaningful within the same industry. A bank with 1% ROA may be excellent, while a software company with the same figure would be considered poor. Always benchmark ROA against sector peers rather than using a single universal threshold.
      </p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 32px">
        ROA is one of the most reliable filters for finding companies that genuinely earn their keep. Pair it with low leverage and consistent net margins, and you have a solid foundation for a quality-first investment screen. Head to the <a href="/screener" style="color:#2563eb;font-weight:600">DeltaScreener free screener</a> to run your own filters \u2014 no account needed.
      </p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROA stocks using these exact criteria \u2014 free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
__name(onRequestGet20, "onRequestGet");

// blog/what-is-roe-in-stocks.js
async function onRequestGet21() {
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
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#2563eb;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#2563eb;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">What Is ROE?</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Stock Quality</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">What Is ROE in Stocks? Why Return on Equity Matters for Investors</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener \xB7 ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <p style="font-size:16px;line-height:1.75;color:#374151;margin:0 0 24px">Return on equity (ROE) is one of the most widely used metrics for measuring how efficiently a company converts shareholder capital into profit. For investors learning to screen stocks, understanding ROE can help separate capital-efficient businesses from those that consume resources without generating proportionate returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How ROE Is Calculated</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Return on equity is calculated by dividing a company's net income by its average shareholders' equity, then expressing the result as a percentage:</p>
      <div style="background:#f8fafc;border-radius:12px;padding:20px 24px;margin:0 0 20px;border:1px solid #e2e8f0;font-family:monospace;font-size:15px;color:#1e293b">
        ROE = Net Income \xF7 Average Shareholders' Equity \xD7 100
      </div>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">For example: a company that earns $300 million in net income with $1.5 billion in equity has an ROE of 20%. That means for every dollar shareholders have invested, the company generated 20 cents of profit over the year.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Analysts sometimes use <em>average</em> equity (beginning plus ending, divided by two) rather than ending equity alone, to smooth out fluctuations during the year. Most financial data providers and screeners, including DeltaScreener, use trailing twelve-month figures.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">What Is a Good ROE?</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">As of January 2026, the average ROE across all US-listed companies tracked in the Damodaran dataset was <strong>17.2%</strong>. That figure gives a useful baseline, but the answer varies substantially by sector:</p>
      <ul style="margin:0 0 20px;padding-left:22px;color:#374151;font-size:15px;line-height:2">
        <li><strong>Software (System &amp; Application):</strong> ~30% average ROE \u2014 capital-light business models allow high returns on equity</li>
        <li><strong>Semiconductors:</strong> ~31% \u2014 strong intellectual property and recurring demand from tech supply chains</li>
        <li><strong>Financial Services (non-bank):</strong> ~29% \u2014 leverage-driven businesses can achieve high ROE even with thin margins</li>
        <li><strong>Utilities:</strong> ~10% \u2014 regulated, capital-intensive operations structurally constrain returns</li>
        <li><strong>Auto manufacturers:</strong> ~3% \u2014 thin margins and heavy asset bases keep ROE low even in strong years</li>
      </ul>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">A common rule of thumb: ROE above 15% signals a reasonably capital-efficient business in most sectors. Anything consistently above 20% is a high bar that relatively few companies sustain over time.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Why ROE Can Be Misleading \u2014 and How to Adjust for It</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">ROE has one well-known flaw: it can be inflated by debt. Because equity = assets minus liabilities, a company that borrows heavily has a smaller equity base \u2014 which makes its ROE look higher even if its actual profitability hasn't improved.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Consider two companies each earning $100 million in net income. Company A has $500 million in equity (ROE: 20%). Company B has $200 million in equity because it borrowed aggressively (ROE: 50%). Company B's ROE looks impressive, but its balance sheet carries more risk.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">The practical fix: always look at ROE alongside the <strong>debt-to-equity ratio</strong>. A stock with 25% ROE and debt-to-equity below 1 is a materially different proposition than one with 25% ROE and debt-to-equity of 4. The DuPont framework expands ROE into three components \u2014 net margin, asset turnover, and financial leverage \u2014 giving a clearer view of where the return is actually coming from.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">Return on assets (ROA) is another useful cross-check. Unlike ROE, ROA is not affected by capital structure, so a company with high ROE and high ROA simultaneously is typically generating genuine operating efficiency rather than leveraged returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">How to Use DeltaScreener to Find High-ROE Stocks</h2>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">The fastest way to apply these ideas is to run a pre-built screen. You can <a href="/stocks/high-roe-stocks" style="color:#2563eb;text-decoration:none;font-weight:600">screen for high ROE stocks on DeltaScreener</a> \u2014 the page shows US stocks with ROE of at least 18%, positive price-to-book, and debt-to-equity below 3, updated automatically.</p>
      <p style="font-size:15px;line-height:1.75;color:#374151;margin:0 0 16px">If you want to go deeper, the interactive screener lets you combine ROE with any other metric \u2014 for example, filtering for ROE above 20%, ROA above 10%, and net margin above 15% gives a much tighter list of companies with broad-based profitability rather than leverage-driven returns.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:26px;line-height:1.2;letter-spacing:-.03em;margin:36px 0 14px;color:#111827">Frequently Asked Questions</h2>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">What is a good ROE for a stock?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">A ROE of 15% or higher is generally considered good for most industries. The US market average across all sectors was about 17% as of early 2026. However, "good" varies by sector \u2014 capital-light businesses like software typically run 25\u201340%+ ROE, while capital-intensive industries like utilities or auto manufacturers often fall in the 10\u201315% range.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">Can ROE be misleading?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">Yes. A company can boost its ROE by taking on more debt, which reduces the equity base in the denominator without necessarily improving business quality. That is why it is important to look at ROE alongside the debt-to-equity ratio. A high ROE combined with low debt is a much stronger signal than high ROE with heavy leverage.</p>
      </div>

      <div style="margin-bottom:20px">
        <h3 style="font-size:17px;font-weight:700;color:#111827;margin:0 0 8px">How is ROE calculated?</h3>
        <p style="font-size:15px;line-height:1.75;color:#374151;margin:0">ROE is calculated by dividing net income by average shareholders' equity, then expressing the result as a percentage. For example, if a company earns $200 million in net income and has $1 billion in equity, its ROE is 20%.</p>
      </div>

      <p style="font-size:15px;line-height:1.75;color:#374151;margin:32px 0 0">ROE is a useful starting filter but works best as part of a broader checklist. Pair it with ROA, net margin, and debt metrics to get a fuller picture of whether a company's quality is genuine. Explore all these filters together on the <a href="/screener" style="color:#2563eb;text-decoration:none;font-weight:600">DeltaScreener free screener</a>.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Screen for high-ROE stocks with live data \u2014 filter by ROE, debt-to-equity, ROA, and more. Free, no sign-up required.</p>
        <a href="/stocks/high-roe-stocks" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;margin-right:10px">View High ROE Stocks \u2192</a>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#fff;color:#2563eb;text-decoration:none;font-weight:800;font-size:14px;border:1.5px solid #2563eb">Open Free Screener \u2192</a>
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
__name(onRequestGet21, "onRequestGet");

// blog/[slug].js
function markdownToHtml(md) {
  return md.replace(/^## (.+)$/gm, `<h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:36px 0 12px;line-height:1.2">$1</h2>`).replace(/^### (.+)$/gm, '<h3 style="font-size:18px;font-weight:700;color:#e5e7eb;margin:28px 0 8px">$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f3f4f6;font-weight:700">$1</strong>').replace(/^- (.+)$/gm, '<li style="margin-bottom:8px;color:#f3f4f6">$1</li>').replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:24px;margin:16px 0;color:#f3f4f6">$&</ul>').replace(/\n\n/g, '</p><p style="margin:0 0 20px;color:#f3f4f6;line-height:1.8">').replace(/^(?!<[h|u|l])(.+)$/gm, (m) => m.startsWith("<") ? m : m).replace(/^<\/p><p[^>]*>(<h[23])/gm, "$1").replace(/(<\/h[23]>)<\/p><p[^>]*>/gm, "$1").trim();
}
__name(markdownToHtml, "markdownToHtml");
async function onRequestGet22({ params, env: env2 }) {
  const slug = params.slug;
  let post = null;
  let relatedPosts = [];
  try {
    post = await env2.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first();
    if (post) {
      const { results } = await env2.DB.prepare(
        `SELECT slug, title, cluster, published_at FROM blog_posts
         WHERE slug != ? ORDER BY published_at DESC LIMIT 2`
      ).bind(slug).all();
      relatedPosts = results || [];
    }
  } catch (_) {
  }
  if (!post) {
    const notFoundHtml = `
      <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
      <main style="max-width:760px;margin:0 auto;padding:80px 16px;text-align:center;font-family:Inter,system-ui,sans-serif;background:#0f1117;color:#f3f4f6">
        <div style="font-size:64px;margin-bottom:16px">\u{1F4C4}</div>
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:36px;color:#f9fafb;margin:0 0 12px">Article not found</h1>
        <p style="color:#9ca3af;font-size:16px;margin:0 0 32px">This post may have moved or doesn't exist yet.</p>
        <a href="/blog" style="display:inline-flex;padding:12px 20px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:700;font-size:15px">\u2190 Back to Blog</a>
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
          <a href="/blog/${r.slug}" style="display:block;padding:20px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);text-decoration:none;transition:background .15s" onmouseover="this.style.background='rgba(255,255,255,.08)'" onmouseout="this.style.background='rgba(255,255,255,.04)'">
            <div style="font-size:11px;font-weight:800;letter-spacing:.10em;text-transform:uppercase;color:#2dd4bf;margin-bottom:6px">${r.cluster}</div>
            <div style="font-family:'IBM Plex Serif',Georgia,serif;font-size:16px;font-weight:600;color:#f9fafb;line-height:1.35">${r.title}</div>
          </a>
        `).join("")}
      </div>
    </section>` : "";
  const faqHtml = faqs.length > 0 ? `
    <section style="margin-top:48px;padding:28px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)">
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#f9fafb;margin:0 0 20px">Frequently Asked Questions</h2>
      ${faqs.map((f) => `
        <div style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.07)">
          <h3 style="font-size:16px;font-weight:700;color:#e5e7eb;margin:0 0 8px">${f.q}</h3>
          <p style="color:#9ca3af;font-size:15px;line-height:1.75;margin:0">${f.a}</p>
        </div>
      `).join("")}
    </section>` : "";
  const formattedDate = new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
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
      <div style="font-size:13px;color:#6b7280;margin-bottom:36px">Published ${formattedDate} \xB7 DeltaScreener</div>

      ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="width:100%;border-radius:16px;margin-bottom:36px;object-fit:cover;max-height:420px;display:block" loading="lazy">` : ""}

      <!-- Sticky top search bar: search US stocks (Apple, Microsoft, AAPL\u2026) -->
      <div id="blog-cta-bar" style="position:fixed;top:0;left:0;right:0;z-index:1000;background:#0f2620;border-bottom:1px solid rgba(45,212,191,.3);padding:10px 16px;display:flex;align-items:center;gap:12px;transform:translateY(-100%);transition:transform .3s ease">
        <span style="font-size:13px;font-weight:700;color:#2dd4bf;white-space:nowrap;flex-shrink:0">Search any US stock</span>
        <div style="position:relative;flex:1;max-width:520px;margin:0 auto">
          <input id="blog-stock-search" type="text" autocomplete="off" spellcheck="false"
            placeholder="e.g. Apple, AAPL, Microsoft\u2026"
            style="width:100%;box-sizing:border-box;padding:9px 14px;border-radius:10px;border:1px solid rgba(45,212,191,.35);background:#0a1814;color:#f3f4f6;font-size:14px;font-weight:500;outline:none" />
          <div id="blog-search-dd" role="listbox"
            style="display:none;position:absolute;top:calc(100% + 6px);left:0;right:0;background:#0f1a16;border:1px solid rgba(45,212,191,.25);border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.45);max-height:340px;overflow-y:auto;z-index:1001"></div>
        </div>
        <a href="/screener" style="padding:8px 14px;border-radius:10px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:13px;white-space:nowrap;flex-shrink:0">Screener \u2192</a>
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
            ? 'https://api.deltascreener.com' : 'https://screenerpro1-api.acherjeeanirban.workers.dev';
          var seq = 0, timer = null, first = '';
          function esc(s){ return String(s||'').replace(/[&<>"']/g, function(c){
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
          function go(t){ if(t) location.href = '/stock/' + encodeURIComponent(t); }
          function hide(){ dd.style.display='none'; dd.innerHTML=''; first=''; }
          function render(items, q){
            if(!items.length){
              dd.innerHTML = '<div style="padding:12px 14px;color:#9ca3af;font-size:13px">Press Enter to search "'+esc(q)+'"</div>';
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
      <\/script>

      <article style="font-size:16px;line-height:1.8;color:#f3f4f6">
        <p style="margin:0 0 20px;color:#f3f4f6;line-height:1.8">${markdownToHtml(post.content || "")}</p>
      </article>

      <!-- Mid-article CTA (inline, after article body) -->
      <div style="margin:40px 0;border-radius:16px;background:rgba(45,212,191,.08);border:1px solid rgba(45,212,191,.2);padding:22px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
        <div>
          <div style="font-size:13px;font-weight:700;color:#2dd4bf;margin-bottom:4px">\u{1F50D} Try it yourself</div>
          <div style="font-size:15px;font-weight:600;color:#f9fafb">Apply these filters on DeltaScreener \u2014 free, no sign-up</div>
        </div>
        <a href="/screener" style="flex-shrink:0;padding:10px 18px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:14px">Open Screener \u2192</a>
      </div>

      ${faqHtml}

      <div style="margin-top:48px;border-radius:20px;background:linear-gradient(135deg,#0f2620 0%,#0a1628 100%);border:1px solid rgba(45,212,191,.25);padding:32px">
        <div style="font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">Free Tool</div>
        <strong style="display:block;font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#f9fafb;margin-bottom:8px;line-height:1.3">Screen 5,000+ US Stocks Instantly</strong>
        <p style="margin:0 0 20px;color:#9ca3af;line-height:1.7;font-size:15px">Apply any filter from this guide \u2014 ROE, FCF, P/E, margins, and 30+ more. No sign-up required. Results in seconds.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border-radius:12px;background:#2dd4bf;color:#0f1117;text-decoration:none;font-weight:800;font-size:15px">Open Free Screener \u2192</a>
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
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
__name(onRequestGet22, "onRequestGet");

// stock/[ticker].js
var API_ORIGINS = [
  "https://api.deltascreener.com",
  "https://screenerpro1-api.acherjeeanirban.workers.dev"
];
function escapeHtml(v) {
  return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
__name(escapeHtml, "escapeHtml");
function render404(ticker) {
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:96px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:64px;font-weight:900;color:#e5e7eb;line-height:1;margin-bottom:16px">404</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:30px;color:#111827;margin:0 0 12px">Stock not found</h1>
      <p style="color:#6b7280;font-size:16px;margin:0 0 8px"><strong>${escapeHtml(ticker)}</strong> is not in our database.</p>
      <p style="color:#6b7280;font-size:15px;margin:0 0 32px">Check the ticker symbol or search for a different stock.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Open Screener</a>
        <a href="/" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Go Home</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title: `${escapeHtml(ticker)} \u2014 Stock Not Found | DeltaScreener`,
    description: `${ticker} could not be found in the DeltaScreener database.`,
    canonicalUrl: `${SITE_ORIGIN}/screener`,
    robots: "noindex,nofollow",
    bodyHtml
  }), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store"
    }
  });
}
__name(render404, "render404");
function fmt(v, decimals = 2) {
  if (v == null || v === "" || isNaN(v)) return "\u2014";
  return Number(v).toFixed(decimals);
}
__name(fmt, "fmt");
function fmtPct(v) {
  if (v == null || v === "" || isNaN(v)) return "\u2014";
  return Number(v).toFixed(2) + "%";
}
__name(fmtPct, "fmtPct");
function fmtPrice(v) {
  if (v == null || v === "" || isNaN(v)) return "\u2014";
  return "$" + Number(v).toFixed(2);
}
__name(fmtPrice, "fmtPrice");
function fmtMktCap(v) {
  if (v == null || isNaN(v)) return "\u2014";
  const n = Number(v);
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  return "$" + n.toFixed(0);
}
__name(fmtMktCap, "fmtMktCap");
function statRow(label, value) {
  return `<tr><td style="padding:10px 14px;color:#6b7280;font-size:14px;border-bottom:1px solid #f1f5f9;white-space:nowrap">${label}</td><td style="padding:10px 14px;font-weight:700;font-size:14px;color:#111827;border-bottom:1px solid #f1f5f9;text-align:right">${value}</td></tr>`;
}
__name(statRow, "statRow");
function extractCompanyName(overview, ticker) {
  if (overview?.name && overview.name !== ticker && overview.name.length > ticker.length + 1) {
    return overview.name;
  }
  const desc = overview?.description || "";
  if (desc.length > 10) {
    const m = desc.match(/^([\w\s,\.&']+?(?:Inc\.|Corp\.|Ltd\.|LLC|Co\.|plc|SE|AG|NV|SA|LP|PLC|Limited|Corporation|Company|Holdings|Group|Trust|Partners|Bancorp|Bancshares|Financial|Technologies|Solutions|Systems|Services|Networks|Communications|Pharmaceuticals|Therapeutics|Sciences|Energy|Industries|International|Enterprises|Properties|Realty|Capital)\.?)/);
    if (m) {
      const extracted = m[1].trim().replace(/\.$/, "");
      if (extracted.length > ticker.length + 2) return extracted;
    }
  }
  return null;
}
__name(extractCompanyName, "extractCompanyName");
var SECTOR_SLUG = {
  "Technology": "technology",
  "Healthcare": "healthcare",
  "Financial Services": "financial",
  "Energy": "energy",
  "Industrials": "industrial",
  "Consumer Cyclical": "consumer-cyclical",
  "Consumer Defensive": "consumer-defensive",
  "Utilities": "utility",
  "Real Estate": "real-estate",
  "Basic Materials": "basic-materials",
  "Communication Services": "communication"
};
var METRIC_SCREENS = [
  { key: "high-roe", label: "High ROE" },
  { key: "low-pe", label: "Low P/E" },
  { key: "high-net-margin", label: "High Net Margin" },
  { key: "dividend", label: "Dividend" },
  { key: "low-debt", label: "Low Debt" }
];
function renderScreenLinks(sector, exchange) {
  const sectorSlug = SECTOR_SLUG[sector];
  const links = [];
  for (const m of METRIC_SCREENS) {
    if (sectorSlug) {
      links.push({ href: `/stocks/${m.key}-${sectorSlug}-stocks`, label: `${m.label} ${sector} Stocks` });
    } else {
      links.push({ href: `/stocks/${m.key}-stocks`, label: `${m.label} Stocks` });
    }
  }
  const ex = String(exchange || "").toUpperCase();
  if (ex.includes("NASDAQ")) links.push({ href: "/stocks/nasdaq-high-roe-stocks", label: "Nasdaq High ROE Stocks" });
  else if (ex.includes("NYSE")) links.push({ href: "/stocks/nyse-high-roe-stocks", label: "NYSE High ROE Stocks" });
  links.push({ href: "/stocks", label: "All stock screens" });
  const chipStyle = "display:inline-block;padding:8px 14px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;text-decoration:none;font-size:13px;font-weight:600;color:#1d4ed8;box-shadow:0 1px 2px rgba(0,0,0,.04)";
  const chips = links.map((l) => `<a href="${escapeHtml(l.href)}" style="${chipStyle}">${escapeHtml(l.label)}</a>`).join("");
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Screens featuring this stock</h2>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
    </div>`;
}
__name(renderScreenLinks, "renderScreenLinks");
function renderRelatedBlock(ticker, sector, peers) {
  const list = (peers || []).filter((p) => p && p.ticker && p.ticker !== ticker).slice(0, 12);
  if (!list.length) return "";
  const cardStyle = "display:flex;flex-direction:column;gap:2px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;text-decoration:none;box-shadow:0 1px 2px rgba(0,0,0,.04)";
  const cards = list.map((p) => {
    const chg = p.changePct;
    const chgColor = chg != null && chg >= 0 ? "#16a34a" : "#dc2626";
    const chgTxt = chg != null ? `${chg >= 0 ? "+" : ""}${Number(chg).toFixed(2)}%` : "";
    return `<a href="/stock/${escapeHtml(p.ticker)}" style="${cardStyle}">
      <span style="font-weight:800;font-size:15px;color:#111827">${escapeHtml(p.ticker)}</span>
      <span style="font-size:13px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(p.name && p.name !== p.ticker ? p.name : p.industry || "")}</span>
      <span style="display:flex;gap:8px;align-items:baseline;margin-top:2px">
        ${p.currentPrice != null ? `<span style="font-weight:700;font-size:14px;color:#111827">${fmtPrice(p.currentPrice)}</span>` : ""}
        ${chgTxt ? `<span style="font-size:12px;font-weight:700;color:${chgColor}">${chgTxt}</span>` : ""}
      </span>
    </a>`;
  }).join("");
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Related ${escapeHtml(sector || "")} Stocks</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">${cards}</div>
    </div>`;
}
__name(renderRelatedBlock, "renderRelatedBlock");
var POPULAR_TICKERS = [
  ["AAPL", "Apple"], ["MSFT", "Microsoft"], ["NVDA", "NVIDIA"], ["GOOGL", "Alphabet"],
  ["AMZN", "Amazon"], ["META", "Meta"], ["TSLA", "Tesla"], ["AVGO", "Broadcom"],
  ["LLY", "Eli Lilly"], ["JPM", "JPMorgan"], ["V", "Visa"], ["XOM", "Exxon Mobil"],
  ["WMT", "Walmart"], ["UNH", "UnitedHealth"]
];
function renderPopularBlock(ticker, peers) {
  const peerSet = new Set((peers || []).map((p) => p && p.ticker).filter(Boolean));
  const list = POPULAR_TICKERS.filter(([t]) => t !== ticker && !peerSet.has(t)).slice(0, 10);
  if (!list.length) return "";
  const chipStyle = "display:inline-flex;padding:7px 12px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;text-decoration:none;font-size:13px;font-weight:600;color:#374151";
  const chips = list.map(([t, n]) => `<a href="/stock/${t}" style="${chipStyle}">${escapeHtml(n)} (${t})</a>`).join("");
  return `
    <div style="margin-bottom:32px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">Popular Stocks</h2>
      <div style="display:flex;flex-wrap:wrap;gap:10px">${chips}</div>
    </div>`;
}
__name(renderPopularBlock, "renderPopularBlock");
function fmtMillions(v, decimals = 1) {
  if (v == null || v === "" || isNaN(v)) return "—";
  const n = Number(v) * 1e6;
  if (Math.abs(n) >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return "$" + (n / 1e9).toFixed(decimals) + "B";
  if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(decimals) + "M";
  return "$" + n.toLocaleString("en-US");
}
__name(fmtMillions, "fmtMillions");
function lastOf(arr) {
  if (!Array.isArray(arr)) return null;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != null && !isNaN(arr[i])) return Number(arr[i]);
  }
  return null;
}
__name(lastOf, "lastOf");
function calcCagr(arr, maxYears = 5) {
  if (!Array.isArray(arr)) return null;
  const clean = arr.filter((v) => v != null && !isNaN(v)).map(Number);
  if (clean.length < 3) return null;
  const n = Math.min(maxYears, clean.length - 1);
  const start = clean[clean.length - 1 - n];
  const end = clean[clean.length - 1];
  if (start <= 0 || end <= 0) return null;
  return (Math.pow(end / start, 1 / n) - 1) * 100;
}
__name(calcCagr, "calcCagr");
function renderAboutSection(ticker, name, o, fin) {
  const deep = (o.mktCap || o.marketCap || 0) >= 15e9;
  const paras = [];
  if (o.description) paras.push(escapeHtml(o.description));
  const facts = [];
  if (o.ceo) facts.push(`led by CEO ${o.ceo}`);
  if (o.employees) facts.push(`employs ${Number(o.employees).toLocaleString()} people`);
  if (o.city || o.country) facts.push(`headquartered in ${[o.city, o.country].filter(Boolean).join(", ")}`);
  if (o.ipoDate) facts.push(`publicly traded since ${String(o.ipoDate).slice(0, 4)}`);
  if (facts.length) paras.push(escapeHtml(`${name} is ${facts.join(", ")}.`));
  const price = o.currentPrice || o.price;
  const val = [];
  if (price != null && (o.mktCap || o.marketCap)) val.push(`${name === ticker ? ticker : `${name} (${ticker})`} stock trades at ${fmtPrice(price)} with a market capitalization of ${fmtMktCap(o.mktCap || o.marketCap)}`);
  const mults = [];
  if (o.pe != null) mults.push(`a price-to-earnings (P/E) ratio of ${fmt(o.pe)}`);
  if (o.pb != null) mults.push(`price-to-book of ${fmt(o.pb)}`);
  if (o.ps != null) mults.push(`price-to-sales of ${fmt(o.ps)}`);
  if (mults.length) val.push(`the stock is valued at ${mults.join(", ")}`);
  if (o.high52 != null && o.low52 != null && price != null) {
    const offHigh = (o.high52 - price) / o.high52 * 100;
    val.push(`over the past 52 weeks the stock has ranged between ${fmtPrice(o.low52)} and ${fmtPrice(o.high52)}, and currently trades ${offHigh <= 1 ? "at" : fmt(offHigh, 1) + "% below"} its 52-week high`);
  }
  if (o.dividendYield != null && o.dividendYield > 0) val.push(`it pays a dividend yielding ${fmtPct(o.dividendYield)}`);
  if (val.length) paras.push(escapeHtml(val.join(". ").replace(/\. the/g, ". The").replace(/\. over/g, ". Over").replace(/\. it/g, ". It") + "."));
  const prof = [];
  if (o.roe != null) prof.push(`a return on equity (ROE) of ${fmtPct(o.roe)}${o.roe > 20 ? " — well above the market average, a sign of a high-quality business" : o.roe > 12 ? ", above the typical market average" : ""}`);
  if (o.roce != null) prof.push(`return on capital employed of ${fmtPct(o.roce)}`);
  if (o.opMargin != null) prof.push(`an operating margin of ${fmtPct(o.opMargin)}`);
  if (o.netMargin != null) prof.push(`a net profit margin of ${fmtPct(o.netMargin)}`);
  if (prof.length) paras.push(escapeHtml(`On profitability, ${name} generates ${prof.join(", ")}.`));
  if (deep && fin && fin.annual) {
    const a = fin.annual;
    const rev = lastOf(a.sales);
    const np = lastOf(a.netProfit);
    const revCagr = calcCagr(a.sales);
    const npCagr = calcCagr(a.netProfit);
    const g = [];
    if (rev != null) g.push(`${name} reported annual revenue of ${fmtMillions(rev)}`);
    if (np != null) g.push(`net profit of ${fmtMillions(np)}`);
    if (revCagr != null) g.push(`revenue has compounded at ${fmt(revCagr, 1)}% a year over the last five years`);
    if (npCagr != null) g.push(`profit at ${fmt(npCagr, 1)}% a year`);
    if (g.length) paras.push(escapeHtml(`In its most recent fiscal year, ${g.join(", ")}.${revCagr != null && npCagr != null && npCagr > revCagr ? " Profit growing faster than revenue points to expanding margins." : ""}`));
  }
  if (deep) {
    const b = [];
    if (o.debtToEquity != null) b.push(`a debt-to-equity ratio of ${fmt(o.debtToEquity)}${o.debtToEquity < 0.5 ? " — a conservative balance sheet with little leverage risk" : o.debtToEquity > 2 ? " — a leveraged balance sheet worth monitoring" : ""}`);
    if (o.currentRatio != null) b.push(`a current ratio of ${fmt(o.currentRatio)}`);
    if (fin && fin.balance) {
      const assets = lastOf(fin.balance.totalAssets);
      const cash = lastOf(fin.balance.cash);
      if (assets != null) b.push(`total assets of ${fmtMillions(assets)}`);
      if (cash != null) b.push(`${fmtMillions(cash)} in cash and equivalents`);
    }
    if (b.length) paras.push(escapeHtml(`The balance sheet shows ${b.join(", ")}.`));
  }
  if (deep) {
    const tr = [];
    if (o.avgVolume) tr.push(`an average daily trading volume of ${Number(o.avgVolume).toLocaleString()} shares`);
    if (o.beta != null) tr.push(`a beta of ${fmt(o.beta)}${o.beta > 1.3 ? " (more volatile than the overall market)" : o.beta < 0.8 ? " (less volatile than the overall market)" : ""}`);
    if (o.sharesOutstanding) tr.push(`${(o.sharesOutstanding / 1e9).toFixed(2)}B shares outstanding`);
    if (tr.length) paras.push(escapeHtml(`${ticker} has ${tr.join(", ")}.`));
  }
  if (!paras.length) return "";
  const pStyle = "color:#374151;font-size:15px;line-height:1.75;margin:0 0 14px";
  return `
    <section style="margin-bottom:32px;max-width:820px">
      <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 12px">About ${escapeHtml(name)}</h2>
      ${paras.map((p) => `<p style="${pStyle}">${p}</p>`).join("")}
      ${o.website ? `<p style="${pStyle}">Official website: <a href="${escapeHtml(o.website)}" rel="nofollow noopener" target="_blank" style="color:#2563eb">${escapeHtml(String(o.website).replace(/^https?:\/\//, ""))}</a></p>` : ""}
    </section>`;
}
__name(renderAboutSection, "renderAboutSection");
function renderStockShell(ticker, overview, fin, peers, opts) {
  const o = overview || {};
  const noindex = opts && opts.noindex;
  const rawName = extractCompanyName(o, ticker);
  const name = rawName || ticker;
  const displayName = rawName || ticker;
  const price = o.currentPrice || o.price;
  const changePct = o.changePct;
  const changeSign = changePct != null && changePct >= 0 ? "+" : "";
  const changeColor = changePct != null && changePct >= 0 ? "#16a34a" : "#dc2626";
  const valuationRows = [
    statRow("Price", fmtPrice(price)),
    statRow("Market Cap", fmtMktCap(o.mktCap || o.marketCap)),
    statRow("P/E Ratio", fmt(o.pe)),
    statRow("P/B Ratio", fmt(o.pb)),
    statRow("P/S Ratio", fmt(o.ps)),
    statRow("EPS (TTM)", o.epsTtm != null ? "$" + fmt(o.epsTtm) : "\u2014"),
    statRow("52-Week High", fmtPrice(o.high52)),
    statRow("52-Week Low", fmtPrice(o.low52)),
    statRow("Dividend Yield", fmtPct(o.dividendYield))
  ].join("");
  const financialRows = [
    statRow("ROE", fmtPct(o.roe)),
    statRow("ROA", fmtPct(o.roa)),
    statRow("ROCE", fmtPct(o.roce)),
    statRow("Gross Margin", fmtPct(o.grossMargin)),
    statRow("Operating Margin", fmtPct(o.opMargin)),
    statRow("Net Margin", fmtPct(o.netMargin)),
    statRow("Debt/Equity", fmt(o.debtToEquity)),
    statRow("Current Ratio", fmt(o.currentRatio))
  ].join("");
  const tableStyle = "width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)";
  const thStyle = "padding:12px 14px;text-align:left;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0";
  const descLead = o.description ? String(o.description).split(/(?<=\.)\s+/).slice(0, 2).join(" ") : "";
  const descriptionText = descLead ? `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 32px;max-width:760px">${escapeHtml(descLead)}</p>` : "";
  let annualTableHtml = "";
  if (fin && fin.annual && fin.annual.headers && fin.annual.headers.length) {
    const a = fin.annual;
    const years = a.headers.slice(-5);
    const startIdx = a.headers.length - years.length;
    const fmtNum = /* @__PURE__ */ __name((arr, i) => fmtMillions(arr?.[startIdx + i]), "fmtNum");
    const fmtPctArr = /* @__PURE__ */ __name((arr, i) => {
      const v = arr?.[startIdx + i];
      return v == null || isNaN(v) ? "\u2014" : Number(v).toFixed(1) + "%";
    }, "fmtPctArr");
    const tdS = "padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600";
    const td1S = "padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#6b7280;white-space:nowrap";
    const thSA = "padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right";
    const metrics = [
      { label: "Revenue", arr: a.sales, fmt: fmtNum },
      { label: "Operating Profit", arr: a.opProfit, fmt: fmtNum },
      { label: "Net Profit", arr: a.netProfit, fmt: fmtNum },
      { label: "EPS", arr: a.eps, fmt: /* @__PURE__ */ __name((arr, i) => {
        const v = arr?.[startIdx + i];
        return v == null || isNaN(v) ? "\u2014" : "$" + Number(v).toFixed(2);
      }, "fmt") },
      { label: "Op Margin", arr: a.opm, fmt: fmtPctArr }
    ];
    const headerCols = years.map((y) => `<th style="${thSA}">${y}</th>`).join("");
    const bodyRows = metrics.map(
      (m) => `<tr><td style="${td1S}">${m.label}</td>${years.map((_, i) => `<td style="${tdS}">${m.fmt(m.arr, i)}</td>`).join("")}</tr>`
    ).join("");
    annualTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Annual Financials (USD)</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Metric</th>${headerCols}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`;
  }
  let balanceTableHtml = "";
  if (fin && fin.balance && fin.balance.headers && fin.balance.headers.length) {
    const b = fin.balance;
    const years = b.headers.slice(-5);
    const startIdx = b.headers.length - years.length;
    const fmtNum = /* @__PURE__ */ __name((arr, i) => fmtMillions(arr?.[startIdx + i]), "fmtNum");
    const tdS = "padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:right;color:#111827;font-weight:600";
    const td1S = "padding:9px 12px;font-size:13px;border-bottom:1px solid #f1f5f9;text-align:left;color:#6b7280;white-space:nowrap";
    const thSA = "padding:9px 12px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:right";
    const metrics = [
      { label: "Total Assets", arr: b.totalAssets },
      { label: "Total Liabilities", arr: b.totalLiabilities },
      { label: "Cash", arr: b.cash },
      { label: "Borrowings", arr: b.borrowings }
    ];
    const headerCols = years.map((y) => `<th style="${thSA}">${y}</th>`).join("");
    const bodyRows = metrics.map(
      (m) => `<tr><td style="${td1S}">${m.label}</td>${years.map((_, i) => `<td style="${tdS}">${fmtNum(m.arr, i)}</td>`).join("")}</tr>`
    ).join("");
    balanceTableHtml = `
      <div style="margin-bottom:32px">
        <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Balance Sheet (USD)</h2>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)">
            <thead><tr><th style="${thSA};text-align:left">Metric</th>${headerCols}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </div>
      </div>`;
  }
  const bodyHtml = `
    <main style="max-width:1120px;margin:0 auto;padding:32px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">${escapeHtml(o.exchange || "Stock")} \xB7 ${escapeHtml(o.industry || "Stock Research")}</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,48px);line-height:1.08;letter-spacing:-.03em;margin:0 0 12px;color:#111827">${escapeHtml(displayName)} (${escapeHtml(ticker)}) Stock</h1>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:20px">
        ${price != null ? `<span style="font-size:28px;font-weight:900;color:#111827">${fmtPrice(price)}</span>` : ""}
        ${changePct != null ? `<span style="font-size:15px;font-weight:700;color:${changeColor}">${changeSign}${fmt(changePct)}%</span>` : ""}
        <span style="padding:6px 12px;border-radius:999px;background:#eef8f5;color:#2563eb;font-weight:700;font-size:13px">${escapeHtml(o.exchange || "NYSE/NASDAQ")}: ${escapeHtml(ticker)}</span>
        ${o.sector ? `<span style="padding:6px 12px;border-radius:999px;background:#f1f5ff;color:#2563eb;font-weight:700;font-size:13px">${escapeHtml(o.sector)}</span>` : ""}
      </div>
      ${descriptionText}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:32px">
        <div>
          <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Valuation</h2>
          <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Metric</th><th style="${thStyle};text-align:right">Value</th></tr></thead><tbody>${valuationRows}</tbody></table>
        </div>
        <div>
          <h2 style="font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#374151;margin:0 0 10px">Financials &amp; Margins</h2>
          <table style="${tableStyle}"><thead><tr><th style="${thStyle}">Metric</th><th style="${thStyle};text-align:right">Value</th></tr></thead><tbody>${financialRows}</tbody></table>
        </div>
      </div>
      ${annualTableHtml}
      ${balanceTableHtml}
      ${renderAboutSection(ticker, displayName, o, fin)}
      ${renderRelatedBlock(ticker, o.sector, peers)}
      ${renderPopularBlock(ticker, peers)}
      ${renderScreenLinks(o.sector, o.exchange || o.exchangeShortName)}
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Run Stock Screener</a>
        <a href="/blog" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Investing Guides</a>
      </div>
    </main>`;
  const seoYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
  const priceTxt = price != null ? fmtPrice(price) : null;
  const title = rawName ? priceTxt ? `${ticker} Stock Price ${priceTxt} \u2014 ${rawName} P/E, ROE & Financials ${seoYear} | DeltaScreener` : `${rawName} (${ticker}) Stock Price, P/E, ROE & Financials ${seoYear} | DeltaScreener` : priceTxt ? `${ticker} Stock Price ${priceTxt} \u2014 P/E, ROE & Financials ${seoYear} | DeltaScreener` : `${ticker} Stock Price, P/E, ROE & Financials ${seoYear} | DeltaScreener`;
  const descSnippets = [];
  if (o.pe != null) descSnippets.push(`P/E ${fmt(o.pe)}`);
  if (o.roe != null) descSnippets.push(`ROE ${fmtPct(o.roe)}`);
  if (o.netMargin != null) descSnippets.push(`net margin ${fmtPct(o.netMargin)}`);
  if (o.dividendYield != null) descSnippets.push(`dividend yield ${fmtPct(o.dividendYield)}`);
  const nameWithTicker = displayName && displayName !== ticker ? `${displayName} (${ticker})` : ticker;
  const metaLead = priceTxt ? `${nameWithTicker} stock price is ${priceTxt}${changePct != null ? ` (${changeSign}${Math.abs(fmt(changePct))}% today)` : ""}.` : `${nameWithTicker} stock data and financials.`;
  const metaDesc = descSnippets.length ? `${metaLead} See ${descSnippets.join(", ")}, plus 10-year financials, valuation ratios, and key stats \u2014 free on DeltaScreener.` : `${metaLead} Get full financials, valuation ratios, key stats, and 10-year data \u2014 free on DeltaScreener.`;
  const faqItems = [];
  if (price != null) faqItems.push({
    "@type": "Question",
    "name": `What is ${displayName} (${ticker}) stock price today?`,
    "acceptedAnswer": { "@type": "Answer", "text": `${displayName} (${ticker}) is currently trading at ${fmtPrice(price)}${o.changePct != null ? `, ${o.changePct >= 0 ? "up" : "down"} ${Math.abs(fmt(o.changePct))}% today` : ""}.` }
  });
  if (o.pe != null) faqItems.push({
    "@type": "Question",
    "name": `What is ${ticker} P/E ratio?`,
    "acceptedAnswer": { "@type": "Answer", "text": `${displayName}'s P/E ratio is ${fmt(o.pe)}. ${o.pe < 15 ? "This is below the market average, suggesting the stock may be undervalued relative to earnings." : o.pe > 30 ? "This is above the market average, reflecting high growth expectations." : "This is near the market average."}` }
  });
  if (o.roe != null) faqItems.push({
    "@type": "Question",
    "name": `What is ${ticker} return on equity (ROE)?`,
    "acceptedAnswer": { "@type": "Answer", "text": `${displayName}'s return on equity (ROE) is ${fmtPct(o.roe)}, indicating how efficiently the company generates profit from shareholders' equity. ${o.roe > 20 ? "This is considered high quality." : o.roe > 12 ? "This is above the market average." : "This is below the typical market average of 12-15%."}` }
  });
  if (o.mktCap || o.marketCap) faqItems.push({
    "@type": "Question",
    "name": `What is ${displayName}'s market cap?`,
    "acceptedAnswer": { "@type": "Answer", "text": `${displayName} has a market capitalization of ${fmtMktCap(o.mktCap || o.marketCap)}.` }
  });
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Corporation",
      "name": displayName,
      "tickerSymbol": ticker,
      ...o.exchange ? { "exchange": o.exchange } : {},
      ...o.sector ? { "industry": o.sector } : {},
      ...o.website ? { "url": o.website } : {},
      ...o.employees ? { "numberOfEmployees": { "@type": "QuantitativeValue", "value": o.employees } } : {},
      ...o.description ? { "description": String(o.description).slice(0, 300) } : {},
      ...o.city || o.country ? { "address": { "@type": "PostalAddress", ...o.city ? { "addressLocality": o.city } : {}, ...o.country ? { "addressCountry": o.country } : {} } } : {},
      ...o.image ? { "logo": o.image } : {},
      "mainEntityOfPage": `https://deltascreener.com/stock/${ticker}`
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://deltascreener.com" },
        { "@type": "ListItem", "position": 2, "name": "Stock Screener", "item": "https://deltascreener.com/screener" },
        { "@type": "ListItem", "position": 3, "name": `${displayName} (${ticker})`, "item": `https://deltascreener.com/stock/${ticker}` }
      ]
    },
    ...faqItems.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqItems }] : []
  ];
  const ogImage = o.image || "https://deltascreener.com/og-image.png";
  return new Response(renderSpaShell({
    title,
    description: metaDesc,
    canonicalUrl: `${SITE_ORIGIN}/stock/${ticker}`,
    robots: noindex ? "noindex,follow" : void 0,
    keywords: `${ticker} stock, ${displayName} stock price, ${displayName} financials, ${ticker} PE ratio, ${ticker} ROE, ${displayName} annual report`,
    bodyHtml,
    jsonLd,
    ogImage
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...noindex ? { "X-Robots-Tag": "noindex, follow" } : {},
      "Cache-Control": noindex ? "no-store" : "public, max-age=600, s-maxage=7200"
    }
  });
}
__name(renderStockShell, "renderStockShell");
async function onRequestGet23(context) {
  const ticker = String(context.params?.ticker || "").trim().toUpperCase();
  if (!ticker || !/^[A-Z0-9.\-]{1,10}$/.test(ticker)) {
    return render404(ticker || "UNKNOWN");
  }
  try {
    let overview = null;
    let fin = null;
    for (const origin of API_ORIGINS) {
      try {
        const [ovRes, finRes] = await Promise.all([
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/overview`, {
            headers: { Accept: "application/json", "User-Agent": "DeltaScreener-Pages/1.0" },
            cf: { cacheTtl: 300, cacheEverything: false }
          }),
          fetch(`${origin}/stock/${encodeURIComponent(ticker)}/financials`, {
            headers: { Accept: "application/json", "User-Agent": "DeltaScreener-Pages/1.0" },
            cf: { cacheTtl: 3600, cacheEverything: false }
          })
        ]);
        if (ovRes.ok) {
          overview = await ovRes.json();
          if (finRes.ok) {
            try {
              fin = await finRes.json();
            } catch (_) {
            }
          }
          break;
        }
      } catch (_) {
      }
    }
    if (!overview || overview.error || !overview.name) {
      return render404(ticker);
    }
    let peers = [];
    const sector = overview.sector;
    if (sector) {
      for (const origin of API_ORIGINS) {
        try {
          const pr = await fetch(`${origin}/screener/custom`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "User-Agent": "DeltaScreener-Pages/1.0" },
            body: JSON.stringify({
              conditions: [{ metric: "sector", op: "=", value: sector }],
              page: 1,
              limit: 16,
              sort: { col: "marketCap", dir: "desc" }
            }),
            cf: { cacheTtl: 1800, cacheEverything: false }
          });
          if (pr.ok) {
            const pj = await pr.json();
            peers = pj.results || [];
            break;
          }
        } catch (_) {
        }
      }
    }
    return renderStockShell(ticker, overview, fin, peers);
  } catch (_) {
    return renderStockShell(ticker, { name: ticker }, null, [], { noindex: true });
  }
}
__name(onRequestGet23, "onRequestGet");

// screens/[[slug]].js
async function onRequestGet24(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.replace(/^\/screens\//, "").replace(/\/$/, "");
  const destination = slug ? `/stocks/${slug}` : "/stocks";
  return Response.redirect(`https://deltascreener.com${destination}`, 301);
}
__name(onRequestGet24, "onRequestGet");

// _lib/seo.js
var SITE_ORIGIN2 = "https://deltascreener.com";
var API_FALLBACKS = [
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
var GEN_METRICS = [
  {
    key: "high-roe",
    label: "High ROE",
    cluster: "Sector Quality",
    conditions: [{ metric: "roe", op: ">=", value: 18 }, { metric: "debtToEquity", op: "<=", value: 3 }],
    sort: { field: "roe", dir: "desc" },
    blurb: "companies generating strong return on equity",
    why: "Return on equity highlights how efficiently a business turns shareholder capital into profit, and a debt ceiling keeps leverage-inflated names out of the list.",
    faq: ["What counts as high ROE here?", "This screen looks for return on equity of at least 18% alongside a debt-to-equity cap, so the quality signal is not just a product of leverage."]
  },
  {
    key: "high-roa",
    label: "High ROA",
    cluster: "Sector Quality",
    conditions: [{ metric: "roa", op: ">=", value: 10 }, { metric: "pb", op: ">", value: 0 }],
    sort: { field: "roa", dir: "desc" },
    blurb: "businesses earning strong returns on their asset base",
    why: "Return on assets is a quality measure that is less sensitive to leverage than ROE, which makes it useful for comparing companies across very different balance sheets.",
    faq: ["Why screen by ROA?", "ROA rewards companies that generate profit from the assets they control, so it surfaces operational efficiency rather than financial engineering."]
  },
  {
    key: "high-net-margin",
    label: "High Net Margin",
    cluster: "Sector Profitability",
    conditions: [{ metric: "netMargin", op: ">=", value: 18 }, { metric: "roa", op: ">=", value: 5 }],
    sort: { field: "netMargin", dir: "desc" },
    blurb: "companies with strong net profit margins",
    why: "High net margins can point to pricing power, cost discipline, or structurally attractive economics, and a minimum ROA keeps the list grounded in real asset productivity.",
    faq: ["What does a high net margin tell you?", "A consistently high net margin often signals durable competitive advantages, though margins should always be read in the context of the sector."]
  },
  {
    key: "low-pe",
    label: "Low PE",
    cluster: "Sector Value",
    conditions: [{ metric: "pe", op: "<=", value: 18 }, { metric: "pe", op: ">", value: 0 }, { metric: "roe", op: ">=", value: 8 }],
    sort: { field: "pe", dir: "asc" },
    blurb: "lower-P/E names that still post usable profitability",
    why: "A low price-to-earnings ratio can flag value, but a minimum ROE floor helps avoid the cheapest-for-a-reason corners of the market.",
    faq: ["Are loss-making companies included?", "No. A valid positive P/E is required, so deeply unprofitable names are filtered out of this screen."]
  },
  {
    key: "low-pb",
    label: "Low PB",
    cluster: "Sector Value",
    conditions: [{ metric: "pb", op: "<=", value: 2 }, { metric: "pb", op: ">", value: 0 }, { metric: "roe", op: ">=", value: 8 }],
    sort: { field: "pb", dir: "asc" },
    blurb: "asset-backed value names trading at low price-to-book",
    why: "Low price-to-book can surface asset-rich value opportunities, and pairing it with a return-on-equity floor avoids the weakest, value-trap end of the screen.",
    faq: ["Why combine low P/B with ROE?", "Low book multiples without profitability often produce weak lists, so this page keeps a minimum ROE requirement."]
  },
  {
    key: "dividend",
    label: "Dividend",
    cluster: "Sector Income",
    conditions: [{ metric: "dividendYield", op: ">=", value: 2 }, { metric: "debtToEquity", op: "<=", value: 2.5 }],
    sort: { field: "dividendYield", dir: "desc" },
    blurb: "dividend-paying companies with reasonable balance sheets",
    why: "Current yield is the starting point for income screens, and a debt ceiling helps filter out payouts that may be propped up by an overstretched balance sheet.",
    faq: ["Is this based on current yield?", "Yes. The screen uses current dividend yield plus a debt filter; it is not a dividend-growth-streak screen."]
  },
  {
    key: "low-debt",
    label: "Low Debt",
    cluster: "Sector Balance Sheet",
    conditions: [{ metric: "debtToEquity", op: "<=", value: 0.5 }, { metric: "roe", op: ">=", value: 8 }],
    sort: { field: "debtToEquity", dir: "asc" },
    blurb: "companies carrying conservative debt loads",
    why: "A low debt-to-equity ratio signals balance-sheet flexibility, and a profitability floor keeps the list from filling up with low-leverage but low-quality businesses.",
    faq: ["Why are some banks missing?", "Financial-sector balance sheets work differently, so many lenders are filtered out by a conservative debt-to-equity threshold."]
  }
];
var GEN_SECTORS = [
  { slug: "technology", value: "Technology", label: "Technology" },
  { slug: "healthcare", value: "Healthcare", label: "Healthcare" },
  { slug: "financial", value: "Financial Services", label: "Financial" },
  { slug: "energy", value: "Energy", label: "Energy" },
  { slug: "industrial", value: "Industrials", label: "Industrial" },
  { slug: "consumer-cyclical", value: "Consumer Cyclical", label: "Consumer Cyclical" },
  { slug: "consumer-defensive", value: "Consumer Defensive", label: "Consumer Defensive" },
  { slug: "utility", value: "Utilities", label: "Utility" },
  { slug: "real-estate", value: "Real Estate", label: "Real Estate" },
  { slug: "basic-materials", value: "Basic Materials", label: "Basic Materials" },
  { slug: "communication", value: "Communication Services", label: "Communication" }
];
function generateScreens() {
  const out = [];
  for (const m of GEN_METRICS) {
    for (const s of GEN_SECTORS) {
      const slug = `${m.key}-${s.slug}-stocks`;
      const title = `${m.label} ${s.label} Stocks`;
      const sectorSiblings = GEN_SECTORS.filter((x) => x.slug !== s.slug).slice(0, 2).map((x) => `${m.key}-${x.slug}-stocks`);
      const related = [`${m.key}-stocks`, ...sectorSiblings].slice(0, 3);
      out.push({
        slug,
        title,
        h1: title,
        cluster: m.cluster,
        intro: `This page screens the US ${s.label.toLowerCase()} sector for ${m.blurb}, refreshed automatically from live data.`,
        metaDescription: `${m.label} ${s.label.toLowerCase()} stocks in the US market with live price, valuation, and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [{ metric: "sector", op: "=", value: s.value }, ...m.conditions],
        sort: m.sort,
        related,
        faqs: [
          m.faq,
          [`Is this screen limited to ${s.label.toLowerCase()} stocks?`, `Yes. Every result is filtered to the US ${s.label.toLowerCase()} sector, so the list stays focused on one part of the market. ${m.why}`]
        ],
        generated: true
      });
    }
  }
  return out;
}
__name(generateScreens, "generateScreens");
var GEN_PRICE_TIERS = [
  { slug: "under-5", value: 5, label: "Under $5" },
  { slug: "under-10", value: 10, label: "Under $10" },
  { slug: "under-50", value: 50, label: "Under $50" }
];
var GEN_EXCHANGES = [
  { slug: "nasdaq", value: "NASDAQ", label: "Nasdaq" },
  { slug: "nyse", value: "NYSE", label: "NYSE" }
];
function generateTier2() {
  const out = [];
  for (const m of GEN_METRICS) {
    for (const p of GEN_PRICE_TIERS) {
      const slug = `${m.key}-stocks-${p.slug}`;
      const title = `${m.label} Stocks ${p.label}`;
      const siblings = GEN_PRICE_TIERS.filter((x) => x.slug !== p.slug).map((x) => `${m.key}-stocks-${x.slug}`);
      out.push({
        slug,
        title,
        h1: title,
        cluster: "Price Tier",
        intro: `This page screens the US market for ${m.blurb}, limited to shares trading at ${p.label.toLowerCase().replace("under ", "under ")}. Refreshed automatically from live data.`,
        metaDescription: `${m.label} US stocks priced ${p.label.toLowerCase()} with live valuation and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [...m.conditions, { metric: "price", op: "<=", value: p.value }],
        sort: m.sort,
        related: [`${m.key}-stocks`, ...siblings].slice(0, 3),
        faqs: [
          m.faq,
          [`Are these all priced ${p.label.toLowerCase()}?`, `Yes. Every result trades at or below $${p.value} per share. ${m.why} A low share price alone says nothing about value, so always read it alongside the fundamentals shown on each page.`]
        ],
        generated: true
      });
    }
  }
  for (const m of GEN_METRICS) {
    for (const x of GEN_EXCHANGES) {
      const slug = `${x.slug}-${m.key}-stocks`;
      const title = `${x.label} ${m.label} Stocks`;
      const siblings = GEN_EXCHANGES.filter((e) => e.slug !== x.slug).map((e) => `${e.slug}-${m.key}-stocks`);
      out.push({
        slug,
        title,
        h1: title,
        cluster: "Exchange",
        intro: `This page screens ${x.label}-listed US stocks for ${m.blurb}, refreshed automatically from live data.`,
        metaDescription: `${x.label} ${m.label.toLowerCase()} stocks with live price, valuation, and profitability data. Auto-updated on DeltaScreener.`,
        conditions: [{ metric: "exchange", op: "=", value: x.value }, ...m.conditions],
        sort: m.sort,
        related: [`${m.key}-stocks`, ...siblings].slice(0, 3),
        faqs: [
          m.faq,
          [`Are all results listed on ${x.label}?`, `Yes. This screen is filtered to ${x.label}-listed US stocks, which is useful for exchange-specific search and avoids mixing listing universes. ${m.why}`]
        ],
        generated: true
      });
    }
  }
  return out;
}
__name(generateTier2, "generateTier2");
var GENERATED_SCREENS = [...generateScreens(), ...generateTier2()];
var _curatedSlugs = new Set(SCREEN_PAGES.map((s) => s.slug));
var _seen = new Set(_curatedSlugs);
for (const s of GENERATED_SCREENS) {
  if (_seen.has(s.slug)) continue;
  _seen.add(s.slug);
  SCREEN_PAGES.push(s);
}
var SCREEN_LOOKUP = Object.fromEntries(SCREEN_PAGES.map((screen) => [screen.slug, screen]));
var BLOG_POSTS = [
  { slug: "debt-to-equity-ratio-stock-screening", title: "Debt-to-Equity Ratio: How to Screen for Low-Debt Stocks", description: "Learn how to use the debt-to-equity ratio to screen for financially sound, low-debt stocks \u2014 and why balance sheet strength matters across industries.", cluster: "Financial Metrics", published_at: "2026-06-19" },
  { slug: "debt-to-equity-ratio-stock-screening-guide", title: "Debt-to-Equity Ratio: How to Screen for Financially Sound Stocks", description: "A practical guide to screening stocks by debt-to-equity ratio. Understand what a healthy D/E looks like by sector and how to filter for resilient companies.", cluster: "Financial Metrics", published_at: "2026-06-18" },
  { slug: "how-to-screen-healthcare-stocks-filters", title: "How to Screen for Healthcare Stocks in Any Market", description: "Learn which filters matter most when screening healthcare stocks \u2014 margins, R&D, pipeline risk, and valuation \u2014 to find quality names in any market.", cluster: "Sector Investing", published_at: "2026-06-17" },
  { slug: "high-roe-stock-screening-guide", title: "Return on Equity Explained: How to Screen for High-ROE Stocks", description: "Return on equity measures how efficiently a company turns shareholder capital into profit. Learn how to screen for sustainable high-ROE stocks.", cluster: "Financial Metrics", published_at: "2026-06-15" },
  { slug: "return-on-equity-roe-stock-screening", title: "Return on Equity (ROE): How to Screen for Quality Stocks", description: "Learn how to use ROE to screen for quality businesses, what counts as a good ROE, and how to avoid ROE inflated by debt.", cluster: "Financial Metrics", published_at: "2026-06-14" },
  { slug: "price-to-sales-ratio-stock-screening", title: "Price-to-Sales Ratio: How to Screen Stocks Without Earnings", description: "The price-to-sales ratio helps you value companies that are not yet profitable. Learn how to use P/S to screen growth and turnaround stocks.", cluster: "Financial Metrics", published_at: "2026-06-13" },
  { slug: "growth-vs-value-stock-screening-strategies", title: "Growth vs Value Stock Screening: Filters That Actually Work", description: "Compare growth and value screening strategies and learn which filters actually identify each style of stock \u2014 with practical screen examples.", cluster: "Growth Investing", published_at: "2026-06-11" },
  { slug: "free-cash-flow-screening-find-quality-stocks", title: "Free Cash Flow Screening: Find Stocks That Actually Generate Cash", description: "Free cash flow reveals which companies truly generate cash after investment. Learn how to screen for strong FCF and avoid earnings mirages.", cluster: "Financial Metrics", published_at: "2026-06-09" },
  { slug: "how-to-avoid-value-traps-stock-screening", title: "How to Avoid Value Traps When Screening Stocks", description: "Cheap stocks are not always good value. Learn the warning signs of value traps and which filters help you avoid them when screening.", cluster: "Value Investing", published_at: "2026-06-08" },
  { slug: "sector-rotation-strategies-us-stock-screening", title: "Sector Rotation Strategies for US Stock Screeners", description: "Learn how sector rotation works across the economic cycle and how to build screens that adapt to leading and lagging sectors.", cluster: "Sector Investing", published_at: "2026-06-07" },
  { slug: "ev-ebitda-valuation-ratio-stock-screening", title: "EV/EBITDA Explained: The Valuation Ratio Serious Screeners Use", description: "EV/EBITDA accounts for debt and capital structure in a way P/E cannot. Learn how to use it to screen for fairly valued stocks.", cluster: "Value Investing", published_at: "2026-06-05" },
  { slug: "how-to-screen-dividend-stocks-practical-guide", title: "How to Screen for Dividend Stocks: A Practical Guide", description: "A practical guide to screening dividend stocks by yield, payout ratio, and dividend growth \u2014 and how to spot payouts at risk.", cluster: "Dividend Investing", published_at: "2026-05-31" },
  { slug: "momentum-stock-screening-systematic-approach", title: "Momentum Stock Screening: A Systematic Approach", description: "Learn how to build a systematic momentum screen using price strength, volume, and earnings revisions to find stocks in strong uptrends.", cluster: "Market Strategy", published_at: "2026-05-29" },
  { slug: "how-to-screen-us-stocks-like-a-pro-2026", title: "How to Screen US Stocks Like a Pro: A Complete Guide for 2026", description: "A complete 2026 guide to screening US stocks \u2014 which filters matter, how to combine them, and how to turn a screen into a focused watchlist.", cluster: "Screening Guides", published_at: "2026-05-28" }
];
var BLOG_LOOKUP = Object.fromEntries(BLOG_POSTS.map((p) => [p.slug, p]));
function escapeHtml2(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
__name(escapeHtml2, "escapeHtml");
function stripHtml(value) {
  return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
__name(stripHtml, "stripHtml");
function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
__name(numberOrNull, "numberOrNull");
function compactUsd(value) {
  const n = numberOrNull(value);
  if (n == null || n <= 0) return "\u2014";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}
__name(compactUsd, "compactUsd");
function usd(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
__name(usd, "usd");
function num(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
__name(num, "num");
function pct(value) {
  const n = numberOrNull(value);
  return n == null ? "\u2014" : `${n.toFixed(2)}%`;
}
__name(pct, "pct");
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
  const value = typeof condition.value === "number" ? condition.metric === "marketCap" ? compactUsd(condition.value) : num(condition.value) : String(condition.value);
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
async function fetchJson(origins, path, init = {}) {
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
__name(fetchJson, "fetchJson");
async function fetchScreenResults(context, screen) {
  const apiOrigins = [context.env.API_ORIGIN, ...API_FALLBACKS].filter(Boolean);
  return fetchJson(apiOrigins, "/screener/custom", {
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
  <title>${escapeHtml2(title)}</title>
  <meta name="description" content="${escapeHtml2(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml2(title)}" />
  <meta property="og:description" content="${escapeHtml2(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE_ORIGIN2}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml2(title)}" />
  <meta name="twitter:description" content="${escapeHtml2(description)}" />
  <meta name="twitter:image" content="${SITE_ORIGIN2}/og-image.png" />
  <meta name="twitter:site" content="@deltascreener" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=IBM+Plex+Serif:wght@400;600;700&display=swap" rel="stylesheet"></noscript>
  <link rel="stylesheet" href="/src/styles.css?v=20260704-fixes3" />
  <style>
    :root { color-scheme: light; }
    body{margin:0;background:linear-gradient(180deg,#f5f6f0 0%,#fbfbf8 30%,#ffffff 100%);color:#14202b;font-family:Inter,system-ui,sans-serif}
    .seo-wrap{max-width:1180px;margin:0 auto;padding:32px 16px 64px}
    .seo-nav{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774}
    .seo-nav ol{list-style:none;padding:0;margin:0;display:flex;align-items:center;gap:6px}
    .seo-nav li{display:inline-flex;align-items:center;gap:6px}
    .seo-nav a{color:#2563eb;text-decoration:none}
    .seo-nav li+li::before{content:"/";color:#9ca3af;font-weight:400}
    .seo-hero{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,.9fr);gap:22px;align-items:start;margin-top:18px}
    .seo-card{background:rgba(255,255,255,.92);border:1px solid rgba(208,214,222,.95);border-radius:24px;box-shadow:0 20px 48px rgba(15,23,42,.06)}
    .seo-hero-main{padding:28px}
    .seo-hero-side{padding:24px;background:linear-gradient(180deg,#fffdf4 0%,#fff 100%)}
    .seo-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px}
    .seo-hero h1{margin:0 0 14px;font-family:"IBM Plex Serif",Georgia,serif;font-size:clamp(34px,5vw,58px);line-height:1;letter-spacing:-.05em}
    .seo-hero p{margin:0;color:#55606d;line-height:1.75;font-size:16px}
    .seo-badges{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 0}
    .seo-badges span{display:inline-flex;align-items:center;padding:8px 12px;border-radius:999px;background:#eef8f5;color:#2563eb;font-size:13px;font-weight:700}
    .seo-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:24px 0}
    .seo-stat{padding:18px;border-radius:20px;border:1px solid rgba(208,214,222,.95);background:#fff}
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
    .seo-table a{color:#2563eb;text-decoration:none;font-weight:700}
    .seo-chip-grid{display:grid;gap:10px}
    .seo-chip{display:block;padding:14px 16px;border:1px solid rgba(208,214,222,.95);border-radius:18px;background:#fff;color:#14202b;text-decoration:none}
    .seo-chip strong{display:block;font-size:15px}
    .seo-chip span{display:block;margin-top:4px;font-size:13px;color:#667180}
    .seo-cta{display:flex;gap:12px;flex-wrap:wrap;margin-top:20px}
    .seo-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:14px;font-weight:800;text-decoration:none}
    .seo-btn-primary{background:#2563eb;color:#fff}
    .seo-btn-secondary{background:#fff;color:#14202b;border:1px solid rgba(208,214,222,.95)}
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
  const indexable = results.length >= 3;
  const robots = indexable ? "index,follow" : "noindex,follow";
  const updatedAt = isoDate(payload.updatedAt);
  const title = `${screen.title} (${payload.total || results.length || 0} US Stocks) | DeltaScreener`;
  const jsonLd = screenPageJsonLd(screen, payload, canonical);
  const tableRows = results.slice(0, 25).map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><a href="/stock/${encodeURIComponent(row.ticker)}">${escapeHtml2(row.ticker)}</a></td>
      <td>${escapeHtml2(row.name || row.ticker)}</td>
      <td>${escapeHtml2(row.exchange || "\u2014")}</td>
      <td>${usd(row.price)}</td>
      <td>${compactUsd(row.mktCap)}</td>
      <td>${num(row.pe)}</td>
      <td>${num(row.pb)}</td>
      <td>${pct(row.roe)}</td>
      <td>${pct(row.roa)}</td>
      <td>${pct(row.netMargin)}</td>
      <td>${num(row.debtToEquity)}</td>
    </tr>
  `).join("");
  const body = `
  <main class="seo-wrap">
    <nav class="seo-nav" aria-label="Breadcrumb">
      <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/stocks">Stocks</a></li>
        <li aria-current="page">${escapeHtml2(screen.h1)}</li>
      </ol>
    </nav>
    <section class="seo-hero">
      <article class="seo-card seo-hero-main">
        <div class="seo-kicker">${escapeHtml2(screen.cluster)} screen</div>
        <h1>${escapeHtml2(screen.h1)}</h1>
        <p>${escapeHtml2(screen.intro)}</p>
        <div class="seo-badges">
          <span>${escapeHtml2(`${payload.total || results.length || 0} matching stocks`)}</span>
          <span>${escapeHtml2(`Updated ${humanDate(updatedAt)} ET`)}</span>
          <span>${escapeHtml2(`${payload.screenableUniverse || "\u2014"} stock screenable universe`)}</span>
        </div>
        <div class="seo-summary">
          <div class="seo-stat"><strong>Average ROE</strong><span>${pct(stats.avgRoe)}</span></div>
          <div class="seo-stat"><strong>Average Debt / Equity</strong><span>${num(stats.avgDebt)}</span></div>
          <div class="seo-stat"><strong>Median P/E</strong><span>${num(stats.medianPe)}</span></div>
          <div class="seo-stat"><strong>Median Market Cap</strong><span>${compactUsd(stats.medianMarketCap)}</span></div>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Screen further</div>
        <p>Use the interactive screener to build custom filters, adjust thresholds, and export results. Over 30 metrics available across the full US stock universe.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open live screener</a>
          <a class="seo-btn seo-btn-secondary" href="/stock/${encodeURIComponent(results[0]?.ticker || "AAPL")}">View a stock</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Methodology</h2>
        <p>DeltaScreener currently builds this page from your US-listed stock universe using the following rules:</p>
        <ul class="seo-methodology">
          ${screen.conditions.map((condition) => `<li>${escapeHtml2(conditionLabel(condition))}</li>`).join("")}
        </ul>
        <p class="seo-muted">Top sectors in the current result set: ${escapeHtml2(topSectorText)}.</p>
      </article>
      <aside class="seo-card seo-section">
        <h2>Related Screens</h2>
        <div class="seo-chip-grid">
          ${related.map((item) => `
            <a class="seo-chip" href="/stocks/${item.slug}">
              <strong>${escapeHtml2(item.h1)}</strong>
              <span>${escapeHtml2(item.cluster)} screen</span>
            </a>
          `).join("")}
        </div>
      </aside>
    </section>
    <section class="seo-sections">
      <article class="seo-card seo-section">
        <h2>Current Results</h2>
        <p>Click any ticker to open the full stock detail page with financials, valuation history, and more.</p>
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
            <strong>${escapeHtml2(question)}</strong>
            <p>${escapeHtml2(answer)}</p>
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
        <div class="seo-kicker">Curated stock screens</div>
        <h1>US Stock Screener Pages</h1>
        <p>Explore curated screens across the US stock universe \u2014 quality, value, income, and sector filters, each backed by live fundamental data. Every page links directly to individual stock profiles so you can dig deeper instantly.</p>
        <div class="seo-badges">
          <span>${SCREEN_PAGES.length} curated screens</span>
          <span>Live fundamental data</span>
          <span>NYSE &amp; NASDAQ universe</span>
        </div>
      </article>
      <aside class="seo-card seo-hero-side">
        <div class="seo-kicker">Build your own screen</div>
        <p>The screens below use preset filters. For full control \u2014 custom thresholds, additional metrics, and sorting \u2014 use the interactive screener to build your own query.</p>
        <div class="seo-cta">
          <a class="seo-btn seo-btn-primary" href="/screener">Open interactive screener</a>
        </div>
      </aside>
    </section>
    <section class="seo-sections" style="grid-template-columns:1fr">
      ${[...clusters.entries()].map(([cluster, screens]) => `
        <article class="seo-card seo-section">
          <h2>${escapeHtml2(cluster)} Screens</h2>
          <div class="seo-chip-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            ${screens.map((screen) => `
              <a class="seo-chip" href="/stocks/${screen.slug}">
                <strong>${escapeHtml2(screen.h1)}</strong>
                <span>${escapeHtml2(stripHtml(screen.intro).slice(0, 110))}</span>
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
    { loc: `${SITE_ORIGIN2}/stocks`, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_ORIGIN2}/pricing`, changefreq: "monthly", priority: "0.5" }
  ];
  const screenUrls = SCREEN_PAGES.map((screen) => ({
    loc: `${SITE_ORIGIN2}/stocks/${screen.slug}`,
    changefreq: "daily",
    priority: "0.7"
  }));
  const blogUrls = [
    { loc: `${SITE_ORIGIN2}/blog`, changefreq: "weekly", priority: "0.7" },
    ...BLOG_POSTS.map((post) => ({
      loc: `${SITE_ORIGIN2}/blog/${post.slug}`,
      lastmod: post.published_at,
      changefreq: "monthly",
      priority: "0.6"
    }))
  ];
  const allUrls = [...staticUrls, ...screenUrls, ...blogUrls];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || now}</lastmod>
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

// stocks/[[slug]].js
async function onRequestGet25(context) {
  const { request } = context;
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/stocks\/?/, "").replace(/\/$/, "");
  if (!slug) {
    return withEdgeCache(request, context, async () => {
      const html = renderStocksHub();
      return htmlResponse(html);
    });
  }
  const screen = SCREEN_LOOKUP[slug];
  if (!screen) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }
  return withEdgeCache(request, context, async () => {
    let payload = {};
    try {
      payload = await fetchScreenResults(context, screen);
    } catch (_) {
      payload = { results: [], total: 0 };
    }
    const { html, lastModified, indexable } = renderScreenPage(screen, payload);
    return htmlResponse(html, { lastModified, indexable });
  });
}
__name(onRequestGet25, "onRequestGet");

// about.js
async function onRequestGet26() {
  const title = "About DeltaScreener \u2014 Free US Stock Screener";
  const description = "DeltaScreener is a free US stock screener for individual investors. Screen 5,000+ NYSE and NASDAQ stocks by P/E, ROE, debt, margins, and more \u2014 no sign-up required.";
  const canonicalUrl = `${SITE_ORIGIN}/about`;
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">About</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">About us</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 20px;color:#111827">About DeltaScreener</h1>
      <p style="font-size:17px;line-height:1.8;color:#374151;margin:0 0 20px">DeltaScreener is a free stock screening tool for individual investors in the US market. We believe professional-quality stock data should be accessible to everyone \u2014 not locked behind expensive subscriptions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">What we do</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We aggregate fundamental and valuation data for 5,000+ NYSE and NASDAQ-listed stocks and let you filter them using 30+ metrics \u2014 P/E ratio, ROE, Net Margin, Debt/Equity, Dividend Yield, Market Cap, and more. Every result links to a full stock detail page with 10 years of financial history. No sign-up required. No paywall.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">Data sources</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Stock data is sourced from Financial Modeling Prep (FMP). Fundamental metrics are refreshed periodically. While we make every effort to display accurate data, always verify figures with official company filings or your broker before making investment decisions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">For feedback or questions: <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a></p>
      <div style="padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Start screening</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Filter 5,000+ US stocks free \u2014 no account needed.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "about DeltaScreener, stock screener tool, free stock analysis, US stock data",
    jsonLd: [{ "@context": "https://schema.org", "@type": "AboutPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    }
  });
}
__name(onRequestGet26, "onRequestGet");

// blog/index.js
async function onRequestGet27({ env: env2 }) {
  const title = "Stock Investing Guides | DeltaScreener Blog";
  const description = "Practical guides on stock screening, valuation metrics, and investing strategies. Learn how to use filters like ROE, P/E, and debt-to-equity to find better stocks.";
  const canonicalUrl = `${SITE_ORIGIN}/blog`;
  const STATIC_ARTICLES = BLOG_POSTS;
  let posts = [];
  try {
    const { results } = await env2.DB.prepare(
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
      <p style="color:#9ca3af;font-size:16px;line-height:1.65;margin:0 0 36px">Practical guides on stock screening metrics, valuation filters, and sector strategies \u2014 written for investors who want to understand what the numbers mean.</p>
      <div>${articleCards}</div>
      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.18)">
        <strong style="display:block;font-size:15px;color:#2dd4bf;margin-bottom:8px">Ready to screen?</strong>
        <p style="margin:0 0 12px;color:#9ca3af;line-height:1.7;font-size:14px">Use the free DeltaScreener interactive screener to apply any filter combination \u2014 no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener \u2192</a>
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
__name(onRequestGet27, "onRequestGet");

// disclaimer.js
async function onRequestGet28() {
  const title = "Disclaimer \u2014 DeltaScreener";
  const description = "DeltaScreener is a stock data and screening tool, not a financial advisor. All information is for educational purposes only. Read our full disclaimer before making investment decisions.";
  const canonicalUrl = `${SITE_ORIGIN}/disclaimer`;
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Disclaimer</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Disclaimer</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Not investment advice</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener is a financial data and stock screening tool. All content \u2014 including stock data, metrics, screener results, and blog articles \u2014 is provided for <strong>educational and informational purposes only</strong>. Nothing on DeltaScreener constitutes investment advice, a solicitation to buy or sell any security, or a recommendation of any investment strategy.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We are not registered investment advisors, broker-dealers, or financial planners. Before making any investment decision, consult a qualified financial professional and conduct your own independent research.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Data accuracy</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Stock data is sourced from third-party providers, primarily Financial Modeling Prep (FMP). We do not guarantee the accuracy, completeness, or timeliness of any data displayed. Data may be delayed, contain errors, or differ from official company filings. Always verify against official SEC filings or your brokerage platform before making financial decisions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">No liability</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or reliance on any information on this website. Use of DeltaScreener is at your own risk.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Past performance</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Past financial performance of any stock or strategy shown does not guarantee future results. Investing involves risk, including possible loss of principal.</p>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "DeltaScreener disclaimer, investment disclaimer, stock data disclaimer",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    }
  });
}
__name(onRequestGet28, "onRequestGet");

// pricing.js
var GUMROAD_URL = "https://acherjeeanirban.gumroad.com/l/acuvpw";
async function onRequestGet29() {
  const title = "Pricing \u2014 DeltaScreener Pro | US Stock Screener";
  const description = "DeltaScreener is free for all investors. Upgrade to Pro for $5/month to unlock unlimited saved screens, email alerts, Excel export, and advanced filters.";
  const canonicalUrl = `${SITE_ORIGIN}/pricing`;
  const bodyHtml = `
  <style>
    body, html { background: #0a0f1a !important; color: #f3f4f6 !important; }
    .pricing-wrap { min-height: 100vh; background: #0a0f1a; font-family: Inter, system-ui, sans-serif; }

    .pricing-hero {
      position: relative;
      overflow: hidden;
      padding: 72px 16px 56px;
      text-align: center;
    }
    .pricing-hero::before {
      content: '';
      position: absolute;
      top: -120px; left: 50%; transform: translateX(-50%);
      width: 700px; height: 400px;
      background: radial-gradient(ellipse, rgba(45,212,191,.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .pricing-hero .eyebrow {
      display: inline-block;
      font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
      color: #2dd4bf; margin-bottom: 14px;
    }
    .pricing-hero h1 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: clamp(32px, 5vw, 52px);
      line-height: 1.08; letter-spacing: -.03em;
      color: #f9fafb; margin: 0 0 16px;
    }
    .pricing-hero p {
      font-size: 17px; color: #9ca3af; line-height: 1.7;
      max-width: 480px; margin: 0 auto 0;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-width: 820px;
      margin: 0 auto;
      padding: 0 16px 56px;
    }
    @media (max-width: 600px) { .plans-grid { grid-template-columns: 1fr; } }

    .plan-card {
      border-radius: 24px;
      padding: 36px 32px;
      position: relative;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.03);
    }
    .plan-card.pro {
      background: rgba(45,212,191,.04);
      border: 1px solid rgba(45,212,191,.28);
    }
    .plan-badge {
      position: absolute; top: -11px; left: 32px;
      background: rgba(45,212,191,.12);
      color: #2dd4bf; font-size: 10.5px; font-weight: 700;
      letter-spacing: .12em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 6px;
      border: 1px solid rgba(45,212,191,.3);
      white-space: nowrap;
    }
    .plan-label {
      font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .plan-card:not(.pro) .plan-label { color: #6b7280; }
    .plan-card.pro .plan-label { color: #2dd4bf; }

    .plan-price {
      font-size: 46px; font-weight: 800; line-height: 1; letter-spacing: -.02em;
      color: #f9fafb; margin-bottom: 4px;
    }
    .plan-price span { font-size: 19px; font-weight: 500; color: #6b7280; }
    .plan-cadence { font-size: 13px; color: #6b7280; margin-bottom: 28px; }

    .plan-features {
      list-style: none; padding: 0; margin: 0 0 28px;
      display: flex; flex-direction: column; gap: 13px;
    }
    .plan-features li {
      font-size: 14px; color: #d1d5db;
      display: flex; gap: 10px; align-items: flex-start; line-height: 1.5;
    }
    .plan-features li .check { color: #2dd4bf; font-size: 15px; flex-shrink: 0; margin-top: 1px; }
    .plan-features li .lock { color: #4b5563; font-size: 13px; flex-shrink: 0; margin-top: 2px; }
    .plan-features li.locked { color: #4b5563; }

    .plan-btn {
      display: block; text-align: center;
      padding: 14px 20px; border-radius: 14px;
      font-weight: 800; font-size: 15px; text-decoration: none;
      transition: opacity .15s, transform .1s;
    }
    .plan-btn:hover { opacity: .9; transform: translateY(-1px); }
    .plan-btn.free {
      border: 1.5px solid rgba(255,255,255,.15);
      color: #9ca3af; background: transparent;
    }
    .plan-btn.cta {
      background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
      color: #0f1117;
      box-shadow: 0 2px 12px rgba(45,212,191,.18);
    }

    .divider {
      max-width: 820px; margin: 0 auto 40px;
      border: none; border-top: 1px solid rgba(255,255,255,.06);
    }

    .trust-bar {
      display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;
      padding: 0 16px 56px; max-width: 820px; margin: 0 auto;
    }
    .trust-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #6b7280;
    }
    .trust-item .icon { font-size: 18px; }

    .compare-section {
      max-width: 820px; margin: 0 auto; padding: 0 16px 56px;
    }
    .compare-section h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 26px; font-weight: 700; color: #f9fafb;
      margin: 0 0 24px; text-align: center;
    }
    .compare-table {
      width: 100%; border-collapse: collapse; font-size: 14px;
    }
    .compare-table th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: #6b7280; border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .compare-table th:not(:first-child) { text-align: center; }
    .compare-table td {
      padding: 14px 16px; color: #d1d5db;
      border-bottom: 1px solid rgba(255,255,255,.05);
    }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table .yes { color: #2dd4bf; font-size: 18px; }
    .compare-table .no { color: #374151; font-size: 18px; }
    .compare-table .col-pro { background: rgba(45,212,191,.04); }

    .faq-section {
      max-width: 820px; margin: 0 auto; padding: 0 16px 56px;
    }
    .faq-section h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 26px; font-weight: 700; color: #f9fafb;
      margin: 0 0 24px; text-align: center;
    }
    .faq-item {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .faq-item:last-child { border-bottom: none; }
    .faq-q { font-size: 15px; font-weight: 700; color: #f3f4f6; margin-bottom: 8px; }
    .faq-a { font-size: 14px; color: #9ca3af; line-height: 1.75; }
    .faq-a a { color: #2dd4bf; text-decoration: none; }

    .bottom-cta {
      max-width: 820px; margin: 0 auto; padding: 0 16px 80px; text-align: center;
    }
    .bottom-cta-card {
      border-radius: 24px;
      background: linear-gradient(135deg, #0f2620 0%, #0a1628 100%);
      border: 1px solid rgba(45,212,191,.2);
      padding: 48px 32px;
    }
    .bottom-cta-card h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 28px; font-weight: 700; color: #f9fafb;
      margin: 0 0 12px; line-height: 1.25;
    }
    .bottom-cta-card p {
      color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 28px;
    }
    .bottom-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary-cta {
      padding: 14px 28px; border-radius: 14px;
      background: linear-gradient(135deg, #2dd4bf, #0d9488);
      color: #0f1117; font-weight: 800; font-size: 15px;
      text-decoration: none;
      box-shadow: 0 2px 12px rgba(45,212,191,.18);
    }
    .btn-secondary-cta {
      padding: 14px 28px; border-radius: 14px;
      border: 1.5px solid rgba(255,255,255,.15);
      color: #9ca3af; font-size: 15px; font-weight: 600;
      text-decoration: none;
    }
  </style>

  <div class="pricing-wrap">
    <!-- NAV BREADCRUMB -->
    <div style="max-width:820px;margin:0 auto;padding:20px 16px 0">
      <nav style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2dd4bf;text-decoration:none">Home</a>
        <span style="color:#374151;margin:0 6px">/</span>
        <span style="color:#6b7280">Pricing</span>
      </nav>
    </div>

    <!-- HERO -->
    <div class="pricing-hero">
      <div class="eyebrow">Pricing</div>
      <h1>Simple, transparent pricing</h1>
      <p>Professional-grade stock screening, free forever. Upgrade to Pro to unlock the full toolkit.</p>
    </div>

    <!-- PLAN CARDS -->
    <div class="plans-grid">
      <!-- FREE -->
      <div class="plan-card">
        <div class="plan-label">Free</div>
        <div class="plan-price">$0</div>
        <div class="plan-cadence">Forever free \xB7 No credit card</div>
        <ul class="plan-features">
          <li><span class="check">\u2713</span> Screen 5,000+ US stocks</li>
          <li><span class="check">\u2713</span> 30+ fundamental filters</li>
          <li><span class="check">\u2713</span> Full company pages</li>
          <li><span class="check">\u2713</span> 10-year financial history</li>
          <li><span class="check">\u2713</span> No sign-up required</li>
          <li class="locked"><span class="lock">\u2014</span> Saved screens (3 max)</li>
          <li class="locked"><span class="lock">\u2014</span> Excel / CSV export</li>
          <li class="locked"><span class="lock">\u2014</span> Email alerts</li>
        </ul>
        <a href="/screener" class="plan-btn free">Start Screening Free</a>
      </div>

      <!-- PRO -->
      <div class="plan-card pro">
        <div class="plan-badge">Recommended</div>
        <div class="plan-label">Pro</div>
        <div class="plan-price">$5<span>/mo</span></div>
        <div class="plan-cadence">Billed monthly \xB7 Cancel anytime</div>
        <ul class="plan-features">
          <li><span class="check">\u2713</span> Everything in Free</li>
          <li><span class="check">\u2713</span> Unlimited saved screens</li>
          <li><span class="check">\u2713</span> Export to Excel &amp; CSV</li>
          <li><span class="check">\u2713</span> Email alerts on price &amp; filter triggers</li>
          <li><span class="check">\u2713</span> Unlimited watchlists</li>
          <li><span class="check">\u2713</span> Deep company pages \u2014 peers &amp; trends</li>
          <li><span class="check">\u2713</span> Priority support</li>
          <li><span class="check">\u2713</span> 30-day money-back guarantee</li>
        </ul>
        <a href="${GUMROAD_URL}?wanted=true" data-gumroad-overlay-checkout="true" class="plan-btn cta">Upgrade to Pro \u2014 $5/month</a>
      </div>
    </div>

    <!-- TRUST BAR -->
    <div class="trust-bar">
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="1.5" stroke="#6b7280" stroke-width="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9" stroke="#6b7280" stroke-width="1.5"/></svg> Secure checkout via Gumroad</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 016-6c2.5 0 4.6 1.5 5.5 3.6M16 10a6 6 0 01-6 6c-2.5 0-4.6-1.5-5.5-3.6" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/><path d="M15.5 4v3.5H12M4.5 16v-3.5H8" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> 30-day money-back guarantee</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 4l4 2v3c0 2.8-1.7 5.3-4 6-2.3-.7-4-3.2-4-6V6l4-2z" stroke="#6b7280" stroke-width="1.5" stroke-linejoin="round"/></svg> Instant Pro activation</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="6.25" stroke="#6b7280" stroke-width="1.5"/><path d="M5.5 5.5l9 9" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg> No hidden fees</div>
    </div>

    <hr class="divider" />

    <!-- COMPARISON TABLE -->
    <div class="compare-section">
      <h2>Feature comparison</h2>
      <table class="compare-table">
        <thead>
          <tr>
            <th style="width:50%">Feature</th>
            <th>Free</th>
            <th class="col-pro" style="color:#2dd4bf">Pro</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Stock universe</td><td>5,000+ US stocks</td><td class="col-pro">5,000+ US stocks</td></tr>
          <tr><td>Fundamental filters</td><td>30+</td><td class="col-pro">30+</td></tr>
          <tr><td>Company pages &amp; financials</td><td class="yes">\u2713</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>10-year financial history</td><td class="yes">\u2713</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>No sign-up required</td><td class="yes">\u2713</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>Saved screens</td><td style="color:#6b7280">3 max</td><td class="col-pro yes">\u2713 Unlimited</td></tr>
          <tr><td>Excel / CSV export</td><td class="no">\u2014</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>Email alerts</td><td class="no">\u2014</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>Unlimited watchlists</td><td class="no">\u2014</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>Priority support</td><td class="no">\u2014</td><td class="col-pro yes">\u2713</td></tr>
          <tr><td>Money-back guarantee</td><td class="no">\u2014</td><td class="col-pro yes">\u2713 30 days</td></tr>
        </tbody>
      </table>
    </div>

    <hr class="divider" />

    <!-- FAQ -->
    <div class="faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-item">
        <div class="faq-q">Is DeltaScreener really free?</div>
        <div class="faq-a">Yes. The core screener \u2014 all 5,000+ US stocks, 30+ filters, company pages, and 10-year financials \u2014 is free forever. No account required.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">How does Pro activation work?</div>
        <div class="faq-a">After checkout on Gumroad, Pro is activated instantly. On DeltaScreener, click "Upgrade" in the nav, enter the email you used at checkout, and you're unlocked.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Can I cancel anytime?</div>
        <div class="faq-a">Yes. Cancel anytime from your Gumroad account. No cancellation fees. See our <a href="/refund">refund policy</a> for the 30-day guarantee.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">What payment methods are accepted?</div>
        <div class="faq-a">All major credit and debit cards \u2014 Visa, Mastercard, Amex, Discover. PayPal is also accepted at checkout.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Is my payment secure?</div>
        <div class="faq-a">Yes. Payments are processed by Gumroad, a trusted platform used by thousands of creators. DeltaScreener never sees your card details.</div>
      </div>
    </div>

    <!-- BOTTOM CTA -->
    <div class="bottom-cta">
      <div class="bottom-cta-card">
        <h2>Ready to screen like a pro?</h2>
        <p>Join investors using DeltaScreener Pro to find their next great stock.<br>30-day money-back guarantee if you're not satisfied.</p>
        <div class="bottom-cta-btns">
          <a href="${GUMROAD_URL}?wanted=true" data-gumroad-overlay-checkout="true" class="btn-primary-cta">Upgrade to Pro \u2014 $5/month</a>
          <a href="/screener" class="btn-secondary-cta">Try Free First</a>
        </div>
      </div>
    </div>
  </div>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "DeltaScreener pricing, stock screener pro, stock screener subscription, US stock screener price",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    }
  });
}
__name(onRequestGet29, "onRequestGet");

// privacy.js
async function onRequestGet30() {
  const title = "Privacy Policy \u2014 DeltaScreener";
  const description = "DeltaScreener's privacy policy: what data we collect, how it's used, and your rights. We do not sell personal data.";
  const canonicalUrl = `${SITE_ORIGIN}/privacy`;
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Privacy</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Privacy Policy</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Information we collect</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener does not require account registration and does not collect personally identifiable information unless you voluntarily provide it. We use <strong>Google Analytics 4 (GA4)</strong> to collect anonymized usage data including pages visited and session duration. GA4 data is subject to Google's privacy policy.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Cookies</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">We use:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:24px;margin:0 0 16px">
        <li style="margin-bottom:8px"><strong>Analytics cookies</strong> \u2014 Google Analytics for anonymized session data. Opt out via <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style="color:#2563eb">Google's opt-out tool</a>.</li>
        <li style="margin-bottom:8px"><strong>Functional storage</strong> \u2014 first-party localStorage to remember your theme preference and screener state. These do not track you across sites.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We do not use advertising cookies or sell cookie data to third parties.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Third-party services</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">We use: Google Analytics, Cloudflare (hosting/CDN), and Financial Modeling Prep (stock data). Each has its own privacy policy.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">For privacy questions: <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a></p>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "DeltaScreener privacy policy, data collection, cookies",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    }
  });
}
__name(onRequestGet30, "onRequestGet");

// refund.js
async function onRequestGet31() {
  const title = "Refund Policy \u2014 DeltaScreener";
  const description = "DeltaScreener refund policy. Cancel your Pro subscription anytime. We offer a 30-day money-back guarantee on all Pro plans.";
  const canonicalUrl = `${SITE_ORIGIN}/refund`;
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Refund Policy</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Refund Policy</h1>
      <p style="font-size:14px;color:#9ca3af;margin:0 0 40px">Last updated: June 2026</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">30-Day Money-Back Guarantee</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">If you are not satisfied with DeltaScreener Pro for any reason, contact us within 30 days of your initial purchase and we will issue a full refund \u2014 no questions asked.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Cancellation</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">You may cancel your Pro subscription at any time from your account settings. Upon cancellation, your Pro access will continue until the end of your current billing period. We do not charge cancellation fees.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Renewals</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">Pro subscriptions renew automatically each month. You will receive an email reminder before each renewal. To avoid being charged for the next billing period, cancel before your renewal date.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Exceptions</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">Refunds after 30 days are granted at our sole discretion. We reserve the right to refuse refunds for accounts found to be in violation of our <a href="/terms" style="color:#2563eb">Terms of Service</a>.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">How to Request a Refund</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Email us at <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a> with your account email and order details. We will process your refund within 5\u201310 business days.</p>

      <div style="padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Questions?</strong>
        <p style="margin:0;color:#374151;line-height:1.7;font-size:14px">Contact us at <a href="mailto:hello@deltascreener.com" style="color:#2563eb">hello@deltascreener.com</a> and we'll get back to you within 1 business day.</p>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "DeltaScreener refund policy, cancel subscription, money back guarantee",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    }
  });
}
__name(onRequestGet31, "onRequestGet");

// screener.js
var API = "https://api.deltascreener.com";
var DEFAULT_CONDITIONS = [
  { metric: "marketCap", op: ">", value: 1e3 }
];
var DEFAULT_SORT = { col: "marketCap", dir: "desc" };
var PRESET_SCREENS = [
  { label: "High ROE Stocks", url: "/stocks/high-roe-stocks" },
  { label: "Low Debt Stocks", url: "/stocks/low-debt-stocks" },
  { label: "Dividend Stocks", url: "/stocks/dividend-stocks" },
  { label: "Undervalued Tech", url: "/stocks/undervalued-tech-stocks" },
  { label: "Low P/E Stocks", url: "/stocks/low-pe-stocks" },
  { label: "High Net Margin", url: "/stocks/high-net-margin-stocks" }
];
function fmt2(v, decimals = 1) {
  if (v == null || !Number.isFinite(Number(v))) return "\u2014";
  return Number(v).toFixed(decimals);
}
__name(fmt2, "fmt");
function fmtCap(v) {
  if (!v) return "\u2014";
  const n = Number(v);
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(0) + "M";
  return "$" + n.toFixed(0);
}
__name(fmtCap, "fmtCap");
async function fetchDefault() {
  try {
    const res = await fetch(`${API}/screener/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditions: DEFAULT_CONDITIONS, page: 1, limit: 25, sort: DEFAULT_SORT })
    });
    if (!res.ok) return [];
    const d = await res.json();
    return d.results || [];
  } catch {
    return [];
  }
}
__name(fetchDefault, "fetchDefault");
var METRIC_MAP = {
  "return on equity": "roe",
  "roe": "roe",
  "price to earning": "pe",
  "p/e": "pe",
  "pe": "pe",
  "market cap": "marketCap",
  "debt to equity": "debtToEquity",
  "net margin": "netMargin",
  "dividend yield": "dividendYield",
  "price to book": "pb",
  "p/b": "pb",
  "pb": "pb",
  "return on assets": "roa",
  "roa": "roa",
  "gross margin": "grossMargin",
  "current ratio": "currentRatio"
};
async function fetchScreenerResults(query) {
  const lines = query.split(/\bAND\b/i).map((s) => s.trim()).filter(Boolean);
  const conditions = [];
  for (const line of lines) {
    const m = line.match(/^(.+?)\s*(>=|<=|>|<|=)\s*(-?[\d.]+)$/);
    if (!m) continue;
    const rawMetric = m[1].trim().toLowerCase();
    const metric = METRIC_MAP[rawMetric] || rawMetric.replace(/\s+/g, "");
    const value = parseFloat(m[3]);
    if (!isNaN(value)) conditions.push({ metric, op: m[2], value });
  }
  if (!conditions.length) return null;
  try {
    const res = await fetch(`${API}/screener/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: 1, limit: 30, conditions, sort: { col: "marketCap", dir: "desc" } })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
__name(fetchScreenerResults, "fetchScreenerResults");
function makeScreenTitle(query) {
  const parts = query.split(/\bAND\b/i).map((s) => s.trim()).filter(Boolean).slice(0, 3);
  return parts.length ? parts.join(" \xB7 ") : "Custom Screen";
}
__name(makeScreenTitle, "makeScreenTitle");
function renderDefaultTable(stocks) {
  if (!stocks.length) return "";
  return `
  <section style="margin-top:32px">
    <h2 style="font-size:18px;font-weight:700;color:#f9fafb;margin:0 0 4px">Top US Stocks by Market Cap</h2>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 16px">Showing ${stocks.length} large-cap stocks. Use the screener above to filter by any metric.</p>
    <div style="overflow-x:auto;border-radius:12px;border:1px solid rgba(255,255,255,.08)">
      <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:640px">
        <thead>
          <tr style="background:rgba(255,255,255,.04);text-align:left">
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">#</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Ticker</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Company</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Mkt Cap</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Price</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">P/E</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">ROE %</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08);text-align:right">Net Margin %</th>
            <th style="padding:11px 14px;color:#6b7280;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,.08)">Sector</th>
          </tr>
        </thead>
        <tbody>
          ${stocks.map((s, i) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.05);${i % 2 === 1 ? "background:rgba(255,255,255,.02)" : ""}">
              <td style="padding:11px 14px;color:#6b7280;font-size:13px">${i + 1}</td>
              <td style="padding:11px 14px"><a href="/stock/${s.ticker}" style="color:#2dd4bf;font-weight:800;text-decoration:none;font-size:14px">${s.ticker}</a></td>
              <td style="padding:11px 14px;color:#e5e7eb;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.name || s.ticker).replace(/&/g, "&amp;")}</td>
              <td style="padding:11px 14px;color:#f3f4f6;font-weight:600;text-align:right;font-variant-numeric:tabular-nums">${fmtCap(s.marketCap || s.mktCap)}</td>
              <td style="padding:11px 14px;color:#e5e7eb;text-align:right;font-variant-numeric:tabular-nums">$${fmt2(s.price || s.currentPrice, 2)}</td>
              <td style="padding:11px 14px;color:#e5e7eb;text-align:right;font-variant-numeric:tabular-nums">${fmt2(s.pe)}</td>
              <td style="padding:11px 14px;text-align:right;font-variant-numeric:tabular-nums;color:${s.roe > 0 ? "#2dd4bf" : "#e5e7eb"}">${fmt2(s.roe)}%</td>
              <td style="padding:11px 14px;text-align:right;font-variant-numeric:tabular-nums;color:${s.netMargin > 0 ? "#2dd4bf" : "#e5e7eb"}">${fmt2(s.netMargin)}%</td>
              <td style="padding:11px 14px;color:#9ca3af;font-size:13px;white-space:nowrap">${s.sector || "\u2014"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <p style="margin-top:12px;font-size:13px;color:#6b7280">Data updates daily. <a href="/screener" style="color:#2dd4bf;text-decoration:none">Apply your own filters \u2192</a></p>
  </section>`;
}
__name(renderDefaultTable, "renderDefaultTable");
async function onRequestGet32(context) {
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  if (!q || q.trim().length < 3) {
    const stocks = await fetchDefault();
    const presetLinks = PRESET_SCREENS.map(
      (p) => `<a href="${p.url}" style="display:inline-flex;align-items:center;padding:7px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.1);color:#d1d5db;font-size:13px;font-weight:600;text-decoration:none;background:rgba(255,255,255,.04)">${p.label}</a>`
    ).join("");
    const bodyHtml2 = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1200px;margin:0 auto;padding:40px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">

      <div style="margin-bottom:28px">
        <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,44px);line-height:1.1;letter-spacing:-.03em;margin:0 0 12px;color:#f9fafb">Free US Stock Screener</h1>
        <p style="font-size:17px;color:#9ca3af;line-height:1.7;margin:0 0 20px;max-width:640px">Filter 5,000+ NYSE and NASDAQ stocks by P/E ratio, ROE, net margin, debt-to-equity, dividend yield, and 30+ more metrics. No sign-up required.</p>
        <a href="/screener" style="display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:12px;background:linear-gradient(135deg,#2dd4bf,#0d9488);color:#0f1117;text-decoration:none;font-weight:800;font-size:15px">\u{1F50D} Open Interactive Screener \u2192</a>
      </div>

      <div style="margin-bottom:28px">
        <p style="font-size:13px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px">Popular screens</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${presetLinks}</div>
      </div>

      <section style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px 24px;margin-bottom:32px">
        <h2 style="font-size:16px;font-weight:700;color:#f9fafb;margin:0 0 12px">How to use the screener</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">1. Choose metrics</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Pick from 30+ filters \u2014 P/E, ROE, net margin, debt/equity, dividend yield and more</div></div>
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">2. Set thresholds</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Type conditions like "ROE > 15 AND Debt to Equity < 0.5 AND Market Cap > 1000"</div></div>
          <div><div style="color:#2dd4bf;font-weight:800;font-size:13px;margin-bottom:4px">3. Run the screen</div><div style="color:#9ca3af;font-size:13px;line-height:1.6">Results from 5,000+ stocks appear instantly. Export to Excel with Pro.</div></div>
        </div>
      </section>

      ${renderDefaultTable(stocks)}

      <section style="margin-top:48px">
        <h2 style="font-size:20px;font-weight:700;color:#f9fafb;margin:0 0 16px">Available screening metrics</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">
          ${[
      "P/E Ratio",
      "P/B Ratio",
      "P/S Ratio",
      "EV/EBITDA",
      "PEG Ratio",
      "Return on Equity (ROE)",
      "Return on Assets (ROA)",
      "ROCE",
      "Net Margin",
      "Gross Margin",
      "Operating Margin",
      "FCF Margin",
      "Debt to Equity",
      "Current Ratio",
      "Interest Coverage",
      "Revenue Growth (3Y)",
      "Profit Growth (3Y)",
      "EPS Growth",
      "Dividend Yield",
      "Payout Ratio",
      "Market Cap",
      "52-Week High/Low",
      "Beta",
      "Earnings Yield",
      "Free Cash Flow"
    ].map((m) => `<div style="padding:8px 12px;border-radius:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);color:#d1d5db;font-size:13px">${m}</div>`).join("")}
        </div>
      </section>

    </main>`;
    const jsonLd2 = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "DeltaScreener \u2014 Free US Stock Screener",
        url: `${SITE_ORIGIN}/screener`,
        description: "Free stock screener for 5,000+ US stocks. Filter by P/E, ROE, debt, margins, dividends and 30+ more metrics.",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_ORIGIN },
          { "@type": "ListItem", position: 2, name: "Stock Screener", item: `${SITE_ORIGIN}/screener` }
        ]
      }
    ];
    return new Response(renderSpaShell({
      title: "Free US Stock Screener \u2014 Filter 5,000+ Stocks | DeltaScreener",
      description: "Screen 5,000+ NYSE and NASDAQ stocks free. Filter by P/E ratio, ROE, net margin, debt/equity, dividend yield, market cap and 30+ metrics. No sign-up needed.",
      canonicalUrl: `${SITE_ORIGIN}/screener`,
      robots: "index,follow",
      keywords: "free stock screener, US stock screener, NYSE screener, NASDAQ screener, stock filter, PE ratio screener, ROE screener, dividend stock screener",
      jsonLd: jsonLd2,
      bodyHtml: bodyHtml2
    }), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=3600, stale-while-revalidate=3600"
      }
    });
  }
  const screenTitle = makeScreenTitle(q);
  const canonicalUrl = `${SITE_ORIGIN}/screener?q=${encodeURIComponent(q)}`;
  const title = `${screenTitle} | DeltaScreener Stock Screen`;
  const description = `Stock screen: ${q.replace(/\n/g, " ").slice(0, 150)}. Filter US stocks free on DeltaScreener \u2014 no sign-up required.`;
  let payload = null;
  try {
    payload = await fetchScreenerResults(q, env);
  } catch {
  }
  const resultRows = payload?.results?.slice(0, 20) || [];
  const total = payload?.total || 0;
  const ssrTable = resultRows.length > 0 ? `
    <div style="margin-top:24px;overflow-x:auto">
      <p style="color:#9ca3af;font-size:13px;margin:0 0 12px">${total} stocks matched \xB7 Showing top ${resultRows.length}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:500px">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,.1);color:#6b7280;text-align:left">
            <th style="padding:8px 12px">Ticker</th>
            <th style="padding:8px 12px">Company</th>
            <th style="padding:8px 12px;text-align:right">Mkt Cap</th>
            <th style="padding:8px 12px;text-align:right">P/E</th>
            <th style="padding:8px 12px;text-align:right">ROE %</th>
          </tr>
        </thead>
        <tbody>
          ${resultRows.map((s) => `
            <tr style="border-bottom:1px solid rgba(255,255,255,.05)">
              <td style="padding:8px 12px"><a href="/stock/${s.ticker}" style="color:#2dd4bf;font-weight:700;text-decoration:none">${s.ticker}</a></td>
              <td style="padding:8px 12px;color:#d1d5db">${s.name || ""}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.mktCap ? "$" + (s.mktCap / 1e3).toFixed(1) + "B" : "\u2014"}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.pe ? s.pe.toFixed(1) : "\u2014"}</td>
              <td style="padding:8px 12px;text-align:right;color:#d1d5db">${s.roe ? s.roe.toFixed(1) + "%" : "\u2014"}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>` : `<p style="color:#6b7280;margin-top:24px">Run this screen on DeltaScreener to see matching stocks.</p>`;
  const bodyHtml = `
    <style>body,html{background:#0f1117!important;color:#f3f4f6!important}</style>
    <main style="max-width:1100px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
          <li><a href="/" style="color:#2dd4bf;text-decoration:none">Home</a></li>
          <li style="color:#6b7280">/</li>
          <li><a href="/screener" style="color:#2dd4bf;text-decoration:none">Screener</a></li>
          <li style="color:#6b7280">/</li>
          <li style="color:#9ca3af">Custom Screen</li>
        </ol>
      </nav>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(22px,4vw,36px);line-height:1.2;letter-spacing:-.03em;margin:0 0 12px;color:#f9fafb">${screenTitle}</h1>
      <code style="display:block;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px 16px;font-size:13px;color:#a3e635;margin-bottom:12px;white-space:pre-wrap">${q.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>
      <a href="/screener?q=${encodeURIComponent(q)}" style="display:inline-flex;padding:10px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px;margin-bottom:8px">\u2192 Run this screen live</a>
      <span style="color:#6b7280;font-size:13px;margin-left:12px">Free \xB7 No sign-up</span>
      ${ssrTable}
    </main>`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: title,
    description,
    url: canonicalUrl,
    creator: { "@type": "Organization", name: "DeltaScreener", url: SITE_ORIGIN }
  };
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    robots: "index,follow",
    keywords: `stock screen, ${q.replace(/[><=\n]/g, " ").replace(/\s+/g, " ").trim()}, US stocks, DeltaScreener`,
    jsonLd: [jsonLd],
    bodyHtml
  }), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600"
    }
  });
}
__name(onRequestGet32, "onRequestGet");

// sitemap-pages.xml/index.js
async function onRequestGet33() {
  return xmlResponse(renderSitemap());
}
__name(onRequestGet33, "onRequestGet");

// sitemap-stocks.xml/index.js
var SITE_ORIGIN3 = "https://deltascreener.com";
var API_ORIGINS2 = [
  "https://api.deltascreener.com",
  "https://screenerpro1-api.acherjeeanirban.workers.dev"
];
var PAGE_SIZE = 100;
var MAX_PARALLEL = 50;
var MAX_TICKERS = 5e3;
var EXCLUDE_TICKERS = /* @__PURE__ */ new Set(["GOOG"]);
async function fetchPage(origin, page) {
  const res = await fetch(`${origin}/screener/custom`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "DeltaScreener-Sitemap/1.0" },
    body: JSON.stringify({
      conditions: [],
      page,
      limit: PAGE_SIZE,
      sort: { col: "marketCap", dir: "desc" }
    })
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
__name(fetchPage, "fetchPage");
async function fetchAllTickers(context) {
  const apiOrigins = [context?.env?.API_ORIGIN, ...API_ORIGINS2].filter(Boolean);
  let origin = apiOrigins[0];
  let first;
  for (const o of apiOrigins) {
    try {
      first = await fetchPage(o, 1);
      origin = o;
      break;
    } catch (_) {
    }
  }
  if (!first) return [];
  const total = first.total || 0;
  const tickers = (first.results || []).map((r) => r.ticker).filter(Boolean);
  if (total <= PAGE_SIZE || tickers.length >= MAX_TICKERS) return tickers.slice(0, MAX_TICKERS);
  const totalPages = Math.min(Math.ceil(total / PAGE_SIZE), MAX_PARALLEL);
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
  const BATCH = 10;
  for (let i = 0; i < remainingPages.length; i += BATCH) {
    const batch = remainingPages.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map((p) => fetchPage(origin, p)));
    for (const r of results) {
      if (r.status === "fulfilled") {
        tickers.push(...(r.value.results || []).map((r2) => r2.ticker).filter(Boolean));
      }
    }
    if (tickers.length >= MAX_TICKERS) break;
  }
  return [...new Set(tickers)].slice(0, MAX_TICKERS);
}
__name(fetchAllTickers, "fetchAllTickers");
var CACHE_VERSION = "v2";
async function onRequestGet34(context) {
  const cache = caches.default;
  const keyUrl = new URL(context.request.url);
  keyUrl.searchParams.set("cv", CACHE_VERSION);
  const cacheKey = new Request(keyUrl.toString());
  const hit = await cache.match(cacheKey);
  if (hit) {
    const headers = new Headers(hit.headers);
    headers.set("X-Sitemap-Cache", "edge");
    return new Response(hit.body, { status: hit.status, headers });
  }
  let tickers = [];
  let isFallback = false;
  try {
    tickers = await fetchAllTickers(context);
  } catch (_) {
    isFallback = true;
    tickers = ["NVDA", "AAPL", "GOOGL", "MSFT", "AMZN", "TSM", "AVGO", "TSLA", "META", "MU", "BRK.B", "BRK.A", "LLY", "WMT", "JPM", "AMD", "ASML", "V", "INTC", "ORCL", "XOM", "JNJ", "CSCO", "MA", "COST", "CAT", "LRCX", "BAC", "ABBV", "KLAC", "QCOM", "KO", "TM", "GE", "SAP", "AXP", "NFLX", "CVX", "WFC", "TMO", "GS", "MS", "AMAT", "AMGN", "MRK", "PG", "ABT", "TXN", "ISRG", "NEE", "SNOW", "SPGI", "NVO", "CRM", "PLTR", "NOW", "RTX", "PDD", "BKNG", "ARM", "GEV", "PANW", "HON", "SHW", "DIS", "T", "LOW", "ETN", "VZ", "UNH", "LIN", "ADP", "BSX", "DE", "MCD", "IBM", "ADSK", "MSTR", "TT", "BX", "REGN", "CI", "PH", "UNP", "MMC", "ANET", "COIN", "APP", "EMR", "TJX", "CB", "FTNT", "VRTX", "GD", "ELV", "NSC", "ADI", "WELL", "SYK", "COF", "TDG", "HCA", "AJG", "AON", "MSI", "SO", "PGR", "ECL", "FICO", "ITW", "KKR", "D", "HWM", "ROP", "CME", "CTAS", "FI", "MDLZ", "APO", "MCO", "CRWD", "UBER", "NUE", "BDX", "HLT", "NOC", "EW", "ZTS", "APH", "AMT", "MET", "AFL", "OTIS", "PSA", "USB", "OKE", "GWW", "PNC", "DHI", "TRV", "AIG", "DLR", "MPWR", "LDOS", "FCX", "ODFL", "NXPI", "PCAR", "PWR", "CARR", "SRE", "WM", "CSGP", "LHX", "O", "VRSK", "HES", "COR", "ACGL", "TRGP", "KMB", "FAST", "MNST", "AXON", "SPG", "CCI", "GIS", "PRU", "TEL", "VLO", "DECK", "WAB", "F", "GM", "MSCI", "MTB", "GEHC", "TSCO", "EXC", "AEP", "CTVA", "NEM", "PSX", "WMB", "MPC", "RCL", "CDW", "XEL", "IP", "URI", "DD", "EFX", "CTSH", "IRM", "FIS", "CINF", "FANG"];
  }
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urlEntries = tickers.filter((t) => !EXCLUDE_TICKERS.has(t)).map((ticker) => `  <url>
    <loc>${SITE_ORIGIN3}/stock/${encodeURIComponent(ticker)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  const isHealthy = !isFallback && tickers.length >= 1e3;
  const response = new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": isHealthy ? "public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400" : "no-store",
      "X-Stock-Count": String(tickers.length),
      "X-Sitemap-Healthy": String(isHealthy)
    }
  });
  if (isHealthy) context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
__name(onRequestGet34, "onRequestGet");

// sitemap.xml/index.js
var SITE_ORIGIN4 = "https://deltascreener.com";
async function onRequestGet35() {
  const now = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_ORIGIN4}/sitemap-pages.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_ORIGIN4}/sitemap-stocks.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  return xmlResponse(xml);
}
__name(onRequestGet35, "onRequestGet");

// terms.js
async function onRequestGet36() {
  const title = "Terms of Service \u2014 DeltaScreener";
  const description = "Terms of service for DeltaScreener. By using our free US stock screener, you agree to these terms. Educational use only \u2014 not investment advice.";
  const canonicalUrl = `${SITE_ORIGIN}/terms`;
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Terms</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Terms of Service</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Acceptance of terms</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">By accessing or using DeltaScreener, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Permitted use</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">DeltaScreener is provided free of charge for personal, non-commercial, educational use. You may not:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:24px;margin:0 0 16px">
        <li style="margin-bottom:8px">Systematically scrape or extract data in bulk via automated means without written permission</li>
        <li style="margin-bottom:8px">Redistribute or resell data obtained from the site</li>
        <li style="margin-bottom:8px">Interfere with or disrupt the site's infrastructure</li>
      </ul>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">No investment advice</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Nothing on DeltaScreener constitutes investment advice. All data and content is for informational and educational purposes only. See our <a href="/disclaimer" style="color:#2563eb;font-weight:600">Disclaimer</a> for full details.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Limitation of liability</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of, or inability to use, the site or any data it contains.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Questions: <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a></p>
    </main>`;
  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: "DeltaScreener terms of service, terms and conditions, usage policy",
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebPage", name: title, description, url: canonicalUrl }],
    bodyHtml
  }), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=604800"
    }
  });
}
__name(onRequestGet36, "onRequestGet");

// [[catchall]].js
var VALID_EXACT = /* @__PURE__ */ new Set(["/", "/screener", "/watchlist", "/portfolio", "/alerts", "/news"]);
var VALID_PREFIXES = ["/stock/", "/stocks/", "/screens/"];
var SPA_SHELL_META = {
  "/": null,
  // served by index.html static asset
  "/screener": null,
  // handled by screener.js function
  "/watchlist": {
    title: "My Watchlist | DeltaScreener",
    description: "Track and monitor your favourite stocks with DeltaScreener watchlist.",
    canonical: "/watchlist",
    robots: "noindex,follow"
  },
  "/portfolio": {
    title: "My Portfolio | DeltaScreener",
    description: "Track your stock portfolio performance on DeltaScreener.",
    canonical: "/portfolio",
    robots: "noindex,follow"
  },
  "/alerts": {
    title: "Stock Alerts | DeltaScreener",
    description: "Set price, percent-move, fundamental, and screen alerts and get emailed when conditions are met.",
    canonical: "/alerts",
    robots: "noindex,follow"
  },
  "/news": {
    title: "Stock Market News | DeltaScreener",
    description: "Latest US stock market and company news headlines, updated throughout the day.",
    canonical: "/news",
    robots: "index,follow"
  }
};
function isValidRoute(pathname) {
  if (VALID_EXACT.has(pathname)) return true;
  for (const prefix of VALID_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}
__name(isValidRoute, "isValidRoute");
async function onRequestGet37(context) {
  const { request, env: env2 } = context;
  const url = new URL(request.url);
  const rawPathname = url.pathname;
  const pathname = rawPathname.replace(/\/$/, "") || "/";
  if (/\.[a-zA-Z0-9]{1,6}$/.test(pathname)) {
    return env2.ASSETS.fetch(request);
  }
  if (rawPathname !== "/" && rawPathname.endsWith("/")) {
    return Response.redirect(`${SITE_ORIGIN}${pathname}${url.search}`, 301);
  }
  if (isValidRoute(pathname)) {
    const meta = SPA_SHELL_META[pathname];
    if (meta) {
      return new Response(renderSpaShell({
        title: meta.title,
        description: meta.description,
        canonicalUrl: `${SITE_ORIGIN}${meta.canonical}`,
        robots: meta.robots || "index,follow"
      }), {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" }
      });
    }
    try {
      const assetReq = new Request(`${SITE_ORIGIN}/index.html`, { headers: request.headers });
      const res = await env2.ASSETS.fetch(assetReq);
      const html = await res.text();
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" }
      });
    } catch (_) {
    }
  }
  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:96px 16px;text-align:center;font-family:Inter,system-ui,sans-serif">
      <div style="font-size:72px;font-weight:900;color:#e5e7eb;line-height:1;margin-bottom:20px">404</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:32px;color:#111827;margin:0 0 12px">Page not found</h1>
      <p style="color:#6b7280;font-size:16px;line-height:1.65;margin:0 0 32px;max-width:480px;margin-left:auto;margin-right:auto">
        This page doesn't exist. It may have been moved, deleted, or the URL may be wrong.
      </p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="/" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Go Home</a>
        <a href="/screener" style="display:inline-flex;padding:11px 18px;border-radius:12px;background:#f1f5f9;color:#374151;text-decoration:none;font-weight:700;font-size:14px">Stock Screener</a>
      </div>
    </main>`;
  return new Response(renderSpaShell({
    title: "Page Not Found | DeltaScreener",
    description: "The page you are looking for does not exist on DeltaScreener.",
    canonicalUrl: `${SITE_ORIGIN}/`,
    robots: "noindex,nofollow",
    bodyHtml
  }), {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "public, max-age=60"
    }
  });
}
__name(onRequestGet37, "onRequestGet");

// ../.wrangler/tmp/pages-sOsbJj/functionsRoutes-0.5715219902954236.mjs
var routes = [
  {
    routePath: "/api/gumroad-ping",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/gumroad-ping",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/pro-status",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/pro-status",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
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
    routePath: "/blog/high-roe-low-debt-stocks",
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
    routePath: "/blog/how-to-read-a-balance-sheet-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet10]
  },
  {
    routePath: "/blog/how-to-screen-tech-stocks-for-value",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet11]
  },
  {
    routePath: "/blog/how-to-screen-tech-stocks-for-value-2026",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet12]
  },
  {
    routePath: "/blog/low-debt-stocks-investing-guide",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet13]
  },
  {
    routePath: "/blog/nasdaq-high-roe-stocks-guide",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet14]
  },
  {
    routePath: "/blog/nasdaq-stock-screener",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet15]
  },
  {
    routePath: "/blog/nasdaq-vs-nyse-stock-screening",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet16]
  },
  {
    routePath: "/blog/nyse-vs-nasdaq-stock-picking",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet17]
  },
  {
    routePath: "/blog/roe-and-debt-screening-strategy",
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
    routePath: "/blog/what-is-roa-in-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet20]
  },
  {
    routePath: "/blog/what-is-roe-in-stocks",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet21]
  },
  {
    routePath: "/blog/:slug",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet22]
  },
  {
    routePath: "/stock/:ticker",
    mountPath: "/stock",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet23]
  },
  {
    routePath: "/screens/:slug*",
    mountPath: "/screens",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet24]
  },
  {
    routePath: "/stocks/:slug*",
    mountPath: "/stocks",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet25]
  },
  {
    routePath: "/about",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet26]
  },
  {
    routePath: "/blog",
    mountPath: "/blog",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet27]
  },
  {
    routePath: "/disclaimer",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet28]
  },
  {
    routePath: "/pricing",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet29]
  },
  {
    routePath: "/privacy",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet30]
  },
  {
    routePath: "/refund",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet31]
  },
  {
    routePath: "/screener",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet32]
  },
  {
    routePath: "/sitemap-pages.xml",
    mountPath: "/sitemap-pages.xml",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet33]
  },
  {
    routePath: "/sitemap-stocks.xml",
    mountPath: "/sitemap-stocks.xml",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet34]
  },
  {
    routePath: "/sitemap.xml",
    mountPath: "/sitemap.xml",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet35]
  },
  {
    routePath: "/terms",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet36]
  },
  {
    routePath: "/:catchall*",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet37]
  }
];

// ../../../../../../tmp/npmcache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
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

// ../../../../../../tmp/npmcache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
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
  async fetch(originalRequest, env2, workerContext) {
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
          env: env2,
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
        const response = await env2["ASSETS"].fetch(request);
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
        const response = await env2["ASSETS"].fetch(request);
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
