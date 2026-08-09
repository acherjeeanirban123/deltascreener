/**
 * Cloudflare KV-compatible adapter backed by Redis.
 *
 * The worker uses only two KV methods:
 *     env.SP_CACHE.get(key)                        → string | null
 *     env.SP_CACHE.put(key, value, { expirationTtl })
 *
 * Redis on the same box replaces KV's edge cache. Because everything now runs
 * on one server, Redis is actually faster than KV was (no network hop).
 */

import { createClient } from 'redis'

class RedisKV {
  constructor(client, prefix = 'ds:') {
    this.client = client
    this.prefix = prefix
  }

  _k(key) {
    return this.prefix + key
  }

  /**
   * KV.get supports a `type` arg ('text' | 'json'). The worker only uses text
   * (it JSON.parses itself), but we support both for safety.
   */
  async get(key, type = 'text') {
    try {
      const v = await this.client.get(this._k(key))
      if (v == null) return null
      if (type === 'json') { try { return JSON.parse(v) } catch { return null } }
      return v
    } catch (e) {
      console.error('[kv] get failed:', e.message)
      return null // KV semantics: cache misses must never break a request
    }
  }

  /**
   * @param {object} opts  { expirationTtl } in seconds, matching the KV API.
   */
  async put(key, value, opts = {}) {
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value)
      const ttl = Number(opts?.expirationTtl) || 0
      if (ttl > 0) await this.client.set(this._k(key), val, { EX: ttl })
      else await this.client.set(this._k(key), val)
    } catch (e) {
      console.error('[kv] put failed:', e.message)
      // Swallow — a failed cache write must not fail the request.
    }
  }

  async delete(key) {
    try { await this.client.del(this._k(key)) } catch { /* noop */ }
  }

  /** KV.list({ prefix }) — used sparingly; implemented via SCAN. */
  async list({ prefix = '', limit = 1000 } = {}) {
    const keys = []
    try {
      for await (const key of this.client.scanIterator({ MATCH: this._k(prefix) + '*', COUNT: 100 })) {
        keys.push({ name: key.slice(this.prefix.length) })
        if (keys.length >= limit) break
      }
    } catch (e) {
      console.error('[kv] list failed:', e.message)
    }
    return { keys, list_complete: true }
  }

  async close() {
    await this.client.quit().catch(() => {})
  }
}

/**
 * Connect to Redis and return a KV-compatible handle.
 * @param {string} url  e.g. redis://127.0.0.1:6379
 */
export async function createKV(url = 'redis://127.0.0.1:6379', prefix = 'ds:') {
  const client = createClient({ url })
  client.on('error', err => console.error('[redis] client error:', err.message))
  await client.connect()
  return new RedisKV(client, prefix)
}

/**
 * In-memory fallback so the API still boots if Redis is down.
 * Same interface; data is per-process and lost on restart.
 */
export function createMemoryKV() {
  const store = new Map()
  return {
    async get(key, type = 'text') {
      const hit = store.get(key)
      if (!hit) return null
      if (hit.exp && Date.now() > hit.exp) { store.delete(key); return null }
      if (type === 'json') { try { return JSON.parse(hit.v) } catch { return null } }
      return hit.v
    },
    async put(key, value, opts = {}) {
      const ttl = Number(opts?.expirationTtl) || 0
      store.set(key, {
        v: typeof value === 'string' ? value : JSON.stringify(value),
        exp: ttl > 0 ? Date.now() + ttl * 1000 : 0
      })
    },
    async delete(key) { store.delete(key) },
    async list() { return { keys: [...store.keys()].map(name => ({ name })), list_complete: true } },
    async close() { store.clear() }
  }
}
