# DeltaScreener — Money Playbook

Three parts: (1) a backlink starter kit you post manually, (2) what I found auditing your conversion funnel, (3) monetization mechanics. The honest headline: your funnel and pricing are already well built. The bottleneck is **traffic volume + domain authority**, not the mechanics. Backlinks (Part 1) are the highest-leverage thing you can do this week.

---

## PART 1 — Backlink Starter Kit (do this)

Goal: get other sites linking to deltascreener.com so Google trusts the domain and your pages start ranking. Reddit links are `nofollow` (no direct authority) but they drive real humans, who then link to you from blogs/forums that *do* pass authority. Product Hunt and blog mentions pass authority directly.

### A. Three Reddit answers (helpful-first, soft link)

Post these as genuine replies in threads where someone is asking the question. Don't drop them cold. Search each subreddit for matching threads first (r/investing, r/stocks, r/StockMarket, r/ValueInvesting, r/dividends).

**Answer 1 — for "best free stock screener?" type threads**
> I bounced between a few before settling. Finviz is the classic but the free tier caps a lot of filters. I've been using DeltaScreener lately for US stocks — it's free with no signup, has ~30 fundamental filters, and the company pages show 10-year financials which most free tools hide. Worth a look: deltascreener.com. Whatever you pick, the thing that matters is being able to filter on the metrics *you* actually care about (ROE, debt, margins) rather than just price/volume.

**Answer 2 — for "how do I find undervalued / high-ROE stocks?" threads**
> Quick framework that works for me: screen for high ROE (>15-20%), low debt-to-equity (<0.5), and a P/E below the sector median — that combination tends to surface quality businesses that aren't overpriced. You can run exactly that on most screeners. I use deltascreener.com/stocks for the pre-built screens (there's a high-ROE-low-debt one), but the method matters more than the tool. Then read the actual 10-K before buying anything the screen spits out.

**Answer 3 — for "is [TICKER] a good buy?" / single-stock threads**
> Before forming an opinion I'd pull up its fundamentals side by side with peers — ROE, net margin, P/E, debt trend over a few years. A clean way to see all of that on one page is deltascreener.com/stock/[TICKER] (free, no login). The number I'd watch on [TICKER] specifically is [margin / debt / whatever's relevant]. Not advice, just where I'd start.

> Tip: rotate the link target. Sometimes link the homepage, sometimes a screen page, sometimes a stock page. Natural link profiles aren't all to one URL.

### B. Product Hunt launch blurb

**Tagline (60 char max):** Free US stock screener — no signup, 10-year financials

**Description:**
> DeltaScreener is a free stock screener for the US market. Filter 5,000+ stocks on 30+ fundamentals (ROE, P/E, margins, debt), no signup or credit card required. Every company gets a full page with 10-year financial history, valuation ratios, and peer comparison. Built for investors who want quality data without a paywall on the basics. Pro ($5/mo) adds saved screens, Excel export, and email alerts — but the core screener is free forever.

**First comment (you post this right after launching):**
> Maker here 👋 I built this because every free screener either caps the useful filters or hides the financial history behind a login. DeltaScreener keeps the core free and no-signup. Happy to answer anything about the data sources or the filters — and I'd love feedback on what's missing.

> Launch on a Tuesday–Thursday, 12:01am PT. Line up 5-10 people to upvote + comment in the first hour. A PH feature = a real dofollow backlink + a traffic spike.

### C. Blog-pitch email template

Send to finance/investing bloggers and newsletter writers who've written "best stock screener" roundups. Find them by Googling: `best free stock screener 2026` and emailing the authors of the listicles.

> **Subject:** Free screener for your "best stock screeners" roundup
>
> Hi [Name],
>
> I read your piece on [best free screeners / specific article] — useful list. I built a free US stock screener, DeltaScreener (deltascreener.com), that might fit alongside the tools you covered.
>
> What's different: it's free with no signup, has 30+ fundamental filters, and every stock gets a full page with 10-year financials and peer comparison — things most free tools gate. There's a $5/mo Pro tier but the core is free forever.
>
> If it's a fit for an update to your roundup, I'd be glad to send screenshots or answer anything. Either way, keep up the good work.
>
> Thanks,
> Anirban — DeltaScreener

> Send ~10-15 of these. A 10% response rate and 2-3 placements in roundups would meaningfully move your domain authority. These are the dofollow links that actually count.

---

## PART 2 — Conversion Funnel Audit

I read the live paywall logic (`src/app5.js`). The mechanics are genuinely good:

- On-site Gumroad overlay checkout (stays on deltascreener.com, no redirect away).
- Post-purchase **auto-unlock**: polls pro-status and flips the user to Pro with zero retyping.
- Verify-by-email fallback, Enter-key support, cached 5-min Pro status.
- Paywall triggers on: Excel/CSV export, the 4th saved screen, and old financial-history columns (blurred + lock icon).

**The real issue is the shape of the funnel, not its plumbing.** Three observations:

1. **The paywall only fires on power-user actions.** Export, saving a 4th screen, viewing 10-year financials — these are things a visitor does *after* they're already hooked. A brand-new visitor at position-62 traffic levels almost never reaches them. So even a perfect checkout converts almost nobody, because almost nobody arrives at the trigger.

2. **Pro is under-advertised to the people most likely to buy.** The "Upgrade" pill is in the nav, and there's a footer Pricing link — but the high-value stock pages (your strongest pages by impressions) have no Pro mention at all. Someone reading a full NVDA financials page is exactly who'd pay for export + alerts, and they're never told it exists.

3. **No email capture for non-buyers.** A visitor who isn't ready to pay $5 today leaves and never comes back. There's no "get this screen emailed weekly" or newsletter signup to recapture them. Email is how you convert later.

**Highest-value funnel fixes (cheap, I can build these):**

- Add a soft Pro mention on stock pages near the financials ("See 10-year history + export → Pro"). Catches high-intent readers.
- Add a one-field email capture ("Get the top high-ROE stocks emailed weekly") on screen pages — builds a list you can convert over time, and is itself a reason to come back (return visits help SEO).
- Add a subtle "Export to Excel" button on the screener results header even for free users — clicking it opens the upgrade modal. It *advertises* the Pro feature instead of hiding it until someone hunts for it.

---

## PART 3 — Monetization Mechanics Review

**Current model:** $5/mo Pro via Gumroad. Free = screener + filters + company pages + 10yr financials, no signup. Pro = unlimited saved screens, Excel/CSV export, email alerts, unlimited watchlists, priority support, 30-day money-back.

This is a sound model. Notes:

- **Price is fine, maybe low.** $5/mo is impulse-tier — good for conversion, but it means you need volume. At $5, 100 subscribers = $500/mo. You won't get there on conversion tweaks alone; you get there on traffic (Part 1). Don't raise the price yet — at low traffic, removing friction matters more than ARPU.
- **Annual plan missing.** Add a $39–49/year option (≈30% discount). Annual buyers churn far less and pay upfront. Easy win on Gumroad.
- **Ads: still too early.** Display ads need ~10k+ sessions/month to make meaningful money and they hurt the premium feel that justifies Pro. Revisit once you're past ~10k monthly sessions. For now, Pro is the right single focus.
- **Affiliate angle (later):** broker signup affiliates (e.g. "open a brokerage account") pay far more per conversion than display ads and fit a screener audience. Worth exploring once traffic is real.

**Bottom line on money:** the order is (1) traffic + authority via backlinks, (2) email capture to recapture non-buyers, (3) advertise Pro on high-intent pages, (4) add an annual plan. Ads and affiliates come later. Nothing here is blocked by your tech — it's blocked by how many people see the site.

---

## What I can build right now (say the word)

- Stock-page Pro nudge near financials
- Email-capture field on screen pages
- Visible "Export to Excel" button (opens upgrade modal for free users)
- Annual plan on the pricing page

The Reddit/PH/email work in Part 1 is yours to post — that's the part only you can do, and it's the one that actually moves the needle.
