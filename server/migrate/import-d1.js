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

/**
 * Extract the `(...)` tuples that follow VALUES.
 *
 * A regex cannot do this correctly: D1 dumps encode newlines as nested SQL
 * function calls, e.g.
 *     replace('a\nb', '\n', char(10))
 * so tuples contain unbalanced-looking parentheses *and* quoted commas.
 * This scanner tracks quote state and paren depth instead.
 */
function extractTuples(raw) {
  const tuples = []
  let depth = 0, start = -1, inStr = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (inStr) {
      if (ch === "'") {
        if (raw[i + 1] === "'") { i++; continue }   // escaped ''
        inStr = false
      }
      continue
    }
    if (ch === "'") { inStr = true; continue }
    if (ch === '(') { if (depth === 0) start = i; depth++; continue }
    if (ch === ')') {
      depth--
      if (depth === 0 && start >= 0) { tuples.push(raw.slice(start + 1, i)); start = -1 }
    }
  }
  return tuples
}

/**
 * Decode a single SQL value expression into a JS value.
 * Handles: NULL, numbers, quoted strings, X'..' blobs, char(n) and the
 * replace(str, '\n', char(10)) wrapper D1 emits for multi-line text.
 */
function decodeValue(v) {
  v = v.trim()
  if (!v.length || v === 'NULL') return null

  // replace(<expr>, <search>, <repl>) — used to re-insert newlines
  const rep = v.match(/^replace\s*\(([\s\S]*)\)$/i)
  if (rep) {
    const parts = splitTopLevel(rep[1])
    if (parts.length === 3) {
      const subject = decodeValue(parts[0])
      const search = decodeValue(parts[1])
      const repl = decodeValue(parts[2])
      if (typeof subject === 'string' && typeof search === 'string') {
        return subject.split(String(search)).join(String(repl ?? ''))
      }
    }
    return decodeValue(parts[0])
  }

  // char(10) / char(13) → the literal character
  const ch = v.match(/^char\s*\(\s*(\d+)\s*\)$/i)
  if (ch) return String.fromCharCode(Number(ch[1]))

  // quoted string (with '' escapes)
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
    return v.slice(1, -1).replace(/''/g, "'")
  }

  // hex blob
  if (/^X'[0-9a-fA-F]*'$/i.test(v)) return Buffer.from(v.slice(2, -1), 'hex')

  if (/^-?\d+$/.test(v)) return Number(v)
  if (/^-?\d*\.\d+([eE][-+]?\d+)?$/.test(v)) return Number(v)
  return v
}

/** Split on commas at paren-depth 0, ignoring commas inside quotes. */
function splitTopLevel(raw) {
  const out = []
  let cur = '', depth = 0, inStr = false
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (inStr) {
      cur += c
      if (c === "'") {
        if (raw[i + 1] === "'") { cur += "'"; i++; continue }
        inStr = false
      }
      continue
    }
    if (c === "'") { inStr = true; cur += c; continue }
    if (c === '(') depth++
    if (c === ')') depth--
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue }
    cur += c
  }
  out.push(cur)
  return out
}

/** Split a SQL VALUES tuple into decoded JS values. */
function splitValues(raw) {
  return splitTopLevel(raw).map(decodeValue)
}

async function parseDump(inPath, outPath) {
  const rl = createInterface({ input: createReadStream(inPath), crlfDelay: Infinity })
  const out = createWriteStream(outPath)
  let buffer = ''
  let count = 0
  const perTable = {}
  const mismatches = []
  // sqlite_sequence is SQLite-internal bookkeeping — Postgres has no such table.
  const SKIP_TABLES = new Set(['sqlite_sequence'])

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
    if (SKIP_TABLES.has(table)) continue
    const columns = m[2] ? m[2].split(',').map(c => c.trim().replace(/["`]/g, '')) : null

    // A dump line can hold several tuples: VALUES (…),(…),(…)
    for (const tup of extractTuples(m[3])) {
      const values = splitValues(tup)
      // Guard: a column/value mismatch means the tuple was mis-parsed. Fail
      // loudly here rather than letting Postgres reject it mid-import.
      if (columns && values.length !== columns.length) {
        mismatches.push({ table, expected: columns.length, got: values.length,
                          sample: tup.slice(0, 200) })
        continue
      }
      out.write(JSON.stringify({ table, columns, values }) + '\n')
      count++
      perTable[table] = (perTable[table] || 0) + 1
    }
  }

  await new Promise(r => out.end(r))
  console.log(`[parse] wrote ${count} rows → ${outPath}`)
  for (const [t, n] of Object.entries(perTable)) console.log(`  ${t}: ${n}`)

  if (mismatches.length) {
    console.error(`\n[parse] ⚠️  ${mismatches.length} row(s) could not be parsed — these would be SILENTLY MISSING from the migration:`)
    for (const m of mismatches.slice(0, 5)) {
      console.error(`  ${m.table}: expected ${m.expected} values, got ${m.got}`)
      console.error(`    ${m.sample}`)
    }
    process.exitCode = 1
  }
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
