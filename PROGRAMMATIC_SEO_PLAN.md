# DeltaScreener — Programmatic SEO Plan

*Goal: turn the site's traffic from ~24 real users/month into a search-engine-fed funnel that can realistically support $50–500/month in Pro revenue within 12 months. The single lever is **organic traffic from Google**, not new features.*

---

## 1. Where you are today (the honest baseline)

**What's already built — and it's good.** You are not starting from zero. The infrastructure is most of the hard part:

- **Individual stock pages** — `/stock/[ticker]` with server-side rendered content for ~5,000 US tickers. Already in the sitemap.
- **14 curated screen pages** — `/stocks/[slug]` (high-roe-stocks, low-pe-stocks, dividend-stocks, etc.), each with full SSR, a results table, methodology, FAQ, and rich JSON-LD (`CollectionPage`, `BreadcrumbList`, `ItemList`, `FAQPage`).
- **Indexability guard** — screen pages with fewer than 3 results auto-set `noindex`, so you never ship thin pages to Google.
- **Dynamic sitemap** — `/sitemap-stocks.xml` pulls up to 5,000 tickers live, edge-cached 6h, with a poison-cache guard (won't cache a partial result).
- **A hub** — `/stocks` groups screens by cluster for internal linking.

**What's missing — and it's why there's no revenue.** Two problems, both about traffic, not product:

1. **Almost no indexed long-tail pages.** 14 screen pages is a rounding error. Programmatic SEO wins by *volume* of specific, low-competition queries. You're competing for "high roe stocks" (hard, dominated by Finviz/Stock Analysis) instead of owning thousands of "high roe semiconductor stocks under $50" style queries (nearly uncontested).
2. **Audience mismatch.** GA shows your real visitors skew India, but the product is US equities. SEO fixes this automatically — Google sends US searchers to US-stock pages. You don't need to chase your current audience; you need to *replace* it with search intent.

---

## 2. The strategy in one sentence

**Mass-generate every defensible `metric × sector × exchange × price-tier` screen permutation as its own SSR page, link them tightly, and let the existing indexability guard keep quality high — then make sure Google crawls all of it.**

You already have the rendering engine (`renderScreenPage`). The plan is to feed it hundreds-to-thousands of programmatically generated screen definitions instead of 14 hand-written ones.

---

## 3. Page types, in priority order

### Tier 1 — Sector-sliced metric screens (build first)
This is the highest-leverage, lowest-risk expansion because it reuses your exact schema.

Take your existing metrics (ROE, ROA, net margin, PE, PB, debt, dividend) and cross them with **sector**:

```
high-roe-technology-stocks
high-roe-healthcare-stocks
high-roe-energy-stocks
low-pe-financial-stocks
dividend-utility-stocks
low-debt-industrial-stocks
...
```

- ~8 metrics × ~11 GICS sectors = **~88 pages** from one generator.
- Each targets a real, searched, low-competition query ("high dividend utility stocks", "low pe energy stocks").
- The `results.length >= 3` guard auto-drops any combo that's too thin — so junk pages never publish.

### Tier 2 — Price-tier and exchange slices
Layer a second dimension onto the Tier-1 pages:

```
high-roe-tech-stocks-under-10
high-roe-tech-stocks-under-50
nasdaq-high-roe-stocks
nyse-dividend-stocks
penny-stocks-under-5
```

Price tiers ("under $5/$10/$20/$50") and exchanges (NASDAQ/NYSE) are extremely high-intent search modifiers. This multiplies Tier 1 by ~5–8×, gated by the same thin-page guard.

### Tier 3 — "Best / top N" listicle variants
Same data, different query intent. Searchers type "best dividend stocks" far more than "dividend stocks":

```
best-dividend-stocks
top-10-low-pe-stocks
best-high-roe-tech-stocks
```

Render these as ranked lists (you already sort) with the same JSON-LD. Lower priority because it overlaps Tier 1 keywords, but cheap to add once the generator exists.

### Tier 4 — Stock-page enrichment (you already have these, make them rank)
Your 5,000 `/stock/[ticker]` pages are the long tail's long tail. People search "AAPL ROE", "NVDA dividend", "is TSLA overvalued". Ensure each stock page has:
- A unique, keyword-rich `<title>` and meta description (ticker + company name + key metric).
- Distinct SSR body content (not a shared template paragraph) — Google penalizes near-duplicate pages.
- Internal links *from* relevant screen pages *to* the stock (already partly done via results tables).

### Tier 5 — Comparison pages (later, optional)
`/compare/aapl-vs-msft` style pages capture "X vs Y stock" queries. High effort, build only after Tiers 1–3 are indexing well.

---

## 4. Generation approach (how to build it)

You do **not** need a new system. You need a generator that produces `SCREEN_PAGES`-shaped objects instead of hand-writing them.

1. **Define dimension tables** in `_lib/seo.js` (or a new `_lib/screen-gen.js`):
   - `METRICS` — the 7–8 you already use, with their condition templates, copy snippets, and FAQ templates.
   - `SECTORS` — GICS sectors + the screener condition that filters to each.
   - `PRICE_TIERS` — under 5/10/20/50/100.
   - `EXCHANGES` — NASDAQ, NYSE.

2. **A `generateScreens()` function** that does the cartesian product, builds the `slug`, `title`, `h1`, `intro`, `metaDescription`, `conditions`, `sort`, `related`, and `faqs` from templates, and returns the array. Merge generated screens with your 14 hand-curated ones (hand-curated win on slug collision — they have better copy).

3. **Templated-but-not-identical copy.** This is the one place to be careful. Google tolerates templated programmatic pages *if each has genuinely useful, differentiated data* (your live results table does this). But vary the intro/FAQ wording by metric and sector so the boilerplate ratio stays low. A few sentence variants per metric, picked by a hash of the slug, is enough.

4. **`SCREEN_LOOKUP` stays the key→object map** the route handler already uses — no route changes needed. `/stocks/[[slug]].js` works unchanged.

5. **Keep the `>= 3 results` guard.** It's your quality firewall. With sector × price-tier combos, many will legitimately be empty (no penny-stock utilities with 18% ROE) — the guard noindexes them silently. Good.

---

## 5. Sitemap & indexing setup

Getting pages *built* is half the job; getting Google to *crawl* them is the other half.

1. **Add a screens sitemap.** You have `/sitemap-stocks.xml` (tickers) and `/sitemap-pages.xml` (static). Generate `/sitemap-screens.xml` from `generateScreens()`, listing only the indexable ones. Wire it into the `/sitemap.xml` index. Same edge-cache + health-guard pattern as the stocks sitemap.

2. **Only list indexable screens in the sitemap.** Run the same results check (or a cached count) so you never submit a noindex page. Submitting thin pages wastes crawl budget.

3. **Submit all three sitemaps in Google Search Console.** If GSC isn't verified for deltascreener.com yet, that's step zero — without it you're flying blind on what's indexed and what queries you rank for.

4. **Internal linking is the crawl engine.** Google discovers pages via links far better than via sitemaps alone:
   - The `/stocks` hub should link to every cluster, each cluster to its screens.
   - Each screen's `related[]` should point to 3–5 sibling screens (sector siblings, price-tier siblings).
   - Stock pages should link back up to the screens they appear in.
   - Add a footer or hub "browse by sector / by price" block.

5. **`robots.txt` is fine** — it already allows `/stocks/*` and `/stock/*` and blocks only the JS app query params. Confirm the new sitemap is referenced.

6. **Pace the rollout.** Don't drop 5,000 new URLs in one day — it looks spammy and Google throttles. Ship Tier 1 (~88 pages), wait 2–3 weeks for indexing, then Tier 2, etc. The sitemap `lastmod` and a steady publish cadence signal a healthy growing site.

---

## 6. 12-month roadmap

| Month | Focus | Deliverable | Target |
|---|---|---|---|
| **0** | Foundations | Verify Google Search Console; submit existing sitemaps; confirm all 14 screens + 5,000 stock pages indexed | Baseline indexing data |
| **1** | Generator | Build `generateScreens()` + dimension tables; ship **Tier 1** (~88 sector × metric pages); add `/sitemap-screens.xml` | ~100 indexable screen pages live |
| **2–3** | Tier 2 | Add price-tier + exchange dimensions (~400–700 pages); strengthen internal linking (hub, related, footer browse) | 500+ screen pages; first organic clicks |
| **3–4** | Stock pages | Make all 5,000 stock pages uniquely titled + differentiated SSR content; link from screens | Long-tail ticker queries start ranking |
| **5–6** | Tier 3 | "Best / top N" listicle variants; refresh thin/under-performing pages; prune dead combos | First Pro conversions from organic |
| **7–9** | Content moat | A handful of genuinely written guide/blog posts per cluster (you have a blog engine) to earn links and topical authority | Domain authority climbs; rankings firm up |
| **10–12** | Scale + comparisons | Comparison pages (Tier 5) if data supports; double down on whatever queries GSC shows are converting | Compounding traffic; $50–500/mo realistic |

---

## 7. The revenue math (why this is worth it)

This is a funnel, and each stage has a brutal conversion rate — which is exactly why **volume of indexed pages** is the only lever that moves the bottom line.

- Programmatic SEO sites commonly see **1–3% of indexed pages** drive meaningful traffic, and a long-tail page might pull **5–50 visits/month** once ranked.
- Say you get **1,000 indexable pages** live and indexed. If even **300** rank and average **20 visits/mo**, that's **~6,000 organic visits/month** — vs your current ~24.
- Screener Pro conversion on engaged finance traffic runs **~0.5–2%**. At 6,000 visits and 1% → **~60 trials/signups worth of intent**; at $5/mo and even a 10–30% buy rate → **$30–90/month**, climbing as pages age and rankings compound.
- Hitting the **$500/mo** end of the range needs roughly **30,000–50,000 organic visits/month**, which is achievable in year 2 if the page base keeps growing and a few clusters rank well.

The numbers are sensitive to ranking success, but the shape is clear: **at 24 visits/month you cannot earn anything; at thousands you can.** Every page is a lottery ticket that costs you near-zero to generate because the engine already exists.

---

## 8. What to do this week

1. **Verify Google Search Console** for deltascreener.com and submit `/sitemap.xml`. (If already verified, pull the Performance + Coverage reports — that tells us exactly what's indexed and ranking.)
2. **Approve the generator approach** — I can build `generateScreens()` and ship Tier 1 (~88 pages) on top of your existing `renderScreenPage` with no route changes.
3. **Don't touch the product.** No new features needed. Traffic is the whole game.

---

*Built on the existing DeltaScreener stack: Cloudflare Pages Functions SSR, `_lib/seo.js` screen engine, dynamic sitemaps, D1/KV. No architectural changes required — this is additive.*
