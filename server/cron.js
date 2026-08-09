/**
 * Scheduled maintenance runner — replaces Cloudflare's cron trigger.
 *
 * On Cloudflare, `[triggers] crons = ["*​/15 * * * *"]` in wrangler.toml made
 * Cloudflare itself invoke the worker's scheduled() handler. There is no
 * Cloudflare here, so this process owns the schedule instead.
 *
 * ── COST/LOAD NOTE (carried over from wrangler.toml) ────────────────────────
 * This was once "* * * * *" (every minute = 43,200 runs/month) which, combined
 * with unindexed JOIN COUNT queries, produced 151B D1 rows read and a $154
 * invoice. On Postgres there is no per-row billing, so that specific bill
 * cannot recur — but a 1-minute cron WILL saturate a small VPS's CPU and RAM.
 * Keep this at 15 minutes unless you have measured headroom.
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Run as its own systemd service (deltascreener-cron.service) so a stuck
 * refresh can never block or crash the API process.
 */

import 'dotenv/config'
import cron from 'node-cron'
import { buildEnv, closeEnv } from './env.js'
import worker from '../worker-d1-upload.js'

const SCHEDULE = process.env.CRON_SCHEDULE || '*/15 * * * *'
const RUN_ON_BOOT = process.env.CRON_RUN_ON_BOOT === 'true'

const env = await buildEnv()

let running = false   // in-process guard; the worker also holds a KV/Redis lock

async function runMaintenance(trigger) {
  if (running) {
    console.log(`[cron] previous run still in progress — skipping ${trigger}`)
    return
  }
  running = true
  const started = Date.now()
  console.log(`[cron] maintenance started (${trigger}) at ${new Date().toISOString()}`)

  const pending = []
  const ctx = {
    waitUntil: p => pending.push(Promise.resolve(p).catch(e =>
      console.error('[cron] background task failed:', e?.message || e))),
    passThroughOnException() {}
  }

  try {
    await worker.scheduled({ scheduledTime: Date.now(), cron: SCHEDULE }, env, ctx)
    await Promise.allSettled(pending)
    console.log(`[cron] maintenance finished in ${((Date.now() - started) / 1000).toFixed(1)}s`)
  } catch (e) {
    console.error('[cron] maintenance failed:', e?.stack || e?.message || e)
  } finally {
    running = false
  }
}

if (!cron.validate(SCHEDULE)) {
  console.error(`[cron] invalid CRON_SCHEDULE: "${SCHEDULE}"`)
  process.exit(1)
}

cron.schedule(SCHEDULE, () => runMaintenance('scheduled'), { timezone: 'UTC' })
console.log(`[cron] scheduler active — "${SCHEDULE}" (UTC)`)

if (RUN_ON_BOOT) runMaintenance('boot')

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, async () => {
    console.log(`[cron] ${sig} received, shutting down…`)
    await closeEnv()
    process.exit(0)
  })
}

process.on('unhandledRejection', e =>
  console.error('[cron] unhandled rejection:', e?.stack || e?.message || e))
