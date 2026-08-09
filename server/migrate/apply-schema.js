/**
 * Applies migrate/schema.sql to the Postgres database.
 * Safe to re-run — every statement is CREATE ... IF NOT EXISTS.
 *
 *   npm run migrate
 */

import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set (see server/.env.example)')
  process.exit(1)
}

const sql = await readFile(join(__dirname, 'schema.sql'), 'utf8')
const client = new pg.Client({ connectionString: url })

await client.connect()
console.log('[migrate] connected')

try {
  await client.query('BEGIN')
  await client.query(sql)
  await client.query('COMMIT')
  console.log('[migrate] schema applied successfully')

  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`)
  console.log('[migrate] tables now present:', rows.map(r => r.table_name).join(', '))
} catch (e) {
  await client.query('ROLLBACK').catch(() => {})
  console.error('[migrate] FAILED:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
