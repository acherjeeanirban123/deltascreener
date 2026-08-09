/**
 * Builds the `env` object that worker-d1-upload.js expects.
 *
 * On Cloudflare, `env` was populated from wrangler bindings + secrets.
 * Here we assemble the same shape from Postgres, Redis, and process.env,
 * so the worker code itself needs no changes.
 */

import { createD1 } from './adapters/d1-postgres.js'
import { createKV, createMemoryKV } from './adapters/kv-redis.js'

let _env = null

export async function buildEnv() {
  if (_env) return _env

  const pgUrl = process.env.DATABASE_URL
  if (!pgUrl) throw new Error('DATABASE_URL is not set (see server/.env.example)')

  // Two logical DBs on Cloudflare (DB = blog, SP_DB = screener data).
  // On one Postgres instance they can share a database; keep separate URLs
  // available in case you later split them onto different servers.
  const spDb = createD1(pgUrl)
  const blogDb = process.env.BLOG_DATABASE_URL
    ? createD1(process.env.BLOG_DATABASE_URL)
    : spDb

  // Redis replaces Cloudflare KV. Falls back to in-memory so a Redis outage
  // degrades performance instead of taking the API down.
  let cache
  try {
    cache = await createKV(process.env.REDIS_URL || 'redis://127.0.0.1:6379')
    console.log('[env] Redis cache connected')
  } catch (e) {
    console.error('[env] Redis unavailable, using in-memory cache:', e.message)
    cache = createMemoryKV()
  }

  _env = {
    // ── Bindings ──────────────────────────────────────────────────────────
    SP_DB: spDb,        // screener data (stock_universe, stock_data, users…)
    DB: blogDb,         // blog posts + pro_users
    SP_CACHE: cache,    // hot-path cache (was Cloudflare KV)
    KV: cache,          // worker also references env.KV for scheduled locks

    // ── Data provider keys ────────────────────────────────────────────────
    FMP_KEY: process.env.FMP_KEY,
    FMP_API_KEY: process.env.FMP_API_KEY,
    FMP_PLAN: process.env.FMP_PLAN,
    FMP_TIER: process.env.FMP_TIER,
    FMP_SUBSCRIPTION: process.env.FMP_SUBSCRIPTION,
    POLYGON_KEY: process.env.POLYGON_KEY,
    POLYGON_API_KEY: process.env.POLYGON_API_KEY,
    POLYGON_KEY_ID: process.env.POLYGON_KEY_ID,
    FINNHUB_KEY: process.env.FINNHUB_KEY,
    AV_KEY: process.env.AV_KEY,

    // ── Auth / admin ──────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    SP_ADMIN_SECRET: process.env.SP_ADMIN_SECRET,
    BLOG_API_SECRET: process.env.BLOG_API_SECRET,

    // ── Email (alerts) ────────────────────────────────────────────────────
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ALERT_FROM_EMAIL: process.env.ALERT_FROM_EMAIL,

    // ── Origins / CORS ────────────────────────────────────────────────────
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || 'https://deltascreener.com',
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || 'https://deltascreener.com'
  }

  return _env
}

export async function closeEnv() {
  if (!_env) return
  await Promise.allSettled([
    _env.SP_DB?.close?.(),
    _env.DB !== _env.SP_DB ? _env.DB?.close?.() : null,
    _env.SP_CACHE?.close?.()
  ])
  _env = null
}
