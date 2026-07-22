/**
 * DeltaScreener Twitter Agent — Cloudflare Worker
 * Runs 5x/day via cron triggers, posts to @deltascreener
 * No Python/Tweepy needed — pure JS with Twitter API v2
 */

const SITE_URL = "https://deltascreener.com";
const BLOG_API = "https://api.deltascreener.com/api/blog";

// ── Cron → Slot mapping (UTC, EDT = UTC-4)
// Free plan = 5 cron triggers total across account; we have 4 slots here.
// Slot 5 (5pm EOD) runs via waitUntil inside slot 4 after a 2h delay.
const CRON_SLOT_MAP = {
  "30 12": 1,  // 8:30am ET
  "30 14": 2,  // 10:30am ET
  "30 16": 3,  // 12:30pm ET
  "0 19":  4,  // 3:00pm ET  (also schedules slot 5 at +2h via waitUntil)
};

export default {
  // ── Scheduled handler (cron) ─────────────────────────────────────────────
  async scheduled(event, env, ctx) {
    const cron = event.cron;
    const [minute, hour] = cron.split(" ");
    const key = `${minute} ${hour}`;
    const slot = CRON_SLOT_MAP[key] || 1;

    console.log(`🐦 Twitter Agent — Slot ${slot} — cron: ${cron}`);

    // Random human-like delay 0–15 min
    const delaySec = Math.floor(Math.random() * 900);
    console.log(`⏳ Delay: ${Math.floor(delaySec/60)}m ${delaySec%60}s`);
    await sleep(delaySec * 1000);

    await runSlot(slot, env);

    // Slot 4 (3pm ET) also fires slot 5 (5pm EOD) after a 2-hour delay
    // using ctx.waitUntil so the cron execution stays alive
    if (slot === 4) {
      ctx.waitUntil((async () => {
        console.log("⏳ Waiting 2h for slot 5 (5pm ET EOD recap)...");
        await sleep(2 * 60 * 60 * 1000);
        await runSlot(5, env);
      })());
    }
  },

  // ── HTTP handler (manual trigger: GET /trigger?slot=1) ───────────────────
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/trigger") {
        const slot = parseInt(url.searchParams.get("slot") || "1");
        const secret = url.searchParams.get("secret");
        if (secret !== env.TRIGGER_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          await runSlot(slot, env);
          return new Response(`Slot ${slot} posted ✓`, { status: 200 });
        } catch (e) {
          return new Response(`Slot ${slot} error: ${e.message}`, { status: 500 });
        }
      }
      return new Response("DeltaScreener Twitter Agent running ✓", { status: 200 });
    } catch (e) {
      return new Response(`Worker error: ${e.message}`, { status: 500 });
    }
  },
};

// ── Sleep helper ─────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Dispatch to slot function ─────────────────────────────────────────────────
async function runSlot(slot, env) {
  const slots = {
    1: slot1PremarketBlog,
    2: slot2GainerSpotlight,
    3: slot3ScreenerTip,
    4: slot4SectorMomentum,
    5: slot5EodRecap,
  };
  const fn = slots[slot] || slot1PremarketBlog;
  try {
    await fn(env);
  } catch (e) {
    console.error(`❌ Slot ${slot} crashed:`, e.message, e.stack);
    throw e;
  }
}

// ── FMP market data ───────────────────────────────────────────────────────────
async function fetchFMP(endpoint, params = {}, env) {
  const url = new URL(`https://financialmodelingprep.com/api/v3/${endpoint}`);
  url.searchParams.set("apikey", env.FMP_API_KEY || "");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const r = await fetch(url.toString(), { cf: { cacheTtl: 300 } });
    return await r.json();
  } catch {
    return [];
  }
}

// ── Latest blog post ──────────────────────────────────────────────────────────
async function fetchLatestBlog() {
  try {
    const r = await fetch(BLOG_API, { cf: { cacheTtl: 600 } });
    const data = await r.json();
    // API returns either an array or { posts: [...] }
    const posts = Array.isArray(data) ? data : (data.posts || []);
    if (posts.length) return posts[0];
  } catch {}
  return null;
}

// ── Claude Haiku for tweet copy ───────────────────────────────────────────────
async function aiTweet(prompt, env, fallback = "") {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 120,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await r.json();
    const text = data.content?.[0]?.text?.trim();
    if (text) return text;
  } catch (e) {
    console.log("AI tweet failed, using fallback:", e.message);
  }
  return fallback;
}

// ── Twitter OAuth 1.0a ────────────────────────────────────────────────────────
async function postTweet(text, env) {
  const url = "https://api.twitter.com/2/tweets";
  const method = "POST";

  const oauthParams = {
    oauth_consumer_key: env.TWITTER_API_KEY,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: env.TWITTER_ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  const sig = await oauthSignature(method, url, oauthParams, {}, env);
  oauthParams.oauth_signature = sig;

  const authHeader = "OAuth " + Object.entries(oauthParams)
    .map(([k, v]) => `${encodeRFC3986(k)}="${encodeRFC3986(v)}"`)
    .join(", ");

  const r = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const result = await r.json();
  console.log("📤 Tweet result:", JSON.stringify(result));
  return result;
}

// ── HMAC-SHA1 OAuth signature ─────────────────────────────────────────────────
async function oauthSignature(method, url, oauthParams, bodyParams, env) {
  const allParams = { ...oauthParams, ...bodyParams };
  const sortedParams = Object.keys(allParams)
    .sort()
    .map(k => `${encodeRFC3986(k)}=${encodeRFC3986(allParams[k])}`)
    .join("&");

  const baseString = [
    method.toUpperCase(),
    encodeRFC3986(url),
    encodeRFC3986(sortedParams),
  ].join("&");

  const signingKey = `${encodeRFC3986(env.TWITTER_API_SECRET)}&${encodeRFC3986(env.TWITTER_ACCESS_TOKEN_SECRET)}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(baseString));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function encodeRFC3986(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

// ══════════════════════════════════════════════════════════════════════════════
// SLOT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

// Blog articles to rotate through in slot 1
const BLOG_ARTICLES = [
  { slug: 'best-free-stock-screener', title: 'Best Free Stock Screener for US Stocks in 2026' },
  { slug: 'how-to-find-undervalued-stocks', title: 'How to Find Undervalued Stocks Using a Stock Screener' },
  { slug: 'dividend-stock-screener-guide', title: 'Dividend Stock Screener: How to Find High-Yield US Stocks' },
  { slug: 'stock-screener-filters-explained', title: 'Stock Screener Filters Explained: P/E, ROE, P/B and More' },
  { slug: 'nasdaq-stock-screener', title: 'NASDAQ Stock Screener: How to Filter NASDAQ Stocks Free' },
  { slug: 'nyse-vs-nasdaq-stock-picking', title: 'NYSE vs NASDAQ: Key Differences Every Stock Picker Should Know' },
  { slug: 'how-to-screen-tech-stocks-for-value', title: 'How to Screen Tech Stocks for Value: High ROE Technology Stocks' },
];

async function slot1PremarketBlog(env) {
  // Pick article based on day-of-week so each day rotates
  const dayIndex = new Date().getDay();
  const article = BLOG_ARTICLES[dayIndex % BLOG_ARTICLES.length];

  const gainersRaw = await fetchFMP("stock_market/gainers", {}, env);
  const gainers = (Array.isArray(gainersRaw) ? gainersRaw : []).slice(0, 3);
  const gainerNames = gainers.length
    ? gainers.map(g => g.ticker).join(", ")
    : "markets moving";

  const link = `${SITE_URL}/blog/${article.slug}`;
  const prompt = `Write a single tweet (max 240 chars) for US stock investors. Morning pre-market tone. Promote this free guide: '${article.title}'. Link: ${link}. Trending tickers today: ${gainerNames}. End with #StockScreener #USStocks. Sound sharp and professional.`;
  const fallback = `📈 Pre-market read: ${article.title}\n\nFree guide for US investors → ${link}\n\n#StockScreener #USStocks`;

  const tweet = await aiTweet(prompt, env, fallback);
  await postTweet(tweet, env);
}

async function slot2GainerSpotlight(env) {
  const gainers = await fetchFMP("stock_market/gainers", {}, env);
  const top = gainers[0] || { ticker: "SPY", changesPercentage: 1.2, name: "S&P 500 ETF" };
  const { ticker, changesPercentage: pct, name } = top;

  const prompt = `Write a single tweet (max 240 chars) for US investors. Highlight that $${ticker} (${name}) is up ${Number(pct).toFixed(1)}% today. Tell them to screen for more breakout stocks at ${SITE_URL}. Sound like a savvy trader. Include #${ticker} #Stocks #StockScreener.`;

  const tweet = await aiTweet(prompt, env);
  await postTweet(tweet, env);
}

// Screen pages to rotate through in slot 3
const SCREEN_PAGES = [
  { slug: 'high-roe-stocks', tip: 'Return on Equity > 18%', use: 'find businesses generating strong returns on shareholder capital' },
  { slug: 'low-debt-stocks', tip: 'Debt-to-Equity < 0.5', use: 'screen for financially healthy companies with balance sheet flexibility' },
  { slug: 'dividend-stocks', tip: 'Dividend Yield filter', use: 'find income-paying US stocks on NYSE & NASDAQ' },
  { slug: 'low-pe-stocks', tip: 'P/E Ratio < 15', use: 'filter undervalued stocks before earnings season' },
  { slug: 'high-net-margin-stocks', tip: 'Net Margin > 20%', use: 'surface companies with strong pricing power and lean cost structures' },
  { slug: 'undervalued-tech-stocks', tip: 'P/E + ROE combo filter', use: 'find profitable tech stocks at reasonable valuations' },
  { slug: 'nasdaq-high-roe-stocks', tip: 'NASDAQ + ROE > 20%', use: 'spot high-quality growth names on NASDAQ before the crowd' },
];

async function slot3ScreenerTip(env) {
  const today = new Date().toISOString().slice(0, 10);
  const hash = [...today].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
  const screen = SCREEN_PAGES[Math.abs(hash) % SCREEN_PAGES.length];
  const link = `${SITE_URL}/screens/${screen.slug}`;

  const prompt = `Write a single educational tweet (max 240 chars) for US retail investors. Explain how to use '${screen.tip}' to ${screen.use}. Tell them DeltaScreener has this screen ready to use — free: ${link}. Tone: helpful, knowledgeable. End with #Investing #StockScreener #USStocks.`;

  const tweet = await aiTweet(prompt, env);
  await postTweet(tweet, env);
}

async function slot4SectorMomentum(env) {
  const sectors = await fetchFMP("sector-performance", {}, env);
  let prompt;

  if (Array.isArray(sectors) && sectors.length) {
    const sorted = [...sectors].sort((a, b) =>
      parseFloat(b.changesPercentage || 0) - parseFloat(a.changesPercentage || 0)
    );
    const top = sorted[0];
    const secName = top.sector || "Technology";
    const secPct = top.changesPercentage || "1.5";
    prompt = `Write a single tweet (max 240 chars) for US stock investors. The ${secName} sector is leading today at +${secPct}%. Tell them to screen ${secName} stocks on DeltaScreener (${SITE_URL}). Sound like a market analyst. Include #${secName.replace(/\s+/g, "")} #SectorRotation #Stocks.`;
  } else {
    prompt = `Write a single tweet (max 240 chars) for US investors about sector rotation strategy. Mention DeltaScreener (${SITE_URL}) as the tool to find leading sectors. Include #SectorRotation #Investing #StockScreener.`;
  }

  const tweet = await aiTweet(prompt, env);
  await postTweet(tweet, env);
}

async function slot5EodRecap(env) {
  const [gainersRaw, losersRaw] = await Promise.all([
    fetchFMP("stock_market/gainers", {}, env),
    fetchFMP("stock_market/losers", {}, env),
  ]);

  const gainers = Array.isArray(gainersRaw) ? gainersRaw : [];
  const losers = Array.isArray(losersRaw) ? losersRaw : [];
  const gNames = gainers.slice(0, 3).map(g => `$${g.ticker}`).join(", ") || "$SPY";
  const lNames = losers.slice(0, 3).map(l => `$${l.ticker}`).join(", ") || "$QQQ";

  const prompt = `Write a single end-of-day recap tweet (max 240 chars) for US investors. Today's top gainers: ${gNames}. Notable losers: ${lNames}. CTA: Use DeltaScreener (${SITE_URL}) to build your watchlist for tomorrow — it's free. Tone: confident, helpful. End with #StockMarket #USStocks #StockScreener.`;
  const fallback = `📊 EOD Recap\n\n🟢 Top gainers: ${gNames}\n🔴 Notable losers: ${lNames}\n\nBuild your watchlist for tomorrow → ${SITE_URL}\n\n#StockMarket #USStocks #StockScreener`;

  const tweet = await aiTweet(prompt, env, fallback);
  await postTweet(tweet, env);
}
