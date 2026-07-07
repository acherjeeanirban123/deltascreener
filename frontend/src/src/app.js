// v20260528-3
// ═══════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════
const API = (() => {
  const host = location.hostname || ''
  if (host === 'deltascreener.com' || host.endsWith('.deltascreener.com')) return 'https://api.deltascreener.com'
  return 'https://screenerpro1-api.acherjeeanirban.workers.dev'
})()
const GCID = '1062200569141-0vik7idoi4skecsh8dii6nksmg80afrv.apps.googleusercontent.com'
const SITE_ORIGIN = 'https://deltascreener.com'
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`
const DEFAULT_TWITTER_SITE = '@deltascreener'

// ═══════════════════════════════════════════════════════════════════════
// API CLIENT
// ═══════════════════════════════════════════════════════════════════════
export async function api(path, opts = {}) {
  opts.headers = opts.headers || {}
  opts.credentials = 'include'
  const res = await fetch(API + path, opts)
  let payload = null
  try { payload = await res.clone().json() } catch {}
  if (res.status === 401) {
    localStorage.removeItem('ds-user')
    throw new Error(payload?.error || 'Please sign in again.')
  }
  if (!res.ok) throw new Error(payload?.error || ('API ' + res.status))
  return payload ?? res.json()
}
export const apiJson = (path, body) => api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
export const apiDelete = (path, body) => api(path, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

// ═══════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════
export const auth = {
  user: () => { try { return JSON.parse(localStorage.getItem('ds-user') || 'null') } catch { return null } },
  set: ({ user }) => {
    localStorage.setItem('ds-user', JSON.stringify(user))
  },
  setGoogleCredential: credential => {
    if (credential) sessionStorage.setItem('ds-google-credential', credential)
  },
  googleCredential: () => sessionStorage.getItem('ds-google-credential') || '',
  clear: () => {
    localStorage.removeItem('ds-user')
    sessionStorage.removeItem('ds-google-credential')
  },
  signedIn: () => !!auth.user()
}

export async function handleGoogleCredential(resp) {
  try {
    auth.setGoogleCredential(resp.credential)
    const data = await apiJson('/auth/google', { credential: resp.credential })
    auth.set(data)
    render()
    syncUserData().finally(render)
  } catch (e) {
    alert('Login failed: ' + e.message)
  }
}

export async function refreshGoogleSession() {
  const credential = auth.googleCredential()
  if (!credential) return false
  try {
    const data = await apiJson('/auth/google', { credential })
    auth.set(data)
    return true
  } catch {
    auth.clear()
    return false
  }
}

export async function signOut() {
  try {
    if (auth.signedIn()) await apiJson('/auth/logout', {})
  } catch {}
  auth.clear()
  if (getRoutePath() === '/profile') navigate('/')
  render()
}

function renderGoogleButton() {
  const el = document.getElementById('google-signin')
  if (!el || !window.google?.accounts?.id) return
  if (!window.__dsGoogleInitDone) {
    google.accounts.id.initialize({ client_id: GCID, callback: handleGoogleCredential })
    window.__dsGoogleInitDone = true
  }
  if (el.dataset.rendered === '1') return
  el.innerHTML = ''
  google.accounts.id.renderButton(el, {
    theme: 'filled_blue',
    size: 'large',
    type: 'standard',
    shape: 'pill',
    text: 'signin_with'
  })
  el.dataset.rendered = '1'
}

function normalizeWatchItem(item = {}) {
  const ticker = String(item.ticker || '').trim().toUpperCase()
  if (!ticker) return null
  const cleanText = value => {
    const s = String(value ?? '').trim()
    return !s || s === '—' ? null : s
  }
  const cleanNumber = value => {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return {
    ticker,
    name: cleanText(item.name) || ticker,
    price: cleanNumber(item.price),
    exchange: cleanText(item.exchange),
    change: cleanNumber(item.change),
    changePct: cleanNumber(item.changePct ?? item.change_pct),
    addedAt: item.addedAt || item.added_at || Date.now(),
  }
}

function watchItemHasDetails(item = {}) {
  return !!(item.name && item.exchange && item.price != null && item.change != null && item.changePct != null)
}

function watchItemNeedsRemoteUpdate(localItem, remoteItem) {
  if (!localItem?.ticker) return false
  if (!remoteItem) return true
  return watchItemHasDetails(localItem) && !watchItemHasDetails(normalizeWatchItem(remoteItem) || {})
}

async function syncUserData() {
  if (!auth.signedIn()) return
  try {
    const localWatch = watchlist.get()
    const [wl, prefs] = await Promise.all([
      api('/user/watchlist').catch(() => ({ watchlist: [] })),
      api('/user/preferences').catch(() => ({ preferences: {} }))
    ])
    const remoteMap = new Map((wl.watchlist || []).map(item => {
      const normalized = normalizeWatchItem(item)
      return normalized ? [normalized.ticker, { ...item, ...normalized }] : null
    }).filter(Boolean))
    if (Array.isArray(localWatch) && localWatch.length) {
      await Promise.all(localWatch
        .map(normalizeWatchItem)
        .filter(item => item?.ticker && watchItemNeedsRemoteUpdate(item, remoteMap.get(item.ticker)))
        .map(item => apiJson('/user/watchlist', item).catch(() => null)))
    }
    const mergedWatch = new Map()
    ;[...(wl.watchlist || []).map(x => ({
      ticker: x.ticker, name: x.name, price: x.price, exchange: x.exchange, change: x.change, changePct: x.change_pct, addedAt: x.added_at
    })), ...localWatch].map(normalizeWatchItem).filter(Boolean).forEach(item => {
      const key = item.ticker
      mergedWatch.set(key, { ...mergedWatch.get(key), ...item, ticker: key })
    })
    localStorage.setItem('ds-watchlist', JSON.stringify(Array.from(mergedWatch.values())))
    const pref = prefs.preferences || {}
    if (Array.isArray(pref.screenerColumns) && pref.screenerColumns.length) localStorage.setItem('ds-screener-columns', JSON.stringify(pref.screenerColumns))
    if (typeof pref.screenerQuery === 'string' && pref.screenerQuery.trim()) sessionStorage.setItem('ds-query', pref.screenerQuery)
    if (typeof pref.screenerColumnsOpen === 'boolean') sessionStorage.setItem('ds-screener-columns-open', pref.screenerColumnsOpen ? '1' : '0')
  } catch {}
}

export async function validateSession() {
  try {
    const data = await api('/auth/me')
    if (data?.user) localStorage.setItem('ds-user', JSON.stringify(data.user))
    return !!data?.user
  } catch {
    auth.clear()
    return false
  }
}
function openSavedScreen(query) {
  sessionStorage.setItem('ds-query', query)
  sessionStorage.setItem('ds-screener-page', '1')
  navigate('/screener')
}
window.handleGoogleCredential = handleGoogleCredential
window.signOut = signOut
window.openSavedScreen = openSavedScreen

// ═══════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════
export const fmt = {
  num: v => v == null ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }),
  numFull: v => v == null ? '—' : Number(v).toLocaleString('en-US'),
  usd: v => v == null ? '—' : '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  pct: v => v == null ? '—' : (v > 0 ? '+' : '') + Number(v).toFixed(2) + '%',
  pctAbs: v => v == null ? '—' : Number(v).toFixed(2) + '%',
  compact: v => {
    if (v == null) return '—'
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) return '—'
    if (Math.abs(n) >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (Math.abs(n) >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B'
    if (Math.abs(n) >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M'
    return '$' + n.toFixed(0)
  },
  date: v => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
  pctClass: v => v == null ? '' : v >= 0 ? 'up' : 'dn',
}


const theme = {
  key: 'ds-theme',
  get: () => 'dark',
  apply() {
    localStorage.setItem(theme.key, 'dark')
    document.body.setAttribute('data-theme', 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')
    const googleSlot = document.getElementById('google-signin')
    if (googleSlot) {
      googleSlot.dataset.rendered = ''
      renderGoogleButton()
    }
  },
  toggle() {
    theme.apply()
  }
}
window.toggleTheme = () => theme.apply()

function renderBrandMark({ className = 'logo-icon', ariaLabel = 'DeltaScreener', decorative = true } = {}) {
  const labelAttrs = decorative
    ? 'alt="" aria-hidden="true"'
    : `alt="${escapeHtml(ariaLabel)}"`
  return `
    <img class="${className}" src="/logo-mark.png?v=20260622-favicon-1" width="832" height="830" decoding="async" ${labelAttrs} />
  `
}

function setupHeaderScrollState(headerEl) {
  if (!headerEl) return
  if (window.__dsHeaderScrollListener) {
    window.removeEventListener('scroll', window.__dsHeaderScrollListener)
  }
  const sync = () => {
    headerEl.classList.toggle('is-scrolled', window.scrollY > 18)
  }
  window.__dsHeaderScrollListener = sync
  window.addEventListener('scroll', sync, { passive: true })
  sync()
}

const TICKER_BRANDS = {
  AAPL: { domain: 'apple.com', letter: 'A', hue: 'ticker-logo-apple' },
  MSFT: { domain: 'microsoft.com', letter: 'M', hue: 'ticker-logo-microsoft' },
  NVDA: { domain: 'nvidia.com', letter: 'N', hue: 'ticker-logo-nvidia' },
  GOOGL: { domain: 'google.com', letter: 'G', hue: 'ticker-logo-google' },
  GOOG: { domain: 'google.com', letter: 'G', hue: 'ticker-logo-google' },
  AMZN: { domain: 'amazon.com', letter: 'A', hue: 'ticker-logo-amazon' },
  META: { domain: 'meta.com', letter: 'M', hue: 'ticker-logo-meta' },
  TSLA: { domain: 'tesla.com', letter: 'T', hue: 'ticker-logo-tesla' },
  JPM: { domain: 'jpmorganchase.com', letter: 'J', hue: 'ticker-logo-jpm' },
  V: { domain: 'visa.com', letter: 'V', hue: 'ticker-logo-visa' },
  AMD: { domain: 'amd.com', letter: 'A', hue: 'ticker-logo-amd' },
  'BRK.B': { domain: 'berkshirehathaway.com', letter: 'B', hue: 'ticker-logo-brk' },
  NFLX: { domain: 'netflix.com', letter: 'N', hue: 'ticker-logo-netflix' },
}

const HOME_FALLBACK_INDICES = [
  { name: 'S&P 500', symbol: '^GSPC', value: 5314.62, changePct: 0.84, change: 44.31 },
  { name: 'NASDAQ', symbol: '^IXIC', value: 16948.17, changePct: 1.19, change: 199.48 },
  { name: 'DOW JONES', symbol: '^DJI', value: 39182.55, changePct: -0.21, change: -84.02 },
  { name: 'RUSSELL 2K', symbol: '^RUT', value: 2091.44, changePct: 0.56, change: 11.72 },
]

const HOME_FALLBACK_TRENDING = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 1148.76, changePct: 2.44, change: 27.39 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', price: 468.19, changePct: 1.08, change: 5.02 },
  { ticker: 'AAPL', name: 'Apple Inc.', price: 214.55, changePct: 0.63, change: 1.34 },
  { ticker: 'META', name: 'Meta Platforms, Inc.', price: 507.11, changePct: 1.92, change: 9.55 },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: 189.44, changePct: -0.38, change: -0.72 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 198.07, changePct: 0.74, change: 1.45 },
]

function getTickerBrandMeta(ticker = '') {
  const normalizedTicker = String(ticker || '').trim().toUpperCase()
  const meta = TICKER_BRANDS[normalizedTicker] || {}
  return {
    domain: meta.domain || '',
    letter: meta.letter || normalizedTicker.slice(0, 1) || '•',
    hue: meta.hue || 'ticker-logo-default',
  }
}

function renderTickerAvatar(ticker, name = '') {
  const meta = getTickerBrandMeta(ticker)
  const favicon = meta.domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(meta.domain)}&sz=128`
    : ''
  return `
    <span class="ticker-logo ${meta.hue}" aria-hidden="true">
      <span class="ticker-logo-fallback">${escapeHtml(meta.letter)}</span>
      ${favicon ? `<img src="${favicon}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />` : ''}
    </span>
    <span class="trending-stock-meta">
      <strong>${escapeHtml(ticker)}</strong>
      <span>${escapeHtml(name || '')}</span>
    </span>
  `
}

function renderFeatureIcon(kind) {
  if (kind === 'screener') {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M7 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M10 18h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="16.5" cy="6" r="2.5" fill="currentColor" opacity=".18"/>
        <circle cx="8" cy="12" r="2.5" fill="currentColor" opacity=".18"/>
        <circle cx="13.5" cy="18" r="2.5" fill="currentColor" opacity=".18"/>
      </svg>
    `
  }
  if (kind === 'watchlist') {
    return `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v13.4l-6.5-3.6-6.5 3.6V6A1.5 1.5 0 0 1 7 4.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="m12 8.2 1.05 2.13 2.35.34-1.7 1.65.4 2.33L12 13.57l-2.1 1.1.4-2.33-1.7-1.65 2.35-.34L12 8.2Z" fill="currentColor" opacity=".2"/>
      </svg>
    `
  }
  return `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19.5V8.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 19.5V4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M19 19.5V11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="m5 14.5 7-6 7 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="8.5" r="2.2" fill="currentColor" opacity=".18"/>
    </svg>
  `
}

function renderHeroMiniIndices(indices = []) {
  const items = indices.length ? indices.slice(0, 3) : [
    { name: 'S&P 500', value: null, changePct: 0.84 },
    { name: 'NASDAQ', value: null, changePct: 1.19 },
    { name: 'DOW JONES', value: null, changePct: -0.21 },
  ]
  return items.map(item => `
    <div class="hero-mini-index ${fmt.pctClass(item.changePct)}">
      <span class="hero-mini-label">${escapeHtml(item.name)}</span>
      <strong>${item.value != null ? Number(item.value).toLocaleString('en-US', { maximumFractionDigits: 2 }) : 'Live feed'}</strong>
      <span class="hero-mini-change">${fmt.pct(item.changePct)}</span>
    </div>
  `).join('')
}

function renderHomeIndicesMarkup(indices = []) {
  return `
    <div class="indices-bar">
      ${indices.slice(0, 4).map(i => `
        <div class="idx-cell">
          <div class="idx-copy">
            <div class="idx-name">${escapeHtml(i.name)}</div>
            <div class="idx-val">${i.value ? Number(i.value).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}</div>
            <div class="idx-chg ${fmt.pctClass(i.changePct)}">${fmt.pct(i.changePct)}</div>
          </div>
          ${buildSparkline(i)}
        </div>
      `).join('')}
    </div>
  `
}

function renderHomeTrendingMarkup(results = []) {
  return `
    <div class="tbl-scroll">
      <table class="tbl">
        <thead>
          <tr>
            <th>Company</th><th>Price</th><th>Change %</th><th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(s => `
            <tr>
              <td data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" style="cursor:pointer">
                <a href="${routeHref(`/stock/${s.ticker}`)}" data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" class="stock-link trending-stock-link">
                  ${renderTickerAvatar(s.ticker, s.name || '')}
                </a>
              </td>
              <td>${fmt.usd(s.price)}</td>
              <td><span class="change-pill ${fmt.pctClass(s.changePct)}">${fmt.pct(s.changePct)}</span></td>
              <td class="change-text ${fmt.pctClass(s.change)}">${formatSignedUsdChange(s.change)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function formatSignedUsdChange(value) {
  if (value == null) return '—'
  const amount = Math.abs(Number(value))
  if (!Number.isFinite(amount)) return '—'
  return `${Number(value) >= 0 ? '+' : '-'}${fmt.usd(amount)}`
}

function animateNumericCounter(el) {
  if (!el) return
  const target = Number(el.dataset.target || 0)
  if (!Number.isFinite(target) || target <= 0) {
    el.textContent = '0'
    return
  }
  const start = performance.now()
  const duration = 1400
  const tick = now => {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = Math.floor(target * eased).toLocaleString('en-US')
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtmlText(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeMetaPath(path = '/') {
  const raw = String(path || '/').trim() || '/'
  if (raw === '/') return '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  return withSlash.replace(/\/+$/, '') || '/'
}

function absoluteRouteUrl(path = '/') {
  return `${SITE_ORIGIN}${normalizeMetaPath(path)}`
}

function formatSeoCurrency(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null
}

function formatSeoCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toFixed(0)}`
}

function formatSeoNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : null
}

function stockCanonicalPath(ticker) {
  return `/stock/${encodeURIComponent(String(ticker || '').trim().toUpperCase())}`
}

function buildStockSeoMeta(ticker, overview = {}, ratios = {}) {
  const normalizedTicker = String(ticker || '').trim().toUpperCase()
  const hasCompanyName = !!(overview?.name && overview.name.trim() && overview.name.trim().toUpperCase() !== normalizedTicker)
  const companyName = hasCompanyName ? overview.name.trim() : normalizedTicker
  const title = hasCompanyName
    ? `${companyName} (${normalizedTicker}) Stock Price, Financials & Ratios | DeltaScreener`
    : `${normalizedTicker} Stock Price, Financials & Ratios | DeltaScreener`
  const canonicalPath = stockCanonicalPath(normalizedTicker)
  const currentPrice = formatSeoCurrency(overview?.price)
  const pe = formatSeoNumber(ratios?.pe ?? overview?.pe)
  const marketCap = formatSeoCompact(overview?.mktCap)
  const exchange = overview?.exchange || 'NYSE/NASDAQ'
  const description = (currentPrice && pe && marketCap)
    ? `${companyName} (${normalizedTicker}) — ${currentPrice}, P/E ${pe}, Market Cap ${marketCap}. View 10-year financials, quarterly results, ratios, peers, and news.`
    : `${companyName} (${normalizedTicker}) stock price, financials, valuation ratios, quarterly results, peers, and news on DeltaScreener.`
  return {
    title,
    description: stripHtmlText(description).slice(0, 280),
    path: canonicalPath,
    canonical: absoluteRouteUrl(canonicalPath),
    ogTitle: title,
    ogDescription: stripHtmlText(description).slice(0, 280),
    ogUrl: absoluteRouteUrl(canonicalPath),
    keywords: [
      `${normalizedTicker} stock`,
      `${companyName} stock price`,
      `${companyName} financials`,
      `${companyName} ratios`,
      `${normalizedTicker} stock analysis`,
      'US stock screener',
    ].join(', '),
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${companyName} Stock Analysis`,
      description: stripHtmlText(description).slice(0, 280),
      url: absoluteRouteUrl(canonicalPath),
      about: {
        '@type': 'Corporation',
        name: companyName,
        tickerSymbol: normalizedTicker,
        exchange,
      }
    }
  }
}

const SEARCH_INDEX = [
  { ticker:'AAPL', name:'Apple Inc.', aliases:['apple'] },
  { ticker:'MSFT', name:'Microsoft Corporation', aliases:['microsoft','micro','windows'] },
  { ticker:'NVDA', name:'NVIDIA Corporation', aliases:['nvidia','gpu','ai chips'] },
  { ticker:'GOOGL', name:'Alphabet Inc. Class A', aliases:['google','alphabet'] },
  { ticker:'GOOG', name:'Alphabet Inc. Class C', aliases:['google','alphabet'] },
  { ticker:'AMZN', name:'Amazon.com, Inc.', aliases:['amazon'] },
  { ticker:'META', name:'Meta Platforms, Inc.', aliases:['meta','facebook','instagram','whatsapp'] },
  { ticker:'TSLA', name:'Tesla, Inc.', aliases:['tesla','elon'] },
  { ticker:'BRK.B', name:'Berkshire Hathaway Inc. Class B', aliases:['berkshire','buffett'] },
  { ticker:'AVGO', name:'Broadcom Inc.', aliases:['broadcom'] },
  { ticker:'NFLX', name:'Netflix, Inc.', aliases:['netflix'] },
  { ticker:'JPM', name:'JPMorgan Chase & Co.', aliases:['jpmorgan','chase'] },
  { ticker:'V', name:'Visa Inc.', aliases:['visa'] },
  { ticker:'MA', name:'Mastercard Incorporated', aliases:['mastercard'] },
  { ticker:'AMD', name:'Advanced Micro Devices, Inc.', aliases:['amd','advanced micro devices'] },
  { ticker:'ORCL', name:'Oracle Corporation', aliases:['oracle'] },
  { ticker:'CRM', name:'Salesforce, Inc.', aliases:['salesforce'] },
  { ticker:'ADBE', name:'Adobe Inc.', aliases:['adobe'] },
  { ticker:'COST', name:'Costco Wholesale Corporation', aliases:['costco'] },
  { ticker:'WMT', name:'Walmart Inc.', aliases:['walmart'] },
  { ticker:'PG', name:'Procter & Gamble Company', aliases:['procter gamble','p&g'] },
  { ticker:'JNJ', name:'Johnson & Johnson', aliases:['johnson and johnson'] },
  { ticker:'LLY', name:'Eli Lilly and Company', aliases:['eli lilly','lilly'] },
  { ticker:'ABBV', name:'AbbVie Inc.', aliases:['abbvie'] },
  { ticker:'UNH', name:'UnitedHealth Group Incorporated', aliases:['unitedhealth'] },
  { ticker:'HD', name:'Home Depot, Inc.', aliases:['home depot'] },
  { ticker:'MCD', name:"McDonald's Corporation", aliases:['mcdonalds','mcdonald'] },
  { ticker:'KO', name:'Coca-Cola Company', aliases:['coca cola','coke'] },
  { ticker:'PEP', name:'PepsiCo, Inc.', aliases:['pepsi'] },
  { ticker:'DIS', name:'Walt Disney Company', aliases:['disney'] },
  { ticker:'BAC', name:'Bank of America Corporation', aliases:['bank of america','bofa'] },
  { ticker:'XOM', name:'Exxon Mobil Corporation', aliases:['exxon','mobil'] },
  { ticker:'CVX', name:'Chevron Corporation', aliases:['chevron'] },
  { ticker:'PFE', name:'Pfizer Inc.', aliases:['pfizer'] },
  { ticker:'MRK', name:'Merck & Co., Inc.', aliases:['merck'] },
  { ticker:'TMO', name:'Thermo Fisher Scientific Inc.', aliases:['thermo fisher'] },
  { ticker:'LIN', name:'Linde plc', aliases:['linde'] },
  { ticker:'ACN', name:'Accenture plc', aliases:['accenture'] },
  { ticker:'IBM', name:'International Business Machines Corporation', aliases:['ibm'] },
  { ticker:'INTC', name:'Intel Corporation', aliases:['intel'] },
  { ticker:'QCOM', name:'QUALCOMM Incorporated', aliases:['qualcomm'] },
  { ticker:'CSCO', name:'Cisco Systems, Inc.', aliases:['cisco'] },
  { ticker:'TXN', name:'Texas Instruments Incorporated', aliases:['texas instruments'] },
  { ticker:'MU', name:'Micron Technology, Inc.', aliases:['micron'] },
  { ticker:'PLTR', name:'Palantir Technologies Inc.', aliases:['palantir'] },
  { ticker:'SHOP', name:'Shopify Inc.', aliases:['shopify'] },
  { ticker:'UBER', name:'Uber Technologies, Inc.', aliases:['uber'] },
  { ticker:'ABNB', name:'Airbnb, Inc.', aliases:['airbnb'] },
  { ticker:'PYPL', name:'PayPal Holdings, Inc.', aliases:['paypal'] },
  { ticker:'SQ', name:'Block, Inc.', aliases:['block','square'] },
  { ticker:'SNOW', name:'Snowflake Inc.', aliases:['snowflake'] },
  { ticker:'PANW', name:'Palo Alto Networks, Inc.', aliases:['palo alto'] },
  { ticker:'CRWD', name:'CrowdStrike Holdings, Inc.', aliases:['crowdstrike'] },
  { ticker:'NOW', name:'ServiceNow, Inc.', aliases:['servicenow'] },
  { ticker:'AMAT', name:'Applied Materials, Inc.', aliases:['applied materials'] },
  { ticker:'CAT', name:'Caterpillar Inc.', aliases:['caterpillar'] },
  { ticker:'GE', name:'GE Aerospace', aliases:['general electric','ge aerospace'] },
  { ticker:'BA', name:'Boeing Company', aliases:['boeing'] },
  { ticker:'GS', name:'Goldman Sachs Group, Inc.', aliases:['goldman sachs'] },
  { ticker:'MS', name:'Morgan Stanley', aliases:['morgan stanley'] },
  { ticker:'AXP', name:'American Express Company', aliases:['american express','amex'] },
  { ticker:'VZ', name:'Verizon Communications Inc.', aliases:['verizon'] },
  { ticker:'T', name:'AT&T Inc.', aliases:['att','at&t'] }
].map(item => ({ ...item, searchText: [item.ticker, item.name, ...(item.aliases || [])].join(' ').toLowerCase() }))

function normalizeSearchText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9. ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function getLocalSearchSuggestions(query) {
  const q = normalizeSearchText(query)
  if (!q) return []
  return SEARCH_INDEX
    .map(item => {
      const ticker = item.ticker.toLowerCase()
      const name = item.name.toLowerCase()
      const aliases = (item.aliases || []).map(normalizeSearchText)
      let score = -1
      if (ticker === q) score = 100
      else if (ticker.startsWith(q)) score = 95
      else if (name.startsWith(q)) score = 92
      else if (aliases.some(a => a.startsWith(q))) score = 90
      else if (name.includes(q)) score = 82
      else if (aliases.some(a => a.includes(q))) score = 78
      else if (item.searchText.includes(q)) score = 70
      return score < 0 ? null : { ...item, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.ticker.localeCompare(b.ticker))
    .slice(0, 20)
}

const SEARCH_SUGGESTION_CACHE = new Map()
let searchSuggestionSeq = 0

async function getSearchSuggestions(query) {
  const q = String(query || '').trim()
  if (!q) return []
  const cacheKey = q.toUpperCase()
  if (SEARCH_SUGGESTION_CACHE.has(cacheKey)) return SEARCH_SUGGESTION_CACHE.get(cacheKey)
  try {
    const data = await api(`/search?q=${encodeURIComponent(q)}`)
    const remote = Array.isArray(data?.results) ? data.results.map(item => ({
      ticker: item.ticker,
      name: item.name || item.ticker,
      exchange: item.exchange || '—',
      aliases: [],
      searchText: normalizeSearchText([item.ticker, item.name, item.exchange].join(' ')),
      score: 100,
    })) : []
    SEARCH_SUGGESTION_CACHE.set(cacheKey, remote)
    return remote
  } catch {
    SEARCH_SUGGESTION_CACHE.set(cacheKey, [])
    return []
  }
}

async function renderSearchSuggestions(dropdown, query, inputId) {
  const reqId = ++searchSuggestionSeq
  const suggestions = await getSearchSuggestions(query)
  if (reqId !== searchSuggestionSeq) return
  dropdown.dataset.firstSuggestion = suggestions[0]?.ticker || ''
  if (!suggestions.length) {
    dropdown.innerHTML = `<div class="search-empty">Press Enter to search "${escapeHtml(query.trim())}"</div>`
    dropdown.classList.remove('hidden')
    return
  }
  dropdown.innerHTML = suggestions.map(item => `
    <a href="#" onclick="selectSearchSuggestion('${item.ticker}','${inputId}');return false">
      <div class="search-result-main">
        <span class="sym">${item.ticker}</span>
        <span class="search-result-name">${escapeHtml(item.name)}</span>
      </div>
    </a>
  `).join('')
  dropdown.classList.remove('hidden')
}

function selectSearchSuggestion(ticker, inputId) {
  const input = document.getElementById(inputId)
  if (input) input.value = ''
  const dropdown = inputId ? input?.nextElementSibling : null
  if (dropdown) dropdown.classList.add('hidden')
  navigate('/stock/' + ticker)
}
window.selectSearchSuggestion = selectSearchSuggestion

function wireSearchInput(input, dropdown, inputId) {
  if (!input || !dropdown) return
  input.addEventListener('input', async () => {
    const q = input.value.trim()
    if (!q) { dropdown.classList.add('hidden'); dropdown.innerHTML = ''; dropdown.dataset.firstSuggestion = ''; return }
    await renderSearchSuggestions(dropdown, q, inputId)
  })
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = input.value.trim()
      if (!q) return
      const ticker = dropdown.dataset.firstSuggestion || q.toUpperCase()
      input.value = ''
      dropdown.classList.add('hidden')
      navigate('/stock/' + ticker)
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden')
    }
  })
  input.addEventListener('blur', () => setTimeout(() => dropdown.classList.add('hidden'), 200))
}

export function buildSparkline(indexItem) {
  const change = Number(indexItem?.changePct || 0)
  const positive = change >= 0
  const pointCount = 18
  const seed = String(indexItem?.name || indexItem?.symbol || 'IDX').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const points = Array.from({ length: pointCount }, (_, idx) => {
    const progress = idx / (pointCount - 1)
    const waveA = Math.sin((idx + seed * 0.01) * 0.8) * 0.028
    const waveB = Math.cos((idx + seed * 0.008) * 0.42) * 0.018
    const drift = positive ? -progress * 0.17 : progress * 0.17
    const nudge = positive ? (idx > 10 ? -0.018 : 0.012) : (idx > 10 ? 0.018 : -0.01)
    const base = positive ? 0.7 : 0.34
    return Math.max(0.18, Math.min(0.82, base + drift + waveA + waveB + nudge))
  })
  const width = 176
  const height = 72
  const baseline = height - 8
  const coords = points.map((p, idx) => ({
    x: Number((idx * (width / (pointCount - 1))).toFixed(1)),
    y: Number((p * height).toFixed(1)),
  }))
  const smoothPath = coords.map((pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`
    const prev = arr[idx - 1]
    const cp1x = Number((prev.x + (pt.x - prev.x) * 0.45).toFixed(1))
    const cp1y = prev.y
    const cp2x = Number((prev.x + (pt.x - prev.x) * 0.55).toFixed(1))
    const cp2y = pt.y
    return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`
  }).join(' ')
  const fillPath = `${smoothPath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
  const end = coords[coords.length - 1]
  return `<svg class="idx-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="spark-fill-${positive ? 'up' : 'dn'}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${positive ? '#10b981' : '#ef4444'}" stop-opacity="${positive ? '0.28' : '0.24'}"/>
        <stop offset="100%" stop-color="${positive ? '#10b981' : '#ef4444'}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line class="grid" x1="0" y1="${baseline}" x2="${width}" y2="${baseline}"></line>
    <path class="area ${positive ? 'up' : 'dn'}" d="${fillPath}"></path>
    <path class="glow ${positive ? 'up' : 'dn'}" d="${smoothPath}"></path>
    <path class="line ${positive ? 'up' : 'dn'}" d="${smoothPath}"></path>
    <circle class="dot ${positive ? 'up' : 'dn'}" cx="${end.x}" cy="${end.y}" r="4.4"></circle>
  </svg>`
}

// ═══════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════
const routes = {}
export function route(pattern, handler) { routes[pattern] = handler }
function isFileMode() {
  return location.protocol === 'file:'
}
function getRoutePath() {
  if (!isFileMode()) return location.pathname || '/'
  const route = new URLSearchParams(location.search).get('route') || '/'
  return route.startsWith('/') ? route : `/${route}`
}
function buildRouteUrl(path, hash = '') {
  if (!isFileMode()) return `${path}${hash || ''}`
  const url = new URL(location.href)
  if (path === '/') url.searchParams.delete('route')
  else url.searchParams.set('route', path)
  url.hash = hash || ''
  return url.toString()
}
function routeHref(path, hash = '') {
  return buildRouteUrl(path, hash)
}
function trackPageView() {
  if (typeof window.gtag !== 'function') return
  const pagePath = `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: location.href,
    page_path: pagePath
  })
}
function bindRouteElements(root = document) {
  root.querySelectorAll?.('[data-route]')?.forEach?.(el => {
    if (el.dataset.routeBound === '1') return
    const handleRouteEvent = ev => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
      if (ev.target?.closest?.('[data-stop-route]')) return
      const route = el.getAttribute('data-route')
      if (!route) return
      if (el.dataset.routeFired === '1') return
      el.dataset.routeFired = '1'
      setTimeout(() => { if (el?.dataset) el.dataset.routeFired = '0' }, 0)
      ev.preventDefault()
      ev.stopPropagation()
      navigate(route)
    }
    el.addEventListener('mousedown', handleRouteEvent)
    el.addEventListener('click', handleRouteEvent)
    el.dataset.routeBound = '1'
  })
}
export function navigate(path) {
  const nextPath = String(path || '/').startsWith('/') ? String(path || '/') : `/${String(path || '/')}`
  const currentPath = getRoutePath()
  if (currentPath !== nextPath || location.hash) history.pushState(null, '', buildRouteUrl(nextPath, ''))
  render()
  trackPageView()
}
window.navigate = navigate
window.addEventListener('popstate', () => {
  render()
  trackPageView()
})
if (!window.__dsRouteDelegationBound) {
  document.addEventListener('click', ev => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return
    if (ev.target?.closest?.('[data-stop-route]')) return
    const routeTarget = ev.target?.closest?.('[data-route]')
    const route = routeTarget?.getAttribute?.('data-route')
    if (!route) return
    ev.preventDefault()
    ev.stopPropagation()
    navigate(route)
  })
  window.__dsRouteDelegationBound = true
}

function upsertHeadTag(selector, createTag, attrs = {}, content = '') {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(createTag)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  if ('content' in el) el.content = content
  else if (createTag === 'link') el.setAttribute('href', content)
  else el.textContent = content
}

function setMeta({
  title,
  description,
  path = getRoutePath(),
  canonical = null,
  keywords = null,
  noindex = false,
  jsonLd = null,
  ogTitle = null,
  ogDescription = null,
  ogType = 'website',
  ogUrl = null,
  ogImage = DEFAULT_OG_IMAGE,
  twitterSite = DEFAULT_TWITTER_SITE,
  twitterImage = null,
}) {
  const normalizedPath = normalizeMetaPath(path)
  const canonicalUrl = canonical || absoluteRouteUrl(normalizedPath)
  const resolvedTitle = title || document.title
  const resolvedDescription = description || ''
  const resolvedOgTitle = ogTitle || resolvedTitle
  const resolvedOgDescription = ogDescription || resolvedDescription
  const resolvedOgUrl = ogUrl || canonicalUrl
  const resolvedTwitterImage = twitterImage || ogImage

  if (resolvedTitle) document.title = resolvedTitle
  if (resolvedDescription) {
    upsertHeadTag('meta[name="description"]', 'meta', { name: 'description' }, resolvedDescription)
    upsertHeadTag('meta[property="og:description"]', 'meta', { property: 'og:description' }, resolvedOgDescription)
    upsertHeadTag('meta[name="twitter:description"]', 'meta', { name: 'twitter:description' }, resolvedOgDescription)
  }
  upsertHeadTag('meta[name="keywords"]', 'meta', { name: 'keywords' }, keywords || '')
  upsertHeadTag('link[rel="canonical"]', 'link', { rel: 'canonical' }, canonicalUrl)
  upsertHeadTag('meta[property="og:title"]', 'meta', { property: 'og:title' }, resolvedOgTitle)
  upsertHeadTag('meta[property="og:type"]', 'meta', { property: 'og:type' }, ogType)
  upsertHeadTag('meta[property="og:url"]', 'meta', { property: 'og:url' }, resolvedOgUrl)
  upsertHeadTag('meta[property="og:image"]', 'meta', { property: 'og:image' }, ogImage)
  upsertHeadTag('meta[name="twitter:card"]', 'meta', { name: 'twitter:card' }, 'summary_large_image')
  upsertHeadTag('meta[name="twitter:title"]', 'meta', { name: 'twitter:title' }, resolvedOgTitle)
  upsertHeadTag('meta[name="twitter:image"]', 'meta', { name: 'twitter:image' }, resolvedTwitterImage)
  if (twitterSite) upsertHeadTag('meta[name="twitter:site"]', 'meta', { name: 'twitter:site' }, twitterSite)
  upsertHeadTag('meta[name="robots"]', 'meta', { name: 'robots' }, noindex ? 'noindex,nofollow' : 'index,follow')
  const ldId = 'route-jsonld'
  const existing = document.getElementById(ldId)
  if (existing) existing.remove()
  if (jsonLd) {
    const script = document.createElement('script')
    script.id = ldId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
  }
}

export async function render() {
  const path = getRoutePath()
  const app = document.getElementById('app')
  // Blog routes: keep the server-rendered prerender shell and bail out early
  // so the SPA doesn't flash its own header/main/footer over the SSR content
  const isBlogRoute = path === '/blog' || path.startsWith('/blog/')
  if (isBlogRoute) {
    const prerendered = document.querySelector('[data-prerender-shell]')
    if (prerendered) {
      // Blog pages use light styles — temporarily remove dark theme from body
      document.body.removeAttribute('data-theme')
      bindRouteElements(document)
      return
    } else {
      // Client-side navigation to /blog — force a full page load for SSR
      location.assign(location.href)
      return
    }
  }
  // Restore dark theme if user had it set before visiting a blog page
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) document.body.setAttribute('data-theme', savedTheme)
  app.querySelectorAll?.('[data-prerender-shell="1"]')?.forEach?.(node => node.remove())
  renderHeader()
  const main = document.createElement('div')
  main.id = 'main'
  // remove old main
  const oldMain = document.getElementById('main')
  if (oldMain) oldMain.remove()
  const oldFooter = document.getElementById('foot')
  if (oldFooter) oldFooter.remove()
  app.appendChild(main)
  
  let matched = false
  for (const pattern in routes) {
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$')
    const m = path.match(re)
    if (m) {
      const params = {}
      const keys = (pattern.match(/:(\w+)/g) || []).map(k => k.slice(1))
      keys.forEach((k, i) => params[k] = m[i + 1])
      try { await routes[pattern](main, params) } catch (e) { main.innerHTML = '<div class="container error">' + e.message + '</div>' }
      matched = true
      break
    }
  }
  if (!matched) {
    main.innerHTML = '<div class="container" style="padding:60px 20px;text-align:center"><h1>404</h1><p>Page not found</p></div>'
  }
  renderFooter()
  bindRouteElements(document)
}
window.render = render

// ═══════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════
export function renderHeader() {
  const existing = document.querySelector('header')
  if (existing) existing.remove()
  const path = getRoutePath()
  const h = document.createElement('header')
  h.className = 'site-header'
  h.innerHTML = `
    <div class="container hdr-inner">
      <a href="${routeHref('/')}" class="logo" onclick="navigate('/');return false">
        ${renderBrandMark({ className: 'logo-icon' })}
        <span class="logo-wordmark"><span class="dark">DELTA</span><span class="accent">SCREENER</span></span>
      </a>
      <div class="search-box">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" id="hdr-search" placeholder="Search company or ticker: Microsoft, MSFT…" autocomplete="off" />
        <div class="search-dropdown hidden" id="hdr-dropdown"></div>
      </div>
      <nav class="nav">
        <a href="${routeHref('/')}" data-route="/" onclick="navigate('/');return false" class="${path === '/' ? 'active' : ''}">Home</a>
        <a href="${routeHref('/screener')}" data-route="/screener" onclick="navigate('/screener');return false" class="${path === '/screener' ? 'active' : ''}">Screener</a>
        <a href="${routeHref('/watchlist')}" data-route="/watchlist" onclick="navigate('/watchlist');return false" class="${path === '/watchlist' ? 'active' : ''}">Watchlist</a>
      </nav>
      <div class="hdr-actions">
        <div id="auth-slot"></div>
      </div>
    </div>
  `
  document.getElementById('app').insertBefore(h, document.getElementById('app').firstChild)
  setupHeaderScrollState(h)
  const user = auth.user()
  const slot = document.getElementById('auth-slot')
  if (user) {
    slot.innerHTML = `
      <a href="${routeHref('/profile')}" data-route="/profile" onclick="navigate('/profile');return false" class="auth-pill ${path === '/profile' ? 'active' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>${escapeHtml(user.name ? user.name.split(' ')[0] : 'Profile')}</span>
      </a>
    `
  } else {
    slot.innerHTML = `<div id="google-signin"></div>`
    setTimeout(renderGoogleButton, 100)
    setTimeout(renderGoogleButton, 1000)
  }
  
  // Wire search
  const input = document.getElementById('hdr-search')
  const dd = document.getElementById('hdr-dropdown')
  wireSearchInput(input, dd, 'hdr-search')
  const _p = location.pathname
  if (_p !== '/blog' && !_p.startsWith('/blog/')) {
    theme.apply(theme.get())
  }
}

export function renderFooter() {
  const f = document.createElement('footer')
  f.id = 'foot'
  f.innerHTML = `<div class="container">© ${new Date().getFullYear()} DeltaScreener · Data: Yahoo Finance, SEC EDGAR, FMP, Alpha Vantage · <a href="${routeHref('/privacy')}" data-route="/privacy" onclick="navigate('/privacy');return false">Privacy</a> · <a href="${routeHref('/terms')}" data-route="/terms" onclick="navigate('/terms');return false">Terms</a></div>`
  document.getElementById('app').appendChild(f)
}

// ═══════════════════════════════════════════════════════════════════════
// WATCHLIST (localStorage)
// ═══════════════════════════════════════════════════════════════════════
const watchlist = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem('ds-watchlist') || '[]').map(normalizeWatchItem).filter(Boolean)
    } catch {
      return []
    }
  },
  has: t => {
    const ticker = String(t || '').trim().toUpperCase()
    return watchlist.get().some(x => x.ticker === ticker)
  },
  add: item => {
    const normalized = normalizeWatchItem(item)
    if (!normalized) return
    const list = watchlist.get().filter(x => x.ticker !== normalized.ticker)
    list.push(normalized)
    localStorage.setItem('ds-watchlist', JSON.stringify(list))
    if (auth.signedIn()) apiJson('/user/watchlist', normalized).catch(() => {})
  },
  remove: t => {
    const ticker = String(t || '').trim().toUpperCase()
    localStorage.setItem('ds-watchlist', JSON.stringify(watchlist.get().filter(x => x.ticker !== ticker)))
    if (auth.signedIn()) apiDelete('/user/watchlist', { ticker }).catch(() => {})
  }
}

async function persistUserPreferences(patch = {}) {
  if (!auth.signedIn()) return
  const body = {}
  if ('screenerColumns' in patch) body.screenerColumns = patch.screenerColumns
  if ('screenerQuery' in patch) body.screenerQuery = patch.screenerQuery
  if ('screenerColumnsOpen' in patch) body.screenerColumnsOpen = patch.screenerColumnsOpen
  try { await apiJson('/user/preferences', body) } catch {}
}

// ═══════════════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════════════
export async function renderHomePage(el) {
  setMeta({
    title: 'DeltaScreener — US Stock Screener & Analysis',
    description: 'Free US stock screener with 30+ filters, 10-year financials, and custom query language. Screen NYSE & NASDAQ stocks instantly.',
    path: '/',
    canonical: `${SITE_ORIGIN}/`,
    keywords: 'US stock screener, stock analysis, NYSE screener, NASDAQ screener, stock filters, financial ratios, DeltaScreener',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DeltaScreener',
      url: `${SITE_ORIGIN}/`,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_ORIGIN}/stock/{search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  })
  el.innerHTML = `
    <section class="landing-hero">
      <div class="container landing-hero-grid">
        <div class="landing-hero-copy">
          <div class="landing-hero-topline">
            <span class="landing-hero-badge">Live US equity intelligence</span>
            <span class="landing-data-inline">Data from Yahoo Finance · SEC EDGAR · FMP</span>
          </div>
          <div class="landing-brand-lockup">
            <div class="landing-brand-mark-wrap">
              ${renderBrandMark({ className: 'landing-brand-mark' })}
            </div>
            <div class="landing-brand-wordmark">
              <span class="landing-word-line dark">DELTA</span>
              <span class="landing-word-line accent">SCREENER</span>
            </div>
          </div>
          <p class="landing-tagline"><span class="landing-tagline-typed">Screen better signals. Catch better stocks.</span></p>
          <p class="landing-subcopy">Custom filters, 10-year financials, and a fast market dashboard for high-conviction US equity research.</p>
          <div class="landing-hero-actions">
            <a href="${routeHref('/screener')}" data-route="/screener" onclick="navigate('/screener');return false" class="btn btn-primary landing-btn-primary">Open Screener →</a>
            <a href="${routeHref('/watchlist')}" data-route="/watchlist" onclick="navigate('/watchlist');return false" class="btn btn-outline landing-btn-secondary">View Watchlist</a>
          </div>
          <div class="landing-trust-row">
            <div class="landing-trust-pill">Trusted inputs from Yahoo Finance, SEC EDGAR, and FMP.</div>
            <div class="landing-trust-stats">
              <div class="landing-trust-stat">
                <strong>5,000+</strong>
                <span>US stocks tracked</span>
              </div>
              <div class="landing-trust-stat">
                <strong id="screened-count" data-target="12482">0</strong>
                <span>screens run today</span>
              </div>
            </div>
          </div>
          <div class="hero-search landing-hero-search">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="hero-search" placeholder="Search company or ticker: Microsoft, MSFT…" autocomplete="off" />
            <div class="hero-search-dropdown hidden" id="hero-dropdown"></div>
          </div>
          <div class="popular landing-popular">
            ${['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','JPM','V','AMD','BRK.B','NFLX'].map(t => `<a href="${routeHref(`/stock/${t}`)}" class="chip" data-route="/stock/${t}" onclick="navigate('/stock/${t}');return false">${t}</a>`).join('')}
          </div>
        </div>
        <div class="landing-hero-side">
          <div class="hero-presets-card">
            <div class="hero-presets-header">
              <span class="landing-mini-kicker">Popular screens</span>
              <span class="hero-presets-sub">Click to run instantly</span>
            </div>
            ${[
              { emoji:'🏆', name:'Warren Buffett', color:'#f59e0b', q:'ROE > 20 AND\nROCE > 20 AND\nNet Margin > 15 AND\nDebt to Equity < 0.5 AND\nAverage ROE 5Years > 15' },
              { emoji:'🚀', name:'Momentum', color:'#6366f1', q:'Change % > 0 AND\nMarket Cap > 1000 AND\nROE > 10 AND\nNet Margin > 5' },
              { emoji:'📈', name:'High Growth', color:'#10b981', q:'Sales growth > 20 AND\nProfit growth > 20 AND\nNet Margin > 10 AND\nMarket Cap > 500' },
              { emoji:'💰', name:'Undervalued', color:'#0f766e', q:'P/E < 15 AND\nP/B < 2 AND\nROE > 12 AND\nDebt to Equity < 1 AND\nNet Margin > 8' },
              { emoji:'💵', name:'Dividend Income', color:'#ec4899', q:'Dividend Yield > 3 AND\nROE > 10 AND\nDebt to Equity < 1.5 AND\nNet Margin > 8 AND\nMarket Cap > 2000' },
            ].map((s,i) => `
              <a href="${routeHref('/screener')}" data-route="/screener" data-preset-idx="${i}"
                 class="hero-preset-row">
                <span class="hero-preset-icon" style="background:${s.color}22;color:${s.color}">${s.emoji}</span>
                <span class="hero-preset-label">${s.name}</span>
                <span class="hero-preset-arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
    <section class="landing-section landing-section-market">
      <div class="container">
        <div class="landing-section-head">
          <div>
            <span class="landing-section-kicker">Market context</span>
            <h2>Start with the tape before you screen.</h2>
          </div>
          <p>Track the major benchmarks and spot leadership shifts without leaving the landing page.</p>
        </div>
        <div id="indices-wrap"></div>
      </div>
    </section>
    <section class="landing-section landing-section-trending">
      <div class="container">
        <div class="card landing-trending-card">
          <div class="card-hdr landing-card-hdr">
            <div>
              <span class="landing-section-kicker">Trending now</span>
              <h2>Momentum names traders are already watching.</h2>
            </div>
            <a href="${routeHref('/screener')}" data-route="/screener" onclick="navigate('/screener');return false" class="landing-inline-link">Open Screener →</a>
          </div>
          <div id="trending-table"></div>
        </div>
      </div>
    </section>
    <section class="landing-section landing-section-presets">
      <div class="container">
        <div class="landing-section-head">
          <div>
            <span class="landing-section-kicker">Popular screens</span>
            <h2>Five proven strategies, one click away.</h2>
          </div>
          <p>Click any screen to instantly load the filters — no setup needed.</p>
        </div>
        <div class="landing-presets-grid">
          ${[
            {
              emoji: '🏆',
              name: 'Warren Buffett Style',
              desc: 'High ROE, high ROCE, fat margins, low debt. The classic quality compounder filter.',
              color: '#f59e0b',
              q: 'ROE > 20 AND\nROCE > 20 AND\nNet Margin > 15 AND\nDebt to Equity < 0.5 AND\nAverage ROE 5Years > 15'
            },
            {
              emoji: '🚀',
              name: 'Momentum Stocks',
              desc: 'Stocks already moving up with strong price action and above-average volume.',
              color: '#6366f1',
              q: 'Change % > 0 AND\nMarket Cap > 1000 AND\nROE > 10 AND\nNet Margin > 5'
            },
            {
              emoji: '📈',
              name: 'High Growth',
              desc: 'Fast-growing revenue and profit — for investors hunting the next compounder.',
              color: '#10b981',
              q: 'Sales growth > 20 AND\nProfit growth > 20 AND\nNet Margin > 10 AND\nMarket Cap > 500'
            },
            {
              emoji: '💰',
              name: 'Undervalued Gems',
              desc: 'Low P/E, low P/B, strong ROE — fundamentally cheap quality businesses.',
              color: '#0f766e',
              q: 'P/E < 15 AND\nP/B < 2 AND\nROE > 12 AND\nDebt to Equity < 1 AND\nNet Margin > 8'
            },
            {
              emoji: '💵',
              name: 'Dividend Income',
              desc: 'Reliable dividend payers with healthy payout ratios and strong balance sheets.',
              color: '#ec4899',
              q: 'Dividend Yield > 3 AND\nROE > 10 AND\nDebt to Equity < 1.5 AND\nNet Margin > 8 AND\nMarket Cap > 2000'
            }
          ].map((s,i) => `
            <a href="${routeHref('/screener')}" data-route="/screener" data-preset-idx="${i}"
               class="landing-preset-card">
              <div class="landing-preset-emoji" style="background:${s.color}22;color:${s.color}">${s.emoji}</div>
              <strong class="landing-preset-name">${s.name}</strong>
              <p class="landing-preset-desc">${s.desc}</p>
              <span class="landing-preset-cta">Run screen →</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="landing-section landing-section-features">
      <div class="container">
        <div class="landing-section-head">
          <div>
            <span class="landing-section-kicker">Why DeltaScreener</span>
            <h2>Three workflows built for fast conviction.</h2>
          </div>
          <p>Move from discovery to monitoring without bouncing across tabs or low-signal data sources.</p>
        </div>
        <div class="landing-feature-grid">
          ${[
            {
              key: 'screener',
              href: '/screener',
              title: 'Custom Screener',
              copy: 'Turn raw market data into ranked ideas with custom filters, quick comparisons, and flexible sorting.'
            },
            {
              key: 'watchlist',
              href: '/watchlist',
              title: 'Watchlist',
              copy: 'Keep your highest-conviction names in one place and stay close to the setups you want to act on.'
            },
            {
              key: 'financials',
              href: '/stock/AAPL',
              title: '10-Year Financials',
              copy: 'Read long-range operating trends, balance-sheet strength, and business quality without opening another tool.'
            }
          ].map(card => `
            <a href="${routeHref(card.href)}" data-route="${card.href}" onclick="navigate('${card.href}');return false" class="landing-feature-card">
              <span class="landing-feature-icon ${card.key}">${renderFeatureIcon(card.key)}</span>
              <strong>${card.title}</strong>
              <p>${card.copy}</p>
              <span class="landing-feature-link">Explore →</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
  `
  
  // Hero search
  const hs = document.getElementById('hero-search')
  const hdd = document.getElementById('hero-dropdown')
  wireSearchInput(hs, hdd, 'hero-search')
  animateNumericCounter(document.getElementById('screened-count'))

  // Wire preset click handlers (avoids JSON.stringify inside innerHTML)
  const PRESET_QUERIES = [
    'ROE > 20 AND\nROCE > 20 AND\nNet Margin > 15 AND\nDebt to Equity < 0.5 AND\nAverage ROE 5Years > 15',
    'Change % > 0 AND\nMarket Cap > 1000 AND\nROE > 10 AND\nNet Margin > 5',
    'Sales growth > 20 AND\nProfit growth > 20 AND\nNet Margin > 10 AND\nMarket Cap > 500',
    'P/E < 15 AND\nP/B < 2 AND\nROE > 12 AND\nDebt to Equity < 1 AND\nNet Margin > 8',
    'Dividend Yield > 3 AND\nROE > 10 AND\nDebt to Equity < 1.5 AND\nNet Margin > 8 AND\nMarket Cap > 2000',
  ]
  el.querySelectorAll('[data-preset-idx]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault()
      const idx = parseInt(a.dataset.presetIdx)
      if (PRESET_QUERIES[idx]) sessionStorage.setItem('ds-query', PRESET_QUERIES[idx])
      navigate('/screener')
    })
  })
  
  // Load data
  try {
    const [trending, indices] = await Promise.all([api('/market/trending'), api('/market/indices')])
    const indexResults = (indices.indices || []).length ? indices.indices : HOME_FALLBACK_INDICES
    const trendingResults = (trending.results || []).length ? trending.results : HOME_FALLBACK_TRENDING
    const hmi = document.getElementById('hero-mini-indices'); if (hmi) hmi.innerHTML = renderHeroMiniIndices(indexResults)
    document.getElementById('indices-wrap').innerHTML = renderHomeIndicesMarkup(indexResults)
    document.getElementById('trending-table').innerHTML = renderHomeTrendingMarkup(trendingResults)
    bindRouteElements(document.getElementById('trending-table'))
  } catch (e) {
    const hmi2 = document.getElementById('hero-mini-indices'); if (hmi2) hmi2.innerHTML = renderHeroMiniIndices(HOME_FALLBACK_INDICES)
    document.getElementById('indices-wrap').innerHTML = renderHomeIndicesMarkup(HOME_FALLBACK_INDICES)
    document.getElementById('trending-table').innerHTML = renderHomeTrendingMarkup(HOME_FALLBACK_TRENDING)
    bindRouteElements(document.getElementById('trending-table'))
  }
}
route('/', renderHomePage)

// ═══════════════════════════════════════════════════════════════════════
// STOCK DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'quarters', label: 'Quarters' },
  { id: 'pnl', label: 'P&L' },
  { id: 'balance', label: 'Balance Sheet' },
  { id: 'cashflow', label: 'Cash Flow' },
  { id: 'ratios', label: 'Ratios' },
  { id: 'ownership', label: 'Ownership' },
  { id: 'peers', label: 'Peers' },
  { id: 'news', label: 'News' },
]

export async function renderStockPage(el, params) {
  const ticker = params.ticker.toUpperCase()
  const hash = location.hash.replace('#', '') || 'overview'
  window.scrollTo(0, 0)
  setMeta(buildStockSeoMeta(ticker))
  
  el.innerHTML = '<div class="spinner"></div>'
  
  const prerender = globalThis.__DS_PRERENDER__ && globalThis.__DS_PRERENDER__.route === `/stock/${ticker}`
    ? globalThis.__DS_PRERENDER__
    : null
  let overview = prerender?.overview || null
  let financials = prerender?.financials || null
  let ratios = prerender?.ratios || null
  try {
    const [overviewResp, financialsResp, ratiosResp] = await Promise.all([
      overview ? Promise.resolve(null) : api(`/stock/${ticker}/overview`),
      financials ? Promise.resolve(null) : api(`/stock/${ticker}/financials`).catch(() => null),
      ratios ? Promise.resolve(null) : api(`/stock/${ticker}/ratios`).catch(() => null),
    ])
    overview = overview || overviewResp
    financials = financials || financialsResp
    ratios = ratios || ratiosResp
  } catch (e) {
    el.innerHTML = `<div class="container error">Could not load data for ${ticker}</div>`
    return
  }
  
  if (overview?.error) {
    el.innerHTML = `<div class="container error">${overview.error}</div>`
    return
  }
  setMeta(buildStockSeoMeta(ticker, overview, ratios))
  
  const up = (overview.changePct || 0) >= 0
  const isWatched = watchlist.has(ticker)
  
  el.innerHTML = `
    <div class="stock-hdr">
      <div class="container">
        <div class="stock-title-row">
          <div>
            <div class="stock-name">${overview.name || ticker}</div>
            <div class="stock-meta-row">
              <span class="tag tag-sym">${overview.exchange || 'NYSE/NASDAQ'}: ${ticker}</span>
              ${overview.sector && overview.sector !== '—' ? `<span class="tag tag-accent">${overview.sector}</span>` : ''}
              ${overview.industry && overview.industry !== '—' ? `<span class="tag">${overview.industry}</span>` : ''}
            </div>
          </div>
          <div class="stock-price">
            <div class="p">${fmt.usd(overview.price)}</div>
            <div class="ch ${up ? 'up' : 'dn'}">${up ? '▲' : '▼'} ${fmt.usd(Math.abs(overview.change || 0))} (${fmt.pctAbs(Math.abs(overview.changePct || 0))})</div>
            <div class="dt">As of ${fmt.date(overview.lastUpdated)}</div>
          </div>
        </div>
        <div class="kpi-grid stock-kpi-grid">
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">Market Cap</div><div class="kpi-value">${fmt.compact(overview.mktCap)}</div></div>
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">P/E Ratio</div><div class="kpi-value">${fmt.num(overview.pe)}</div></div>
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">EPS (TTM)</div><div class="kpi-value">${fmt.usd(overview.eps)}</div></div>
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">52W High</div><div class="kpi-value">${fmt.usd(overview.high52)}</div></div>
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">52W Low</div><div class="kpi-value">${fmt.usd(overview.low52)}</div></div>
          <div class="kpi-cell stock-kpi-cell"><div class="kpi-label">Div Yield</div><div class="kpi-value">${fmt.pctAbs(overview.dividendYield)}</div></div>
        </div>
        <div class="stock-actions">
          <button class="btn ${isWatched ? 'btn-primary' : 'btn-outline'}" id="watch-btn">
            ${isWatched ? '★ Saved' : '☆ Save'}
          </button>
          <a class="btn btn-outline" href="https://finance.yahoo.com/quote/${ticker}" target="_blank">Yahoo ↗</a>
          <a class="btn btn-outline" href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10-K" target="_blank">SEC ↗</a>
        </div>
        <div class="tabs">
          ${TABS.map(t => `<a href="#${t.id}" class="tab ${t.id === hash ? 'active' : ''}" onclick="loadTab(event,'${ticker}','${t.id}');return false">${t.label}</a>`).join('')}
        </div>
      </div>
    </div>
    <div class="container" style="padding:20px 16px">
      <div id="tab-content"></div>
    </div>
  `
  
  // Wire watchlist
  document.getElementById('watch-btn').addEventListener('click', () => {
    if (watchlist.has(ticker)) watchlist.remove(ticker)
    else watchlist.add({ ticker, name: overview.name, exchange: overview.exchange, price: overview.price, change: overview.change, changePct: overview.changePct, addedAt: Date.now() })
    render()
  })
  
  window.loadTab = (ev, tk, tab) => {
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'))
    const target = ev?.currentTarget || ev?.target
    if (target?.classList) target.classList.add('active')
    location.hash = tab
    renderTab(tab, overview, financials, ratios, ticker)
  }
  
  renderTab(hash, overview, financials, ratios, ticker)
}
route('/stock/:ticker', renderStockPage)

async function renderTab(tab, overview, financials, ratios, ticker) {
  const c = document.getElementById('tab-content')
  if (!c) return
  
  switch (tab) {
    case 'overview':
      renderOverviewTab(c, overview, financials, ratios)
      break
    case 'chart':
      c.innerHTML = '<div class="spinner"></div>'
      try { const ch = await api(`/stock/${ticker}/chart?period=1Y`); renderChartTab(c, ch, ticker, '1Y') } catch { c.innerHTML = '<div class="card"><div class="empty">Could not load chart</div></div>' }
      break
    case 'pnl':
      renderPLTab(c, financials, 'annual')
      break
    case 'quarters':
      renderPLTab(c, financials, 'quarterly')
      break
    case 'balance':
      renderBalanceTab(c, financials)
      break
    case 'cashflow':
      renderCashflowTab(c, financials)
      break
    case 'ratios':
      renderRatiosTab(c, ratios, overview)
      break
    case 'ownership':
    case 'shareholders':
      c.innerHTML = '<div class="spinner"></div>'
      try { const sh = await api(`/stock/${ticker}/shareholders`); renderOwnershipTab(c, sh) } catch { c.innerHTML = '<div class="empty">Could not load</div>' }
      break
    case 'peers':
      c.innerHTML = '<div class="spinner"></div>'
      try { const p = await api(`/stock/${ticker}/peers`); renderPeersTab(c, p) } catch { c.innerHTML = '<div class="empty">No peers found</div>' }
      break
    case 'news':
      c.innerHTML = '<div class="spinner"></div>'
      try { const n = await api(`/stock/${ticker}/news`); renderNewsTab(c, n) } catch { c.innerHTML = '<div class="empty">No news</div>' }
      break
  }
  bindRouteElements(c)
}

function renderOverviewTab(c, ov, fins, rt) {
  const kpis = [
    ['Market Cap', fmt.compact(ov.mktCap)],
    ['Current Price', fmt.usd(ov.price)],
    ['52W High/Low', `${fmt.usd(ov.high52)} / ${fmt.usd(ov.low52)}`],
    ['P/E Ratio', fmt.num(rt?.pe ?? ov.pe)],
    ['P/B Ratio', fmt.num(rt?.pb ?? ov.pb)],
    ['EPS (TTM)', fmt.usd(ov.eps)],
    ['Dividend Yield', fmt.pctAbs(ov.dividendYield)],
    ['ROE', fmt.pctAbs(rt?.roe ?? ov.roe)],
    ['ROCE', fmt.pctAbs(rt?.roce)],
    ['Debt/Equity', fmt.num(rt?.debtToEquity ?? ov.debtToEquity)],
    ['Op. Margin', fmt.pctAbs(rt?.opMargin ?? ov.opMargin)],
    ['Net Margin', fmt.pctAbs(rt?.netMargin ?? ov.netMargin)],
  ]
  c.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="overview-kpi-grid">
        ${kpis.map((k, i) => `
          <div class="overview-kpi-cell">
            <div class="kpi-label">${k[0]}</div>
            <div class="kpi-value">${k[1]}</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">
      <div class="card">
        <div class="card-hdr"><h2>About</h2></div>
        <div class="about">
          <p>${ov.description || 'No description available.'}</p>
          ${ov.keyPoints?.length ? `<ul>${ov.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
        </div>
      </div>
      <div class="card">
        <div class="card-hdr"><h2>Company Info</h2></div>
        <div style="padding:4px 0">
          ${[
            ['Exchange', ov.exchange],
            ['Sector', ov.sector],
            ['Industry', ov.industry],
            ['Website', ov.website ? `<a href="${ov.website}" target="_blank">Visit ↗</a>` : '—'],
            ['Book Value', fmt.usd(ov.bookValue)],
            ['Avg Volume', ov.avgVolume ? ov.avgVolume.toLocaleString() : '—'],
          ].map(([l, v]) => `
            <div class="ratio-row"><span class="lbl">${l}</span><span class="val">${v || '—'}</span></div>
          `).join('')}
        </div>
      </div>
    </div>
    ${fins?.balanceSheetYears ? `<div style="margin-top:12px;font-size:12px;color:#9ca3af">Data source: ${fins.balanceSheetSource === 'sec_xbrl' ? 'SEC EDGAR XBRL' : fins.balanceSheetSource} · ${fins.balanceSheetYears} years of balance sheet data</div>` : ''}
  `
}

async function loadChartRange(ticker, period) {
  const c = document.getElementById('tab-content')
  if (!c) return
  c.innerHTML = '<div class="spinner"></div>'
  try {
    const ch = await api(`/stock/${ticker}/chart?period=${period}`)
    renderChartTab(c, ch, ticker, period)
  } catch {
    c.innerHTML = '<div class="card"><div class="empty">Could not load chart</div></div>'
  }
}
window.loadChartRange = loadChartRange

function parseChartDate(value) {
  if (!value) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    const [year, month, day] = String(value).split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    return isNaN(date.getTime()) ? null : date
  }
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date
}

function formatChartDate(value, options) {
  const date = value instanceof Date ? value : parseChartDate(value)
  return date ? date.toLocaleDateString('en-US', { timeZone: 'UTC', ...options }) : ''
}

function sampleChartTickIndexes(indexes, maxTicks = 5) {
  if (!indexes.length) return []
  if (indexes.length <= maxTicks) return indexes
  const sampled = []
  for (let i = 0; i < maxTicks; i++) {
    sampled.push(indexes[Math.round((i * (indexes.length - 1)) / Math.max(maxTicks - 1, 1))])
  }
  return [...new Set(sampled)].sort((a, b) => a - b)
}

function buildChartXTicks(points, period) {
  if (!points.length) return []
  const lastIndex = points.length - 1
  const firstDate = points[0]?.date
  const lastDate = points[lastIndex]?.date
  const spanDays = firstDate && lastDate ? Math.max(Math.round((lastDate.getTime() - firstDate.getTime()) / 86400000), 0) : 0
  const labelMode = (period === '5Y' || period === 'MAX' || period === '10Y' || spanDays > 730)
    ? 'year'
    : (period === '1M' || period === '3M' ? 'monthDay' : 'monthYear')
  const evenlySpacedIndexes = [0, 0.25, 0.5, 0.75, 1].map(fraction => Math.round(lastIndex * fraction))
  const boundaryIndexes = [0, lastIndex]

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]?.date
    const cur = points[i]?.date
    if (!prev || !cur) continue
    if (labelMode === 'year' && prev.getUTCFullYear() !== cur.getUTCFullYear()) boundaryIndexes.push(i)
    if (labelMode === 'monthYear' && (prev.getUTCFullYear() !== cur.getUTCFullYear() || prev.getUTCMonth() !== cur.getUTCMonth())) boundaryIndexes.push(i)
  }

  const formatTickLabel = date => {
    if (!date) return ''
    if (labelMode === 'year') return formatChartDate(date, { year: 'numeric' })
    if (labelMode === 'monthYear') return formatChartDate(date, { month: 'short', year: 'numeric' })
    return formatChartDate(date, { month: 'short', day: 'numeric' })
  }

  const deduped = []
  const seenLabels = new Set()
  for (const index of [...new Set([...boundaryIndexes, ...evenlySpacedIndexes])].sort((a, b) => a - b)) {
    const point = points[index]
    if (!point) continue
    const label = formatTickLabel(point.date)
    if (!label || seenLabels.has(label)) continue
    seenLabels.add(label)
    deduped.push({ i: index, point, label })
  }

  const sampledIndexes = sampleChartTickIndexes(deduped.map(tick => tick.i))
  const sampledTicks = sampledIndexes.map(index => deduped.find(tick => tick.i === index)).filter(Boolean)
  if (sampledTicks.length >= 2) return sampledTicks

  return sampleChartTickIndexes([...new Set(evenlySpacedIndexes)]).map(index => {
    const point = points[index]
    return point ? { i: index, point, label: formatTickLabel(point.date) } : null
  }).filter(Boolean)
}

function renderChartTab(c, chart, ticker, period = '1Y') {
  const labels = chart?.labels || []
  const prices = (chart?.prices || []).map(Number)
  const pts = prices.map((p, i) => {
    const rawLabel = labels[i]
    const date = parseChartDate(rawLabel)
    return { p, label: rawLabel, date: date && !isNaN(date.getTime()) ? date : null }
  }).filter(x => x.p != null && !isNaN(x.p))
  if (pts.length < 2) { c.innerHTML = '<div class="card"><div class="empty">No chart data available</div></div>'; return }
  
  const w = 1200, h = 420, padL = 58, padR = 24, padT = 22, padB = 58
  const vals = pts.map(x => x.p)
  const prevClose = Number.isFinite(Number(chart?.previousClose)) ? Number(chart.previousClose) : pts[0].p
  const seriesLabel = chart?.seriesLabel || 'Adjusted close'
  const minRaw = Math.min(...vals, prevClose), maxRaw = Math.max(...vals, prevClose)
  const buffer = (maxRaw - minRaw || maxRaw * 0.02 || 1) * 0.12
  const min = minRaw - buffer, max = maxRaw + buffer
  const span = max - min || 1
  const x = i => padL + (i / (pts.length - 1)) * (w - padL - padR)
  const y = v => h - padB - ((v - min) / span) * (h - padT - padB)
  const line = pts.map((d, i) => `${x(i).toFixed(1)},${y(d.p).toFixed(1)}`).join(' ')
  const fill = `${padL},${h - padB} ${line} ${w - padR},${h - padB}`
  const start = pts[0].p, end = pts[pts.length - 1].p
  const change = start ? ((end - start) / start) * 100 : null
  const isDown = end < start
  const ticks = [0, 1, 2, 3, 4].map(i => max - (i / 4) * (max - min))
  const ranges = ['1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX']
  const xTicks = buildChartXTicks(pts, period)
  const dateFmt = d => formatChartDate(d, { month: 'short', day: 'numeric', year: 'numeric' })
  
  c.innerHTML = `
    <div class="card stock-chart-card">
      <div class="card-hdr stock-chart-card-hdr">
        <h2>${ticker} Price Chart</h2>
        <span class="chart-hdr-meta">${period} · ${seriesLabel}</span>
      </div>
      <div class="chart-wrap stock-chart-wrap">
        <div class="chart-toolbar stock-chart-toolbar">
          ${ranges.map(r => `<button class="chart-range ${r === period ? 'active' : ''}" onclick="loadChartRange('${ticker}','${r}')">${r === 'MAX' ? 'Max' : r}</button>`).join('')}
        </div>
        <svg class="chart-svg stock-chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${ticker} stock price line chart">
          <rect class="chart-bg" x="0" y="0" width="${w}" height="${h}"></rect>
          ${ticks.map(t => `<line class="chart-grid" x1="${padL}" y1="${y(t).toFixed(1)}" x2="${w - padR}" y2="${y(t).toFixed(1)}"></line><text class="chart-label" x="4" y="${(y(t) + 4).toFixed(1)}">${t.toFixed(2)}</text>`).join('')}
          ${xTicks.map(t => `<line class="chart-grid" x1="${x(t.i).toFixed(1)}" y1="${padT}" x2="${x(t.i).toFixed(1)}" y2="${h - padB}"></line><text class="chart-label x-axis" x="${x(t.i).toFixed(1)}" y="${h - 16}" text-anchor="middle">${t.label}</text>`).join('')}
          <line class="chart-prev" x1="${padL}" y1="${y(prevClose).toFixed(1)}" x2="${w - padR}" y2="${y(prevClose).toFixed(1)}"></line>
          <polygon class="chart-fill ${isDown ? 'dn' : ''}" points="${fill}"></polygon>
          <polyline class="chart-line ${isDown ? 'dn' : ''}" points="${line}"></polyline>
        </svg>
        <div class="chart-meta stock-chart-meta">
          <span>${dateFmt(pts[0].date)} · ${fmt.usd(start)}</span>
          <span class="${fmt.pctClass(change)}">${change == null ? '—' : (change >= 0 ? '+' : '') + change.toFixed(2) + '%'}</span>
          <span>Previous close ${fmt.usd(prevClose)}</span>
          <span>${dateFmt(pts[pts.length - 1].date)} · ${fmt.usd(end)}</span>
        </div>
      </div>
    </div>
  `
}

function safeSeriesValue(arr, idxFromEnd) {
  if (!Array.isArray(arr)) return null
  const vals = arr.filter(v => v != null && !isNaN(v) && isFinite(v))
  return vals.length > idxFromEnd ? Number(vals[vals.length - 1 - idxFromEnd]) : null
}

function cagrValue(current, past, years) {
  if (current == null || past == null || years <= 0 || past <= 0 || current <= 0) return null
  return ((Math.pow(current / past, 1 / years) - 1) * 100)
}

function annualSeriesCagr(series, headers, targetYears) {
  if (!Array.isArray(series) || !Array.isArray(headers) || targetYears <= 0) return null
  const pts = series.map((value, idx) => {
    const year = parseInt(String(headers[idx]).slice(0, 4), 10)
    return {
      year,
      value: value == null || isNaN(value) || !isFinite(value) ? null : Number(value),
    }
  }).filter(p => p.value != null && Number.isFinite(p.year))
  if (pts.length < 2) return null

  const latest = pts[pts.length - 1]
  let base = null
  for (let i = pts.length - 2; i >= 0; i--) {
    if ((latest.year - pts[i].year) >= targetYears) {
      base = pts[i]
      break
    }
  }
  base = base || pts[0]
  const span = latest.year - base.year
  return span > 0 ? cagrValue(latest.value, base.value, span) : null
}

function avgSeries(values, count) {
  if (!Array.isArray(values)) return null
  const vals = values.filter(v => v != null && !isNaN(v) && isFinite(v)).slice(-count)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + Number(b), 0) / vals.length
}

function buildGrowthViewModel(fins) {
  const growth = fins?.growth || {}
  const annual = fins?.annual || {}
  const balance = fins?.balance || {}
  const annualHeaders = annual.headers || []
  const sales = annual.sales || []
  const profit = annual.netProfit || []
  const equity = balance.equity || []
  const roeSeries = profit.map((np, i) => {
    const eq = equity[i]
    return np != null && eq != null && eq > 0 ? (Number(np) / Number(eq)) * 100 : null
  })
  return {
    salesGrowth: {
      '10y': growth.salesGrowth?.['10y'] ?? annualSeriesCagr(sales, annualHeaders, 10),
      '5y': growth.salesGrowth?.['5y'] ?? annualSeriesCagr(sales, annualHeaders, 5),
      '3y': growth.salesGrowth?.['3y'] ?? annualSeriesCagr(sales, annualHeaders, 3),
      ttm: growth.salesGrowth?.ttm ?? null,
    },
    profitGrowth: {
      '10y': growth.profitGrowth?.['10y'] ?? annualSeriesCagr(profit, annualHeaders, 10),
      '5y': growth.profitGrowth?.['5y'] ?? annualSeriesCagr(profit, annualHeaders, 5),
      '3y': growth.profitGrowth?.['3y'] ?? annualSeriesCagr(profit, annualHeaders, 3),
      ttm: growth.profitGrowth?.ttm ?? null,
    },
    stockCagr: {
      '10y': growth.stockCagr?.['10y'] ?? null,
      '5y': growth.stockCagr?.['5y'] ?? null,
      '3y': growth.stockCagr?.['3y'] ?? null,
      '1y': growth.stockCagr?.['1y'] ?? null,
    },
    roe: {
      '10y': growth.roe?.['10y'] ?? avgSeries(roeSeries, 10),
      '5y': growth.roe?.['5y'] ?? avgSeries(roeSeries, 5),
      '3y': growth.roe?.['3y'] ?? avgSeries(roeSeries, 3),
      lastYear: growth.roe?.lastYear ?? safeSeriesValue(roeSeries, 0),
    },
  }
}

function renderPLTab(c, fins, type) {
  const data = type === 'quarterly' ? fins?.quarterly : fins?.annual
  if (!data?.headers?.length) { c.innerHTML = '<div class="card"><div class="empty">No data available</div></div>'; return }
  
  const rows = [
    { label: 'Revenue ($M)', data: data.sales, bold: true },
    { label: 'Expenses ($M)', data: data.expenses },
    { label: 'Operating Profit ($M)', data: data.opProfit, bold: true },
    { label: 'OPM %', data: data.opm, pct: true },
    { label: 'Other Income ($M)', data: data.otherIncome },
    { label: 'Interest ($M)', data: data.interest },
    { label: 'Depreciation ($M)', data: data.depreciation },
    { label: 'Profit Before Tax ($M)', data: data.pbt, bold: true },
    { label: 'Tax %', data: data.tax, pct: true },
    { label: 'Net Profit ($M)', data: data.netProfit, bold: true, colorize: true },
    { label: 'EPS ($)', data: data.eps, isEPS: true },
  ]
  
  const cellVal = (v, row) => {
    if (v == null) return '—'
    if (row.pct) return Number(v).toFixed(1) + '%'
    if (row.isEPS) return Number(v).toFixed(2)
    return fmt.numFull(v)
  }
  
  c.innerHTML = `
    <div class="card">
      <div class="card-hdr">
        <h2>${type === 'quarterly' ? 'Quarterly Results' : 'Profit & Loss'}</h2>
        <span style="font-size:12px;color:#6b7280">Annual · USD Millions · ${data.headers.length} years</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Item</th>
              ${data.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="${r.bold ? 'row-bold' : ''}">
                <td>${r.label}</td>
                ${(r.data || []).map(v => {
                  const cls = r.colorize ? (v > 0 ? 'up' : v < 0 ? 'dn' : '') : ''
                  return `<td class="${cls}">${cellVal(v, r)}</td>`
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${type === 'annual' ? renderGrowthRates(buildGrowthViewModel(fins)) : ''}
    </div>
  `
}

function renderGrowthRates(growth) {
  const mk = (title, data, rows) => `
    <div class="growth-box">
      <div class="growth-box-hdr">${title}</div>
      ${rows.map(([label, key]) => {
        const v = data?.[key]
        return `
          <div class="growth-box-row">
            <span class="lbl">${label}</span>
            <span class="val ${v == null ? '' : v >= 0 ? 'up' : 'dn'}">${v == null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%'}</span>
          </div>
        `
      }).join('')}
    </div>
  `
  return `
    <div class="growth-grid">
      ${mk('Sales Growth', growth.salesGrowth, [['10 Years', '10y'], ['5 Years', '5y'], ['3 Years', '3y'], ['TTM', 'ttm']])}
      ${mk('Profit Growth', growth.profitGrowth, [['10 Years', '10y'], ['5 Years', '5y'], ['3 Years', '3y'], ['TTM', 'ttm']])}
      ${mk('Stock CAGR', growth.stockCagr, [['10 Years', '10y'], ['5 Years', '5y'], ['3 Years', '3y'], ['1 Year', '1y']])}
      ${mk('Return on Equity', growth.roe, [['10 Years', '10y'], ['5 Years', '5y'], ['3 Years', '3y'], ['Last Year', 'lastYear']])}
    </div>
  `
}

function renderBalanceTab(c, fins) {
  const data = fins?.balance
  if (!data?.headers?.length) { c.innerHTML = '<div class="card"><div class="empty">No balance sheet data</div></div>'; return }
  
  const rows = [
    { label: 'Paid-in Capital ($M)', data: data.equity },
    { label: 'Reserves ($M)', data: data.reserves },
    { label: 'Borrowings ($M)', data: data.borrowings },
    { label: 'Other Liabilities ($M)', data: data.otherLiabilities },
    { label: 'Total Liabilities ($M)', data: data.totalLiabilities, bold: true },
    { label: 'Fixed Assets ($M)', data: data.fixedAssets },
    { label: 'CWIP ($M)', data: data.cwip },
    { label: 'Investments ($M)', data: data.investments },
    { label: 'Other Assets ($M)', data: data.otherAssets },
    { label: 'Total Assets ($M)', data: data.totalAssets, bold: true },
  ]
  
  c.innerHTML = `
    <div class="card">
      <div class="card-hdr">
        <h2>Balance Sheet</h2>
        <span style="font-size:12px;color:#6b7280">Annual · USD Millions · ${data.headers.length} years</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Item</th>
              ${data.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="${r.bold ? 'row-bold' : ''}">
                <td>${r.label}</td>
                ${(r.data || []).map(v => `<td>${fmt.numFull(v)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderCashflowTab(c, fins) {
  const data = fins?.cashflow
  if (!data?.headers?.length) { c.innerHTML = '<div class="card"><div class="empty">No cash flow data</div></div>'; return }
  
  const rows = [
    { label: 'Cash from Operating ($M)', data: data.fromOperating, colorize: true },
    { label: 'Cash from Investing ($M)', data: data.fromInvesting, colorize: true },
    { label: 'Cash from Financing ($M)', data: data.fromFinancing, colorize: true },
    { label: 'Net Cash Flow ($M)', data: data.netCashFlow, bold: true, colorize: true },
    { label: 'Free Cash Flow ($M)', data: data.freeCashFlow, colorize: true },
  ]
  
  c.innerHTML = `
    <div class="card">
      <div class="card-hdr">
        <h2>Cash Flow Statement</h2>
        <span style="font-size:12px;color:#6b7280">Annual · USD Millions · ${data.headers.length} years</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Item</th>
              ${data.headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr class="${r.bold ? 'row-bold' : ''}">
                <td>${r.label}</td>
                ${(r.data || []).map(v => {
                  const cls = r.colorize && v != null ? (v > 0 ? 'up' : v < 0 ? 'dn' : '') : ''
                  return `<td class="${cls}">${fmt.numFull(v)}</td>`
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderRatiosTab(c, rt, ov) {
  if (!rt) { c.innerHTML = '<div class="card"><div class="empty">No ratios data</div></div>'; return }
  
  const sections = [
    { title: 'Valuation', items: [
      ['P/E Ratio', fmt.num(rt.pe)],
      ['P/B Ratio', fmt.num(rt.pb)],
      ['P/S Ratio', fmt.num(rt.ps)],
      ['PEG Ratio', fmt.num(rt.peg)],
      ['EV/EBITDA', fmt.num(rt.evEbitda)],
      ['EV/Revenue', fmt.num(rt.evRevenue)],
      ['Earnings Yield', fmt.pctAbs(rt.earningsYield)],
      ['Dividend Yield', fmt.pctAbs(rt.dividendYield ?? ov?.dividendYield)],
    ]},
    { title: 'Profitability', items: [
      ['Gross Margin', fmt.pctAbs(rt.grossMargin)],
      ['Operating Margin', fmt.pctAbs(rt.opMargin)],
      ['Net Margin', fmt.pctAbs(rt.netMargin)],
      ['ROE', fmt.pctAbs(rt.roe)],
      ['ROA', fmt.pctAbs(rt.roa)],
      ['ROCE', fmt.pctAbs(rt.roce)],
      ['FCF Yield', fmt.pctAbs(rt.fcfYield)],
    ]},
    { title: 'Debt & Liquidity', items: [
      ['Current Ratio', fmt.num(rt.currentRatio)],
      ['Quick Ratio', fmt.num(rt.quickRatio)],
      ['Cash Ratio', fmt.num(rt.cashRatio)],
      ['Debt/Equity', fmt.num(rt.debtToEquity)],
      ['Debt/Assets', fmt.num(rt.debtToAssets)],
      ['Interest Coverage', rt.interestCoverage == null ? '—' : rt.interestCoverage.toFixed(1) + 'x'],
    ]},
  ]
  
  c.innerHTML = `
    <div class="ratios-grid">
      ${sections.map(s => `
        <div class="ratio-section">
          <div class="ratio-section-hdr">${s.title}</div>
          ${s.items.map(([label, val]) => `
            <div class="ratio-row">
              <span class="lbl">${label}</span>
              <span class="val ${val === '—' ? 'null' : ''}">${val}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `
}

function renderOwnershipTab(c, sh) {
  if (!sh?.institutional?.length && !sh?.ownership?.length && !sh?.insiders?.length) {
    c.innerHTML = `
      <div class="card">
        <div class="empty">
          No ownership data available from connected providers for this ticker.
          <div style="font-size:12px;margin-top:8px;color:#9ca3af">US ownership data depends on institutional/insider filings and provider coverage.</div>
        </div>
      </div>
    `
    return
  }
  c.innerHTML = `
    ${sh.ownership?.length ? `
      <div class="ratios-grid" style="margin-bottom:12px">
        ${sh.ownership.map(o => `
          <div class="ratio-section">
            <div class="ratio-row">
              <span class="lbl">${o.label}</span>
              <span class="val">${o.isCount ? fmt.numFull(o.value) : fmt.pctAbs(o.value)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
    <div class="card">
      <div class="card-hdr">
        <h2>Institutional Holders</h2>
        <span style="font-size:12px;color:#6b7280">${sh.institutional?.length ? 'Top ' + sh.institutional.length : 'Summary'} · ${sh.source}</span>
      </div>
      ${sh.institutional?.length ? `
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Institution</th><th>Shares</th><th>Value ($B)</th><th>% Held</th><th>Change</th><th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${sh.institutional.map(h => `
              <tr>
                <td>${h.name || '—'}</td>
                <td>${h.shares ? Number(h.shares).toLocaleString() : '—'}</td>
                <td>${h.value != null ? '$' + h.value + 'B' : '—'}</td>
                <td>${h.pctHeld != null ? h.pctHeld + '%' : '—'}</td>
                <td class="${h.change > 0 ? 'up' : h.change < 0 ? 'dn' : ''}">${h.change != null ? (h.change > 0 ? '+' : '') + Number(h.change).toLocaleString() : '—'}</td>
                <td style="color:#9ca3af;font-size:12px">${h.reportDate || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : '<div class="empty">Holder table unavailable for this ticker. Ownership summary is shown above.</div>'}
    </div>
    ${sh.insiders?.length ? `
      <div class="card" style="margin-top:12px">
        <div class="card-hdr"><h2>Insider Holders</h2></div>
        <div class="tbl-scroll">
          <table class="tbl screener-results-table">
            <thead><tr><th>Name</th><th>Relation</th><th>Shares</th><th>Latest Transaction</th></tr></thead>
            <tbody>
              ${sh.insiders.map(h => `
                <tr>
                  <td>${h.name || '—'}</td>
                  <td>${h.relation || '—'}</td>
                  <td>${h.shares ? Number(h.shares).toLocaleString() : '—'}</td>
                  <td style="color:#9ca3af;font-size:12px">${h.latestTransDate || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `
}

function renderPeersTab(c, p) {
  if (!p?.peers?.length) { c.innerHTML = '<div class="card"><div class="empty">No peers found</div></div>'; return }
  c.innerHTML = `
    <div class="card">
      <div class="card-hdr"><h2>Peer Comparison</h2></div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Company</th><th>Price</th><th>Change %</th><th>Market Cap</th><th>P/E</th><th>Div Yld</th>
            </tr>
          </thead>
          <tbody>
            ${p.peers.map(x => `
              <tr>
                <td data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" style="cursor:pointer"><a href="${routeHref(`/stock/${x.ticker}`)}" data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" class="stock-link"><strong style="color:#2962ff">${x.ticker}</strong> ${x.name || ''}</a></td>
                <td>${fmt.usd(x.price)}</td>
                <td class="${fmt.pctClass(x.changePct)}">${fmt.pct(x.changePct)}</td>
                <td>${fmt.compact(x.mktCap)}</td>
                <td>${fmt.num(x.pe)}</td>
                <td>${fmt.pctAbs(x.dividendYield)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function renderNewsTab(c, n) {
  if (!n?.news?.length) { c.innerHTML = '<div class="card"><div class="empty">No recent news</div></div>'; return }
  c.innerHTML = `
    <div class="card">
      ${n.news.map(item => `
        <a class="news-item" href="${item.url}" target="_blank" rel="noreferrer">
          ${item.image ? `<img src="${item.image}" alt="" />` : ''}
          <div style="flex:1;min-width:0">
            <div class="title">${item.title}</div>
            <div class="meta">${item.source || ''} · ${fmt.date(item.publishedDate)}</div>
            ${item.text ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${item.text}</div>` : ''}
          </div>
        </a>
      `).join('')}
    </div>
  `
}

// ═══════════════════════════════════════════════════════════════════════
// SCREENER PAGE (screener.in-style custom query builder)
// ═══════════════════════════════════════════════════════════════════════

// Metric definitions - these are the metrics you can use in queries
const METRICS = {
  'Market Capitalization': { key: 'marketCap', unit: '$M', hint: '$ Millions' },
  'Market Cap':            { key: 'marketCap', unit: '$M', hint: '$ Millions' },
  'Price to Earning':      { key: 'pe', unit: '' },
  'Price to Earnings':     { key: 'pe', unit: '' },
  'P/E Ratio':             { key: 'pe', unit: '' },
  'P/E':                   { key: 'pe', unit: '' },
  'Price to Book':         { key: 'pb', unit: '' },
  'Price to book value':   { key: 'pb', unit: '' },
  'P/B':                   { key: 'pb', unit: '' },
  'Price to Sales':        { key: 'ps', unit: '' },
  'P/S':                   { key: 'ps', unit: '' },
  'Return on Equity':      { key: 'roe', unit: '%' },
  'ROE':                   { key: 'roe', unit: '%' },
  'Return on Assets':      { key: 'roa', unit: '%' },
  'ROA':                   { key: 'roa', unit: '%' },
  'Return on capital employed': { key: 'roce', unit: '%' },
  'ROCE':                  { key: 'roce', unit: '%' },
  'Net Profit Margin':     { key: 'netMargin', unit: '%' },
  'Net Margin':            { key: 'netMargin', unit: '%' },
  'Dividend Yield':        { key: 'dividendYield', unit: '%' },
  'Debt to Equity':        { key: 'debtToEquity', unit: '' },
  'Current price':         { key: 'price', unit: '$' },
  'Price':                 { key: 'price', unit: '$' },
  'Sales':                 { key: 'sales', unit: '$M' },
  'OPM':                   { key: 'opm', unit: '%' },
  'Operating Profit Margin': { key: 'opm', unit: '%' },
  'Profit after tax':      { key: 'profitAfterTax', unit: '$M' },
  'PAT':                   { key: 'profitAfterTax', unit: '$M' },
  'Sales latest quarter':  { key: 'salesLatestQuarter', unit: '$M' },
  'PAT latest quarter':    { key: 'profitAfterTaxLatestQuarter', unit: '$M' },
  'Profit after tax latest quarter': { key: 'profitAfterTaxLatestQuarter', unit: '$M' },
  'YOY Qtr sales growth':  { key: 'yoyQuarterlySalesGrowth', unit: '%' },
  'YOY Qtr profit growth': { key: 'yoyQuarterlyProfitGrowth', unit: '%' },
  'EPS':                   { key: 'eps', unit: '$' },
  'Debt':                  { key: 'debt', unit: '$M' },
  'Earnings yield':        { key: 'earningsYield', unit: '%' },
  'Sales growth':          { key: 'salesGrowth', unit: '%' },
  'Profit growth':         { key: 'profitGrowth', unit: '%' },
  'Price to Free Cash Flow': { key: 'priceToFreeCashFlow', unit: '' },
  'EV/EBITDA':             { key: 'evEbitda', unit: '' },
  'EV/Revenue':            { key: 'evRevenue', unit: '' },
  'Enterprise Value':      { key: 'enterpriseValue', unit: '$' },
  'Current ratio':         { key: 'currentRatio', unit: '' },
  'Quick ratio':           { key: 'quickRatio', unit: '' },
  'Cash ratio':            { key: 'cashRatio', unit: '' },
  'Gross Margin':          { key: 'grossMargin', unit: '%' },
  'Interest Coverage Ratio': { key: 'interestCoverage', unit: '' },
  'PEG Ratio':             { key: 'peg', unit: '' },
  'Sales growth 3Years':   { key: 'salesGrowth3y', unit: '%' },
  'Sales growth 5Years':   { key: 'salesGrowth5y', unit: '%' },
  'Profit growth 3Years':  { key: 'profitGrowth3y', unit: '%' },
  'Profit growth 5Years':  { key: 'profitGrowth5y', unit: '%' },
  'Average ROE 3Years':    { key: 'avgRoe3y', unit: '%' },
  'Average ROE 5Years':    { key: 'avgRoe5y', unit: '%' },
  'Change %':              { key: 'changePct', unit: '%' },
  'Sector':                { key: 'sector', unit: '', string: true },
}
const normalizeMetricName = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const METRIC_LOOKUP = Object.entries(METRICS).reduce((acc, [name, def]) => {
  acc[normalizeMetricName(name)] = { name, def }
  return acc
}, {})

const SECTORS = ['Technology','Healthcare','Financials','Consumer Cyclical','Consumer Defensive','Industrials','Energy','Utilities','Real Estate','Basic Materials','Communication Services']

// Parse screener.in-style query: "Market Capitalization > 500 AND P/E < 30"
function parseQuery(q) {
  const conditions = []
  const parts = q.split(/\s+AND\s+/i)
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    // Match "metric op value"
    const m = trimmed.match(/^(.+?)\s*(>=|<=|>|<|=)\s*(.+)$/i)
    if (!m) continue
    let metricName = m[1].trim()
    const op = m[2]
    let value = m[3].trim()
    const metricEntry = METRIC_LOOKUP[normalizeMetricName(metricName)]
    if (!metricEntry) continue
    const { def } = metricEntry
    // For string metrics like sector
    if (!def.string) {
      const num = Number(value.replace(/[$,%]/g, '').replace(/,/g, '').trim())
      if (isNaN(num)) continue
      value = def.key === 'marketCap' ? num * 1e6 : num
    } else {
      value = value.replace(/^["']|["']$/g, '').trim()
      if (!value) continue
    }
    conditions.push({ metric: def.key, op, value })
  }
  return conditions
}

const SAMPLE_QUERIES = [
  { name: '🏆 Warren Buffett', q: 'ROE > 20 AND ROCE > 20 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Average ROE 5Years > 15' },
  { name: '🚀 Momentum', q: 'Change % > 0 AND Market Cap > 1000 AND ROE > 10 AND Net Margin > 5' },
  { name: '📈 High Growth', q: 'Sales growth > 20 AND Profit growth > 20 AND Net Margin > 10 AND Market Cap > 500' },
  { name: '💰 Undervalued', q: 'P/E < 15 AND P/B < 2 AND ROE > 12 AND Debt to Equity < 1 AND Net Margin > 8' },
  { name: '💵 Dividend Income', q: 'Dividend Yield > 3 AND ROE > 10 AND Debt to Equity < 1.5 AND Net Margin > 8 AND Market Cap > 2000' },
  { name: 'Large Cap Value', q: 'Market Cap > 10000 AND P/E < 20 AND Return on Equity > 15' },
  { name: 'High Dividend', q: 'Dividend Yield > 3 AND Market Cap > 5000' },
  { name: 'Growth at Reasonable Price', q: 'P/E < 25 AND ROE > 20 AND Net Margin > 15' },
  { name: 'Mega Caps', q: 'Market Cap > 200000' },
  { name: 'Low Debt Quality', q: 'Debt to Equity < 0.5 AND ROE > 15 AND Market Cap > 5000' },
  { name: 'Tech High Growth', q: 'Sector = Technology AND Market Cap > 20000 AND Net Margin > 15' },
]

const SCREENER_COLUMNS = [
  { key: 'mktCap', label: 'Market Capitalization', type: 'compact' },
  { key: 'currentPrice', label: 'Current price', type: 'usd' },
  { key: 'sales', label: 'Sales', type: 'moneyM' },
  { key: 'opm', label: 'OPM', type: 'pctAbs' },
  { key: 'grossMargin', label: 'Gross Margin', type: 'pctAbs' },
  { key: 'netMargin', label: 'Net Margin', type: 'pctAbs' },
  { key: 'profitAfterTax', label: 'Profit after tax', type: 'moneyM' },
  { key: 'salesLatestQuarter', label: 'Sales latest quarter', type: 'moneyM' },
  { key: 'profitAfterTaxLatestQuarter', label: 'PAT latest quarter', type: 'moneyM' },
  { key: 'yoyQuarterlySalesGrowth', label: 'YOY Qtr sales growth', type: 'pct' },
  { key: 'yoyQuarterlyProfitGrowth', label: 'YOY Qtr profit growth', type: 'pct' },
  { key: 'pe', label: 'Price to Earning', type: 'num' },
  { key: 'dividendYield', label: 'Dividend yield', type: 'pctAbs' },
  { key: 'pb', label: 'Price to book value', type: 'num' },
  { key: 'roce', label: 'ROCE', type: 'pctAbs' },
  { key: 'roa', label: 'Return on assets', type: 'pctAbs' },
  { key: 'debtToEquity', label: 'Debt to equity', type: 'num' },
  { key: 'roe', label: 'Return on equity', type: 'pctAbs' },
  { key: 'eps', label: 'EPS', type: 'usd' },
  { key: 'debt', label: 'Debt', type: 'moneyM' },
  { key: 'earningsYield', label: 'Earnings yield', type: 'pctAbs' },
  { key: 'salesGrowth', label: 'Sales growth', type: 'pct' },
  { key: 'profitGrowth', label: 'Profit growth', type: 'pct' },
  { key: 'ps', label: 'Price to Sales', type: 'num' },
  { key: 'priceToFreeCashFlow', label: 'Price to Free Cash Flow', type: 'num' },
  { key: 'evEbitda', label: 'EV/EBITDA', type: 'num' },
  { key: 'evRevenue', label: 'EV/Revenue', type: 'num' },
  { key: 'enterpriseValue', label: 'Enterprise Value', type: 'compact' },
  { key: 'currentRatio', label: 'Current ratio', type: 'num' },
  { key: 'quickRatio', label: 'Quick ratio', type: 'num' },
  { key: 'cashRatio', label: 'Cash ratio', type: 'num' },
  { key: 'interestCoverage', label: 'Interest Coverage Ratio', type: 'num' },
  { key: 'peg', label: 'PEG Ratio', type: 'num' },
  { key: 'salesGrowth3y', label: 'Sales growth 3Years', type: 'pct' },
  { key: 'salesGrowth5y', label: 'Sales growth 5Years', type: 'pct' },
  { key: 'profitGrowth3y', label: 'Profit growth 3Years', type: 'pct' },
  { key: 'profitGrowth5y', label: 'Profit growth 5Years', type: 'pct' },
  { key: 'avgRoe5y', label: 'Average ROE 5Years', type: 'pctAbs' },
  { key: 'avgRoe3y', label: 'Average ROE 3Years', type: 'pctAbs' },
  { key: 'changePct', label: 'Change %', type: 'pct' },
]
const DEFAULT_SCREENER_COLUMNS = ['mktCap','currentPrice','pe','pb','roe','dividendYield','changePct']
const SERVER_SORTABLE_COLUMNS = new Set(SCREENER_COLUMNS.map(c => c.key))
const DEFAULT_SCREENER_SORT = { field: 'mktCap', dir: 'desc' }
const screenerColumnLabel = key => SCREENER_COLUMNS.find(c => c.key === key)?.label || key
function getScreenerColumns() {
  try {
    const saved = JSON.parse(localStorage.getItem('ds-screener-columns') || 'null')
    if (Array.isArray(saved) && saved.length) return saved.filter(k => SCREENER_COLUMNS.some(c => c.key === k))
  } catch {}
  return DEFAULT_SCREENER_COLUMNS
}
function getScreenerSort() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('ds-screener-sort') || 'null')
    if (saved && SERVER_SORTABLE_COLUMNS.has(saved.field) && (saved.dir === 'asc' || saved.dir === 'desc')) return saved
  } catch {}
  return { ...DEFAULT_SCREENER_SORT }
}
function persistScreenerSort(sort) {
  sessionStorage.setItem('ds-screener-sort', JSON.stringify(sort))
}
function renderScreenerCellStable(value, type) {
  const x = Number(value)
  if (value == null || value === '' || !Number.isFinite(x)) return '-'
  if (type === 'compact') return fmt.compact(value)
  if (type === 'usd') return fmt.usd(value)
  if (type === 'moneyM') return '$' + Number(value).toLocaleString('en-US') + 'M'
  if (type === 'pct') return fmt.pct(value)
  if (type === 'pctAbs') return fmt.pctAbs(value)
  return fmt.num(value)
}
function exportScreenerCellStable(value, type) {
  const x = Number(value)
  if (value == null || value === '' || !Number.isFinite(x)) {
    return ['num','usd','moneyM','compact','pct','pctAbs'].includes(type) ? 0 : ''
  }
  return x
}
function formatScreenerCell(value, type) {
  const x = Number(value)
  const positiveOnly = ['num','usd','moneyM','compact'].includes(type)
  if (value == null || value === '' || !Number.isFinite(x) || (positiveOnly && x <= 0)) return '—'
  if (type === 'compact') return fmt.compact(value)
  if (type === 'usd') return fmt.usd(value)
  if (type === 'moneyM') return '$' + Number(value).toLocaleString('en-US') + 'M'
  if (type === 'pct') return fmt.pct(value)
  if (type === 'pctAbs') return fmt.pctAbs(value)
  return fmt.num(value)
}

export async function renderScreenerPage(el) {
  setMeta({
    title: 'Stock Screener | DeltaScreener',
    description: 'Screen 5,000+ US stocks with custom queries. Filter by P/E, ROE, Market Cap, Net Margin, Debt/Equity and 30+ more metrics.',
    path: '/screener',
    canonical: `${SITE_ORIGIN}/screener`,
    keywords: 'stock screener, US stocks, market cap screener, PE screener, ROE screener, debt to equity screener, DeltaScreener'
  })
  const savedQ = sessionStorage.getItem('ds-query') || 'Market Cap > 10000 AND\nPrice to Earning < 30 AND\nReturn on Equity > 15'
  const PAGE_SIZE = 25
  let currentPage = Number(sessionStorage.getItem('ds-screener-page') || 1)
  let currentConditions = []
  let selectedColumns = getScreenerColumns()
  let currentSort = getScreenerSort()
  
  el.innerHTML = `
    <div class="container" style="padding:24px 16px">
      <div class="query-builder">
        <div class="query-builder-hdr">
          <span>Query</span>
          <button class="btn btn-sm btn-outline" onclick="document.getElementById('query-textarea').value=''">Clear</button>
        </div>
        <div class="query-input-wrap">
          <textarea id="query-textarea" placeholder="e.g.  Market Cap > 100 AND
       Price to Earning < 30 AND
       Return on Equity > 15">${savedQ}</textarea>
          <div id="metric-suggest" class="metric-suggest hidden"></div>
        </div>
        <div class="query-builder-foot">
          <div class="query-tip">Tip: Combine conditions with <code>AND</code>. Operators: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code>. Market Cap values are in <strong>USD millions</strong>, so <code>100</code> means <code>$100 million</code>.</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-outline" id="save-query-btn">Save Screen</button>
            <button class="btn btn-outline" id="export-query-btn" disabled>Download Excel</button>
            <button class="btn btn-outline" id="columns-btn">Edit Columns</button>
            <button class="btn btn-primary" id="run-query-btn">🔍 Run Screen</button>
          </div>
        </div>
      </div>
      
      <div class="q-help">
        <strong>Sample queries</strong> (click to try):
        <div class="quick-filters" style="margin-top:8px">
          ${SAMPLE_QUERIES.map((s, i) => `<button class="chip" onclick="setQuery(${i})">${s.name}</button>`).join('')}
        </div>
      </div>
      
      <div class="metrics-list" style="display:none" id="metrics-ref">
        <h3>Available Metrics</h3>
        <div class="metrics-grid">
          ${Object.entries(METRICS).filter((_, i, arr) => !arr.slice(0, i).some(([k, v]) => v.key === arr[i][1].key)).map(([name, def]) => `
            <button class="metric-btn" onclick="insertMetric('${name}')">${name}${def.unit ? ' <span style="color:#9ca3af">(' + def.unit + ')</span>' : ''}</button>
          `).join('')}
        </div>
      </div>
      <div style="text-align:center;margin:10px 0">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('metrics-ref').style.display=document.getElementById('metrics-ref').style.display==='none'?'block':'none'">Show/hide available metrics</button>
      </div>
      <div id="column-editor-wrap"></div>
      
      <div id="query-results" style="margin-top:20px"></div>
    </div>
  `

  window.setQuery = (i) => {
    document.getElementById('query-textarea').value = SAMPLE_QUERIES[i].q.replace(/ AND /g, ' AND\n')
    currentPage = 1
    sessionStorage.setItem('ds-screener-page', '1')
  }
  window.insertMetric = (name) => {
    const ta = document.getElementById('query-textarea')
    const pos = ta.selectionStart
    ta.value = ta.value.slice(0, pos) + name + ' > ' + ta.value.slice(pos)
    ta.focus()
    ta.setSelectionRange(pos + name.length + 3, pos + name.length + 3)
    hideMetricSuggestions()
  }
  window.toggleScreenerSort = (field) => {
    if (!SERVER_SORTABLE_COLUMNS.has(field)) return
    currentSort = currentSort.field === field
      ? { field, dir: currentSort.dir === 'desc' ? 'asc' : 'desc' }
      : { field, dir: 'desc' }
    persistScreenerSort(currentSort)
    runQuery(1)
  }
  window.setScreenerSort = (field, dir) => {
    if (!SERVER_SORTABLE_COLUMNS.has(field)) return
    if (dir !== 'asc' && dir !== 'desc') return
    currentSort = { field, dir }
    persistScreenerSort(currentSort)
    runQuery(1)
  }
  const metricSuggestEl = document.getElementById('metric-suggest')
  const queryTextarea = document.getElementById('query-textarea')
  let activeSuggestionIndex = -1
  function metricSuggestions() {
    return Object.entries(METRICS).map(([name, def]) => ({ name, def }))
  }
  function currentMetricToken() {
    const ta = queryTextarea
    const before = ta.value.slice(0, ta.selectionStart)
    const parts = before.split(/\bAND\b/i)
    return parts[parts.length - 1].trim()
  }
  function metricMatches(token) {
    const q = token.toLowerCase().trim()
    if (!q) return []
    return metricSuggestions()
      .filter(({ name, def }) => {
        const low = name.toLowerCase()
        return low.startsWith(q) || low.includes(q) || def.key.toLowerCase().startsWith(q)
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase()
        const bName = b.name.toLowerCase()
        const aStarts = aName.startsWith(q) ? 0 : 1
        const bStarts = bName.startsWith(q) ? 0 : 1
        if (aStarts !== bStarts) return aStarts - bStarts
        return aName.localeCompare(bName)
      })
      .slice(0, 20)
  }
  function normalizeAndLineBreaks(value, caret) {
    let next = value
    let nextCaret = caret
    const re = /\bAND\b(?!\n)[ \t]+/gi
    next = next.replace(re, match => {
      const replacement = 'AND\n'
      nextCaret += replacement.length - match.length
      return replacement
    })
    return { value: next, caret: nextCaret }
  }
  function hideMetricSuggestions() {
    activeSuggestionIndex = -1
    metricSuggestEl.classList.add('hidden')
    metricSuggestEl.innerHTML = ''
  }
  function applyMetricSuggestion(name) {
    const ta = queryTextarea
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = ta.value.slice(0, start)
    const after = ta.value.slice(end)
    const token = currentMetricToken()
    const tokenStart = before.lastIndexOf(token)
    const prefix = tokenStart >= 0 ? ta.value.slice(0, tokenStart) : before
    const inserted = `${name} > `
    ta.value = prefix + inserted + after
    const caret = (prefix + inserted).length
    ta.focus()
    ta.setSelectionRange(caret, caret)
    hideMetricSuggestions()
  }
  function renderMetricSuggestions() {
    const token = currentMetricToken()
    if (!token || /[><=]/.test(token)) return hideMetricSuggestions()
    const matches = metricMatches(token)
    if (!matches.length) return hideMetricSuggestions()
    metricSuggestEl.innerHTML = matches.map(({ name, def }, index) => `
      <button type="button" class="metric-suggest-item ${index === activeSuggestionIndex ? 'active' : ''}" data-name="${name.replace(/"/g, '&quot;')}">
        <span class="metric-suggest-name">${name}</span>
        <span class="metric-suggest-meta">${def.unit || 'metric'}</span>
      </button>
    `).join('')
    metricSuggestEl.classList.remove('hidden')
    Array.from(metricSuggestEl.querySelectorAll('.metric-suggest-item')).forEach((btn, index) => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault()
        applyMetricSuggestion(matches[index].name)
      })
    })
  }
  queryTextarea.addEventListener('input', () => {
    const normalized = normalizeAndLineBreaks(queryTextarea.value, queryTextarea.selectionStart)
    if (normalized.value !== queryTextarea.value) {
      queryTextarea.value = normalized.value
      queryTextarea.setSelectionRange(normalized.caret, normalized.caret)
    }
    activeSuggestionIndex = -1
    renderMetricSuggestions()
  })
  queryTextarea.addEventListener('click', renderMetricSuggestions)
  queryTextarea.addEventListener('keydown', e => {
    const buttons = Array.from(metricSuggestEl.querySelectorAll('.metric-suggest-item'))
    if (!buttons.length || metricSuggestEl.classList.contains('hidden')) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      activeSuggestionIndex = (activeSuggestionIndex + 1) % buttons.length
      renderMetricSuggestions()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      activeSuggestionIndex = activeSuggestionIndex <= 0 ? buttons.length - 1 : activeSuggestionIndex - 1
      renderMetricSuggestions()
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault()
      applyMetricSuggestion(buttons[activeSuggestionIndex].dataset.name)
    } else if (e.key === 'Escape') {
      hideMetricSuggestions()
    }
  })
  document.addEventListener('click', e => {
    if (!metricSuggestEl.contains(e.target) && e.target !== queryTextarea) hideMetricSuggestions()
  })
  function renderColumnEditorPanel(open = false) {
    const wrap = document.getElementById('column-editor-wrap')
    if (!wrap) return
    wrap.innerHTML = `
      <div class="column-editor ${open ? 'open' : ''}" id="column-editor">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">
          <strong>Choose screener columns</strong>
          <button class="btn btn-outline btn-sm" onclick="resetScreenerColumns()">Reset</button>
        </div>
        <div class="column-grid">
          ${SCREENER_COLUMNS.map(c => `
            <label class="column-check">
              <input type="checkbox" ${selectedColumns.includes(c.key) ? 'checked' : ''} onchange="setScreenerColumn('${c.key}', this.checked)">
              <span>${c.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }
  window.toggleColumnEditor = () => {
    const panel = document.getElementById('column-editor')
    if (!panel) return
    panel.classList.toggle('open')
    const isOpen = panel.classList.contains('open')
    sessionStorage.setItem('ds-screener-columns-open', isOpen ? '1' : '0')
    persistUserPreferences({ screenerColumnsOpen: isOpen })
  }
  window.setScreenerColumn = (key, checked) => {
    selectedColumns = checked ? [...new Set([...selectedColumns, key])] : selectedColumns.filter(k => k !== key)
    if (!selectedColumns.length) selectedColumns = ['mktCap']
    localStorage.setItem('ds-screener-columns', JSON.stringify(selectedColumns))
    renderColumnEditorPanel(true)
    sessionStorage.setItem('ds-screener-columns-open', '1')
    persistUserPreferences({ screenerColumns: selectedColumns, screenerColumnsOpen: true })
    renderQueryResults(document.getElementById('query-results'), window.lastScreenerResponse || { results: [] }, currentConditions)
  }
  window.resetScreenerColumns = () => {
    selectedColumns = [...DEFAULT_SCREENER_COLUMNS]
    localStorage.setItem('ds-screener-columns', JSON.stringify(selectedColumns))
    renderColumnEditorPanel(true)
    sessionStorage.setItem('ds-screener-columns-open', '1')
    persistUserPreferences({ screenerColumns: selectedColumns, screenerColumnsOpen: true })
    renderQueryResults(document.getElementById('query-results'), window.lastScreenerResponse || { results: [] }, currentConditions)
  }
  
  renderColumnEditorPanel(sessionStorage.getItem('ds-screener-columns-open') === '1')
  document.getElementById('run-query-btn').addEventListener('click', () => runQuery(1))
  document.getElementById('save-query-btn').addEventListener('click', saveCurrentQuery)
  document.getElementById('columns-btn').addEventListener('click', toggleColumnEditor)
  document.getElementById('export-query-btn').addEventListener('click', exportScreenerResults)
  runQuery(currentPage)

  function setExportButtonState(enabled, label = 'Download Excel') {
    const btn = document.getElementById('export-query-btn')
    if (!btn) return
    btn.disabled = !enabled
    btn.textContent = label
  }

  function exportScreenerCell(value, type) {
    const x = Number(value)
    const positiveOnly = ['num','usd','moneyM','compact'].includes(type)
    if (value == null || value === '' || !Number.isFinite(x) || (positiveOnly && x <= 0)) return ''
    return x
  }

  exportScreenerCell = function(value, type) {
    const x = Number(value)
    if (value == null || value === '' || !Number.isFinite(x)) return ''
    return x
  }

  function toCsvCell(value) {
    const text = String(value ?? '')
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  function getVisibleScreenerTableRows() {
    const table = document.querySelector('#query-results table.tbl')
    if (!table) return { headers: [], rows: [] }
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim()).filter(Boolean)
    const bodyRows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
    ).filter(row => row.length)
    return { headers, rows: bodyRows }
  }

  function downloadSpreadsheet(filename, headers, rows, title) {
    const csvRows = [
      [title],
      headers,
      ...rows
    ].map(row => row.map(toCsvCell).join(',')).join('\r\n')
    const blob = new Blob(['\ufeff', csvRows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    requestAnimationFrame(() => {
      link.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
        link.remove()
      }, 1000)
    })
  }

  async function exportScreenerResults() {
    if (!currentConditions.length) return
    const activeCols = SCREENER_COLUMNS.filter(c => selectedColumns.includes(c.key))
    setExportButtonState(false, 'Preparing Excel…')
    try {
      const rows = Array.isArray(window.lastScreenerResponse?.results) ? window.lastScreenerResponse.results : []
      if (rows.length) {
        const headers = ['#', 'Ticker', 'Company', ...activeCols.map(c => c.label)]
        const dataRows = rows.map((s, index) => [
          index + 1,
          s.ticker || '',
          s.name || '',
          ...activeCols.map(c => exportScreenerCellStable(s[c.key], c.type))
        ])
        const title = `DeltaScreener Export | Current screener results | ${currentConditions.map(c => `${c.metric} ${c.op} ${c.value}`).join(' | ')}`
        downloadSpreadsheet(`deltascreener-${new Date().toISOString().slice(0,10)}.csv`, headers, dataRows, title)
        setExportButtonState(true)
        return
      }
      const visible = getVisibleScreenerTableRows()
      if (!visible.rows.length) {
        alert('No screener rows available to export.')
        setExportButtonState(false)
        return
      }
      const title = `DeltaScreener Export | Visible screener rows | ${currentConditions.map(c => `${c.metric} ${c.op} ${c.value}`).join(' | ')}`
      downloadSpreadsheet(`deltascreener-${new Date().toISOString().slice(0,10)}.csv`, visible.headers, visible.rows, title)
      setExportButtonState(true)
    } catch (e) {
      alert('Could not export screen: ' + e.message)
      setExportButtonState(true)
    }
  }
  window.exportScreenerResults = exportScreenerResults

  function showSignInModal(message) {
    const existing = document.getElementById('ds-signin-modal')
    if (existing) existing.remove()
    const modal = document.createElement('div')
    modal.id = 'ds-signin-modal'
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(2px)'
    modal.innerHTML = `
      <div style="background:#1e2433;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:36px 32px;max-width:380px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,.5);text-align:center;position:relative">
        <button id="ds-signin-modal-close" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#9ca3af;font-size:22px;cursor:pointer;line-height:1">×</button>
        <div style="font-size:32px;margin-bottom:12px">🔖</div>
        <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:20px;font-weight:700;color:#f9fafb;margin:0 0 8px;line-height:1.3">${message}</h2>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Sign in with Google — it's free and takes 5 seconds. Your screens and watchlist sync across devices.</p>
        <div id="ds-signin-modal-btn" style="display:flex;justify-content:center"></div>
      </div>
    `
    document.body.appendChild(modal)
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove() })
    document.getElementById('ds-signin-modal-close').addEventListener('click', () => modal.remove())
    const btnSlot = document.getElementById('ds-signin-modal-btn')
    if (window.google?.accounts?.id) {
      if (!window.__dsGoogleInitDone) {
        google.accounts.id.initialize({ client_id: GCID, callback: handleGoogleCredential })
        window.__dsGoogleInitDone = true
      }
      google.accounts.id.renderButton(btnSlot, { theme: 'filled_blue', size: 'large', type: 'standard', shape: 'pill', text: 'signin_with' })
    } else {
      btnSlot.innerHTML = `<p style="color:#f87171;font-size:13px">Google Sign-In failed to load. Please refresh and try again.</p>`
    }
  }

  async function saveCurrentQuery() {
    if (!auth.signedIn()) {
      showSignInModal('Save this screen for later')
      return
    }
    const q = document.getElementById('query-textarea').value.trim()
    if (!q) return
    const name = prompt('Screen name', q.split('\n')[0].slice(0, 40) || 'My screen')
    if (!name) return
    try {
      await apiJson('/user/screens', { name, query: q })
      alert('Screen saved.')
    } catch (e) {
      if (/unauthorized|sign in/i.test(e.message || '')) {
        const refreshed = await refreshGoogleSession()
        if (refreshed) {
          try {
            await apiJson('/user/screens', { name, query: q })
            alert('Screen saved.')
            return
          } catch {}
        }
        auth.clear()
        render()
        alert('Your sign-in expired. Please sign in with Google again, then save the screen.')
        return
      }
      alert('Could not save screen: ' + e.message)
    }
  }
  
  async function runQuery(page = 1) {
    const q = document.getElementById('query-textarea').value
    sessionStorage.setItem('ds-query', q)
    persistUserPreferences({ screenerQuery: q })
    currentPage = Math.max(1, Number(page) || 1)
    sessionStorage.setItem('ds-screener-page', String(currentPage))
    const conditions = parseQuery(q)
    currentConditions = conditions
    const resultsEl = document.getElementById('query-results')
    
    if (conditions.length === 0) {
      setExportButtonState(false)
      resultsEl.innerHTML = '<div class="error">Could not parse any conditions. Try: <code>Market Cap &gt; 100 AND P/E &lt; 30</code></div>'
      return
    }
    
    resultsEl.innerHTML = '<div class="spinner"></div>'
    try {
      const res = await apiJson('/screener/custom', { conditions, page: currentPage, limit: PAGE_SIZE, sort: currentSort })
      window.lastScreenerResponse = res
      renderQueryResults(resultsEl, res, conditions)
    } catch (e) {
      resultsEl.innerHTML = '<div class="error">Screener error: ' + e.message + '</div>'
    }
  }
  
  function renderQueryResults(el, res, conditions) {
    const results = res.results || []
    const total = Number(res.total || results.length)
    const screenableUniverse = Number(res.screenableUniverse || total || 0)
    const page = Number(res.page || currentPage || 1)
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    if (page > totalPages && totalPages > 0) { runQuery(totalPages); return }
    const pillsHtml = conditions.map(c => `<span class="filter-pill">${c.metric} ${c.op} ${c.value}</span>`).join('')
    const startNo = (page - 1) * PAGE_SIZE
    const pageNums = []
    const from = Math.max(1, page - 2), to = Math.min(totalPages, page + 2)
    if (from > 1) pageNums.push(1)
    if (from > 2) pageNums.push('...')
    for (let i = from; i <= to; i++) pageNums.push(i)
    if (to < totalPages - 1) pageNums.push('...')
    if (to < totalPages) pageNums.push(totalPages)
    const pagerHtml = totalPages > 1 ? `
      <div class="pager">
        <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="runScreenerPage(${page - 1})">Prev</button>
        ${pageNums.map(p => p === '...' ? `<span style="padding:0 6px;color:#9ca3af">...</span>` : `<button class="page-btn ${p === page ? 'active' : ''}" onclick="runScreenerPage(${p})">${p}</button>`).join('')}
        <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="runScreenerPage(${page + 1})">Next</button>
      </div>
    ` : ''
    const activeCols = SCREENER_COLUMNS.filter(c => selectedColumns.includes(c.key))
    const sortLabel = screenerColumnLabel(currentSort.field)
    const sortDirectionText = currentSort.dir === 'desc' ? 'Top to bottom' : 'Bottom to top'
    
    if (results.length === 0) {
      setExportButtonState(false)
      el.innerHTML = `
        <div style="margin-bottom:12px">${pillsHtml}</div>
        <div class="card"><div class="empty">No stocks match these criteria. Try loosening your conditions.</div></div>
      `
      return
    }
    setExportButtonState(true)
    
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div><strong>${total}</strong> stocks found <span style="color:#9ca3af">(out of ${screenableUniverse.toLocaleString('en-US')} screenable, page ${page} of ${totalPages}, showing ${results.length})</span></div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" onclick="exportScreenerResults()">Download Excel</button><button class="btn btn-outline btn-sm" onclick="toggleColumnEditor()">Edit Columns</button><div>${pillsHtml}</div></div>
      </div>
      <div class="screener-sort-summary">Sorted by <strong>${sortLabel}</strong> · ${sortDirectionText}</div>
      <div class="card">
        <div class="tbl-scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                ${activeCols.map(c => {
                  if (!SERVER_SORTABLE_COLUMNS.has(c.key)) return `<th>${c.label}</th>`
                  const isActive = currentSort.field === c.key
                  return `
                    <th class="sortable screener-sort-th" title="Sort by ${c.label}">
                      <button type="button" class="sort-label-btn" data-sort-field="${c.key}">${c.label}</button>
                      <span class="sort-actions">
                        <button type="button" class="sort-icon-btn ${isActive && currentSort.dir === 'desc' ? 'active' : ''}" data-sort-field="${c.key}" data-sort-dir="desc" title="Top to bottom">↓</button>
                        <button type="button" class="sort-icon-btn ${isActive && currentSort.dir === 'asc' ? 'active' : ''}" data-sort-field="${c.key}" data-sort-dir="asc" title="Bottom to top">↑</button>
                      </span>
                    </th>
                  `
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${results.map((s, i) => `
                <tr>
                  <td style="color:#9ca3af">${startNo + i + 1}</td>
                  <td data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" style="cursor:pointer"><a href="${routeHref(`/stock/${s.ticker}`)}" data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" class="stock-link screener-company"><strong>${s.ticker}</strong><span>${s.name || ''}</span></a></td>
                  ${activeCols.map(c => `<td class="${['pct','pctAbs'].includes(c.type) ? fmt.pctClass(s[c.key]) : ''}">${renderScreenerCellStable(s[c.key], c.type)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      ${pagerHtml}
    `
    el.querySelectorAll('.sort-label-btn').forEach(btn => {
      btn.addEventListener('click', ev => {
        ev.preventDefault()
        ev.stopPropagation()
        const field = btn.dataset.sortField
        if (field) window.toggleScreenerSort(field)
      })
    })
    el.querySelectorAll('.sort-icon-btn').forEach(btn => {
      btn.addEventListener('click', ev => {
        ev.preventDefault()
        ev.stopPropagation()
        const field = btn.dataset.sortField
        const dir = btn.dataset.sortDir
        if (field && dir) window.setScreenerSort(field, dir)
      })
    })
    bindRouteElements(el)

    // Show save nudge for anonymous users after results load
    if (!auth.signedIn() && results.length > 0) {
      const nudgeId = 'ds-save-nudge'
      if (!document.getElementById(nudgeId)) {
        const nudge = document.createElement('div')
        nudge.id = nudgeId
        nudge.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;padding:14px 18px;border-radius:14px;background:rgba(15,118,110,0.1);border:1px solid rgba(15,118,110,0.25);flex-wrap:wrap'
        nudge.innerHTML = `
          <span style="font-size:14px;color:#d1faf4">💾 <strong style="color:#5eead4">Sign in free</strong> to save this screen and access it anytime.</span>
          <div style="display:flex;gap:8px;align-items:center">
            <button id="ds-nudge-signin-btn" style="padding:8px 18px;border-radius:20px;background:#0f766e;color:#fff;border:none;font-weight:700;font-size:13px;cursor:pointer">Save Screen</button>
            <button id="ds-nudge-dismiss-btn" style="background:none;border:none;color:#6b7280;font-size:18px;cursor:pointer;line-height:1;padding:0 4px">×</button>
          </div>
        `
        el.appendChild(nudge)
        document.getElementById('ds-nudge-signin-btn').addEventListener('click', () => {
          nudge.remove()
          showSignInModal('Save this screen for later')
        })
        document.getElementById('ds-nudge-dismiss-btn').addEventListener('click', () => nudge.remove())
      }
    }
  }
  window.runScreenerPage = (p) => {
    runQuery(p)
    document.getElementById('query-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
route('/screener', renderScreenerPage)

// ═══════════════════════════════════════════════════════════════════════
// WATCHLIST PAGE
// ═══════════════════════════════════════════════════════════════════════
export async function renderWatchlistPage(el) {
  setMeta({
    title: 'Watchlist | DeltaScreener',
    description: 'Track your saved stocks, monitor price moves, and keep your best ideas in one place.',
    path: '/watchlist',
    noindex: !auth.signedIn()
  })
  let items = watchlist.get()
  if (auth.signedIn()) {
    try {
      const data = await api('/user/watchlist')
      if (Array.isArray(data.watchlist)) {
        items = data.watchlist.map(x => normalizeWatchItem({ ticker: x.ticker, name: x.name, price: x.price, exchange: x.exchange, change: x.change, changePct: x.change_pct, addedAt: x.added_at })).filter(Boolean)
      }
    } catch {}
  }
  const needsEnrichment = items.some(x => !x.exchange || x.change == null || x.changePct == null || x.price == null || !x.name)
  if (needsEnrichment) {
    const enriched = await Promise.all(items.map(async item => {
      if (item.exchange && item.change != null && item.changePct != null && item.price != null && item.name) return item
      try {
        const ov = await api(`/stock/${item.ticker}/overview`)
        return {
          ...item,
          exchange: item.exchange || ov.exchange || '—',
          change: item.change ?? ov.change ?? null,
          changePct: item.changePct ?? ov.changePct ?? null,
          price: item.price ?? ov.price ?? null,
          name: item.name || ov.name || item.ticker,
        }
      } catch {
        return item
      }
    }))
    items = enriched
    if (auth.signedIn()) {
      await Promise.all(items
        .map(normalizeWatchItem)
        .filter(item => item?.ticker && watchItemHasDetails(item))
        .map(item => apiJson('/user/watchlist', item).catch(() => null)))
    }
  }
  localStorage.setItem('ds-watchlist', JSON.stringify(items.map(normalizeWatchItem).filter(Boolean)))
  
  if (items.length === 0) {
    el.innerHTML = `
      <div class="container" style="padding:60px 16px;text-align:center">
        <div style="font-size:48px;margin-bottom:16px">⭐</div>
        <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Your watchlist is empty</h1>
        <p style="color:#6b7280;margin-bottom:20px">Search for stocks and click Save to add them here.</p>
        <a href="${routeHref('/')}" class="btn btn-primary" data-route="/" onclick="navigate('/');return false">Browse Stocks</a>
      </div>
    `
    return
  }
  
  el.innerHTML = `
    <div class="container" style="padding:24px 16px">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:16px">My Watchlist <span style="color:#6b7280;font-size:14px;font-weight:400">(${items.length})</span></h1>
      <div class="card">
        <div class="tbl-scroll">
          <table class="tbl">
            <thead>
              <tr>
                <th style="text-align:left">Company</th>
                <th>Exchange</th>
                <th>Price</th>
                <th>Change %</th>
                <th>Change</th>
                <th style="width:40px"></th>
              </tr>
            </thead>
            <tbody>
              ${items.map(x => `
                <tr>
                  <td data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" style="cursor:pointer"><a href="${routeHref(`/stock/${x.ticker}`)}" data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" class="stock-link"><strong style="color:#2962ff">${x.ticker}</strong> <span style="color:#6b7280;font-size:12px">${x.name || ''}</span></a></td>
                  <td style="font-size:12px">${x.exchange || '—'}</td>
                  <td>${fmt.usd(x.price)}</td>
                  <td class="${fmt.pctClass(x.changePct)}">${fmt.pct(x.changePct)}</td>
                  <td class="${fmt.pctClass(x.change)}">${x.change != null ? (x.change >= 0 ? '+' : '') + fmt.usd(Math.abs(x.change)).slice(1) : '—'}</td>
                  <td><button class="btn btn-sm btn-outline" data-stop-route="1" onclick="removeFromWatch('${x.ticker}')">✕</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
  
  window.removeFromWatch = (t) => {
    watchlist.remove(t)
    render()
  }
}
route('/watchlist', renderWatchlistPage)

// ═══════════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════════════════
export async function renderProfilePage(el) {
  setMeta({
    title: 'Profile | DeltaScreener',
    description: 'Manage your DeltaScreener account, saved screens, and synced watchlist.',
    path: '/profile',
    noindex: true
  })
  const user = auth.user()
  if (!auth.signedIn() || !user) {
    el.innerHTML = `
      <div class="container" style="padding:60px 16px;text-align:center">
        <h1 style="font-size:28px;font-weight:800;margin-bottom:8px">Profile</h1>
        <p style="color:#787b86;margin-bottom:20px">Sign in with Google to save screens and sync your watchlist.</p>
      </div>
    `
    return
  }

  el.innerHTML = `
    <div class="container" style="padding:28px 16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px">
        <div>
          <h1 style="font-size:32px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px">${user.name || 'Profile'}</h1>
          <div style="color:#787b86">${user.email || ''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
          ${user.picture ? `<img src="${user.picture}" alt="" style="width:48px;height:48px;border-radius:50%">` : ''}
          <button class="btn btn-outline" onclick="signOut()">Logout</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">
          <h2>Saved Screens</h2>
          <span id="screen-count" style="font-size:13px;color:#787b86">Loading...</span>
        </div>
        <div id="saved-screens-body"><div class="spinner"></div></div>
      </div>
    </div>
  `

  try {
    const data = await api('/user/screens')
    const screens = data.screens || []
    document.getElementById('screen-count').textContent = screens.length + ' saved'
    const body = document.getElementById('saved-screens-body')
    if (!screens.length) {
      body.innerHTML = '<div class="empty">No saved screens yet. Open Screener, write a query, then click Save Screen.</div>'
      return
    }
    body.innerHTML = `
      <div class="tbl-scroll">
        <table class="tbl">
          <thead><tr><th>Name</th><th>Query</th><th>Created</th><th></th></tr></thead>
          <tbody>
            ${screens.map(s => `
              <tr>
                <td><strong>${s.name || 'Saved screen'}</strong></td>
                <td style="text-align:left;white-space:normal;max-width:700px;color:#434651">${String(s.query || '').replace(/\n/g, ' AND ')}</td>
                <td style="color:#787b86">${fmt.date(s.created_at)}</td>
                <td>
                  <button class="btn btn-sm btn-primary" onclick='openSavedScreen(${JSON.stringify(s.query || '')})'>Open</button>
                  <button class="btn btn-sm btn-outline" onclick="deleteSavedScreen(${s.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  } catch (e) {
    document.getElementById('saved-screens-body').innerHTML = '<div class="error">Could not load saved screens.</div>'
  }
}
route('/profile', renderProfilePage)

function renderLegalPage(el, title, bodyHtml, path) {
  setMeta({
    title: `${title} | DeltaScreener`,
    description: `${title} for DeltaScreener.`,
    path
  })
  el.innerHTML = `
    <div class="container" style="padding:32px 16px 56px;max-width:900px">
      <h1 style="font-size:32px;font-weight:800;margin-bottom:16px">${title}</h1>
      <div class="card" style="padding:24px;line-height:1.75;color:#434651">${bodyHtml}</div>
    </div>
  `
}

export async function renderPrivacyPage(el) {
  renderLegalPage(el, 'Privacy Policy', `
    <p>DeltaScreener uses Google Sign-In to authenticate users and stores account data needed to operate saved screens, watchlists, and synced preferences.</p>
    <p>We store your basic profile information from Google, including your name, email address, and profile image, along with account activity required to maintain your session and personal data.</p>
    <p>We use cookies for secure session authentication. We do not intentionally store authentication tokens in browser-accessible storage.</p>
    <p>Market data displayed on the platform may come from third-party providers including Yahoo Finance, SEC EDGAR, FMP, Alpha Vantage, and other public sources.</p>
    <p>If you want your account data removed, contact us at <a href="mailto:contact@deltascreener.com">contact@deltascreener.com</a>.</p>
  `, '/privacy')
}
route('/privacy', renderPrivacyPage)

export async function renderTermsPage(el) {
  renderLegalPage(el, 'Terms of Service', `
    <p>DeltaScreener is provided for informational and research purposes only. Nothing on this site constitutes investment advice, tax advice, legal advice, or a recommendation to buy or sell securities.</p>
    <p>You are responsible for your own investment decisions and for verifying any market data before relying on it.</p>
    <p>We may use third-party data providers and public sources. Data may be delayed, incomplete, or inaccurate from time to time.</p>
    <p>You agree not to abuse, scrape, attack, or disrupt the service. We may suspend access to protect the platform and its users.</p>
    <p>By using DeltaScreener, you agree to these terms and to our privacy policy.</p>
  `, '/terms')
}
route('/terms', renderTermsPage)

// Blog routes — handled entirely by the early-return in render() above
function renderBlogPrerender() {}
route('/blog', renderBlogPrerender)
route('/blog/:slug', renderBlogPrerender)

async function deleteSavedScreen(id) {
  if (!confirm('Delete this saved screen?')) return
  try {
    await apiDelete('/user/screens', { id })
    render()
  } catch (e) {
    alert('Could not delete screen: ' + e.message)
  }
}
window.deleteSavedScreen = deleteSavedScreen

// ═══════════════════════════════════════════════════════════════════════
// INIT
// Blog routes use light styles — don't apply dark theme on these pages
const _initPath = location.pathname
if (_initPath !== '/blog' && !_initPath.startsWith('/blog/')) {
  theme.apply(theme.get())
}
render().then(trackPageView)
validateSession()
  .then(ok => ok ? syncUserData() : null)
  .finally(render)
// ═══════════════════════════════════════════════════════════════════════
