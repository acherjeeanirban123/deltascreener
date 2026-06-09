const CORS = {
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
}
const UA   = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
const SECU = 'DeltaScreener contact@deltascreener.com'
const DEFAULT_GOOGLE_CLIENT_ID = '1062200569141-0vik7idoi4skecsh8dii6nksmg80afrv.apps.googleusercontent.com'
const DATA_VERSION = '20.96-subrequest-budget'
const STOCK_STALE_DAYS = 30
const FUNDAMENTAL_STALE_DAYS = 21
const QUOTE_STALE_DAYS = 1
const TOP_FINANCIAL_STALE_DAYS = FUNDAMENTAL_STALE_DAYS
const INCOMPLETE_FUNDAMENTAL_RETRY_DAYS = 1
const TOP_PRIORITY_COUNT = 500
const SYMBOL_REFRESH_DAYS = 30
const MAX_QUOTE_REFRESH_LIMIT = 120
const MAX_DEEP_REFRESH_LIMIT = 1000
const SCHEDULED_QUOTE_LIMIT = 12
const SCHEDULED_TOP_LIMIT = 5
const SCHEDULED_REST_LIMIT = 5
const SCHEDULED_CORE_RATIO_LIMIT = 2
const SCHEDULED_RICH_CORE_RATIO_LIMIT = 1
const SCHEDULED_QUOTE_MAX_BATCHES = 1
const SCHEDULED_TOP_MAX_BATCHES = 1
const SCHEDULED_REST_MAX_BATCHES = 1
const FREE_TIER_BULK_SAFE_MODE = false
const MIN_ACTIVE_UNIVERSE_SIZE = 3000
const QUOTE_REFRESH_SAFE_INVOCATION_LIMIT = 40
const SCHEDULED_LOCK_MINUTES = 9
const SCHEDULED_MAX_RUNTIME_MS = (8 * 60 * 1000) + (30 * 1000)
const SCHEDULED_FINALIZE_BUFFER_MS = 20_000
const SCHEDULED_QUOTE_STAGE_MAX_MS = 75_000
const SCHEDULED_TOP_STAGE_MAX_MS = 120_000
const SCHEDULED_REST_STAGE_MAX_MS = 120_000
const SCHEDULED_MANUAL_CLEAR_MIN_MS = 2 * 60 * 1000
const DEFAULT_FETCH_TIMEOUT_MS = 10_000
const FMP_RETRY_BASE_MS = 350
const FMP_QUOTE_BATCH_PAUSE_MS = 75
const GET_OR_BUILD_TIMEOUT_MS = 20_000
const SEC_FETCH_TIMEOUT_MS = 12_000
const QUOTE_REFRESH_CONCURRENCY = 1
const TOP_REFRESH_CONCURRENCY = 1
const DEEP_REFRESH_CONCURRENCY = 1
const CHART_CACHE_VERSION = 2
const QUOTE_MISSING_RETRY_HOURS = 2
const SLOW_BUILD_LOG_MS = 4000
const STOCK_QUOTE_READY_SQL = `(d.name IS NOT NULL AND d.name<>'' AND d.exchange IS NOT NULL AND d.exchange<>'' AND d.price IS NOT NULL AND d.price > 0 AND d.mkt_cap IS NOT NULL AND d.mkt_cap > 0)`
const STOCK_CORE_RATIO_FIELDS_PRESENT_SQL = `(${STOCK_QUOTE_READY_SQL} AND d.pb IS NOT NULL AND d.debt_to_equity IS NOT NULL)`
const STOCK_CORE_SCREEN_FIELDS_READY_SQL = `(${STOCK_CORE_RATIO_FIELDS_PRESENT_SQL} AND d.pb > 0 AND d.debt_to_equity >= 0)`
const STOCK_RATIO_READY_SQL = `(
  d.ratios IS NOT NULL AND d.ratios NOT IN ('', '{}', 'null') AND (
    (CASE WHEN d.pe IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.pb IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.ps IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.roe IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.roa IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.roce IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.net_margin IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN d.debt_to_equity IS NOT NULL THEN 1 ELSE 0 END)
  ) >= 4
)`
const STOCK_FINANCIAL_VALUE_PATHS = [
  '$.annual.sales',
  '$.annual.netProfit',
  '$.annual.opProfit',
  '$.annual.eps',
  '$.balance.totalAssets',
  '$.balance.totalLiabilities',
  '$.balance.reserves',
  '$.balance.borrowings',
  '$.balance.currentAssets',
  '$.balance.currentLiabilities',
  '$.balance.cash',
  '$.balance.inventory',
  '$.balance.receivables',
]
const STOCK_FINANCIAL_JSON_SQL = `(CASE WHEN d.financials IS NOT NULL AND d.financials<>'' THEN d.financials ELSE '{}' END)`
const STOCK_RATIOS_JSON_SQL = `(CASE WHEN d.ratios IS NOT NULL AND d.ratios<>'' THEN d.ratios ELSE '{}' END)`
const stockFinancialPathReadySql = path => `EXISTS (
  SELECT 1
  FROM json_each(COALESCE(json_extract(${STOCK_FINANCIAL_JSON_SQL}, '${path}'), '[]'))
  WHERE json_each.value IS NOT NULL
    AND TRIM(CAST(json_each.value AS TEXT)) NOT IN ('', 'null')
)`
const stockFinancialPathCountSql = path => `(SELECT COUNT(1)
  FROM json_each(COALESCE(json_extract(${STOCK_FINANCIAL_JSON_SQL}, '${path}'), '[]'))
  WHERE json_each.value IS NOT NULL
    AND TRIM(CAST(json_each.value AS TEXT)) NOT IN ('', 'null')
)`
const stockRatioValueReadySql = key => `(
  json_extract(${STOCK_RATIOS_JSON_SQL}, '$.${key}') IS NOT NULL
  AND TRIM(CAST(json_extract(${STOCK_RATIOS_JSON_SQL}, '$.${key}') AS TEXT)) NOT IN ('', 'null')
)`
const STOCK_FINANCIAL_READY_SQL = `(
  d.financials_updated_at IS NOT NULL
  AND d.financials IS NOT NULL
  AND d.financials NOT IN ('', '{}', 'null')
  AND (
    ${STOCK_FINANCIAL_VALUE_PATHS.map(stockFinancialPathReadySql).join('\n    OR ')}
  )
)`
const STOCK_QUARTERLY_DETAIL_READY_SQL = `(
  d.financials IS NOT NULL
  AND d.financials NOT IN ('', '{}', 'null')
  AND (
    ${stockFinancialPathCountSql('$.quarterly.sales')} >= 5
    OR ${stockFinancialPathCountSql('$.quarterly.netProfit')} >= 5
    OR ${stockFinancialPathCountSql('$.quarterly.opProfit')} >= 5
    OR ${stockFinancialPathCountSql('$.quarterly.eps')} >= 5
  )
)`
const STOCK_PAGE_RATIO_FIELDS = [
  'peg',
  'evEbitda',
  'evRevenue',
  'earningsYield',
  'fcfYield',
  'grossMargin',
  'opMargin',
  'currentRatio',
  'quickRatio',
  'cashRatio',
  'debtToAssets',
  'interestCoverage',
  'priceToFreeCashFlow',
  'salesGrowth',
  'profitGrowth',
  'salesGrowth3y',
  'profitGrowth3y',
  'yoyQuarterlySalesGrowth',
  'yoyQuarterlyProfitGrowth',
]
const STOCK_PAGE_RATIO_READY_SQL = `(
  d.ratios IS NOT NULL
  AND d.ratios NOT IN ('', '{}', 'null')
  AND (
    ${STOCK_PAGE_RATIO_FIELDS.map(key => `CASE WHEN ${stockRatioValueReadySql(key)} THEN 1 ELSE 0 END`).join(' +\n    ')}
  ) >= 4
)`
const STOCK_FUNDAMENTAL_READY_SQL = `(${STOCK_QUOTE_READY_SQL} AND ${STOCK_FINANCIAL_READY_SQL} AND ${STOCK_RATIO_READY_SQL})`
const STOCK_PAGE_FINANCIAL_READY_SQL = `(${STOCK_QUOTE_READY_SQL} AND ${STOCK_FINANCIAL_READY_SQL} AND ${STOCK_QUARTERLY_DETAIL_READY_SQL})`
const STOCK_PAGE_READY_SQL = `(${STOCK_PAGE_FINANCIAL_READY_SQL} AND ${STOCK_RATIO_READY_SQL} AND ${STOCK_PAGE_RATIO_READY_SQL})`
const STOCK_FINANCIAL_ATTEMPT_SQL = `COALESCE(d.financials_attempted_at, d.financials_updated_at, '1900-01-01')`
const STOCK_FINANCIAL_FAILURE_BACKOFF_DAYS_SQL = `(MIN(COALESCE(d.financials_failed_count, 0) * 2, 14))`
const STOCK_FINANCIAL_FAILURE_BLOCK_SQL = `(
  COALESCE(d.financials_failed_count, 0) > 3
  AND d.financials_failed_at IS NOT NULL
  AND datetime(d.financials_failed_at) >= datetime('now', '-' || ${STOCK_FINANCIAL_FAILURE_BACKOFF_DAYS_SQL} || ' days')
)`
const STOCK_CORE_SCREEN_RETRY_SQL = `(
  d.pb IS NULL
  OR d.debt_to_equity IS NULL
  OR ((d.pb <= 0 OR d.debt_to_equity < 0) AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${FUNDAMENTAL_STALE_DAYS} days'))
)`
const STOCK_TOP_FINANCIAL_STALE_SQL = `(
  (
    COALESCE(d.financials_attempted_at, d.financials_updated_at) IS NULL
    AND NOT ${STOCK_FINANCIAL_FAILURE_BLOCK_SQL}
  )
  OR (
    NOT ${STOCK_FINANCIAL_FAILURE_BLOCK_SQL}
    AND NOT ${STOCK_PAGE_READY_SQL}
    AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days')
  )
  OR (
    COALESCE(d.financials_attempted_at, d.financials_updated_at) IS NOT NULL
    AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-' || ? || ' days')
  )
)`
const STOCK_DEEP_STALE_SQL = `(
  d.ticker IS NULL
  OR d.overview IS NULL OR d.overview='' OR d.overview='{}'
  OR d.name IS NULL OR d.name=''
  OR d.exchange IS NULL OR d.exchange=''
  OR d.price IS NULL OR d.price <= 0
  OR d.mkt_cap IS NULL OR d.mkt_cap <= 0
  OR (
    NOT ${STOCK_FINANCIAL_FAILURE_BLOCK_SQL}
    AND (
      COALESCE(d.financials_attempted_at, d.financials_updated_at) IS NULL
      OR (NOT ${STOCK_CORE_RATIO_FIELDS_PRESENT_SQL} AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days'))
      OR (NOT ${STOCK_FINANCIAL_READY_SQL} AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days'))
      OR (NOT ${STOCK_RATIO_READY_SQL} AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days'))
      OR (NOT ${STOCK_QUARTERLY_DETAIL_READY_SQL} AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days'))
      OR (NOT ${STOCK_PAGE_RATIO_READY_SQL} AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days'))
    )
  )
  OR (
    COALESCE(d.financials_attempted_at, d.financials_updated_at) IS NOT NULL
    AND datetime(${STOCK_FINANCIAL_ATTEMPT_SQL}) < datetime('now', '-' || ? || ' days')
  )
)`
const COMMON_STOCK_BAD_NAME_TERMS = [
  'etf',
  'exchange traded fund',
  'fund',
  'closed end',
  'closed end fund',
  'closed-end',
  'closed-end fund',
  'trust',
  'trust shares',
  'beneficial interest',
  'beneficial interests',
  'royalty trust',
  'statutory trust',
  'business trust',
  'investment trust',
  'income trust',
  'preferred',
  'preferred stock',
  'preferred shares',
  'preference share',
  'depositary',
  'depository',
  'depositary share',
  'depository share',
  'american depositary',
  'american depository',
  'sponsored adr',
  'unsponsored adr',
  'adr',
  'ads',
  'warrant',
  'warrants',
  'rights',
  'rights offering',
  'unit',
  'units',
  'acquisition',
  'blank check',
  'spac',
  'nextshares',
  'exchange traded note',
  'etn',
  'note',
  'notes',
  'bond',
  'bonds',
  'debenture',
  'debentures',
  'subordinated',
  'senior notes',
  'senior note',
  'junior subordinated',
  'baby bond',
  'capital securities',
  'preferred securities',
  'income securities',
  'due 20',
  'due 19',
  'due 18',
  'due 17',
  'due 16',
  'due 15',
  'due 14',
  'due 13',
  'due 12',
  'due 11',
  'due 10',
  'notes due',
  'bond due',
  'debentures due',
  'rate reset',
  'fixed rate',
  'floating rate',
  'redemption',
  'callable',
  'convertible notes',
  'convertible senior',
  'depositary receipts',
  'structured',
  'index linked',
  'linked notes',
  'strategy etf',
  'municipal',
  'treasury',
  'money market',
  'limited partnership',
  'partnership',
  'depositary units',
  'subscription rights',
  'subscription receipts',
  'contingent value rights',
  'tracking stock',
]
const COMMON_STOCK_GOOD_NAME_TERMS = [
  'common stock',
  'common shares',
  'common share',
  'ordinary shares',
  'ordinary share',
  'class a ordinary shares',
  'class b ordinary shares',
  'class c ordinary shares',
  'class a common',
  'class b common',
  'class c common',
]
const COMMON_STOCK_PRIORITY_SQL = `(
  u.type IN ('Common Stock','Common Shares')
  OR LOWER(COALESCE(u.type,'')) LIKE '%common stock%'
  OR LOWER(COALESCE(u.type,'')) LIKE '%common shares%'
  OR LOWER(COALESCE(u.type,'')) LIKE '%ordinary share%'
  OR LOWER(COALESCE(u.type,'')) LIKE '%class a common%'
  OR LOWER(COALESCE(u.type,'')) LIKE '%class b common%'
  OR LOWER(COALESCE(u.type,'')) LIKE '%class c common%'
)`
const mem = new Map()
const API_STATS = new WeakMap()
const MEM_CACHE_MAX = 500
async function memCached(k, fn, ttl = 5 * 60 * 1000) {
  const h = mem.get(k)
  if (h && Date.now() - h.ts < ttl) {
    mem.delete(k)
    mem.set(k, h)
    return h.data
  }
  const d = await fn()
  if (mem.size >= MEM_CACHE_MAX) {
    const firstKey = mem.keys().next().value
    if (firstKey !== undefined) mem.delete(firstKey)
  }
  mem.set(k, { data: d, ts: Date.now() })
  return d
}
async function kvGet(key, env) {
  if (!env.SP_CACHE) return null
  try { const v = await env.SP_CACHE.get(key); return v ? JSON.parse(v) : null } catch { return null }
}
async function kvSet(key, data, env, ttl) {
  if (!env.SP_CACHE) return
  try { await env.SP_CACHE.put(key, JSON.stringify(data), ttl ? { expirationTtl: ttl } : {}) } catch {}
}
async function dbRun(env, sql, params = []) {
  if (!env.SP_DB) throw new Error('D1 not configured')
  const s = env.SP_DB.prepare(sql)
  return params.length ? s.bind(...params).run() : s.run()
}
async function dbAll(env, sql, params = []) {
  if (!env.SP_DB) throw new Error('D1 not configured')
  const s = env.SP_DB.prepare(sql)
  const r = await (params.length ? s.bind(...params).all() : s.all())
  return r.results || []
}
async function dbFirst(env, sql, params = []) {
  const rows = await dbAll(env, sql, params)
  return rows[0] || null
}
const dbGet = dbFirst

const parseJson = v => {
  if (!v) return null
  if (typeof v === 'object') return v
  try { return JSON.parse(v) } catch { return null }
}
const toJson = v => v == null ? null : JSON.stringify(v)
const isPlainObject = v => !!v && typeof v === 'object' && !Array.isArray(v)
const sleep = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)))
async function fetchWithTimeout(url, opts = {}, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS, label = null) {
  const controller = new AbortController()
  const upstreamSignal = opts?.signal
  let timedOut = false
  let abortListener = null
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, Math.max(1, Number(timeoutMs) || DEFAULT_FETCH_TIMEOUT_MS))
  if (typeof timer?.unref === 'function') timer.unref()
  if (upstreamSignal) {
    if (upstreamSignal.aborted) controller.abort()
    else {
      abortListener = () => controller.abort()
      upstreamSignal.addEventListener('abort', abortListener, { once: true })
    }
  }
  try {
    return await fetch(url, { ...opts, signal: controller.signal })
  } catch (e) {
    if (timedOut) throw new Error(`${label || 'Upstream request'} timed out after ${timeoutMs}ms`)
    throw e
  } finally {
    clearTimeout(timer)
    if (upstreamSignal && abortListener) upstreamSignal.removeEventListener('abort', abortListener)
  }
}
function mergeDefined(oldVal, newVal) {
  if (newVal == null) return oldVal ?? null
  if (typeof newVal === 'number' && !isFinite(newVal)) return oldVal ?? null
  if (Array.isArray(newVal)) return newVal.length ? newVal : (Array.isArray(oldVal) ? oldVal : newVal)
  if (isPlainObject(newVal)) {
    const out = isPlainObject(oldVal) ? { ...oldVal } : {}
    for (const [key, value] of Object.entries(newVal)) out[key] = mergeDefined(out[key], value)
    return out
  }
  return newVal
}

function sumDefinedValues(row, keys = []) {
  let found = false
  let total = 0
  for (const key of keys) {
    const value = n(row?.[key])
    if (value != null && isFinite(value)) {
      total += value
      found = true
    }
  }
  return found ? total : null
}

function buildGrowthFromAnnuals(annual = {}, balance = {}) {
  const finiteVals = arr => Array.isArray(arr) ? arr.map(v => n(v)).filter(v => v != null && isFinite(v)) : []
  const cagr = (vals, years = null) => {
    if (!Array.isArray(vals) || !vals.length) return null
    const usable = vals.filter(v => v != null && isFinite(v))
    if (usable.length < 2) return null
    if (years == null) {
      const start = usable[0], end = usable[usable.length - 1], span = usable.length - 1
      return start > 0 && end > 0 && span > 0 ? r2((Math.pow(end / start, 1 / span) - 1) * 100) : null
    }
    if (usable.length < years + 1) return null
    const start = usable[usable.length - years - 1]
    const end = usable[usable.length - 1]
    return start > 0 && end > 0 ? r2((Math.pow(end / start, 1 / years) - 1) * 100) : null
  }
  const avg = (arr, count) => {
    if (!Array.isArray(arr)) return null
    const vals = arr.filter(v => v != null && isFinite(v)).slice(-count)
    return vals.length ? r2(vals.reduce((sum, value) => sum + Number(value), 0) / vals.length) : null
  }
  const sales = finiteVals(annual.sales)
  const profit = finiteVals(annual.netProfit)
  const equity = Array.isArray(balance.reserves) ? balance.reserves : []
  const roeSeries = (Array.isArray(annual.netProfit) ? annual.netProfit : []).map((np, idx) => {
    const eq = n(equity[idx])
    const profitValue = n(np)
    return eq != null && isFinite(eq) && eq !== 0 && profitValue != null && isFinite(profitValue)
      ? r2((profitValue / eq) * 100)
      : null
  }).filter(v => v != null && isFinite(v))
  return {
    salesGrowth: {
      '10y': cagr(sales),
      '5y': cagr(sales, 5),
      '3y': cagr(sales, 3),
      ttm: cagr(sales, 1),
    },
    profitGrowth: {
      '10y': cagr(profit),
      '5y': cagr(profit, 5),
      '3y': cagr(profit, 3),
      ttm: cagr(profit, 1),
    },
    stockCagr: { '10y': null, '5y': null, '3y': null, '1y': null },
    roe: {
      series: roeSeries,
      '10y': avg(roeSeries, 10),
      '5y': avg(roeSeries, 5),
      '3y': avg(roeSeries, 3),
      lastYear: roeSeries.length ? roeSeries[roeSeries.length - 1] : null,
    },
  }
}

const STOCK_JSON_COLUMNS = {
  all: 'all_data',
  overview: 'overview',
  financials: 'financials',
  ratios: 'ratios',
  chart: 'chart',
  shareholders: 'shareholders',
  earnings: 'earnings',
  announcements: 'announcements',
  news: 'news',
}
const STOCK_DB_COLUMNS = {
  ticker: 'TEXT PRIMARY KEY',
  all_data: 'TEXT',
  overview: 'TEXT',
  financials: 'TEXT',
  ratios: 'TEXT',
  chart: 'TEXT',
  shareholders: 'TEXT',
  earnings: 'TEXT',
  announcements: 'TEXT',
  news: 'TEXT',
  name: 'TEXT',
  exchange: 'TEXT',
  sector: 'TEXT',
  industry: 'TEXT',
  price: 'REAL',
  change_pct: 'REAL',
  mkt_cap: 'REAL',
  pe: 'REAL',
  pb: 'REAL',
  ps: 'REAL',
  roe: 'REAL',
  roa: 'REAL',
  roce: 'REAL',
  net_margin: 'REAL',
  debt_to_equity: 'REAL',
  dividend_yield: 'REAL',
  quote_updated_at: 'TEXT',
  financials_updated_at: 'TEXT',
  financials_attempted_at: 'TEXT',
  financials_failed_at: 'TEXT',
  financials_failed_count: 'INTEGER DEFAULT 0',
  updated_at: 'TEXT',
  created_at: 'TEXT',
}

let _dbReady = false
let _dbReadyVersion = null
const buildLocks = new Map()

async function ensureStockSchema(env) {
  await dbRun(env, `CREATE TABLE IF NOT EXISTS stock_data (
    ticker TEXT PRIMARY KEY,
    all_data TEXT,
    overview TEXT,
    financials TEXT,
    ratios TEXT,
    chart TEXT,
    shareholders TEXT,
    earnings TEXT,
    announcements TEXT,
    news TEXT,
    name TEXT,
    exchange TEXT,
    sector TEXT,
    industry TEXT,
    price REAL,
    change_pct REAL,
    mkt_cap REAL,
    pe REAL,
    pb REAL,
    ps REAL,
    roe REAL,
    roa REAL,
    roce REAL,
    net_margin REAL,
    debt_to_equity REAL,
    dividend_yield REAL,
    quote_updated_at TEXT,
    financials_updated_at TEXT,
    financials_attempted_at TEXT,
    financials_failed_at TEXT,
    financials_failed_count INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now'))
  )`)
  const cols = await dbAll(env, `PRAGMA table_info(stock_data)`).catch(() => [])
  const have = new Set(cols.map(c => c.name))
  for (const [name, def] of Object.entries(STOCK_DB_COLUMNS)) {
    if (!have.has(name)) await dbRun(env, `ALTER TABLE stock_data ADD COLUMN ${name} ${def}`).catch(() => {})
  }
  await dbRun(env, `CREATE INDEX IF NOT EXISTS idx_stock_data_mkt_cap ON stock_data(mkt_cap)`).catch(() => {})
  await dbRun(env, `CREATE INDEX IF NOT EXISTS idx_stock_data_sector ON stock_data(sector)`).catch(() => {})
  await dbRun(env, `CREATE INDEX IF NOT EXISTS idx_stock_data_updated ON stock_data(updated_at)`).catch(() => {})
  await dbRun(env, `CREATE TABLE IF NOT EXISTS stock_universe (
    ticker TEXT PRIMARY KEY,
    name TEXT,
    exchange TEXT,
    type TEXT,
    is_active INTEGER DEFAULT 1,
    source TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`)
  await dbRun(env, `CREATE INDEX IF NOT EXISTS idx_stock_universe_exchange ON stock_universe(exchange)`).catch(() => {})
  await dbRun(env, `CREATE INDEX IF NOT EXISTS idx_stock_universe_active ON stock_universe(is_active)`).catch(() => {})
  await dbRun(env, `CREATE TABLE IF NOT EXISTS stock_universe_stage (
    ticker TEXT PRIMARY KEY,
    name TEXT,
    exchange TEXT,
    type TEXT,
    is_active INTEGER DEFAULT 1,
    source TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )`)
  await dbRun(env, `CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT DEFAULT (datetime('now')))`)
}

async function initDB(env) {
  if (!env.SP_DB) return { error: 'D1 not bound' }
  await dbRun(env, `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT, picture TEXT, created_at TEXT DEFAULT (datetime('now')))`)
  await dbRun(env, `CREATE TABLE IF NOT EXISTS watchlists (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, ticker TEXT NOT NULL, name TEXT, price REAL, exchange TEXT, "change" REAL, change_pct REAL, added_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, ticker))`)
  await dbRun(env, `CREATE TABLE IF NOT EXISTS saved_screens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, name TEXT NOT NULL, query TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))` )
  await dbRun(env, `CREATE TABLE IF NOT EXISTS user_preferences (user_id TEXT PRIMARY KEY, screener_columns TEXT, screener_query TEXT, screener_columns_open INTEGER DEFAULT 0, updated_at TEXT DEFAULT (datetime('now')))`)
  await dbRun(env, `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), expires_at TEXT NOT NULL)`)
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN exchange TEXT`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN "change" REAL`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN change_pct REAL`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`).catch(() => {})
  await dbRun(env, `ALTER TABLE saved_screens ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))`).catch(() => {})
  await ensureStockSchema(env)
  return { ok: true }
}
async function ensureUserDataSchema(env) {
  if (!(await ensureDB(env))) return false
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN exchange TEXT`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN "change" REAL`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN change_pct REAL`).catch(() => {})
  await dbRun(env, `ALTER TABLE watchlists ADD COLUMN updated_at TEXT`).catch(() => {})
  await dbRun(env, `ALTER TABLE saved_screens ADD COLUMN updated_at TEXT`).catch(() => {})
  await dbRun(env, `ALTER TABLE user_preferences ADD COLUMN updated_at TEXT`).catch(() => {})
  return true
}
async function ensureDB(env) {
  if (!env.SP_DB) return false
  if (_dbReady && _dbReadyVersion === DATA_VERSION) return true
  await initDB(env)
  _dbReady = true
  _dbReadyVersion = DATA_VERSION
  return true
}
const r2  = v => (v != null && !isNaN(v) && isFinite(v)) ? Math.round(Number(v) * 100) / 100 : null
const pct = v => (v != null && !isNaN(v) && isFinite(v)) ? Math.round(Number(v) * 10000) / 100 : null
const toM = v => (v != null && !isNaN(v) && isFinite(v)) ? Math.round(Number(v) / 1e6) : null
const raw = v => { const r = v?.raw ?? (typeof v === 'number' ? v : null); return (r != null && !isNaN(r) && isFinite(r)) ? r : null }
const g   = (o, k) => toM(raw(o?.[k]))
const n   = v => {
  if (v == null) return null
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s || ['none', 'null', 'nan', '—', '-'].includes(s.toLowerCase())) return null
    v = s.replace(/,/g, '')
  }
  const x = Number(v)
  return isNaN(x) || !isFinite(x) ? null : x
}
const first = (...vals) => vals.find(v => v != null && !isNaN(v) && isFinite(v)) ?? null
const pctAny = v => {
  const x = n(String(v ?? '').replace('%', '').trim())
  if (x == null) return null
  return r2(Math.abs(x) <= 1 ? x * 100 : x)
}
const cleanYield = v => {
  const y = pctAny(v)
  return y != null && y >= 0 && y <= 25 ? y : null
}
const j   = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } })

function adminLimit(url, name, fallback, max = MAX_DEEP_REFRESH_LIMIT) {
  const rawValue = String(url.searchParams.get(name) || '').trim().toLowerCase()
  if (rawValue === 'all' || rawValue === 'max') return max
  return Math.min(Math.max(Number(rawValue || fallback) || fallback, 1), max)
}

function googleClientId(env) {
  return env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
}

function normalizeOrigin(value) {
  try {
    return new URL(String(value || '').trim()).origin
  } catch {
    return ''
  }
}

function allowedOrigins(env) {
  const configured = [
    env.CORS_ORIGINS,
    env.ALLOWED_ORIGINS,
    env.FRONTEND_ORIGIN,
    env.PUBLIC_APP_URL,
  ]
    .filter(Boolean)
    .flatMap(value => String(value).split(','))
    .map(normalizeOrigin)
    .filter(Boolean)
  return new Set([
    'https://deltascreener.com',
    'https://www.deltascreener.com',
    'https://deltascreener.pages.dev',
    ...configured,
  ])
}

function corsHeaders(req, env) {
  const origin = normalizeOrigin(req.headers.get('Origin') || '')
  const headers = { ...CORS }
  if (origin && allowedOrigins(env).has(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function getBearerToken(req) {
  const match = (req.headers.get('Authorization') || '').match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

function parseCookies(req) {
  const raw = req.headers.get('Cookie') || ''
  const jar = {}
  for (const part of raw.split(/;\s*/)) {
    if (!part) continue
    const idx = part.indexOf('=')
    if (idx <= 0) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (!key) continue
    try { jar[key] = decodeURIComponent(value) } catch { jar[key] = value }
  }
  return jar
}

function getSessionToken(req) {
  const cookies = parseCookies(req)
  return String(cookies.ds_session || '').trim() || getBearerToken(req)
}

function sessionSameSite(req) {
  return new URL(req.url).protocol === 'https:' ? 'None' : 'Lax'
}

function buildSessionCookie(token, req) {
  const isSecure = new URL(req.url).protocol === 'https:'
  const attrs = [
    'Path=/',
    'HttpOnly',
    isSecure ? 'Secure' : '',
    `SameSite=${sessionSameSite(req)}`,
    `Max-Age=${60 * 60 * 24 * 30}`,
  ].filter(Boolean)
  return `ds_session=${encodeURIComponent(token)}; ${attrs.join('; ')}`
}

function clearSessionCookie(req) {
  const isSecure = new URL(req.url).protocol === 'https:'
  const attrs = [
    'Path=/',
    'HttpOnly',
    isSecure ? 'Secure' : '',
    `SameSite=${sessionSameSite(req)}`,
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ].filter(Boolean)
  return `ds_session=; ${attrs.join('; ')}`
}

function nonZeroFinite(value) {
  const x = n(value)
  return x != null && isFinite(x) && x !== 0 ? x : null
}

function getAdminSecret(env) {
  return String(env.ADMIN_SECRET || env.SP_ADMIN_SECRET || '').trim()
}

function requireAdmin(req, env) {
  const secret = getAdminSecret(env)
  if (!secret) return j({ error: 'Admin not configured' }, 503)
  const url = new URL(req.url)
  const querySecret = String(url.searchParams.get('admin') || url.searchParams.get('secret') || '').trim()
  const headerSecret = (req.headers.get('x-admin-secret') || '').trim()
  if (getBearerToken(req) === secret || headerSecret === secret || querySecret === secret) return null
  return j({ error: 'Unauthorized' }, 401)
}

function sessionExpiryIso(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

function makeSessionToken() {
  return `${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '')}`
}

async function createSession(userId, env) {
  if (!env.SP_DB) return null
  await ensureDB(env)
  const token = makeSessionToken()
  await dbRun(env, 'INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)', [token, userId, sessionExpiryIso(30)])
  return token
}

async function upsertUser(user, env) {
  await ensureDB(env)
  if (!env.SP_DB || !user?.id) return false
  await dbRun(env, `INSERT INTO users (id,email,name,picture) VALUES (?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET email=excluded.email, name=excluded.name, picture=excluded.picture`,
    [user.id, user.email || null, user.name || user.email || user.id, user.picture || null])
  return true
}

async function getSessionUser(token, env) {
  if (!token || !env.SP_DB) return null
  await ensureDB(env)
  const row = await dbGet(env, `SELECT u.id, u.email, u.name, u.picture
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token=? AND datetime(s.expires_at) > datetime('now')`, [token]).catch(() => null)
  if (!row) return null
  return { id: row.id, email: row.email || null, name: row.name || row.email || row.id, picture: row.picture || null, verified: true }
}

async function verifyGoogleIdToken(idToken, env) {
  if (!idToken) return null
  return memCached(`google_id_token_${idToken.slice(-32)}`, async () => {
    const res = await fetchWithTimeout(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' }
    }, DEFAULT_FETCH_TIMEOUT_MS, 'Google token verification')
    if (!res.ok) throw new Error(`Google token verification failed: ${res.status}`)
    const payload = await res.json()
    if (payload.aud !== googleClientId(env)) throw new Error('Invalid client')
    if (Number(payload.exp || 0) < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
    if (!payload.sub) throw new Error('Invalid token payload')
    return {
      id: payload.sub,
      email: payload.email || null,
      name: payload.name || payload.given_name || payload.email || payload.sub,
      picture: payload.picture || null,
      verified: String(payload.email_verified).toLowerCase() === 'true',
    }
  }, 5 * 60 * 1000)
}

let _crumb = null, _cookies = null, _crumbTs = 0
async function getCrumb() {
  if (_crumb && _cookies && Date.now() - _crumbTs < 50 * 60 * 1000) return { crumb: _crumb, cookies: _cookies }
  const r1 = await fetchWithTimeout('https://finance.yahoo.com/', { headers: { 'User-Agent': UA, 'Accept': 'text/html' }, redirect: 'follow' }, DEFAULT_FETCH_TIMEOUT_MS, 'Yahoo homepage')
  let cookies = ''
  try {
    if (typeof r1.headers.getSetCookie === 'function') {
      const p = r1.headers.getSetCookie()
      if (p?.length) cookies = p.map(c => c.split(';')[0].trim()).filter(Boolean).join('; ')
    } else cookies = (r1.headers.get('set-cookie') || '').split(';')[0].trim()
  } catch {}
  const r2r = await fetchWithTimeout('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, 'Cookie': cookies, 'Referer': 'https://finance.yahoo.com' }
  }, DEFAULT_FETCH_TIMEOUT_MS, 'Yahoo crumb')
  const crumb = (await r2r.text()).trim()
  if (!crumb || crumb.length < 3) throw new Error('Yahoo crumb failed')
  _crumb = crumb; _cookies = cookies; _crumbTs = Date.now()
  return { crumb, cookies }
}
async function yf(path, params = {}) {
  const headers = { 'User-Agent': UA, 'Accept': 'application/json', 'Referer': 'https://finance.yahoo.com' }
  const p = { ...params }
  if (path.includes('quoteSummary')) {
    try { const c = await getCrumb(); p.crumb = c.crumb; headers['Cookie'] = c.cookies } catch {}
  }
  const qs = new URLSearchParams(p).toString()
  const res = await fetchWithTimeout(`https://query1.finance.yahoo.com${path}${qs ? '?' + qs : ''}`, { headers }, DEFAULT_FETCH_TIMEOUT_MS, `Yahoo ${path}`)
  if (!res.ok) throw new Error(`Yahoo ${res.status}: ${path}`)
  return res.json()
}
async function yfS(ticker, modules) {
  for (const ver of ['v10', 'v11']) {
    try {
      const d = await yf(`/${ver}/finance/quoteSummary/${ticker}`, { modules: modules.join(',') })
      const r = d?.quoteSummary?.result?.[0]; if (r) return r
    } catch {}
  }
  throw new Error(`No quoteSummary for ${ticker}`)
}
async function yfQuote(ticker) {
  try {
    const d = await yf(`/v7/finance/quote`, { symbols: ticker })
    return d?.quoteResponse?.result?.[0] || null
  } catch {
    return null
  }
}

const CIK_CACHE = new Map()
let _secTickerMap = null
let _secTickerMapTs = 0
async function loadSecTickerMap() {
  if (_secTickerMap && Date.now() - _secTickerMapTs < 24 * 60 * 60 * 1000) return _secTickerMap
  const res = await fetchWithTimeout('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': SECU, 'Accept': 'application/json' }
  }, SEC_FETCH_TIMEOUT_MS, 'SEC ticker map')
  if (!res.ok) throw new Error(`SEC tickers ${res.status}`)
  const data = await res.json()
  const map = new Map()
  for (const k of Object.keys(data || {})) {
    const row = data[k]
    if (row?.ticker && row?.cik_str != null) map.set(String(row.ticker).toUpperCase(), String(row.cik_str).padStart(10, '0'))
  }
  _secTickerMap = map
  _secTickerMapTs = Date.now()
  return map
}
async function secCIK(ticker) {
  const t = String(ticker || '').toUpperCase()
  if (CIK_CACHE.has(t)) return CIK_CACHE.get(t)
  const candidates = [t]
  if (t.includes('.')) candidates.push(t.replace(/\./g, '-'))
  if (t.includes('-')) candidates.push(t.replace(/-/g, '.'))
  try {
    const map = await loadSecTickerMap()
    for (const candidate of candidates) {
      const cik = map.get(candidate)
      if (cik) {
        CIK_CACHE.set(t, cik)
        return cik
      }
    }
  } catch {}
  const res = await fetchWithTimeout(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=&CIK=${encodeURIComponent(t)}&type=10-K&dateb=&owner=include&count=1&search_text=&output=atom`, {
    headers: { 'User-Agent': SECU, 'Accept': 'application/atom+xml' }
  }, SEC_FETCH_TIMEOUT_MS, `SEC CIK lookup ${t}`)
  if (!res.ok) throw new Error(`SEC CIK lookup failed: ${res.status}`)
  const text = await res.text()
  const match = text.match(/CIK=(\d{1,10})\b/i)
    || text.match(/companyfacts\/CIK(\d{10})\.json/i)
    || text.match(/\/browse-edgar\?action=getcompany&amp;CIK=(\d{1,10})\b/i)
    || text.match(/<cik>(\d{1,10})<\/cik>/i)
  if (!match) throw new Error('CIK not found')
  const cik = match[1].padStart(10, '0')
  CIK_CACHE.set(t, cik)
  return cik
}

async function secFetchFacts(ticker) {
  const cik = await secCIK(ticker)
  const res = await fetchWithTimeout(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
    headers: { 'User-Agent': SECU, 'Accept': 'application/json' }
  }, SEC_FETCH_TIMEOUT_MS, `SEC companyfacts ${ticker}`)
  if (!res.ok) throw new Error(`SEC XBRL ${res.status}`)
  const data = await res.json()
  const usgaap = data?.facts?.['us-gaap'] || {}
  const ifrs   = data?.facts?.['ifrs-full'] || {}
  return { facts: { ...ifrs, ...usgaap }, companyName: data?.entityName }
}

function getAnnualInstant(facts, concept, altConcepts = []) {
  const candidates = [concept, ...altConcepts]
  for (const c of candidates) {
    const units = facts[c]?.units?.USD || facts[c]?.units?.shares || []
    const annual = units.filter(x => x.form === '10-K' && x.fp === 'FY' && x.end)
    if (!annual.length) continue
    const byYear = new Map()
    for (const x of annual) {
      const yr = x.end.slice(0, 4)
      if (!byYear.has(yr) || new Date(x.filed) > new Date(byYear.get(yr).filed)) byYear.set(yr, x)
    }
    const deduped = [...byYear.values()].sort((a, b) => new Date(a.end) - new Date(b.end))
    if (deduped.length > 0) return deduped
  }
  return []
}

function getAnnualDuration(facts, concept, altConcepts = []) {
  const candidates = [concept, ...altConcepts]
  const byYear = new Map()
  for (const c of candidates) {
    const units = facts[c]?.units?.USD || facts[c]?.units?.shares || facts[c]?.units?.['USD/shares'] || []
    // Only 10-K FY filings with duration >= 350 days (full year)
    const annual = units.filter(x => {
      if (x.form !== '10-K' || x.fp !== 'FY' || !x.end || !x.start) return false
      const days = (new Date(x.end) - new Date(x.start)) / (1000 * 60 * 60 * 24)
      return days > 350 && days < 380
    })
    for (const x of annual) {
      const yr = x.end.slice(0, 4)
      if (!byYear.has(yr) || new Date(x.filed) > new Date(byYear.get(yr).filed)) byYear.set(yr, x)
    }
  }
  return [...byYear.values()].sort((a, b) => new Date(a.end) - new Date(b.end))
}

function getQuarterlyDuration(facts, concept, altConcepts = []) {
  const candidates = [concept, ...altConcepts]
  const byEnd = new Map()
  for (const c of candidates) {
    const units = facts[c]?.units?.USD || facts[c]?.units?.shares || facts[c]?.units?.['USD/shares'] || []
    const exactQuarterly = units.filter(x => {
      if (!x.end || !x.start) return false
      if (x.form !== '10-Q' && x.form !== '10-K') return false
      const days = (new Date(x.end) - new Date(x.start)) / (1000 * 60 * 60 * 24)
      return days > 80 && days < 100  // ~3 months
    })
    for (const x of exactQuarterly) {
      const k = x.end
      if (!byEnd.has(k) || new Date(x.filed) > new Date(byEnd.get(k).filed)) byEnd.set(k, x)
    }

    // Many SEC company facts store Q2/Q3 as year-to-date values. Convert those
    // cumulative values into standalone quarters so revenue/OPM do not go blank.
    const ytd = units.filter(x => {
      if (!x.end || !x.start || !x.fp) return false
      if (x.form !== '10-Q' && x.form !== '10-K') return false
      if (!['Q1', 'Q2', 'Q3', 'FY'].includes(x.fp)) return false
      const days = (new Date(x.end) - new Date(x.start)) / 86400000
      return days > 80 && days < 380
    })
    const byYearFp = new Map()
    for (const x of ytd) {
      const key = `${x.fy || x.end.slice(0, 4)}:${x.fp}`
      if (!byYearFp.has(key) || new Date(x.filed) > new Date(byYearFp.get(key).filed)) byYearFp.set(key, x)
    }
    const fiscalYears = [...new Set([...byYearFp.values()].map(x => x.fy || x.end.slice(0, 4)))].sort()
    for (const fy of fiscalYears) {
      const q1 = byYearFp.get(`${fy}:Q1`)
      const q2 = byYearFp.get(`${fy}:Q2`)
      const q3 = byYearFp.get(`${fy}:Q3`)
      const fyv = byYearFp.get(`${fy}:FY`)
      const addDerived = (src, val) => {
        if (!src || val == null || byEnd.has(src.end)) return
        byEnd.set(src.end, { ...src, val })
      }
      addDerived(q1, q1?.val)
      addDerived(q2, q2?.val != null && q1?.val != null ? q2.val - q1.val : null)
      addDerived(q3, q3?.val != null && q2?.val != null ? q3.val - q2.val : null)
      addDerived(fyv, fyv?.val != null && q3?.val != null ? fyv.val - q3.val : null)
    }
  }
  return [...byEnd.values()].sort((a, b) => new Date(a.end) - new Date(b.end)).slice(-12)
}

async function secGetAllStatements(ticker) {
  const { facts, companyName } = await secFetchFacts(ticker)
  
  // ─── BALANCE SHEET (instant values) ───
  const b_assets      = getAnnualInstant(facts, 'Assets')
  const b_liab        = getAnnualInstant(facts, 'Liabilities', ['LiabilitiesAndStockholdersEquity'])
  const b_equity      = getAnnualInstant(facts, 'StockholdersEquity', ['StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'])
  const b_equityCapital = getAnnualInstant(facts, 'CommonStocksIncludingAdditionalPaidInCapital', ['CommonStockIncludingAdditionalPaidInCapital', 'CommonStockAndAdditionalPaidInCapital', 'AdditionalPaidInCapital', 'AdditionalPaidInCapitalCommonStocks', 'CapitalInExcessOfParValue'])
  const b_commonStock = getAnnualInstant(facts, 'CommonStockValue')
  const b_apic        = getAnnualInstant(facts, 'AdditionalPaidInCapital', ['AdditionalPaidInCapitalCommonStocks', 'CapitalInExcessOfParValue'])
  const b_retained    = getAnnualInstant(facts, 'RetainedEarningsAccumulatedDeficit')
  const b_ltDebt      = getAnnualInstant(facts, 'LongTermDebtNoncurrent', ['LongTermDebt'])
  const b_stDebt      = getAnnualInstant(facts, 'DebtCurrent', ['ShortTermBorrowings', 'LongTermDebtCurrent'])
  const b_ppe         = getAnnualInstant(facts, 'PropertyPlantAndEquipmentNet')
  const b_goodwill    = getAnnualInstant(facts, 'Goodwill')
  const b_ltInvest    = getAnnualInstant(facts, 'LongTermInvestments', ['MarketableSecuritiesNoncurrent'])
  const b_stInvest    = getAnnualInstant(facts, 'ShortTermInvestments', ['MarketableSecuritiesCurrent'])
  const b_cash        = getAnnualInstant(facts, 'CashAndCashEquivalentsAtCarryingValue', ['Cash'])
  const b_curAssets   = getAnnualInstant(facts, 'AssetsCurrent')
  const b_curLiab     = getAnnualInstant(facts, 'LiabilitiesCurrent')
  const b_shares      = getAnnualInstant(facts, 'CommonStockSharesOutstanding', ['EntityCommonStockSharesOutstanding'])
  const b_intangible  = getAnnualInstant(facts, 'FiniteLivedIntangibleAssetsNet', ['IntangibleAssetsNetExcludingGoodwill'])
  const b_cwip        = getAnnualInstant(facts, 'ConstructionInProgressGross')
  const b_otherAssets = getAnnualInstant(facts, 'OtherAssetsNoncurrent', ['OtherAssets'])
  const b_inventory   = getAnnualInstant(facts, 'InventoryNet')
  const b_receivables = getAnnualInstant(facts, 'AccountsReceivableNetCurrent')

  // ─── INCOME STATEMENT (duration values) ───
  const i_revenue  = getAnnualDuration(facts, 'Revenues', ['RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet', 'RevenueFromContractWithCustomerIncludingAssessedTax'])
  const i_cogs     = getAnnualDuration(facts, 'CostOfRevenue', ['CostOfGoodsAndServicesSold', 'CostOfGoodsSold'])
  const i_gross    = getAnnualDuration(facts, 'GrossProfit')
  const i_rd       = getAnnualDuration(facts, 'ResearchAndDevelopmentExpense')
  const i_sga      = getAnnualDuration(facts, 'SellingGeneralAndAdministrativeExpense', ['GeneralAndAdministrativeExpense'])
  const i_opex     = getAnnualDuration(facts, 'OperatingExpenses', ['CostsAndExpenses'])
  const i_opInc    = getAnnualDuration(facts, 'OperatingIncomeLoss', ['IncomeLossFromContinuingOperationsBeforeInterestExpenseInterestIncomeIncomeTaxesExtraordinaryItemsNoncontrollingInterestsNet'])
  const i_interest = getAnnualDuration(facts, 'InterestExpense', ['InterestExpenseDebt'])
  const i_otherInc = getAnnualDuration(facts, 'OtherIncomeExpenseNet', ['NonoperatingIncomeExpense', 'OtherNonoperatingIncomeExpense'])
  const i_pretax   = getAnnualDuration(facts, 'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', ['IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'])
  const i_tax      = getAnnualDuration(facts, 'IncomeTaxExpenseBenefit')
  const i_netInc   = getAnnualDuration(facts, 'NetIncomeLoss', ['ProfitLoss'])
  const i_epsBasic = getAnnualDuration(facts, 'EarningsPerShareBasic')
  const i_epsDil   = getAnnualDuration(facts, 'EarningsPerShareDiluted')
  const i_depr     = getAnnualDuration(facts, 'DepreciationDepletionAndAmortization', ['DepreciationAndAmortization', 'Depreciation'])

  // ─── CASH FLOW (duration values) ───
  const c_op = getAnnualDuration(facts, 'NetCashProvidedByUsedInOperatingActivities', ['NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'])
  const c_inv = getAnnualDuration(facts, 'NetCashProvidedByUsedInInvestingActivities', ['NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'])
  const c_fin = getAnnualDuration(facts, 'NetCashProvidedByUsedInFinancingActivities', ['NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'])
  const c_capex = getAnnualDuration(facts, 'PaymentsToAcquirePropertyPlantAndEquipment', ['PaymentsForCapitalImprovements'])

  // ─── QUARTERLY DATA (for quarterly results) ───
  const q_revenue = getQuarterlyDuration(facts, 'Revenues', ['RevenueFromContractWithCustomerExcludingAssessedTax', 'SalesRevenueNet', 'RevenueFromContractWithCustomerIncludingAssessedTax'])
  const q_opInc   = getQuarterlyDuration(facts, 'OperatingIncomeLoss')
  const q_netInc  = getQuarterlyDuration(facts, 'NetIncomeLoss', ['ProfitLoss'])
  const q_interest = getQuarterlyDuration(facts, 'InterestExpense', ['InterestExpenseDebt', 'InterestExpenseNonOperating'])
  const q_pretax   = getQuarterlyDuration(facts, 'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest', ['IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments', 'IncomeLossFromContinuingOperationsBeforeIncomeTaxes'])
  const q_tax      = getQuarterlyDuration(facts, 'IncomeTaxExpenseBenefit')
  const q_depr     = getQuarterlyDuration(facts, 'DepreciationDepletionAndAmortization', ['DepreciationAndAmortization', 'Depreciation'])
  const q_otherInc = getQuarterlyDuration(facts, 'OtherIncomeExpenseNet', ['NonoperatingIncomeExpense', 'OtherNonoperatingIncomeExpense'])
  const q_epsDil  = getQuarterlyDuration(facts, 'EarningsPerShareDiluted')
  const q_epsBasic = getQuarterlyDuration(facts, 'EarningsPerShareBasic')

  if (!b_assets.length && !i_revenue.length) throw new Error('SEC XBRL: insufficient data')

  return {
    companyName,
    balance: { assets: b_assets, liab: b_liab, equity: b_equity, equityCapital: b_equityCapital, commonStock: b_commonStock, additionalPaidInCapital: b_apic, retained: b_retained, ltDebt: b_ltDebt, stDebt: b_stDebt, ppe: b_ppe, goodwill: b_goodwill, ltInvest: b_ltInvest, stInvest: b_stInvest, cash: b_cash, curAssets: b_curAssets, curLiab: b_curLiab, shares: b_shares, intangible: b_intangible, cwip: b_cwip, otherAssets: b_otherAssets, inventory: b_inventory, receivables: b_receivables },
    income: { revenue: i_revenue, cogs: i_cogs, gross: i_gross, rd: i_rd, sga: i_sga, opex: i_opex, opInc: i_opInc, interest: i_interest, otherInc: i_otherInc, pretax: i_pretax, tax: i_tax, netInc: i_netInc, epsBasic: i_epsBasic, epsDil: i_epsDil, depr: i_depr },
    cashflow: { op: c_op, inv: c_inv, fin: c_fin, capex: c_capex },
    quarterly: { revenue: q_revenue, opInc: q_opInc, netInc: q_netInc, interest: q_interest, pretax: q_pretax, tax: q_tax, depr: q_depr, otherInc: q_otherInc, epsDil: q_epsDil, epsBasic: q_epsBasic }
  }
}

function unionDates(serieses, maxYears = 10) {
  const dates = new Set()
  for (const s of serieses) for (const x of (s || [])) dates.add(x.end)
  return [...dates].sort((a, b) => new Date(a) - new Date(b)).slice(-maxYears)
}

function valAt(series, date) {
  if (!series?.length) return null
  const exact = series.find(x => x.end === date)
  if (exact) return exact.val
  // Find closest prior (for balance sheet when dates shift slightly)
  const target = new Date(date).getTime()
  const prior = series.filter(x => new Date(x.end).getTime() <= target).sort((a, b) => new Date(b.end) - new Date(a.end))
  return prior[0]?.val ?? null
}
function exactValAt(series, date) {
  if (!series?.length) return null
  return series.find(x => x.end === date)?.val ?? null
}

async function avGet(params, env) {
  if (!env.AV_KEY) throw new Error('AV_KEY not set')
  const qs = new URLSearchParams({ ...params, apikey: env.AV_KEY }).toString()
  const res = await fetchWithTimeout(`https://www.alphavantage.co/query?${qs}`, { headers: { 'User-Agent': UA } }, DEFAULT_FETCH_TIMEOUT_MS, `Alpha Vantage ${params.function || 'request'}`)
  if (!res.ok) throw new Error(`AV ${res.status}`)
  const data = await res.json()
  if (data?.Note || data?.Information) throw new Error('AV rate limited')
  return data
}
async function avOverview(ticker, env) {
  try {
    const o = await avGet({ function: 'OVERVIEW', symbol: ticker }, env)
    if (!o || !o.Symbol) return null
    return {
      raw: o,
      name: o.Name,
      exchange: o.Exchange,
      sector: o.Sector,
      industry: o.Industry,
      description: o.Description,
      mktCap: n(o.MarketCapitalization),
      pe: r2(n(o.PERatio)),
      pb: r2(n(o.PriceToBookRatio)),
      ps: r2(n(o.PriceToSalesRatioTTM)),
      peg: r2(n(o.PEGRatio)),
      evEbitda: r2(n(o.EVToEBITDA)),
      evRevenue: r2(n(o.EVToRevenue)),
      eps: r2(n(o.EPS)),
      bookValue: r2(n(o.BookValue)),
      dividendYield: cleanYield(o.DividendYield),
      grossMargin: pctAny(o.GrossProfitTTM && o.RevenueTTM ? n(o.GrossProfitTTM) / n(o.RevenueTTM) : null),
      opMargin: pctAny(o.OperatingMarginTTM),
      netMargin: pctAny(o.ProfitMargin),
      roe: pctAny(o.ReturnOnEquityTTM),
      roa: pctAny(o.ReturnOnAssetsTTM),
      salesGrowth3y: pctAny(o.QuarterlyRevenueGrowthYOY),
      profitGrowth3y: pctAny(o.QuarterlyEarningsGrowthYOY),
    }
  } catch { return null }
}
async function avQuote(ticker, env) {
  try {
    const d = await avGet({ function: 'GLOBAL_QUOTE', symbol: ticker }, env)
    const q = d?.['Global Quote'] || {}
    return {
      price: r2(n(q['05. price'])),
      open: r2(n(q['02. open'])),
      high: r2(n(q['03. high'])),
      low: r2(n(q['04. low'])),
      volume: n(q['06. volume']),
      prev: r2(n(q['08. previous close'])),
      changePct: pctAny(q['10. change percent']),
    }
  } catch { return null }
}
async function avBalanceSheet(ticker, env) {
  const data = await avGet({ function: 'BALANCE_SHEET', symbol: ticker }, env)
  return {
    annual: Array.isArray(data?.annualReports) ? data.annualReports : [],
    quarterly: Array.isArray(data?.quarterlyReports) ? data.quarterlyReports : [],
  }
}
async function avIncomeStatement(ticker, env) {
  const data = await avGet({ function: 'INCOME_STATEMENT', symbol: ticker }, env)
  return {
    annual: Array.isArray(data?.annualReports) ? data.annualReports : [],
    quarterly: Array.isArray(data?.quarterlyReports) ? data.quarterlyReports : [],
  }
}
async function avCashFlow(ticker, env) {
  const data = await avGet({ function: 'CASH_FLOW', symbol: ticker }, env)
  return {
    annual: Array.isArray(data?.annualReports) ? data.annualReports : [],
    quarterly: Array.isArray(data?.quarterlyReports) ? data.quarterlyReports : [],
  }
}
function avSortedReports(reports = []) {
  return Array.isArray(reports)
    ? [...reports].filter(row => row?.fiscalDateEnding).sort((a, b) => new Date(a.fiscalDateEnding) - new Date(b.fiscalDateEnding))
    : []
}
function avQuarterHeader(date) {
  try {
    const dt = new Date(`${date}T00:00:00Z`)
    if (isNaN(dt.getTime())) return '—'
    return `${['Mar','Jun','Sep','Dec'][Math.floor(dt.getUTCMonth() / 3)]} '${String(dt.getUTCFullYear()).slice(2)}`
  } catch { return '—' }
}

async function avFinancials(ticker, env) {
  const [balanceData, incomeData, cashflowData] = await Promise.all([
    avBalanceSheet(ticker, env).catch(() => ({ annual: [], quarterly: [] })),
    avIncomeStatement(ticker, env).catch(() => ({ annual: [], quarterly: [] })),
    avCashFlow(ticker, env).catch(() => ({ annual: [], quarterly: [] })),
  ])
  const balanceAnnual = avSortedReports(balanceData.annual)
  const incomeAnnual = avSortedReports(incomeData.annual)
  const cashflowAnnual = avSortedReports(cashflowData.annual)
  const incomeQuarterly = avSortedReports(incomeData.quarterly).slice(-12)
  if (!balanceAnnual.length && !incomeAnnual.length && !cashflowAnnual.length && !incomeQuarterly.length) return null
  const annualHeaders = [...new Set([
    ...balanceAnnual.map(r => r.fiscalDateEnding.slice(0, 4)),
    ...incomeAnnual.map(r => r.fiscalDateEnding.slice(0, 4)),
    ...cashflowAnnual.map(r => r.fiscalDateEnding.slice(0, 4)),
  ])].sort()
  const balanceByYear = new Map(balanceAnnual.map(row => [row.fiscalDateEnding.slice(0, 4), row]))
  const incomeByYear = new Map(incomeAnnual.map(row => [row.fiscalDateEnding.slice(0, 4), row]))
  const cashflowByYear = new Map(cashflowAnnual.map(row => [row.fiscalDateEnding.slice(0, 4), row]))
  const pickBalance = year => balanceByYear.get(year) || {}
  const pickIncome = year => incomeByYear.get(year) || {}
  const pickCashflow = year => cashflowByYear.get(year) || {}
  const val = (row, keys) => first(...keys.map(key => n(row?.[key])))
  const annual = {
    headers: annualHeaders,
    sales: annualHeaders.map(year => toM(val(pickIncome(year), ['totalRevenue']))),
    expenses: annualHeaders.map(year => {
      const row = pickIncome(year)
      const revenue = val(row, ['totalRevenue'])
      const operatingIncome = val(row, ['operatingIncome'])
      const totalOperatingExpense = val(row, ['totalOperatingExpense'])
      if (totalOperatingExpense != null) return toM(totalOperatingExpense)
      return revenue != null && operatingIncome != null ? toM(revenue - operatingIncome) : null
    }),
    opProfit: annualHeaders.map(year => toM(val(pickIncome(year), ['operatingIncome']))),
    opm: annualHeaders.map(year => {
      const row = pickIncome(year)
      const revenue = val(row, ['totalRevenue'])
      const operatingIncome = val(row, ['operatingIncome'])
      return revenue && operatingIncome != null ? r2((operatingIncome / revenue) * 100) : null
    }),
    otherIncome: annualHeaders.map(year => {
      const row = pickIncome(year)
      const pretax = val(row, ['incomeBeforeTax'])
      const operatingIncome = val(row, ['operatingIncome'])
      const interest = Math.abs(val(row, ['interestExpense', 'interestAndDebtExpense']) || 0)
      return pretax != null && operatingIncome != null ? toM(pretax - operatingIncome + interest) : null
    }),
    interest: annualHeaders.map(year => toM(Math.abs(val(pickIncome(year), ['interestExpense', 'interestAndDebtExpense']) || 0))),
    depreciation: annualHeaders.map(year => toM(first(
      val(pickCashflow(year), ['depreciationDepletionAndAmortization', 'depreciationAndAmortization']),
      val(pickIncome(year), ['depreciationAndAmortization'])
    ))),
    pbt: annualHeaders.map(year => toM(val(pickIncome(year), ['incomeBeforeTax']))),
    tax: annualHeaders.map(year => {
      const row = pickIncome(year)
      const pretax = val(row, ['incomeBeforeTax'])
      const tax = val(row, ['incomeTaxExpense'])
      return pretax ? r2(((tax || 0) / pretax) * 100) : null
    }),
    netProfit: annualHeaders.map(year => toM(val(pickIncome(year), ['netIncome']))),
    eps: annualHeaders.map(year => r2(val(pickIncome(year), ['reportedEPS']))),
    dividendPayout: annualHeaders.map(year => toM(Math.abs(val(pickCashflow(year), ['dividendPayoutCommonStock', 'dividendPayout']) || 0))),
  }
  const balance = {
    headers: annualHeaders,
    equity: annualHeaders.map(year => toM(val(pickBalance(year), ['commonStock', 'commonStockValue', 'commonStocksIncludingAdditionalPaidInCapital']))),
    reserves: annualHeaders.map(year => toM(val(pickBalance(year), ['totalShareholderEquity']))),
    borrowings: annualHeaders.map(year => toM(first(val(pickBalance(year), ['longTermDebt']), 0) + first(val(pickBalance(year), ['currentDebt']), 0))),
    otherLiabilities: annualHeaders.map(year => {
      const row = pickBalance(year)
      const totalLiabilities = val(row, ['totalLiabilities'])
      const longTermDebt = val(row, ['longTermDebt']) || 0
      const currentDebt = val(row, ['currentDebt']) || 0
      return totalLiabilities != null ? toM(Math.max(0, totalLiabilities - longTermDebt - currentDebt)) : null
    }),
    totalLiabilities: annualHeaders.map(year => toM(val(pickBalance(year), ['totalLiabilities']))),
    fixedAssets: annualHeaders.map(year => toM(val(pickBalance(year), ['propertyPlantEquipment', 'propertyPlantEquipmentNet']))),
    cwip: annualHeaders.map(() => 0),
    investments: annualHeaders.map(year => toM(first(val(pickBalance(year), ['longTermInvestments']), 0) + first(val(pickBalance(year), ['shortTermInvestments']), 0))),
    otherAssets: annualHeaders.map(year => toM(first(val(pickBalance(year), ['otherNonCurrentAssets']), val(pickBalance(year), ['goodwill'])))),
    totalAssets: annualHeaders.map(year => toM(val(pickBalance(year), ['totalAssets']))),
    currentAssets: annualHeaders.map(year => toM(val(pickBalance(year), ['totalCurrentAssets']))),
    currentLiabilities: annualHeaders.map(year => toM(val(pickBalance(year), ['totalCurrentLiabilities']))),
    cash: annualHeaders.map(year => toM(first(val(pickBalance(year), ['cashAndCashEquivalentsAtCarryingValue']), val(pickBalance(year), ['cashAndShortTermInvestments']), val(pickBalance(year), ['cash'])))),
    inventory: annualHeaders.map(year => toM(val(pickBalance(year), ['inventory']))),
    receivables: annualHeaders.map(year => toM(val(pickBalance(year), ['currentNetReceivables']))),
  }
  const quarterly = {
    headers: incomeQuarterly.map(row => avQuarterHeader(row.fiscalDateEnding)),
    sales: incomeQuarterly.map(row => toM(val(row, ['totalRevenue']))),
    expenses: incomeQuarterly.map(row => {
      const revenue = val(row, ['totalRevenue'])
      const operatingIncome = val(row, ['operatingIncome'])
      const totalOperatingExpense = val(row, ['totalOperatingExpense'])
      if (totalOperatingExpense != null) return toM(totalOperatingExpense)
      return revenue != null && operatingIncome != null ? toM(revenue - operatingIncome) : null
    }),
    opProfit: incomeQuarterly.map(row => toM(val(row, ['operatingIncome']))),
    opm: incomeQuarterly.map(row => {
      const revenue = val(row, ['totalRevenue'])
      const operatingIncome = val(row, ['operatingIncome'])
      return revenue && operatingIncome != null ? r2((operatingIncome / revenue) * 100) : null
    }),
    otherIncome: incomeQuarterly.map(row => {
      const pretax = val(row, ['incomeBeforeTax'])
      const operatingIncome = val(row, ['operatingIncome'])
      const interest = Math.abs(val(row, ['interestExpense', 'interestAndDebtExpense']) || 0)
      return pretax != null && operatingIncome != null ? toM(pretax - operatingIncome + interest) : null
    }),
    interest: incomeQuarterly.map(row => toM(Math.abs(val(row, ['interestExpense', 'interestAndDebtExpense']) || 0))),
    depreciation: incomeQuarterly.map(row => toM(val(row, ['depreciationAndAmortization']))),
    pbt: incomeQuarterly.map(row => toM(val(row, ['incomeBeforeTax']))),
    tax: incomeQuarterly.map(row => {
      const pretax = val(row, ['incomeBeforeTax'])
      const tax = val(row, ['incomeTaxExpense'])
      return pretax ? r2(((tax || 0) / pretax) * 100) : null
    }),
    netProfit: incomeQuarterly.map(row => toM(val(row, ['netIncome']))),
    eps: incomeQuarterly.map(row => r2(val(row, ['reportedEPS']))),
  }
  const cashflow = {
    headers: annualHeaders,
    fromOperating: annualHeaders.map(year => toM(val(pickCashflow(year), ['operatingCashflow']))),
    fromInvesting: annualHeaders.map(year => toM(val(pickCashflow(year), ['cashflowFromInvestment']))),
    fromFinancing: annualHeaders.map(year => toM(val(pickCashflow(year), ['cashflowFromFinancing']))),
    netCashFlow: annualHeaders.map(year => toM(val(pickCashflow(year), ['changeInCashAndCashEquivalents']))),
    freeCashFlow: annualHeaders.map(year => {
      const row = pickCashflow(year)
      const operatingCashflow = val(row, ['operatingCashflow'])
      const capex = Math.abs(val(row, ['capitalExpenditures']) || 0)
      return operatingCashflow != null ? toM(operatingCashflow - capex) : null
    }),
  }
  return {
    annual,
    quarterly,
    balance,
    cashflow,
    growth: buildGrowthFromAnnuals(annual, balance),
    balanceSheetSource: 'alpha_vantage',
    balanceSheetYears: annualHeaders.length,
  }
}

function fmpKey(env) {
  return env.FMP_KEY || env.FMP_API_KEY
}
function fmpPlanName(env) {
  const raw = String(env.FMP_PLAN || env.FMP_TIER || env.FMP_SUBSCRIPTION || '').trim()
  return raw || (fmpKey(env) ? 'configured' : null)
}
function fmpPaidPriorityEnabled(env) {
  return !!fmpKey(env)
}
function fmpStarterPlan(env) {
  return /\bstarter\b/i.test(String(fmpPlanName(env) || ''))
}
function fmpInstitutionalV4Allowed(env) {
  const plan = String(fmpPlanName(env) || '').toLowerCase()
  return /premium|ultimate|business|enterprise|professional|pro/.test(plan)
}
function fmpAllowsLegacyV3Fallback(env) {
  return !!fmpKey(env)
}
function apiStats(env) {
  if (!env) return {}
  let stats = API_STATS.get(env)
  if (!stats) {
    stats = {
      fmpRequests: 0,
      fmpErrors: 0,
      fmpRateLimitErrors: 0,
      fmpLastError: null,
      fmpLastRateLimitAt: null,
      workerSubrequestLimitErrors: 0,
    }
    API_STATS.set(env, stats)
  }
  return stats
}
function resetApiStats(env) {
  if (env && typeof env === 'object') API_STATS.delete(env)
  return apiStats(env)
}
function apiStatsSnapshot(env) {
  return { ...apiStats(env) }
}
function isWorkerSubrequestLimitError(message = '') {
  return /too many subrequests|single Worker invocation|subrequests by single worker/i.test(String(message || ''))
}
function fmpRetryDelayMs(attempt, hint = '') {
  const isRateLimited = Number(hint) === 429 || /429|rate|limit/i.test(String(hint || ''))
  const base = isRateLimited ? 2000 : FMP_RETRY_BASE_MS
  return base * Math.pow(2, attempt)
}
function isRetryableFmpStatus(status) {
  return [408, 425, 429, 500, 502, 503, 504].includes(Number(status) || 0)
}
function isRetryableFmpError(error) {
  const message = String(error?.message || error || '')
  return /timed out|aborted|429|500|502|503|504|temporar|rate|limit/i.test(message)
}
async function fmpGet(path, env) {
  const key = fmpKey(env)
  if (!key) throw new Error('FMP_KEY not set')
  const stats = apiStats(env)
  stats.fmpRequests = Number(stats.fmpRequests || 0) + 1
  const sep = path.includes('?') ? '&' : '?'
  const url = path.startsWith('/stable/')
    ? `https://financialmodelingprep.com${path}${sep}apikey=${key}`
    : `https://financialmodelingprep.com/api${path}${sep}apikey=${key}`
  let lastError = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { headers: { 'User-Agent': UA } }, DEFAULT_FETCH_TIMEOUT_MS, `FMP ${path}`)
      if (!res.ok) {
        const detail = (await res.text().catch(() => '')).trim().slice(0, 160)
        const err = new Error(`FMP ${res.status}${detail ? `: ${detail}` : ''}`)
        stats.fmpErrors = Number(stats.fmpErrors || 0) + 1
        stats.fmpLastError = err.message
        err.apiStatsCounted = true
        if (isWorkerSubrequestLimitError(err.message)) stats.workerSubrequestLimitErrors = Number(stats.workerSubrequestLimitErrors || 0) + 1
        if (Number(res.status) === 429 || /rate|limit/i.test(detail)) {
          stats.fmpRateLimitErrors = Number(stats.fmpRateLimitErrors || 0) + 1
          stats.fmpLastRateLimitAt = new Date().toISOString()
        }
        lastError = err
        if (attempt < 2 && isRetryableFmpStatus(res.status)) {
          await sleep(fmpRetryDelayMs(attempt, res.status))
          continue
        }
        throw err
      }
      const d = await res.json()
      const apiError = d?.['Error Message'] || d?.Error || null
      if (apiError) {
        const err = new Error(`FMP: ${apiError}`)
        stats.fmpErrors = Number(stats.fmpErrors || 0) + 1
        stats.fmpLastError = err.message
        err.apiStatsCounted = true
        if (isWorkerSubrequestLimitError(err.message)) stats.workerSubrequestLimitErrors = Number(stats.workerSubrequestLimitErrors || 0) + 1
        if (/rate|limit/i.test(String(apiError))) {
          stats.fmpRateLimitErrors = Number(stats.fmpRateLimitErrors || 0) + 1
          stats.fmpLastRateLimitAt = new Date().toISOString()
        }
        lastError = err
        if (attempt < 2 && /limit|rate|temporar|try again|busy|timeout/i.test(String(apiError))) {
          await sleep(fmpRetryDelayMs(attempt, apiError))
          continue
        }
        throw err
      }
      return d
    } catch (e) {
      if (!e?.apiStatsCounted) {
        stats.fmpErrors = Number(stats.fmpErrors || 0) + 1
        stats.fmpLastError = e?.message || String(e)
        const message = String(e?.message || e)
        if (isWorkerSubrequestLimitError(message)) {
          stats.workerSubrequestLimitErrors = Number(stats.workerSubrequestLimitErrors || 0) + 1
        } else if (/429|rate|limit/i.test(message)) {
          stats.fmpRateLimitErrors = Number(stats.fmpRateLimitErrors || 0) + 1
          stats.fmpLastRateLimitAt = new Date().toISOString()
        }
      }
      lastError = e
      if (attempt < 2 && isRetryableFmpError(e)) {
        await sleep(fmpRetryDelayMs(attempt, e?.message || e))
        continue
      }
      throw e
    }
  }
  throw lastError || new Error(`FMP request failed: ${path}`)
}
async function fmpQuote(ticker, env) {
  try {
    const data = await fmpGet(`/stable/quote?symbol=${ticker}`, env)
    const q = Array.isArray(data) ? data[0] : null
    if (!q) return null
    return {
      price: r2(n(q.price)),
      open: r2(n(q.open)),
      high: r2(n(q.dayHigh)),
      low: r2(n(q.dayLow)),
      prev: r2(n(q.previousClose)),
      changePct: r2(n(q.changesPercentage)),
      marketCap: n(q.marketCap),
      pe: r2(n(q.pe)),
      eps: r2(n(q.eps)),
      volume: n(q.volume),
    }
  } catch { return null }
}
async function fmpRatios(ticker, env) {
  try {
    let data = await fmpGet(`/stable/ratios-ttm?symbol=${ticker}`, env).catch(() => null)
    if ((!Array.isArray(data) || !data.length) && fmpAllowsLegacyV3Fallback(env)) data = await fmpGet(`/v3/ratios-ttm/${ticker}`, env).catch(() => null)
    if (!Array.isArray(data) || !data.length) data = await fmpGet(`/stable/ratios?symbol=${ticker}&limit=1`, env).catch(() => null)
    if ((!Array.isArray(data) || !data.length) && fmpAllowsLegacyV3Fallback(env)) data = await fmpGet(`/v3/ratios/${ticker}?limit=1`, env).catch(() => null)
    if (!Array.isArray(data) || !data.length) return null
    const r = data[0]
    return {
      pe: r2(first(n(r.priceEarningsRatioTTM), n(r.priceEarningsRatio), n(r.peRatioTTM), n(r.peRatio))),
      pb: r2(first(n(r.priceBookValueRatioTTM), n(r.priceBookValueRatio), n(r.pbRatioTTM), n(r.pbRatio))),
      ps: r2(first(n(r.priceToSalesRatioTTM), n(r.priceToSalesRatio), n(r.psRatioTTM), n(r.psRatio))),
      roce: pctAny(r.returnOnCapitalEmployed),
      peg:  r2(n(r.priceEarningsToGrowthRatio)),
      debtToAssets: r2(n(r.debtRatio)),
      debtToEquity: r2(first(
        n(r.debtToEquityRatioTTM),
        n(r.debtToEquityRatio),
        n(r.totalDebtToEquityTTM),
        n(r.totalDebtToEquity),
        n(r.debtEquityRatioTTM),
        n(r.debtEquityRatio)
      )),
      interestCov:  r2(n(r.interestCoverage)),
      assetTurnover:r2(n(r.assetTurnover)),
      invTurnover:  r2(n(r.inventoryTurnover)),
      recTurnover:  r2(n(r.receivablesTurnover)),
      cashRatio:    r2(n(r.cashRatio)),
      currentRatio: r2(first(n(r.currentRatioTTM), n(r.currentRatio))),
      quickRatio:   r2(first(n(r.quickRatioTTM), n(r.quickRatio))),
      grossMargin:  pctAny(first(r.grossProfitMarginTTM, r.grossProfitMargin)),
      opMargin:     pctAny(first(r.operatingProfitMarginTTM, r.operatingProfitMargin)),
      netMargin:    pctAny(first(r.netProfitMarginTTM, r.netProfitMargin)),
      roe:          pctAny(first(r.returnOnEquityTTM, r.returnOnEquity)),
      roa:          pctAny(first(r.returnOnAssetsTTM, r.returnOnAssets)),
      dividendYield:cleanYield(first(r.dividendYieldTTM, r.dividendYield)),
      fcfYield:     r.freeCashFlowYield != null ? r2(n(r.freeCashFlowYield) * 100) : null,
      evEbitda:     r2(n(r.enterpriseValueMultiple)),
    }
  } catch { return null }
}
async function fmpProfile(ticker, env) {
  try {
    const data = await fmpGet(`/stable/profile?symbol=${ticker}`, env)
    return Array.isArray(data) ? data[0] || null : (isPlainObject(data) ? data : null)
  } catch { return null }
}
async function fmpOverview(ticker, env) {
  const [quoteRes, profileRes, ratiosRes] = await Promise.allSettled([
    fmpQuote(ticker, env),
    fmpProfile(ticker, env),
    fmpRatios(ticker, env),
  ])
  const q = quoteRes.status === 'fulfilled' ? quoteRes.value : null
  const p = profileRes.status === 'fulfilled' ? profileRes.value : null
  const r = ratiosRes.status === 'fulfilled' ? ratiosRes.value : null
  if (!q && !p && !r) return null
  const price = positiveOrNull(q?.price ?? p?.price)
  const prev = positiveOrNull(q?.prev)
  return {
    ticker,
    name: p?.companyName || ticker,
    exchange: p?.exchangeShortName || p?.exchange || null,
    sector: p?.sector || null,
    industry: p?.industry || null,
    website: p?.website || null,
    description: p?.description || null,
    price,
    change: price && prev ? r2(price - prev) : null,
    changePct: numberOrNull(q?.changePct),
    open: q?.open ?? null,
    high: q?.high ?? null,
    low: q?.low ?? null,
    volume: q?.volume ?? null,
    avgVolume: p?.volAvg ?? null,
    mktCap: positiveOrNull(q?.marketCap ?? p?.mktCap ?? p?.marketCap),
    pe: q?.pe ?? p?.pe ?? null,
    pb: r?.pb ?? null,
    ps: r?.ps ?? null,
    roe: r?.roe ?? null,
    roa: r?.roa ?? null,
    roce: r?.roce ?? null,
    grossMargin: r?.grossMargin ?? null,
    opMargin: r?.opMargin ?? null,
    netMargin: r?.netMargin ?? null,
    debtToEquity: r?.debtToEquity ?? null,
    eps: q?.eps ?? p?.eps ?? null,
    dividendYield: p?.lastDiv && price ? cleanYield(p.lastDiv / price) : null,
    lastUpdated: new Date().toISOString(),
  }
}
async function fmpKeyMetrics(ticker, env) {
  try {
    let data = await fmpGet(`/stable/key-metrics-ttm?symbol=${ticker}`, env).catch(() => null)
    if ((!Array.isArray(data) || !data.length) && fmpAllowsLegacyV3Fallback(env)) data = await fmpGet(`/v3/key-metrics-ttm/${ticker}`, env).catch(() => null)
    return Array.isArray(data) ? data[0] || null : (isPlainObject(data) ? data : null)
  } catch { return null }
}
async function fmpGrowth(ticker, env) {
  try {
    let data = await fmpGet(`/stable/financial-growth?symbol=${ticker}&limit=1`, env).catch(() => null)
    if ((!Array.isArray(data) || !data.length) && fmpAllowsLegacyV3Fallback(env)) data = await fmpGet(`/v3/financial-growth/${ticker}?limit=1`, env).catch(() => null)
    return Array.isArray(data) ? data[0] || null : (isPlainObject(data) ? data : null)
  } catch { return null }
}
function buildFmpQuarterlyFinancials(qIncRaw = []) {
  const qInc = Array.isArray(qIncRaw) ? [...qIncRaw].reverse() : []
  const val = (row, keys) => first(...keys.map(k => n(row?.[k])))
  const quarterly = {
    headers: qInc.map(r => {
      const d = new Date((r.date || r.fillingDate || '') + 'T00:00:00Z')
      return isNaN(d.getTime()) ? String(r.period || r.date || '').slice(0, 8) : `${['Mar','Jun','Sep','Dec'][Math.floor(d.getUTCMonth() / 3)]} '${String(d.getUTCFullYear()).slice(2)}`
    }),
    sales: qInc.map(r => toM(val(r, ['revenue', 'totalRevenue']))),
    expenses: qInc.map(r => {
      const rev = val(r, ['revenue', 'totalRevenue']), op = val(r, ['operatingIncome', 'operatingIncomeLoss'])
      return rev != null && op != null ? toM(rev - op) : toM(val(r, ['costAndExpenses', 'totalCostsAndExpenses']))
    }),
    opProfit: qInc.map(r => toM(val(r, ['operatingIncome', 'operatingIncomeLoss']))),
    opm: qInc.map(r => val(r, ['revenue', 'totalRevenue']) ? r2((val(r, ['operatingIncome', 'operatingIncomeLoss']) / val(r, ['revenue', 'totalRevenue'])) * 100) : null),
    otherIncome: qInc.map(r => toM(val(r, ['totalOtherIncomeExpensesNet', 'otherIncomeExpenseNet']))),
    interest: qInc.map(r => toM(Math.abs(val(r, ['interestExpense', 'interestExpenseNonOperating']) || 0))),
    depreciation: qInc.map(r => toM(val(r, ['depreciationAndAmortization', 'depreciationAndAmortizationExpense']))),
    pbt: qInc.map(r => toM(val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense']))),
    tax: qInc.map(r => val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense']) ? r2(((val(r, ['incomeTaxExpense', 'incomeTax']) || 0) / val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense'])) * 100) : null),
    netProfit: qInc.map(r => toM(val(r, ['netIncome', 'netIncomeCommonStockholders']))),
    eps: qInc.map(r => r2(val(r, ['epsdiluted', 'epsDiluted', 'eps']))),
  }
  return { quarterly, balanceSheetSource: 'fmp_quarterly_backfill' }
}
async function fmpQuarterlyFinancials(ticker, env) {
  try {
    let data = await fmpGet(`/stable/income-statement?symbol=${ticker}&period=quarter&limit=20`, env).catch(() => null)
    if ((!Array.isArray(data) || !data.length) && fmpAllowsLegacyV3Fallback(env)) data = await fmpGet(`/v3/income-statement/${ticker}?period=quarter&limit=20`, env).catch(() => null)
    const payload = buildFmpQuarterlyFinancials(Array.isArray(data) ? data : [])
    return hasStockPageQuarterlyCoverage(payload) ? payload : null
  } catch {
    return null
  }
}
async function fmpAnnualFinancials(ticker, env, limit = 10, opts = {}) {
  try {
    const includeQuarterly = opts.includeQuarterly !== false
    const fmpStatement = async (stablePath, v3Path) => {
      const stable = await fmpGet(stablePath, env).catch(() => null)
      if (Array.isArray(stable) && stable.length) return stable
      if (!fmpAllowsLegacyV3Fallback(env)) return []
      const v3 = await fmpGet(v3Path, env).catch(() => null)
      return Array.isArray(v3) ? v3 : []
    }
    const [incRaw, balRaw, cfRaw, qIncRaw] = await Promise.all([
      fmpStatement(`/stable/income-statement?symbol=${ticker}&period=annual&limit=${limit}`, `/v3/income-statement/${ticker}?period=annual&limit=${limit}`),
      fmpStatement(`/stable/balance-sheet-statement?symbol=${ticker}&period=annual&limit=${limit}`, `/v3/balance-sheet-statement/${ticker}?period=annual&limit=${limit}`),
      fmpStatement(`/stable/cash-flow-statement?symbol=${ticker}&period=annual&limit=${limit}`, `/v3/cash-flow-statement/${ticker}?period=annual&limit=${limit}`),
      includeQuarterly
        ? fmpStatement(`/stable/income-statement?symbol=${ticker}&period=quarter&limit=20`, `/v3/income-statement/${ticker}?period=quarter&limit=20`)
        : Promise.resolve([]),
    ])
    const normalizeAnnualRows = rawRows => {
      if (!Array.isArray(rawRows)) return []
      return rawRows
        .map(row => ({ ...row, __year: String(row.calendarYear || row.fiscalYear || row.fiscalDateEnding || row.date || row.fillingDate || row.acceptedDate || '').slice(0, 4) }))
        .filter(row => /^\d{4}$/.test(row.__year))
        .sort((a, b) => a.__year.localeCompare(b.__year))
    }
    const inc = normalizeAnnualRows(incRaw)
    const bal = normalizeAnnualRows(balRaw)
    const cf = normalizeAnnualRows(cfRaw)
    const qInc = Array.isArray(qIncRaw) ? [...qIncRaw].reverse() : []
    const headers = [...new Set([...inc, ...bal, ...cf].map(r => r.__year))].sort()
    const incMap = new Map(inc.map(r => [r.__year, r]))
    const balMap = new Map(bal.map(r => [r.__year, r]))
    const cfMap = new Map(cf.map(r => [r.__year, r]))
    const pickInc = year => incMap.get(year) || {}
    const pickBal = year => balMap.get(year) || {}
    const pickCf = year => cfMap.get(year) || {}
    const val = (row, keys) => first(...keys.map(k => n(row[k])))
    const annual = {
      headers,
      sales: headers.map(year => toM(val(pickInc(year), ['revenue', 'totalRevenue']))),
      expenses: headers.map(year => {
        const row = pickInc(year)
        const rev = val(row, ['revenue', 'totalRevenue']), op = val(row, ['operatingIncome', 'operatingIncomeLoss'])
        return rev != null && op != null ? toM(rev - op) : toM(val(row, ['costAndExpenses', 'totalCostsAndExpenses']))
      }),
      opProfit: headers.map(year => toM(val(pickInc(year), ['operatingIncome', 'operatingIncomeLoss']))),
      opm: headers.map(year => {
        const row = pickInc(year)
        const rev = val(row, ['revenue', 'totalRevenue']), op = val(row, ['operatingIncome', 'operatingIncomeLoss'])
        return rev != null && op != null ? r2((op / rev) * 100) : null
      }),
      otherIncome: headers.map(year => toM(val(pickInc(year), ['totalOtherIncomeExpensesNet', 'otherIncomeExpenseNet']))),
      interest: headers.map(year => toM(Math.abs(val(pickInc(year), ['interestExpense', 'interestExpenseNonOperating']) || 0))),
      depreciation: headers.map(year => toM(first(
        val(pickInc(year), ['depreciationAndAmortization', 'depreciationAndAmortizationExpense']),
        val(pickCf(year), ['depreciationAndAmortization', 'depreciationAndAmortizationExpense'])
      ))),
      pbt: headers.map(year => toM(val(pickInc(year), ['incomeBeforeTax', 'incomeBeforeTaxExpense']))),
      tax: headers.map(year => {
        const row = pickInc(year)
        const pbt = val(row, ['incomeBeforeTax', 'incomeBeforeTaxExpense'])
        return pbt ? r2(((val(row, ['incomeTaxExpense', 'incomeTax']) || 0) / pbt) * 100) : null
      }),
      netProfit: headers.map(year => toM(val(pickInc(year), ['netIncome', 'netIncomeCommonStockholders']))),
      eps: headers.map(year => {
        const row = pickInc(year)
        return r2(val(row, ['epsdiluted', 'epsDiluted', 'eps']))
      }),
      dividendPayout: headers.map(() => null),
    }
    const balance = {
      headers,
      equity: headers.map(year => toM(val(pickBal(year), ['commonStock', 'commonStocksIncludingAdditionalPaidInCapital', 'commonStockValue']))),
      reserves: headers.map(year => toM(first(
        val(pickBal(year), ['totalStockholdersEquity', 'totalShareholderEquity', 'totalEquity', 'stockholdersEquity'])
      ))),
      borrowings: headers.map(year => toM(first(
        val(pickBal(year), ['totalDebt']),
        (val(pickBal(year), ['shortTermDebt', 'shortTermDebtAndCurrentPortionOfLongTermDebt']) || 0) + (val(pickBal(year), ['longTermDebt']) || 0)
      ))),
      otherLiabilities: headers.map(year => {
        const total = val(pickBal(year), ['totalLiabilities']), debt = val(pickBal(year), ['totalDebt']) || 0
        return total != null ? toM(Math.max(0, total - debt)) : null
      }),
      totalLiabilities: headers.map(year => toM(val(pickBal(year), ['totalLiabilities']))),
      fixedAssets: headers.map(year => toM(val(pickBal(year), ['propertyPlantEquipmentNet', 'netPPE']))),
      cwip: headers.map(() => 0),
      investments: headers.map(year => toM((val(pickBal(year), ['shortTermInvestments']) || 0) + (val(pickBal(year), ['longTermInvestments']) || 0))),
      otherAssets: headers.map(year => toM(val(pickBal(year), ['goodwill', 'otherAssets', 'otherNonCurrentAssets']))),
      totalAssets: headers.map(year => toM(val(pickBal(year), ['totalAssets']))),
      currentAssets: headers.map(year => toM(val(pickBal(year), ['totalCurrentAssets', 'totalCurrentAssetsNet']))),
      currentLiabilities: headers.map(year => toM(val(pickBal(year), ['totalCurrentLiabilities']))),
      cash: headers.map(year => toM(val(pickBal(year), ['cashAndCashEquivalents', 'cashAndCashEquivalentsAtCarryingValue', 'cash']))),
      inventory: headers.map(year => toM(val(pickBal(year), ['inventory']))),
      receivables: headers.map(year => toM(val(pickBal(year), ['netReceivables', 'currentNetReceivables']))),
    }
    const investingComponents = row => sumDefinedValues(row, [
      'capitalExpenditure',
      'capitalExpenditures',
      'investmentsInPropertyPlantAndEquipment',
      'acquisitionsNet',
      'businessAcquisitionsAndDisposals',
      'netBusinessAcquisitionsDisposals',
      'purchasesOfInvestments',
      'salesMaturitiesOfInvestments',
      'investmentsInMarketableSecurities',
      'otherInvestingActivites',
      'otherInvestingActivities',
    ])
    const financingComponents = row => sumDefinedValues(row, [
      'netDebtIssued',
      'debtRepayment',
      'commonStockIssued',
      'commonStockRepurchased',
      'paymentsForRepurchaseOfCommonStock',
      'dividendsPaid',
      'otherFinancingActivites',
      'otherFinancingActivities',
    ])
    const cashflow = {
      headers,
      fromOperating: headers.map(year => toM(val(pickCf(year), ['operatingCashFlow', 'netCashProvidedByOperatingActivities', 'netCashProvidedByUsedInOperatingActivities']))),
      fromInvesting: headers.map(year => toM(first(
        val(pickCf(year), [
          'netCashUsedForInvestingActivites',
          'netCashUsedForInvestingActivities',
          'netCashProvidedByUsedInInvestingActivities',
          'netCashUsedInInvestingActivities',
          'cashFlowFromInvestment',
        ]),
        investingComponents(pickCf(year))
      ))),
      fromFinancing: headers.map(year => toM(first(
        val(pickCf(year), [
          'netCashUsedProvidedByFinancingActivities',
          'netCashUsedForFinancingActivities',
          'netCashProvidedByUsedInFinancingActivities',
          'netCashUsedInFinancingActivities',
          'cashFlowFromFinancing',
        ]),
        financingComponents(pickCf(year))
      ))),
      netCashFlow: headers.map(year => toM(val(pickCf(year), ['netChangeInCash', 'netChangeInCashAndCashEquivalents']))),
      freeCashFlow: headers.map(year => toM(val(pickCf(year), ['freeCashFlow']) ?? ((val(pickCf(year), ['operatingCashFlow', 'netCashProvidedByOperatingActivities']) || 0) - Math.abs(val(pickCf(year), ['capitalExpenditure', 'capitalExpenditures']) || 0)))),
    }
    const payload = {
      annual,
      quarterly: {
        headers: qInc.map(r => {
          const d = new Date((r.date || r.fillingDate || '') + 'T00:00:00Z')
          return isNaN(d.getTime()) ? String(r.period || r.date || '').slice(0, 8) : `${['Mar','Jun','Sep','Dec'][Math.floor(d.getUTCMonth() / 3)]} '${String(d.getUTCFullYear()).slice(2)}`
        }),
        sales: qInc.map(r => toM(val(r, ['revenue', 'totalRevenue']))),
        expenses: qInc.map(r => {
          const rev = val(r, ['revenue', 'totalRevenue']), op = val(r, ['operatingIncome', 'operatingIncomeLoss'])
          return rev != null && op != null ? toM(rev - op) : toM(val(r, ['costAndExpenses', 'totalCostsAndExpenses']))
        }),
        opProfit: qInc.map(r => toM(val(r, ['operatingIncome', 'operatingIncomeLoss']))),
        opm: qInc.map(r => val(r, ['revenue', 'totalRevenue']) ? r2((val(r, ['operatingIncome', 'operatingIncomeLoss']) / val(r, ['revenue', 'totalRevenue'])) * 100) : null),
        otherIncome: qInc.map(r => toM(val(r, ['totalOtherIncomeExpensesNet', 'otherIncomeExpenseNet']))),
        interest: qInc.map(r => toM(Math.abs(val(r, ['interestExpense', 'interestExpenseNonOperating']) || 0))),
        depreciation: qInc.map(r => toM(val(r, ['depreciationAndAmortization', 'depreciationAndAmortizationExpense']))),
        pbt: qInc.map(r => toM(val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense']))),
        tax: qInc.map(r => val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense']) ? r2(((val(r, ['incomeTaxExpense', 'incomeTax']) || 0) / val(r, ['incomeBeforeTax', 'incomeBeforeTaxExpense'])) * 100) : null),
        netProfit: qInc.map(r => toM(val(r, ['netIncome', 'netIncomeCommonStockholders']))),
        eps: qInc.map(r => r2(val(r, ['epsdiluted', 'epsDiluted', 'eps']))),
      },
      balance,
      cashflow,
      growth: buildGrowthFromAnnuals(annual, balance),
      balanceSheetSource: qInc.length ? 'fmp_starter_annual_quarterly' : 'fmp_starter',
      balanceSheetYears: headers.length,
    }
    if (!inc.length && !bal.length && !cf.length && !hasUsefulQuarterlyFinancials(payload)) return null
    return payload
  } catch (e) {
    console.log(`FMP annual financials failed ${ticker}:`, e.message)
    return null
  }
}

function normalizePeerSymbols(raw, ticker) {
  const values = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.peersList)
      ? raw.peersList
      : Array.isArray(raw?.peers)
        ? raw.peers
        : []
  const symbols = values.flatMap(item => {
    if (typeof item === 'string') return item.split(',')
    const value = item?.symbol || item?.ticker || item?.peerSymbol || item?.peer || item?.stockSymbol || ''
    return value ? [value] : []
  })
  return [...new Set(symbols.map(value => cleanTicker(value)).filter(symbol => symbol && symbol !== ticker))].slice(0, 5)
}
async function fmpStockPeers(ticker, env) {
  if (!fmpKey(env)) return []
  try {
    const data = await fmpGet(`/stable/stock-peers?symbol=${ticker}`, env)
    return normalizePeerSymbols(data, ticker)
  } catch { return [] }
}
async function debugFmpDeepTicker(env, ticker) {
  const t = cleanTicker(ticker) || 'AAPL'
  const [inc, bal, cf, ratios, metrics, annual, built] = await Promise.all([
    fmpGet(`/stable/income-statement?symbol=${t}&period=annual&limit=2`, env).catch(e => ({ error: e.message })),
    fmpGet(`/stable/balance-sheet-statement?symbol=${t}&period=annual&limit=2`, env).catch(e => ({ error: e.message })),
    fmpGet(`/stable/cash-flow-statement?symbol=${t}&period=annual&limit=2`, env).catch(e => ({ error: e.message })),
    fmpRatios(t, env).catch(e => ({ error: e.message })),
    fmpKeyMetrics(t, env).catch(e => ({ error: e.message })),
    fmpAnnualFinancials(t, env, 2).catch(e => ({ error: e.message })),
    buildStockData(t, env, {
      preferStoredOverview: true,
      preferStoredFinancials: true,
      preferStoredRatios: true,
      fmpPriority: true,
      skipQuarterlyEnrichment: true,
      skipSlowFinancialFallback: true,
      lightweightRatios: true,
      skipReturns: true,
      collectTimings: true,
    }).catch(e => ({ error: e.message })),
  ])
  const builtFields = built?.overview ? screenerFields(t, built) : null
  return {
    ok: true,
    ticker: t,
    fmpKey: !!fmpKey(env),
    stableCounts: {
      income: Array.isArray(inc) ? inc.length : 0,
      balance: Array.isArray(bal) ? bal.length : 0,
      cashflow: Array.isArray(cf) ? cf.length : 0,
    },
    stableErrors: {
      income: inc?.error || null,
      balance: bal?.error || null,
      cashflow: cf?.error || null,
    },
    parsed: {
      financialsUseful: hasUsefulFinancials(annual),
      balanceSheetSource: annual?.balanceSheetSource || null,
      annualYears: annual?.annual?.headers?.length || 0,
      balanceYears: annual?.balance?.headers?.length || 0,
      salesPoints: (annual?.annual?.sales || []).filter(v => v != null).length,
      assetPoints: (annual?.balance?.totalAssets || []).filter(v => v != null).length,
      ratiosUseful: hasUsefulRatios(ratios),
      ratioKeys: ratios && typeof ratios === 'object' ? Object.keys(ratios).filter(k => ratios[k] != null).slice(0, 20) : [],
      metricsKeys: metrics && typeof metrics === 'object' ? Object.keys(metrics).filter(k => metrics[k] != null).slice(0, 20) : [],
      builtOverview: !!built?.overview,
      builtFinancialsUseful: hasUsefulFinancials(built?.financials),
      builtPageFinancialsUseful: hasStockPageFinancialCoverage(built?.financials),
      builtRatiosUseful: hasUsefulRatios(built?.ratios),
      builtPageRatiosUseful: hasStockPageRatioCoverage(built?.ratios),
      builtStockPageReady: !!(built?.overview && hasStockPageFinancialCoverage(built?.financials) && hasCoreScreenerRatios(built?.ratios) && hasStockPageRatioCoverage(built?.ratios)),
      builtFields,
      builtTimings: built?.timings || null,
      builtError: built?.error || null,
    }
  }
}
async function fmpInstitutional(ticker, env) {
  if (!fmpInstitutionalV4Allowed(env)) return []
  const paths = [
    `/v3/institutional-holder/${ticker}`,
    ...(fmpInstitutionalV4Allowed(env) ? [
      `/v4/institutional-ownership/institutional-holders/symbol-ownership?symbol=${ticker}`,
      `/v4/institutional-ownership/list?symbol=${ticker}`,
    ] : []),
  ]
  for (const path of paths) {
    try {
      const data = await fmpGet(path, env)
      if (Array.isArray(data) && data.length) return data.slice(0, 25)
    } catch {}
  }
  return []
}
async function fmpOwnershipSummary(ticker, env) {
  if (!fmpInstitutionalV4Allowed(env)) return null
  const paths = [
    `/v4/institutional-ownership/symbol-ownership?symbol=${ticker}&includeCurrentQuarter=true`,
    `/v4/institutional-ownership/symbol-ownership?symbol=${ticker}`,
  ]
  for (const path of paths) {
    try {
      const data = await fmpGet(path, env)
      const r = Array.isArray(data) ? data[0] : null
      if (!r) continue
      return {
        institutionalShares: first(n(r.investorsHolding), n(r.institutionalShares), n(r.totalSharesHeld)),
        institutionalValue: first(n(r.totalInvested), n(r.institutionalValue), n(r.totalValue)),
        institutionalOwnershipPct: pctAny(first(r.institutionalOwnershipPercentage, r.ownershipPercent, r.percentOfSharesOutstanding)),
        holders: n(r.numberOfInstitutionalInvestors),
        reportDate: r.date || r.filingDate || null,
        source: 'fmp_v4'
      }
    } catch {}
  }
  return null
}

function normalizeHolder(h) {
  return {
    name: h.holder || h.name || h.organization || h.investorName || h.ownerName,
    shares: first(raw(h.position), n(h.shares), n(h.reportedHolding), n(h.sharesHeld), n(h.share), n(h.quantity)),
    value: first(n(h.value), n(h.marketValue), n(h.reportedValue), n(h.valueHeld)) ? r2(first(n(h.value), n(h.marketValue), n(h.reportedValue), n(h.valueHeld)) / 1e9) : null,
    pctHeld: pctAny(first(h.sharesPercentage, h.pctHeld, h.percent, h.percentOfSharesOutstanding, h.ownershipPercent)),
    change: first(n(h.change), n(h.changeInShares), n(h.shareChange)),
    reportDate: h.dateReported || h.reportDate || h.asOfDate || h.filingDate || h.date || null
  }
}

async function finnhubOwnership(ticker, env) {
  try {
    const d = await finnhubGet(`/stock/ownership?symbol=${ticker}&limit=25`, env)
    const rows = d?.ownership || d?.data || []
    if (!Array.isArray(rows)) return []
    return rows.slice(0, 25).map(h => ({
      name: h.name,
      shares: first(n(h.share), n(h.shares)),
      value: null,
      pctHeld: pctAny(h.percent),
      change: first(n(h.change), n(h.shareChange)),
      reportDate: h.filingDate || h.reportDate || null,
    }))
  } catch { return [] }
}

async function yahooHolders(ticker) {
  for (const modules of [
    ['institutionOwnership', 'fundOwnership', 'majorHoldersBreakdown', 'insiderHolders'],
    ['majorHoldersBreakdown'],
  ]) {
    try {
      const d = await yfS(ticker, modules)
      if (d) return d
    } catch {}
  }
  return null
}
async function finnhubGet(path, env) {
  if (!env.FINNHUB_KEY) throw new Error('FINNHUB_KEY not set')
  const sep = path.includes('?') ? '&' : '?'
  const res = await fetchWithTimeout(`https://finnhub.io/api/v1${path}${sep}token=${env.FINNHUB_KEY}`, { headers: { 'User-Agent': UA } }, DEFAULT_FETCH_TIMEOUT_MS, `Finnhub ${path}`)
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)
  return res.json()
}
async function finnhubQuote(ticker, env) {
  try {
    const q = await finnhubGet(`/quote?symbol=${ticker}`, env)
    return {
      price: r2(n(q?.c)),
      open: r2(n(q?.o)),
      high: r2(n(q?.h)),
      low: r2(n(q?.l)),
      prev: r2(n(q?.pc)),
      changePct: q?.dp != null ? r2(n(q.dp)) : null,
    }
  } catch { return null }
}
async function finnhubMetrics(ticker, env) {
  try {
    const d = await finnhubGet(`/stock/metric?symbol=${ticker}&metric=all`, env)
    const m = d?.metric || {}
    return {
      pe: r2(first(m.peNormalizedAnnual, m.peTTM, m.peBasicExclExtraTTM)),
      pb: r2(first(m.pbAnnual, m.pbQuarterly)),
      ps: r2(first(m.psAnnual, m.psTTM)),
      peg: r2(first(m.pegTTM)),
      dividendYield: cleanYield(first(m.dividendYieldIndicatedAnnual, m.dividendYieldTTM)),
      grossMargin: pctAny(first(m.grossMarginAnnual, m.grossMarginTTM)),
      opMargin: pctAny(first(m.operatingMarginAnnual, m.operatingMarginTTM)),
      netMargin: pctAny(first(m.netProfitMarginAnnual, m.netProfitMarginTTM)),
      roe: pctAny(first(m.roeTTM, m.roeRfy)),
      roa: pctAny(first(m.roaTTM, m.roaRfy)),
      currentRatio: r2(first(m.currentRatioAnnual, m.currentRatioQuarterly)),
      quickRatio: r2(first(m.quickRatioAnnual, m.quickRatioQuarterly)),
      debtToEquity: r2(first(m.totalDebtToEquityAnnual, m.totalDebtToEquityQuarterly, m.longTermDebtToEquityAnnual)),
      interestCoverage: r2(first(m.interestCoverageAnnual, m.interestCoverageTTM, m.interestCoverageQuarterly)),
      assetTurnover: r2(first(m.assetTurnoverAnnual, m.assetTurnoverTTM)),
      inventoryTurnover: r2(first(m.inventoryTurnoverAnnual, m.inventoryTurnoverTTM)),
      receivablesTurnover: r2(first(m.receivablesTurnoverAnnual, m.receivablesTurnoverTTM)),
      salesGrowth3y: pctAny(first(m.revenueGrowth3Y, m.revenueGrowth5Y)),
      profitGrowth3y: pctAny(first(m.epsGrowth3Y, m.epsGrowth5Y)),
    }
  } catch { return null }
}
async function finnhubNews(ticker, env) {
  try {
    const to   = new Date().toISOString().slice(0, 10)
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const data = await finnhubGet(`/company-news?symbol=${ticker}&from=${from}&to=${to}`, env)
    if (Array.isArray(data) && data.length) {
      return data.slice(0, 12).map(item => ({
        title: item.headline, url: item.url, source: item.source,
        publishedDate: new Date(item.datetime * 1000).toISOString(),
        image: item.image || null, text: item.summary || null,
      }))
    }
    return []
  } catch { return [] }
}

function polygonKey(env) {
  return env.POLYGON_API_KEY || env.POLYGON_KEY || env.POLYGON_KEY_ID
}
async function polygonGet(path, env, params = {}) {
  const key = polygonKey(env)
  if (!key) throw new Error('POLYGON_API_KEY not set')
  const qs = new URLSearchParams({ ...params, apiKey: key }).toString()
  const res = await fetchWithTimeout(`https://api.polygon.io${path}${qs ? '?' + qs : ''}`, { headers: { 'User-Agent': UA } }, DEFAULT_FETCH_TIMEOUT_MS, `Polygon ${path}`)
  if (!res.ok) throw new Error(`Polygon ${res.status}`)
  return res.json()
}
async function polygonDetails(ticker, env) {
  try {
    const d = await polygonGet(`/v3/reference/tickers/${ticker}`, env)
    return d?.results || null
  } catch { return null }
}
async function polygonPrevClose(ticker, env) {
  try {
    const d = await polygonGet(`/v2/aggs/ticker/${ticker}/prev`, env, { adjusted: 'true' })
    const r = d?.results?.[0]
    if (!r) return null
    return {
      price: r2(first(n(r.c), n(r.vw))),
      open: r2(n(r.o)),
      high: r2(n(r.h)),
      low: r2(n(r.l)),
      volume: n(r.v),
      prev: r2(n(r.c)),
    }
  } catch { return null }
}
function pVal(section, keys) {
  for (const key of keys) {
    const v = section?.[key]?.value ?? section?.[key]
    const num = n(v)
    if (num != null) return num
  }
  return null
}
async function polygonRatios(ticker, env) {
  try {
    const d = await polygonGet('/vX/reference/financials', env, { ticker, timeframe: 'annual', limit: '1', order: 'desc' })
    const row = d?.results?.[0]
    const fs = row?.financials || {}
    const inc = fs.income_statement || {}, bs = fs.balance_sheet || {}, cf = fs.cash_flow_statement || {}
    const revenue = pVal(inc, ['revenues','revenue','sales_revenue_net'])
    const netIncome = pVal(inc, ['net_income_loss','net_income','income_loss_from_continuing_operations_after_tax'])
    const opIncome = pVal(inc, ['operating_income_loss','operating_income'])
    const pretax = pVal(inc, ['income_loss_from_continuing_operations_before_tax','income_before_tax'])
    const interest = Math.abs(pVal(inc, ['interest_expense_operating','interest_expense_non_operating','interest_expense']) || 0) || null
    const assets = pVal(bs, ['assets','total_assets'])
    const equity = pVal(bs, ['equity','stockholders_equity','equity_attributable_to_parent'])
    const liabilities = pVal(bs, ['liabilities','total_liabilities'])
    const currAssets = pVal(bs, ['current_assets','assets_current'])
    const currLiab = pVal(bs, ['current_liabilities','liabilities_current'])
    const inventory = pVal(bs, ['inventory','inventory_net'])
    const cash = pVal(bs, ['cash','cash_and_cash_equivalents','cash_and_cash_equivalents_at_carrying_value'])
    const debt = first(pVal(bs, ['long_term_debt']), 0) + first(pVal(bs, ['short_term_debt','debt_current']), 0)
    const opCash = pVal(cf, ['net_cash_flow_from_operating_activities','net_cash_flow_from_operating_activities_continuing'])
    const capex = Math.abs(pVal(cf, ['payments_to_acquire_property_plant_and_equipment','capital_expenditure']) || 0)
    const details = await polygonDetails(ticker, env).catch(() => null)
    const mktCap = n(details?.market_cap)
    const ev = mktCap != null ? mktCap + (debt || 0) - (cash || 0) : null
    const ebitda = opIncome
    return {
      mktCap,
      name: details?.name,
      website: details?.homepage_url,
      description: details?.description,
      sector: details?.sic_description,
      pe: mktCap && netIncome ? r2(mktCap / netIncome) : null,
      pb: mktCap && equity > 0 ? r2(mktCap / equity) : null,
      ps: mktCap && revenue > 0 ? r2(mktCap / revenue) : null,
      evRevenue: ev && revenue > 0 ? r2(ev / revenue) : null,
      evEbitda: ev && ebitda > 0 ? r2(ev / ebitda) : null,
      earningsYield: mktCap && netIncome != null ? r2((netIncome / mktCap) * 100) : null,
      fcfYield: mktCap && opCash != null ? r2(((opCash - capex) / mktCap) * 100) : null,
      opMargin: revenue && opIncome != null ? r2((opIncome / revenue) * 100) : null,
      netMargin: revenue && netIncome != null ? r2((netIncome / revenue) * 100) : null,
      roe: equity && netIncome != null ? r2((netIncome / equity) * 100) : null,
      roa: assets && netIncome != null ? r2((netIncome / assets) * 100) : null,
      roce: assets && liabilities != null && opIncome != null ? r2((opIncome / (assets - liabilities)) * 100) : null,
      currentRatio: currAssets && currLiab ? r2(currAssets / currLiab) : null,
      quickRatio: currAssets != null && currLiab ? r2((currAssets - (inventory || 0)) / currLiab) : null,
      cashRatio: cash != null && currLiab ? r2(cash / currLiab) : null,
      debtToEquity: equity && debt != null ? r2(debt / equity) : null,
      debtToAssets: assets && debt != null ? r2(debt / assets) : null,
      interestCoverage: interest && opIncome != null ? r2(opIncome / interest) : null,
      assetTurnover: assets && revenue ? r2(revenue / assets) : null,
    }
  } catch { return null }
}

async function polygonFinancials(ticker, env, limit = 4) {
  try {
    const d = await polygonGet('/vX/reference/financials', env, { ticker, timeframe: 'annual', limit: String(limit), order: 'desc' })
    const rows = Array.isArray(d?.results) ? [...d.results] : []
    if (!rows.length) return null
    const normalized = rows
      .map(row => {
        const date = String(row?.fiscal_period?.fiscal_year || row?.fiscal_year || row?.end_date || row?.filing_date || '').slice(0, 4)
        return /^\d{4}$/.test(date) ? { row, year: date } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.year.localeCompare(b.year))
    if (!normalized.length) return null
    const headers = normalized.map(item => item.year)
    const annual = {
      headers,
      sales: normalized.map(item => toM(pVal(item.row?.financials?.income_statement, ['revenues','revenue','sales_revenue_net']))),
      expenses: normalized.map(item => {
        const inc = item.row?.financials?.income_statement || {}
        const revenue = pVal(inc, ['revenues','revenue','sales_revenue_net'])
        const opIncome = pVal(inc, ['operating_income_loss','operating_income'])
        return revenue != null && opIncome != null ? toM(revenue - opIncome) : null
      }),
      opProfit: normalized.map(item => toM(pVal(item.row?.financials?.income_statement, ['operating_income_loss','operating_income']))),
      opm: normalized.map(item => {
        const inc = item.row?.financials?.income_statement || {}
        const revenue = pVal(inc, ['revenues','revenue','sales_revenue_net'])
        const opIncome = pVal(inc, ['operating_income_loss','operating_income'])
        return revenue && opIncome != null ? r2((opIncome / revenue) * 100) : null
      }),
      otherIncome: normalized.map(item => toM(pVal(item.row?.financials?.income_statement, ['other_nonoperating_income_expense','other_income_expense_net']))),
      interest: normalized.map(item => toM(Math.abs(pVal(item.row?.financials?.income_statement, ['interest_expense_operating','interest_expense_non_operating','interest_expense']) || 0))),
      depreciation: normalized.map(item => toM(pVal(item.row?.financials?.cash_flow_statement, ['depreciation_and_amortization','depreciation_depletion_and_amortization']))),
      pbt: normalized.map(item => toM(pVal(item.row?.financials?.income_statement, ['income_loss_from_continuing_operations_before_tax','income_before_tax']))),
      tax: normalized.map(item => {
        const inc = item.row?.financials?.income_statement || {}
        const pretax = pVal(inc, ['income_loss_from_continuing_operations_before_tax','income_before_tax'])
        const tax = pVal(inc, ['income_tax_expense_benefit','income_tax_expense'])
        return pretax ? r2(((tax || 0) / pretax) * 100) : null
      }),
      netProfit: normalized.map(item => toM(pVal(item.row?.financials?.income_statement, ['net_income_loss','net_income','income_loss_from_continuing_operations_after_tax']))),
      eps: normalized.map(() => null),
      dividendPayout: normalized.map(() => null),
    }
    const balance = {
      headers,
      equity: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['equity','stockholders_equity','equity_attributable_to_parent']))),
      reserves: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['equity','stockholders_equity','equity_attributable_to_parent']))),
      borrowings: normalized.map(item => toM(
        first(pVal(item.row?.financials?.balance_sheet, ['long_term_debt']), 0) +
        first(pVal(item.row?.financials?.balance_sheet, ['short_term_debt','debt_current']), 0)
      )),
      otherLiabilities: normalized.map(item => {
        const bs = item.row?.financials?.balance_sheet || {}
        const liabilities = pVal(bs, ['liabilities','total_liabilities'])
        const debt = first(pVal(bs, ['long_term_debt']), 0) + first(pVal(bs, ['short_term_debt','debt_current']), 0)
        return liabilities != null ? toM(Math.max(0, liabilities - debt)) : null
      }),
      totalLiabilities: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['liabilities','total_liabilities']))),
      fixedAssets: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['property_plant_and_equipment_net','property_plant_equipment_net']))),
      cwip: normalized.map(() => 0),
      investments: normalized.map(item => toM(first(
        pVal(item.row?.financials?.balance_sheet, ['short_term_investments']),
        0
      ) + first(
        pVal(item.row?.financials?.balance_sheet, ['long_term_investments']),
        0
      ))),
      otherAssets: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['other_assets','other_assets_noncurrent','goodwill']))),
      totalAssets: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['assets','total_assets']))),
      currentAssets: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['current_assets','assets_current']))),
      currentLiabilities: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['current_liabilities','liabilities_current']))),
      cash: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['cash','cash_and_cash_equivalents','cash_and_cash_equivalents_at_carrying_value']))),
      inventory: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['inventory','inventory_net']))),
      receivables: normalized.map(item => toM(pVal(item.row?.financials?.balance_sheet, ['accounts_receivable_net_current','receivables_net_current']))),
    }
    const cashflow = {
      headers,
      fromOperating: normalized.map(item => toM(pVal(item.row?.financials?.cash_flow_statement, ['net_cash_flow_from_operating_activities','net_cash_flow_from_operating_activities_continuing']))),
      fromInvesting: normalized.map(item => toM(pVal(item.row?.financials?.cash_flow_statement, ['net_cash_flow_from_investing_activities','net_cash_flow_from_investing_activities_continuing']))),
      fromFinancing: normalized.map(item => toM(pVal(item.row?.financials?.cash_flow_statement, ['net_cash_flow_from_financing_activities','net_cash_flow_from_financing_activities_continuing']))),
      netCashFlow: normalized.map(item => toM(pVal(item.row?.financials?.cash_flow_statement, ['net_cash_flow','net_change_in_cash_and_cash_equivalents']))),
      freeCashFlow: normalized.map(item => {
        const cf = item.row?.financials?.cash_flow_statement || {}
        const op = pVal(cf, ['net_cash_flow_from_operating_activities','net_cash_flow_from_operating_activities_continuing'])
        const capex = Math.abs(pVal(cf, ['payments_to_acquire_property_plant_and_equipment','capital_expenditure']) || 0)
        return op != null ? toM(op - capex) : null
      }),
    }
    return {
      annual,
      quarterly: { headers: [], sales: [], expenses: [], opProfit: [], opm: [], otherIncome: [], interest: [], depreciation: [], pbt: [], tax: [], netProfit: [], eps: [] },
      balance,
      cashflow,
      growth: buildGrowthFromAnnuals(annual, balance),
      balanceSheetSource: 'polygon_financials',
      balanceSheetYears: headers.length,
    }
  } catch { return null }
}

function buildFinancialsFromSEC(sec, years = 10) {
  const durVal = exactValAt
  const durAny = (series, d) => exactValAt(series, d) ?? valAt(series, d)
  const instVal = valAt
  // Annual P&L dates — use income statement dates
  const incDates = unionDates([sec.income.revenue, sec.income.netInc, sec.income.opInc], years)
  const bsDates  = unionDates([sec.balance.assets, sec.balance.equity], years)
  const cfDates  = unionDates([sec.cashflow.op], years)
  
  const yr = d => d ? d.slice(0, 4) : '—'
  const qh = d => {
    try {
      const dt = new Date(d + 'T00:00:00Z')
      if (isNaN(dt.getTime())) return '—'
      return `${['Mar','Jun','Sep','Dec'][Math.floor(dt.getUTCMonth() / 3)]} '${String(dt.getUTCFullYear()).slice(2)}`
    } catch { return '—' }
  }

  // ── Annual P&L (oldest → newest, so recent is on the right) ──
  const annual = {
    headers: incDates.map(yr),
    sales:       incDates.map(d => toM(durVal(sec.income.revenue, d))),
    expenses:    incDates.map(d => {
      const rev = durVal(sec.income.revenue, d)
      const op  = durVal(sec.income.opInc, d)
      if (rev != null && op != null) return toM(rev - op)
      return toM(durVal(sec.income.opex, d))
    }),
    opProfit:    incDates.map(d => toM(durVal(sec.income.opInc, d))),
    opm:         incDates.map(d => {
      const rev = durVal(sec.income.revenue, d), op = durVal(sec.income.opInc, d)
      return rev && op ? Math.round((op / rev) * 100) : null
    }),
    otherIncome: incDates.map(d => {
      const v = durAny(sec.income.otherInc, d)
      if (v != null) return toM(v)
      const pbt = durAny(sec.income.pretax, d), op = durVal(sec.income.opInc, d), interest = Math.abs(durAny(sec.income.interest, d) || 0)
      return pbt != null && op != null ? toM(pbt - op + interest) : 0
    }),
    interest:    incDates.map(d => { const v = durAny(sec.income.interest, d); return v != null ? toM(Math.abs(v)) : 0 }),
    depreciation:incDates.map(d => { const v = durAny(sec.income.depr, d); return v != null ? toM(v) : 0 }),
    pbt:         incDates.map(d => {
      const pretax = durAny(sec.income.pretax, d)
      if (pretax != null) return toM(pretax)
      const net = durVal(sec.income.netInc, d), tax = durAny(sec.income.tax, d), op = durVal(sec.income.opInc, d)
      if (net != null && tax != null) return toM(net + tax)
      return op != null ? toM(op) : null
    }),
    tax:         incDates.map(d => {
      const pbt = durAny(sec.income.pretax, d), tax = durAny(sec.income.tax, d), net = durVal(sec.income.netInc, d)
      if (pbt && tax != null) return Math.round((tax / pbt) * 100)
      if (pbt && net != null) return Math.round(((pbt - net) / pbt) * 100)
      return null
    }),
    netProfit:   incDates.map(d => toM(durVal(sec.income.netInc, d))),
    eps:         incDates.map(d => {
      const eps = durVal(sec.income.epsDil, d) ?? durVal(sec.income.epsBasic, d)
      if (eps != null) return r2(eps)
      const net = durVal(sec.income.netInc, d), shares = instVal(sec.balance.shares, d)
      return net != null && shares ? r2(net / shares) : null
    }),
    dividendPayout: incDates.map(() => null),
  }

  // ── Quarterly P&L (oldest → newest) ──
  const qDates = unionDates([sec.quarterly.revenue, sec.quarterly.netInc, sec.quarterly.pretax, sec.quarterly.tax], 12)
  const quarterly = {
    headers: qDates.map(qh),
    sales:     qDates.map(d => toM(durVal(sec.quarterly.revenue, d))),
    expenses:  qDates.map(d => {
      const rev = durVal(sec.quarterly.revenue, d), op = durVal(sec.quarterly.opInc, d)
      return rev != null && op != null ? toM(rev - op) : null
    }),
    opProfit:  qDates.map(d => toM(durVal(sec.quarterly.opInc, d))),
    opm:       qDates.map(d => {
      const rev = durVal(sec.quarterly.revenue, d), op = durVal(sec.quarterly.opInc, d)
      return rev && op ? Math.round((op / rev) * 100) : null
    }),
    otherIncome: qDates.map(d => {
      const v = durAny(sec.quarterly.otherInc, d)
      if (v != null) return toM(v)
      const pbt = durAny(sec.quarterly.pretax, d), op = durVal(sec.quarterly.opInc, d), interest = Math.abs(durAny(sec.quarterly.interest, d) || 0)
      return pbt != null && op != null ? toM(pbt - op + interest) : 0
    }),
    interest:  qDates.map(d => { const v = durAny(sec.quarterly.interest, d); return v != null ? toM(Math.abs(v)) : 0 }),
    depreciation: qDates.map(d => { const v = durAny(sec.quarterly.depr, d); return v != null ? toM(v) : 0 }),
    pbt:       qDates.map(d => {
      const pretax = durAny(sec.quarterly.pretax, d)
      if (pretax != null) return toM(pretax)
      const net = durVal(sec.quarterly.netInc, d), tax = durAny(sec.quarterly.tax, d), op = durVal(sec.quarterly.opInc, d)
      if (net != null && tax != null) return toM(net + tax)
      return op != null ? toM(op) : null
    }),
    tax:       qDates.map(d => {
      const pretax = durAny(sec.quarterly.pretax, d)
      const tax = durAny(sec.quarterly.tax, d)
      const net = durVal(sec.quarterly.netInc, d)
      if (pretax && tax != null) return Math.round((tax / pretax) * 100)
      if (pretax && net != null) return Math.round(((pretax - net) / pretax) * 100)
      return null
    }),
    netProfit: qDates.map(d => toM(durVal(sec.quarterly.netInc, d))),
    eps:       qDates.map(d => {
      const eps = durVal(sec.quarterly.epsDil, d) ?? durVal(sec.quarterly.epsBasic, d)
      return eps != null ? r2(eps) : null
    }),
  }

  // ── Balance Sheet (oldest → newest) ──
  const balance = {
    headers: bsDates.map(yr),
    equity:          bsDates.map(d => {
      const combined = (instVal(sec.balance.commonStock, d) || 0) + (instVal(sec.balance.additionalPaidInCapital, d) || 0)
      const direct = instVal(sec.balance.equityCapital, d)
      const chosen = combined > 0 ? combined : direct
      const totalEquity = instVal(sec.balance.equity, d)
      if (chosen != null && chosen > 0) return toM(chosen)
      if (totalEquity != null && totalEquity > 0 && direct != null && direct > 0 && direct / totalEquity < 0.02) return null
      return toM(direct)
    }),
    reserves:        bsDates.map(d => toM(instVal(sec.balance.equity, d))),
    borrowings:      bsDates.map(d => {
      const lt = instVal(sec.balance.ltDebt, d) || 0, st = instVal(sec.balance.stDebt, d) || 0
      return (lt + st) ? toM(lt + st) : null
    }),
    otherLiabilities: bsDates.map(d => {
      const tot = instVal(sec.balance.liab, d), lt = instVal(sec.balance.ltDebt, d) || 0, st = instVal(sec.balance.stDebt, d) || 0
      return tot ? toM(Math.max(0, tot - lt - st)) : null
    }),
    totalLiabilities: bsDates.map(d => toM(instVal(sec.balance.liab, d))),
    fixedAssets:     bsDates.map(d => toM(instVal(sec.balance.ppe, d))),
    cwip:            bsDates.map(d => toM(instVal(sec.balance.cwip, d)) || 0),
    investments:     bsDates.map(d => {
      const lt = instVal(sec.balance.ltInvest, d) || 0, st = instVal(sec.balance.stInvest, d) || 0
      return (lt + st) ? toM(lt + st) : null
    }),
    otherAssets:     bsDates.map(d => toM(instVal(sec.balance.goodwill, d) || instVal(sec.balance.otherAssets, d) || instVal(sec.balance.intangible, d))),
    totalAssets:     bsDates.map(d => toM(instVal(sec.balance.assets, d))),
    currentAssets:   bsDates.map(d => toM(instVal(sec.balance.curAssets, d))),
    currentLiabilities: bsDates.map(d => toM(instVal(sec.balance.curLiab, d))),
    cash:            bsDates.map(d => toM(instVal(sec.balance.cash, d))),
    inventory:       bsDates.map(d => toM(instVal(sec.balance.inventory, d))),
    receivables:     bsDates.map(d => toM(instVal(sec.balance.receivables, d))),
  }

  // ── Cash Flow (oldest → newest) ──
  const cashflow = {
    headers: cfDates.map(yr),
    fromOperating: cfDates.map(d => toM(durVal(sec.cashflow.op, d))),
    fromInvesting: cfDates.map(d => toM(durVal(sec.cashflow.inv, d))),
    fromFinancing: cfDates.map(d => toM(durVal(sec.cashflow.fin, d))),
    netCashFlow:   cfDates.map(d => {
      const o = durVal(sec.cashflow.op, d), i = durVal(sec.cashflow.inv, d), f = durVal(sec.cashflow.fin, d)
      return (o != null || i != null || f != null) ? toM((o || 0) + (i || 0) + (f || 0)) : null
    }),
    freeCashFlow:  cfDates.map(d => {
      const op = durVal(sec.cashflow.op, d), cap = durVal(sec.cashflow.capex, d)
      return op != null ? toM(op - (cap || 0)) : null
    }),
  }

  // ── Growth rates (CAGR) ──
  const growth = buildGrowthFromAnnuals(annual, balance)

  return { annual, quarterly, balance, cashflow, growth, balanceSheetSource: 'sec_xbrl', balanceSheetYears: bsDates.length }
}

async function computeReturns(ticker) {
  const cagrFromReturn = (retPct, years) => {
    const r = n(retPct)
    return r != null && years > 0 && (1 + (r / 100)) > 0 ? r2((Math.pow(1 + (r / 100), 1 / years) - 1) * 100) : null
  }
  const attempts = [
    { range: '5y', interval: '1d' },
    { range: '5y', interval: '1wk' },
    { range: '10y', interval: '1wk' },
    { range: 'max', interval: '1mo' },
  ]
  for (const a of attempts) {
    try {
      const data = await yf(`/v8/finance/chart/${ticker}`, a)
      const result = data?.chart?.result?.[0]
      const ts = result?.timestamp || []
      const quote = result?.indicators?.adjclose?.[0]?.adjclose || result?.indicators?.quote?.[0]?.close || []
      const series = ts.map((t, i) => ({ t: t * 1000, c: n(quote[i]) })).filter(x => x.c != null).sort((x, y) => x.t - y.t)
      if (series.length < 2) continue
      const now = series[series.length - 1].c
      const findNear = days => {
        const target = series[series.length - 1].t - days * 24 * 60 * 60 * 1000
        let best = null
        for (const x of series) {
          if (x.t <= target) best = x
          else break
        }
        return best?.c ?? null
      }
      const compute = days => {
        const past = findNear(days)
        return past && now ? r2(((now - past) / past) * 100) : null
      }
      const out = {
        return3m: compute(90),
        return6m: compute(180),
        return1y: compute(365),
        return3y: compute(365 * 3),
        return5y: compute(365 * 5),
        return10y: compute(365 * 10),
      }
      out.stockCagr = {
        '10y': cagrFromReturn(out.return10y, 10),
        '5y': cagrFromReturn(out.return5y, 5),
        '3y': cagrFromReturn(out.return3y, 3),
        '1y': out.return1y,
      }
      const hasReturns = [out.return3m, out.return6m, out.return1y, out.return3y, out.return5y, out.return10y]
        .some(v => v != null)
      const hasStockCagr = Object.values(out.stockCagr || {}).some(v => v != null)
      if (hasReturns || hasStockCagr) return out
    } catch {}
  }
  return {}
}

async function backfillReturnRatios(env, ticker, existingRatios = null) {
  if (hasReturnCoverage(existingRatios || {})) return { ok: true, skipped: true, stored: 0 }
  const returns = await computeReturns(ticker)
  const { stockCagr, ...returnMetrics } = returns || {}
  const patch = {}
  for (const key of RETURN_RATIO_KEYS) {
    const value = n(returnMetrics?.[key])
    if (value != null && isFinite(value)) patch[key] = r2(value)
  }
  if (!Object.keys(patch).length) return { ok: false, skipped: true, stored: 0, stockCagr }
  await dbSaveStockSection(env, ticker, 'ratios', patch)
  return { ok: true, stored: Object.keys(patch).length, stockCagr }
}

// ──────────────────────────────────────────────────────────────────────────
// Calculate ratios from financials when Yahoo quoteSummary fails
// ──────────────────────────────────────────────────────────────────────────
function calcRatiosFromFinancials(fins, ov) {
  if (!fins?.annual || !fins?.balance) return {}
  try {
    const a = fins.annual, b = fins.balance
    const last = arr => arr && arr.length ? arr[arr.length - 1] : null  // newest is last (right side)
    const div = (x, y) => (x != null && y != null && y !== 0) ? r2(x / y) : null
    
    const sales   = last(a.sales)
    const opProf  = last(a.opProfit)
    const netProf = last(a.netProfit)
    const ta      = last(b.totalAssets)
    const tl      = last(b.totalLiabilities)
    const eq      = last(b.reserves)
    const ca      = last(b.currentAssets)
    const cl      = last(b.currentLiabilities)
    const cash    = last(b.cash) || 0
    const inv     = last(b.inventory) || 0
    const borrow  = (last(b.borrowings) || 0)
    const interest = Math.abs(last(a.interest) || 0) || null
    const p   = ov?.price
    const eps = last(a.eps)
    const mcM = ov?.mktCap ? ov.mktCap / 1e6 : null
    const ebitda = (opProf && last(a.depreciation)) ? opProf + last(a.depreciation) : opProf
    const ev = mcM && borrow != null && cash != null ? mcM + borrow - cash : null
    const divAny = (x, y) => (x != null && y != null && y !== 0) ? r2(x / y) : null
    
    return {
      pe: p && eps ? divAny(p, eps) : null,
      pb: mcM && eq && eq > 0 ? div(mcM, eq) : null,
      ps: mcM && sales ? div(mcM, sales) : null,
      evEbitda: ev && ebitda && ebitda > 0 ? r2(ev / ebitda) : null,
      evRevenue: ev && sales ? r2(ev / sales) : null,
      roe: eq && netProf != null ? r2((netProf / eq) * 100) : null,
      roa: ta && netProf ? r2((netProf / ta) * 100) : null,
      roce: ta && tl != null && opProf != null && (ta - tl) !== 0 ? r2((opProf / (ta - tl)) * 100) : null,
      opMargin: sales && opProf ? r2((opProf / sales) * 100) : null,
      netMargin: sales && netProf ? r2((netProf / sales) * 100) : null,
      grossMargin: (sales && a.expenses && last(a.expenses) != null) ? r2(((sales - last(a.expenses)) / sales) * 100) : null,
      debtToEquity: eq && borrow != null ? div(borrow, eq) : null,
      debtToAssets: ta && borrow != null ? div(borrow, ta) : null,
      currentRatio: ca && cl ? r2(ca / cl) : null,
      quickRatio:   ca != null && cl && inv != null ? r2((ca - inv) / cl) : null,
      cashRatio:    cash && cl ? r2(cash / cl) : null,
      earningsYield: p && eps != null ? r2((eps / p) * 100) : null,
      interestCoverage: interest && opProf != null ? r2(opProf / interest) : null,
    }
  } catch (e) {
    console.log('Ratio calc failed:', e.message)
    return {}
  }
}

function calcDerivedMetrics(fins, ov, rt = {}) {
  if (!fins) return {}
  const annual = fins.annual || {}, quarterly = fins.quarterly || {}, balance = fins.balance || {}, cashflow = fins.cashflow || {}, growth = fins.growth || {}
  const last = arr => Array.isArray(arr) ? arr[arr.length - 1] ?? null : null
  const prev = arr => Array.isArray(arr) && arr.length >= 2 ? arr[arr.length - 2] ?? null : null
  const safePct = (now, old) => now != null && old ? r2(((now - old) / Math.abs(old)) * 100) : null
  const cagrFrom = (arr, years) => {
    if (!Array.isArray(arr) || arr.length < years + 1) return null
    const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v))
    if (vals.length < years + 1) return null
    const start = vals[vals.length - years - 1], end = vals[vals.length - 1]
    return start > 0 && end > 0 ? r2((Math.pow(end / start, 1 / years) - 1) * 100) : null
  }
  const avg = (arr, count) => {
    if (!Array.isArray(arr)) return null
    const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v)).slice(-count)
    return vals.length ? r2(vals.reduce((a, b) => a + Number(b), 0) / vals.length) : null
  }
  const sales = last(annual.sales)
  const profit = last(annual.netProfit)
  const qSales = last(quarterly.sales)
  const qProfit = last(quarterly.netProfit)
  const debtM = last(balance.borrowings) || 0
  const cashM = last(balance.cash) || 0
  const fcfM = last(cashflow.freeCashFlow)
  const interestM = Math.abs(last(annual.interest) || 0) || null
  const marketCap = ov?.mktCap
  const marketCapM = marketCap ? marketCap / 1e6 : null
  const enterpriseValue = marketCap != null ? r2(marketCap + (debtM * 1e6) - (cashM * 1e6)) : null
  const pe = first(rt.pe, ov?.pe)
  const pegGrowth = first(
    growth.profitGrowth?.['3y'],
    cagrFrom(annual.netProfit, 3),
    rt.profitGrowth3y,
    safePct(profit, prev(annual.netProfit)),
  )
  const roeSeries = (annual.netProfit || []).map((np, i) => {
    const eq = balance.reserves?.[i]
    return eq && np != null ? r2((np / eq) * 100) : null
  })
  return {
    sales,
    profitAfterTax: profit,
    salesLatestQuarter: qSales,
    profitAfterTaxLatestQuarter: qProfit,
    yoyQuarterlySalesGrowth: safePct(qSales, lagVal(quarterly.sales, 4)),
    yoyQuarterlyProfitGrowth: safePct(qProfit, lagVal(quarterly.netProfit, 4)),
    salesGrowth: safePct(sales, prev(annual.sales)),
    profitGrowth: safePct(profit, prev(annual.netProfit)),
    salesGrowth3y: first(growth.salesGrowth?.['3y'], cagrFrom(annual.sales, 3)),
    salesGrowth5y: first(growth.salesGrowth?.['5y'], cagrFrom(annual.sales, 5)),
    profitGrowth3y: first(growth.profitGrowth?.['3y'], cagrFrom(annual.netProfit, 3)),
    profitGrowth5y: first(growth.profitGrowth?.['5y'], cagrFrom(annual.netProfit, 5)),
    avgRoe3y: avg(roeSeries, 3),
    avgRoe5y: avg(roeSeries, 5),
    debt: debtM,
    enterpriseValue,
    priceToFreeCashFlow: marketCapM != null && fcfM ? r2(marketCapM / fcfM) : null,
    fcfYield: marketCapM != null && fcfM != null ? r2((fcfM / marketCapM) * 100) : rt.fcfYield,
    interestCoverage: interestM && last(annual.opProfit) != null ? r2(last(annual.opProfit) / interestM) : null,
    peg: pe != null && pegGrowth != null && pegGrowth > 0 ? r2(pe / pegGrowth) : null,
  }
}

const FINANCIAL_SECTION_KEYS = {
  annual: ['sales', 'netProfit', 'opProfit', 'eps'],
  quarterly: ['sales', 'netProfit', 'opProfit', 'eps'],
  balance: ['totalAssets', 'totalLiabilities', 'reserves', 'borrowings', 'currentAssets', 'currentLiabilities', 'cash', 'inventory', 'receivables'],
  cashflow: ['fromOperating', 'fromInvesting', 'fromFinancing', 'freeCashFlow'],
}
function financialSectionScore(section, keys = []) {
  const headers = Array.isArray(section?.headers) ? section.headers.length : 0
  const usefulSeries = keys.reduce((count, key) => count + (hasUsefulSeries(section?.[key]) ? 1 : 0), 0)
  return (usefulSeries * 1000) + headers
}
function financialAnnualHeadersCount(fins) {
  return Math.max(
    Array.isArray(fins?.annual?.headers) ? fins.annual.headers.length : 0,
    Array.isArray(fins?.balance?.headers) ? fins.balance.headers.length : 0,
    Array.isArray(fins?.cashflow?.headers) ? fins.cashflow.headers.length : 0
  )
}
function pickBestFinancialCandidate(candidates = [], section, keys = []) {
  return candidates.reduce((best, candidate) => {
    const candidateScore = financialSectionScore(candidate?.[section], keys)
    if (!best) return candidateScore > 0 ? candidate : null
    const bestScore = financialSectionScore(best?.[section], keys)
    if (candidateScore > bestScore) return candidate
    if (candidateScore === bestScore && financialAnnualHeadersCount(candidate) > financialAnnualHeadersCount(best)) return candidate
    return best
  }, null)
}
function composeBestFinancials(candidates = []) {
  const usable = candidates.filter(candidate =>
    candidate && (hasUsefulFinancials(candidate) || hasUsefulQuarterlyFinancials(candidate) || hasCashflowCoverage(candidate))
  )
  if (!usable.length) return null
  const bestAnnual = pickBestFinancialCandidate(usable, 'annual', FINANCIAL_SECTION_KEYS.annual)
  const bestBalance = pickBestFinancialCandidate(usable, 'balance', FINANCIAL_SECTION_KEYS.balance)
  const bestCashflow = pickBestFinancialCandidate(usable, 'cashflow', FINANCIAL_SECTION_KEYS.cashflow)
  const bestQuarterly = pickBestFinancialCandidate(usable, 'quarterly', FINANCIAL_SECTION_KEYS.quarterly)
  const base = bestAnnual || bestBalance || bestCashflow || bestQuarterly || usable[0]
  const composed = {
    ...base,
    annual: bestAnnual?.annual || base?.annual,
    balance: bestBalance?.balance || base?.balance,
    cashflow: bestCashflow?.cashflow || base?.cashflow,
    quarterly: bestQuarterly?.quarterly || base?.quarterly,
  }
  const recomputedGrowth = buildGrowthFromAnnuals(composed.annual || {}, composed.balance || {})
  const stockCagr = usable.map(candidate => candidate?.growth?.stockCagr).find(series =>
    series && Object.values(series).some(value => value != null)
  )
  composed.growth = recomputedGrowth
  if (stockCagr) {
    composed.growth = composed.growth || {}
    composed.growth.stockCagr = mergeDefined(composed.growth.stockCagr || {}, stockCagr)
  }
  composed.balanceSheetSource = [bestAnnual?.balanceSheetSource, bestBalance?.balanceSheetSource, bestCashflow?.balanceSheetSource]
    .filter(Boolean)
    .join('+') || base?.balanceSheetSource || null
  composed.balanceSheetYears = Math.max(...usable.map(financialAnnualHeadersCount), 0)
  return composed
}

// ──────────────────────────────────────────────────────────────────────────
// Build complete stock data
// ──────────────────────────────────────────────────────────────────────────
async function buildStockData(ticker, env, opts = {}) {
  const totalStartedAt = Date.now()
  const variants = tickerVariants(ticker)
  const primaryTicker = variants[0] || ticker
  const deepTicker = variants.find(v => v.includes('-')) || primaryTicker
  const timings = opts.collectTimings === true ? {} : null
  const markTiming = (key, startedAt, extra = {}) => {
    if (!timings) return
    timings[key] = { ms: Date.now() - startedAt, ...extra }
  }
  const result = { ticker, updatedAt: new Date().toISOString() }
  const preferStoredOverview = opts.preferStoredOverview === true
  const preferStoredFinancials = opts.preferStoredFinancials === true
  const preferStoredRatios = opts.preferStoredRatios === true
  const bulkSafe = opts.bulkSafe === true
  const fmpPriority = !bulkSafe && opts.fmpPriority !== false && !!fmpKey(env)
  const fmpFastFinancials = opts.fmpFastFinancials === true
  const skipQuarterlyEnrichment = opts.skipQuarterlyEnrichment === true
  const lightweightRatios = opts.lightweightRatios === true
  const skipReturns = opts.skipReturns === true
  const skipSlowFinancialFallback = opts.skipSlowFinancialFallback === true
  const skipSecondaryFinancialSources = opts.skipSecondaryFinancialSources === true
  const skipSlowRatioSources = opts.skipSlowRatioSources === true
  const forceFinancialRefresh = opts.forceFinancialRefresh === true
  const stored = await dbGetStockData(env, ticker).catch(() => null)
  const storedOverview = preferStoredOverview ? (stored?.overview || null) : null
  const storedFinancials = stored?.financials || null
  const storedRatios = stored?.ratios || {}
  const storedFinancialsUseful = hasUsefulFinancials(storedFinancials)
  const storedQuarterlyUseful = hasStockPageQuarterlyCoverage(storedFinancials)
  const storedFinancialAnnualYears = financialAnnualHeadersCount(storedFinancials)
  const storedFinancialsPageReady = hasStockPageFinancialCoverage(storedFinancials)
  const ratioSeed = preferStoredRatios ? storedRatios : {}
  let overviewSummary = {}
  let overviewQuote = {}
  let overviewAlpha = {}

  // ── 1. Overview (price, company info) ──
  const overviewStartedAt = Date.now()
  const canReuseStoredOverview = !!(storedOverview && positiveOrNull(storedOverview.price) && positiveOrNull(storedOverview.mktCap))
  if (canReuseStoredOverview) {
    result.overview = {
      ...storedOverview,
      ticker,
      lastUpdated: storedOverview.lastUpdated || stored?.updatedAt || result.updatedAt,
    }
    markTiming('overview', overviewStartedAt, { source: 'stored' })
  } else {
    if (fmpPriority) {
      try {
        const fmpOv = await fmpOverview(deepTicker, env)
        if (fmpOv && positiveOrNull(fmpOv.price) && positiveOrNull(fmpOv.mktCap)) {
          result.overview = fmpOv
          markTiming('overview', overviewStartedAt, { source: 'fmp' })
        }
      } catch (e) {
        markTiming('overview', overviewStartedAt, { source: 'fmp_error', error: e.message })
      }
    }
  }
  if (!result.overview) try {
    const [chartRes, sumRes, quoteRes, fmpQuoteRes, fmpProfileRes, avOverviewRes, polygonDetailsRes, polygonPriceRes, finnhubQuoteRes, avQuoteRes] = await Promise.allSettled([
      yf(`/v8/finance/chart/${primaryTicker}`, { interval: '1d', range: '5d' }),
      yfS(primaryTicker, ['summaryProfile', 'defaultKeyStatistics', 'financialData', 'summaryDetail', 'price']),
      yfQuote(primaryTicker),
      bulkSafe ? Promise.resolve(null) : fmpQuote(deepTicker, env),
      bulkSafe ? Promise.resolve(null) : fmpProfile(deepTicker, env),
      bulkSafe ? Promise.resolve(null) : avOverview(primaryTicker, env),
      bulkSafe ? Promise.resolve(null) : polygonDetails(primaryTicker, env),
      bulkSafe ? Promise.resolve(null) : polygonPrevClose(primaryTicker, env),
      bulkSafe ? Promise.resolve(null) : finnhubQuote(primaryTicker, env),
      bulkSafe ? Promise.resolve(null) : avQuote(primaryTicker, env),
    ])
    overviewSummary = sumRes.status === 'fulfilled' ? (sumRes.value || {}) : {}
    overviewQuote = quoteRes.status === 'fulfilled' ? (quoteRes.value || {}) : {}
    overviewAlpha = avOverviewRes.status === 'fulfilled' ? (avOverviewRes.value || {}) : {}
    const meta = chartRes.status === 'fulfilled' ? (chartRes.value?.chart?.result?.[0]?.meta || {}) : {}
    const sum  = overviewSummary
    const q    = overviewQuote
    const fq   = fmpQuoteRes.status === 'fulfilled' ? (fmpQuoteRes.value || {}) : {}
    const fp   = fmpProfileRes.status === 'fulfilled' ? (fmpProfileRes.value || {}) : {}
    const av   = overviewAlpha
    const pg   = polygonDetailsRes.status === 'fulfilled' ? (polygonDetailsRes.value || {}) : {}
    const pp   = polygonPriceRes.status === 'fulfilled' ? (polygonPriceRes.value || {}) : {}
    const fhq  = finnhubQuoteRes.status === 'fulfilled' ? (finnhubQuoteRes.value || {}) : {}
    const avq  = avQuoteRes.status === 'fulfilled' ? (avQuoteRes.value || {}) : {}
    const p = sum.price || {}, k = sum.defaultKeyStatistics || {}
    const f = sum.financialData || {}, d = sum.summaryDetail || {}, pr = sum.summaryProfile || {}
    const price = r2(first(fq.price, fp.price, raw(p.regularMarketPrice), meta.regularMarketPrice, q.regularMarketPrice, pp.price, fhq.price, avq.price))
    const prev  = r2(first(fq.prev, raw(p.regularMarketPreviousClose), meta.chartPreviousClose, q.regularMarketPreviousClose, pp.prev, fhq.prev, avq.prev))
    const sharesOutstanding = first(raw(k.sharesOutstanding), raw(p.sharesOutstanding), n(q.sharesOutstanding), n(meta.sharesOutstanding))
    const derivedMarketCap = marketCapFromPriceAndShares(price, sharesOutstanding)
    result.overview = {
      ticker,
      name: fp.companyName || p.longName || p.shortName || meta.longName || q.longName || q.shortName || av.name || pg.name || ticker,
      exchange: fp.exchangeShortName || fp.exchange || p.fullExchangeName || meta.exchangeName || q.fullExchangeName || q.exchange || av.exchange || pg.primary_exchange || '—',
      sector: fp.sector || pr.sector || av.sector || '—',
      industry: fp.industry || pr.industry || av.industry || pg.sic_description || '—',
      website: fp.website || pr.website || pg.homepage_url || null,
      description: fp.description || pr.longBusinessSummary || av.description || pg.description || '—',
      price,
      change: price && prev ? r2(price - prev) : null,
      changePct: first(price && prev ? r2(((price - prev) / prev) * 100) : null, fhq.changePct, avq.changePct),
      open: r2(first(fq.open, raw(p.regularMarketOpen), meta.regularMarketOpen, q.regularMarketOpen, pp.open, fhq.open, avq.open)),
      high: r2(first(fq.high, raw(p.regularMarketDayHigh), meta.regularMarketDayHigh, q.regularMarketDayHigh, pp.high, fhq.high, avq.high)),
      low:  r2(first(fq.low, raw(p.regularMarketDayLow), meta.regularMarketDayLow, q.regularMarketDayLow, pp.low, fhq.low, avq.low)),
      high52: r2(first(raw(d.fiftyTwoWeekHigh), meta.fiftyTwoWeekHigh, q.fiftyTwoWeekHigh, fp.range ? n(String(fp.range).split('-')[1]) : null)),
      low52:  r2(first(raw(d.fiftyTwoWeekLow), meta.fiftyTwoWeekLow, q.fiftyTwoWeekLow, fp.range ? n(String(fp.range).split('-')[0]) : null)),
      volume: first(fq.volume, raw(p.regularMarketVolume), meta.regularMarketVolume, q.regularMarketVolume, pp.volume, avq.volume, fp.volAvg),
      avgVolume: first(raw(d.averageVolume), q.averageDailyVolume3Month, fp.volAvg),
      mktCap: first(fq.marketCap, fp.mktCap, fp.marketCap, raw(p.marketCap), raw(d.marketCap), q.marketCap, av.mktCap, pg.market_cap, derivedMarketCap),
      marketCap: first(fq.marketCap, fp.mktCap, fp.marketCap, raw(p.marketCap), raw(d.marketCap), q.marketCap, av.mktCap, pg.market_cap, derivedMarketCap),
      sharesOutstanding: positiveOrNull(sharesOutstanding),
      pe: r2(first(fq.pe, fp.pe, raw(d.trailingPE), raw(k.forwardPE), q.trailingPE, q.forwardPE, av.pe)),
      eps: r2(first(fq.eps, fp.eps, raw(k.trailingEps), q.epsTrailingTwelveMonths, av.eps)),
      bookValue: r2(first(raw(k.bookValue), q.bookValue, av.bookValue)),
      pb: r2(first(raw(k.priceToBook), q.priceToBook, av.pb)),
      ps: r2(first(raw(d.priceToSalesTrailing12Months), q.priceToSalesTrailing12Months, av.ps)),
      roe: first(pctAny(first(raw(f.returnOnEquity))), av.roe),
      roa: first(pctAny(first(raw(f.returnOnAssets))), av.roa),
      grossMargin: first(pctAny(first(raw(f.grossMargins))), av.grossMargin),
      opMargin: first(pctAny(first(raw(f.operatingMargins))), av.opMargin),
      netMargin: first(pctAny(first(raw(f.profitMargins))), av.netMargin),
      debtToEquity: f.debtToEquity?.raw != null ? r2(f.debtToEquity.raw / 100) : null,
      currentRatio: r2(first(raw(f.currentRatio))),
      quickRatio: r2(first(raw(f.quickRatio))),
      dividendYield: first(cleanYield(first(raw(d.dividendYield), raw(d.trailingAnnualDividendYield), q.trailingAnnualDividendYield, fp.lastDiv && price ? fp.lastDiv / price : null)), av.dividendYield),
      lastUpdated: new Date().toISOString(),
      keyPoints: [
        pr.sector ? `Sector: ${pr.sector}${pr.industry ? ' — ' + pr.industry : ''}` : null,
        pr.fullTimeEmployees ? `Employees: ${Number(pr.fullTimeEmployees).toLocaleString()}` : null,
        pr.country ? `HQ: ${pr.city ? pr.city + ', ' : ''}${pr.country}` : null,
        raw(k.sharesOutstanding) ? `Shares Outstanding: ${(raw(k.sharesOutstanding) / 1e9).toFixed(2)}B` : null,
      ].filter(Boolean),
    }
    markTiming('overview', overviewStartedAt, { source: 'live' })
  } catch (e) {
    markTiming('overview', overviewStartedAt, { source: 'error', error: e.message })
    console.log(`Overview failed ${ticker}:`, e.message)
  }

  // ── 2. Financials from FMP first, then multi-source fallback/merge ──
  const financialsStartedAt = Date.now()
  try {
    const shouldBackfillQuarterlies = !storedQuarterlyUseful
    const includeQuarterlyFinancials = !skipQuarterlyEnrichment || shouldBackfillQuarterlies
    const canReuseStoredFinancialsBeforeFetch = preferStoredFinancials && !forceFinancialRefresh && storedFinancialsPageReady
    const canQuarterlyBackfillStoredFinancials = preferStoredFinancials && !forceFinancialRefresh && storedFinancialsUseful && shouldBackfillQuarterlies
    const canUseStoredFinancialsForRatioOnly = preferStoredFinancials && !forceFinancialRefresh && storedFinancialsUseful && !shouldBackfillQuarterlies
    const fmpFinancials = bulkSafe || canReuseStoredFinancialsBeforeFetch || canUseStoredFinancialsForRatioOnly
      ? null
      : (canQuarterlyBackfillStoredFinancials
        ? await fmpQuarterlyFinancials(deepTicker, env).catch(() => null)
        : await fmpAnnualFinancials(deepTicker, env, 10, {
          includeQuarterly: includeQuarterlyFinancials,
        }).catch(() => null))
    const fmpFinancialsUseful = hasUsefulFinancials(fmpFinancials)
    const fmpQuarterlyUseful = hasStockPageQuarterlyCoverage(fmpFinancials)
    const fmpFinancialAnnualYears = financialAnnualHeadersCount(fmpFinancials)
    const storedFinancialsRichEnough = storedFinancialsUseful && storedFinancialAnnualYears >= 3
    const storedFinancialsCompleteEnough = storedFinancialsRichEnough && (!includeQuarterlyFinancials || storedQuarterlyUseful)
    const canReuseStoredFinancials = storedFinancialsCompleteEnough
      && (
        (preferStoredFinancials && !forceFinancialRefresh)
        || (fmpFinancialsUseful && fmpFinancialAnnualYears <= storedFinancialAnnualYears)
      )
    const fmpOrStoredFinancialsUseful = fmpFinancialsUseful || storedFinancialsUseful
    const fmpOrStoredQuarterlyUseful = fmpQuarterlyUseful || storedQuarterlyUseful
    const fmpOrStoredAnnualYears = Math.max(fmpFinancialAnnualYears, storedFinancialAnnualYears)
    const needsSupplementalFinancials = !fmpOrStoredFinancialsUseful
      || fmpOrStoredAnnualYears < 3
      || (includeQuarterlyFinancials && !fmpOrStoredQuarterlyUseful)
    const shouldTrySecondaryFinancialSources = !skipSecondaryFinancialSources && !canReuseStoredFinancials && needsSupplementalFinancials
    const shouldTrySecFallback = !skipSlowFinancialFallback && !canReuseStoredFinancials && needsSupplementalFinancials
    let polygonFins = null
    let avFins = null
    let secFins = null
    let secCompanyName = null
    if (shouldTrySecondaryFinancialSources || shouldTrySecFallback) {
      const [polygonRes, avRes, secRes] = await Promise.allSettled([
        shouldTrySecondaryFinancialSources ? polygonFinancials(primaryTicker, env, 10) : Promise.resolve(null),
        shouldTrySecondaryFinancialSources ? avFinancials(primaryTicker, env) : Promise.resolve(null),
        shouldTrySecFallback
          ? secGetAllStatements(primaryTicker).then(sec => ({ financials: buildFinancialsFromSEC(sec, 10), companyName: sec.companyName }))
          : Promise.resolve(null),
      ])
      polygonFins = polygonRes.status === 'fulfilled' ? polygonRes.value : null
      avFins = avRes.status === 'fulfilled' ? avRes.value : null
      const secPayload = secRes.status === 'fulfilled' ? secRes.value : null
      secFins = secPayload?.financials || null
      secCompanyName = secPayload?.companyName || null
      if (result.overview && secCompanyName && result.overview.name === ticker) result.overview.name = secCompanyName
    }
    const financialCandidates = [
      fmpFinancials,
      polygonFins,
      avFins,
      secFins,
      storedFinancials && hasUsefulFinancials(storedFinancials) ? storedFinancials : null,
    ]
    result.financials = composeBestFinancials(financialCandidates)
      || (storedFinancialsUseful ? storedFinancials : null)
      || fmpFinancials
      || polygonFins
      || avFins
      || secFins
      || null
    markTiming('financials', financialsStartedAt, {
      source: (shouldTrySecondaryFinancialSources || shouldTrySecFallback)
        ? (hasUsefulFinancials(result.financials)
          ? (
            shouldTrySecondaryFinancialSources
              ? (shouldTrySecFallback ? 'sec_plus_secondary' : 'secondary_only')
              : 'sec_only'
          )
          : 'fallback_unavailable')
        : (canReuseStoredFinancialsBeforeFetch
          ? 'stored_complete'
          : (canQuarterlyBackfillStoredFinancials && fmpQuarterlyUseful
            ? 'stored_plus_fmp_quarterly'
            : (canUseStoredFinancialsForRatioOnly ? 'stored_ratio_only' : (hasUsefulFinancials(result.financials) ? 'fmp' : 'unavailable')))),
      annualYears: financialAnnualHeadersCount(result.financials),
      forceRefresh: forceFinancialRefresh,
    })
  } catch (e) {
    markTiming('financials', financialsStartedAt, { source: 'error', error: e.message })
    console.log(`Financials failed ${ticker}:`, e.message)
    result.financials = storedFinancials && hasUsefulFinancials(storedFinancials) ? storedFinancials : null
  }

  // ── 3. Ratios ──
  const ratiosStartedAt = Date.now()
  const canReuseStoredRatios = lightweightRatios && hasCoreScreenerRatios(storedRatios)
  if (canReuseStoredRatios) {
    result.ratios = { ...storedRatios }
    markTiming('ratios', ratiosStartedAt, { source: 'stored_lightweight' })
  } else if (lightweightRatios) {
    result.ratios = { ...storedRatios }
    markTiming('ratios', ratiosStartedAt, { source: 'deferred_lightweight' })
  } else try {
    const needSecondaryRatios = !lightweightRatios && !skipSlowRatioSources
    const [yRes, fRes, qRes, kmRes, pgRes, fhRes, avRes, fgRes] = await Promise.allSettled([
      skipSlowRatioSources
        ? Promise.resolve({})
        : (Object.keys(overviewSummary).length ? Promise.resolve(overviewSummary) : yfS(primaryTicker, ['defaultKeyStatistics', 'financialData', 'summaryDetail'])),
      bulkSafe ? Promise.resolve(null) : fmpRatios(deepTicker, env),
      skipSlowRatioSources
        ? Promise.resolve({})
        : (Object.keys(overviewQuote).length ? Promise.resolve(overviewQuote) : yfQuote(primaryTicker)),
      bulkSafe ? Promise.resolve(null) : fmpKeyMetrics(deepTicker, env),
      skipSlowRatioSources ? Promise.resolve(null) : polygonRatios(primaryTicker, env),
      skipSlowRatioSources ? Promise.resolve(null) : finnhubMetrics(primaryTicker, env),
      skipSlowRatioSources ? Promise.resolve({}) : (Object.keys(overviewAlpha).length ? Promise.resolve(overviewAlpha) : avOverview(primaryTicker, env)),
      bulkSafe ? Promise.resolve(null) : fmpGrowth(deepTicker, env),
    ])
    const s = yRes.status === 'fulfilled' ? (yRes.value || {}) : {}
    const fmp = fRes.status === 'fulfilled' ? fRes.value : null
    const q = qRes.status === 'fulfilled' ? (qRes.value || {}) : {}
    const km = kmRes.status === 'fulfilled' ? (kmRes.value || {}) : {}
    const pg = pgRes.status === 'fulfilled' ? (pgRes.value || {}) : {}
    const fh = fhRes.status === 'fulfilled' ? (fhRes.value || {}) : {}
    const av = avRes.status === 'fulfilled' ? (avRes.value || {}) : {}
    const fg = fgRes.status === 'fulfilled' ? (fgRes.value || {}) : {}
    const ov = result.overview || {}
    const ratios = buildRatioSnapshot({ summary: s, fmp, quote: q, km, av, fh, pg, fg, overview: ov })
    result.ratios = mergeDefined(ratioSeed, ratios)
    if (result.ratios.pe == null && ov.price && ov.eps != null && ov.eps !== 0) result.ratios.pe = r2(ov.price / ov.eps)
    if (result.ratios.earningsYield == null && ov.price && ov.eps != null) result.ratios.earningsYield = r2((ov.eps / ov.price) * 100)
    markTiming('ratios', ratiosStartedAt, {
      source: lightweightRatios
        ? 'primary_lightweight'
        : (bulkSafe ? 'multi_source_bulk_safe' : (skipSlowRatioSources ? 'fmp_fast' : (needSecondaryRatios ? 'multi_source' : 'primary')))
    })
  } catch (e) {
    markTiming('ratios', ratiosStartedAt, { source: 'error', error: e.message })
    console.log(`Ratios failed ${ticker}:`, e.message)
    result.ratios = storedRatios || {}
  }

  // ── 4. Compute historical price returns from chart ──
  const returnsStartedAt = Date.now()
  const needReturnRefresh = !skipReturns && !hasReturnCoverage(result.ratios)
  if (needReturnRefresh) try {
    const returns = await computeReturns(ticker)
    const { stockCagr, ...returnMetrics } = returns || {}
    if (result.ratios) Object.assign(result.ratios, returnMetrics)
    if (stockCagr && result.financials) {
      result.financials.growth = result.financials.growth || {}
      result.financials.growth.stockCagr = mergeDefined(result.financials.growth.stockCagr || {}, stockCagr)
    }
    markTiming('returns', returnsStartedAt, { source: 'live' })
  } catch (e) {
    markTiming('returns', returnsStartedAt, { source: 'error', error: e.message })
  } else {
    markTiming('returns', returnsStartedAt, { source: 'stored' })
  }

  // ── 5. SMART FALLBACK: Backfill nulls from calculated ratios ──
  if (result.financials && result.overview) {
    const calc = calcRatiosFromFinancials(result.financials, result.overview)
    const derived = calcDerivedMetrics(result.financials, result.overview, result.ratios)
    const ov = result.overview, rt = result.ratios || (result.ratios = {})
    const last = arr => arr && arr.length ? arr[arr.length - 1] : null
    const finEps = last(result.financials.annual?.eps)
    if (ov.eps == null && finEps != null) ov.eps = finEps
    if (ov.pe == null && ov.price && ov.eps != null && ov.eps !== 0) ov.pe = r2(ov.price / ov.eps)
    if (rt.pe == null && ov.pe != null) rt.pe = ov.pe
    if (rt.earningsYield == null && ov.price && ov.eps != null) rt.earningsYield = r2((ov.eps / ov.price) * 100)
    
    const bad = v => v == null || !isFinite(Number(v)) || Number(v) === 0
    for (const key of ['pe','pb','ps','roe','roa','opMargin','netMargin','grossMargin','debtToEquity','currentRatio']) {
      if (bad(ov[key]) && calc[key] != null) ov[key] = calc[key]
    }
    for (const key of ['pe','pb','ps','peg','roe','roa','roce','opMargin','netMargin','grossMargin','debtToEquity','debtToAssets','currentRatio','quickRatio','cashRatio','evEbitda','evRevenue','earningsYield','interestCoverage']) {
      if (bad(rt[key]) && calc[key] != null) rt[key] = calc[key]
    }
    for (const [key, value] of Object.entries(derived)) {
      if (rt[key] == null && value != null) rt[key] = value
    }
  }

  if (timings) {
    timings.totalMs = Date.now() - totalStartedAt
    result.timings = timings
    if (timings.totalMs >= SLOW_BUILD_LOG_MS) {
      console.log(`Slow build ${ticker}: ${timings.totalMs}ms`, JSON.stringify(timings))
    }
  }
  return result
}

// ──────────────────────────────────────────────────────────────────────────
// Worker entry point
// ──────────────────────────────────────────────────────────────────────────
export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(req, env) })
    try {
      const res = await route(req, env, ctx)
      const h = new Headers(res.headers)
      Object.entries(corsHeaders(req, env)).forEach(([k, v]) => h.set(k, v))
      return new Response(res.body, { status: res.status, headers: h })
    } catch (e) { return j({ error: e.message }, 500, corsHeaders(req, env)) }
  },
  async scheduled(event, env, ctx) {
    const job = runScheduledMaintenance(env)
    if (ctx?.waitUntil) ctx.waitUntil(job)
    else await job
  }
}

async function route(req, env, ctx) {
  const url = new URL(req.url), path = url.pathname

  if (path.startsWith('/admin/')) {
    const denied = requireAdmin(req, env)
    if (denied) return denied
  }
  const adminAsyncRefresh = ['1', 'true', 'yes'].includes(String(url.searchParams.get('async') || '').toLowerCase())
  const runAdminRefresh = async (label, jobFactory) => {
    if (adminAsyncRefresh && ctx?.waitUntil) {
      const job = Promise.resolve().then(jobFactory)
      ctx.waitUntil(job.catch(e => console.log(`${label} async failed:`, e?.message || e)))
      return j({ ok: true, accepted: true, async: true, job: label, version: DATA_VERSION })
    }
    return j(await jobFactory())
  }

  
  if (path === '/auth/google' && req.method === 'POST') return handleGoogleAuth(req, env)
  if (path === '/auth/me')                               return handleMe(req, env)
  if (path === '/auth/logout' && req.method === 'POST')  return handleLogout(req, env)
  
  if (path === '/user/watchlist') {
    if (req.method === 'GET')    return getUserWatchlist(req, env)
    if (req.method === 'POST')   return addToWatchlist(req, env)
    if (req.method === 'DELETE') return removeFromWatchlist(req, env)
  }
  if (path === '/user/screens') {
    if (req.method === 'GET')    return getSavedScreens(req, env)
    if (req.method === 'POST')   return saveScreen(req, env)
    if (req.method === 'DELETE') return deleteScreen(req, env)
  }
  if (path === '/user/preferences') {
    if (req.method === 'GET')    return getUserPreferences(req, env)
    if (req.method === 'POST')   return saveUserPreferences(req, env)
  }
  
  const m = path.match(/^\/stock\/([A-Za-z0-9.^-]+)\/([a-z]+)$/)
  if (m) {
    const ticker = m[1].toUpperCase()
    switch (m[2]) {
      case 'overview':      return j(await getOverview(ticker, env))
      case 'financials': {
        const financials = await getFinancials(ticker, env, { allowLive: true })
        if ((!hasCashflowCoverage(financials) || !hasStockPageFinancialCoverage(financials)) && ctx?.waitUntil) {
          ctx.waitUntil(getOrBuildStockData(ticker, env, true, { waitForCompletion: true }).catch(() => null))
        }
        return j(financials)
      }
      case 'ratios': {
        const ratios = await getRatios(ticker, env, { allowLive: true })
        if (!hasStockPageRatioCoverage(ratios) && ctx?.waitUntil) {
          ctx.waitUntil(getOrBuildStockData(ticker, env, true, { waitForCompletion: true }).catch(() => null))
        }
        return j(ratios)
      }
      case 'chart':         return j(await getChart(ticker, env, url.searchParams.get('period') || '1Y', { allowLive: true }))
      case 'peers':         return j(await getPeers(ticker, env))
      case 'news':          return j(await getNews(ticker, env, { allowLive: true }))
      case 'shareholders':  return j(await getShareholders(ticker, env, { allowLive: true }))
      default:              return j({ error: 'Unknown endpoint' }, 404)
    }
  }
  
  if (path === '/screener' && req.method === 'POST') {
    const b = await req.json()
    return j(await runScreener(b.filters || {}, b.page || 1, b.limit || 25, b.sort, env))
  }
  if (path === '/screener/custom' && req.method === 'POST') {
    const b = await req.json()
    return j(await runCustomScreener(b.conditions || [], b.page || 1, b.limit || 25, b.sort, env))
  }
  
  if (path === '/market/trending') return j(await getTrending(env))
  if (path === '/market/indices')  return j(await getIndices())
  if (path === '/search')          return j(await searchStocks(url.searchParams.get('q') || '', env))

  // ── Blog API ──────────────────────────────────────────────────────────────
  if (path === '/api/blog' && req.method === 'GET')  return handleBlogList(req, env)
  if (path === '/api/blog' && req.method === 'POST') return handleBlogCreate(req, env)
  const blogSlugMatch = path.match(/^\/api\/blog\/([a-z0-9-]+)$/)
  if (blogSlugMatch && req.method === 'GET') return handleBlogGet(req, env, blogSlugMatch[1])
  
  const adminRichRefresh = ['1', 'true', 'yes'].includes(String(url.searchParams.get('rich') || '').toLowerCase())
  const adminFastRefreshOpts = {
    bulkSafe: false,
    fmpPriority: true,
    skipSlowFinancialFallback: true,
    skipSecondaryFinancialSources: true,
    skipSlowRatioSources: true,
    lightweightRatios: false
  }
  const adminRefreshOpts = adminRichRefresh
    ? { ...adminFastRefreshOpts, skipSlowFinancialFallback: false, skipSecondaryFinancialSources: false, skipSlowRatioSources: false }
    : adminFastRefreshOpts
  if (path === '/admin/update-symbols') return j(await refreshSymbolUniverse(env))
  if (path === '/admin/refresh-quotes') return runAdminRefresh('refresh-quotes', () => refreshQuotes(env, Number(url.searchParams.get('limit') || 50)))
  if (path === '/admin/refresh-stale') return runAdminRefresh('refresh-stale', () => refreshStaleStocks(env, adminLimit(url, 'limit', 100), true, adminRefreshOpts))
  if (path === '/admin/refresh-top') return runAdminRefresh('refresh-top', () => refreshTopStocks(env, adminLimit(url, 'limit', 100), adminRefreshOpts))
  if (path === '/admin/refresh-deep') return runAdminRefresh('refresh-deep', () => refreshStaleStocks(env, adminLimit(url, 'limit', 100), false, adminRefreshOpts))
  if (path === '/admin/clear-scheduled-lock') return j(await clearScheduledLock(env, url.searchParams.get('reason') || 'manual_clear', {
    force: ['1', 'true', 'yes'].includes(String(url.searchParams.get('force') || '').toLowerCase())
  }))
  if (path === '/admin/refresh-ticker') return j(await refreshOneTicker(env, url.searchParams.get('ticker')))
  if (path === '/admin/init-db') return j(await initDB(env))
  if (path === '/admin/refresh-debug') return j(await getRefreshDebug(env))
  if (path === '/admin/fmp-debug') return j(await debugFmpDeepTicker(env, url.searchParams.get('ticker') || 'AAPL'))
  if (path === '/admin/users-report') return j(await getUsersReport(env, adminLimit(url, 'limit', 100)))
  if (path === '/admin/status')  return j(await getStatus(env))
  if (path === '/health')        return j({ status: 'ok', version: DATA_VERSION })
  return j({ error: 'Not found' }, 404)
}

// ──────────────────────────────────────────────────────────────────────────
// Blog API handlers
// ──────────────────────────────────────────────────────────────────────────

async function handleBlogList(req, env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, slug, title, description, cluster, published_at
       FROM blog_posts ORDER BY published_at DESC LIMIT 50`
    ).all()
    return j({ posts: results || [] })
  } catch (e) {
    return j({ error: 'DB error', detail: e.message }, 500)
  }
}

async function handleBlogGet(req, env, slug) {
  try {
    const row = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ?`
    ).bind(slug).first()
    if (!row) return j({ error: 'Not found' }, 404)
    return j({ post: row })
  } catch (e) {
    return j({ error: 'DB error', detail: e.message }, 500)
  }
}

async function handleBlogCreate(req, env) {
  const token = getBearerToken(req)
  const secret = env.BLOG_API_SECRET || 'anirban123'
  if (token !== secret) return j({ error: 'Unauthorized' }, 401)

  let body
  try { body = await req.json() } catch { return j({ error: 'Invalid JSON' }, 400) }

  const { title, slug, description, content, cluster, faqs, published_at } = body || {}
  if (!title || !slug || !description || !content || !published_at) {
    return j({ error: 'Missing required fields: title, slug, description, content, published_at' }, 400)
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return j({ error: 'Slug must be lowercase letters, numbers and hyphens only' }, 400)
  }

  try {
    await env.DB.prepare(
      `INSERT INTO blog_posts (slug, title, description, content, cluster, faqs, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      slug, title, description, content,
      cluster || 'Screening Guides',
      JSON.stringify(faqs || []),
      published_at
    ).run()
    return j({ success: true, slug })
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return j({ error: 'Slug already exists', slug }, 409)
    return j({ error: 'DB error', detail: e.message }, 500)
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────────────────────
async function handleGoogleAuth(req, env) {
  try {
    const { credential } = await req.json().catch(() => ({}))
    if (!credential) return j({ error: 'No credential' }, 400)
    const user = await verifyGoogleIdToken(credential, env)
    if (!user?.id) return j({ error: 'Invalid token payload' }, 401)
    if (!user.verified) return j({ error: 'Email not verified' }, 401)
    await ensureDB(env)
    if (!env.SP_DB) return j({ error: 'Login unavailable' }, 503)
    await upsertUser(user, env)
    const token = await createSession(user.id, env)
    if (!token) return j({ error: 'Login unavailable' }, 503)
    return j({ ok: true, user }, 200, { 'Set-Cookie': buildSessionCookie(token, req) })
  } catch (e) {
    const msg = String(e?.message || '')
    if (msg.startsWith('Google token verification failed:') || msg === 'Invalid client' || msg === 'Token expired' || msg === 'Invalid token payload') {
      return j({ error: msg }, 401)
    }
    console.log('Login failed:', msg)
    return j({ error: 'Login unavailable' }, 503)
  }
}
async function handleMe(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  return j({ user })
}

async function getUsersReport(env, limit = 100) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound', version: DATA_VERSION }
  const lim = Math.min(Math.max(Number(limit) || 50, 1), 500)
  const [totals, recentUsers] = await Promise.all([
    dbFirst(env, `SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM sessions WHERE datetime(expires_at) > datetime('now')) AS active_sessions,
        (SELECT COUNT(*) FROM saved_screens) AS saved_screens,
        (SELECT COUNT(*) FROM watchlists) AS watchlist_items`).catch(() => null),
    dbAll(env, `SELECT
        u.id,
        u.email,
        u.name,
        u.picture,
        u.created_at,
        MAX(s.created_at) AS last_login_at,
        MAX(CASE WHEN datetime(s.expires_at) > datetime('now') THEN 1 ELSE 0 END) AS logged_in,
        COUNT(DISTINCT ss.id) AS saved_screens,
        COUNT(DISTINCT w.ticker) AS watchlist_items
      FROM users u
      LEFT JOIN sessions s ON s.user_id = u.id
      LEFT JOIN saved_screens ss ON ss.user_id = u.id
      LEFT JOIN watchlists w ON w.user_id = u.id
      GROUP BY u.id, u.email, u.name, u.picture, u.created_at
      ORDER BY COALESCE(MAX(s.created_at), u.created_at) DESC
      LIMIT ?`, [lim]).catch(() => []),
  ])
  return {
    ok: true,
    version: DATA_VERSION,
    totals: {
      users: totals?.users || 0,
      activeSessions: totals?.active_sessions || 0,
      savedScreens: totals?.saved_screens || 0,
      watchlistItems: totals?.watchlist_items || 0,
    },
    users: recentUsers.map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      picture: row.picture,
      signedUpAt: row.created_at,
      lastLoginAt: row.last_login_at || null,
      loggedIn: !!row.logged_in,
      savedScreens: Number(row.saved_screens || 0),
      watchlistItems: Number(row.watchlist_items || 0),
    })),
    limit: lim,
  }
}
const textOrNull = v => {
  const s = String(v ?? '').trim()
  return !s || s === '—' ? null : s
}
const numberOrNull = v => {
  const x = n(v)
  return x != null && isFinite(x) ? x : null
}
async function handleLogout(req, env) {
  const token = getSessionToken(req)
  if (!token || !env.SP_DB) return j({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(req) })
  await ensureDB(env)
  await dbRun(env, 'DELETE FROM sessions WHERE token=?', [token]).catch(() => null)
  return j({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(req) })
}
async function getAuthUser(req, env) {
  const token = getSessionToken(req)
  if (!token) return null
  const sessionUser = await getSessionUser(token, env).catch(() => null)
  if (sessionUser) return sessionUser
  const googleUser = await verifyGoogleIdToken(token, env).catch(() => null)
  if (!googleUser?.verified) return null
  await upsertUser(googleUser, env).catch(() => null)
  return googleUser
}
async function normalizeWatchlistRow(env, item = {}, existingRow = null) {
  const ticker = cleanTicker(item?.ticker || existingRow?.ticker)
  if (!ticker) return null
  const stock = await dbGetStockData(env, ticker).catch(() => null)
  const overview = stock?.overview || {}
  return {
    ticker,
    name: textOrNull(item?.name) || textOrNull(existingRow?.name) || textOrNull(overview.name) || ticker,
    price: positiveOrNull(item?.price) ?? positiveOrNull(existingRow?.price) ?? positiveOrNull(overview.price),
    exchange: textOrNull(item?.exchange) || textOrNull(existingRow?.exchange) || textOrNull(overview.exchange),
    change: numberOrNull(item?.change) ?? numberOrNull(existingRow?.change) ?? numberOrNull(overview.change),
    changePct: numberOrNull(item?.changePct) ?? numberOrNull(existingRow?.change_pct ?? existingRow?.changePct) ?? numberOrNull(overview.changePct),
  }
}
async function getUserWatchlist(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  if (!env.SP_DB) return j({ watchlist: [] })
  const rows = await dbAll(env, 'SELECT * FROM watchlists WHERE user_id=? ORDER BY COALESCE(updated_at, added_at) DESC, added_at DESC', [user.id])
    .catch(() => dbAll(env, 'SELECT * FROM watchlists WHERE user_id=? ORDER BY added_at DESC', [user.id]))
  const watchlist = await Promise.all(rows.map(async row => {
    const item = await normalizeWatchlistRow(env, row, row).catch(() => null)
    return {
      ...row,
      ticker: item?.ticker || row.ticker,
      name: item?.name || row.name || row.ticker,
      price: item?.price ?? row.price ?? null,
      exchange: item?.exchange ?? row.exchange ?? null,
      change: item?.change ?? row.change ?? null,
      change_pct: item?.changePct ?? row.change_pct ?? null,
    }
  }))
  return j({ watchlist })
}
async function addToWatchlist(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  const payload = await req.json().catch(() => ({}))
  const item = await normalizeWatchlistRow(env, payload)
  if (!item?.ticker) return j({ error: 'ticker required' }, 400)
  if (env.SP_DB) await dbRun(env, `INSERT INTO watchlists (user_id,ticker,name,price,exchange,"change",change_pct,updated_at) VALUES (?,?,?,?,?,?,?,datetime('now'))
    ON CONFLICT(user_id, ticker) DO UPDATE SET
      name=COALESCE(excluded.name, watchlists.name),
      price=COALESCE(excluded.price, watchlists.price),
      exchange=COALESCE(excluded.exchange, watchlists.exchange),
      "change"=COALESCE(excluded."change", watchlists."change"),
      change_pct=COALESCE(excluded.change_pct, watchlists.change_pct),
      updated_at=datetime('now')`, [user.id, item.ticker, item.name, item.price ?? null, item.exchange ?? null, item.change ?? null, item.changePct ?? null])
  return j({ ok: true })
}
async function removeFromWatchlist(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  const { ticker } = await req.json().catch(() => ({}))
  const clean = cleanTicker(ticker)
  if (env.SP_DB) await dbRun(env, 'DELETE FROM watchlists WHERE user_id=? AND ticker=?', [user.id, clean])
  return j({ ok: true })
}
async function getSavedScreens(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  if (!env.SP_DB) return j({ screens: [] })
  const screens = await dbAll(env, 'SELECT * FROM saved_screens WHERE user_id=? ORDER BY COALESCE(updated_at, created_at) DESC, created_at DESC', [user.id])
    .catch(() => dbAll(env, 'SELECT * FROM saved_screens WHERE user_id=? ORDER BY created_at DESC', [user.id]))
  return j({ screens })
}
async function saveScreen(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  const body = await req.json().catch(() => ({}))
  const name = String(body?.name || '').trim().slice(0, 120)
  const query = String(body?.query || '').trim()
  if (!name || !query) return j({ error: 'name and query required' }, 400)
  if (env.SP_DB) {
    const existing = await dbGet(env, 'SELECT id FROM saved_screens WHERE user_id=? AND name=? AND query=? LIMIT 1', [user.id, name, query]).catch(() => null)
    if (existing?.id) {
      await dbRun(env, 'UPDATE saved_screens SET updated_at=datetime(\'now\') WHERE id=? AND user_id=?', [existing.id, user.id])
        .catch(() => null)
      return j({ ok: true, id: existing.id, deduped: true })
    }
    await dbRun(env, 'INSERT INTO saved_screens (user_id,name,query,updated_at) VALUES (?,?,?,datetime(\'now\'))', [user.id, name, query])
      .catch(() => dbRun(env, 'INSERT INTO saved_screens (user_id,name,query) VALUES (?,?,?)', [user.id, name, query]))
  }
  return j({ ok: true })
}
async function deleteScreen(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  const { id } = await req.json().catch(() => ({}))
  if (env.SP_DB) await dbRun(env, 'DELETE FROM saved_screens WHERE id=? AND user_id=?', [id, user.id])
  return j({ ok: true })
}
async function getUserPreferences(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  if (!env.SP_DB) return j({ preferences: {} })
  const row = await dbGet(env, 'SELECT screener_columns, screener_query, screener_columns_open, updated_at FROM user_preferences WHERE user_id=?', [user.id]).catch(() => null)
  return j({ preferences: row ? { screenerColumns: parseJson(row.screener_columns) || null, screenerQuery: row.screener_query || null, screenerColumnsOpen: row.screener_columns_open === 1, updatedAt: row.updated_at || null } : {} })
}
async function saveUserPreferences(req, env) {
  const user = await getAuthUser(req, env); if (!user) return j({ error: 'Unauthorized' }, 401)
  await ensureUserDataSchema(env)
  const { screenerColumns, screenerQuery, screenerColumnsOpen } = await req.json().catch(() => ({}))
  if (!env.SP_DB) return j({ ok: true })
  const existing = await dbGet(env, 'SELECT screener_columns, screener_query, screener_columns_open FROM user_preferences WHERE user_id=?', [user.id]).catch(() => null)
  const columnsJson = screenerColumns !== undefined ? JSON.stringify(Array.isArray(screenerColumns) ? screenerColumns : null) : (existing?.screener_columns ?? null)
  const queryText = screenerQuery !== undefined ? (screenerQuery || null) : (existing?.screener_query ?? null)
  const openFlag = screenerColumnsOpen !== undefined ? (screenerColumnsOpen ? 1 : 0) : (existing?.screener_columns_open ?? 0)
  await dbRun(env, `INSERT INTO user_preferences (user_id, screener_columns, screener_query, screener_columns_open, updated_at)
    VALUES (?,?,?,?,datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      screener_columns=excluded.screener_columns,
      screener_query=excluded.screener_query,
      screener_columns_open=excluded.screener_columns_open,
      updated_at=datetime('now')`, [user.id, columnsJson, queryText, openFlag])
  return j({ ok: true })
}

// ──────────────────────────────────────────────────────────────────────────
// D1 stock data store
// ──────────────────────────────────────────────────────────────────────────
const positiveOrNull = v => {
  const x = n(v)
  return x != null && x > 0 ? x : null
}
const marketCapFromPriceAndShares = (price, shares) => {
  const p = positiveOrNull(price)
  const s = positiveOrNull(shares)
  return p != null && s != null ? p * s : null
}
const nonNegativeOrNull = v => {
  const x = n(v)
  return x != null && x >= 0 ? x : null
}
const finiteOrNull = v => {
  const x = n(v)
  return x != null && isFinite(x) && x !== 0 ? x : null
}
const finiteNumberOrNull = v => {
  const x = n(v)
  return x != null && isFinite(x) ? x : null
}
const meaningfulDebtToEquity = v => {
  const x = n(v)
  return x != null && isFinite(x) ? x : null
}
function screenerFields(ticker, data = {}) {
  const ov = data.overview || {}
  const rt = data.ratios || {}
  return {
    ticker,
    name: ov.name || ticker,
    exchange: ov.exchange || null,
    sector: ov.sector || null,
    industry: ov.industry || null,
    price: positiveOrNull(ov.price),
    change_pct: n(ov.changePct),
    mkt_cap: positiveOrNull(ov.mktCap),
    pe: finiteOrNull(rt.pe ?? ov.pe),
    pb: finiteOrNull(rt.pb ?? ov.pb),
    ps: finiteOrNull(rt.ps ?? ov.ps),
    roe: finiteNumberOrNull(rt.roe ?? ov.roe),
    roa: finiteNumberOrNull(rt.roa ?? ov.roa),
    roce: finiteNumberOrNull(rt.roce),
    net_margin: finiteNumberOrNull(rt.netMargin ?? ov.netMargin),
    debt_to_equity: meaningfulDebtToEquity(rt.debtToEquity ?? ov.debtToEquity),
    dividend_yield: nonNegativeOrNull(rt.dividendYield ?? ov.dividendYield),
  }
}

function latestNumber(arr) {
  if (!Array.isArray(arr)) return null
  for (let i = arr.length - 1; i >= 0; i--) {
    const x = n(arr[i])
    if (x != null && isFinite(x)) return x
  }
  return null
}

function hasUsefulSeries(arr) {
  return Array.isArray(arr) && arr.some(v => v != null && !isNaN(v) && isFinite(v))
}
function usefulSeriesCount(arr) {
  return Array.isArray(arr) ? arr.filter(v => v != null && !isNaN(v) && isFinite(v)).length : 0
}

function hydrateOverviewFromRow(row, overview = {}, ratios = null, financials = null) {
  const ov = { ...(overview || {}) }
  const rt = ratios || {}
  const setNum = (key, value, positive = false) => {
    const x = n(value)
    if (x == null || !isFinite(x)) return
    const cur = n(ov[key])
    if (positive) {
      if (x > 0 && (cur == null || cur <= 0)) ov[key] = x
      return
    }
    if (ov[key] == null || cur == null || !isFinite(cur)) ov[key] = x
  }

  ov.ticker = ov.ticker || row?.ticker
  ov.name = ov.name || row?.name || row?.ticker
  ov.exchange = ov.exchange || row?.exchange || '—'
  ov.sector = ov.sector || row?.sector || '—'
  ov.industry = ov.industry || row?.industry || '—'

  setNum('price', row?.price, true)
  setNum('currentPrice', row?.price, true)
  setNum('changePct', row?.change_pct)
  setNum('mktCap', row?.mkt_cap, true)
  setNum('marketCap', row?.mkt_cap, true)
  setNum('sharesOutstanding', ov?.sharesOutstanding)
  setNum('pe', row?.pe ?? rt.pe)
  setNum('pb', row?.pb ?? rt.pb)
  setNum('ps', row?.ps ?? rt.ps)
  setNum('roe', row?.roe ?? rt.roe)
  setNum('roa', row?.roa ?? rt.roa)
  setNum('roce', row?.roce ?? rt.roce)
  setNum('netMargin', row?.net_margin ?? rt.netMargin)
  setNum('debtToEquity', row?.debt_to_equity ?? rt.debtToEquity)
  setNum('dividendYield', row?.dividend_yield ?? rt.dividendYield)
  setNum('opMargin', rt.opMargin)
  setNum('grossMargin', rt.grossMargin)
  setNum('currentRatio', rt.currentRatio)
  setNum('interestCoverage', rt.interestCoverage)

  setNum('eps', latestNumber(financials?.annual?.eps))
  const derivedMarketCap = marketCapFromPriceAndShares(ov.price ?? ov.currentPrice, ov.sharesOutstanding)
  setNum('mktCap', derivedMarketCap, true)
  setNum('marketCap', derivedMarketCap, true)
  if (ov.eps == null && ov.price != null && ov.pe) ov.eps = r2(n(ov.price) / n(ov.pe))
  if (ov.epsTtm == null && ov.eps != null) ov.epsTtm = ov.eps

  ov.lastUpdated = ov.lastUpdated || row?.quote_updated_at || row?.updated_at
  return ov
}

function stockDataFromRow(row) {
  if (!row) return null
  const directOverview = parseJson(row.overview)
  const directFinancials = parseJson(row.financials)
  const directRatios = parseJson(row.ratios)
  const directChart = parseJson(row.chart)
  const directShareholders = parseJson(row.shareholders)
  const directEarnings = parseJson(row.earnings)
  const directAnnouncements = parseJson(row.announcements)
  const directNews = parseJson(row.news)
  const needsAll = !directOverview || !directFinancials || !directRatios || !directChart || !directShareholders || !directEarnings || !directAnnouncements || !directNews
  const all = needsAll ? parseJson(row.all_data) : null
  const financials = directFinancials || all?.financials
  const ratios = directRatios || all?.ratios
  const overview = hydrateOverviewFromRow(row, directOverview || all?.overview, ratios, financials)
  if (all) {
    return {
      ...all,
      overview,
      financials,
      ratios,
      chart: directChart || all.chart,
      shareholders: directShareholders || all.shareholders,
      earnings: directEarnings || all.earnings,
      announcements: directAnnouncements || all.announcements,
      news: directNews || all.news,
      updatedAt: row.updated_at || all.updatedAt,
    }
  }
  return {
    ticker: row.ticker,
    overview,
    financials,
    ratios,
    chart: directChart,
    shareholders: directShareholders,
    earnings: directEarnings,
    announcements: directAnnouncements,
    news: directNews,
    updatedAt: row.updated_at,
  }
}

function hasUsefulValues(obj, keys) {
  if (!obj) return false
  return keys.some(k => obj[k] != null && !isNaN(obj[k]) && isFinite(obj[k]))
}
function hasUsefulRatios(rt) {
  return hasUsefulValues(rt, ['pe','pb','ps','peg','evEbitda','evRevenue','earningsYield','dividendYield','fcfYield','grossMargin','opMargin','netMargin','roe','roa','roce','currentRatio','quickRatio','cashRatio','debtToEquity','debtToAssets','interestCoverage','salesGrowth3y','salesGrowth5y','profitGrowth3y','profitGrowth5y','avgRoe3y','avgRoe5y','enterpriseValue','priceToFreeCashFlow'])
}
function hasUsefulFinancials(fins) {
  const hasAnnual = hasUsefulSeries(fins?.annual?.sales) || hasUsefulSeries(fins?.annual?.netProfit) || hasUsefulSeries(fins?.annual?.opProfit) || hasUsefulSeries(fins?.annual?.eps)
  const hasBalance = hasUsefulSeries(fins?.balance?.totalAssets)
    || hasUsefulSeries(fins?.balance?.totalLiabilities)
    || hasUsefulSeries(fins?.balance?.reserves)
    || hasUsefulSeries(fins?.balance?.borrowings)
    || hasUsefulSeries(fins?.balance?.currentAssets)
    || hasUsefulSeries(fins?.balance?.currentLiabilities)
    || hasUsefulSeries(fins?.balance?.cash)
    || hasUsefulSeries(fins?.balance?.inventory)
    || hasUsefulSeries(fins?.balance?.receivables)
  return !!(hasAnnual || hasBalance)
}
function hasCashflowCoverage(fins) {
  const cf = fins?.cashflow || {}
  return hasUsefulSeries(cf.fromOperating) && hasUsefulSeries(cf.fromInvesting) && hasUsefulSeries(cf.fromFinancing)
}
function hasUsefulQuarterlyFinancials(fins) {
  const quarterlyHeaders = fins?.quarterly?.headers?.length || 0
  const hasQuarterly = hasUsefulSeries(fins?.quarterly?.sales) || hasUsefulSeries(fins?.quarterly?.netProfit) || hasUsefulSeries(fins?.quarterly?.opProfit) || hasUsefulSeries(fins?.quarterly?.eps)
  return !!(quarterlyHeaders && hasQuarterly)
}
function hasStockPageQuarterlyCoverage(fins) {
  const quarterlyHeaders = fins?.quarterly?.headers?.length || 0
  const maxUsefulQuarters = Math.max(
    usefulSeriesCount(fins?.quarterly?.sales),
    usefulSeriesCount(fins?.quarterly?.netProfit),
    usefulSeriesCount(fins?.quarterly?.opProfit),
    usefulSeriesCount(fins?.quarterly?.eps)
  )
  return quarterlyHeaders >= 5 && maxUsefulQuarters >= 5
}
function hasStockPageFinancialCoverage(fins) {
  return hasUsefulFinancials(fins) && hasStockPageQuarterlyCoverage(fins)
}
function currentFinancialFailureCount(row) {
  const count = n(row?.financials_failed_count)
  return count != null && isFinite(count) && count > 0 ? Math.floor(count) : 0
}
function isFinancialAgeStale(row, days = FUNDAMENTAL_STALE_DAYS) {
  const ts = row?.financials_attempted_at || row?.financials_updated_at
  if (!ts) return false
  const ms = Date.parse(ts)
  return Number.isFinite(ms) && Date.now() - ms >= Math.max(1, Number(days) || FUNDAMENTAL_STALE_DAYS) * 86400_000
}
function buildFinancialPersistenceState(row, mergedFinancials, updatedAt) {
  if (hasUsefulFinancials(mergedFinancials)) {
    return {
      financialsUseful: true,
      financialsUpdatedAt: updatedAt,
      financialsAttemptedAt: updatedAt,
      financialsFailedAt: null,
      financialsFailedCount: 0,
    }
  }
  return {
    financialsUseful: false,
    financialsUpdatedAt: row?.financials_updated_at || null,
    financialsAttemptedAt: updatedAt,
    financialsFailedAt: updatedAt,
    financialsFailedCount: currentFinancialFailureCount(row) + 1,
  }
}
async function dbGetStockRow(env, ticker) {
  if (!(await ensureDB(env))) return null
  return dbFirst(env, `SELECT * FROM stock_data WHERE ticker=?`, [ticker])
}

async function dbGetStockData(env, ticker) {
  try {
    const row = await dbGetStockRow(env, ticker)
    return stockDataFromRow(row)
  } catch (e) {
    console.log(`D1 read failed ${ticker}:`, e.message)
    return null
  }
}

async function dbGetStockSection(env, ticker, section) {
  const col = STOCK_JSON_COLUMNS[section]
  if (!col) return null
  try {
    const row = await dbGetStockRow(env, ticker)
    if (!row) return null
    if (section === 'all') return stockDataFromRow(row)
    const direct = parseJson(row[col])
    if (section === 'overview') {
      const directRatios = parseJson(row.ratios)
      const directFinancials = parseJson(row.financials)
      const all = (!direct || !directRatios || !directFinancials) ? parseJson(row.all_data) : null
      const ratios = directRatios || all?.ratios
      const financials = directFinancials || all?.financials
      return hydrateOverviewFromRow(row, direct || all?.overview, ratios, financials)
    }
    if (section === 'ratios' && !hasUsefulRatios(direct)) return null
    if (section === 'financials' && !hasUsefulFinancials(direct)) return null
    if (direct) return direct
    const all = parseJson(row.all_data)
    const fromAll = all?.[section] || null
    if (section === 'ratios' && !hasUsefulRatios(fromAll)) return null
    if (section === 'financials' && !hasUsefulFinancials(fromAll)) return null
    return fromAll
  } catch (e) {
    console.log(`D1 ${section} read failed ${ticker}:`, e.message)
    return null
  }
}

function prepareSaveStockDataStatement(env, row, ticker, data) {
  const directOverview = parseJson(row?.overview)
  const directFinancials = parseJson(row?.financials)
  const directRatios = parseJson(row?.ratios)
  const all = (!directOverview || !directFinancials || !directRatios) ? (parseJson(row?.all_data) || {}) : {}
  const existingOverview = directOverview || all.overview || {}
  const existingFinancials = directFinancials || all.financials || {}
  const existingRatios = directRatios || all.ratios || {}
  const mergedFinancials = mergeDefined(existingFinancials, data.financials)
  const mergedRatios = mergeDefined(existingRatios, data.ratios)
  const mergedOverviewBase = mergeDefined(existingOverview, data.overview)
  const updatedAt = data.updatedAt || new Date().toISOString()
  const overview = hydrateOverviewFromRow(row, mergedOverviewBase, mergedRatios, mergedFinancials)
  const f = screenerFields(ticker, { overview, financials: mergedFinancials, ratios: mergedRatios })
  const financialState = buildFinancialPersistenceState(row, mergedFinancials, updatedAt)
  return env.SP_DB.prepare(`INSERT INTO stock_data (
      ticker, overview, financials, ratios,
      name, exchange, sector, industry, price, change_pct, mkt_cap,
      pe, pb, ps, roe, roa, roce, net_margin, debt_to_equity, dividend_yield, quote_updated_at, financials_updated_at, financials_attempted_at, financials_failed_at, financials_failed_count, updated_at, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(ticker) DO UPDATE SET
      all_data=NULL,
      overview=COALESCE(excluded.overview, stock_data.overview),
      financials=COALESCE(excluded.financials, stock_data.financials),
      ratios=COALESCE(excluded.ratios, stock_data.ratios),
      name=COALESCE(excluded.name, stock_data.name),
      exchange=COALESCE(excluded.exchange, stock_data.exchange),
      sector=COALESCE(excluded.sector, stock_data.sector),
      industry=COALESCE(excluded.industry, stock_data.industry),
      price=COALESCE(excluded.price, stock_data.price),
      change_pct=COALESCE(excluded.change_pct, stock_data.change_pct),
      mkt_cap=COALESCE(excluded.mkt_cap, stock_data.mkt_cap),
      pe=COALESCE(excluded.pe, stock_data.pe),
      pb=COALESCE(excluded.pb, stock_data.pb),
      ps=COALESCE(excluded.ps, stock_data.ps),
      roe=COALESCE(excluded.roe, stock_data.roe),
      roa=COALESCE(excluded.roa, stock_data.roa),
      roce=COALESCE(excluded.roce, stock_data.roce),
      net_margin=COALESCE(excluded.net_margin, stock_data.net_margin),
      debt_to_equity=COALESCE(excluded.debt_to_equity, stock_data.debt_to_equity),
      dividend_yield=COALESCE(excluded.dividend_yield, stock_data.dividend_yield),
      quote_updated_at=COALESCE(excluded.quote_updated_at, stock_data.quote_updated_at),
      financials_updated_at=COALESCE(excluded.financials_updated_at, stock_data.financials_updated_at),
      financials_attempted_at=COALESCE(excluded.financials_attempted_at, stock_data.financials_attempted_at),
      financials_failed_at=CASE
        WHEN COALESCE(excluded.financials_failed_count, 0) = 0 THEN NULL
        ELSE COALESCE(excluded.financials_failed_at, stock_data.financials_failed_at)
      END,
      financials_failed_count=COALESCE(excluded.financials_failed_count, stock_data.financials_failed_count, 0),
      updated_at=excluded.updated_at`).bind(
    ticker, toJson(overview), toJson(mergedFinancials), toJson(mergedRatios),
    f.name, f.exchange, f.sector, f.industry, f.price, f.change_pct, f.mkt_cap,
    f.pe, f.pb, f.ps, f.roe, f.roa, f.roce, f.net_margin, f.debt_to_equity, f.dividend_yield,
    updatedAt,
    financialState.financialsUpdatedAt,
    financialState.financialsAttemptedAt,
    financialState.financialsFailedAt,
    financialState.financialsFailedCount,
    updatedAt,
    updatedAt
  )
}

async function dbSaveStockData(env, ticker, data, existingRow = undefined) {
  if (!data?.overview || !(await ensureDB(env))) return false
  const row = existingRow === undefined ? await dbGetStockRow(env, ticker).catch(() => null) : existingRow
  const stmt = prepareSaveStockDataStatement(env, row, ticker, data)
  await stmt.run()
  return true
}

const CORE_RATIO_KEYS = ['pe','pb','ps','roe','roa','roce','netMargin','debtToEquity']
const GROWTH_RATIO_KEYS = ['salesGrowth3y','profitGrowth3y']
const RETURN_RATIO_KEYS = ['return3m','return6m','return1y','return3y','return5y']
const STOCK_PAGE_RATIO_KEYS = ['peg','evEbitda','evRevenue','earningsYield','fcfYield','grossMargin','opMargin','currentRatio','quickRatio','cashRatio','debtToAssets','interestCoverage','priceToFreeCashFlow','salesGrowth','profitGrowth','salesGrowth3y','profitGrowth3y','yoyQuarterlySalesGrowth','yoyQuarterlyProfitGrowth']
function countUsefulValues(obj, keys) {
  if (!obj) return 0
  return keys.reduce((count, key) => count + ((obj[key] != null && !isNaN(obj[key]) && isFinite(obj[key])) ? 1 : 0), 0)
}
function hasCoreScreenerRatios(rt) {
  return countUsefulValues(rt, CORE_RATIO_KEYS) >= 4
}
function hasGrowthRatioCoverage(rt) {
  return countUsefulValues(rt, GROWTH_RATIO_KEYS) >= GROWTH_RATIO_KEYS.length
}
function hasMeaningfulRatioValue(obj, key) {
  const x = n(obj?.[key])
  return x != null && isFinite(x) && x !== 0
}
function hasTargetedRatioCoverage(rt) {
  return ['peg', 'interestCoverage'].some(key => hasMeaningfulRatioValue(rt, key))
}
function hasReturnCoverage(rt) {
  return RETURN_RATIO_KEYS.every(key => {
    const x = n(rt?.[key])
    return x != null && isFinite(x)
  })
}
function hasStockPageRatioCoverage(rt) {
  return hasCoreScreenerRatios(rt) && countUsefulValues(rt, STOCK_PAGE_RATIO_KEYS) >= 4
}
function buildRatioSnapshot({ summary = {}, fmp = null, quote = {}, km = {}, av = {}, fh = {}, pg = {}, fg = {}, overview = {} } = {}) {
  const k2 = summary.defaultKeyStatistics || {}
  const f2 = summary.financialData || {}
  const d2 = summary.summaryDetail || {}
  const ov = overview || {}
  const peBase = first(fmp?.pe, raw(d2.trailingPE), raw(k2.forwardPE), quote.trailingPE, quote.forwardPE, ov.pe, km.peRatioTTM, av.pe, fh.pe, pg.pe)
  const growthBase = first(
    fg.netIncomeGrowth,
    fg.epsgrowth,
    fg.epsGrowth,
    fg.epsGrowth3y,
    fg.revenueGrowth,
    fh.profitGrowth3y,
    av.profitGrowth3y,
    pct(raw(f2.earningsGrowth))
  )
  return {
    pe: r2(peBase),
    pb: r2(first(fmp?.pb, raw(k2.priceToBook), quote.priceToBook, ov.pb, km.pbRatioTTM, av.pb, fh.pb, pg.pb)),
    ps: r2(first(fmp?.ps, raw(d2.priceToSalesTrailing12Months), quote.priceToSalesTrailing12Months, ov.ps, km.priceToSalesRatioTTM, av.ps, fh.ps, pg.ps)),
    peg: first(fmp?.peg, r2(raw(k2.pegRatio)), r2(km.pegRatioTTM), av.peg, fh.peg, (peBase != null && growthBase != null && growthBase > 0) ? r2(peBase / growthBase) : null),
    evEbitda: first(fmp?.evEbitda, r2(raw(k2.enterpriseToEbitda)), r2(km.enterpriseValueOverEBITDATTM), av.evEbitda, pg.evEbitda),
    evRevenue: r2(first(raw(k2.enterpriseToRevenue), km.evToSalesTTM, av.evRevenue, pg.evRevenue)),
    earningsYield: first(pg.earningsYield, first(raw(d2.trailingPE), quote.trailingPE, ov.pe, km.peRatioTTM, av.pe, fh.pe) ? r2(100 / first(raw(d2.trailingPE), quote.trailingPE, ov.pe, km.peRatioTTM, av.pe, fh.pe)) : null),
    dividendYield: first(fmp?.dividendYield, cleanYield(ov.dividendYield), av.dividendYield, fh.dividendYield),
    fcfYield: first(fmp?.fcfYield, km.freeCashFlowYieldTTM != null ? km.freeCashFlowYieldTTM * 100 : null, pg.fcfYield),
    grossMargin: first(fmp?.grossMargin, pct(raw(f2.grossMargins)), ov.grossMargin, av.grossMargin, fh.grossMargin),
    opMargin: first(fmp?.opMargin, pct(raw(f2.operatingMargins)), ov.opMargin, av.opMargin, fh.opMargin, pg.opMargin),
    netMargin: first(fmp?.netMargin, pct(raw(f2.profitMargins)), ov.netMargin, av.netMargin, fh.netMargin, pg.netMargin),
    roe: first(fmp?.roe, pctAny(raw(f2.returnOnEquity)), ov.roe, av.roe, fh.roe, pg.roe),
    roa: first(fmp?.roa, pctAny(raw(f2.returnOnAssets)), ov.roa, av.roa, fh.roa, pg.roa),
    roce: first(fmp?.roce, km.roicTTM != null ? km.roicTTM * 100 : null, fh.roce, pg.roce),
    currentRatio: r2(first(fmp?.currentRatio, raw(f2.currentRatio), ov.currentRatio, km.currentRatioTTM, fh.currentRatio, pg.currentRatio)),
    quickRatio: r2(first(fmp?.quickRatio, raw(f2.quickRatio), ov.quickRatio, fh.quickRatio, pg.quickRatio)),
    cashRatio: first(fmp?.cashRatio, km.cashRatioTTM, pg.cashRatio),
    debtToEquity: first(
      fmp?.debtToEquity,
      r2(km.debtToEquityTTM),
      r2(km.debtToEquity),
      r2(km.totalDebtToEquityTTM),
      r2(km.totalDebtToEquity),
      f2.debtToEquity?.raw != null ? r2(f2.debtToEquity.raw / 100) : null,
      ov.debtToEquity,
      fh.debtToEquity,
      pg.debtToEquity
    ),
    debtToAssets: first(fmp?.debtToAssets, km.debtToAssetsTTM, pg.debtToAssets),
    interestCoverage: first(fmp?.interestCov, pg.interestCoverage, r2(raw(f2.interestCoverage)), r2(km.interestCoverageTTM), r2(km.interestCoverageRatioTTM), fh.interestCoverage),
    assetTurnover: first(fmp?.assetTurnover, fh.assetTurnover, pg.assetTurnover),
    inventoryTurnover: first(fmp?.invTurnover, fh.inventoryTurnover),
    receivablesTurnover: first(fmp?.recTurnover, fh.receivablesTurnover),
    salesGrowth3y: first(pct(raw(f2.revenueGrowth)), av.salesGrowth3y, fh.salesGrowth3y, pctAny(fg.revenueGrowth)),
    profitGrowth3y: first(pct(raw(f2.earningsGrowth)), av.profitGrowth3y, fh.profitGrowth3y, pctAny(fg.netIncomeGrowth)),
    return3m: null, return6m: null, return1y: null, return3y: null, return5y: null,
  }
}

async function buildQuoteData(ticker, env, opts = {}) {
  const now = new Date().toISOString()
  const bulkSafe = opts.bulkSafe === true
  const quoteOnly = opts.quoteOnly === true
  const fmpPriority = !bulkSafe && fmpPaidPriorityEnabled(env)
  let fmpSeed = {}
  let yahooSeed = {}
  const finish = ({ price = null, prev = null, marketCap = null, sharesOutstanding = null, name = null, exchange = null, sector = null, industry = null, website = null, description = null, open = null, high = null, low = null, volume = null, avgVolume = null, pe = null, pb = null, ps = null, roe = null, roa = null, roce = null, netMargin = null, debtToEquity = null, eps = null, dividendYield = null, changePct = null, source = null } = {}) => {
    const ratios = Object.fromEntries(Object.entries({
      pe: r2(pe),
      pb: r2(pb),
      ps: r2(ps),
      roe: r2(roe),
      roa: r2(roa),
      roce: r2(roce),
      netMargin: r2(netMargin),
      debtToEquity: r2(debtToEquity),
      dividendYield,
    }).filter(([, value]) => value != null))
    return {
      ticker,
      updatedAt: now,
      source,
      overview: {
        ticker,
        name: name || ticker,
        exchange,
        sector,
        industry,
        website,
        description,
        price: positiveOrNull(price),
        change: price && prev ? r2(price - prev) : null,
        changePct: first(changePct, price && prev ? r2(((price - prev) / prev) * 100) : null),
        open: r2(open),
        high: r2(high),
        low: r2(low),
        volume,
        avgVolume,
        mktCap: positiveOrNull(marketCap),
        marketCap: positiveOrNull(marketCap),
        sharesOutstanding: positiveOrNull(sharesOutstanding),
        pe: r2(pe),
        pb: r2(pb),
        ps: r2(ps),
        roe: r2(roe),
        roa: r2(roa),
        roce: r2(roce),
        netMargin: r2(netMargin),
        debtToEquity: r2(debtToEquity),
        eps: r2(eps),
        dividendYield,
        lastUpdated: now,
      },
      ratios,
    }
  }
  const useful = data => positiveOrNull(data?.overview?.price) && positiveOrNull(data?.overview?.mktCap)
  if (fmpPriority) {
    const [fmpQuoteRes, fmpProfileRes, fmpRatiosRes] = await Promise.allSettled([
      fmpQuote(ticker, env),
      quoteOnly ? Promise.resolve(null) : fmpProfile(ticker, env),
      quoteOnly ? Promise.resolve(null) : fmpRatios(ticker, env),
    ])
    const fq = fmpQuoteRes.status === 'fulfilled' ? (fmpQuoteRes.value || {}) : {}
    const fp = fmpProfileRes.status === 'fulfilled' ? (fmpProfileRes.value || {}) : {}
    const fr = fmpRatiosRes.status === 'fulfilled' ? (fmpRatiosRes.value || {}) : {}
    const price = positiveOrNull(fq.price ?? fp.price)
    const prev = positiveOrNull(fq.prev)
    const marketCap = positiveOrNull(fq.marketCap ?? fp.mktCap ?? fp.marketCap)
    const fmpCompanyName = textOrNull(fp.companyName)
    fmpSeed = {
      name: fmpCompanyName && fmpCompanyName.toUpperCase() !== ticker ? fmpCompanyName : null,
      exchange: fp.exchangeShortName || fp.exchange || null,
      sector: fp.sector || null,
      industry: fp.industry || null,
      website: fp.website || null,
      description: fp.description || null,
      pe: fq.pe ?? fp.pe ?? fr.pe ?? null,
      pb: fr.pb ?? null,
      ps: fr.ps ?? null,
      roe: fr.roe ?? null,
      roa: fr.roa ?? null,
      roce: fr.roce ?? null,
      netMargin: fr.netMargin ?? null,
      debtToEquity: fr.debtToEquity ?? null,
      eps: fq.eps ?? fp.eps ?? null,
      dividendYield: fp.lastDiv && price ? cleanYield(fp.lastDiv / price) : null,
    }
    const data = finish({
      price,
      prev,
      marketCap,
      name: fmpSeed.name,
      exchange: fmpSeed.exchange,
      sector: fmpSeed.sector,
      industry: fmpSeed.industry,
      website: fmpSeed.website,
      description: fmpSeed.description,
      open: fq.open,
      high: fq.high,
      low: fq.low,
      volume: fq.volume,
      avgVolume: fp.volAvg,
      pe: fmpSeed.pe,
      pb: fmpSeed.pb,
      ps: fmpSeed.ps,
      roe: fmpSeed.roe,
      roa: fmpSeed.roa,
      roce: fmpSeed.roce,
      netMargin: fmpSeed.netMargin,
      debtToEquity: fmpSeed.debtToEquity,
      eps: fmpSeed.eps,
      dividendYield: fmpSeed.dividendYield,
      changePct: fq.changePct,
      source: 'fmp'
    })
    if (useful(data)) return data
  }
  if (quoteOnly) return finish({ source: 'quote_unavailable' })
  const [chartRes, quoteRes] = await Promise.allSettled([
    yf(`/v8/finance/chart/${ticker}`, { interval: '1d', range: '5d' }),
    yfQuote(ticker),
  ])
  const meta = chartRes.status === 'fulfilled' ? (chartRes.value?.chart?.result?.[0]?.meta || {}) : {}
  const q = quoteRes.status === 'fulfilled' ? (quoteRes.value || {}) : {}
  const summary = await yfS(ticker, ['price', 'defaultKeyStatistics', 'financialData', 'summaryDetail']).catch(() => null)
  const summaryPrice = summary?.price || {}
  const summaryStats = summary?.defaultKeyStatistics || {}
  const summaryFinancials = summary?.financialData || {}
  const summaryDetail = summary?.summaryDetail || {}
  const yahooRatios = {
    pb: r2(raw(summaryStats.priceToBook)),
    ps: r2(raw(summaryDetail.priceToSalesTrailing12Months)),
    roe: pctAny(raw(summaryFinancials.returnOnEquity)),
    roa: pctAny(raw(summaryFinancials.returnOnAssets)),
    netMargin: pct(raw(summaryFinancials.profitMargins)),
    debtToEquity: summaryFinancials.debtToEquity?.raw != null ? r2(summaryFinancials.debtToEquity.raw / 100) : null,
  }
  let yahooSharesOutstanding = positiveOrNull(q.sharesOutstanding)
  let yahooMarketCap = positiveOrNull(q.marketCap)
  if (!yahooMarketCap) {
    const p = summaryPrice
    const k = summaryStats
    const d = summaryDetail
    const priceForCap = first(meta.regularMarketPrice, q.regularMarketPrice)
    yahooSharesOutstanding = positiveOrNull(first(raw(k.sharesOutstanding), n(q.sharesOutstanding), raw(p.sharesOutstanding), n(meta.sharesOutstanding)))
    yahooMarketCap = positiveOrNull(first(raw(p.marketCap), raw(d.marketCap), marketCapFromPriceAndShares(priceForCap, yahooSharesOutstanding)))
    yahooSeed = {
      name: p.longName || p.shortName || null,
      exchange: p.fullExchangeName || p.exchange || null,
    }
  }
  let data = finish({
    price: meta.regularMarketPrice ?? q.regularMarketPrice,
    prev: meta.chartPreviousClose ?? q.regularMarketPreviousClose,
    marketCap: yahooMarketCap,
    sharesOutstanding: yahooSharesOutstanding,
    name: fmpSeed.name || yahooSeed.name || q.longName || q.shortName || meta.longName,
    exchange: fmpSeed.exchange || yahooSeed.exchange || q.fullExchangeName || q.exchange || meta.exchangeName,
    sector: fmpSeed.sector,
    industry: fmpSeed.industry,
    website: fmpSeed.website,
    description: fmpSeed.description,
    open: meta.regularMarketOpen ?? q.regularMarketOpen,
    high: meta.regularMarketDayHigh ?? q.regularMarketDayHigh,
    low: meta.regularMarketDayLow ?? q.regularMarketDayLow,
    volume: meta.regularMarketVolume ?? q.regularMarketVolume,
    avgVolume: q.averageDailyVolume3Month,
    pe: fmpSeed.pe ?? q.trailingPE ?? q.forwardPE ?? raw(summaryDetail.trailingPE) ?? raw(summaryStats.forwardPE),
    pb: yahooRatios.pb,
    ps: yahooRatios.ps,
    roe: yahooRatios.roe,
    roa: yahooRatios.roa,
    netMargin: yahooRatios.netMargin,
    debtToEquity: yahooRatios.debtToEquity,
    eps: fmpSeed.eps ?? q.epsTrailingTwelveMonths,
    dividendYield: fmpSeed.dividendYield ?? cleanYield(q.trailingAnnualDividendYield),
    source: 'yahoo'
  })
  if (useful(data)) return data

  if (!bulkSafe && polygonKey(env)) {
    const [polygonDetailsRes, polygonPriceRes] = await Promise.allSettled([
      polygonDetails(ticker, env),
      polygonPrevClose(ticker, env),
    ])
    const pg = polygonDetailsRes.status === 'fulfilled' ? (polygonDetailsRes.value || {}) : {}
    const pp = polygonPriceRes.status === 'fulfilled' ? (polygonPriceRes.value || {}) : {}
    data = finish({
      price: data.overview.price ?? pp.price,
      prev: pp.prev,
      marketCap: data.overview.mktCap ?? pg.market_cap,
      name: data.overview.name !== ticker ? data.overview.name : (fmpSeed.name || pg.name),
      exchange: data.overview.exchange || fmpSeed.exchange || pg.primary_exchange,
      sector: data.overview.sector || fmpSeed.sector,
      industry: data.overview.industry || fmpSeed.industry || pg.sic_description,
      website: data.overview.website || fmpSeed.website || pg.homepage_url,
      description: data.overview.description || fmpSeed.description || pg.description,
      open: data.overview.open ?? pp.open,
      high: data.overview.high ?? pp.high,
      low: data.overview.low ?? pp.low,
      volume: data.overview.volume ?? pp.volume,
      pe: data.overview.pe,
      pb: data.overview.pb,
      ps: data.overview.ps,
      roe: data.overview.roe,
      roa: data.overview.roa,
      roce: data.overview.roce,
      netMargin: data.overview.netMargin,
      debtToEquity: data.overview.debtToEquity,
      eps: data.overview.eps,
      dividendYield: data.overview.dividendYield,
      source: 'yahoo+polygon'
    })
    if (useful(data)) return data
  }

  if (bulkSafe) return data
  const [avOverviewRes, finnhubQuoteRes, avQuoteRes] = await Promise.allSettled([
    avOverview(ticker, env),
    finnhubQuote(ticker, env),
    avQuote(ticker, env),
  ])
  const av = avOverviewRes.status === 'fulfilled' ? (avOverviewRes.value || {}) : {}
  const fhq = finnhubQuoteRes.status === 'fulfilled' ? (finnhubQuoteRes.value || {}) : {}
  const avq = avQuoteRes.status === 'fulfilled' ? (avQuoteRes.value || {}) : {}
  data = finish({
    price: data.overview.price ?? fhq.price ?? avq.price,
    prev: fhq.prev ?? avq.prev,
    marketCap: data.overview.mktCap ?? av.mktCap,
    name: data.overview.name !== ticker ? data.overview.name : (fmpSeed.name || av.name),
    exchange: data.overview.exchange || fmpSeed.exchange || av.exchange,
    sector: data.overview.sector || fmpSeed.sector || av.sector,
    industry: data.overview.industry || fmpSeed.industry || av.industry,
    website: data.overview.website || fmpSeed.website,
    description: data.overview.description || fmpSeed.description || av.description,
    open: data.overview.open ?? fhq.open ?? avq.open,
    high: data.overview.high ?? fhq.high ?? avq.high,
    low: data.overview.low ?? fhq.low ?? avq.low,
    volume: data.overview.volume,
    pe: data.overview.pe ?? av.pe,
    pb: data.overview.pb,
    ps: data.overview.ps,
    roe: data.overview.roe,
    roa: data.overview.roa,
    roce: data.overview.roce,
    netMargin: data.overview.netMargin,
    debtToEquity: data.overview.debtToEquity,
    eps: data.overview.eps ?? av.eps,
    dividendYield: data.overview.dividendYield ?? av.dividendYield,
    changePct: data.overview.changePct ?? fhq.changePct ?? avq.changePct,
    source: 'fallback'
  })
  return data
}

async function dbSaveQuoteData(env, ticker, quoteData) {
  if (!quoteData?.overview || !(await ensureDB(env))) return false
  const row = await dbGetStockRow(env, ticker).catch(() => null)
  const existing = parseJson(row?.overview) || {}
  const existingRatios = parseJson(row?.ratios) || {}
  const existingFinancials = parseJson(row?.financials) || {}
  const mergedRatios = mergeDefined(existingRatios, quoteData.ratios || {})
  const merged = { ...existing, ...quoteData.overview, lastUpdated: quoteData.updatedAt || new Date().toISOString() }
  const overview = hydrateOverviewFromRow(row, merged, mergedRatios, existingFinancials)
  const f = screenerFields(ticker, { overview, ratios: mergedRatios })
  const updatedAt = quoteData.updatedAt || new Date().toISOString()
  await dbRun(env, `INSERT INTO stock_data (
      ticker, overview, ratios, name, exchange, sector, industry, price, change_pct, mkt_cap,
      pe, pb, ps, roe, roa, roce, net_margin, debt_to_equity, dividend_yield, quote_updated_at, updated_at, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(ticker) DO UPDATE SET
      overview=excluded.overview,
      ratios=COALESCE(excluded.ratios, stock_data.ratios),
      name=COALESCE(excluded.name, stock_data.name),
      exchange=COALESCE(excluded.exchange, stock_data.exchange),
      sector=COALESCE(excluded.sector, stock_data.sector),
      industry=COALESCE(excluded.industry, stock_data.industry),
      price=COALESCE(excluded.price, stock_data.price),
      change_pct=COALESCE(excluded.change_pct, stock_data.change_pct),
      mkt_cap=COALESCE(excluded.mkt_cap, stock_data.mkt_cap),
      pe=COALESCE(excluded.pe, stock_data.pe),
      pb=COALESCE(excluded.pb, stock_data.pb),
      ps=COALESCE(excluded.ps, stock_data.ps),
      roe=COALESCE(excluded.roe, stock_data.roe),
      roa=COALESCE(excluded.roa, stock_data.roa),
      roce=COALESCE(excluded.roce, stock_data.roce),
      net_margin=COALESCE(excluded.net_margin, stock_data.net_margin),
      debt_to_equity=COALESCE(excluded.debt_to_equity, stock_data.debt_to_equity),
      dividend_yield=COALESCE(excluded.dividend_yield, stock_data.dividend_yield),
      quote_updated_at=excluded.quote_updated_at,
      updated_at=excluded.updated_at`, [
    ticker, toJson(overview), Object.keys(mergedRatios).length ? toJson(mergedRatios) : null, f.name, f.exchange, f.sector, f.industry, f.price, f.change_pct, f.mkt_cap,
    f.pe, f.pb, f.ps, f.roe, f.roa, f.roce, f.net_margin, f.debt_to_equity, f.dividend_yield, updatedAt, updatedAt, updatedAt
  ])
  return true
}

async function dbSaveStockSection(env, ticker, section, data) {
  const col = STOCK_JSON_COLUMNS[section]
  if (!col || section === 'all' || !(await ensureDB(env))) return false
  const updatedAt = new Date().toISOString()
  const row = await dbGetStockRow(env, ticker).catch(() => null)
  const directOverview = parseJson(row?.overview)
  const directFinancials = parseJson(row?.financials)
  const directRatios = parseJson(row?.ratios)
  const all = (!directOverview || !directFinancials || !directRatios) ? (parseJson(row?.all_data) || {}) : {}
  const existingOverview = directOverview || all.overview || {}
  const existingFinancials = directFinancials || all.financials || {}
  const existingRatios = directRatios || all.ratios || {}
  if (section === 'overview') {
    const mergedOverview = hydrateOverviewFromRow(row, mergeDefined(existingOverview, data), existingRatios, existingFinancials)
    const f = screenerFields(ticker, { overview: mergedOverview, ratios: existingRatios, financials: existingFinancials })
    await dbRun(env, `INSERT INTO stock_data (
        ticker, overview, name, exchange, sector, industry, price, change_pct, mkt_cap,
        pe, pb, ps, roe, roa, roce, net_margin, debt_to_equity, dividend_yield, quote_updated_at, updated_at, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ticker) DO UPDATE SET
        overview=excluded.overview,
        name=COALESCE(excluded.name, stock_data.name),
        exchange=COALESCE(excluded.exchange, stock_data.exchange),
        sector=COALESCE(excluded.sector, stock_data.sector),
        industry=COALESCE(excluded.industry, stock_data.industry),
        price=COALESCE(excluded.price, stock_data.price),
        change_pct=COALESCE(excluded.change_pct, stock_data.change_pct),
        mkt_cap=COALESCE(excluded.mkt_cap, stock_data.mkt_cap),
        pe=COALESCE(excluded.pe, stock_data.pe),
        pb=COALESCE(excluded.pb, stock_data.pb),
        ps=COALESCE(excluded.ps, stock_data.ps),
        roe=COALESCE(excluded.roe, stock_data.roe),
        roa=COALESCE(excluded.roa, stock_data.roa),
        roce=COALESCE(excluded.roce, stock_data.roce),
        net_margin=COALESCE(excluded.net_margin, stock_data.net_margin),
        debt_to_equity=COALESCE(excluded.debt_to_equity, stock_data.debt_to_equity),
        dividend_yield=COALESCE(excluded.dividend_yield, stock_data.dividend_yield),
        quote_updated_at=excluded.quote_updated_at,
        updated_at=excluded.updated_at`, [
      ticker, toJson(mergedOverview), f.name, f.exchange, f.sector, f.industry, f.price, f.change_pct, f.mkt_cap,
      f.pe, f.pb, f.ps, f.roe, f.roa, f.roce, f.net_margin, f.debt_to_equity, f.dividend_yield, updatedAt, updatedAt, updatedAt
    ])
    return true
  }
  if (section === 'ratios') {
    const mergedRatios = mergeDefined(existingRatios, data)
    const overview = hydrateOverviewFromRow(row, existingOverview, mergedRatios, existingFinancials)
    const f = screenerFields(ticker, { overview, ratios: mergedRatios, financials: existingFinancials })
    await dbRun(env, `INSERT INTO stock_data (
        ticker, ratios, pe, pb, ps, roe, roa, roce, net_margin, debt_to_equity, dividend_yield, updated_at, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ticker) DO UPDATE SET
        ratios=excluded.ratios,
        pe=COALESCE(excluded.pe, stock_data.pe),
        pb=COALESCE(excluded.pb, stock_data.pb),
        ps=COALESCE(excluded.ps, stock_data.ps),
        roe=COALESCE(excluded.roe, stock_data.roe),
        roa=COALESCE(excluded.roa, stock_data.roa),
        roce=COALESCE(excluded.roce, stock_data.roce),
        net_margin=COALESCE(excluded.net_margin, stock_data.net_margin),
        debt_to_equity=COALESCE(excluded.debt_to_equity, stock_data.debt_to_equity),
        dividend_yield=COALESCE(excluded.dividend_yield, stock_data.dividend_yield),
        updated_at=excluded.updated_at`, [
      ticker, toJson(mergedRatios), f.pe, f.pb, f.ps, f.roe, f.roa, f.roce, f.net_margin, f.debt_to_equity, f.dividend_yield, updatedAt, updatedAt
    ])
    return true
  }
  if (section === 'financials') {
    const mergedFinancials = mergeDefined(existingFinancials, data)
    const overviewBase = hydrateOverviewFromRow(row, existingOverview, existingRatios, mergedFinancials)
    const calcRatios = calcRatiosFromFinancials(mergedFinancials, overviewBase)
    const derived = calcDerivedMetrics(mergedFinancials, overviewBase, calcRatios)
    const derivedRatios = {
      interestCoverage: derived.interestCoverage ?? null,
      peg: derived.peg ?? null,
      enterpriseValue: derived.enterpriseValue ?? null,
      priceToFreeCashFlow: derived.priceToFreeCashFlow ?? null,
      fcfYield: derived.fcfYield ?? null,
      salesGrowth: derived.salesGrowth ?? null,
      profitGrowth: derived.profitGrowth ?? null,
      salesGrowth3y: derived.salesGrowth3y ?? null,
      salesGrowth5y: derived.salesGrowth5y ?? null,
      profitGrowth3y: derived.profitGrowth3y ?? null,
      profitGrowth5y: derived.profitGrowth5y ?? null,
      avgRoe3y: derived.avgRoe3y ?? null,
      avgRoe5y: derived.avgRoe5y ?? null,
      yoyQuarterlySalesGrowth: derived.yoyQuarterlySalesGrowth ?? null,
      yoyQuarterlyProfitGrowth: derived.yoyQuarterlyProfitGrowth ?? null,
    }
    const mergedRatios = mergeDefined(existingRatios, {
      ...derivedRatios,
      ...calcRatios,
      pe: existingRatios?.pe ?? calcRatios.pe ?? null,
      pb: existingRatios?.pb ?? calcRatios.pb ?? null,
      ps: existingRatios?.ps ?? calcRatios.ps ?? null,
      roe: existingRatios?.roe ?? calcRatios.roe ?? null,
      roa: existingRatios?.roa ?? calcRatios.roa ?? null,
      roce: existingRatios?.roce ?? calcRatios.roce ?? null,
      netMargin: existingRatios?.netMargin ?? calcRatios.netMargin ?? null,
      debtToEquity: existingRatios?.debtToEquity ?? calcRatios.debtToEquity ?? null,
      dividendYield: existingRatios?.dividendYield ?? null,
    })
    const overview = hydrateOverviewFromRow(row, overviewBase, mergedRatios, mergedFinancials)
    const f = screenerFields(ticker, { overview, ratios: mergedRatios, financials: mergedFinancials })
    const financialState = buildFinancialPersistenceState(row, mergedFinancials, updatedAt)
    const quoteUpdatedAt = row?.quote_updated_at || overview.lastUpdated || updatedAt
    await dbRun(env, `INSERT INTO stock_data (
        ticker, financials, ratios, overview, name, exchange, sector, industry, price, change_pct, mkt_cap,
        pe, pb, ps, roe, roa, roce, net_margin, debt_to_equity, dividend_yield, quote_updated_at, financials_updated_at, financials_attempted_at, financials_failed_at, financials_failed_count, updated_at, created_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(ticker) DO UPDATE SET
        financials=excluded.financials,
        ratios=COALESCE(excluded.ratios, stock_data.ratios),
        overview=COALESCE(excluded.overview, stock_data.overview),
        name=COALESCE(excluded.name, stock_data.name),
        exchange=COALESCE(excluded.exchange, stock_data.exchange),
        sector=COALESCE(excluded.sector, stock_data.sector),
        industry=COALESCE(excluded.industry, stock_data.industry),
        price=COALESCE(excluded.price, stock_data.price),
        change_pct=COALESCE(excluded.change_pct, stock_data.change_pct),
        mkt_cap=COALESCE(excluded.mkt_cap, stock_data.mkt_cap),
        pe=COALESCE(excluded.pe, stock_data.pe),
        pb=COALESCE(excluded.pb, stock_data.pb),
        ps=COALESCE(excluded.ps, stock_data.ps),
        roe=COALESCE(excluded.roe, stock_data.roe),
        roa=COALESCE(excluded.roa, stock_data.roa),
        roce=COALESCE(excluded.roce, stock_data.roce),
        net_margin=COALESCE(excluded.net_margin, stock_data.net_margin),
        debt_to_equity=COALESCE(excluded.debt_to_equity, stock_data.debt_to_equity),
        dividend_yield=COALESCE(excluded.dividend_yield, stock_data.dividend_yield),
        quote_updated_at=COALESCE(excluded.quote_updated_at, stock_data.quote_updated_at),
        financials_updated_at=COALESCE(excluded.financials_updated_at, stock_data.financials_updated_at),
        financials_attempted_at=COALESCE(excluded.financials_attempted_at, stock_data.financials_attempted_at),
        financials_failed_at=CASE
          WHEN COALESCE(excluded.financials_failed_count, 0) = 0 THEN NULL
          ELSE COALESCE(excluded.financials_failed_at, stock_data.financials_failed_at)
        END,
        financials_failed_count=COALESCE(excluded.financials_failed_count, stock_data.financials_failed_count, 0),
        updated_at=excluded.updated_at`, [
      ticker, toJson(mergedFinancials), toJson(mergedRatios), toJson(overview), f.name, f.exchange, f.sector, f.industry, f.price, f.change_pct, f.mkt_cap,
      f.pe, f.pb, f.ps, f.roe, f.roa, f.roce, f.net_margin, f.debt_to_equity, f.dividend_yield,
      quoteUpdatedAt,
      financialState.financialsUpdatedAt,
      financialState.financialsAttemptedAt,
      financialState.financialsFailedAt,
      financialState.financialsFailedCount,
      updatedAt,
      updatedAt
    ])
    return true
  }
  await dbRun(env, `INSERT INTO stock_data (ticker, ${col}, updated_at, created_at)
    VALUES (?,?,?,?)
    ON CONFLICT(ticker) DO UPDATE SET ${col}=excluded.${col}, updated_at=excluded.updated_at`,
    [ticker, toJson(data), updatedAt, updatedAt])
  return true
}

async function saveStockCaches(ticker, data, env, ttlOverview = 86400, ttlFinancials = 86400 * 7) {
  if (data?.overview)   await kvSet(`stock:${ticker}:overview`,   data.overview,   env, ttlOverview)
  if (data?.financials) await kvSet(`stock:${ticker}:financials`, data.financials, env, ttlFinancials)
  if (data?.ratios)     await kvSet(`stock:${ticker}:ratios`,     data.ratios,     env, ttlOverview)
}

async function getOrBuildStockData(ticker, env, force = false, opts = {}) {
  let baseline = null
  if (!force) {
    const fromDb = await dbGetStockData(env, ticker)
    if (fromDb?.overview && hasUsefulRatios(fromDb.ratios) && hasUsefulFinancials(fromDb.financials)) return fromDb
    baseline = fromDb
  } else {
    baseline = await dbGetStockData(env, ticker).catch(() => null)
  }
  const raceWithTimeout = job => Promise.race([
    job,
    sleep(GET_OR_BUILD_TIMEOUT_MS).then(() => baseline || { ticker, error: 'build_timeout' })
  ])
  if (buildLocks.has(ticker)) {
    const existingJob = buildLocks.get(ticker)
    return opts.waitForCompletion === true ? existingJob : raceWithTimeout(existingJob)
  }
  let job
  job = (async () => {
    const data = await buildStockData(ticker, env)
    if (data?.overview) {
      await dbSaveStockData(env, ticker, data).catch(e => console.log(`D1 save failed ${ticker}:`, e.message))
      await saveStockCaches(ticker, data, env)
    }
    return data
  })()
  buildLocks.set(ticker, job)
  job.finally(() => buildLocks.delete(ticker))
  return opts.waitForCompletion === true ? job : raceWithTimeout(job)
}

async function dbMetaSet(env, key, value) {
  if (!(await ensureDB(env))) return false
  await dbRun(env, `INSERT INTO app_meta (key,value,updated_at) VALUES (?,?,?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`,
    [key, toJson(value), new Date().toISOString()])
  return true
}

async function dbMetaGet(env, key) {
  try {
    if (!(await ensureDB(env))) return null
    const row = await dbFirst(env, `SELECT value FROM app_meta WHERE key=?`, [key])
    return parseJson(row?.value)
  } catch {
    return null
  }
}

async function getUniverseCoverageCounts(env) {
  if (!(await ensureDB(env))) return { totalStocks: 0, withQuoteBatchData: 0, withCompleteData: 0, withStockPageData: 0 }
  const [totalStocks, withQuoteBatchData, withCompleteData, withStockPageData] = await Promise.all([
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe WHERE is_active=1`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count
      FROM stock_universe u
      JOIN stock_data d ON d.ticker=u.ticker
      WHERE u.is_active=1 AND ${STOCK_QUOTE_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count
      FROM stock_universe u
      JOIN stock_data d ON d.ticker=u.ticker
      WHERE u.is_active=1 AND ${STOCK_FUNDAMENTAL_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count
      FROM stock_universe u
      JOIN stock_data d ON d.ticker=u.ticker
      WHERE u.is_active=1 AND ${STOCK_PAGE_READY_SQL}`).catch(() => null),
  ])
  return {
    totalStocks: totalStocks?.count || 0,
    withQuoteBatchData: withQuoteBatchData?.count || 0,
    withCompleteData: withCompleteData?.count || 0,
    withStockPageData: withStockPageData?.count || 0,
  }
}

async function acquireScheduledLock(env) {
  if (!(await ensureDB(env))) return { ok: true }
  const nowIso = new Date().toISOString()
  const lockJson = toJson({ lockedAt: nowIso, version: DATA_VERSION })
  const cutoffIso = new Date(Date.now() - SCHEDULED_LOCK_MINUTES * 60_000).toISOString()
  try {
    await dbRun(env, `INSERT INTO app_meta (key, value, updated_at) VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = CASE
          WHEN json_extract(app_meta.value, '$.lockedAt') IS NULL THEN excluded.value
          WHEN json_extract(app_meta.value, '$.version') != ? THEN excluded.value
          WHEN datetime(json_extract(app_meta.value, '$.lockedAt')) <= datetime(?) THEN excluded.value
          ELSE app_meta.value
        END,
        updated_at = CASE
          WHEN json_extract(app_meta.value, '$.lockedAt') IS NULL THEN excluded.updated_at
          WHEN json_extract(app_meta.value, '$.version') != ? THEN excluded.updated_at
          WHEN datetime(json_extract(app_meta.value, '$.lockedAt')) <= datetime(?) THEN excluded.updated_at
          ELSE app_meta.updated_at
        END`,
      ['scheduled_refresh_lock', lockJson, nowIso, DATA_VERSION, cutoffIso, DATA_VERSION, cutoffIso])
    const after = await dbMetaGet(env, 'scheduled_refresh_lock')
    if (after?.lockedAt === nowIso && after?.version === DATA_VERSION) return { ok: true, lock: after }
    return { ok: false, lock: after }
  } catch (e) {
    console.log('Scheduled lock acquire failed:', e?.message || e)
    return { ok: false, lock: { error: e?.message || String(e), version: DATA_VERSION } }
  }
}

function scheduledLockAgeMs(lock) {
  if (!lock?.lockedAt) return null
  const lockedMs = new Date(lock.lockedAt).getTime()
  return Number.isFinite(lockedMs) ? Math.max(0, Date.now() - lockedMs) : null
}

function isScheduledLockStale(lock) {
  if (!lock?.lockedAt) return false
  if (lock.version !== DATA_VERSION) return true
  const ageMs = scheduledLockAgeMs(lock)
  return ageMs != null && ageMs >= SCHEDULED_LOCK_MINUTES * 60_000
}

async function releaseScheduledLock(env, status = 'ok') {
  await dbMetaSet(env, 'scheduled_refresh_lock', {
    lockedAt: null,
    releasedAt: new Date().toISOString(),
    status,
    version: DATA_VERSION,
  }).catch(() => {})
}

async function clearScheduledLock(env, reason = 'manual_clear', opts = {}) {
  const previous = await dbMetaGet(env, 'scheduled_refresh_lock').catch(() => null)
  const previousScheduled = await dbMetaGet(env, 'last_scheduled_maintenance').catch(() => null)
  const force = opts.force === true
  const previousStatus = String(previousScheduled?.status || '')
  const lockAgeMs = previous?.lockedAt ? Math.max(0, Date.now() - new Date(previous.lockedAt).getTime()) : null
  const isActiveScheduledRun = !!(previous?.lockedAt && previous?.version === DATA_VERSION && previousStatus.startsWith('running'))
  if (!force && isActiveScheduledRun && lockAgeMs != null && lockAgeMs < SCHEDULED_MANUAL_CLEAR_MIN_MS) {
    return {
      ok: false,
      error: 'scheduled_run_active',
      reason,
      lockAgeSeconds: Math.round(lockAgeMs / 1000),
      minClearAgeSeconds: Math.round(SCHEDULED_MANUAL_CLEAR_MIN_MS / 1000),
      message: 'Scheduled maintenance is still actively running; wait longer or pass force=1 to clear it anyway.',
      previous,
      previousScheduled,
    }
  }
  const clearedAt = new Date().toISOString()
  await dbMetaSet(env, 'scheduled_refresh_lock', {
    lockedAt: null,
    releasedAt: clearedAt,
    status: reason,
    clearedPreviousLockAt: previous?.lockedAt || null,
    clearedPreviousVersion: previous?.version || null,
    version: DATA_VERSION,
  }).catch(() => {})
  if (previousStatus.startsWith('running')) {
    await dbMetaSet(env, 'last_scheduled_maintenance', {
      ...previousScheduled,
      ts: clearedAt,
      status: 'aborted_stale_lock',
      clearedAt,
      clearedReason: reason,
      clearedLockVersion: previous?.version || null,
      clearedLockAt: previous?.lockedAt || null,
      previousStatusTs: previousScheduled?.ts || null,
    }).catch(() => {})
  }
  return {
    ok: true,
    reason,
    clearedAt,
    previous,
    previousScheduled,
    lastScheduled: await dbMetaGet(env, 'last_scheduled_maintenance').catch(() => null),
    current: await dbMetaGet(env, 'scheduled_refresh_lock').catch(() => null),
  }
}

async function fetchText(url) {
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': UA, 'Accept': 'text/plain,*/*' } }, DEFAULT_FETCH_TIMEOUT_MS, 'Text fetch')
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

function cleanTicker(sym) {
  if (!sym) return null
  const s = String(sym).trim().toUpperCase().replace(/^\$+/, '')
  if (!s || s.includes(' ') || s.includes('^') || s.includes('$')) return null
  if (s.includes('/WS') || /[.-](WS|W|U|R)$/.test(s)) return null
  return s
}

function tickerVariants(sym) {
  const base = cleanTicker(sym)
  if (!base) return []
  const variants = [base]
  if (base.includes('.')) variants.push(base.replace(/\./g, '-'))
  if (base.includes('-')) variants.push(base.replace(/-/g, '.'))
  return [...new Set(variants.filter(Boolean))]
}

function normalizeUniverseName(name = '') {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCommonStockLikeName(name = '') {
  const s = ` ${normalizeUniverseName(name)} `
  if (!s.trim()) return false
  const hasBadTerm = COMMON_STOCK_BAD_NAME_TERMS.some(x => s.includes(` ${normalizeUniverseName(x)} `))
  // Many legitimate common stocks do not include "common stock" in the
  // listing name. Prefer broad inclusion and only exclude clearly bad terms.
  return !hasBadTerm
}

function parseNasdaqListed(text) {
  const rows = []
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line || line.startsWith('File Creation Time')) continue
    const p = line.split('|')
    const ticker = cleanTicker(p[0])
    const name = p[1] || ticker
    const isEtf = p[6] === 'Y'
    const isTest = p[3] === 'Y'
    const isNextShares = p[7] === 'Y'
    if (!ticker || isEtf || isTest || isNextShares || !isCommonStockLikeName(name)) continue
    rows.push({ ticker, name, exchange: 'NASDAQ', type: 'Common Stock', source: 'nasdaqtrader' })
  }
  return rows
}

function parseOtherListed(text) {
  const map = { A: 'NYSE American', N: 'NYSE', P: 'NYSE Arca', Z: 'BATS' }
  const rows = []
  for (const line of text.split(/\r?\n/).slice(1)) {
    if (!line || line.startsWith('File Creation Time')) continue
    const p = line.split('|')
    const ticker = cleanTicker(p[0])
    const name = p[1] || ticker
    const isEtf = p[4] === 'Y'
    const isTest = p[6] === 'Y'
    if (!ticker || isEtf || isTest || !isCommonStockLikeName(name)) continue
    const exchange = map[p[2]] || p[2] || 'OTHER'
    if (!['NYSE', 'NYSE American', 'NASDAQ', 'BATS'].includes(exchange)) continue
    rows.push({ ticker, name, exchange, type: 'Common Stock', source: 'nasdaqtrader' })
  }
  return rows
}

async function refreshSymbolUniverse(env) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound' }
  const [nasdaq, other] = await Promise.all([
    fetchText('https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt'),
    fetchText('https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt'),
  ])
  const byTicker = new Map()
  for (const row of [...parseNasdaqListed(nasdaq), ...parseOtherListed(other)]) byTicker.set(row.ticker, row)
  const discovered = [...byTicker.values()]
  if (!discovered.length) return { ok: false, error: 'No symbols discovered; aborting to avoid wiping universe' }
  const marketCaps = await dbAll(env, `SELECT ticker, mkt_cap FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0`).catch(() => [])
  const marketCapMap = new Map(marketCaps.map(r => [r.ticker, Number(r.mkt_cap || 0)]))
  const bootstrapRanks = new Map(ALL_TICKERS.map((ticker, index) => [ticker, index]))
  const nowIso = new Date().toISOString()
  const rows = discovered
    .sort((a, b) => {
      const aCap = marketCapMap.get(a.ticker) || 0
      const bCap = marketCapMap.get(b.ticker) || 0
      if (aCap !== bCap) return bCap - aCap
      const aBoot = bootstrapRanks.has(a.ticker) ? bootstrapRanks.get(a.ticker) : 999999
      const bBoot = bootstrapRanks.has(b.ticker) ? bootstrapRanks.get(b.ticker) : 999999
      if (aBoot !== bBoot) return aBoot - bBoot
      return a.ticker.localeCompare(b.ticker)
    })
  await dbRun(env, `DELETE FROM stock_universe_stage`).catch(e => {
    throw new Error(`Stage reset failed: ${e?.message || e}`)
  })
  let batchErrors = 0
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    try {
      await env.SP_DB.batch(batch.map(r => env.SP_DB.prepare(`INSERT INTO stock_universe_stage (ticker,name,exchange,type,is_active,source,updated_at)
        VALUES (?,?,?,?,1,?,?)
        ON CONFLICT(ticker) DO UPDATE SET name=excluded.name, exchange=excluded.exchange, type=excluded.type, is_active=1, source=excluded.source, updated_at=excluded.updated_at`)
        .bind(r.ticker, r.name, r.exchange, r.type, r.source, nowIso)))
    } catch (e) {
      batchErrors++
      console.log(`Symbol universe batch ${i} failed:`, e?.message || e)
    }
  }
  if (batchErrors > 0) {
    const meta = { ts: nowIso, total: rows.length, withMarketCap: 0, batchErrors, applied: false }
    await dbMetaSet(env, 'symbol_refresh', meta)
    return { ok: false, total: rows.length, batchErrors, source: 'nasdaqtrader', updatedAt: meta.ts, error: 'Stage population failed; live universe left unchanged' }
  }
  await env.SP_DB.batch([
    env.SP_DB.prepare(`DELETE FROM stock_universe`),
    env.SP_DB.prepare(`INSERT INTO stock_universe (ticker,name,exchange,type,is_active,source,updated_at)
      SELECT ticker,name,exchange,type,is_active,source,updated_at
      FROM stock_universe_stage`)
  ]).catch(e => {
    throw new Error(`Universe swap failed: ${e?.message || e}`)
  })
  const withMarketCap = await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1 AND d.price > 0 AND d.mkt_cap > 0`).catch(() => null)
  const meta = { ts: nowIso, total: rows.length, withMarketCap: withMarketCap?.count || 0, batchErrors, applied: true }
  await dbMetaSet(env, 'symbol_refresh', meta)
  await dbMetaSet(env, 'ticker_list', { tickers: rows.map(r => r.ticker) })
  return { ok: true, total: rows.length, withMarketCap: meta.withMarketCap, batchErrors, source: 'nasdaqtrader', updatedAt: meta.ts }
}

async function ensureBootstrapUniverse(env) {
  if (!(await ensureDB(env))) return { ok: false }
  const count = await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe WHERE is_active=1`).catch(() => null)
  if (count?.count) return { ok: true, skipped: true, total: count.count }
  const now = new Date().toISOString()
  const rows = ALL_TICKERS.map(ticker => ({ ticker, name: ticker, exchange: 'US', type: 'Common Stock', source: 'bootstrap_top' }))
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100)
    await env.SP_DB.batch(batch.map(r => env.SP_DB.prepare(`INSERT INTO stock_universe (ticker,name,exchange,type,is_active,source,updated_at)
      VALUES (?,?,?,?,1,?,?)
      ON CONFLICT(ticker) DO UPDATE SET is_active=1, source=excluded.source, updated_at=excluded.updated_at`)
      .bind(r.ticker, r.name, r.exchange, r.type, r.source, now)))
  }
  await dbMetaSet(env, 'ticker_list', { tickers: rows.map(r => r.ticker) }).catch(() => {})
  return { ok: true, bootstrapped: true, total: rows.length }
}

async function ensureMonthlySymbols(env) {
  await ensureBootstrapUniverse(env).catch(e => console.log('Bootstrap universe skipped:', e.message))
  const meta = await dbMetaGet(env, 'symbol_refresh')
  const activeCount = await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe WHERE is_active=1`).catch(() => null)
  const ageDays = meta?.ts ? (Date.now() - new Date(meta.ts).getTime()) / 86400000 : Infinity
  if ((activeCount?.count || 0) < MIN_ACTIVE_UNIVERSE_SIZE) return refreshSymbolUniverse(env)
  if (ageDays >= SYMBOL_REFRESH_DAYS) return refreshSymbolUniverse(env)
  return { ok: true, skipped: true, lastRefresh: meta?.ts || null }
}

async function refreshQuotes(env, limit = 50, opts = {}) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound' }
  await ensureMonthlySymbols(env).catch(e => console.log('Symbol refresh skipped:', e.message))
  const lim = Math.min(Math.max(Number(limit) || 25, 1), MAX_QUOTE_REFRESH_LIMIT, QUOTE_REFRESH_SAFE_INVOCATION_LIMIT)
  const candidateLimit = Math.min(Math.max(lim * 20, lim), 6000)
  const rows = await dbAll(env, `WITH top AS (
      SELECT ticker
      FROM stock_data
      WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
      ORDER BY mkt_cap DESC
      LIMIT ${TOP_PRIORITY_COUNT}
    ),
    bootstrap(ticker, rank) AS (
      VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
    )
    SELECT u.ticker, u.name, top.ticker AS top_priority, bootstrap.rank AS bootstrap_rank,
      CASE WHEN d.ticker IS NULL THEN 1 ELSE 0 END AS missing_row,
      CASE WHEN d.price IS NULL OR d.price <= 0 OR d.mkt_cap IS NULL OR d.mkt_cap <= 0 THEN 1 ELSE 0 END AS missing_quote,
      CASE WHEN d.price > 0 AND d.mkt_cap > 0 THEN 1 ELSE 0 END AS has_complete_quote,
      d.updated_at,
      d.quote_updated_at
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN top ON top.ticker=u.ticker
    LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
    WHERE u.is_active=1
      AND ${COMMON_STOCK_PRIORITY_SQL}
      AND (
        d.ticker IS NULL
        OR ((d.price IS NULL OR d.price <= 0 OR d.mkt_cap IS NULL OR d.mkt_cap <= 0)
          AND (d.updated_at IS NULL OR datetime(d.updated_at) < datetime('now', '-' || ? || ' hours')))
        OR (d.price > 0 AND d.mkt_cap > 0
          AND (d.quote_updated_at IS NULL OR datetime(d.quote_updated_at) < datetime('now', '-' || ? || ' days')))
      )
    ORDER BY
      CASE WHEN d.ticker IS NULL THEN 0 ELSE 1 END,
      CASE WHEN d.price IS NULL OR d.price <= 0 OR d.mkt_cap IS NULL OR d.mkt_cap <= 0 THEN 0 ELSE 1 END,
      CASE WHEN top.ticker IS NOT NULL THEN 0 ELSE 1 END,
      CASE WHEN bootstrap.ticker IS NOT NULL THEN 0 ELSE 1 END,
      COALESCE(bootstrap.rank, 999999),
      COALESCE(d.updated_at, d.quote_updated_at, '1900-01-01') ASC,
      u.ticker ASC
    LIMIT ?`, [QUOTE_MISSING_RETRY_HOURS, QUOTE_STALE_DAYS, candidateLimit])
  const bootstrapRanks = new Map(ALL_TICKERS.slice(0, TOP_PRIORITY_COUNT).map((ticker, index) => [ticker, index]))
  const sortedRows = [...rows].sort((a, b) => {
    const aMissingRow = Number(a.missing_row || 0)
    const bMissingRow = Number(b.missing_row || 0)
    if (aMissingRow !== bMissingRow) return bMissingRow - aMissingRow

    const aMissingQuote = Number(a.missing_quote || 0)
    const bMissingQuote = Number(b.missing_quote || 0)
    if (aMissingQuote !== bMissingQuote) return bMissingQuote - aMissingQuote

    const aTop = a.top_priority ? 0 : 1
    const bTop = b.top_priority ? 0 : 1
    if (aTop !== bTop) return aTop - bTop

    const aBoot = bootstrapRanks.has(a.ticker) ? 0 : 1
    const bBoot = bootstrapRanks.has(b.ticker) ? 0 : 1
    if (aBoot !== bBoot) return aBoot - bBoot
    if (aBoot === 0 && bBoot === 0) return bootstrapRanks.get(a.ticker) - bootstrapRanks.get(b.ticker)

    const aTs = Date.parse(a.updated_at || a.quote_updated_at || '1900-01-01') || 0
    const bTs = Date.parse(b.updated_at || b.quote_updated_at || '1900-01-01') || 0
    if (aTs !== bTs) return aTs - bTs

    return String(a.ticker).localeCompare(String(b.ticker))
  })
  const isPriorityQuoteRow = row => !!(row.top_priority || bootstrapRanks.has(row.ticker))
  const priorityQuota = Math.ceil(lim * 0.4)
  const priorityRows = sortedRows.filter(isPriorityQuoteRow).slice(0, priorityQuota)
  const regularRows = sortedRows.filter(row => !isPriorityQuoteRow(row)).slice(0, Math.max(lim - priorityRows.length, 0))
  const selectedTickers = new Set([...priorityRows, ...regularRows].map(row => row.ticker))
  const fillRows = sortedRows.filter(row => !selectedTickers.has(row.ticker)).slice(0, Math.max(lim - priorityRows.length - regularRows.length, 0))
  const prioritizedRows = [...priorityRows, ...regularRows, ...fillRows]
  const quoteBuildOpts = fmpPaidPriorityEnabled(env)
    ? { bulkSafe: false, quoteOnly: true }
    : { bulkSafe: FREE_TIER_BULK_SAFE_MODE }
  const quoteBatchPauseMs = fmpPaidPriorityEnabled(env) ? FMP_QUOTE_BATCH_PAUSE_MS : 25
  let processed = 0, repaired = 0, alreadyComplete = 0, stillIncomplete = 0, errors = 0
  const failedTickers = []
  const markQuoteAttempt = ticker => dbRun(env, `INSERT INTO stock_data (ticker, updated_at, created_at)
      VALUES (?,?,?)
      ON CONFLICT(ticker) DO UPDATE SET updated_at=excluded.updated_at`,
    [ticker, new Date().toISOString(), new Date().toISOString()]).catch(() => {})
  for (let i = 0; i < prioritizedRows.length; i += QUOTE_REFRESH_CONCURRENCY) {
    if (opts.deadlineMs && Date.now() > opts.deadlineMs) break
    await Promise.all(prioritizedRows.slice(i, i + QUOTE_REFRESH_CONCURRENCY).map(async r => {
      try {
        const before = await dbGetStockData(env, r.ticker).catch(() => null)
        const beforeFields = screenerFields(r.ticker, before || {})
        const data = await buildQuoteData(r.ticker, env, quoteBuildOpts)
        await dbSaveQuoteData(env, r.ticker, data)
        if (data.overview) await kvSet(`stock:${r.ticker}:overview`, data.overview, env, 86400 * 2)
        let saved = await dbGetStockData(env, r.ticker).catch(() => null)
        let f = screenerFields(r.ticker, saved || data)
        processed++
        if (f.price > 0 && f.mkt_cap > 0) {
          if (beforeFields.price > 0 && beforeFields.mkt_cap > 0) {
            alreadyComplete++
          } else {
            repaired++
          }
        } else {
          stillIncomplete++
        }
      } catch (e) {
        failedTickers.push({ ticker: r.ticker, error: e?.message || String(e) })
        await markQuoteAttempt(r.ticker)
        errors++
      }
    }))
    if (i + QUOTE_REFRESH_CONCURRENCY < prioritizedRows.length) await sleep(quoteBatchPauseMs)
  }
  const remainingMissingQuote = await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1
      AND ${COMMON_STOCK_PRIORITY_SQL}
      AND (d.ticker IS NULL OR d.price IS NULL OR d.price <= 0 OR d.mkt_cap IS NULL OR d.mkt_cap <= 0)`).catch(() => null)
  const remainingStaleQuotes = await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1
      AND ${COMMON_STOCK_PRIORITY_SQL}
      AND (d.quote_updated_at IS NULL OR datetime(d.quote_updated_at) < datetime('now', '-' || ? || ' days'))`, [QUOTE_STALE_DAYS]).catch(() => null)
  const remainingMissingQuoteCoolingDown = await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1
      AND ${COMMON_STOCK_PRIORITY_SQL}
      AND (d.ticker IS NOT NULL AND (d.price IS NULL OR d.price <= 0 OR d.mkt_cap IS NULL OR d.mkt_cap <= 0)
        AND d.updated_at IS NOT NULL AND datetime(d.updated_at) >= datetime('now', '-' || ? || ' hours'))`, [QUOTE_MISSING_RETRY_HOURS]).catch(() => null)
  const coverage = await getUniverseCoverageCounts(env)
  const meta = {
    ts: new Date().toISOString(),
    processed,
    repaired,
    alreadyComplete,
    stillIncomplete,
    errors,
    remainingMissingQuote: remainingMissingQuote?.count || 0,
    remainingStaleQuotes: remainingStaleQuotes?.count || 0,
    remainingMissingQuoteCoolingDown: remainingMissingQuoteCoolingDown?.count || 0,
    coverage,
    failedTickers: failedTickers.slice(0, 25),
    missingRetryHours: QUOTE_MISSING_RETRY_HOURS
  }
  await dbMetaSet(env, 'last_quote_refresh', meta).catch(() => {})
  return {
    ok: true,
    selected: prioritizedRows.length,
    processed,
    repaired,
    alreadyComplete,
    stillIncomplete,
    errors,
    remaining: meta.remainingMissingQuote,
    remainingMissingQuote: meta.remainingMissingQuote,
    remainingStaleQuotes: meta.remainingStaleQuotes,
    remainingMissingQuoteCoolingDown: meta.remainingMissingQuoteCoolingDown,
    coverage,
    failedTickers: meta.failedTickers,
    apiStats: apiStatsSnapshot(env),
    quoteStaleDays: QUOTE_STALE_DAYS,
    missingRetryHours: QUOTE_MISSING_RETRY_HOURS,
    topPriorityCount: TOP_PRIORITY_COUNT,
    limit: lim
  }
}

async function processDeepRefreshRows(env, rows, concurrency, opts = {}) {
  const bulkSafe = opts.bulkSafe != null ? opts.bulkSafe === true : FREE_TIER_BULK_SAFE_MODE
  const fmpPriority = opts.fmpPriority != null ? opts.fmpPriority === true : !bulkSafe
  const skipSlowFinancialFallback = opts.skipSlowFinancialFallback != null ? opts.skipSlowFinancialFallback === true : bulkSafe
  const skipSecondaryFinancialSources = opts.skipSecondaryFinancialSources != null ? opts.skipSecondaryFinancialSources === true : skipSlowFinancialFallback
  const skipQuarterlyEnrichment = opts.skipQuarterlyEnrichment != null ? opts.skipQuarterlyEnrichment === true : (fmpPriority && !bulkSafe)
  const fmpFastFinancials = opts.fmpFastFinancials != null ? opts.fmpFastFinancials === true : skipQuarterlyEnrichment
  const lightweightRatios = opts.lightweightRatios != null ? opts.lightweightRatios === true : bulkSafe
  const skipSlowRatioSources = opts.skipSlowRatioSources != null ? opts.skipSlowRatioSources === true : skipSecondaryFinancialSources
  const preferStoredFinancials = opts.preferStoredFinancials != null ? opts.preferStoredFinancials === true : skipSecondaryFinancialSources
  const forceFinancialRefresh = opts.forceFinancialRefresh === true
  let processed = 0, repaired = 0, financialsRepaired = 0, ratiosRepaired = 0, stillIncomplete = 0, errors = 0, noOverview = 0, buildMsTotal = 0, saved = 0, saveErrors = 0
  let pageFinancialsRepaired = 0, pageRatiosRepaired = 0
  const slowTickers = []
  const incompleteTickers = []
  for (let i = 0; i < rows.length; i += concurrency) {
    if (opts.deadlineMs && Date.now() > opts.deadlineMs) break
    const chunkResults = await Promise.all(rows.slice(i, i + concurrency).map(async r => {
      try {
        const data = await buildStockData(r.ticker, env, {
          preferStoredOverview: true,
          preferStoredFinancials,
          preferStoredRatios: false,
          fmpPriority,
          bulkSafe,
          skipQuarterlyEnrichment,
          skipSlowFinancialFallback,
          skipSecondaryFinancialSources,
          fmpFastFinancials,
          lightweightRatios,
          skipSlowRatioSources,
          skipReturns: true,
          collectTimings: true,
          forceFinancialRefresh: forceFinancialRefresh || isFinancialAgeStale(r),
        })
        return { ...r, ticker: r.ticker, data }
      } catch (e) {
        return { ...r, ticker: r.ticker, error: e.message }
      }
    }))
    const savedItems = chunkResults.filter(item => item?.data?.overview)
    const savedTickers = new Set()
    if (savedItems.length) {
      const writes = await Promise.allSettled(savedItems.map(item => dbSaveStockData(env, item.ticker, item.data)))
      const cacheItems = []
      for (let idx = 0; idx < savedItems.length; idx++) {
        const item = savedItems[idx]
        const write = writes[idx]
        if (write.status === 'fulfilled' && write.value !== false) {
          saved++
          savedTickers.add(item.ticker)
          cacheItems.push(item)
        } else {
          saveErrors++
          const reason = write.status === 'rejected' ? (write.reason?.message || String(write.reason)) : 'not saved'
          console.log(`D1 deep save failed ${item.ticker}:`, reason)
        }
      }
      await Promise.all(cacheItems.map(item => saveStockCaches(item.ticker, item.data, env, 86400 * 2, 86400 * 8)))
    }
    for (const item of chunkResults) {
      const buildMs = item?.data?.timings?.totalMs || 0
      if (buildMs) buildMsTotal += buildMs
      if (buildMs >= SLOW_BUILD_LOG_MS && slowTickers.length < 12) {
        slowTickers.push({ ticker: item.ticker, buildMs, timings: item.data?.timings || null })
      }
      if (item?.data?.overview) {
        processed++
        const f = screenerFields(item.ticker, item.data)
        const hasFinancials = hasUsefulFinancials(item.data.financials)
        const hasRatios = hasCoreScreenerRatios(item.data.ratios)
        const hasPageFinancials = hasStockPageFinancialCoverage(item.data.financials)
        const hasPageRatios = hasStockPageRatioCoverage(item.data.ratios)
        const persisted = savedTickers.has(item.ticker)
        const completeReady = persisted && f.price > 0 && f.mkt_cap > 0 && hasFinancials && hasRatios && hasPageFinancials && hasPageRatios
        const financialReadyBefore = Number(item?.financial_ready_before || 0) === 1
        const ratioReadyBefore = Number(item?.ratio_ready_before || 0) === 1
        const pageFinancialReadyBefore = Number(item?.page_financial_ready_before || 0) === 1
        const pageRatioReadyBefore = Number(item?.page_ratio_ready_before || 0) === 1
        const completeReadyBefore = Number(item?.complete_ready_before || 0) === 1
        if (completeReady && !completeReadyBefore) repaired++
        if (persisted && hasFinancials && !financialReadyBefore) financialsRepaired++
        if (persisted && hasRatios && !ratioReadyBefore) ratiosRepaired++
        if (persisted && hasPageFinancials && !pageFinancialReadyBefore) pageFinancialsRepaired++
        if (persisted && hasPageRatios && !pageRatioReadyBefore) pageRatiosRepaired++
        if (!completeReady) {
          stillIncomplete++
          if (incompleteTickers.length < 12) {
            incompleteTickers.push({
              ticker: item.ticker,
              hasFinancials,
              hasRatios,
              hasPageFinancials,
              hasPageRatios,
              persisted,
              buildMs,
              financialSource: item.data?.timings?.financials?.source || null,
              ratioSource: item.data?.timings?.ratios?.source || null,
            })
          }
        }
      } else if (item?.error) errors++
      else noOverview++
    }
    if (i + concurrency < rows.length) await new Promise(r => setTimeout(r, 150))
  }
  return {
    processed,
    repaired,
    financialsRepaired,
    ratiosRepaired,
    pageFinancialsRepaired,
    pageRatiosRepaired,
    stillIncomplete,
    noOverview,
    errors,
    avgBuildMs: processed ? Math.round(buildMsTotal / processed) : 0,
    saved,
    saveErrors,
    batchWriteCount: saved,
    stoppedByDeadline: !!(opts.deadlineMs && Date.now() > opts.deadlineMs),
    apiStats: apiStatsSnapshot(env),
    slowTickers,
    incompleteTickers,
  }
}

async function refreshStaleStocks(env, limit = 100, excludeTop = false, opts = {}) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound' }
  await ensureMonthlySymbols(env).catch(e => console.log('Symbol refresh skipped:', e.message))
  const lim = Math.min(Math.max(Number(limit) || 100, 1), MAX_DEEP_REFRESH_LIMIT)
  const coreRatioQuota = Math.min(Math.max(Number(opts.coreRatioQuota) || 0, 0), lim)
  const richCoreRatioQuota = Math.min(Math.max(Number(opts.richCoreRatioQuota) || 0, 0), coreRatioQuota)
  const incompleteOnly = opts.incompleteOnly === true
  const incompleteOnlyFilter = incompleteOnly
    ? ` AND (NOT ${STOCK_PAGE_READY_SQL} OR ${STOCK_CORE_SCREEN_RETRY_SQL})`
    : ''
  const coreRatioRows = coreRatioQuota > 0 ? await dbAll(env, `WITH top AS (
      SELECT ticker
      FROM stock_data
      WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
      ORDER BY mkt_cap DESC
      LIMIT ${TOP_PRIORITY_COUNT}
    ),
    bootstrap(ticker, rank) AS (
      VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
    )
    SELECT u.ticker, u.name, d.ticker AS loaded, d.pb, d.debt_to_equity, d.mkt_cap, d.financials_updated_at, d.financials_attempted_at, top.ticker AS top_priority, bootstrap.rank AS bootstrap_rank,
      CASE WHEN ${STOCK_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS financial_ready_before,
      CASE WHEN ${STOCK_RATIO_READY_SQL} THEN 1 ELSE 0 END AS ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS page_financial_ready_before,
      CASE WHEN ${STOCK_PAGE_RATIO_READY_SQL} THEN 1 ELSE 0 END AS page_ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_READY_SQL} THEN 1 ELSE 0 END AS complete_ready_before
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN top ON top.ticker=u.ticker
    LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
    WHERE u.is_active=1
      AND (${STOCK_DEEP_STALE_SQL}
        OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))
      AND (? = 0 OR top.ticker IS NULL)
      ${incompleteOnlyFilter}
      AND d.price IS NOT NULL AND d.price > 0
      AND d.mkt_cap IS NOT NULL AND d.mkt_cap > 0
      AND ${STOCK_CORE_SCREEN_RETRY_SQL}
    ORDER BY
      CASE WHEN NOT ${STOCK_PAGE_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_QUARTERLY_DETAIL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_PAGE_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_FINANCIAL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN top.ticker IS NOT NULL THEN 0 ELSE 1 END,
      COALESCE(bootstrap.rank, 999999),
      ${STOCK_FINANCIAL_ATTEMPT_SQL} ASC,
      COALESCE(d.mkt_cap, 0) DESC
    LIMIT ?`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS, excludeTop ? 1 : 0, coreRatioQuota]).catch(() => []) : []
  const remainingLimit = lim
  const generalRows = remainingLimit > 0 ? await dbAll(env, `WITH top AS (
      SELECT ticker
      FROM stock_data
      WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
      ORDER BY mkt_cap DESC
      LIMIT ${TOP_PRIORITY_COUNT}
    ),
    bootstrap(ticker, rank) AS (
      VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
    )
    SELECT u.ticker, u.name, d.ticker AS loaded, d.pb, d.debt_to_equity, d.mkt_cap, d.financials_updated_at, d.financials_attempted_at, top.ticker AS top_priority, bootstrap.rank AS bootstrap_rank,
      CASE WHEN ${STOCK_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS financial_ready_before,
      CASE WHEN ${STOCK_RATIO_READY_SQL} THEN 1 ELSE 0 END AS ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS page_financial_ready_before,
      CASE WHEN ${STOCK_PAGE_RATIO_READY_SQL} THEN 1 ELSE 0 END AS page_ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_READY_SQL} THEN 1 ELSE 0 END AS complete_ready_before
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN top ON top.ticker=u.ticker
    LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
    WHERE u.is_active=1
      AND (${STOCK_DEEP_STALE_SQL}
        OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))
      AND (? = 0 OR top.ticker IS NULL)
      ${incompleteOnlyFilter}
    ORDER BY
      CASE WHEN NOT ${STOCK_PAGE_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_QUARTERLY_DETAIL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_PAGE_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_FINANCIAL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN top.ticker IS NOT NULL THEN 0 ELSE 1 END,
      COALESCE(bootstrap.rank, 999999),
      ${STOCK_FINANCIAL_ATTEMPT_SQL} ASC,
      COALESCE(d.mkt_cap, 0) DESC
    LIMIT ?`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS, excludeTop ? 1 : 0, remainingLimit]).catch(() => []) : []
  const seen = new Set()
  const rows = [...coreRatioRows, ...generalRows].filter(row => {
    if (!row?.ticker || seen.has(row.ticker)) return false
    seen.add(row.ticker)
    return true
  })
  const richRows = richCoreRatioQuota > 0 ? rows.filter(row => coreRatioRows.slice(0, richCoreRatioQuota).some(core => core.ticker === row.ticker)) : []
  const richTickers = new Set(richRows.map(row => row.ticker))
  const bulkRows = richTickers.size ? rows.filter(row => !richTickers.has(row.ticker)) : rows
  const refreshResults = []
  if (richRows.length) {
    const richStats = await processDeepRefreshRows(env, richRows, DEEP_REFRESH_CONCURRENCY, {
      ...opts,
      bulkSafe: false,
      fmpPriority: true,
    })
    refreshResults.push({ ok: true, selected: richRows.length, ...richStats })
  }
  if (bulkRows.length) {
    const bulkStats = await processDeepRefreshRows(env, bulkRows, DEEP_REFRESH_CONCURRENCY, opts)
    refreshResults.push({ ok: true, selected: bulkRows.length, ...bulkStats })
  }
  const stats = aggregateRefreshResults(refreshResults) || {
    ok: true,
    selected: 0,
    processed: 0,
    repaired: 0,
    stillIncomplete: 0,
    errors: 0,
    noOverview: 0,
    returnsRepaired: 0,
    financialsRepaired: 0,
    ratiosRepaired: 0,
    pageFinancialsRepaired: 0,
    pageRatiosRepaired: 0,
    saved: 0,
    saveErrors: 0,
    batchWriteCount: 0,
    stoppedByDeadline: false,
  }
  const remaining = await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN (SELECT ticker FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0 ORDER BY mkt_cap DESC LIMIT ${TOP_PRIORITY_COUNT}) top ON top.ticker=u.ticker
    WHERE u.is_active=1
      AND (${STOCK_DEEP_STALE_SQL}
        OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))
      AND (? = 0 OR top.ticker IS NULL)
      ${incompleteOnlyFilter}`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS, excludeTop ? 1 : 0]).catch(() => null)
  const coverage = await getUniverseCoverageCounts(env)
  const meta = { ts: new Date().toISOString(), ...stats, remaining: remaining?.count || 0, coverage, incompleteOnly }
  await dbMetaSet(env, 'last_refresh', meta).catch(() => {})
  return {
    ok: true,
    selected: rows.length,
    ...stats,
    remaining: meta.remaining,
    coverage,
    incompleteOnly,
    staleDays: STOCK_STALE_DAYS,
    fundamentalStaleDays: FUNDAMENTAL_STALE_DAYS,
    topPriorityCount: TOP_PRIORITY_COUNT,
    topPriorityFinancialStaleDays: TOP_FINANCIAL_STALE_DAYS,
    richCoreRatioQuota,
    limit: lim
  }
}

function bootstrapTopValuesSql(limit = TOP_PRIORITY_COUNT) {
  return ALL_TICKERS.slice(0, limit)
    .map((ticker, rank) => `('${ticker.replace(/'/g, "''")}',${rank})`)
    .join(',') || "('AAPL',0)"
}

async function refreshTopStocks(env, limit = 100, opts = {}) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound' }
  await ensureMonthlySymbols(env).catch(e => console.log('Symbol refresh skipped:', e.message))
  const lim = Math.min(Math.max(Number(limit) || 100, 1), MAX_DEEP_REFRESH_LIMIT)
  const incompleteOnly = opts.incompleteOnly === true
  const incompleteOnlyFilter = incompleteOnly
    ? ` AND (NOT ${STOCK_PAGE_READY_SQL} OR ${STOCK_CORE_SCREEN_RETRY_SQL})`
    : ''
  const rows = await dbAll(env, `WITH top AS (
      SELECT ticker, mkt_cap
      FROM stock_data
      WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
      ORDER BY mkt_cap DESC
      LIMIT ${TOP_PRIORITY_COUNT}
    ),
    bootstrap(ticker, rank) AS (
      VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
    )
    SELECT u.ticker, u.name, d.mkt_cap, d.price, d.financials_updated_at, d.financials_attempted_at,
      CASE WHEN ${STOCK_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS financial_ready_before,
      CASE WHEN ${STOCK_RATIO_READY_SQL} THEN 1 ELSE 0 END AS ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_FINANCIAL_READY_SQL} THEN 1 ELSE 0 END AS page_financial_ready_before,
      CASE WHEN ${STOCK_PAGE_RATIO_READY_SQL} THEN 1 ELSE 0 END AS page_ratio_ready_before,
      CASE WHEN ${STOCK_PAGE_READY_SQL} THEN 1 ELSE 0 END AS complete_ready_before,
      CASE WHEN top.ticker IS NOT NULL THEN 1 ELSE 0 END AS known_top,
      bootstrap.rank AS bootstrap_rank
    FROM stock_universe u
    LEFT JOIN top ON top.ticker=u.ticker
    LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1
      AND (top.ticker IS NOT NULL OR bootstrap.ticker IS NOT NULL)
      AND (${STOCK_DEEP_STALE_SQL}
        OR ${STOCK_TOP_FINANCIAL_STALE_SQL})
      ${incompleteOnlyFilter}
    ORDER BY
      CASE WHEN NOT ${STOCK_PAGE_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_QUARTERLY_DETAIL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_PAGE_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_FINANCIAL_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN NOT ${STOCK_RATIO_READY_SQL} THEN 0 ELSE 1 END,
      CASE WHEN top.ticker IS NOT NULL THEN 0 ELSE 1 END,
      COALESCE(bootstrap.rank, 999999),
      ${STOCK_FINANCIAL_ATTEMPT_SQL} ASC,
      COALESCE(d.mkt_cap, 0) DESC
    LIMIT ?`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS, lim])

  const stats = await processDeepRefreshRows(env, rows, TOP_REFRESH_CONCURRENCY, opts)

  const remainingTop = await dbFirst(env, `WITH top AS (
      SELECT ticker, mkt_cap
      FROM stock_data
      WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
      ORDER BY mkt_cap DESC
      LIMIT ${TOP_PRIORITY_COUNT}
    ),
    bootstrap(ticker, rank) AS (
      VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
    )
    SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN top ON top.ticker=u.ticker
    LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    WHERE u.is_active=1
      AND (top.ticker IS NOT NULL OR bootstrap.ticker IS NOT NULL)
      AND (${STOCK_DEEP_STALE_SQL}
        OR ${STOCK_TOP_FINANCIAL_STALE_SQL})
      ${incompleteOnlyFilter}`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => null)
  const coverage = await getUniverseCoverageCounts(env)
  const meta = { ts: new Date().toISOString(), ...stats, remainingTop: remainingTop?.count || 0, coverage, incompleteOnly }
  await dbMetaSet(env, 'last_top_refresh', meta).catch(() => {})
  return {
    ok: true,
    selected: rows.length,
    ...stats,
    remainingTop: meta.remainingTop,
    coverage,
    incompleteOnly,
    topPriorityCount: TOP_PRIORITY_COUNT,
    topPriorityFinancialStaleDays: TOP_FINANCIAL_STALE_DAYS,
    limit: lim
  }
}

async function refreshOneTicker(env, ticker) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound' }
  const t = cleanTicker(ticker)
  if (!t) return { error: 'ticker required' }
  const data = await buildStockData(t, env)
  if (!data?.overview) return { ok: false, ticker: t, error: 'overview unavailable' }
  await dbSaveStockData(env, t, data)
  await saveStockCaches(t, data, env, 86400 * 2, 86400 * 8)
  const f = screenerFields(t, data)
  const financialsUseful = hasUsefulFinancials(data.financials)
  const ratiosUseful = hasUsefulRatios(data.ratios)
  return {
    ok: true,
    ticker: t,
    saved: true,
    price: f.price,
    marketCap: f.mkt_cap,
    pe: f.pe,
    pb: f.pb,
    roe: f.roe,
    financialsUseful,
    ratiosUseful,
    financialsUpdatedAt: financialsUseful ? (data.updatedAt || new Date().toISOString()) : null,
    balanceSheetYears: data.financials?.balanceSheetYears || 0,
    balanceSheetSource: data.financials?.balanceSheetSource || 'unknown',
    annualYears: data.financials?.annual?.headers?.length || 0,
    quarterlyPeriods: data.financials?.quarterly?.headers?.length || 0,
    cashflowYears: data.financials?.cashflow?.headers?.length || 0,
    note: 'This endpoint force-rebuilds and overwrites one ticker in D1, including overview, ratios, financials, and caches.'
  }
}

async function runScheduledMaintenance(env) {
  const startedAt = new Date().toISOString()
  const startedMs = Date.now()
  let lock = await acquireScheduledLock(env).catch(() => ({ ok: false, lock: null }))
  if (!lock.ok && isScheduledLockStale(lock.lock)) {
    await clearScheduledLock(env, 'auto_clear_stale_lock', { force: true }).catch(() => null)
    lock = await acquireScheduledLock(env).catch(() => ({ ok: false, lock: null }))
  }
  if (!lock.ok) {
    const previousScheduled = await dbMetaGet(env, 'last_scheduled_maintenance').catch(() => null)
    const skipped = {
      ts: startedAt,
      startedAt,
      status: 'skipped_locked',
      lockedAt: lock.lock?.lockedAt || null,
      lockAgeSeconds: Math.round((scheduledLockAgeMs(lock.lock) || 0) / 1000),
      lockVersion: lock.lock?.version || null,
      lockMinutes: SCHEDULED_LOCK_MINUTES,
      priority: 'cron_interleaved_quote_and_fundamentals',
      previousStatus: previousScheduled?.status || null,
      previousHeartbeatAt: previousScheduled?.heartbeatAt || null,
    }
    await dbMetaSet(env, 'last_scheduled_maintenance', skipped).catch(() => {})
    return { ok: true, skipped: true, reason: 'scheduled_refresh_locked', lockedAt: skipped.lockedAt }
  }
  resetApiStats(env)
  let releaseStatus = 'ok'
  try {
    const writeRunningMeta = async (status, extra = {}) => {
      await dbMetaSet(env, 'last_scheduled_maintenance', {
        ts: new Date().toISOString(),
        startedAt,
        status,
        priority: 'cron_interleaved_quote_and_fundamentals',
        deadlineMs: SCHEDULED_MAX_RUNTIME_MS,
        lockMinutes: SCHEDULED_LOCK_MINUTES,
        heartbeatAt: new Date().toISOString(),
        durationMs: Date.now() - startedMs,
        apiStats: apiStatsSnapshot(env),
        ...extra,
      }).catch(() => {})
    }
    const hasTimeForStage = reserveMs => Date.now() < (deadlineMs - reserveMs)
    const deadlineMs = startedMs + SCHEDULED_MAX_RUNTIME_MS
    await ensureMonthlySymbols(env).catch(e => console.log('Monthly symbol refresh failed:', e.message))
    const coverageBefore = await getUniverseCoverageCounts(env)
    let coverageSnapshot = coverageBefore
    let coverageAfterQuotes = coverageBefore
    await writeRunningMeta('running_scheduler_setup', { stage: 'setup' })
    let lastStageRun = ''
    const stageState = {
      quotes: {
        status: 'running_quote_batch',
        stage: 'quote_batch',
        limit: SCHEDULED_QUOTE_LIMIT,
        maxStageMs: SCHEDULED_QUOTE_STAGE_MAX_MS,
        maxRuns: SCHEDULED_QUOTE_MAX_BATCHES,
        runs: 0,
        done: false,
        results: [],
        runOne: (limit, opts) => refreshQuotes(env, limit, opts),
        remainingOf: result => Number(result?.remainingMissingQuote || 0) + Number(result?.remainingStaleQuotes || 0),
      },
      top: {
        status: 'running_top_batch',
        stage: 'top_batch',
        limit: SCHEDULED_TOP_LIMIT,
        maxStageMs: SCHEDULED_TOP_STAGE_MAX_MS,
        maxRuns: SCHEDULED_TOP_MAX_BATCHES,
        runs: 0,
        done: false,
        results: [],
        runOne: (limit, opts) => refreshTopStocks(env, limit, {
          ...opts,
          bulkSafe: false,
          fmpPriority: true,
          skipSlowFinancialFallback: true,
          skipSecondaryFinancialSources: true,
          skipSlowRatioSources: true,
          lightweightRatios: false,
          incompleteOnly: true,
        }),
        remainingOf: result => Number(result?.remainingTop || 0),
      },
      rest: {
        status: 'running_rest_batch',
        stage: 'rest_batch',
        limit: SCHEDULED_REST_LIMIT,
        maxStageMs: SCHEDULED_REST_STAGE_MAX_MS,
        maxRuns: SCHEDULED_REST_MAX_BATCHES,
        runs: 0,
        done: SCHEDULED_REST_LIMIT <= 0,
        results: [],
        runOne: (limit, opts) => refreshStaleStocks(env, limit, !!(Number(summarizeState('top')?.selected || 0) > 0 || Number(summarizeState('top')?.remaining || 0) > 0), {
          ...opts,
          bulkSafe: false,
          fmpPriority: true,
          skipSlowFinancialFallback: true,
          skipSecondaryFinancialSources: true,
          skipSlowRatioSources: true,
          lightweightRatios: false,
          coreRatioQuota: SCHEDULED_CORE_RATIO_LIMIT,
          richCoreRatioQuota: SCHEDULED_RICH_CORE_RATIO_LIMIT,
          incompleteOnly: true,
        }),
        remainingOf: result => Number(result?.remaining || 0),
      },
    }
    const summarizeState = key => summarizeRefreshResult(aggregateRefreshResults(stageState[key].results))
    const runStageOnce = async (key, round) => {
      const state = stageState[key]
      if (!state || state.done || state.runs >= state.maxRuns || !hasTimeForStage(SCHEDULED_FINALIZE_BUFFER_MS)) return false
      const stageDeadlineMs = Math.min(
        deadlineMs - SCHEDULED_FINALIZE_BUFFER_MS,
        Date.now() + Math.max(10_000, Number(state.maxStageMs) || 0)
      )
      await writeRunningMeta(state.status, {
        stage: state.stage,
        round: round + 1,
        batch: state.runs + 1,
        completedBatches: state.runs,
        batchLimit: state.limit,
        stageMaxMs: state.maxStageMs,
        stageDeadlineAt: new Date(stageDeadlineMs).toISOString(),
        coverage: {
          before: coverageBefore,
          current: coverageSnapshot,
        },
        quotes: summarizeState('quotes'),
        top: summarizeState('top'),
        rest: summarizeState('rest'),
      })
      const result = await state.runOne(state.limit, { deadlineMs: stageDeadlineMs })
      state.results.push(result)
      state.runs++
      if (result?.coverage) coverageSnapshot = result.coverage
      if (key === 'quotes' && result?.coverage) coverageAfterQuotes = result.coverage
      lastStageRun = state.stage
      const remaining = state.remainingOf(result)
      const selected = Number(result?.selected || 0)
      if (result?.skipped || result?.stoppedByDeadline || selected <= 0 || remaining <= 0 || selected < state.limit) state.done = true
      return true
    }
    const roundLimit = Math.max(SCHEDULED_QUOTE_MAX_BATCHES, SCHEDULED_TOP_MAX_BATCHES, SCHEDULED_REST_MAX_BATCHES)
    for (let round = 0; round < roundLimit && hasTimeForStage(SCHEDULED_FINALIZE_BUFFER_MS); round++) {
      let ranSomething = false
      ranSomething = (await runStageOnce('quotes', round)) || ranSomething
      ranSomething = (await runStageOnce('top', round)) || ranSomething
      ranSomething = (await runStageOnce('rest', round)) || ranSomething
      if (!ranSomething) break
    }
    const quotes = aggregateRefreshResults(stageState.quotes.results) || { ok: true, selected: 0, processed: 0, skipped: 'quote_batch_no_work' }
    const top = aggregateRefreshResults(stageState.top.results) || { ok: true, selected: 0, processed: 0, skipped: 'top_batch_no_work' }
    const rest = aggregateRefreshResults(stageState.rest.results) || { ok: true, selected: 0, processed: 0, skipped: 'rest_batch_no_work' }
    const coverageAfterFundamentals = coverageSnapshot
    const completedStage = lastStageRun || 'setup'
    const meta = {
      ts: new Date().toISOString(),
      startedAt,
      status: 'ok',
      completedStage,
      durationMs: Date.now() - startedMs,
      priority: 'cron_interleaved_quote_and_fundamentals',
      deadlineMs: SCHEDULED_MAX_RUNTIME_MS,
      heartbeatAt: new Date().toISOString(),
      coverage: {
        before: coverageBefore,
        afterQuoteBatch: coverageAfterQuotes,
        afterFundamentalBatch: coverageAfterFundamentals,
      },
      quotes: summarizeRefreshResult(quotes),
      top: summarizeRefreshResult(top),
      rest: summarizeRefreshResult(rest),
      apiStats: apiStatsSnapshot(env),
    }
    await dbMetaSet(env, 'last_scheduled_maintenance', meta).catch(() => {})
    return {
      ok: true,
      quotes,
      top,
      rest,
      apiStats: apiStatsSnapshot(env),
      coverage: {
        before: coverageBefore,
        afterQuoteBatch: coverageAfterQuotes,
        afterFundamentalBatch: coverageAfterFundamentals,
      }
    }
  } catch (e) {
    releaseStatus = 'error'
    const meta = {
      ts: new Date().toISOString(),
      startedAt,
      status: 'error',
      durationMs: Date.now() - startedMs,
      error: e?.message || String(e),
      apiStats: apiStatsSnapshot(env),
    }
    await dbMetaSet(env, 'last_scheduled_maintenance', meta).catch(() => {})
    throw e
  } finally {
    await releaseScheduledLock(env, releaseStatus).catch(() => {})
  }
}

function summarizeRefreshResult(result) {
  if (!result || typeof result !== 'object') return result || null
  return {
    ok: result.ok,
    selected: result.selected,
    processed: result.processed,
    repaired: result.repaired,
    returnsRepaired: result.returnsRepaired,
    financialsRepaired: result.financialsRepaired,
    ratiosRepaired: result.ratiosRepaired,
    pageFinancialsRepaired: result.pageFinancialsRepaired,
    pageRatiosRepaired: result.pageRatiosRepaired,
    stillIncomplete: result.stillIncomplete,
    noOverview: result.noOverview,
    errors: result.errors,
    remaining: result.remaining ?? result.remainingTop,
    saved: result.saved,
    saveErrors: result.saveErrors,
    batchWriteCount: result.batchWriteCount,
    avgBuildMs: result.avgBuildMs,
    stoppedByDeadline: result.stoppedByDeadline,
    coverage: result.coverage,
    apiStats: result.apiStats,
    slowTickers: result.slowTickers,
    incompleteTickers: result.incompleteTickers,
  }
}

function aggregateRefreshResults(results = []) {
  const list = results.filter(result => result && typeof result === 'object')
  if (!list.length) return null
  const totals = {
    ok: true,
    batchCount: list.length,
    selected: 0,
    processed: 0,
    repaired: 0,
    alreadyComplete: 0,
    stillIncomplete: 0,
    errors: 0,
    noOverview: 0,
    returnsRepaired: 0,
    financialsRepaired: 0,
    ratiosRepaired: 0,
    saved: 0,
    saveErrors: 0,
    batchWriteCount: 0,
    stoppedByDeadline: false,
    failedTickers: [],
    slowTickers: [],
    incompleteTickers: [],
  }
  let avgBuildMsWeighted = 0
  let avgBuildMsWeight = 0
  for (const result of list) {
    totals.ok = totals.ok && result.ok !== false
    totals.selected += Number(result.selected || 0)
    totals.processed += Number(result.processed || 0)
    totals.repaired += Number(result.repaired || 0)
    totals.alreadyComplete += Number(result.alreadyComplete || 0)
    totals.stillIncomplete += Number(result.stillIncomplete || 0)
    totals.errors += Number(result.errors || 0)
    totals.noOverview += Number(result.noOverview || 0)
    totals.returnsRepaired += Number(result.returnsRepaired || 0)
    totals.financialsRepaired += Number(result.financialsRepaired || 0)
    totals.ratiosRepaired += Number(result.ratiosRepaired || 0)
    totals.pageFinancialsRepaired += Number(result.pageFinancialsRepaired || 0)
    totals.pageRatiosRepaired += Number(result.pageRatiosRepaired || 0)
    totals.saved += Number(result.saved || 0)
    totals.saveErrors += Number(result.saveErrors || 0)
    totals.batchWriteCount += Number(result.batchWriteCount || 0)
    totals.stoppedByDeadline = totals.stoppedByDeadline || !!result.stoppedByDeadline
    totals.coverage = result.coverage || totals.coverage
    totals.apiStats = result.apiStats || totals.apiStats
    totals.limit = result.limit || totals.limit
    totals.quoteStaleDays = result.quoteStaleDays || totals.quoteStaleDays
    totals.topPriorityCount = result.topPriorityCount || totals.topPriorityCount
    totals.topPriorityFinancialStaleDays = result.topPriorityFinancialStaleDays || totals.topPriorityFinancialStaleDays
    totals.staleDays = result.staleDays || totals.staleDays
    totals.missingRetryHours = result.missingRetryHours || totals.missingRetryHours
    totals.remaining = result.remaining ?? result.remainingTop ?? totals.remaining
    totals.remainingTop = result.remainingTop ?? totals.remainingTop
    totals.remainingMissingQuote = result.remainingMissingQuote ?? totals.remainingMissingQuote
    totals.remainingStaleQuotes = result.remainingStaleQuotes ?? totals.remainingStaleQuotes
    totals.remainingMissingQuoteCoolingDown = result.remainingMissingQuoteCoolingDown ?? totals.remainingMissingQuoteCoolingDown
    if (result.skipped) totals.skipped = result.skipped
    if (Array.isArray(result.failedTickers) && result.failedTickers.length) {
      totals.failedTickers.push(...result.failedTickers)
      if (totals.failedTickers.length > 25) totals.failedTickers = totals.failedTickers.slice(0, 25)
    }
    if (Array.isArray(result.slowTickers) && result.slowTickers.length) {
      totals.slowTickers.push(...result.slowTickers)
      if (totals.slowTickers.length > 12) totals.slowTickers = totals.slowTickers.slice(0, 12)
    }
    if (Array.isArray(result.incompleteTickers) && result.incompleteTickers.length) {
      totals.incompleteTickers.push(...result.incompleteTickers)
      if (totals.incompleteTickers.length > 12) totals.incompleteTickers = totals.incompleteTickers.slice(0, 12)
    }
    const processed = Number(result.processed || 0)
    const avgBuildMs = Number(result.avgBuildMs || 0)
    if (processed > 0 && avgBuildMs > 0) {
      avgBuildMsWeighted += processed * avgBuildMs
      avgBuildMsWeight += processed
    }
  }
  if (avgBuildMsWeight > 0) totals.avgBuildMs = Math.round(avgBuildMsWeighted / avgBuildMsWeight)
  return totals
}

// ──────────────────────────────────────────────────────────────────────────
// Data getters with caching
// ──────────────────────────────────────────────────────────────────────────
async function getOverview(ticker, env, opts = {}) {
  const allowLive = opts.allowLive === true
  const fromDb = await dbGetStockSection(env, ticker, 'overview')
  if (fromDb) return fromDb
  if (!allowLive) return { error: 'Overview unavailable in DB', ticker }
  const cached = await kvGet(`stock:${ticker}:overview`, env)
  if (cached) {
    await dbSaveStockSection(env, ticker, 'overview', cached).catch(() => {})
    return cached
  }
  const data = await getOrBuildStockData(ticker, env)
  return data.overview || { error: 'Data unavailable', ticker }
}
async function getFinancials(ticker, env, opts = {}) {
  const allowLive = opts.allowLive === true
  const fromDb = await dbGetStockSection(env, ticker, 'financials')
  if (fromDb && (hasStockPageFinancialCoverage(fromDb) || (!allowLive && hasUsefulFinancials(fromDb)))) return fromDb
  const cached = await kvGet(`stock:${ticker}:financials`, env)
  if (hasStockPageFinancialCoverage(cached) || (!allowLive && hasUsefulFinancials(cached))) {
    await dbSaveStockSection(env, ticker, 'financials', cached).catch(() => {})
    return cached
  }
  const partial = fromDb || cached
  if (!allowLive) {
    if (partial) return partial
    return { error: 'Financial data unavailable in DB', ticker }
  }
  const data = await getOrBuildStockData(ticker, env, true)
  return data.financials || partial || { error: 'Financial data unavailable' }
}
async function getRatios(ticker, env, opts = {}) {
  const allowLive = opts.allowLive === true
  const fromDb = await dbGetStockSection(env, ticker, 'ratios')
  if (fromDb && hasStockPageRatioCoverage(fromDb)) return fromDb
  const cached = await kvGet(`stock:${ticker}:ratios`, env)
  if (hasUsefulRatios(cached) && hasStockPageRatioCoverage(cached)) {
    await dbSaveStockSection(env, ticker, 'ratios', cached).catch(() => {})
    return cached
  }
  const partial = (fromDb || cached) ? mergeDefined(fromDb || {}, cached || {}) : null
  if (!allowLive) {
    if (partial) return partial
    return { error: 'Ratios unavailable in DB', ticker }
  }
  const data = await getOrBuildStockData(ticker, env, true)
  return data.ratios || partial || { error: 'Ratios unavailable' }
}
async function getShareholders(ticker, env, opts = {}) {
  const allowLive = opts.allowLive === true
  const fromDb = await dbGetStockSection(env, ticker, 'shareholders')
  if (fromDb?.institutional?.length || fromDb?.ownership?.length) return fromDb
  if (!allowLive) return fromDb || { institutional: [], insiders: [], ownership: [], source: 'db_unavailable' }
  const cacheKey = `stock:${ticker}:shareholders`
  const cached = await kvGet(cacheKey, env)
  if (cached?.institutional?.length || cached?.ownership?.length) {
    await dbSaveStockSection(env, ticker, 'shareholders', cached).catch(() => {})
    return cached
  }
  const [institutional, fmpSummary, yahoo, fhInst] = await Promise.all([
    fmpInstitutional(ticker, env).catch(() => []),
    fmpOwnershipSummary(ticker, env).catch(() => null),
    yahooHolders(ticker).catch(() => null),
    finnhubOwnership(ticker, env).catch(() => []),
  ])
  const mh = yahoo?.majorHoldersBreakdown || {}
  const ih = yahoo?.insiderHolders?.holders || []
  const yInst = yahoo?.institutionOwnership?.ownershipList || []
  const yFund = yahoo?.fundOwnership?.ownershipList || []
  const ownership = [
    raw(mh.insidersPercentHeld) != null ? { label: 'Insiders Held', value: pct(raw(mh.insidersPercentHeld)), source: 'yahoo' } : null,
    raw(mh.institutionsPercentHeld) != null ? { label: 'Institutions Held', value: pct(raw(mh.institutionsPercentHeld)), source: 'yahoo' } : null,
    raw(mh.institutionsFloatPercentHeld) != null ? { label: 'Institutions Float Held', value: pct(raw(mh.institutionsFloatPercentHeld)), source: 'yahoo' } : null,
    raw(mh.heldPercentInstitutions) != null ? { label: 'Held By Institutions', value: pct(raw(mh.heldPercentInstitutions)), source: 'yahoo' } : null,
    raw(mh.heldPercentInsiders) != null ? { label: 'Held By Insiders', value: pct(raw(mh.heldPercentInsiders)), source: 'yahoo' } : null,
    fmpSummary?.institutionalOwnershipPct != null ? { label: 'Institutional Ownership', value: fmpSummary.institutionalOwnershipPct, source: fmpSummary.source } : null,
    fmpSummary?.holders != null ? { label: 'Institutional Investors', value: fmpSummary.holders, isCount: true, source: fmpSummary.source } : null,
  ].filter(Boolean)
  const instRows = institutional.length ? institutional : (fhInst.length ? fhInst : (yInst.length ? yInst : yFund))
  const result = {
    institutional: instRows.slice(0, 25).map(normalizeHolder).filter(h => h.name || h.shares),
    insiders: ih.slice(0, 20).map(h => ({
      name: h.name,
      relation: h.relation,
      shares: raw(h.positionDirect) || raw(h.positionIndirect) || null,
      latestTransDate: h.latestTransDate?.fmt || h.latestTransDate || null,
    })),
    ownership,
    source: [institutional.length ? 'fmp' : null, fhInst.length ? 'finnhub' : null, yInst.length || yFund.length || ownership.length || ih.length ? 'yahoo' : null, fmpSummary ? 'fmp_v4' : null].filter(Boolean).join('+') || 'unavailable',
    counts: { fmp: institutional.length, finnhub: fhInst.length, yahooInstitutional: yInst.length, yahooFunds: yFund.length, yahooInsiders: ih.length, ownership: ownership.length },
    updatedAt: new Date().toISOString(),
  }
  if (result.institutional.length || result.ownership.length || result.insiders.length) {
    await kvSet(cacheKey, result, env, 86400)
    await dbSaveStockSection(env, ticker, 'shareholders', result).catch(() => {})
  }
  return result
}

async function getNews(ticker, env, opts = {}) {
  const allowLive = opts.allowLive === true
  const fromDb = await dbGetStockSection(env, ticker, 'news')
  if (fromDb?.news?.length) return fromDb
  if (!allowLive) return { news: [], source: 'db_unavailable' }
  const result = await memCached(`news_${ticker}`, async () => {
    try {
      const d = await yf(`/v1/finance/search`, { q: ticker, newsCount: 12, quotesCount: 0 })
      const news = d?.news || []
      if (news.length) return {
        news: news.map(item => ({
          title: item.title, url: item.link, source: item.publisher,
          publishedDate: new Date(item.providerPublishTime * 1000).toISOString(),
          image: item.thumbnail?.resolutions?.[0]?.url || null, text: null
        })),
        source: 'yahoo'
      }
    } catch {}
    try { const news = await finnhubNews(ticker, env); if (news.length) return { news, source: 'finnhub' } } catch {}
    return { news: [], source: 'unavailable' }
  }, 15 * 60 * 1000)
  if (result?.news?.length) await dbSaveStockSection(env, ticker, 'news', result).catch(() => {})
  return result
}

async function getChart(ticker, env, period, opts = {}) {
  const allowLive = opts.allowLive === true
  const rawPeriod = String(period || '1Y').toUpperCase().replace(/\s+/g, '');
  const normalized = ({ '1MONTH':'1M', '1MONTHS':'1M', '1MO':'1M', '3MONTH':'3M', '3MONTHS':'3M', '3MO':'3M', '6MONTH':'6M', '6MONTHS':'6M', '6MO':'6M', '1YEAR':'1Y', '1YEARS':'1Y', '1YR':'1Y', '3YEAR':'3Y', '3YEARS':'3Y', '3YR':'3Y', '5YEAR':'5Y', '5YEARS':'5Y', '5YR':'5Y', '10YEAR':'10Y', '10YEARS':'10Y', '10YR':'10Y' }[rawPeriod] || rawPeriod)
  const fromDb = await dbGetStockSection(env, ticker, 'chart')
  if (fromDb?.version === CHART_CACHE_VERSION && fromDb?.periods?.[normalized]?.prices?.length) return fromDb.periods[normalized]
  if (!allowLive) return { labels: [], prices: [], source: 'db_unavailable', period: normalized }
  return memCached(`ch_${ticker}_${normalized}`, async () => {
    const rm = { '1M':'1mo','3M':'3mo','6M':'6mo','YTD':'ytd','1Y':'1y','3Y':'3y','5Y':'5y','10Y':'10y','MAX':'max' }
    const im = { '1M':'1d','3M':'1d','6M':'1d','YTD':'1d','1Y':'1d','3Y':'1wk','5Y':'1mo','10Y':'1mo','MAX':'1mo' }
    const d = await yf(`/v8/finance/chart/${ticker}`, { range: rm[normalized] || '1y', interval: im[normalized] || '1d' })
    const res = d?.chart?.result?.[0]
    const ts = res?.timestamp || []
    const adj = res?.indicators?.adjclose?.[0]?.adjclose || []
    const cls = res?.indicators?.quote?.[0]?.close || []
    if (!ts.length) throw new Error('No chart data')
    const useAdjusted = Array.isArray(adj) && adj.some(v => n(v) != null)
    const pairs = ts.map((t, idx) => ({
      label: new Date(t * 1000).toISOString().slice(0, 10),
      price: r2(n((useAdjusted ? adj : cls)[idx])),
    })).filter(point => point.price != null)
    if (!pairs.length) throw new Error('No chart prices')
    const result = {
      labels: pairs.map(point => point.label),
      prices: pairs.map(point => point.price),
      previousClose: r2(first(res?.meta?.chartPreviousClose, res?.meta?.previousClose)),
      period: normalized,
      seriesLabel: useAdjusted ? 'Adjusted close' : 'Close price',
      source: 'api',
      updatedAt: new Date().toISOString()
    }
    const existing = (fromDb?.version === CHART_CACHE_VERSION && fromDb?.periods) ? fromDb : { periods: {} }
    existing.version = CHART_CACHE_VERSION
    existing.periods[normalized] = result
    existing.updatedAt = result.updatedAt
    await dbSaveStockSection(env, ticker, 'chart', existing).catch(() => {})
    return result
  }, 60 * 60 * 1000)
}

async function getPeers(ticker, env, opts = {}) {
  return memCached(`pe_${ticker}`, async () => {
    const MAP = {
      AAPL:['MSFT','GOOGL','META','AMZN','NVDA'], MSFT:['AAPL','GOOGL','AMZN','ORCL','CRM'],
      GOOGL:['META','MSFT','AAPL','AMZN','NFLX'], AMZN:['MSFT','GOOGL','AAPL','WMT','COST'],
      NVDA:['AMD','INTC','AVGO','QCOM','TXN'], META:['GOOGL','SNAP','NFLX','DIS','AMZN'],
      TSLA:['F','GM','RIVN','NIO','TM'], JPM:['BAC','GS','MS','WFC','C'],
      V:['MA','PYPL','AXP','XYZ','FIS'], NFLX:['DIS','PARA','WBD','AMZN','AAPL'],
      AMD:['NVDA','INTC','QCOM','AVGO','TXN'], KO:['PEP','MDLZ','GIS','HSY','CPB'],
      JNJ:['PFE','MRK','ABBV','BMY','LLY'], BAC:['JPM','GS','MS','WFC','C']
    }
    const dynamicPeers = await fmpStockPeers(ticker, env).catch(() => [])
    const list = dynamicPeers.length ? dynamicPeers : (MAP[ticker] || ['AAPL','MSFT','GOOGL','AMZN','META'])
    const results = await Promise.all(list.slice(0, 5).map(async t => {
      try {
        const ov = await getOverview(t, env, { ...opts, allowLive: true })
        if (!ov || ov.error) return null
        return { ticker: t, name: ov.name, exchange: ov.exchange, price: ov.price, changePct: ov.changePct, pe: ov.pe, mktCap: ov.mktCap, dividendYield: ov.dividendYield || 0, roce: null }
      } catch { return null }
    }))
    return { peers: results.filter(Boolean) }
  }, 60 * 60 * 1000)
}

// ──────────────────────────────────────────────────────────────────────────
// Screener (Yahoo-backed)
// ──────────────────────────────────────────────────────────────────────────
const SCREEN_FILTERS = {
  marketCap: { col: 'mkt_cap', scale: 1 },
  mktCap: { col: 'mkt_cap', scale: 1 },
  price: { col: 'price', scale: 1 },
  currentPrice: { col: 'price', scale: 1 },
  pe: { col: 'pe', scale: 1 },
  pb: { col: 'pb', scale: 1 },
  ps: { col: 'ps', scale: 1 },
  roe: { col: 'roe', scale: 1 },
  roa: { col: 'roa', scale: 1 },
  roce: { col: 'roce', scale: 1 },
  netMargin: { col: 'net_margin', scale: 1 },
  dividendYield: { col: 'dividend_yield', scale: 1 },
  debtToEquity: { col: 'debt_to_equity', scale: 1 },
}
const SCREEN_SORTS = {
  marketCap: 'mkt_cap',
  mktCap: 'mkt_cap',
  intradaymarketcap: 'mkt_cap',
  price: 'price',
  currentPrice: 'price',
  pe: 'pe',
  pb: 'pb',
  ps: 'ps',
  roe: 'roe',
  roa: 'roa',
  roce: 'roce',
  netMargin: 'net_margin',
  dividendYield: 'dividend_yield',
  debtToEquity: 'debt_to_equity',
  changePct: 'change_pct',
}
const SCREENER_SORT_FIELD_ALIASES = {
  marketCap: 'mktCap',
  price: 'currentPrice',
}
function sortScreenerRows(rows = [], sort = {}) {
  const dir = sort?.dir === 'asc' ? 1 : -1
  const field = SCREENER_SORT_FIELD_ALIASES[sort?.field] || sort?.field || 'mktCap'
  return [...rows].sort((a, b) => {
    const av = a?.[field]
    const bv = b?.[field]
    const aMissing = av == null || av === '' || (typeof av === 'number' && !isFinite(av))
    const bMissing = bv == null || bv === '' || (typeof bv === 'number' && !isFinite(bv))
    if (aMissing !== bMissing) return aMissing ? 1 : -1
    const an = Number(av)
    const bn = Number(bv)
    const aNum = Number.isFinite(an)
    const bNum = Number.isFinite(bn)
    if (aNum && bNum && an !== bn) return (an - bn) * dir
    const cmp = String(av ?? '').localeCompare(String(bv ?? ''))
    if (cmp !== 0) return cmp * dir
    return String(a?.ticker || '').localeCompare(String(b?.ticker || ''))
  })
}

function buildDbWhere(filters = {}) {
  const where = [
    `ticker IN (SELECT ticker FROM stock_universe WHERE is_active=1)`,
    `name IS NOT NULL AND name<>''`,
    `exchange IS NOT NULL AND exchange<>''`,
    `price IS NOT NULL AND price > 0`,
    `mkt_cap IS NOT NULL AND mkt_cap > 0`,
  ]
  const params = []
  for (const [key, cfg] of Object.entries(SCREEN_FILTERS)) {
    const f = filters[key]
    if (!f) continue
    if (f.min != null && f.min !== '') {
      const v = n(f.min)
      if (v == null) continue
      where.push(`${cfg.col} >= ?`)
      params.push(v * cfg.scale)
    }
    if (f.max != null && f.max !== '') {
      const v = n(f.max)
      if (v == null) continue
      where.push(`${cfg.col} <= ?`)
      params.push(v * cfg.scale)
    }
  }
  if (filters.sector?.eq) {
    where.push(`LOWER(sector) = LOWER(?)`)
    params.push(String(filters.sector.eq).trim())
  }
  if (filters.exchange?.eq) {
    where.push(`UPPER(exchange) = UPPER(?)`)
    params.push(String(filters.exchange.eq).trim())
  }
  return { where: where.join(' AND '), params }
}

const lastVal = arr => Array.isArray(arr) ? [...arr].reverse().find(v => v != null && !isNaN(v) && isFinite(v)) ?? null : null
const prevVal = arr => {
  if (!Array.isArray(arr)) return null
  const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v))
  return vals.length >= 2 ? vals[vals.length - 2] : null
}
const lagVal = (arr, lag = 4) => Array.isArray(arr) && arr.length > lag ? (arr[arr.length - lag - 1] ?? null) : null
const pctChange = (now, old) => now != null && old ? r2(((now - old) / Math.abs(old)) * 100) : null
const positiveRounded = v => {
  const x = n(v)
  return x != null && isFinite(x) && x > 0 ? r2(x) : null
}
const nonZeroRounded = v => {
  const x = n(v)
  return x != null && isFinite(x) && x !== 0 ? r2(x) : null
}
const avgLast = (arr, count) => {
  if (!Array.isArray(arr)) return null
  const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v)).slice(-count)
  return vals.length ? r2(vals.reduce((a, b) => a + Number(b), 0) / vals.length) : null
}
const ratioOrNull = (num, den, scale = 1) => {
  const a = n(num)
  const b = n(den)
  return a != null && b != null && isFinite(a) && isFinite(b) && b !== 0 ? r2((a / b) * scale) : null
}
const annualizedReturnFromTotal = (totalPct, years) => {
  const total = n(totalPct)
  if (total == null || !isFinite(total) || years <= 0) return null
  const growth = 1 + (total / 100)
  return growth > 0 ? r2((Math.pow(growth, 1 / years) - 1) * 100) : null
}
const totalReturnFromCagr = (cagrPct, years) => {
  const rate = n(cagrPct)
  if (rate == null || !isFinite(rate) || years <= 0) return null
  const growth = Math.pow(1 + (rate / 100), years)
  return isFinite(growth) && growth > 0 ? r2((growth - 1) * 100) : null
}
const cagrLast = (arr, years) => {
  if (!Array.isArray(arr) || years <= 0) return null
  const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v))
  if (vals.length < years + 1) return null
  const start = vals[vals.length - years - 1]
  const end = vals[vals.length - 1]
  return start > 0 && end > 0 ? r2((Math.pow(end / start, 1 / years) - 1) * 100) : null
}
const roeSeriesFromFinancials = (annual = {}, balance = {}) => {
  const profit = Array.isArray(annual.netProfit) ? annual.netProfit : []
  const equity = Array.isArray(balance.reserves) ? balance.reserves : []
  return profit.map((np, i) => {
    const eq = equity[i]
    return eq && np != null && isFinite(eq) && eq !== 0 ? r2((np / eq) * 100) : null
  }).filter(v => v != null && isFinite(v))
}
function compareScreenValue(actual, op, expected) {
  if (actual == null || expected == null) return false
  if (op === '=') return actual === expected
  if (op === '!=') return actual !== expected
  if (op === '>') return actual > expected
  if (op === '>=') return actual >= expected
  if (op === '<') return actual < expected
  if (op === '<=') return actual <= expected
  return false
}
function screenerRowMatchesConditions(row, conditions = []) {
  if (!conditions.length) return true
  return conditions.every(cond => {
    const metric = cond?.metric
    const op = cond?.op
    if (!metric || !op) return true
    const actual = row?.[metric]
    if (metric === 'sector' || typeof cond.value === 'string') {
      const left = String(actual ?? '').trim().toLowerCase()
      const right = String(cond.value ?? '').trim().toLowerCase()
      return compareScreenValue(left, op, right)
    }
    const actualNum = n(actual)
    const expectedNum = n(cond.value)
    return compareScreenValue(actualNum, op, expectedNum)
  })
}
function enrichScreenerRow(row) {
  const directOverview = parseJson(row.overview)
  const directFinancials = parseJson(row.financials)
  const directRatios = parseJson(row.ratios)
  const all = (!directOverview || !directFinancials || !directRatios) ? (parseJson(row.all_data) || {}) : {}
  const ov = directOverview || all.overview || {}
  const fins = directFinancials || all.financials || {}
  const rt = directRatios || all.ratios || {}
  const annual = fins.annual || {}, qtr = fins.quarterly || {}, bal = fins.balance || {}, growth = fins.growth || {}
  const sales = lastVal(annual.sales)
  const profitAfterTax = lastVal(annual.netProfit)
  const salesLatestQuarter = lastVal(qtr.sales)
  const profitAfterTaxLatestQuarter = lastVal(qtr.netProfit)
  const debt = lastVal(bal.borrowings)
  const cash = lastVal(bal.cash)
  const currentAssets = lastVal(bal.currentAssets)
  const currentLiabilities = lastVal(bal.currentLiabilities)
  const inventory = lastVal(bal.inventory)
  const totalAssets = lastVal(bal.totalAssets)
  const totalLiabilities = lastVal(bal.totalLiabilities)
  const reserves = lastVal(bal.reserves)
  const opProfit = lastVal(annual.opProfit)
  const depreciation = lastVal(annual.depreciation)
  const interestExpense = Math.abs(lastVal(annual.interest) || 0) || null
  const marketCap = positiveOrNull(row.mkt_cap ?? ov.mktCap)
  const price = positiveOrNull(row.price ?? ov.price)
  const fcf = lastVal(fins.cashflow?.freeCashFlow)
  const roeSeries = growth.roe?.series || roeSeriesFromFinancials(annual, bal)
  const pe = row.pe ?? rt.pe ?? ov.pe
  const pb = row.pb ?? rt.pb ?? ov.pb
  const ps = row.ps ?? rt.ps ?? ov.ps
  const salesGrowth3y = growth.salesGrowth?.['3y'] ?? rt.salesGrowth3y ?? cagrLast(annual.sales, 3)
  const salesGrowth5y = rt.salesGrowth5y ?? growth.salesGrowth?.['5y'] ?? cagrLast(annual.sales, 5)
  const profitGrowth3y = growth.profitGrowth?.['3y'] ?? rt.profitGrowth3y ?? cagrLast(annual.netProfit, 3)
  const profitGrowth5y = rt.profitGrowth5y ?? growth.profitGrowth?.['5y'] ?? cagrLast(annual.netProfit, 5)
  const annualizedReturn = first(
    annualizedReturnFromTotal(rt.return1y, 1),
    annualizedReturnFromTotal(rt.return3y, 3),
    annualizedReturnFromTotal(rt.return5y, 5),
    annualizedReturnFromTotal(rt.return10y, 10),
    growth.stockCagr?.['1y'],
    growth.stockCagr?.['3y'],
    growth.stockCagr?.['5y'],
    growth.stockCagr?.['10y']
  )
  const netMargin = nonZeroRounded(row.net_margin ?? rt.netMargin ?? ov.netMargin ?? ratioOrNull(profitAfterTax, sales, 100))
  const roce = nonZeroRounded(row.roce ?? rt.roce ?? ratioOrNull(opProfit, (totalAssets != null && totalLiabilities != null) ? totalAssets - totalLiabilities : null, 100))
  const roa = nonZeroRounded(row.roa ?? rt.roa ?? ov.roa ?? ratioOrNull(profitAfterTax, totalAssets, 100))
  const roe = nonZeroRounded(row.roe ?? rt.roe ?? ov.roe ?? ratioOrNull(profitAfterTax, reserves, 100))
  const ev = marketCap != null && debt != null ? r2(marketCap + (debt * 1e6) - ((lastVal(bal.cash) || 0) * 1e6)) : null
  const enterpriseValue = rt.enterpriseValue ?? ev
  const ebitda = opProfit != null ? opProfit + (depreciation || 0) : null
  const interestCoverage = r2(rt.interestCoverage ?? ratioOrNull(opProfit, interestExpense))
  const stockCagr = growth.stockCagr || {}
  const pegGrowthBase = first(profitGrowth3y, salesGrowth3y, profitGrowth5y, salesGrowth5y)
  return {
    ticker: row.ticker,
    name: row.name || ov.name || row.ticker,
    exchange: row.exchange || ov.exchange || '—',
    sector: row.sector || ov.sector || '—',
    industry: row.industry || ov.industry || '—',
    price: r2(price),
    currentPrice: r2(price),
    changePct: r2(row.change_pct ?? ov.changePct),
    mktCap: marketCap,
    marketCap,
    sales,
    opm: lastVal(annual.opm) ?? rt.opMargin ?? ov.opMargin,
    grossMargin: nonZeroRounded(rt.grossMargin ?? ov.grossMargin),
    profitAfterTax,
    salesLatestQuarter,
    profitAfterTaxLatestQuarter,
    yoyQuarterlySalesGrowth: pctChange(salesLatestQuarter, lagVal(qtr.sales, 4)),
    yoyQuarterlyProfitGrowth: pctChange(profitAfterTaxLatestQuarter, lagVal(qtr.netProfit, 4)),
    pe: nonZeroRounded(pe),
    dividendYield: r2(row.dividend_yield ?? rt.dividendYield ?? ov.dividendYield),
    pb: nonZeroRounded(pb),
    netMargin,
    roce,
    roa,
    debtToEquity: r2(row.debt_to_equity ?? rt.debtToEquity ?? ov.debtToEquity),
    roe,
    eps: r2(ov.eps ?? lastVal(annual.eps)),
    debt,
    earningsYield: nonZeroRounded(rt.earningsYield ?? (pe ? 100 / pe : null)),
    salesGrowth: rt.salesGrowth ?? growth.salesGrowth?.ttm ?? pctChange(sales, prevVal(annual.sales)) ?? rt.salesGrowth3y,
    profitGrowth: rt.profitGrowth ?? growth.profitGrowth?.ttm ?? pctChange(profitAfterTax, prevVal(annual.netProfit)) ?? rt.profitGrowth3y,
    ps: nonZeroRounded(ps),
    priceToFreeCashFlow: rt.priceToFreeCashFlow ?? (marketCap != null && fcf ? r2(marketCap / (fcf * 1e6)) : null),
    evEbitda: nonZeroRounded(rt.evEbitda ?? (enterpriseValue != null && ebitda ? enterpriseValue / (ebitda * 1e6) : null)),
    evRevenue: nonZeroRounded(rt.evRevenue ?? (enterpriseValue != null && sales ? enterpriseValue / (sales * 1e6) : null)),
    enterpriseValue,
    currentRatio: r2(rt.currentRatio ?? ratioOrNull(currentAssets, currentLiabilities)),
    quickRatio: r2(rt.quickRatio ?? ratioOrNull(currentAssets != null && inventory != null ? currentAssets - inventory : null, currentLiabilities)),
    cashRatio: r2(rt.cashRatio ?? ratioOrNull(cash, currentLiabilities)),
    interestCoverage,
    peg: nonZeroRounded(rt.peg ?? (pe != null && pegGrowthBase != null && pegGrowthBase > 0 ? pe / pegGrowthBase : null)),
    return3m: r2(rt.return3m ?? (annualizedReturn != null ? totalReturnFromCagr(annualizedReturn, 0.25) : null)),
    return6m: r2(rt.return6m ?? (annualizedReturn != null ? totalReturnFromCagr(annualizedReturn, 0.5) : null)),
    salesGrowth3y,
    salesGrowth5y,
    profitGrowth3y,
    profitGrowth5y,
    avgRoe5y: rt.avgRoe5y ?? avgLast(roeSeries, 5) ?? growth.roe?.['5y'],
    avgRoe3y: rt.avgRoe3y ?? avgLast(roeSeries, 3) ?? growth.roe?.['3y'],
    return1y: r2(rt.return1y ?? totalReturnFromCagr(annualizedReturn, 1) ?? stockCagr['1y']),
    return3y: r2(rt.return3y ?? totalReturnFromCagr(stockCagr['3y'], 3) ?? totalReturnFromCagr(annualizedReturn, 3)),
    return5y: r2(rt.return5y ?? totalReturnFromCagr(stockCagr['5y'], 5) ?? totalReturnFromCagr(annualizedReturn, 5)),
    updatedAt: row.updated_at,
  }
}

async function runScreenerFromDB(filters, page, limit, sort, env, opts = {}) {
  if (!(await ensureDB(env))) return null
  const { where: screenableWhere, params: screenableParams } = buildDbWhere()
  const totalRows = await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_data WHERE ${screenableWhere}`, screenableParams)
  if (!totalRows?.count) {
    return {
      total: 0, page, source: 'd1',
      screenableUniverse: 0,
      results: [],
      error: 'Database is empty. Run /admin/refresh once to preload stock data.'
    }
  }
  const p = Math.max(1, Number(page) || 1)
  const lim = Math.min(Math.max(Number(limit) || 25, 1), 100)
  const { where, params } = buildDbWhere(filters)
  const sortCol = SCREEN_SORTS[sort?.field] || 'mkt_cap'
  const sortDir = sort?.dir === 'asc' ? 'ASC' : 'DESC'
  const conditions = Array.isArray(opts.conditions) ? opts.conditions : []
  const SCALAR_METRICS = new Set([
    'ticker','name','exchange','sector','industry',
    'price','currentPrice','changePct','mktCap','marketCap',
    'pe','pb','ps','roe','roa','roce','netMargin','debtToEquity','dividendYield','earningsYield'
  ])
  const needsHeavy = conditions.some(c => c?.metric && !SCALAR_METRICS.has(c.metric))
  const sortField = SCREENER_SORT_FIELD_ALIASES[sort?.field] || sort?.field || 'mktCap'
  const sortNeedsHeavy = !SCALAR_METRICS.has(sortField)
  const heavyLimit = 2000

  if (!needsHeavy && !sortNeedsHeavy) {
    const countRow = await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_data WHERE ${where}`, params).catch(() => null)
    const total = countRow?.count || 0
    const offset = (p - 1) * lim
    const rows = await dbAll(env, `SELECT ticker,name,exchange,sector,industry,price,change_pct,mkt_cap,pe,pb,ps,roe,roa,roce,net_margin,debt_to_equity,dividend_yield,overview,financials,ratios,all_data,updated_at
      FROM stock_data
      WHERE ${where}
      ORDER BY ${sortCol} IS NULL, ${sortCol} ${sortDir}, ticker ASC
      LIMIT ? OFFSET ?`, [...params, lim, offset]).catch(() => [])
    const results = rows.map(enrichScreenerRow)
    return {
      total,
      page: p,
      source: 'd1',
      screenableUniverse: totalRows.count,
      updatedAt: rows[0]?.updated_at || null,
      results,
    }
  }

  const rows = await dbAll(env, `SELECT ticker,name,exchange,sector,industry,price,change_pct,mkt_cap,pe,pb,ps,roe,roa,roce,net_margin,debt_to_equity,dividend_yield,overview,financials,ratios,all_data,updated_at
    FROM stock_data
    WHERE ${where}
    ORDER BY ticker ASC
    LIMIT ?`, [...params, heavyLimit]).catch(() => [])
  const enriched = rows.map(enrichScreenerRow)
  const filtered = conditions.length ? enriched.filter(row => screenerRowMatchesConditions(row, conditions)) : enriched
  const sorted = sortScreenerRows(filtered, sort)
  const offset = (p - 1) * lim
  return {
    total: sorted.length,
    page: p,
    source: 'd1',
    screenableUniverse: totalRows.count,
    updatedAt: rows[0]?.updated_at || null,
    truncated: rows.length >= heavyLimit ? heavyLimit : undefined,
    results: sorted.slice(offset, offset + lim)
  }
}

async function runScreener(filters, page, limit, sort, env, opts = {}) {
  const fromDb = await runScreenerFromDB(filters, page, limit, sort, env, opts).catch(e => {
    console.log('D1 screener failed:', e.message)
    return null
  })
  if (fromDb) return fromDb
  return { total: 0, page, source: 'd1', results: [], error: 'Screener unavailable from DB' }
}

// Custom screener that applies multiple AND conditions
// conditions = [{ metric: 'marketCap', op: '>', value: 500 }, { metric: 'pe', op: '<', value: 30 }]
async function runCustomScreener(conditions, page, limit, sort, env) {
  // Translate conditions to filter object
  const filters = {}
  const sectorMap = { 'Technology':'Technology','Tech':'Technology','Healthcare':'Healthcare','Health':'Healthcare','Finance':'Financials','Financial':'Financials','Energy':'Energy','Industrials':'Industrials','Consumer':'Consumer Cyclical','Real Estate':'Real Estate' }
  
  for (const cond of conditions) {
    const m = cond.metric, op = cond.op
    if (!m || !op) continue
    const bucket = filters[m] || (filters[m] = {})
    if (m === 'sector') {
      if (op === '=') bucket.eq = sectorMap[cond.value] || cond.value
      continue
    }
    if (m === 'exchange') {
      if (op === '=') bucket.eq = String(cond.value || '').trim().toUpperCase()
      continue
    }
    const v = Number(cond.value)
    if (isNaN(v)) continue
    if (op === '>' || op === '>=') bucket.min = v
    else if (op === '<' || op === '<=') bucket.max = v
    else if (op === '=') {
      bucket.min = v
      bucket.max = v
    }
  }
  
  return runScreener(filters, page, limit, sort, env, {
    conditions,
  })
}

async function searchStocks(query, env) {
  const q = String(query || '').trim()
  if (!q) return { results: [] }
  const normalized = q.replace(/\s+/g, ' ').trim()
  const term = `%${normalized}%`
  const upper = normalized.toUpperCase()
  const prefix = `${upper}%`
  const rows = await dbAll(env, `SELECT
      u.ticker,
      COALESCE(d.name, u.name) AS name,
      COALESCE(d.exchange, u.exchange) AS exchange
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker = u.ticker
    WHERE u.is_active = 1
      AND (
        u.ticker LIKE ?
        OR u.name LIKE ?
        OR COALESCE(d.name, '') LIKE ?
        OR COALESCE(d.name, u.name) LIKE ?
      )
    ORDER BY
      CASE WHEN u.ticker = ? THEN 0
           WHEN u.ticker LIKE ? THEN 1
           WHEN COALESCE(d.name, u.name) LIKE ? THEN 2
           WHEN u.name LIKE ? THEN 3
           ELSE 4 END,
      d.mkt_cap IS NULL,
      d.mkt_cap DESC,
      u.ticker ASC
    LIMIT 50`, [term, term, term, term, upper, prefix, `${normalized}%`, `${normalized}%`]).catch(() => [])
  return {
    results: rows.map(r => ({
      ticker: r.ticker,
      name: r.name || r.ticker,
      exchange: r.exchange || '—',
    })),
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Market data
// ──────────────────────────────────────────────────────────────────────────
async function getTrending(env) {
  return memCached('trending', async () => {
    const T = ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','JPM','V','AMD']
    const dbRows = await dbAll(env, `SELECT ticker,name,exchange,price,change_pct,mkt_cap,overview FROM stock_data WHERE ticker IN (${T.map(() => '?').join(',')})`, T).catch(() => [])
    const rowMap = new Map(dbRows.map(r => [r.ticker, r]))
    const r = await Promise.all(T.map(t =>
      yf(`/v8/finance/chart/${t}`, { interval: '1d', range: '1d' }).then(d => {
        const m = d?.chart?.result?.[0]?.meta || {}
        const price = r2(m.regularMarketPrice), prev = r2(m.chartPreviousClose)
        const row = rowMap.get(t) || {}
        const overview = parseJson(row.overview) || {}
        return {
          ticker: m.symbol || t,
          name: row.name || overview.name || m.longName || m.shortName || t,
          exchange: row.exchange || overview.exchange || m.exchangeName || '—',
          price: positiveOrNull(row.price) || price,
          change: price && prev ? r2(price - prev) : (positiveOrNull(row.price) && nonZeroFinite(row.change_pct) != null ? r2((row.price * row.change_pct) / (100 + row.change_pct)) : null),
          changePct: r2(row.change_pct ?? overview.changePct ?? (price && prev ? ((price - prev) / prev) * 100 : null)),
          mktCap: positiveOrNull(row.mkt_cap) || positiveOrNull(overview.mktCap),
        }
      }).catch(() => null)
    ))
    return { results: r.filter(Boolean) }
  }, 15 * 60 * 1000)
}
async function getIndices() {
  return memCached('indices', async () => {
    const T = ['^GSPC','^IXIC','^DJI','^RUT','^VIX'], N = ['S&P 500','NASDAQ','DOW JONES','RUSSELL 2K','VIX']
    const r = await Promise.all(T.map((t, i) =>
      yf(`/v8/finance/chart/${encodeURIComponent(t)}`, { interval: '1d', range: '1d' }).then(d => {
        const m = d?.chart?.result?.[0]?.meta || {}
        const price = r2(m.regularMarketPrice), prev = r2(m.chartPreviousClose)
        return {
          name: N[i], symbol: t, value: price,
          change: price && prev ? r2(price - prev) : null,
          changePct: price && prev ? r2(((price - prev) / prev) * 100) : null
        }
      }).catch(() => ({ name: N[i], symbol: t, value: null, change: null, changePct: null }))
    ))
    return { indices: r }
  }, 15 * 60 * 1000)
}
async function getRefreshDebug(env) {
  if (!(await ensureDB(env))) return { error: 'D1 not bound', version: DATA_VERSION }
  const coverage = await getUniverseCoverageCounts(env)
  const [
    universe,
    loaded,
    withFinancials,
    withRatios,
    withDebtToEquity,
    withMarketCap,
    withQuarterlyDetail,
    withPageFinancials,
    withPageRatios,
    stale,
    scheduledTopEligible,
    scheduledRestEligible,
    lastRefresh,
    lastTopRefresh,
    lastQuoteRefresh,
    lastScheduled,
    scheduledLock,
  ] = await Promise.all([
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe WHERE is_active=1`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.overview IS NOT NULL AND d.overview NOT IN ('', '{}', 'null')`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND ${STOCK_FINANCIAL_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.ratios IS NOT NULL AND d.ratios NOT IN ('', '{}', 'null')`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.debt_to_equity IS NOT NULL`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.price IS NOT NULL AND d.price > 0 AND d.mkt_cap IS NOT NULL AND d.mkt_cap > 0`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND ${STOCK_QUARTERLY_DETAIL_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND ${STOCK_PAGE_FINANCIAL_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND ${STOCK_PAGE_RATIO_READY_SQL}`).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count
      FROM stock_universe u
      LEFT JOIN stock_data d ON d.ticker=u.ticker
      LEFT JOIN (SELECT ticker FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0 ORDER BY mkt_cap DESC LIMIT ${TOP_PRIORITY_COUNT}) top ON top.ticker=u.ticker
      WHERE u.is_active=1
        AND (${STOCK_DEEP_STALE_SQL}
          OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => null),
    dbFirst(env, `WITH top AS (
        SELECT ticker, mkt_cap
        FROM stock_data
        WHERE mkt_cap IS NOT NULL AND mkt_cap > 0
        ORDER BY mkt_cap DESC
        LIMIT ${TOP_PRIORITY_COUNT}
      ),
      bootstrap(ticker, rank) AS (
        VALUES ${bootstrapTopValuesSql(TOP_PRIORITY_COUNT)}
      )
      SELECT COUNT(*) AS count
      FROM stock_universe u
      LEFT JOIN top ON top.ticker=u.ticker
      LEFT JOIN bootstrap ON bootstrap.ticker=u.ticker
      LEFT JOIN stock_data d ON d.ticker=u.ticker
      WHERE u.is_active=1
        AND (top.ticker IS NOT NULL OR bootstrap.ticker IS NOT NULL)
        AND (${STOCK_DEEP_STALE_SQL}
          OR ${STOCK_TOP_FINANCIAL_STALE_SQL})`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => null),
    dbFirst(env, `SELECT COUNT(*) AS count
      FROM stock_universe u
      LEFT JOIN stock_data d ON d.ticker=u.ticker
      LEFT JOIN (SELECT ticker FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0 ORDER BY mkt_cap DESC LIMIT ${TOP_PRIORITY_COUNT}) top ON top.ticker=u.ticker
      WHERE u.is_active=1
        AND (${STOCK_DEEP_STALE_SQL}
          OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))
        AND top.ticker IS NULL`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => null),
    dbMetaGet(env, 'last_refresh'),
    dbMetaGet(env, 'last_top_refresh'),
    dbMetaGet(env, 'last_quote_refresh'),
    dbMetaGet(env, 'last_scheduled_maintenance'),
    dbMetaGet(env, 'scheduled_refresh_lock'),
  ])
  const lockAgeMs = scheduledLock?.lockedAt ? Date.now() - new Date(scheduledLock.lockedAt).getTime() : null
  const candidates = await dbAll(env, `SELECT u.ticker, u.name, d.price, d.mkt_cap, d.pe, d.pb, d.ps, d.roe, d.roa, d.roce, d.net_margin, d.debt_to_equity, d.financials_updated_at, d.financials_attempted_at, d.updated_at,
      CASE WHEN top.ticker IS NOT NULL THEN 1 ELSE 0 END AS top_priority
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN (SELECT ticker FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0 ORDER BY mkt_cap DESC LIMIT ${TOP_PRIORITY_COUNT}) top ON top.ticker=u.ticker
    WHERE u.is_active=1
      AND (${STOCK_DEEP_STALE_SQL}
        OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))
    ORDER BY
      CASE WHEN top.ticker IS NOT NULL THEN 0 ELSE 1 END,
      CASE WHEN d.ticker IS NOT NULL THEN 0 ELSE 1 END,
      ${STOCK_FINANCIAL_ATTEMPT_SQL} ASC,
      u.ticker ASC
    LIMIT 25`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => [])
  return {
    ok: true,
    version: DATA_VERSION,
    limits: {
      maxDeepRefreshLimit: MAX_DEEP_REFRESH_LIMIT,
      scheduledQuoteLimit: SCHEDULED_QUOTE_LIMIT,
      scheduledTopLimit: SCHEDULED_TOP_LIMIT,
      scheduledRestLimit: SCHEDULED_REST_LIMIT,
      scheduledRichCoreRatioLimit: SCHEDULED_RICH_CORE_RATIO_LIMIT,
      scheduledQuoteMaxBatches: SCHEDULED_QUOTE_MAX_BATCHES,
      scheduledTopMaxBatches: SCHEDULED_TOP_MAX_BATCHES,
      scheduledRestMaxBatches: SCHEDULED_REST_MAX_BATCHES,
      deepRefreshConcurrency: DEEP_REFRESH_CONCURRENCY,
      topRefreshConcurrency: TOP_REFRESH_CONCURRENCY,
      staleRule: `interleaved quote and fundamental batches; quotes/market cap refresh after ${QUOTE_STALE_DAYS} day; incomplete fundamentals retry after ${INCOMPLETE_FUNDAMENTAL_RETRY_DAYS} days; fundamentals and ratios age refresh after ${FUNDAMENTAL_STALE_DAYS} days; broad stock refresh after ${STOCK_STALE_DAYS} days`,
    },
    sources: {
      fmpPrimary: !!fmpKey(env),
      fmpKeyName: env.FMP_KEY ? 'FMP_KEY' : (env.FMP_API_KEY ? 'FMP_API_KEY' : null),
      fmpPlan: fmpPlanName(env),
      fmpPriorityMode: fmpPaidPriorityEnabled(env) ? 'paid_fast_repair' : 'fallback_only',
      alphaVantageFallback: !!env.AV_KEY,
      finnhubFallback: !!env.FINNHUB_KEY,
      polygonFallback: !!polygonKey(env),
    },
    counts: {
      activeUniverse: universe?.count || 0,
      totalStocks: coverage.totalStocks,
      loadedStocks: withMarketCap?.count || loaded?.count || 0,
      loadedOverviewStocks: loaded?.count || 0,
      screenableStocks: coverage.withCompleteData || 0,
      withQuoteBatchData: coverage.withQuoteBatchData,
      withCompleteData: coverage.withCompleteData,
      withFinancials: withFinancials?.count || 0,
      withRatios: withRatios?.count || 0,
      withDebtToEquity: withDebtToEquity?.count || 0,
      withMarketCap: withMarketCap?.count || 0,
      withQuarterlyDetail: withQuarterlyDetail?.count || 0,
      withPageFinancials: withPageFinancials?.count || 0,
      withPageRatios: withPageRatios?.count || 0,
      withStockPageData: coverage.withStockPageData || 0,
      deepStaleCandidates: stale?.count || 0,
      scheduledTopEligibleCandidates: scheduledTopEligible?.count || 0,
      scheduledRestEligibleCandidates: scheduledRestEligible?.count || 0,
    },
    lastScheduled,
    scheduledLock: scheduledLock ? {
      ...scheduledLock,
      ageMinutes: lockAgeMs == null ? null : Math.round(lockAgeMs / 60000),
      staleForThisVersion: scheduledLock.version !== DATA_VERSION || (lockAgeMs != null && lockAgeMs >= SCHEDULED_LOCK_MINUTES * 60_000),
    } : null,
    lastQuoteRefresh,
    lastTopRefresh,
    lastRefresh,
    nextDeepCandidates: candidates
  }
}

async function getStatus(env) {
  const lr = await dbMetaGet(env, 'last_refresh') || await kvGet('meta:last_refresh', env)
  const qr = await dbMetaGet(env, 'last_quote_refresh')
  const tl = await dbMetaGet(env, 'ticker_list') || await kvGet('meta:ticker_list', env)
  const coverage = env.SP_DB ? await getUniverseCoverageCounts(env).catch(() => null) : null
  const dbCount = env.SP_DB ? await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.overview IS NOT NULL AND d.overview NOT IN ('', '{}', 'null')`).catch(() => null) : null
  const marketCapCount = env.SP_DB ? await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe u JOIN stock_data d ON d.ticker=u.ticker WHERE u.is_active=1 AND d.price IS NOT NULL AND d.price > 0 AND d.mkt_cap IS NOT NULL AND d.mkt_cap > 0`).catch(() => null) : null
  const universeCount = env.SP_DB ? await dbFirst(env, `SELECT COUNT(*) AS count FROM stock_universe WHERE is_active=1`).catch(() => null) : null
  const staleCount = env.SP_DB ? await dbFirst(env, `SELECT COUNT(*) AS count
    FROM stock_universe u
    LEFT JOIN stock_data d ON d.ticker=u.ticker
    LEFT JOIN (SELECT ticker FROM stock_data WHERE mkt_cap IS NOT NULL AND mkt_cap > 0 ORDER BY mkt_cap DESC LIMIT ${TOP_PRIORITY_COUNT}) top ON top.ticker=u.ticker
    WHERE u.is_active=1
      AND (${STOCK_DEEP_STALE_SQL}
        OR (top.ticker IS NOT NULL AND ${STOCK_TOP_FINANCIAL_STALE_SQL}))`, [FUNDAMENTAL_STALE_DAYS, TOP_FINANCIAL_STALE_DAYS]).catch(() => null) : null
  return {
    lastRefresh: lr?.ts || 'Never',
    lastQuoteRefresh: qr?.ts || 'Never',
    totalTickers: coverage?.totalStocks || universeCount?.count || tl?.tickers?.length || 0,
    loadedTickers: coverage?.withQuoteBatchData || marketCapCount?.count || dbCount?.count || 0,
    loadedOverviewTickers: dbCount?.count || 0,
    screenableTickers: coverage?.withCompleteData || 0,
    stockPageReadyTickers: coverage?.withStockPageData || 0,
    marketCapTickers: coverage?.withQuoteBatchData || marketCapCount?.count || 0,
    completeDataTickers: coverage?.withCompleteData || 0,
    staleTickers: staleCount?.count || 0,
    staleDays: STOCK_STALE_DAYS,
    fundamentalStaleDays: FUNDAMENTAL_STALE_DAYS,
    incompleteFundamentalRetryDays: INCOMPLETE_FUNDAMENTAL_RETRY_DAYS,
    topPriorityCount: TOP_PRIORITY_COUNT,
    quoteStaleDays: QUOTE_STALE_DAYS,
    topPriorityFinancialStaleDays: TOP_FINANCIAL_STALE_DAYS,
    kvAvailable: !!env.SP_CACHE, d1Available: !!env.SP_DB,
    fmpAvailable: !!fmpKey(env), fmpPlan: fmpPlanName(env), avAvailable: !!env.AV_KEY, finnhubAvailable: !!env.FINNHUB_KEY,
    polygonAvailable: !!polygonKey(env),
    version: DATA_VERSION
  }
}

const ALL_TICKERS = [...new Set([
  // Mega caps & popular
  'AAPL','MSFT','GOOGL','GOOG','AMZN','META','TSLA','NVDA','BRK.B','V','JPM','JNJ','WMT','UNH','MA','PG','HD','DIS','BAC','XOM','ABBV','PFE','KO','PEP','CVX','LLY','COST','AVGO','TMO','MRK',
  // Technology
  'ORCL','CRM','ADBE','NFLX','INTC','AMD','QCOM','TXN','INTU','CSCO','IBM','AMAT','LRCX','KLAC','MRVL','FTNT','PANW','CRWD','ZS','DDOG','SNOW','PLTR','NOW','WDAY','ANET','MU','ADI','NXPI','CDNS','SNPS',
  // Internet & Software
  'SHOP','SPOT','UBER','ABNB','BKNG','EXPE','EBAY','PYPL','XYZ','COIN','RBLX','U','ROKU','PINS','SNAP','DASH','LYFT','Z','RDDT','DOCU','TEAM','MDB','OKTA','TTD','TWLO','NET','AKAM',
  // Healthcare & Pharma
  'ABT','DHR','BMY','AMGN','GILD','CVS','MDT','CI','ISRG','ZTS','SYK','BSX','ELV','HUM','REGN','VRTX','MRNA','BIIB','IDXX','DXCM','ALGN','ILMN','EW','BDX','BAX','A','HCA',
  // Financials
  'WFC','GS','MS','C','AXP','BLK','SCHW','COF','USB','PNC','TFC','ICE','CB','PGR','SPGI','MCO','AON','MMC','AFL','ALL','MET','PRU','AIG','TRV','FIS',
  // Consumer
  'NKE','MCD','SBUX','TGT','LOW','TJX','CMG','LULU','ROST','DLTR','DG','KHC','MDLZ','MNST','EL','PM','MO','KMB','GIS','HSY','CL','CPB','K','CAG','TAP','STZ','DEO',
  // Industrials & Energy
  'CAT','BA','HON','UPS','RTX','LMT','GE','MMM','DE','EMR','ETN','ITW','CSX','UNP','NSC','FDX','NOC','GD','WM','RSG','WCN','VRSK',
  'COP','SLB','EOG','MPC','PSX','VLO','OXY','FANG','DVN','HES','APA','KMI','OKE','WMB','ENB','TRP','ET','EPD','MPLX',
  // Other major
  'NEE','DUK','SO','D','EXC','AEP','XEL','SRE','WEC','ES','ED','PCG','AWK','PEG','ECL','SHW','APD','LIN','FCX','NEM','DOW','DD','PPG','NUE','STLD','RS','CF','MOS','CTVA',
  // REITs
  'AMT','PLD','CCI','EQIX','PSA','O','WELL','DLR','SBAC','SPG','EQR','AVB','VTR','ARE','WY',
  // Communications & Media
  'CMCSA','T','VZ','TMUS','CHTR','WBD','PARA','EA','TTWO','VRSN',
  // Consumer Cyclical
  'F','GM','RIVN','LCID','NIO','LI','XPEV','NCLH','CCL','RCL','MAR','HLT','MGM','WYNN','LVS','YUM','DPZ','QSR',
])]
