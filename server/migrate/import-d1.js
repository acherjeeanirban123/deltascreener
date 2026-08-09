/**
 * One-time data migration: Cloudflare D1 → PostgreSQL.
 *
 * Step 1 — export from D1 on your Mac (wrangler is already set up there):
 *
 *     cd "/Users/anirbanacherjee/Desktop/delta screener 1/Delta Screener"
 *     npx wrangler d1 export spdb              --remote --output=spdb.sql
 *     npx wrangler d1 export deltascreener-blog --remote --output=blog.sql
 *
 * Step 2 — convert those SQLite dumps to newline-delimited JSON:
 *
 *     node migrate/import-d1.js --parse spdb.sql --out spdb.ndjson
 *
 * Step 3 — copy the .ndjson to the server and load it:
 *
 *     node migrate/import-d1.js --load spdb.ndjson
 *
 * The two-step split exists because the SQLite dump is one giant file of
 * INSERT statements; parsing it locally keeps the VPS from having to hold
 * the whole thing in memory.
 */

import 'dotenv/config'
import { createReadStream, createWriteStream } from 'node:fs'
import { createInterface } from 'node:readline'
import pg from 'pg'

const args = process.argv.slice(2)
const flag = name => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : null
}

const parseFile = flag('--parse')
const outFile = flag('--out')
const loadFile = flag('--load')
const BATCH = Number(flag('--batch')) || 500

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: parse a SQLite dump into NDJSON  { table, columns, values }
// ─────────────────────────────────────────────────────────────────────────────

/** Split a SQL VALUES tuple on commas that are not inside quotes. */
function splitValues(raw) {
  const out = []
  let cur = ''
  let inStr = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === "'") {
      if (inStr && raw[i + 1] === "'") { cur += "'"; i++; continue }  // escaped ''
      inStr = !inStr
      continue
    }
    if (ch === ',' && !inStr) { out.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  out.push(cur.trim())
  return out.map(v => {
    if (!v.length) return null
    if (v === 'NULL') return null
    if (/^-?\d+$/.test(v)) return Number(v)
    if (/^-?\d*\.\d+([eE][-+]?\d+)?$/.test(v)) return Number(v)
    return v
  })
}

async function parseDump(inPath, outPath) {
  const rl = createInterface({ input: createReadStream(inPath), crlfDelay: Infinity })
  const out = createWriteStream(outPath)
  let buffer = ''
  let count = 0
  const perTable = {}

  for await (const line of rl) {
    const t = line.trim()
    if (!t || t.startsWith('--') || t.startsWith('PRAGMA') ||
        t.startsWith('CREATE') || t.startsWith('BEGIN') || t.startsWith('COMMIT')) continue

    buffer += (buffer ? ' ' : '') + t
    if (!buffer.endsWith(';')) continue          // multi-line INSERT — keep accumulating

    const stmt = buffer
    buffer = ''

    const m = stmt.match(/^INSERT INTO\s+["`]?(\w+)["`]?\s*(?:\(([^)]*)\))?\s*VALUES\s*(.+);$/is)
    if (!m) continue

    const table = m[1]
    const columns = m[2] ? m[2].split(',').map(c => c.trim().replace(/["`]/g, '')) : null

    // A dump line can hold several tuples: VALUES (…),(…),(…)
    const tuples = m[3].match(/\((?:[^()']|'(?:[^']|'')*')*\)/g) || []
    for (const tup of tuples) {
      const values = splitValues(tup.slice(1, -1))
      out.write(JSON.stringify({ table, columns, values }) + '\n')
      count++
      perTable[table] = (perTable[table] || 0) + 1
    }
  }

  await new Promise(r => out.end(r))
  console.log(`[parse] wrote ${count} rows → ${outPath}`)
  for (const [t, n] of Object.entries(perTable)) console.log(`  ${t}: ${n}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: load NDJSON into Postgres
// ─────────────────────────────────────────────────────────────────────────────

async function loadNdjson(inPath) {
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL is not set'); process.exit(1) }

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  console.log('[load] connected to Postgres')

  const rl = createInterface({ input: createReadStream(inPath), crlfDelay: Infinity })
  let batch = []
  let total = 0
  const perTable = {}

  const flush = async () => {
    if (!batch.length) return
    await client.query('BEGIN')
    try {
      for (const { table, columns, values } of batch) {
        if (!columns) continue                       // dumps without a column list are ambiguous — skip
        const cols = columns.map(c => `"${c}"`).join(', ')
        const ph = columns.map((_, i) => `$${i + 1}`).join(', ')
        // Primary keys collide on re-run; ON CONFLICT DO NOTHING makes the
        // import idempotent so a partial run can simply be repeated.
        await client.query(
          `INSERT INTO ${table} (${cols}) VALUES (${ph}) ON CONFLICT DO NOTHING`,
          values
        )
        perTable[table] = (perTable[table] || 0) + 1
      }
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {})
      console.error('[load] batch failed:', e.message)
      throw e
    }
    total += batch.length
    if (total % 5000 === 0) console.log(`[load] ${total} rows…`)
    batch = []
  }

  for await (const line of rl) {
    if (!line.trim()) continue
    batch.push(JSON.parse(line))
    if (batch.length >= BATCH) await flush()
  }
  await flush()

  console.log(`[load] done — ${total} rows inserted`)
  for (const [t, n] of Object.entries(perTable)) console.log(`  ${t}: ${n}`)

  // Identity columns must be advanced past the imported max(id), otherwise the
  // next INSERT collides with an existing row.
  for (const t of ['watchlists', 'saved_screens', 'alerts', 'alert_events', 'blog_posts']) {
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('${t}', 'id'),
        COALESCE((SELECT MAX(id) FROM ${t}), 1),
        true)
    `).catch(() => {})   // table may not exist / may be empty
  }
  console.log('[load] identity sequences realigned')

  await client.end()
}

// ─────────────────────────────────────────────────────────────────────────────

if (parseFile && outFile) {
  await parseDump(parseFile, outFile)
} else if (loadFile) {
  await loadNdjson(loadFile)
} else {
  console.log(`Usage:
  node migrate/import-d1.js --parse <dump.sql> --out <data.ndjson>
  node migrate/import-d1.js --load  <data.ndjson> [--batch 500]`)
  process.exit(1)
}
