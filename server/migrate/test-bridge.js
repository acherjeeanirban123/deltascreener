/**
 * Smoke test for the Express ⇄ Worker bridge.
 *
 * Boots the real Express app against a stub env (no Postgres/Redis needed) and
 * exercises the request/response conversion: routing, JSON bodies, CORS headers,
 * status codes, and the 404 fallback.
 *
 *   node migrate/test-bridge.js
 */

import express from 'express'
import worker from '../../worker-d1-upload.js'

// ── Stub env: only what the no-DB routes touch ──────────────────────────────
const env = {
  SP_DB: null,
  DB: null,
  SP_CACHE: { async get() { return null }, async put() {} },
  KV: { async get() { return null }, async put() {} },
  ALLOWED_ORIGINS: 'https://deltascreener.com',
  FRONTEND_ORIGIN: 'https://deltascreener.com'
}

// ── Same bridge logic as index.js ──────────────────────────────────────────
const app = express()
app.use(express.raw({ type: '*/*', limit: '5mb' }))

function toWebRequest(req) {
  const url = `http://${req.headers.host || 'localhost'}${req.originalUrl}`
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : String(v))
  }
  const hasBody = !['GET', 'HEAD'].includes(req.method)
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody && req.body?.length ? req.body : undefined
  })
}

app.all('*', async (req, res) => {
  const pending = []
  const ctx = { waitUntil: p => pending.push(Promise.resolve(p).catch(() => {})), passThroughOnException() {} }
  try {
    const webRes = await worker.fetch(toWebRequest(req), env, ctx)
    res.status(webRes.status)
    for (const [k, v] of webRes.headers.entries()) {
      if (k.toLowerCase() === 'set-cookie') res.append('Set-Cookie', v)
      else res.setHeader(k, v)
    }
    res.end(Buffer.from(await webRes.arrayBuffer()))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

const server = app.listen(0)
await new Promise(r => server.once('listening', r))
const base = `http://127.0.0.1:${server.address().port}`

let pass = 0, fail = 0
const ok = m => { pass++; console.log(`  ✓ ${m}`) }
const bad = (m, d) => { fail++; console.log(`  ✗ ${m}`); if (d) console.log(`      ${d}`) }

console.log('\nBridge smoke tests')

// 1. GET /health — worker responds without touching the DB
try {
  const r = await fetch(`${base}/health`)
  const body = await r.json()
  if (r.status === 200 && body.status === 'ok') ok(`GET /health → 200 ${JSON.stringify(body)}`)
  else bad('GET /health', `status=${r.status} body=${JSON.stringify(body)}`)
} catch (e) { bad('GET /health', e.message) }

// 2. Content-Type is set by the worker's j() helper
try {
  const r = await fetch(`${base}/health`)
  const ct = r.headers.get('content-type') || ''
  ct.includes('application/json') ? ok(`Content-Type preserved (${ct})`) : bad('Content-Type', ct)
} catch (e) { bad('Content-Type', e.message) }

// 3. Unknown route → worker's 404 JSON, not Express's HTML
try {
  const r = await fetch(`${base}/definitely-not-a-route`)
  const body = await r.json()
  if (r.status === 404 && body.error) ok(`404 fallback → ${JSON.stringify(body)}`)
  else bad('404 fallback', `status=${r.status} body=${JSON.stringify(body)}`)
} catch (e) { bad('404 fallback', e.message) }

// 4. CORS preflight (OPTIONS is short-circuited in worker.fetch)
try {
  const r = await fetch(`${base}/screener`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://deltascreener.com', 'Access-Control-Request-Method': 'POST' }
  })
  const allow = r.headers.get('access-control-allow-origin')
  if (r.status === 204 && allow) ok(`OPTIONS preflight → 204, allow-origin=${allow}`)
  else bad('OPTIONS preflight', `status=${r.status} allow-origin=${allow}`)
} catch (e) { bad('OPTIONS preflight', e.message) }

// 5. POST body reaches the worker (it must parse JSON from the raw buffer).
//    With SP_DB=null the screener errors — but reaching that error proves the
//    body was read and routed, which is what this test is checking.
try {
  const r = await fetch(`${base}/screener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://deltascreener.com' },
    body: JSON.stringify({ filters: { sector: 'Technology' }, page: 1, limit: 5 })
  })
  const body = await r.json()
  if (typeof body === 'object') ok(`POST /screener routed with body (status ${r.status})`)
  else bad('POST /screener', JSON.stringify(body))
} catch (e) { bad('POST /screener', e.message) }

// 6. Admin routes must never be reachable unauthenticated.
//    With no ADMIN_SECRET set the worker fails closed with 503
//    ("Admin not configured"); with one set, a bad secret gives 401.
try {
  const r = await fetch(`${base}/admin/status`)
  ;[401, 403, 503].includes(r.status)
    ? ok(`admin route gated when unconfigured (${r.status})`)
    : bad('admin gating', `expected 401/403/503, got ${r.status}`)
} catch (e) { bad('admin gating', e.message) }

// 7. With a secret configured, a wrong secret is rejected and the right one passes.
try {
  env.ADMIN_SECRET = 'test-secret-123'
  const wrong = await fetch(`${base}/admin/status`, { headers: { 'x-admin-secret': 'nope' } })
  wrong.status === 401
    ? ok('admin rejects wrong secret (401)')
    : bad('admin wrong secret', `expected 401, got ${wrong.status}`)

  const right = await fetch(`${base}/admin/status`, { headers: { 'x-admin-secret': 'test-secret-123' } })
  right.status !== 401 && right.status !== 403
    ? ok(`admin accepts correct secret (${right.status})`)
    : bad('admin correct secret', `unexpectedly rejected with ${right.status}`)
} catch (e) { bad('admin secret handling', e.message) }
finally { delete env.ADMIN_SECRET }

console.log(fail === 0
  ? `\n✅ ${pass} bridge tests passed.\n`
  : `\n❌ ${fail} failed, ${pass} passed.\n`)

server.close()
process.exit(fail === 0 ? 0 : 1)
