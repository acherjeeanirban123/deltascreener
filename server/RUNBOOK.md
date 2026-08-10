# DeltaScreener VPS — Runbook

Server: `44.213.148.192` (AWS Lightsail, Ubuntu 24.04, 1 GB RAM / 2 vCPU / 40 GB)
API: https://api-vps.deltascreener.com (Cloudflare-proxied)

Written for the version of you that is looking at this during an incident.

---

## Quick triage

```bash
ssh ubuntu@44.213.148.192

curl -s localhost:8787/health            # is the app answering?
systemctl status deltascreener-api       # is the process up?
free -m                                  # memory + swap
journalctl -u deltascreener-api -n 50    # recent errors
```

| Symptom | Most likely cause | Go to |
|---|---|---|
| API returns nothing / times out | process wedged or OOM-killed | [API down](#api-down) |
| 502 from Cloudflare | node down, nginx up | [API down](#api-down) |
| Data is stale | refresh cron failing | [Stale data](#stale-data) |
| Everything slow | memory pressure / swap thrash | [Memory](#memory-pressure) |
| Wrong values on a ticker | data issue, not infra | [Bad data](#bad-data-for-a-ticker) |

---

## Services

| Unit | Purpose |
|---|---|
| `deltascreener-api` | the API (Express + worker code) on 127.0.0.1:8787 |
| `deltascreener-cron` | data refresh, every 15 min UTC |
| `ds-backup.timer` | Postgres dump, daily 03:20 UTC |
| `ds-healthcheck.timer` | probes /health every 5 min, restarts if wedged |
| `postgresql` / `redis-server` / `nginx` | datastore / cache / TLS+proxy |

```bash
sudo systemctl restart deltascreener-api
systemctl list-timers | grep ds-
```

---

## API down

```bash
systemctl status deltascreener-api
journalctl -u deltascreener-api -n 100 --no-pager
sudo systemctl restart deltascreener-api
curl -s localhost:8787/health
```

The watchdog restarts a wedged API within ~5 minutes on its own, so if you are
looking at this the automatic recovery has probably already failed twice. Check
why:

```bash
sudo tail -30 /var/log/ds-healthcheck.log
```

**If it was OOM-killed** (`journalctl -k | grep -i oom`): the box is 1 GB and
runs Postgres + Redis + Node together. There is 2 GB of swap, and systemd caps
the API at 400 MB / cron at 300 MB so the database is never the thing that dies.
Repeated OOM means it is time for a bigger box, not more tuning.

**If Postgres is the problem:**
```bash
systemctl status postgresql
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Stale data

```bash
ADMIN=$(sudo grep '^ADMIN_SECRET=' /opt/deltascreener/server/.env | cut -d= -f2)
curl -s -H "x-admin-secret: $ADMIN" localhost:8787/admin/status | python3 -m json.tool
journalctl -u deltascreener-cron -n 50 --no-pager
```

Watch `lastRefresh` / `lastQuoteRefresh`. Force a run:

```bash
sudo systemctl restart deltascreener-cron        # reloads the schedule
curl -s -H "x-admin-secret: $ADMIN" "localhost:8787/admin/refresh-quotes?limit=50"
curl -s -H "x-admin-secret: $ADMIN" "localhost:8787/admin/refresh-ticker?ticker=AAPL"
```

If a scheduled run died mid-flight it can leave a lock behind:

```bash
curl -s -H "x-admin-secret: $ADMIN" "localhost:8787/admin/clear-scheduled-lock?force=1"
```

**Do not lower `CRON_SCHEDULE` below ~5 minutes.** At 1-minute intervals this
same job produced 151 billion D1 row reads and a $154 Cloudflare bill. Postgres
has no per-row billing so that exact bill cannot recur here — but it will
saturate a 1 GB box's CPU instead.

---

## Memory pressure

```bash
free -m
systemctl show deltascreener-api  -p MemoryCurrent --value | awk '{printf "%.0f MB\n", $1/1048576}'
systemctl show deltascreener-cron -p MemoryCurrent --value | awk '{printf "%.0f MB\n", $1/1048576}'
ps aux --sort=-%mem | head -6
```

Healthy baseline: ~650/911 MB used, API ~65 MB, cron ~47 MB, swap near zero.
Swap steadily climbing = real pressure. Quickest relief is restarting the cron
service (it holds the largest transient allocations).

---

## Backups

Daily 03:20 UTC → `/var/backups/deltascreener/` (7 daily + 4 weekly, gzipped,
~38 MB each). Every run verifies the archive and that `stock_data` is present
before rotating, so a silently-empty dump cannot evict good ones.

```bash
sudo ls -lh /var/backups/deltascreener/daily/
journalctl -u ds-backup -n 20 --no-pager
sudo systemctl start ds-backup.service          # run one now
```

### Restore

```bash
LATEST=$(sudo ls -1t /var/backups/deltascreener/daily/*.sql.gz | head -1)

# Always rehearse into a scratch DB first
sudo -u postgres psql -c "CREATE DATABASE ds_restore_test;"
sudo zcat "$LATEST" | sudo -u postgres psql -q ds_restore_test
sudo -u postgres psql -d ds_restore_test -c "SELECT count(*) FROM stock_data;"   # expect ~14,560
sudo -u postgres psql -c "DROP DATABASE ds_restore_test;"

# Real restore (destructive — stop writers first)
sudo systemctl stop deltascreener-api deltascreener-cron
sudo zcat "$LATEST" | sudo -u postgres psql -q deltascreener_db
sudo systemctl start deltascreener-api deltascreener-cron
```

**Backups live on the same disk as the database.** They protect against bad
migrations and accidental deletes, not against losing the instance. Cloudflare
D1 remains the off-box disaster-recovery copy while the Worker is still running.
Once the Worker is retired, enable Lightsail snapshots or push dumps off-box.

---

## TLS

Cert auto-renews via certbot's systemd timer (expires 2026-11-07).

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

Renewal uses HTTP-01 on port 80. Because the DNS record is **Proxied**, the
challenge arrives via Cloudflare and passes the firewall.

> ⚠️ **Do NOT set the record to "DNS only" to fix a renewal.**
> ufw now allows 80/443 *only from Cloudflare IP ranges*. With the proxy off,
> Let's Encrypt connects to the origin directly and is **dropped** — the exact
> opposite of the usual advice. If you must go DNS-only, first re-open the
> ports (`sudo ufw allow 'Nginx Full'`), renew, then re-apply the Cloudflare
> restriction (see below).

**Port 443 must be open in two places** — ufw *and* the Lightsail firewall
(Networking → Firewall rules). Lightsail defaults to 22/80 only; that is why
HTTPS timed out on first setup even though nginx was listening correctly.

### Origin lockdown (Cloudflare-only)

80/443 accept traffic only from Cloudflare's published ranges, so nobody can
bypass the proxy by hitting `44.213.148.192` directly. Verify:

```bash
sudo ufw status | grep -c '80,443'          # expect ~20 rules
curl -m 8 http://44.213.148.192/health      # expect a timeout, not a response
curl -s https://deltascreener.com/ -o /dev/null -w '%{http_code}\n'   # expect 200
```

> ⚠️ **Cloudflare occasionally adds IP ranges.** If a slice of traffic starts
> 5xx-ing or timing out for no obvious reason, refresh the list — this is the
> maintenance cost of the lockdown:

```bash
curl -fsS https://www.cloudflare.com/ips-v4 -o /tmp/cf4.txt
curl -fsS https://www.cloudflare.com/ips-v6 -o /tmp/cf6.txt
while read -r n; do [ -n "$n" ] && sudo ufw allow proto tcp from "$n" to any port 80,443; done < /tmp/cf4.txt
while read -r n; do [ -n "$n" ] && sudo ufw allow proto tcp from "$n" to any port 80,443; done < /tmp/cf6.txt
sudo ufw reload
```

To undo the lockdown entirely: `sudo ufw allow 'Nginx Full' && sudo ufw reload`.

---

## Verifying correctness after any change

```bash
cd /opt/deltascreener/server
npm test                                          # 19 SQL + 8 bridge tests, no DB needed
npm run verify                                    # row counts + dialect checks
node migrate/compare-prod.js --tickers AAPL,MSFT,NVDA   # diff against the live Worker
```

`compare-prod.js` is the one that matters: it diffs this API against
`api.deltascreener.com` endpoint by endpoint. It should report **0 differing**.

---

## Bad data for a ticker

Infra is fine; this is a data-layer issue.

```bash
curl -s "localhost:8787/stock/AAPL/overview" | python3 -m json.tool
curl -s -H "x-admin-secret: $ADMIN" "localhost:8787/admin/refresh-ticker?ticker=AAPL"
```

Known upstream issue: FMP's legacy `/api/v3/` endpoints now return
"Legacy Endpoint" errors; `/stable/` works. During the migration, 28 mega-caps
were briefly stored with `name` equal to the ticker and null
description/avgVolume — worth checking for if values look hollowed out:

```bash
sudo -u postgres psql -d deltascreener_db -tAc \
  "SELECT count(*) FROM stock_data WHERE overview::jsonb->>'name' = ticker"
```

Baseline is ~4,061 (many small tickers genuinely have no company name).
A sudden jump means refreshes are writing degraded records.

---

## Rollback to Cloudflare

**Production now runs on this box.** `deltascreener.com` calls
`api-vps.deltascreener.com`, which is this server.

The Cloudflare Worker at `api.deltascreener.com` is **still live and still
refreshing its own D1 data**, so rollback needs no data migration.

Partial safety net already in place: the SSR Pages Functions list the Worker as
their second entry in `API_FALLBACKS`, so server-rendered pages fail over to
Cloudflare automatically if this box is unreachable. The **browser-side SPA has
no such fallback** — that path needs the rollback below.

```bash
# On your Mac
cd "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener"
git revert 160e81a                 # "Cut over API to the VPS (Phase 5)"
cd frontend
CLOUDFLARE_API_TOKEN="<see SECRETS.md>" npx wrangler pages deploy . \
  --project-name=deltascreener --branch=main --commit-dirty=true
```

Takes about a minute. Verify with:

```bash
curl -s https://deltascreener.com/src/app5.js?v=20260607-fixes | grep -o 'https://api[a-z-]*\.deltascreener\.com'
```

Should print `https://api.deltascreener.com` once rolled back.

**Do not decommission the Worker or D1 yet** — they are both the rollback path
and the only off-box copy of the data.
