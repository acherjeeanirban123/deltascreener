# DeltaScreener Infrastructure Roadmap: Cloudflare → AWS → OVH

**Status as of 2026-08-12: Complete.** Production runs on OVH. AWS is a warm rollback. Cloudflare Worker/D1 is retired from traffic but not deleted.

This supersedes the original planning doc (`VPS_MIGRATION_ROADMAP.md`), which sketched a direct Cloudflare → single-VPS move before AWS turned out to be the first stop. This document records what actually happened across both hops, plus what's still open.

---

## Phase 0 — Original architecture (Cloudflare)

- **Frontend:** Cloudflare Pages, `deltascreener.com`
- **API:** Cloudflare Worker (`worker-d1-upload.js`), edge-deployed
- **Database:** Cloudflare D1 (SQLite), plus KV for caching
- **Data source:** FMP (Financial Modeling Prep)

This was cheap and zero-ops for a long time — until it wasn't.

### Why it ended: the $154.66 billing incident

Invoice IN-72436326 (Jun 22 – Jul 21 2026) billed **151.07 billion D1 rows read** against a table of ~4,900 tickers. Root cause was two compounding bugs:

1. A maintenance cron trigger firing every 60 seconds instead of every 15 minutes (43,200 runs/month).
2. A SQL readiness predicate expanding into 17 correlated `json_each()` subqueries per row, each row costing ~170 counted row reads — a single `COUNT(*)` on this predicate read ~800,000 rows against a 4,900-row table.

A coverage-statistics function called that predicate up to 4 times per cron run: ~6M rows read/minute, continuously, for the full billing cycle.

The immediate fix (cron interval, caching, indexes) shipped Jul 30 2026 and stopped the bleeding, but it also surfaced the deeper problem: D1's per-row billing model has no ceiling on how badly a query bug can hurt you, and Workers' request-scoped execution model made background jobs (cron-driven refreshes, coverage stats) awkward to reason about and easy to get wrong. That's what motivated a real backend, not just a bug fix.

---

## Phase 1 — Migration to AWS Lightsail

**Goal:** replace the Worker + D1 + KV stack with a conventional single-VPS monolith — Node + Postgres + Redis + Nginx — matching the architecture pattern screener.in and similar single-box products use, sized for a US-market audience.

**What shipped:**

- **Server:** AWS Lightsail, `44.213.148.192`, Ubuntu 24.04, 1 GB RAM / 2 vCPU / 40 GB.
- **Bridge architecture, not a rewrite:** rather than reimplementing the Worker's routing/screener/auth logic, `index.js` wraps `worker-d1-upload.js` unchanged behind an Express server that converts HTTP requests into the `Request`/`Response` objects the Worker's `fetch()` handler expects. This kept the business logic (already tested, already correct) untouched and confined all the porting work to the environment shim.
- **`env.js` + adapters:** `adapters/d1-postgres.js` shims the D1 query API on top of Postgres so the Worker code's `env.DB`/`env.SP_DB` calls work unmodified. `adapters/kv-redis.js` does the same for `env.KV`/`env.SP_CACHE`, backed by Redis with an in-memory fallback if Redis is unreachable.
- **Data migration:** D1 → Postgres via schema translation and a verified import (row counts + spot checks against `data-audit`-style comparisons).
- **Systemd services:** `deltascreener-api` and `deltascreener-cron` (replacing the Cloudflare Cron Trigger), both memory-capped (`MemoryMax=400M` / `300M`) since the box only has 1 GB total.
- **Nginx + Let's Encrypt:** reverse proxy on `api-vps.deltascreener.com`, TLS via certbot, rate limiting, security headers.
- **Hardening:** `ufw` locked to Cloudflare's published IP ranges on 80/443 (origin can't be hit directly, only through the Cloudflare proxy), SSH key-only, `ds-backup.timer` (daily Postgres dumps, 7 daily + 4 weekly retained), `ds-healthcheck.timer` (5-minute `/health` probe with auto-restart on a wedged process — `systemd`'s `Restart=always` only catches processes that exit, not ones that hang).
- **Cutover:** frontend's API base URL switched from the Worker to `api-vps.deltascreener.com`. Cloudflare Worker + D1 kept running, untouched, as the rollback path and the only fully independent off-box copy of the data.

AWS Lightsail became production for the intervening period. The 1 GB box held up, but its size shaped a lot of the operational detail above (aggressive memory caps, careful cron scheduling to avoid overlapping the daily backup).

---

## Phase 2 — Migration to OVH

**Motivation:** longer-standing intent to end up on OVHcloud, blocked for an extended period on KYC/identity verification (a document-address-mismatch issue). Once verification cleared, the second hop — AWS → OVH — followed the same playbook as Cloudflare → AWS, but on a bigger box and with the benefit of already having a working template to replicate.

**What shipped (2026-08-11 – 2026-08-12):**

- **Server:** OVH VPS-2 2027, `149.56.102.211`, Ubuntu 24.04, 4 vCores / 8 GB RAM / 75 GB — 8x the RAM of the AWS box.
- **Provisioning:** OVH's manager UI, SSH key baked in at reinstall time (OVH doesn't expose the root password directly through the manager, so the reinstall-with-SSH-key flow substituted for the usual first-boot password retrieval).
- **Bootstrap (`ovh-bootstrap.sh`):** the first time this stack's setup was captured as a script rather than ad hoc commands — Node 22, Postgres, Redis, Nginx, certbot, ufw, 2 GB swap, `deltascreener` system user, all idempotent so a partial run is safe to re-run.
- **Code deploy:** same `server/` tree (bridge architecture unchanged), `deploy/` unit files copied as-is.
- **Data migration:** `pg_dump --clean --if-exists --no-owner` from AWS, piped through gzip, relayed via an intermediate hop, restored on OVH.
  - **Bug found & fixed:** the restore ran as the `postgres` superuser, so every table ended up owned by `postgres` instead of `deltascreener` — the app's DB role had no grants. This silently broke every DB-backed endpoint (`overview`, `search`, `screener` all fell back to error responses) until ownership and privileges were reassigned.
- **TLS:** same certbot flow, with the same "Cloudflare proxy must be OFF during initial HTTP-01 issuance, ON afterward" inversion documented from the AWS setup. Cert valid to 2026-11-09.
- **Verification (`compare-prod.js`):** diffed OVH against live AWS production across health, search, screener, ratios, financials, and 10 tickers' overview data. After the ownership fix, everything matched except live quote fields (expected — both boxes poll FMP independently during market hours).
  - **Bonus finding:** AWS production was returning `null` for `avgVolume` and `description` on every ticker's overview endpoint — a pre-existing bug unrelated to this migration, which OVH doesn't have.
- **Cutover:** frontend API origin switched from `api-vps.deltascreener.com` to `api-ovh.deltascreener.com` across all 9 files that hardcode it (client + 8 SSR Pages Functions).
  - **Bug found & fixed:** the CSP `connect-src` header never included `api-vps.deltascreener.com` at all — only the old Worker domain and the fallback Worker URL. This means real browsers may have been silently blocking every client-side API call since the original Cloudflare → AWS cutover, with only server-rendered pages (which aren't subject to browser CSP) working reliably. Fixed by adding both `api-ovh` and `api-vps` (rollback) to the allowlist. Verified with a real browser session afterward: zero console errors, zero CSP violations, all API calls returning 200.
- **Resilience parity:** `ds-backup.timer`, `ds-healthcheck.timer`, and the Cloudflare-IP-only `ufw` lockdown — all present on AWS since Phase 1 — replicated and verified on OVH (backup produces a valid 43 MB dump that passes integrity checks; healthcheck runs clean; direct-origin access now times out while Cloudflare-proxied traffic works normally).

---

## Current state (2026-08-12)

| Component | Primary | Rollback | Retired |
|---|---|---|---|
| API | OVH (`api-ovh.deltascreener.com`) | AWS (`api-vps.deltascreener.com`) | Cloudflare Worker (`api.deltascreener.com`) |
| Database | OVH Postgres | AWS Postgres | Cloudflare D1 |
| Frontend | Cloudflare Pages (unchanged throughout) | — | — |

Rollback to AWS is a single `git revert` + redeploy (see `server/RUNBOOK.md`). Rollback to the Cloudflare Worker is also documented and requires no CSP change, since the Worker origin was never removed from the allowlist.

---

## Open items / what's next

**Goal: OVH-only.** The user has stated the end state is running solely on OVH — no Cloudflare, no AWS. The items below track the path there.

1. ~~AWS and OVH Postgres will drift~~ — **Resolved 2026-08-12.** AWS's `deltascreener-cron` service was stopped and disabled, freezing its data as of that date. It remains a usable (if increasingly stale) emergency rollback until decommissioned.
2. **Decommission AWS + Cloudflare Worker/D1 — targeted for 2026-08-26.** A 2-week OVH burn-in period was set on 2026-08-12; both are targeted for the same decommission date rather than staggering them. A scheduled check-in (`deltascreener-decommission-check`) runs on 2026-08-26 to verify OVH has been stable, then asks for explicit confirmation before touching either — AWS termination and Cloudflare Worker/D1 deletion are both irreversible-ish actions that need a fresh yes at the time, not just the pre-approval from today.
3. ~~Memory caps on OVH sized for the old AWS box~~ — **Resolved 2026-08-12.** Raised via a systemd drop-in on OVH to `MemoryMax=1536M`/`MemoryHigh=1200M` (API) and `1024M`/`800M` (cron), appropriate for the 8 GB box. AWS's units were left untouched since that box is still on 1 GB.
4. ~~Backups still same-disk / no off-box copy~~ — **Resolved 2026-08-12.** OVH's VPS includes a free daily whole-instance backup (already active, separate from the live disk) and was upgraded to Premium (7-day rolling history, ₹207/mo). Combined with the local `ds-backup.timer` pg_dumps, this covers both "bad migration" and "lost the instance" scenarios without needing a separate S3/B2 pipeline — Zerodha's engineering team (same philosophy as the screener.in-style architecture this project follows) uses the equivalent pattern (EC2 disk snapshots) at much larger scale, so this isn't a corners-cut decision.
5. **No off-box monitoring.** `ds-healthcheck.timer` restarts a wedged process locally, but nothing pages the user if the box itself goes dark. An external uptime check (UptimeRobot or similar, hitting `/health` from outside) was in the original plan and never landed. Still open — not blocking the OVH-only goal, but worth doing before AWS (which had no such monitoring either) is gone and OVH is the only thing standing.
