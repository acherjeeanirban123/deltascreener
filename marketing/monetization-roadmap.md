# DeltaScreener — Free vs Pro Roadmap
*Written July 2026. Current state: Pro $5/mo via Gumroad, ~131 active users/28d, 3 sign-ups/28d, 0 paying.*

## Audit: what Pro claims vs what code enforces

| Pro modal claim | Actually enforced? |
|---|---|
| Unlimited saved screens | ❌ Free users already have unlimited (no cap in worker) |
| Export to Excel & CSV | ✅ Gated (`exportScreenerResults` checks Pro) |
| Email alerts on price & filters | ❌ Alerts are fully free, no cap |
| Priority support | — (not meaningful yet) |
| *(unlisted)* Financials beyond 5 years | ✅ Gated (blurred columns) |

**Conclusion:** Pro currently sells one real thing (Excel export). The free tier competes with Pro because the two headline features are accidentally free.

## Principle

Free = everything that creates **traffic, habit, and sign-ups** (the growth engine).
Pro = everything that creates **recurring workflow value for a serious investor** (things they'd miss weekly).
Never gate anything Google indexes.

## FREE forever (the growth engine)

- Screener: all 50+ ratios, unlimited runs, unlimited result browsing
- All 100 prebuilt screens + community screen pages (SEO — never gate)
- Stock pages, charts, news, watchlist (unlimited)
- 5 years of financial history
- Sign-in, synced preferences
- **Saved screens: cap at 3** (was unlimited — this creates the first real upgrade trigger)
- **Active alerts: cap at 2** (was unlimited — second trigger)
- CSV copy of current visible page (25 rows) — tease the full export

## PRO — $5/mo or $39/yr (annual = the real push)

### Phase 0 — this week (make existing promises true)
1. Enforce free caps in worker: 3 saved screens, 2 active alerts → return `upgrade_required` error; frontend shows Pro modal
2. Excel export (already gated) — extend to full 2,000-row export with all selected columns
3. 10-year financial history (already gated at 5) — advertise it in the modal; it's currently a hidden Pro feature
4. Rewrite Pro modal + /pricing to match reality: "Unlimited screens & alerts · Full Excel export · 10-yr financials"
5. Add annual plan on Gumroad ($39/yr, "2 months free")

### Phase 1 — next month (the flagship: screen alerts)
**"Email me when a new stock enters my screen."**
- Daily cron already exists (worker runs every minute; add a daily digest job)
- For each Pro user's saved screen: run conditions, diff against yesterday's matches, email new entrants/exits
- No competitor offers this at $5. Finviz charges $39.50/mo for similar. This becomes the #1 reason to pay.
- Free users see the toggle greyed out with "Pro" badge on every saved screen row (constant, honest exposure)

### Phase 2 — 2–3 months (depth)
- Bulk export: all screens, all columns, one click
- Saved column layouts + saved sorts synced per screen
- Fundamental data downloads per stock (10-yr statements as xlsx)
- Watchlist daily email digest

### Phase 3 — 3–6 months (only if traffic materializes)
- API access (rate-limited key, $15/mo tier or Pro add-on)
- Screen backtest-lite: "this screen's picks 1 year ago returned X%" on screen pages (also a killer SEO/content feature — publish the numbers)

## Upgrade triggers (where the modal appears)
- Saving 4th screen
- Creating 3rd alert
- Clicking Download Excel
- Clicking a blurred 6th-year financial column (exists)
- Toggling "Alert me" on a saved screen (Phase 1)

## What NOT to do
- Don't gate the screener itself, prebuilt/community pages, or stock pages — they are the acquisition engine
- Don't add ads at this traffic level (pennies, hurts trust and conversion)
- Don't raise the price yet — $5 is the trust-builder; raise only after screen alerts ship
- Don't chase enterprise/API buyers before there's retail traction

## The math to keep in mind
Revenue = traffic × sign-up rate × Pro conversion × price.
Today: ~130 × 2% × ~0 × $5 ≈ $0 — the leftmost number is the problem, and the SEO work targets exactly that.
At 5,000 monthly visitors: 5,000 × 3% signup × 4% Pro × $5 ≈ $30/mo → annual plans and screen alerts push conversion toward 8–10%.
