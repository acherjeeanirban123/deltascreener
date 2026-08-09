/**
 * DeltaScreener API — standalone Node server.
 *
 * This is a thin bridge: it converts incoming Express requests into the Web
 * `Request` objects the Cloudflare Worker expects, calls the worker's exported
 * fetch() handler, then writes the returned `Response` back to Express.
 *
 * The worker's own routing, auth, screener logic and FMP fetching all run
 * unchanged — worker-d1-upload.js is imported as-is, not rewritten.
 */

import 'dotenv/config'
import express from 'express'
import compression from 'compression'
import { buildEnv, closeEnv } from './env.js'
import worker from '../worker-d1-upload.js'

const PORT = Number(process.env.PORT) || 8787
const HOST = process.env.HOST || '127.0.0.1'   // Nginx proxies to this; not public

const app = express()

app.disable('x-powered-by')
app.set('trust proxy', true)                    // behind Nginx — respect X-Forwarded-*
app.use(compression())

// Raw body only: the worker parses JSON itself via req.json().
app.use(express.raw({ type: '*/*', limit: '5mb' }))

let env = null

/** Mirror of Cloudflare's ExecutionContext (waitUntil keeps background work alive). */
function makeCtx(pending) {
  return {
    waitUntil(promise) {
      pending.push(Promise.resolve(promise).catch(e =>
        console.error('[waitUntil] background task failed:', e?.message || e)))
    },
    passThroughOnException() { /* no-op outside Workers */ }
  }
}

/** Express req → Web Request */
function toWebRequest(req) {
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  const host = req.headers['x-forwarded-host'] || req.headers.host || `${HOST}:${PORT}`
  const url = `${proto}://${host}${req.originalUrl}`

  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (v == null) continue
    headers.set(k, Array.isArray(v) ? v.join(', ') : String(v))
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method)
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody && req.body?.length ? req.body : undefined
  })
}

/** Web Response → Express res */
async function sendWebResponse(webRes, res) {
  res.status(webRes.status)
  for (const [k, v] of webRes.headers.entries()) {
    // set-cookie can repeat; Headers folds it, so split it back out.
    if (k.toLowerCase() === 'set-cookie') res.append('Set-Cookie', v)
    else res.setHeader(k, v)
  }
  const buf = Buffer.from(await webRes.arrayBuffer())
  res.end(buf)
}

// ── Local liveness probe (does not touch the worker or the DB) ──────────────
app.get('/_healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), pid: process.pid })
})

// ── Everything else goes to the worker ──────────────────────────────────────
app.all('*', async (req, res) => {
  const pending = []
  try {
    const webRes = await worker.fetch(toWebRequest(req), env, makeCtx(pending))
    await sendWebResponse(webRes, res)
  } catch (e) {
    console.error('[api] unhandled error:', e?.stack || e?.message || e)
    if (!res.headersSent) res.status(500).json({ error: e?.message || 'Internal error' })
  } finally {
    // Let ctx.waitUntil() work finish after the response is sent.
    if (pending.length) Promise.allSettled(pending)
  }
})

// ── Boot ────────────────────────────────────────────────────────────────────
const server = await (async () => {
  env = await buildEnv()
  const s = app.listen(PORT, HOST, () => {
    console.log(`[api] DeltaScreener API listening on http://${HOST}:${PORT}`)
  })
  s.keepAliveTimeout = 65_000   // > typical Nginx keepalive to avoid 502s
  s.headersTimeout = 70_000
  return s
})()

// ── Graceful shutdown (systemd sends SIGTERM on restart) ────────────────────
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    console.log(`[api] ${sig} received, shutting down…`)
    server.close(async () => {
      await closeEnv()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  })
}

process.on('unhandledRejection', e =>
  console.error('[api] unhandled rejection:', e?.stack || e?.message || e))
