# DeltaScreener API — standalone server

Phase 1 of `VPS_MIGRATION_ROADMAP.md`: the Cloudflare Worker now runs as an
ordinary Node process against PostgreSQL and Redis.

**The frontend is untouched.** No design, markup, or styling changes — the API
returns exactly the same JSON on exactly the same routes.

## How the port works

`worker-d1-upload.js` is **imported unchanged** — all 8,000 lines of screener
logic, auth, and FMP fetching are reused as-is. Rather than rewriting it, three
thin adapters recreate the Cloudflare runtime it expects:

| Cloudflare | Replacement | File |
|---|---|---|
| D1 (`env.SP_DB`, `env.DB`) | PostgreSQL | `adapters/d1-postgres.js` |
| KV (`env.SP_CACHE`) | Redis | `adapters/kv-redis.js` |
| `fetch()` handler | Express | `index.js` |
| `[triggers] crons` | node-cron | `cron.js` |

`adapters/d1-postgres.js` also translates SQLite dialect to Postgres on the fly
(`?`→`$1`, `datetime('now')`, `json_extract`→`jsonb`, `PRAGMA table_info`,
`AUTOINCREMENT`→`IDENTITY`). That is the highest-risk part of the port, so it
has its own test suite.

```
server/
├── index.js                 API server (Express ⇄ Worker bridge)
├── cron.js                  15-min refresh job
├── env.js                   builds the `env` object the worker expects
├── adapters/
│   ├── d1-postgres.js       D1 API + SQLite→Postgres translation
│   └── kv-redis.js          KV API over Redis (in-memory fallback)
├── migrate/
│   ├── schema.sql           Postgres DDL
│   ├── apply-schema.js      npm run migrate
│   ├── import-d1.js         D1 dump → Postgres
│   ├── verify.js            post-migration checks
│   ├── test-translate.js    SQL translation tests (no DB needed)
│   └── test-bridge.js       HTTP bridge tests (no DB needed)
└── deploy/
    ├── deltascreener-api.service
    ├── deltascreener-cron.service
    └── nginx-api.conf
```

## Test status

Both suites pass locally with no database required:

```
npm test
  ✅ 15 SQL translation tests
  ✅  8 HTTP bridge tests   (routing, CORS, POST bodies, admin auth)
```

## Deploying to the VPS

Server: `44.213.148.192` (AWS Lightsail, Ubuntu 24.04). Postgres, Redis, Nginx
and Node 24 are already installed and running from the bootstrap script.

### 1. Copy the code up

```bash
# from your Mac, in the project root
rsync -av --exclude node_modules --exclude .env \
  server/ ubuntu@44.213.148.192:/tmp/server/
rsync -av worker-d1-upload.js ubuntu@44.213.148.192:/tmp/
```

```bash
# on the server
sudo useradd -r -s /bin/false deltascreener 2>/dev/null || true
sudo mkdir -p /opt/deltascreener
sudo mv /tmp/server /opt/deltascreener/server
sudo mv /tmp/worker-d1-upload.js /opt/deltascreener/
sudo chown -R deltascreener:deltascreener /opt/deltascreener

cd /opt/deltascreener/server
sudo -u deltascreener npm ci --omit=dev
```

### 2. Configure

```bash
sudo -u deltascreener cp .env.example .env
sudo -u deltascreener nano .env      # DATABASE_URL password, FMP_KEY, GOOGLE_CLIENT_ID, secrets
sudo chmod 600 .env
```

Copy the real secret values from `SECRETS.md` / the Cloudflare dashboard
(Workers → Settings → Variables). The Postgres password is the one the
bootstrap script set when it ran `CREATE USER deltascreener`.

### 3. Create the schema

```bash
sudo -u deltascreener npm run migrate
```

### 4. Migrate the data

```bash
# On your Mac — export from D1
npx wrangler d1 export spdb --remote --output=spdb.sql
npx wrangler d1 export deltascreener-blog --remote --output=blog.sql

# Convert to NDJSON locally (keeps the VPS from parsing a huge file)
node server/migrate/import-d1.js --parse spdb.sql --out spdb.ndjson
node server/migrate/import-d1.js --parse blog.sql --out blog.ndjson

scp spdb.ndjson blog.ndjson ubuntu@44.213.148.192:/tmp/

# On the server
cd /opt/deltascreener/server
sudo -u deltascreener npm run import -- --load /tmp/spdb.ndjson
sudo -u deltascreener npm run import -- --load /tmp/blog.ndjson
```

### 5. Verify before sending any traffic

```bash
sudo -u deltascreener npm run verify
```

Compare the printed row counts against D1:

```bash
npx wrangler d1 execute spdb --remote --command "SELECT COUNT(*) FROM stock_data"
```

### 6. Start the services

```bash
sudo cp deploy/deltascreener-api.service  /etc/systemd/system/
sudo cp deploy/deltascreener-cron.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now deltascreener-api deltascreener-cron

systemctl status deltascreener-api
curl -s localhost:8787/health        # {"status":"ok","version":"..."}
```

### 7. Nginx + TLS

```bash
sudo cp deploy/nginx-api.conf /etc/nginx/sites-available/deltascreener-api
sudo ln -s /etc/nginx/sites-available/deltascreener-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api-vps.deltascreener.com
```

In Cloudflare DNS add an **A record** `api-vps` → `44.213.148.192`, proxy
**ON** (orange cloud) so DDoS protection stays in front of the box.

### 8. Compare against production before cutting over

```bash
for path in /health "/stock/AAPL/overview" "/stock/AAPL/ratios" /market/trending; do
  echo "── $path"
  diff <(curl -s "https://api.deltascreener.com$path"     | jq -S .) \
       <(curl -s "https://api-vps.deltascreener.com$path" | jq -S .) \
    && echo "identical"
done
```

Only once these match should the frontend's API base URL change — that is
Phase 5, and it is a one-line change with the old Worker left running as an
instant rollback.

## Memory on a 1 GB box

Postgres + Redis + Nginx + Node is tight on 1 GB. The systemd units cap the API
at 400 MB and the cron job at 300 MB so a runaway refresh cannot OOM the
database. Watch it under real traffic:

```bash
free -h
systemctl status deltascreener-api | grep Memory
```

If memory pressure shows up, that is the signal to move to the larger box
(OVHcloud VPS-2, 8 GB) — the app itself needs no changes, just re-run these
same deploy steps there.

## Operating notes

```bash
journalctl -u deltascreener-api  -f      # API logs
journalctl -u deltascreener-cron -f      # refresh job logs
sudo systemctl restart deltascreener-api
```

**Do not lower `CRON_SCHEDULE` below ~5 minutes.** At 1-minute intervals this
same job generated 151 billion D1 row reads and a $154 bill on Cloudflare.
Postgres has no per-row billing so that exact bill cannot recur, but the job
will saturate a small VPS's CPU instead.
