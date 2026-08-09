/**
 * Compare this server's responses against the live Cloudflare Worker.
 *
 * This is the gate before Phase 5 (cutover): if the two APIs disagree, the
 * migration is not done, no matter what the row counts say.
 *
 *   node migrate/compare-prod.js
 *   node migrate/compare-prod.js --tickers AAPL,MSFT,NVDA --verbose
 *
 * Volatile fields (timestamps, cache markers, live quotes that legitimately
 * move between two calls) are ignored — see VOLATILE below.
 */

const args = process.argv.slice(2)
const flag = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const VERBOSE = args.includes('--verbose')

const PROD = flag('--prod') || 'https://api.deltascreener.com'
const LOCAL = flag('--local') || 'http://127.0.0.1:8787'
const TICKERS = (flag('--tickers') || 'AAPL,MSFT,NVDA,GOOGL,AMZN,JPM,XOM,KO').split(',')

// Fields that are expected to differ between two independent calls.
const VOLATILE = new Set([
  'updatedAt', 'updated_at', 'quote_updated_at', 'quoteUpdatedAt',
  'financials_updated_at', 'lastRefresh', 'lastQuoteRefresh',
  'lastUpdated', 'last_updated', 'fetchedAt', 'asOf',
  'source', 'cached', 'cacheHit', 'ts', 'timestamp', 'generatedAt'
])

/** Recursively strip volatile keys and round floats so tiny drift doesn't fail. */
function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize)
  if (v && typeof v === 'object') {
    const out = {}
    for (const k of Object.keys(v).sort()) {
      if (VOLATILE.has(k)) continue
      out[k] = normalize(v[k])
    }
    return out
  }
  if (typeof v === 'number' && !Number.isInteger(v)) return Math.round(v * 100) / 100
  return v
}

/** Report the first few differing paths rather than dumping whole objects. */
function diffPaths(a, b, path = '', acc = []) {
  if (acc.length >= 8) return acc
  const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a
  const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b
  if (ta !== tb) { acc.push(`${path || '/'}: type ${ta} vs ${tb}`); return acc }
  if (ta === 'array') {
    if (a.length !== b.length) acc.push(`${path}: length ${a.length} vs ${b.length}`)
    for (let i = 0; i < Math.min(a.length, b.length, 5); i++) diffPaths(a[i], b[i], `${path}[${i}]`, acc)
    return acc
  }
  if (ta === 'object') {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a)) { acc.push(`${path}.${k}: missing locally`); continue }
      if (!(k in b)) { acc.push(`${path}.${k}: extra locally`); continue }
      diffPaths(a[k], b[k], `${path}.${k}`, acc)
    }
    return acc
  }
  if (a !== b) acc.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`)
  return acc
}

async function get(base, path, init) {
  const res = await fetch(base + path, { ...init, signal: AbortSignal.timeout(45_000) })
  const text = await res.text()
  try { return { status: res.status, body: JSON.parse(text) } }
  catch { return { status: res.status, body: text.slice(0, 200) } }
}

const CASES = [
  { name: 'GET /health', path: '/health' },
  { name: 'GET /market/trending', path: '/market/trending' },
  { name: 'GET /search?q=apple', path: '/search?q=apple' },
  {
    name: 'POST /screener (default)', path: '/screener',
    init: {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: {}, page: 1, limit: 25 })
    }
  },
  {
    name: 'POST /screener (filtered)', path: '/screener',
    init: {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: { sector: 'Technology' }, page: 1, limit: 10 })
    }
  },
  ...TICKERS.flatMap(t => [
    { name: `GET /stock/${t}/overview`, path: `/stock/${t}/overview` },
    { name: `GET /stock/${t}/ratios`, path: `/stock/${t}/ratios` },
    { name: `GET /stock/${t}/financials`, path: `/stock/${t}/financials` }
  ])
]

let same = 0, differ = 0, errored = 0
console.log(`\nComparing  local=${LOCAL}  vs  prod=${PROD}\n`)

for (const c of CASES) {
  try {
    const [p, l] = await Promise.all([
      get(PROD, c.path, c.init),
      get(LOCAL, c.path, c.init)
    ])
    if (p.status !== l.status) {
      differ++
      console.log(`  ✗ ${c.name}  status ${l.status} (local) vs ${p.status} (prod)`)
      continue
    }
    const paths = diffPaths(normalize(l.body), normalize(p.body))
    if (!paths.length) { same++; console.log(`  ✓ ${c.name}`) }
    else {
      differ++
      console.log(`  ✗ ${c.name}  — ${paths.length} difference(s)`)
      for (const d of paths.slice(0, VERBOSE ? 8 : 3)) console.log(`      ${d}`)
    }
  } catch (e) {
    errored++
    console.log(`  ! ${c.name}  request failed: ${e.message}`)
  }
}

console.log(`\n  identical: ${same}   differing: ${differ}   errored: ${errored}`)
console.log(differ === 0 && errored === 0
  ? '\n✅ Local API matches production. Safe to proceed to cutover.\n'
  : '\n⚠️  Differences found — review before cutting traffic over.\n')
process.exit(differ === 0 && errored === 0 ? 0 : 1)
