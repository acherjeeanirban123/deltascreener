/**
 * Post-migration verification — run this BEFORE cutting any traffic over.
 *
 *   npm run verify
 *
 * Checks:
 *   1. every expected table exists
 *   2. row counts (compare these against `wrangler d1 execute ... "SELECT COUNT(*)"`)
 *   3. the SQL dialect translation actually works against real data
 *      (json_extract → jsonb, datetime('now'), placeholder rewriting)
 *   4. spot-check a few well-known tickers have sane values
 */

import 'dotenv/config'
import { createD1 } from '../adapters/d1-postgres.js'

const db = createD1(process.env.DATABASE_URL)

const EXPECTED_TABLES = [
  'stock_data', 'stock_universe', 'stock_universe_stage', 'app_meta',
  'users', 'sessions', 'watchlists', 'saved_screens', 'user_preferences',
  'alerts', 'alert_events', 'blog_posts', 'pro_users'
]

let failures = 0
const ok = m => console.log(`  ✓ ${m}`)
const bad = m => { console.log(`  ✗ ${m}`); failures++ }

console.log('\n1. Tables present')
const { results: tables } = await db.prepare(`
  SELECT table_name FROM information_schema.tables WHERE table_schema='public'`).all()
const have = new Set(tables.map(t => t.table_name))
for (const t of EXPECTED_TABLES) have.has(t) ? ok(t) : bad(`${t} MISSING`)

console.log('\n2. Row counts (compare with D1)')
for (const t of EXPECTED_TABLES.filter(t => have.has(t))) {
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).first()
  console.log(`  ${t.padEnd(22)} ${String(row?.n ?? 0).padStart(8)}`)
}

console.log('\n3. SQL dialect translation')
try {
  const r = await db.prepare(`SELECT datetime('now') AS now_val`).first()
  r?.now_val ? ok(`datetime('now') → ${r.now_val}`) : bad("datetime('now') returned nothing")
} catch (e) { bad(`datetime('now'): ${e.message.split('\n')[0]}`) }

try {
  const r = await db.prepare(
    `SELECT ticker, json_extract(overview, '$.description') AS descr
     FROM stock_data WHERE overview IS NOT NULL AND overview NOT IN ('', '{}', 'null') LIMIT 1`
  ).first()
  if (r) ok(`json_extract works (${r.ticker}: ${String(r.descr ?? '').slice(0, 50)}…)`)
  else console.log('  – no overview rows yet, skipping json_extract check')
} catch (e) { bad(`json_extract: ${e.message.split('\n')[0]}`) }

try {
  const r = await db.prepare(`SELECT ticker FROM stock_data WHERE ticker = ? LIMIT 1`).bind('AAPL').first()
  r ? ok('placeholder binding (?) works') : console.log('  – AAPL not present, skipping bind check')
} catch (e) { bad(`placeholder binding: ${e.message.split('\n')[0]}`) }

console.log('\n4. Spot-check tickers')
for (const t of ['AAPL', 'MSFT', 'NVDA']) {
  try {
    const r = await db.prepare(
      `SELECT ticker, name, price, mkt_cap, pe FROM stock_data WHERE ticker = ?`).bind(t).first()
    if (!r) { console.log(`  – ${t} not in DB`); continue }
    const sane = r.price > 0 && r.mkt_cap > 0
    sane ? ok(`${t}: price=${r.price} mktcap=${r.mkt_cap} pe=${r.pe}`)
         : bad(`${t}: implausible values (price=${r.price}, mkt_cap=${r.mkt_cap})`)
  } catch (e) { bad(`${t}: ${e.message.split('\n')[0]}`) }
}

console.log(failures === 0
  ? '\n✅ All checks passed.\n'
  : `\n❌ ${failures} check(s) failed — do NOT cut traffic over yet.\n`)

await db.close()
process.exit(failures === 0 ? 0 : 1)
