// v20260704-dataquality
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
// ANALYTICS TRACKING
// ═══════════════════════════════════════════════════════════════════════
export function trackEvent(eventName, params = {}) {
  if (window.gtag) {
    window.gtag('event', eventName, params)
  }
}

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

// ═══════════════════════════════════════════════════════════════════════
// PRO STATUS (Gumroad)
// ═══════════════════════════════════════════════════════════════════════
const GUMROAD_URL = 'https://acherjeeanirban.gumroad.com/l/acuvpw'

const pro = {
  _cache: null,   // { email, isPro, ts }
  _ttl: 5 * 60 * 1000,  // 5 min

  getEmail() {
    try { return sessionStorage.getItem('ds-pro-email') || '' } catch { return '' }
  },
  setEmail(email) {
    try { sessionStorage.setItem('ds-pro-email', email.toLowerCase().trim()) } catch {}
  },

  async check(email) {
    const e = (email || this.getEmail()).toLowerCase().trim()
    if (!e) return false
    if (this._cache && this._cache.email === e && Date.now() - this._cache.ts < this._ttl) {
      return this._cache.isPro
    }
    try {
      const res = await fetch(`/api/pro-status?email=${encodeURIComponent(e)}`)
      const data = await res.json()
      this._cache = { email: e, isPro: !!data.pro, ts: Date.now() }
      if (data.pro) this.setEmail(e)
      return !!data.pro
    } catch {
      return false
    }
  },

  isPro() {
    // Fast synchronous check — returns cached value or false
    if (this._cache && Date.now() - this._cache.ts < this._ttl) return this._cache.isPro
    return false
  },

  // Best email we can guess for an auto-unlock: a remembered checkout email,
  // a previously-verified Pro email, or the logged-in Google account email.
  bestKnownEmail() {
    try {
      const checkout = sessionStorage.getItem('ds-checkout-email') || ''
      if (checkout) return checkout
    } catch {}
    const stored = this.getEmail()
    if (stored) return stored
    try {
      const u = (typeof auth !== 'undefined' && auth.user && auth.user()) || null
      if (u && u.email) return u.email.toLowerCase().trim()
    } catch {}
    return ''
  },

  // After checkout, the Gumroad Ping webhook upserts the buyer into the DB,
  // but that round-trip takes a few seconds. Poll pro-status with the buyer's
  // email until it flips to Pro, then unlock with zero retyping.
  async pollUnlock(email, { tries = 12, interval = 2500, onUnlock } = {}) {
    const e = (email || this.bestKnownEmail()).toLowerCase().trim()
    if (!e) return false
    for (let i = 0; i < tries; i++) {
      // Bust the 5-min cache so each poll hits the API fresh.
      this._cache = null
      const isPro = await this.check(e)
      if (isPro) {
        this.setEmail(e)
        if (typeof onUnlock === 'function') onUnlock(e)
        return true
      }
      await new Promise(r => setTimeout(r, interval))
    }
    return false
  },

  async showUpgradeModal() {
    const existing = document.getElementById('ds-pro-modal')
    if (existing) existing.remove()
    const modal = document.createElement('div')
    modal.id = 'ds-pro-modal'
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(3px)'
    const featRow = (label) => `<li style="display:flex;align-items:center;gap:10px;font-size:13.5px;color:#cbd5e1;line-height:1.5"><svg width="15" height="15" viewBox="0 0 20 20" fill="none" style="flex-shrink:0"><path d="M16.5 5.5L8 14L3.5 9.5" stroke="#2dd4bf" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>${label}</li>`
    modal.innerHTML = `
      <div style="background:#141a26;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:32px 30px 28px;max-width:380px;width:92%;box-shadow:0 24px 64px rgba(0,0,0,.55);position:relative">
        <button id="ds-pro-modal-close" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#6b7280;font-size:20px;cursor:pointer;line-height:1">×</button>
        <div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">DeltaScreener Pro</div>
        <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:18px">
          <span style="font-size:36px;font-weight:800;color:#f9fafb;line-height:1;letter-spacing:-.02em">$5</span>
          <span style="font-size:14px;color:#6b7280;font-weight:500">/ month</span>
        </div>
        <ul style="list-style:none;padding:0;margin:0 0 22px;display:flex;flex-direction:column;gap:11px">
          ${featRow('Unlimited saved screens')}
          ${featRow('Export to Excel &amp; CSV')}
          ${featRow('Email alerts on price &amp; filters')}
          ${featRow('Priority support')}
        </ul>
        <a href="${GUMROAD_URL}?wanted=true" data-gumroad-overlay-checkout="true" style="display:block;text-align:center;padding:13px 20px;border-radius:11px;background:#2dd4bf;color:#0a0f1a;text-decoration:none;font-weight:700;font-size:14.5px;letter-spacing:.01em">Upgrade to Pro</a>
        <div style="text-align:center;font-size:12px;color:#6b7280;margin-top:12px">Secure checkout via Gumroad · Cancel anytime</div>
        <div style="height:1px;background:rgba(255,255,255,.07);margin:22px 0 18px"></div>
        <div style="color:#94a3b8;font-size:12.5px;margin-bottom:10px">Already subscribed? Verify your email:</div>
        <div style="display:flex;gap:8px">
          <input id="ds-pro-email-input" type="email" placeholder="you@email.com" value="${escapeHtml(pro.bestKnownEmail())}" style="flex:1;padding:10px 13px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:#0d1320;color:#f3f4f6;font-size:13.5px;outline:none" />
          <button id="ds-pro-verify-btn" style="padding:10px 16px;border-radius:9px;background:#26303f;color:#e2e8f0;border:1px solid rgba(255,255,255,.1);cursor:pointer;font-weight:600;font-size:13.5px;white-space:nowrap">Verify</button>
        </div>
        <div id="ds-pro-verify-msg" style="font-size:12.5px;margin-top:10px;min-height:16px"></div>
      </div>
    `
    document.body.appendChild(modal)
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove() })
    document.getElementById('ds-pro-modal-close').addEventListener('click', () => modal.remove())
    // When the user clicks "Upgrade to Pro", remember the best-known email so we
    // can auto-verify after checkout. The overlay listener (below) starts polling.
    const upgradeBtn = modal.querySelector('[data-gumroad-overlay-checkout]')
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        const known = pro.bestKnownEmail()
        if (known) { try { sessionStorage.setItem('ds-checkout-email', known) } catch {} }
      })
    }
    document.getElementById('ds-pro-verify-btn').addEventListener('click', async () => {
      const email = document.getElementById('ds-pro-email-input').value.trim()
      const msg = document.getElementById('ds-pro-verify-msg')
      const btn = document.getElementById('ds-pro-verify-btn')
      if (!email) { msg.style.color = '#f87171'; msg.textContent = 'Please enter your email.'; return }
      btn.textContent = 'Checking…'; btn.disabled = true
      const isPro = await pro.check(email)
      btn.textContent = 'Verify'; btn.disabled = false
      if (isPro) {
        msg.style.color = '#2dd4bf'
        msg.textContent = 'Pro unlocked. Excel export is now available.'
        setTimeout(() => modal.remove(), 1500)
      } else {
        msg.style.color = '#f87171'
        msg.textContent = 'No active Pro subscription found for this email.'
      }
    })
    // Allow Enter key in the email field
    document.getElementById('ds-pro-email-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('ds-pro-verify-btn').click()
    })
  }
}
window.pro = pro

// ── On-site Gumroad checkout overlay ──────────────────────────────────
// Self-contained: does NOT depend on gumroad.js (which is unreliable in an
// SPA because it binds once at load and the router re-renders the DOM).
// A single document-level delegated listener catches every overlay CTA —
// SSR buttons, SPA-rendered buttons, and the dynamic upgrade modal alike —
// and opens the Gumroad product in an iframe overlay on deltascreener.com.
function openGumroadOverlay(productUrl) {
  document.getElementById('ds-gr-overlay')?.remove()
  let src = productUrl
  // Force the embedded checkout view + transparent chrome
  if (!/[?&]wanted=/.test(src)) src += (src.includes('?') ? '&' : '?') + 'wanted=true'
  const ov = document.createElement('div')
  ov.id = 'ds-gr-overlay'
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(8,11,18,.78);backdrop-filter:blur(4px);padding:24px'
  ov.innerHTML = `
    <button id="ds-gr-close" aria-label="Close" style="position:absolute;top:18px;right:22px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.18);background:rgba(20,26,38,.9);color:#e2e8f0;font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center">×</button>
    <div style="width:100%;max-width:760px;height:88vh;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.6);position:relative">
      <div id="ds-gr-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#6b7280;font:600 14px Inter,system-ui,sans-serif;background:#fff">Loading secure checkout…</div>
      <iframe src="${src}" title="DeltaScreener Pro checkout" style="width:100%;height:100%;border:0;position:relative;z-index:1" onload="var l=document.getElementById('ds-gr-loading');if(l)l.style.display='none'"></iframe>
    </div>`
  document.body.appendChild(ov)
  document.body.style.overflow = 'hidden'

  let purchased = false

  // Listen for Gumroad's checkout success postMessage. Gumroad emits an event
  // when the purchase completes; payloads vary, so we sniff broadly for a
  // success signal and any email field it may include.
  function onGumroadMessage(ev) {
    if (!/gumroad\.com$/.test((() => { try { return new URL(ev.origin).hostname } catch { return '' } })()) &&
        !/\.gumroad\.com$/.test((() => { try { return new URL(ev.origin).hostname } catch { return '' } })())) return
    let d = ev.data
    if (typeof d === 'string') { try { d = JSON.parse(d) } catch { d = { raw: d } } }
    const blob = JSON.stringify(d || '').toLowerCase()
    const looksLikeSuccess = /purchase|success|sale|receipt|thank|complete/.test(blob)
    if (!looksLikeSuccess) return
    purchased = true
    // Try to capture the buyer email Gumroad may have included.
    const email = (d && (d.email || d.purchaser_email || (d.purchase && d.purchase.email))) || ''
    if (email) { try { sessionStorage.setItem('ds-checkout-email', String(email).toLowerCase().trim()) } catch {} }
    startAutoUnlock()
  }
  window.addEventListener('message', onGumroadMessage)

  function startAutoUnlock() {
    const email = pro.bestKnownEmail()
    if (!email) {
      // No email to poll — fall back to the verify modal, pre-focused.
      pro.showUpgradeModal()
      setTimeout(() => { const inp = document.getElementById('ds-pro-email-input'); if (inp) inp.focus() }, 50)
      return
    }
    // Show a lightweight "activating Pro…" state on the overlay if still open.
    const loading = document.getElementById('ds-gr-loading')
    if (loading) { loading.style.display = 'flex'; loading.textContent = 'Activating your Pro access…' }
    pro.pollUnlock(email, {
      onUnlock: () => {
        close()
        if (typeof render === 'function') { try { render() } catch {} }
        const t = document.createElement('div')
        t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:100001;background:#0f1d1a;border:1px solid rgba(45,212,191,.4);color:#2dd4bf;padding:13px 22px;border-radius:11px;font:600 14px Inter,system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5)'
        t.textContent = '✓ Pro unlocked — thanks for upgrading!'
        document.body.appendChild(t)
        setTimeout(() => t.remove(), 4000)
      }
    })
  }

  const close = () => {
    ov.remove()
    document.body.style.overflow = ''
    window.removeEventListener('message', onGumroadMessage)
    // Safety net: if the user closes the overlay manually (e.g. Gumroad's own
    // postMessage didn't fire), poll once anyway in case the webhook landed.
    if (!purchased && pro.bestKnownEmail() && !pro.isPro()) {
      pro.pollUnlock(pro.bestKnownEmail(), {
        tries: 4, interval: 2500,
        onUnlock: () => { if (typeof render === 'function') { try { render() } catch {} } }
      })
    }
  }
  ov.querySelector('#ds-gr-close').addEventListener('click', close)
  ov.addEventListener('click', e => { if (e.target === ov) close() })
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc) } })
}
window.openGumroadOverlay = openGumroadOverlay
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-gumroad-overlay-checkout]')
  if (!trigger) return
  const href = trigger.getAttribute('href') || GUMROAD_URL
  if (!/gumroad\.com\/l\//.test(href) && !/gum\.co\//.test(href)) return
  e.preventDefault()
  openGumroadOverlay(href)
})

export async function handleGoogleCredential(resp) {
  try {
    auth.setGoogleCredential(resp.credential)
    const isNew = !auth.user()
    const data = await apiJson('/auth/google', { credential: resp.credential })
    auth.set(data)
    if (typeof window.gtag === 'function') {
      window.gtag('event', isNew ? 'sign_up' : 'login', { method: 'Google' })
    }
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
  // Compact custom 2-line button ("Sign in / with Google"). Triggers the real Google flow.
  el.innerHTML = `
    <button type="button" class="gsi-compact" id="gsi-compact-btn" aria-label="Sign in with Google">
      <span class="gsi-compact-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.63z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
      </span>
      <span class="gsi-compact-text"><span>Sign in</span><span>with Google</span></span>
    </button>
  `
  el.querySelector('#gsi-compact-btn').addEventListener('click', triggerGoogleSignIn)
  el.dataset.rendered = '1'
}
function triggerGoogleSignIn() {
  if (!window.google?.accounts?.id) return
  // Render Google's own button off-screen and click it — guarantees the standard
  // sign-in popup even when One-Tap is suppressed by the browser.
  let host = document.getElementById('gsi-hidden-host')
  if (!host) {
    host = document.createElement('div')
    host.id = 'gsi-hidden-host'
    host.style.cssText = 'position:absolute;top:-9999px;left:-9999px;opacity:0;pointer-events:auto'
    document.body.appendChild(host)
  }
  host.innerHTML = ''
  google.accounts.id.renderButton(host, { type: 'standard', text: 'signin_with', size: 'large' })
  setTimeout(() => {
    const real = host.querySelector('div[role="button"], button')
    if (real) real.click()
    else google.accounts.id.prompt()
  }, 60)
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
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'screen_opened', { query: query.slice(0, 100) })
  }
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
  // Debt/Equity: negative means negative book equity — label it clearly
  debtEq: v => {
    if (v == null) return '—'
    const n = Number(v)
    if (!Number.isFinite(n)) return '—'
    if (n < 0) return `${n.toFixed(2)} (neg. equity)`
    return n.toFixed(2)
  },
  compact: v => {
    if (v == null) return '—'
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) return '—'
    if (Math.abs(n) >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (Math.abs(n) >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B'
    if (Math.abs(n) >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M'
    if (Math.abs(n) >= 1e3)  return '$' + (n / 1e3).toFixed(1) + 'K'
    return '$' + n.toFixed(0)
  },
  // For values stored in $ millions (e.g. annual P&L series)
  compactM: v => {
    if (v == null) return '—'
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) return '—'
    return fmt.compact(n * 1e6)
  },
  date: v => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
  pctClass: v => v == null ? '' : v >= 0 ? 'up' : 'dn',
}


const theme = {
  key: 'ds-theme',
  // Default to dark for returning users; new visitors get dark too (brand default).
  // A saved 'light' choice is respected. (Both modes are fully supported.)
  get() {
    const saved = localStorage.getItem(theme.key) || localStorage.getItem('theme')
    return saved === 'light' ? 'light' : 'dark'
  },
  apply(mode) {
    const next = mode === 'light' ? 'light' : (mode === 'dark' ? 'dark' : theme.get())
    localStorage.setItem(theme.key, next)
    localStorage.setItem('theme', next)
    document.body.setAttribute('data-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    const tBtn = document.getElementById('theme-toggle')
    if (tBtn) {
      tBtn.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode')
      tBtn.innerHTML = themeToggleIcon(next)
    }
    const googleSlot = document.getElementById('google-signin')
    if (googleSlot) {
      googleSlot.dataset.rendered = ''
      renderGoogleButton()
    }
  },
  toggle() {
    theme.apply(theme.get() === 'dark' ? 'light' : 'dark')
  }
}
function themeToggleIcon(mode) {
  // Show the icon for the mode you'd switch TO: sun when in dark, moon when in light.
  return mode === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
}
window.toggleTheme = () => theme.toggle()

function renderBrandMark({ className = 'logo-icon', ariaLabel = 'DeltaScreener', decorative = true } = {}) {
  const ariaAttrs = decorative ? 'aria-hidden="true"' : `alt="${escapeHtml(ariaLabel)}"`
  return `<img src="/logo-mark.png" class="${className}" ${ariaAttrs} width="32" height="32" style="display:block;" />`
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

// Logo for the screener results table — works for any US ticker via FMP's
// image-stock endpoint. Falls back to a colored letter avatar if the image
// 404s (handled by onerror swapping in the fallback span).
function renderScreenerLogo(ticker = '') {
  const t = String(ticker || '').trim().toUpperCase()
  const meta = getTickerBrandMeta(t)
  // Same logo CDN your D1 overview stores (overview.image) and stock pages use.
  const src = t
    ? `https://images.financialmodelingprep.com/symbol/${encodeURIComponent(t)}.png`
    : ''
  return `
    <span class="screener-logo ${meta.hue}" aria-hidden="true">
      <span class="screener-logo-fallback">${escapeHtml(meta.letter)}</span>
      ${src ? `<img src="${src}" alt="" loading="lazy" decoding="async" onerror="this.remove()" />` : ''}
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
    const progress = Math.min(1, Math.max(0, (now - start) / duration))
    const eased = 1 - Math.pow(1 - progress, 3)
    const value = Math.max(0, Math.floor(target * eased))
    el.textContent = value.toLocaleString('en-US')
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
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
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
  // Seeded PRNG so each index gets a stable but distinct jagged shape
  let rngState = (seed % 2147483647) || 1
  const rand = () => (rngState = (rngState * 48271) % 2147483647) / 2147483647
  const pc = 40
  // Build a realistic, noisy price path that net rises (up) or falls (dn)
  const raw = []
  let val = positive ? 0.62 : 0.42
  for (let idx = 0; idx < pc; idx++) {
    const progress = idx / (pc - 1)
    const drift = positive ? -0.34 / (pc - 1) : 0.34 / (pc - 1)   // SVG y is inverted
    const noise = (rand() - 0.5) * 0.12
    const wave = Math.sin((idx + seed * 0.01) * 0.55) * 0.015
    val = val + drift + noise * 0.5 + (idx ? 0 : 0)
    raw.push(val + wave)
  }
  // Normalize into the visible band
  const lo = Math.min(...raw), hi = Math.max(...raw)
  const span = (hi - lo) || 1
  const points = raw.map(v => 0.16 + ((v - lo) / span) * 0.66)
  const width = 176
  const height = 72
  const baseline = height - 6
  const coords = points.map((p, idx) => ({
    x: Number((idx * (width / (pc - 1))).toFixed(1)),
    y: Number((p * height).toFixed(1)),
  }))
  // Lightly smoothed but still jagged: short control handles preserve the noise
  const linePath = coords.map((pt, idx, arr) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`
    const prev = arr[idx - 1]
    const cpx = Number((prev.x + (pt.x - prev.x) * 0.5).toFixed(1))
    return `Q ${cpx} ${prev.y}, ${pt.x} ${pt.y}`
  }).join(' ')
  const fillPath = `${linePath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
  const end = coords[coords.length - 1]
  return `<svg class="idx-spark" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="spark-fill-${positive ? 'up' : 'dn'}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${positive ? '#16a34a' : '#ef4444'}" stop-opacity="${positive ? '0.22' : '0.20'}"/>
        <stop offset="100%" stop-color="${positive ? '#16a34a' : '#ef4444'}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="area ${positive ? 'up' : 'dn'}" d="${fillPath}"></path>
    <line class="grid dashed" x1="0" y1="${baseline}" x2="${width}" y2="${baseline}"></line>
    <path class="line ${positive ? 'up' : 'dn'}" d="${linePath}"></path>
    <circle class="dot ${positive ? 'up' : 'dn'}" cx="${end.x}" cy="${end.y}" r="3.4"></circle>
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
      // Respect the user's saved theme so navigating to/from blog doesn't flip modes
      const t = theme.get()
      document.body.setAttribute('data-theme', t)
      document.documentElement.setAttribute('data-theme', t)
      renderHeader()
      bindRouteElements(document)
      return
    } else {
      // Client-side navigation to /blog — force a full page load for SSR
      location.assign(location.href)
      return
    }
  }
  // Static server-rendered trust/marketing pages (pricing, about, etc.):
  // these are fully rendered by their Cloudflare Pages functions into a prerender
  // shell. Keep that SSR content instead of wiping it and 404-ing — the SPA has no
  // client-side route for them. Only bail when the SSR shell is actually present
  // (direct page load); client-side nav to these paths falls through to a full reload.
  const STATIC_SSR_ROUTES = new Set(['/pricing', '/about', '/disclaimer', '/refund'])
  if (STATIC_SSR_ROUTES.has(path)) {
    const prerendered = document.querySelector('[data-prerender-shell]')
    if (prerendered) {
      const t = theme.get()
      document.body.setAttribute('data-theme', t)
      document.documentElement.setAttribute('data-theme', t)
      renderHeader()
      bindRouteElements(document)
      return
    } else {
      // Client-side navigation into one of these — force a real page load for SSR.
      location.assign(location.href)
      return
    }
  }
  // Stock routes: keep the server-rendered prerender shell for SEO
  // The SSR shell has real content (price, financials, description) that Google needs to index
  const isStockRoute = path.startsWith('/stock/')
  if (isStockRoute) {
    const prerendered = document.querySelector('[data-prerender-shell]')
    if (prerendered) {
      // SSR content exists (direct page load) — keep it, then hydrate the interactive SPA on top.
      // This only runs ONCE, on the initial document load. After we remove the shell, any later
      // render() falls through to the generic client-side router below (no full reload), which
      // prevents the reload loop that was resetting stock-page tabs back to Overview.
      renderHeader()
      bindRouteElements(document)
      const main = document.createElement('div')
      main.id = 'main'
      const oldMain = document.getElementById('main')
      if (oldMain) oldMain.remove()
      app.appendChild(main)
      prerendered.remove()
      const ticker = path.split('/stock/')[1]?.split('/')[0]?.toUpperCase()
      if (ticker && routes['/stock/:ticker']) {
        try { await routes['/stock/:ticker'](main, { ticker }) } catch (e) {}
      }
      renderFooter()
      bindRouteElements(document)
      return
    }
    // No prerender shell (client-side navigation / re-render): fall through to the generic
    // router below, which renders the interactive SPA stock page. Do NOT location.assign here —
    // that caused an infinite full-page-reload loop.
  }
  // Apply theme: default is dark unless user explicitly chose light
  const savedTheme = theme.get()
  document.body.setAttribute('data-theme', savedTheme)
  document.documentElement.setAttribute('data-theme', savedTheme)
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
  // Remove the static server-rendered header if present
  if (typeof window.__removeStaticHeader === 'function') window.__removeStaticHeader()
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
        <input type="text" id="hdr-search" placeholder="Search any US stock — e.g. Apple, AAPL, Microsoft…" autocomplete="off" />
        <div class="search-dropdown hidden" id="hdr-dropdown"></div>
      </div>
      <nav class="nav">
        <a href="${routeHref('/')}" data-route="/" onclick="navigate('/');return false" class="${path === '/' ? 'active' : ''}">Home</a>
        <a href="${routeHref('/screener')}" data-route="/screener" onclick="navigate('/screener');return false" class="${path === '/screener' ? 'active' : ''}">Screener</a>
        <a href="${routeHref('/watchlist')}" data-route="/watchlist" onclick="navigate('/watchlist');return false" class="${path === '/watchlist' ? 'active' : ''}">Watchlist</a>
        <a href="${routeHref('/alerts')}" data-route="/alerts" onclick="navigate('/alerts');return false" class="${path === '/alerts' ? 'active' : ''}">Alerts</a>
        <a href="/blog" class="nav-blog-link${path === '/blog' || path.startsWith('/blog/') ? ' active' : ''}" title="Blog" aria-label="Blog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:5px"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>Blog
        </a>
        <a href="${routeHref('/news')}" data-route="/news" onclick="navigate('/news');return false" class="nav-news-link${path === '/news' ? ' active' : ''}" title="Stock market news" aria-label="News">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-2px;margin-right:5px"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>News
        </a>
        <span id="nav-pro-slot"></span>
      </nav>
      <div class="hdr-actions">
        <button id="theme-toggle" class="theme-toggle" type="button" onclick="toggleTheme()" title="Toggle light / dark mode" aria-label="Toggle theme">${themeToggleIcon(theme.get())}</button>
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
  
  // Wire Pro badge in nav
  const navProSlot = document.getElementById('nav-pro-slot')
  if (navProSlot) {
    const cachedProEmail = pro.getEmail()
    if (cachedProEmail && pro.isPro()) {
      navProSlot.innerHTML = `<span style="font-size:11px;font-weight:800;letter-spacing:.08em;background:#2dd4bf;color:#0f1117;padding:3px 9px;border-radius:99px;vertical-align:middle">PRO</span>`
    } else {
      navProSlot.innerHTML = `<a href="/pricing" style="font-size:12px;font-weight:700;color:#2dd4bf;text-decoration:none;border:1px solid rgba(45,212,191,.4);border-radius:99px;padding:3px 10px;white-space:nowrap" title="Upgrade to Pro">Upgrade</a>`
      navProSlot.querySelector('a').addEventListener('click', e => { e.preventDefault(); pro.showUpgradeModal() })
    }
    // Async: check Pro status and update badge
    pro.check(cachedProEmail).then(isPro => {
      const slot = document.getElementById('nav-pro-slot')
      if (!slot) return
      if (isPro) {
        slot.innerHTML = `<span style="font-size:11px;font-weight:800;letter-spacing:.08em;background:#2dd4bf;color:#0f1117;padding:3px 9px;border-radius:99px;vertical-align:middle">PRO</span>`
      } else {
        slot.innerHTML = `<a href="/pricing" style="font-size:12px;font-weight:700;color:#2dd4bf;text-decoration:none;border:1px solid rgba(45,212,191,.4);border-radius:99px;padding:3px 10px;white-space:nowrap" title="Upgrade to Pro">Upgrade</a>`
        slot.querySelector('a').addEventListener('click', e => { e.preventDefault(); pro.showUpgradeModal() })
      }
    }).catch(() => {})
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
  // Remove any existing footer(s) first so we never stack duplicates
  // (the stock-page hydration path and generic render path both call this).
  document.querySelectorAll('#app > footer#foot, #app > footer').forEach(el => el.remove())
  const f = document.createElement('footer')
  f.id = 'foot'
  f.innerHTML = `<div class="container">© ${new Date().getFullYear()} DeltaScreener · Data: Yahoo Finance, SEC EDGAR, FMP, Alpha Vantage · <a href="/pricing" onclick="navigate('/pricing');return false">Pricing</a> · <a href="${routeHref('/privacy')}" data-route="/privacy" onclick="navigate('/privacy');return false">Privacy</a> · <a href="${routeHref('/terms')}" data-route="/terms" onclick="navigate('/terms');return false">Terms</a></div>`
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
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'watchlist_add', { ticker: normalized.ticker, signed_in: auth.signedIn() })
    }
  },
  remove: t => {
    const ticker = String(t || '').trim().toUpperCase()
    localStorage.setItem('ds-watchlist', JSON.stringify(watchlist.get().filter(x => x.ticker !== ticker)))
    if (auth.signedIn()) apiDelete('/user/watchlist', { ticker }).catch(() => {})
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'watchlist_remove', { ticker, signed_in: auth.signedIn() })
    }
  }
}

// Lightweight confirmation toast with next-step actions.
// actions: [{ label, onClick }]
function showActionToast(message, actions = []) {
  const existing = document.getElementById('ds-action-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.id = 'ds-action-toast'
  toast.className = 'ds-action-toast'
  toast.innerHTML = `
    <div class="ds-toast-msg">${message}</div>
    <div class="ds-toast-actions"></div>
    <button class="ds-toast-close" aria-label="Dismiss">×</button>
  `
  const actionsWrap = toast.querySelector('.ds-toast-actions')
  actions.forEach(a => {
    const btn = document.createElement('button')
    btn.className = 'ds-toast-action'
    btn.textContent = a.label
    btn.addEventListener('click', () => { a.onClick?.(); toast.remove() })
    actionsWrap.appendChild(btn)
  })
  toast.querySelector('.ds-toast-close').addEventListener('click', () => toast.remove())
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))
  const timer = setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300) }, 7000)
  toast.addEventListener('mouseenter', () => clearTimeout(timer))
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
        <div class="landing-hero-copy landing-hero-minimal">
          <div class="landing-brand-lockup">
            <div class="landing-brand-mark-wrap">
              ${renderBrandMark({ className: 'landing-brand-mark' })}
            </div>
            <h1 class="landing-brand-wordmark">
              <span class="sr-only">DeltaScreener — free US stock screener for NYSE &amp; NASDAQ</span>
              <span class="landing-word-line dark" aria-hidden="true">DELTA</span>
              <span class="landing-word-line accent" aria-hidden="true">SCREENER</span>
            </h1>
          </div>
          <p class="landing-tagline landing-tagline-minimal">The Cleanest Way to Analyze Stocks</p>
          <div class="hero-search landing-hero-search hero-search-prominent">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="hero-search" placeholder="Try: Apple, AAPL, Microsoft, NVDA…" autocomplete="off" />
            <div class="hero-search-dropdown hidden" id="hero-dropdown"></div>
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
    <section class="landing-section landing-section-news">
      <div class="container">
        <div class="landing-section-head">
          <div>
            <span class="landing-section-kicker">Market news</span>
            <h2>Latest stock market news, all in one place.</h2>
          </div>
          <p>Live headlines from across the market — updated throughout the trading day.</p>
        </div>
        <div id="home-news" class="news-list"><div class="news-loading">Loading market news…</div></div>
        <a href="https://stockanalysis.com/news/" class="news-more" target="_blank" rel="noopener">More market news →</a>
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
              q: 'ROE > 20 AND\nAverage ROE 5Years > 18 AND\nROCE > 15 AND\nNet Margin > 15 AND\nDebt to Equity < 0.5 AND\nInterest Coverage Ratio > 5 AND\nMarket Cap > 5000'
            },
            {
              emoji: '🚀',
              name: 'Momentum Stocks',
              desc: 'Stocks already moving up with strong price action and above-average volume.',
              color: '#6366f1',
              q: 'Change % > 5 AND\nYOY Qtr profit growth > 20 AND\nYOY Qtr sales growth > 15 AND\nROE > 15 AND\nNet Margin > 8 AND\nMarket Cap > 2000'
            },
            {
              emoji: '📈',
              name: 'High Growth',
              desc: 'Fast-growing revenue and profit — for investors hunting the next compounder.',
              color: '#10b981',
              q: 'PEG Ratio > 0 AND\nPEG Ratio < 1 AND\nSales growth 3Years > 15 AND\nProfit growth 3Years > 20 AND\nGross Margin > 40 AND\nDebt to Equity < 0.8 AND\nMarket Cap > 1000'
            },
            {
              emoji: '💰',
              name: 'Undervalued Gems',
              desc: 'Low P/E, low P/B, strong ROE — fundamentally cheap quality businesses.',
              color: '#2563eb',
              q: 'P/E > 0 AND\nP/E < 15 AND\nP/B < 1.5 AND\nCurrent ratio > 2 AND\nEarnings yield > 6 AND\nDebt to Equity < 1 AND\nROE > 10 AND\nMarket Cap > 1000'
            },
            {
              emoji: '💵',
              name: 'Dividend Income',
              desc: 'Reliable dividend payers with healthy payout ratios and strong balance sheets.',
              color: '#ec4899',
              q: 'Dividend Yield > 2.5 AND\nDividend Yield < 8 AND\nROE > 12 AND\nNet Margin > 10 AND\nInterest Coverage Ratio > 4 AND\nDebt to Equity < 1 AND\nMarket Cap > 5000'
            }
          ].map((s,i) => `
            <a href="/screener?preset=${i}" data-preset-idx="${i}"
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
  // Middle search
  animateNumericCounter(document.getElementById('screened-count'))

  // Wire preset click handlers (avoids JSON.stringify inside innerHTML)
  const PRESET_QUERIES = [
    // 1. Warren Buffett — Quality Moat
    // ROE > 20% (Buffett: must exceed 20%), 5yr avg ROE > 18% (consistency test),
    // ROCE > 15% (capital allocation efficiency), Net Margin > 15% (pricing power),
    // D/E < 0.5 (fortress balance sheet), Interest Coverage > 5 (debt easily serviced)
    'ROE > 20 AND\nAverage ROE 5Years > 18 AND\nROCE > 15 AND\nNet Margin > 15 AND\nDebt to Equity < 0.5 AND\nInterest Coverage Ratio > 5 AND\nMarket Cap > 5000',

    // 2. Momentum — Price + Earnings Acceleration
    // Change% > 5% (real recent move, not noise), backed by accelerating earnings:
    // YOY quarterly profit growth > 20%, quarterly sales growth > 15%,
    // ROE > 15% (fundamentally healthy), institutional-grade market cap
    'Change % > 5 AND\nYOY Qtr profit growth > 20 AND\nYOY Qtr sales growth > 15 AND\nROE > 15 AND\nNet Margin > 8 AND\nMarket Cap > 2000',

    // 3. High Growth — Peter Lynch GARP
    // PEG < 1 = Lynch's core filter: paying fair price for growth,
    // 3yr compound sales + profit growth both > 15%, 5yr sales CAGR > 12%,
    // Gross margin > 40% = scalable model, low debt (organic growth not leveraged)
    'PEG Ratio > 0 AND\nPEG Ratio < 1 AND\nSales growth 3Years > 15 AND\nProfit growth 3Years > 20 AND\nSales growth 5Years > 12 AND\nGross Margin > 40 AND\nDebt to Equity < 0.8 AND\nMarket Cap > 1000',

    // 4. Undervalued — Benjamin Graham Deep Value
    // P/E < 15 (Graham: never pay more than 15x), P/B < 1.5 (near book = margin of safety),
    // Current ratio > 2 (Graham's original: assets must be 2x liabilities),
    // Earnings yield > 6% (beats long-term bond yields), must be profitable (EPS via ROE > 0)
    'P/E > 0 AND\nP/E < 15 AND\nP/B < 1.5 AND\nCurrent ratio > 2 AND\nEarnings yield > 6 AND\nDebt to Equity < 1 AND\nROE > 10 AND\nMarket Cap > 1000',

    // 5. Dividend Income — Sustainable High Yield
    // Yield 2.5-8% (meaningful income; > 8% = warning sign),
    // ROE > 12% (business strong enough to sustain payout),
    // Net margin > 10% (earnings buffer), Interest coverage > 4 (debt won't kill dividend),
    // D/E < 1 (balance sheet won't force a cut), large cap ($5B+) = mature payers
    'Dividend Yield > 2.5 AND\nDividend Yield < 8 AND\nROE > 12 AND\nNet Margin > 10 AND\nInterest Coverage Ratio > 4 AND\nDebt to Equity < 1 AND\nMarket Cap > 5000',
  ]
  el.querySelectorAll('[data-preset-idx]').forEach(a => {
    a.addEventListener('click', e => {
      const idx = parseInt(a.dataset.presetIdx)
      if (PRESET_QUERIES[idx]) sessionStorage.setItem('ds-query', PRESET_QUERIES[idx])
      // Let href="/screener?preset=N" navigate naturally (no SPA intercept since data-route removed)
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

  // Market news — loaded independently so a news failure never blocks the page.
  loadHomeNews()
}
route('/', renderHomePage)

// ═══════════════════════════════════════════════════════════════════════
// HOME — STOCK MARKET NEWS
// ═══════════════════════════════════════════════════════════════════════
function newsTimeAgo(dateStr) {
  if (!dateStr) return ''
  const t = new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z')).getTime()
  if (!t || isNaN(t)) return ''
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (mins < 1) return 'now'
  if (mins < 60) return mins + 'm'
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return hrs + 'h'
  const days = Math.round(hrs / 24)
  return days + 'd'
}
function renderHomeNewsMarkup(items = []) {
  if (!items.length) return `<div class="news-empty">No market news available right now.</div>`
  return items.map(n => {
    const time = newsTimeAgo(n.publishedDate)
    const site = (n.site || n.publisher || '').replace(/^www\./, '')
    const thumb = n.image ? `<img class="news-thumb" src="${escapeHtml(n.image)}" alt="" loading="lazy" onerror="this.style.display='none'" />` : ''
    const ticker = n.symbol ? `<span class="news-ticker">${escapeHtml(n.symbol)}</span>` : ''
    return `<a class="news-row" href="${escapeHtml(n.url)}" target="_blank" rel="noopener">
      <span class="news-time">${escapeHtml(time)}</span>
      ${thumb}
      <span class="news-body">
        <span class="news-title">${escapeHtml(n.title)}</span>
        <span class="news-meta">${ticker}${ticker && site ? '<span class="dot">·</span>' : ''}${site ? escapeHtml(site) : ''}</span>
      </span>
    </a>`
  }).join('')
}
async function loadHomeNews() {
  const host = document.getElementById('home-news')
  if (!host) return
  try {
    const res = await api('/market/news?limit=24')
    const items = (res && res.news) || []
    host.innerHTML = renderHomeNewsMarkup(items)
  } catch (e) {
    host.innerHTML = `<div class="news-empty">Market news is temporarily unavailable.</div>`
  }
}

// ═══════════════════════════════════════════════════════════════════════
// NEWS PAGE — full stock market news feed (/news)
// ═══════════════════════════════════════════════════════════════════════
async function renderNewsPage(el) {
  el.innerHTML = `
    <div class="container news-page">
      <div class="news-page-head">
        <h1 class="news-page-title">Stock Market News</h1>
        <p class="news-page-sub">The latest US market and company headlines, refreshed throughout the day.</p>
      </div>
      <div id="news-page-list" class="news-list">
        <div class="news-empty">Loading market news…</div>
      </div>
    </div>
  `
  const host = document.getElementById('news-page-list')
  try {
    const res = await api('/market/news?limit=60')
    const items = (res && res.news) || []
    host.innerHTML = renderHomeNewsMarkup(items)
  } catch (e) {
    host.innerHTML = `<div class="news-empty">Market news is temporarily unavailable. Please try again shortly.</div>`
  }
}
route('/news', renderNewsPage)

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
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'stock_view', { ticker })
  }
  
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

  if (overview) {
    // Cap absurd ROE values from negative equity distortion (should already be null from Worker, belt+suspenders)
    if (overview.roe != null && Math.abs(overview.roe) > 999) overview.roe = null
    // Fix name: if API returns ticker symbol as name, substitute known company name
    if (!overview.name || overview.name === ticker || overview.name === ticker.toUpperCase()) {
      const knownNames = {
        AAPL:'Apple Inc.', MSFT:'Microsoft Corporation', NVDA:'NVIDIA Corporation',
        AMZN:'Amazon.com Inc.', GOOGL:'Alphabet Inc.', GOOG:'Alphabet Inc.',
        META:'Meta Platforms Inc.', TSLA:'Tesla Inc.', BRK_A:'Berkshire Hathaway',
        'BRK.B':'Berkshire Hathaway', 'BRK.A':'Berkshire Hathaway',
        AVGO:'Broadcom Inc.', JPM:'JPMorgan Chase & Co.', LLY:'Eli Lilly and Company',
        V:'Visa Inc.', XOM:'Exxon Mobil Corporation', UNH:'UnitedHealth Group',
        MA:'Mastercard Inc.', JNJ:'Johnson & Johnson', PG:'Procter & Gamble Co.',
        COST:'Costco Wholesale Corporation', HD:'The Home Depot Inc.',
        ABBV:'AbbVie Inc.', WMT:'Walmart Inc.', MRK:'Merck & Co.',
        BAC:'Bank of America Corporation', CRM:'Salesforce Inc.',
        CVX:'Chevron Corporation', NFLX:'Netflix Inc.', AMD:'Advanced Micro Devices',
        KO:'The Coca-Cola Company', PEP:'PepsiCo Inc.', TMO:'Thermo Fisher Scientific',
        ACN:'Accenture plc', LIN:'Linde plc', CSCO:'Cisco Systems Inc.',
        MCD:'McDonald\'s Corporation', ABT:'Abbott Laboratories',
        TXN:'Texas Instruments', NKE:'Nike Inc.', PM:'Philip Morris International',
        DIS:'The Walt Disney Company', WFC:'Wells Fargo & Company',
        INTU:'Intuit Inc.', AMGN:'Amgen Inc.', IBM:'IBM Corporation',
        GS:'Goldman Sachs Group', MS:'Morgan Stanley', ISRG:'Intuitive Surgical',
        RTX:'RTX Corporation', HON:'Honeywell International', CAT:'Caterpillar Inc.',
        SPGI:'S&P Global Inc.', AXP:'American Express Company', BKNG:'Booking Holdings',
        GILD:'Gilead Sciences', MDLZ:'Mondelez International', ADI:'Analog Devices',
        NOW:'ServiceNow Inc.', REGN:'Regeneron Pharmaceuticals',
        PLD:'Prologis Inc.', DE:'Deere & Company', AMAT:'Applied Materials',
        BLK:'BlackRock Inc.', SYK:'Stryker Corporation', VRTX:'Vertex Pharmaceuticals',
        ADP:'Automatic Data Processing', MMC:'Marsh & McLennan',
        PANW:'Palo Alto Networks', SCHW:'Charles Schwab Corporation',
        TJX:'TJX Companies', LRCX:'Lam Research', KLAC:'KLA Corporation',
        SNPS:'Synopsys Inc.', CDNS:'Cadence Design Systems', CRWD:'CrowdStrike Holdings',
        ORLY:"O'Reilly Automotive", MCO:'Moody\'s Corporation',
      }
      if (knownNames[ticker]) overview.name = knownNames[ticker]
    }
  }
  if (ratios) {
    if (ratios.roe != null && Math.abs(ratios.roe) > 999) ratios.roe = null
  }

  setMeta(buildStockSeoMeta(ticker, overview, ratios))
  
  const up = (overview.changePct || 0) >= 0
  const isWatched = watchlist.has(ticker)
  
  el.innerHTML = `
    <div class="stock-hdr">
      <div class="container">
        <div class="stock-title-row">
          <div>
            <h1 class="stock-name"><span class="stock-logo-tile" id="stock-logo-tile"><img class="stock-logo" id="stock-logo-img" crossorigin="anonymous" src="https://images.financialmodelingprep.com/symbol/${encodeURIComponent(ticker)}.png" alt="${(overview.name || ticker).replace(/"/g, '&quot;')} logo" loading="eager" onerror="this.closest('.stock-logo-tile').style.display='none'"></span><span class="stock-name-text">${overview.name && overview.name !== ticker ? `${overview.name} (${ticker})` : ticker} Stock</span></h1>
            <div class="stock-meta-row">
              <span class="tag tag-sym">${overview.exchange || 'NYSE/NASDAQ'}: ${ticker}</span>
              ${overview.sector && overview.sector !== '—' ? `<span class="tag tag-accent">${overview.sector}</span>` : ''}
              ${overview.industry && overview.industry !== '—' ? `<span class="tag">${overview.industry}</span>` : ''}
            </div>
          </div>
          <div class="stock-price">
            <div class="p">${fmt.usd(overview.price)}</div>
            <div class="ch ${up ? 'up' : 'dn'}">${up ? '▲' : '▼'} ${fmt.usd(Math.abs(overview.change || 0))} (${fmt.pctAbs(Math.abs(overview.changePct || 0))})</div>
            <div class="dt">As of ${fmt.date(overview.lastUpdated)}${(() => { const d = overview.lastUpdated ? new Date(overview.lastUpdated) : null; return d && (Date.now() - d.getTime()) > 30 * 86400000 ? ' · <span style="color:#f59e0b;font-size:11px">Data may be delayed</span>' : '' })()}</div>
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
          <button class="btn btn-watch ${isWatched ? 'is-watched' : ''}" id="watch-btn" aria-pressed="${isWatched}">
            <span class="watch-ico">${isWatched ? '★' : '☆'}</span>
            <span class="watch-txt">${isWatched ? 'In Your Watchlist' : 'Add to Watchlist'}</span>
          </button>
          <button class="btn btn-outline" id="alert-btn"><span style="margin-right:6px">🔔</span>Set Alert</button>
          <a class="btn btn-outline" href="https://finance.yahoo.com/quote/${ticker}" target="_blank">Yahoo ↗</a>
          <a class="btn btn-outline" href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${ticker}&type=10-K" target="_blank">SEC ↗</a>
        </div>
        <div class="tabs">
          ${TABS.map(t => `<a href="javascript:void(0)" class="tab ${t.id === hash ? 'active' : ''}" onclick="loadTab(event,'${ticker}','${t.id}');return false">${t.label}</a>`).join('')}
        </div>
      </div>
    </div>
    <div class="container" style="padding:20px 16px">
      <div id="tab-content"></div>
    </div>
  `
  
  // Tint the logo tile + ring with the logo's own dominant colour.
  // FMP logo images are already square branded app-icons (e.g. Apple, Tesla),
  // so we let the image fill the rounded tile edge-to-edge with no per-brand
  // tinting or thick border — a clean, uniform app-icon look across all stocks.

  // Wire alert button
  document.getElementById('alert-btn')?.addEventListener('click', () => {
    openAlertModal({ ticker, name: overview.name, price: overview.price })
  })

  // Wire watchlist
  document.getElementById('watch-btn').addEventListener('click', () => {
    const wasWatched = watchlist.has(ticker)
    if (wasWatched) {
      watchlist.remove(ticker)
      render()
    } else {
      watchlist.add({ ticker, name: overview.name, exchange: overview.exchange, price: overview.price, change: overview.change, changePct: overview.changePct, addedAt: Date.now() })
      render()
      const displayName = (overview.name && overview.name !== ticker) ? `${ticker}` : ticker
      showActionToast(`<strong>${displayName} saved</strong> to your watchlist.`, [
        { label: 'View watchlist', onClick: () => navigate('/watchlist') },
        { label: 'Set price alert', onClick: () => openAlertModal({ ticker, name: overview.name, price: overview.price }) },
        { label: 'See peers', onClick: () => { history.replaceState(null, '', location.pathname); renderTab('peers', overview, financials, ratios, ticker); document.getElementById('tab-content')?.scrollIntoView({ behavior:'smooth', block:'start' }) } },
      ])
    }
  })
  
  window.loadTab = (ev, tk, tab) => {
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'))
    const target = ev?.currentTarget || ev?.target
    if (target?.classList) target.classList.add('active')
    // Reflect the active tab in the hash (deep-linkable + survives any re-render),
    // using replaceState so it does NOT trigger the router/popstate.
    history.replaceState(null, '', location.pathname + (tab && tab !== 'overview' ? '#' + tab : ''))
    renderTab(tab, overview, financials, ratios, ticker)
  }
  
  renderTab(hash, overview, financials, ratios, ticker)

  // Financials columns are paywalled for free users (recent 5 periods only).
  // The first render uses the synchronous pro cache, which may be cold. Resolve
  // Pro status in the background and, if the user is Pro, re-render the current
  // financials tab so the locked columns unlock without a manual refresh.
  ;(() => {
    if (pro.isPro()) return // already unlocked — nothing to do
    const email = pro.bestKnownEmail()
    if (!email) return
    pro.check(email).then(isPro => {
      if (!isPro) return
      const active = document.querySelector('.tab.active')?.getAttribute('href')
      const curTab = (location.hash || '').replace('#', '') || 'overview'
      const finTabs = ['pnl', 'quarters', 'balance', 'cashflow']
      if (finTabs.includes(curTab)) {
        renderTab(curTab, overview, financials, ratios, ticker)
      }
    }).catch(() => {})
  })()
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
      try {
        const p = await api(`/stock/${ticker}/peers`)
        // Enrich peers with ratios (parallel fetches, best-effort)
        if (p?.peers?.length) {
          const ratioResults = await Promise.allSettled(
            p.peers.map(peer => api(`/stock/${peer.ticker}/ratios`))
          )
          p.peers = p.peers.map((peer, i) => {
            const rt = ratioResults[i].status === 'fulfilled' ? ratioResults[i].value : null
            // Keep the full ratios object so optional "Add Column" fields can read any metric.
            return { ...peer, roe: rt?.roe, netMargin: rt?.netMargin, salesGrowth: rt?.salesGrowth, debtToEquity: rt?.debtToEquity, _rt: rt || {} }
          })
        }
        renderPeersTab(c, p)
      } catch { c.innerHTML = '<div class="empty">No peers found</div>' }
      break
    case 'news':
      c.innerHTML = '<div class="spinner"></div>'
      try { const n = await api(`/stock/${ticker}/news`); renderNewsTab(c, n) } catch { c.innerHTML = '<div class="empty">No news</div>' }
      break
  }
  bindRouteElements(c)
}

function makeSparkline(series, width = 80, height = 28) {
  const vals = (series || []).filter(v => v != null).map(Number)
  if (vals.length < 2) return ''
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const lastVal = vals[vals.length - 1]
  const color = lastVal >= 0 ? '#10b981' : '#ef4444'
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display:inline-block;vertical-align:middle;margin-left:8px"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/></svg>`
}

// Generate plain-language insight cards from the data we already have,
// so a stock page never feels empty even when the FMP description is blank.
function buildStockInsights(ov, fins, rt) {
  const num = v => (v == null || isNaN(v)) ? null : Number(v)
  const pe = num(rt?.pe ?? ov?.pe)
  const pb = num(rt?.pb ?? ov?.pb)
  const roe = num(rt?.roe ?? ov?.roe)
  const netMargin = num(rt?.netMargin ?? ov?.netMargin)
  const opMargin = num(rt?.opMargin ?? ov?.opMargin)
  const de = num(rt?.debtToEquity ?? ov?.debtToEquity)
  const divY = num(ov?.dividendYield)
  const price = num(ov?.price)
  const hi52 = num(ov?.high52)
  const lo52 = num(ov?.low52)
  const sales5 = num(fins?.growth?.salesGrowth?.['5y'])
  const profit5 = num(fins?.growth?.profitGrowth?.['5y'])
  const sales3 = num(fins?.growth?.salesGrowth?.['3y'])
  const profit3 = num(fins?.growth?.profitGrowth?.['3y'])

  const cards = []

  // Valuation
  if (pe != null || pb != null) {
    let verdict, tone
    if (pe != null && pe > 0 && pe < 15) { verdict = 'looks inexpensive'; tone = 'pos' }
    else if (pe != null && pe > 40) { verdict = 'is priced for high growth'; tone = 'warn' }
    else if (pe != null) { verdict = 'trades around market-average multiples'; tone = 'neu' }
    else { verdict = 'is best judged on book value here'; tone = 'neu' }
    const bits = []
    if (pe != null) bits.push(`a P/E of ${pe.toFixed(1)}`)
    if (pb != null) bits.push(`price-to-book of ${pb.toFixed(1)}`)
    cards.push({ tone, title: 'Valuation', body: `At ${bits.join(' and ')}, the stock ${verdict}. Compare against sector peers before drawing conclusions — multiples mean little in isolation.` })
  }

  // Growth
  if (sales5 != null || profit5 != null || sales3 != null || profit3 != null) {
    const s = sales5 ?? sales3, p = profit5 ?? profit3
    const period = sales5 != null || profit5 != null ? '5-year' : '3-year'
    let tone = 'neu', lead
    if (p != null && p > 15) { tone = 'pos'; lead = 'Profit has compounded strongly' }
    else if (p != null && p < 0) { tone = 'warn'; lead = 'Profit has contracted' }
    else { lead = 'Growth has been steady' }
    const parts = []
    if (s != null) parts.push(`revenue ${s >= 0 ? 'grew' : 'fell'} ${Math.abs(s).toFixed(1)}% a year`)
    if (p != null) parts.push(`profit ${p >= 0 ? 'grew' : 'fell'} ${Math.abs(p).toFixed(1)}% a year`)
    cards.push({ tone, title: `Growth (${period})`, body: `${lead}: ${parts.join(' while ')}. ${p != null && s != null && p > s ? 'Profit outpacing revenue points to improving margins.' : 'Watch whether growth is sustained going forward.'}` })
  }

  // Profitability / margins
  if (roe != null || netMargin != null || opMargin != null) {
    let tone = 'neu', lead
    if (roe != null && roe > 18) { tone = 'pos'; lead = 'High returns on equity' }
    else if (roe != null && roe < 8) { tone = 'warn'; lead = 'Modest returns on equity' }
    else { lead = 'Returns on equity are reasonable' }
    const parts = []
    if (roe != null) parts.push(`ROE of ${roe.toFixed(1)}%`)
    if (opMargin != null) parts.push(`operating margin of ${opMargin.toFixed(1)}%`)
    if (netMargin != null) parts.push(`net margin of ${netMargin.toFixed(1)}%`)
    cards.push({ tone, title: 'Profitability', body: `${lead} — ${parts.join(', ')}. Consistent, high margins are a sign of pricing power and operational quality.` })
  }

  // Balance sheet risk
  if (de != null) {
    let tone, body
    if (de < 0.5) { tone = 'pos'; body = `A debt-to-equity of ${de.toFixed(2)} signals a conservative balance sheet with little leverage risk.` }
    else if (de > 1.5) { tone = 'warn'; body = `Debt-to-equity of ${de.toFixed(2)} is elevated — the company carries meaningful leverage, which raises risk if earnings weaken or rates rise.` }
    else { tone = 'neu'; body = `Debt-to-equity of ${de.toFixed(2)} is moderate and broadly typical for the market.` }
    cards.push({ tone, title: 'Balance sheet', body })
  }

  // Dividend
  if (divY != null && divY > 0) {
    const tone = divY > 6 ? 'warn' : 'pos'
    cards.push({ tone, title: 'Dividend', body: `Yields ${divY.toFixed(2)}%.${divY > 6 ? ' An unusually high yield can signal a depressed price or payout risk — check the payout ratio and cash flow.' : ' Check the payout ratio and free cash flow to gauge how safe the payout is.'}` })
  }

  // 52-week position
  if (price != null && hi52 != null && lo52 != null && hi52 > lo52) {
    const pos = ((price - lo52) / (hi52 - lo52)) * 100
    let tone = 'neu', body
    if (pos >= 85) { tone = 'pos'; body = `Trading near its 52-week high (${pos.toFixed(0)}% of the range) — strong momentum, but less margin of safety.` }
    else if (pos <= 20) { tone = 'warn'; body = `Trading near its 52-week low (${pos.toFixed(0)}% of the range) — could be a value opportunity or a warning sign. Understand why before buying.` }
    else { body = `Sits at ${pos.toFixed(0)}% of its 52-week range ($${lo52.toFixed(2)}–$${hi52.toFixed(2)}).` }
    cards.push({ tone, title: '52-week position', body })
  }

  return cards
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
    ['Debt/Equity', fmt.debtEq(rt?.debtToEquity ?? ov.debtToEquity)],
    ['Op. Margin', fmt.pctAbs(rt?.opMargin ?? ov.opMargin)],
    ['Net Margin', fmt.pctAbs(rt?.netMargin ?? ov.netMargin)],
  ]
  const insights = buildStockInsights(ov, fins, rt)
  const coName = (ov.name && ov.name !== ov.ticker) ? ov.name : (ov.ticker || 'This company')
  const sectorLine = [ov.sector, ov.industry].filter(Boolean).join(' · ')
  const aboutFallback = (() => {
    const bits = []
    bits.push(`${coName} is a publicly traded company${ov.exchange ? ` listed on ${ov.exchange}` : ''}${sectorLine ? ` operating in the ${sectorLine} space` : ''}.`)
    if (ov.mktCap) bits.push(`It has a market capitalization of ${fmt.compact(ov.mktCap)}.`)
    if (ov.dividendYield > 0) bits.push(`The stock pays a dividend yielding ${fmt.pctAbs(ov.dividendYield)}.`)
    bits.push(`Key fundamentals, financial statements, and valuation ratios are summarized below.`)
    return `<p>${bits.join(' ')}</p>`
  })()
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
    ${insights.length ? `
    <div class="card stock-snapshot" style="margin-bottom:16px">
      <div class="card-hdr"><h2>Snapshot</h2><span style="font-size:12px;color:#6b7280">Auto-generated from the latest financials</span></div>
      <div class="snapshot-grid">
        ${insights.map(ins => `
          <div class="snapshot-item snapshot-${ins.tone}">
            <div class="snapshot-title">${ins.title}</div>
            <div class="snapshot-body">${ins.body}</div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:12px">
      <div class="card">
        <div class="card-hdr"><h2>About</h2></div>
        <div class="about">
          ${ov.description ? `<p>${ov.description}</p>` : aboutFallback}
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
            ...(ov.ceo ? [['CEO', ov.ceo]] : []),
            ...(ov.employees ? [['Employees', Number(ov.employees).toLocaleString()]] : []),
            ...(ov.city || ov.country ? [['Headquarters', [ov.city, ov.country].filter(Boolean).join(', ')]] : []),
            ...(ov.ipoDate ? [['IPO Year', String(ov.ipoDate).slice(0, 4)]] : []),
            ['Website', ov.website ? `<a href="${ov.website}" target="_blank">Visit ↗</a>` : '—'],
            ['Book Value', fmt.usd(ov.bookValue)],
            ['Avg Volume', ov.avgVolume ? ov.avgVolume.toLocaleString() : '—'],
          ].map(([l, v]) => `
            <div class="ratio-row"><span class="lbl">${l}</span><span class="val">${v || '—'}</span></div>
          `).join('')}
        </div>
      </div>
    </div>
    ${fins?.growth?.roe?.series?.length >= 3 ? `
    <div class="card" style="margin-top:12px">
      <div class="card-hdr"><h2>10-Year Trends</h2><span style="font-size:12px;color:#6b7280">Annual · from P&L data</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:24px;padding:8px 4px">
        ${fins.annual?.headers?.length >= 3 ? `
        <div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Revenue</div>
          <div style="font-size:13px;color:#d1d5db;display:flex;align-items:center">
            ${fmt.compactM((fins.annual.sales || []).filter(v=>v!=null).slice(-1)[0])}
            ${makeSparkline(fins.annual.sales, 80, 28)}
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Net Profit</div>
          <div style="font-size:13px;color:#d1d5db;display:flex;align-items:center">
            ${fmt.compactM((fins.annual.netProfit || []).filter(v=>v!=null).slice(-1)[0])}
            ${makeSparkline(fins.annual.netProfit, 80, 28)}
          </div>
        </div>` : ''}
        <div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">ROE %</div>
          <div style="font-size:13px;color:#d1d5db;display:flex;align-items:center">
            ${fins.growth.roe.lastYear != null ? fins.growth.roe.lastYear.toFixed(1) + '%' : '—'}
            ${makeSparkline(fins.growth.roe.series, 80, 28)}
          </div>
        </div>
        ${fins.annual?.opm?.length >= 3 ? `
        <div>
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">OPM %</div>
          <div style="font-size:13px;color:#d1d5db;display:flex;align-items:center">
            ${(fins.annual.opm || []).filter(v=>v!=null).slice(-1)[0]?.toFixed(1) ?? '—'}%
            ${makeSparkline(fins.annual.opm, 80, 28)}
          </div>
        </div>` : ''}
      </div>
    </div>` : ''}
    ${fins?.balanceSheetYears ? `<div style="margin-top:12px;font-size:12px;color:#9ca3af">Data source: ${fins.balanceSheetSource === 'sec_xbrl' ? 'SEC EDGAR XBRL' : (String(fins.balanceSheetSource || '').toLowerCase().includes('fmp') ? 'Financial Modeling Prep' : 'Company filings')} · ${fins.balanceSheetYears} years of balance sheet data</div>` : ''}
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

// Shared financials table builder — models stockanalysis.com layout:
// newest period on the left (right after the sticky row-label column),
// fewer comfortably-spaced columns, older periods reachable via horizontal scroll.
function buildFinancialsTable(headers, rows, opts = {}) {
  // Natural order: oldest period on the LEFT, newest on the RIGHT (like a timeline).
  // The scroll container auto-scrolls fully right on render so the latest period shows
  // first; scrolling left reveals older periods.
  const order = headers.map((_, i) => i)
  // ── Free-tier paywall ──────────────────────────────────────────────
  // Free users see only the most recent FREE_YEARS periods. Older columns
  // (the leftmost ones, since newest is on the right) are blurred with a
  // lock icon; clicking them opens the Pro upgrade modal. Pro users see all.
  const FREE_YEARS = 5
  const isProUser = (typeof pro !== 'undefined' && pro.isPro && pro.isPro())
  const lockedCount = (!isProUser && order.length > FREE_YEARS) ? order.length - FREE_YEARS : 0
  // The first `lockedCount` columns (oldest) are locked.
  const isLocked = (colIdx) => colIdx < lockedCount
  // Drop unit suffixes like " ($M)" from the row label — cleaner, bigger look.
  const cleanLabel = (s) => String(s).replace(/\s*\(\$?M\)\s*$/i, '').replace(/\s*\(\$\)\s*$/i, '')
  const cellVal = (v, row) => {
    if (v == null) return '—'
    if (row.pct) return Number(v).toFixed(1) + '%'
    if (row.isEPS) return Number(v).toFixed(2)
    return fmt.numFull(v)
  }
  const colCount = order.length + 1
  // SVG bar-chart icon (stockanalysis.com style) shown on hover / always on touch.
  const chartIcon = `<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><rect x="1" y="8" width="3" height="6" rx="0.5"/><rect x="6.5" y="4" width="3" height="10" rx="0.5"/><rect x="12" y="1.5" width="3" height="12.5" rx="0.5"/></svg>`
  // Small padlock icon for locked (Pro-only) columns.
  const lockIcon = `<svg class="fin-lock-ico" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 7a1.5 1.5 0 0 1 .75 2.8V19a.75.75 0 0 1-1.5 0v-1.2A1.5 1.5 0 0 1 12 14z"/></svg>`
  return `
    <div class="tbl-scroll fin-scroll" data-fin-scroll="1">
      <table class="tbl fin-tbl" data-fin-chartable="1">
        <thead>
          <tr>
            <th>${opts.firstCol || 'Item'}</th>
            ${order.map((i, ci) => isLocked(ci)
              ? `<th class="fin-locked" data-fin-lock="1" title="Upgrade to Pro to unlock all history"><span class="fin-lock-val">${headers[i]}</span>${lockIcon}</th>`
              : `<th>${headers[i]}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((r, ri) => {
            const series = order.map(i => {
              const v = (r.data || [])[i]
              return { label: headers[i], value: v == null ? null : Number(v) }
            })
            const hasData = series.some(p => p.value != null && isFinite(p.value))
            const suffix = r.pct ? '%' : (r.isEPS ? '' : '')
            const fmtKind = r.pct ? 'pct' : (r.isEPS ? 'eps' : 'num')
            const seriesAttr = hasData
              ? ` data-chart-series='${encodeURIComponent(JSON.stringify(series))}' data-chart-title="${cleanLabel(r.label).replace(/"/g, '&quot;')}" data-chart-suffix="${suffix}" data-chart-kind="${fmtKind}"`
              : ''
            return `
            <tr class="${r.bold ? 'row-bold' : ''}" data-fin-row="${ri}">
              <td>
                <span class="fin-label-wrap">
                  <span class="fin-label-text">${cleanLabel(r.label)}</span>
                  ${hasData ? `<button type="button" class="fin-chart-btn" title="Show chart" aria-label="Show ${cleanLabel(r.label)} chart"${seriesAttr}>${chartIcon}</button>` : ''}
                </span>
              </td>
              ${order.map((i, ci) => {
                const v = (r.data || [])[i]
                // Only colorize growth/percent rows (green up, red down) — keep raw $ values neutral.
                const cls = r.colorize && r.pct && v != null ? (v > 0 ? 'up' : v < 0 ? 'dn' : '') : ''
                if (isLocked(ci)) {
                  return `<td class="fin-locked ${cls}" data-fin-lock="1"><span class="fin-lock-val">${cellVal(v, r)}</span></td>`
                }
                return `<td class="${cls}">${cellVal(v, r)}</td>`
              }).join('')}
            </tr>
            <tr class="fin-chart-row" data-fin-chart-for="${ri}" hidden>
              <td colspan="${colCount}"><div class="fin-chart-host"></div></td>
            </tr>
          `}).join('')}
        </tbody>
      </table>
    </div>
  `
}

// Render an inline bar chart (hand-rolled SVG, theme-aware) for one financial row's
// series across periods. Newest period is on the right, matching the table column order.
function buildFinRowBarChart(series, opts = {}) {
  const pts = (series || []).filter(p => p && p.value != null && isFinite(p.value))
  if (!pts.length) return '<div class="fin-chart-empty">No chartable data</div>'
  const kind = opts.kind || 'num'
  const suffix = opts.suffix || ''
  const fmtVal = (v) => {
    if (kind === 'pct') return v.toFixed(1) + '%'
    if (kind === 'eps') return v.toFixed(2)
    return fmt.numFull(v)
  }
  const W = Math.max(420, pts.length * 78 + 60), H = 260
  const padL = 8, padR = 8, padT = 24, padB = 46
  const plotW = W - padL - padR, plotH = H - padT - padB
  const vals = pts.map(p => p.value)
  let max = Math.max(...vals, 0), min = Math.min(...vals, 0)
  if (max === min) { max = max + 1; min = min - 1 }
  const range = max - min
  const y0 = padT + (max / range) * plotH // y of the zero baseline
  const slot = plotW / pts.length
  const bw = Math.min(48, slot * 0.6)
  const bars = pts.map((p, idx) => {
    const cx = padL + slot * idx + slot / 2
    const x = cx - bw / 2
    const vh = (Math.abs(p.value) / range) * plotH
    const y = p.value >= 0 ? y0 - vh : y0
    const pos = p.value >= 0
    const labelY = pos ? y - 6 : y + vh + 14
    const shortLabel = String(p.label).replace(/^(FY|Q)\s*/i, '').slice(0, 8)
    return `
      <g class="fin-bar ${pos ? 'pos' : 'neg'}">
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, vh).toFixed(1)}" rx="2"></rect>
        <text class="fin-bar-val" x="${cx.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="middle">${fmtVal(p.value)}</text>
        <text class="fin-bar-x" x="${cx.toFixed(1)}" y="${(H - 16).toFixed(1)}" text-anchor="middle">${shortLabel}</text>
      </g>`
  }).join('')
  const zeroLine = min < 0 ? `<line class="fin-chart-zero" x1="${padL}" y1="${y0.toFixed(1)}" x2="${(W - padR).toFixed(1)}" y2="${y0.toFixed(1)}"></line>` : ''
  return `
    <div class="fin-chart-title">${opts.title || ''}${suffix ? ` (${suffix === '%' ? 'percent' : suffix})` : ''}</div>
    <div class="fin-chart-svgwrap">
      <svg class="fin-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img">
        ${zeroLine}
        ${bars}
      </svg>
    </div>`
}

// Delegated handler: clicking a row's chart button toggles its inline chart row.
function wireFinChartToggles(root) {
  const scope = root || document
  scope.querySelectorAll('table[data-fin-chartable="1"]').forEach(tbl => {
    if (tbl.dataset.finChartWired === '1') return
    tbl.dataset.finChartWired = '1'
    tbl.addEventListener('click', (e) => {
      // Locked (Pro-only) column → open the upgrade modal.
      const lockCell = e.target.closest('[data-fin-lock="1"]')
      if (lockCell && tbl.contains(lockCell)) {
        e.preventDefault()
        try { pro.showUpgradeModal() } catch (err) {}
        return
      }
      const btn = e.target.closest('.fin-chart-btn')
      if (!btn || !tbl.contains(btn)) return
      e.preventDefault()
      const tr = btn.closest('tr[data-fin-row]')
      if (!tr) return
      const ri = tr.getAttribute('data-fin-row')
      const chartRow = tbl.querySelector(`tr.fin-chart-row[data-fin-chart-for="${ri}"]`)
      if (!chartRow) return
      const host = chartRow.querySelector('.fin-chart-host')
      const isOpen = !chartRow.hidden
      if (isOpen) {
        chartRow.hidden = true
        btn.classList.remove('active')
        return
      }
      // Close any other open chart in this table (one at a time).
      tbl.querySelectorAll('tr.fin-chart-row:not([hidden])').forEach(r => { r.hidden = true })
      tbl.querySelectorAll('.fin-chart-btn.active').forEach(b => b.classList.remove('active'))
      try {
        const series = JSON.parse(decodeURIComponent(btn.getAttribute('data-chart-series') || '[]'))
        host.innerHTML = buildFinRowBarChart(series, {
          title: btn.getAttribute('data-chart-title') || '',
          suffix: btn.getAttribute('data-chart-suffix') || '',
          kind: btn.getAttribute('data-chart-kind') || 'num',
        })
      } catch (err) {
        host.innerHTML = '<div class="fin-chart-empty">Unable to render chart</div>'
      }
      chartRow.hidden = false
      btn.classList.add('active')
      // Pin the chart panel to the visible scroll viewport width so all bars are on-screen.
      try {
        const scroller = tbl.closest('.fin-scroll')
        if (scroller && host) {
          const vw = scroller.clientWidth
          if (vw) host.style.setProperty('--fin-vw', vw + 'px')
          host.scrollLeft = 0
        }
      } catch (e) {}
    })
  })
}

// After a financials table renders, scroll its container fully right so the newest period is visible,
// and wire up the per-row chart toggles.
function scrollFinTablesToLatest(root) {
  try {
    (root || document).querySelectorAll('[data-fin-scroll="1"]').forEach(el => {
      el.scrollLeft = el.scrollWidth
    })
  } catch (e) {}
  try { wireFinChartToggles(root) } catch (e) {}
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
    ...(data.dividendPayout?.some(v => v != null) ? [{ label: 'Dividend Payout %', data: data.dividendPayout, pct: true }] : []),
  ]

  c.innerHTML = `
    <div class="card">
      <div class="card-hdr">
        <h2>${type === 'quarterly' ? 'Quarterly Results' : 'Profit & Loss'}</h2>
        <span style="font-size:12px;color:#6b7280">${type === 'quarterly' ? 'Quarterly' : 'Annual'} · USD Millions · ${data.headers.length} ${type === 'quarterly' ? 'quarters' : 'years'} · ← scroll for older periods</span>
      </div>
      ${buildFinancialsTable(data.headers, rows)}
      ${type === 'annual' ? renderGrowthRates(buildGrowthViewModel(fins)) : ''}
    </div>
  `
  scrollFinTablesToLatest(c)
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
        <span style="font-size:12px;color:#6b7280">Annual · USD Millions · ${data.headers.length} years · ← scroll for older periods</span>
      </div>
      ${buildFinancialsTable(data.headers, rows)}
    </div>
  `
  scrollFinTablesToLatest(c)
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
        <span style="font-size:12px;color:#6b7280">Annual · USD Millions · ${data.headers.length} years · ← scroll for older periods</span>
      </div>
      ${buildFinancialsTable(data.headers, rows)}
    </div>
  `
  scrollFinTablesToLatest(c)
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
      ['Debt/Equity', fmt.debtEq(rt.debtToEquity)],
      ['Debt/Assets', fmt.num(rt.debtToAssets)],
      ['Interest Coverage', rt.interestCoverage == null ? '—' : rt.interestCoverage.toFixed(1) + 'x'],
    ]},
    { title: 'Stock Returns', items: [
      ['1 Year Return', rt.return1y != null ? (rt.return1y > 0 ? '+' : '') + rt.return1y.toFixed(1) + '%' : '—'],
      ['3 Year Return', rt.return3y != null ? (rt.return3y > 0 ? '+' : '') + rt.return3y.toFixed(1) + '%' : '—'],
      ['5 Year Return', rt.return5y != null ? (rt.return5y > 0 ? '+' : '') + rt.return5y.toFixed(1) + '%' : '—'],
      ['3M Return', rt.return3m != null ? (rt.return3m > 0 ? '+' : '') + rt.return3m.toFixed(1) + '%' : '—'],
      ['6M Return', rt.return6m != null ? (rt.return6m > 0 ? '+' : '') + rt.return6m.toFixed(1) + '%' : '—'],
    ]},
    { title: 'Growth (CAGR)', items: [
      ['Sales Growth 3Y', rt.salesGrowth3y != null ? (rt.salesGrowth3y > 0 ? '+' : '') + rt.salesGrowth3y.toFixed(1) + '%' : '—'],
      ['Sales Growth 5Y', rt.salesGrowth5y != null ? (rt.salesGrowth5y > 0 ? '+' : '') + rt.salesGrowth5y.toFixed(1) + '%' : '—'],
      ['Profit Growth 3Y', rt.profitGrowth3y != null ? (rt.profitGrowth3y > 0 ? '+' : '') + rt.profitGrowth3y.toFixed(1) + '%' : '—'],
      ['Profit Growth 5Y', rt.profitGrowth5y != null ? (rt.profitGrowth5y > 0 ? '+' : '') + rt.profitGrowth5y.toFixed(1) + '%' : '—'],
      ['Avg ROE 3Y', rt.avgRoe3y != null ? rt.avgRoe3y.toFixed(1) + '%' : '—'],
      ['Avg ROE 5Y', rt.avgRoe5y != null ? rt.avgRoe5y.toFixed(1) + '%' : '—'],
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
  const hasAny = sh?.institutional?.length || sh?.ownership?.length || sh?.insiders?.length || sh?.history?.length || sh?.secShares?.length || sh?.secActivity?.length || sh?.secFilings?.length
  if (!hasAny) {
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
    ${renderOwnershipHistory(sh.history)}
    ${renderSecSharesTrend(sh.secShares, sh.secEntity)}
    ${renderSecActivity(sh.secActivity)}
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
                <td style="color:#9ca3af;font-size:12px">${(h.reportDate && typeof h.reportDate === 'object' ? h.reportDate.fmt : h.reportDate) || '—'}</td>
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
    ${sh.secFilings?.length ? `
      <div class="card" style="margin-top:12px">
        <div class="card-hdr">
          <h2>Ownership Filings (SEC EDGAR)</h2>
          <span style="font-size:12px;color:#6b7280">${sh.secEntity?.name ? escapeHtml(sh.secEntity.name) + ' · ' : ''}CIK ${sh.secEntity?.cik || '—'}</span>
        </div>
        <div style="font-size:12px;color:#9ca3af;padding:0 4px 8px">Provider holder tables were unavailable, so these are the latest insider (Forms 3/4/5) and &gt;5% beneficial-owner (SC 13D/G) filings direct from SEC EDGAR.</div>
        <div class="tbl-scroll">
          <table class="tbl screener-results-table">
            <thead><tr><th>Form</th><th>Filed</th><th>Document</th></tr></thead>
            <tbody>
              ${sh.secFilings.map(f => `
                <tr>
                  <td><strong>${escapeHtml(f.form || '—')}</strong></td>
                  <td style="color:#9ca3af;font-size:12px">${f.date || '—'}</td>
                  <td>${f.url ? `<a href="${escapeHtml(f.url)}" target="_blank" rel="noopener" style="color:#2dd4bf">View filing ↗</a>` : '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `
}

// Quarter-by-quarter institutional ownership trend (Screener.in-style).
// `history` arrives oldest→newest; we render newest→oldest with QoQ deltas.
function renderOwnershipHistory(history) {
  if (!history?.length) return ''
  const rows = history.slice().reverse()
  const q = d => {
    if (!d) return '—'
    const dt = new Date(d)
    if (isNaN(dt)) return d
    return `Q${Math.floor(dt.getMonth() / 3) + 1} ${dt.getFullYear()}`
  }
  const deltaCell = (cur, prev, fmtFn) => {
    if (cur == null) return '<td>—</td>'
    if (prev == null) return `<td>${fmtFn(cur)}</td>`
    const diff = cur - prev
    const cls = diff > 0 ? 'up' : diff < 0 ? 'dn' : ''
    const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : ''
    return `<td>${fmtFn(cur)} <span class="${cls}" style="font-size:11px">${arrow}</span></td>`
  }
  return `
    <div class="card" style="margin-bottom:12px">
      <div class="card-hdr">
        <h2>Institutional Ownership Trend</h2>
        <span style="font-size:12px;color:#6b7280">Last ${rows.length} quarters · FMP 13F</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr><th>Quarter</th><th>% Held</th><th>Investors</th><th>Value</th><th>New</th><th>Closed</th><th>Increased</th><th>Reduced</th></tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => {
              const prev = rows[i + 1] || {}
              return `
                <tr>
                  <td><strong>${q(r.date)}</strong></td>
                  ${deltaCell(r.ownershipPct, prev.ownershipPct, v => fmt.pctAbs(v))}
                  ${deltaCell(r.investors, prev.investors, v => fmt.numFull(v))}
                  <td>${r.value != null ? fmt.compact(r.value) : '—'}</td>
                  <td class="up">${r.newPositions != null ? r.newPositions : '—'}</td>
                  <td class="dn">${r.closedPositions != null ? r.closedPositions : '—'}</td>
                  <td class="up">${r.increasedPositions != null ? r.increasedPositions : '—'}</td>
                  <td class="dn">${r.reducedPositions != null ? r.reducedPositions : '—'}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

// Shares-outstanding trend straight from SEC XBRL filings (free, no FMP).
// Falling shares = buybacks; rising = dilution. `secShares` is oldest→newest.
function renderSecSharesTrend(secShares, secEntity) {
  if (!secShares?.length) return ''
  const rows = secShares.slice().reverse() // newest first
  const q = d => {
    if (!d) return '—'
    const dt = new Date(d)
    if (isNaN(dt)) return d
    return `Q${Math.floor(dt.getUTCMonth() / 3) + 1} ${dt.getUTCFullYear()}`
  }
  const first = secShares[0]?.shares
  const last = secShares[secShares.length - 1]?.shares
  const totalChange = (first != null && last != null && first !== 0)
    ? ((last - first) / first) * 100 : null
  const summary = totalChange != null
    ? `${totalChange < 0 ? 'Buyback' : totalChange > 0 ? 'Dilution' : 'Flat'} ${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)}% over ${secShares.length}q`
    : `${rows.length} periods`
  return `
    <div class="card" style="margin-bottom:12px">
      <div class="card-hdr">
        <h2>Shares Outstanding Trend</h2>
        <span style="font-size:12px;color:#6b7280">${summary} · SEC EDGAR${secEntity?.cik ? ' · CIK ' + secEntity.cik : ''}</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead><tr><th>Period</th><th>Shares Outstanding</th><th>QoQ Change</th><th>Filing</th></tr></thead>
          <tbody>
            ${rows.map((r, i) => {
              const prev = rows[i + 1]
              let change = '—', cls = ''
              if (prev?.shares != null && r.shares != null && prev.shares !== 0) {
                const pc = ((r.shares - prev.shares) / prev.shares) * 100
                cls = pc < 0 ? 'up' : pc > 0 ? 'dn' : '' // fewer shares = bullish (buyback)
                change = `${pc > 0 ? '+' : ''}${pc.toFixed(2)}% ${pc < 0 ? '▼' : pc > 0 ? '▲' : ''}`
              }
              return `
                <tr>
                  <td><strong>${q(r.date)}</strong>${r.period === 'FY' ? ' <span style="font-size:10px;color:#6b7280">FY</span>' : ''}</td>
                  <td>${r.shares != null ? fmt.numFull(r.shares) : '—'}</td>
                  <td class="${cls}">${change}</td>
                  <td style="color:#9ca3af;font-size:12px">${r.form || '—'}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
      <div style="font-size:11px;color:#9ca3af;padding:6px 4px 0">A declining share count signals buybacks (shareholder-friendly); a rising count signals dilution.</div>
    </div>
  `
}

// Quarterly insider (Forms 3/4/5) and >5% owner (SC 13D/G) filing activity.
// `secActivity` is oldest→newest.
function renderSecActivity(secActivity) {
  if (!secActivity?.length) return ''
  const rows = secActivity.slice().reverse()
  return `
    <div class="card" style="margin-bottom:12px">
      <div class="card-hdr">
        <h2>Insider Filing Activity</h2>
        <span style="font-size:12px;color:#6b7280">Per quarter · SEC EDGAR</span>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead><tr><th>Quarter</th><th>Insider Filings (3/4/5)</th><th>Major Holder (13D/G)</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.quarter || '—')}</strong></td>
                <td>${r.insider != null ? r.insider : '—'}</td>
                <td>${r.major != null ? r.major : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

// Optional columns the user can add to the Peer Comparison table via "+ Add Column".
// `get(x)` reads from the peer row (x._rt holds the full ratios object).
const PEER_OPTIONAL_COLS = [
  { id: 'pb',           label: 'P/B',          get: x => x._rt?.pb,            fmt: v => fmt.num(v) },
  { id: 'ps',           label: 'P/S',          get: x => x._rt?.ps,            fmt: v => fmt.num(v) },
  { id: 'peg',          label: 'PEG',          get: x => x._rt?.peg,           fmt: v => fmt.num(v) },
  { id: 'evEbitda',     label: 'EV/EBITDA',    get: x => x._rt?.evEbitda,      fmt: v => fmt.num(v) },
  { id: 'grossMargin',  label: 'Gross Mgn',    get: x => x._rt?.grossMargin,   fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
  { id: 'opMargin',     label: 'Op. Margin',   get: x => x._rt?.opMargin,      fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
  { id: 'roa',          label: 'ROA %',        get: x => x._rt?.roa,           fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
  { id: 'roce',         label: 'ROCE %',       get: x => x._rt?.roce,          fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
  { id: 'currentRatio', label: 'Current R.',   get: x => x._rt?.currentRatio,  fmt: v => fmt.num(v) },
  { id: 'quickRatio',   label: 'Quick R.',     get: x => x._rt?.quickRatio,    fmt: v => fmt.num(v) },
  { id: 'fcfYield',     label: 'FCF Yield',    get: x => x._rt?.fcfYield,      fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
  { id: 'earningsYield',label: 'Earn. Yield',  get: x => x._rt?.earningsYield, fmt: v => v != null ? v.toFixed(1) + '%' : '—' },
]

function getPeerActiveCols() {
  try {
    const raw = sessionStorage.getItem('ds-peer-cols')
    if (!raw) return []
    return JSON.parse(raw).filter(id => PEER_OPTIONAL_COLS.some(col => col.id === id))
  } catch { return [] }
}
function setPeerActiveCols(ids) {
  try { sessionStorage.setItem('ds-peer-cols', JSON.stringify(ids)) } catch {}
}

function renderPeersTab(c, p) {
  if (!p?.peers?.length) { c.innerHTML = '<div class="card"><div class="empty">No peers found</div></div>'; return }
  c.__peerData = p
  drawPeersTable(c, p)
}

function drawPeersTable(c, p) {
  const activeIds = getPeerActiveCols()
  const activeCols = activeIds.map(id => PEER_OPTIONAL_COLS.find(col => col.id === id)).filter(Boolean)
  const cell = (v) => v == null || v === '' || (typeof v === 'number' && !isFinite(v)) ? '—' : v
  c.innerHTML = `
    <div class="card">
      <div class="card-hdr peer-hdr">
        <h2>Peer Comparison</h2>
        <div class="peer-addcol-wrap">
          <button type="button" id="peer-addcol-btn" class="peer-addcol-btn">＋ Add Column</button>
          <div id="peer-addcol-menu" class="peer-addcol-menu" hidden>
            <div class="peer-addcol-menu-hd">Add data columns</div>
            ${PEER_OPTIONAL_COLS.map(col => `
              <label class="peer-addcol-opt">
                <input type="checkbox" value="${col.id}" ${activeIds.includes(col.id) ? 'checked' : ''}>
                <span>${col.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
      <div class="tbl-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th>Company</th><th>Price</th><th>Chg %</th><th>Mkt Cap</th><th>P/E</th><th>ROE %</th><th>Net Margin</th><th>Sales Gr.</th><th>D/E</th><th>Div Yld</th>
              ${activeCols.map(col => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${p.peers.map(x => `
              <tr>
                <td><a href="${routeHref(`/stock/${x.ticker}`)}" data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" class="stock-link"><strong style="color:#2dd4bf">${x.ticker}</strong></a></td>
                <td>${fmt.usd(x.price)}</td>
                <td class="${fmt.pctClass(x.changePct)}">${fmt.pct(x.changePct)}</td>
                <td>${fmt.compact(x.mktCap)}</td>
                <td>${fmt.num(x.pe)}</td>
                <td class="${x.roe != null ? (x.roe >= 15 ? 'up' : '') : ''}">${x.roe != null ? x.roe.toFixed(1) + '%' : '—'}</td>
                <td>${x.netMargin != null ? x.netMargin.toFixed(1) + '%' : '—'}</td>
                <td class="${x.salesGrowth != null ? (x.salesGrowth >= 0 ? 'up' : 'dn') : ''}">${x.salesGrowth != null ? (x.salesGrowth > 0 ? '+' : '') + x.salesGrowth.toFixed(1) + '%' : '—'}</td>
                <td>${x.debtToEquity != null ? x.debtToEquity.toFixed(2) : '—'}</td>
                <td>${fmt.pctAbs(x.dividendYield)}</td>
                ${activeCols.map(col => `<td>${cell(col.fmt(col.get(x)))}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
  wirePeerAddColumn(c, p)
  bindRouteElements(c)
}

function wirePeerAddColumn(c, p) {
  const btn = c.querySelector('#peer-addcol-btn')
  const menu = c.querySelector('#peer-addcol-menu')
  if (!btn || !menu) return
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    menu.hidden = !menu.hidden
  })
  menu.addEventListener('click', (e) => e.stopPropagation())
  menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const ids = [...menu.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value)
      setPeerActiveCols(ids)
      drawPeersTable(c, p) // re-render with new columns; menu reopens closed
    })
  })
  // Close the menu when clicking elsewhere.
  const onDoc = (e) => { if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) menu.hidden = true }
  document.addEventListener('click', onDoc)
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
  'Volume':                { key: 'volume', unit: '' },
  'Average Volume':        { key: 'avgVolume', unit: '' },
  '52 Week High':          { key: 'yearHigh', unit: '$' },
  '52 Week Low':           { key: 'yearLow', unit: '$' },
  'Beta':                  { key: 'beta', unit: '' },
  'Operating Margin':      { key: 'opMargin', unit: '%' },
  'Enterprise Value':      { key: 'enterpriseValue', unit: '$' },
  'EV/Sales':              { key: 'evSales', unit: 'x' },
  'P/FCF':                 { key: 'pFcf', unit: 'x' },
  'P/OCF':                 { key: 'pOcf', unit: 'x' },
  'Earnings Yield':        { key: 'earningsYield', unit: '%' },
  'Quick Ratio':           { key: 'quickRatio', unit: '' },
  'Interest Coverage':     { key: 'interestCoverage', unit: 'x' },
  'Payout Ratio':          { key: 'payoutRatio', unit: '%' },
  'Book Value Per Share':  { key: 'bookValuePs', unit: '$' },
  'EBITDA':                { key: 'ebitda', unit: '$' },
  'Free Cash Flow':        { key: 'freeCashFlow', unit: '$' },
  'Operating Cash Flow':   { key: 'operatingCashFlow', unit: '$' },
  'Total Debt':            { key: 'totalDebt', unit: '$' },
  'Total Cash':            { key: 'totalCash', unit: '$' },
  'Net Debt':              { key: 'netDebt', unit: '$' },
  'Sector':                { key: 'sector', unit: '', string: true },
  'Country':               { key: 'country', unit: '', string: true },
}
// Ratio groups for the "Add Ratio" picker — standard finance categories.
// Each item is the canonical metric name the query parser recognizes.
const RATIO_GROUPS = [
  { group: 'Size & Price', items: [
    'Market Capitalization', 'Current price', 'Change %', 'Enterprise Value',
    '52 Week High', '52 Week Low', 'Volume', 'Average Volume', 'Beta',
  ]},
  { group: 'Valuation', items: [
    'Price to Earning', 'Price to book value', 'Price to Sales', 'PEG Ratio',
    'EV/EBITDA', 'EV/Revenue', 'EV/Sales', 'Price to Free Cash Flow',
    'P/OCF', 'Earnings yield', 'Book Value Per Share',
  ]},
  { group: 'Profitability', items: [
    'Return on Equity', 'Return on capital employed', 'Return on Assets',
    'Net Margin', 'OPM', 'Gross Margin', 'Average ROE 3Years', 'Average ROE 5Years',
    'EPS',
  ]},
  { group: 'Growth', items: [
    'Sales growth', 'Profit growth', 'YOY Qtr sales growth', 'YOY Qtr profit growth',
    'Sales growth 3Years', 'Sales growth 5Years', 'Profit growth 3Years', 'Profit growth 5Years',
  ]},
  { group: 'Financial Health', items: [
    'Debt to Equity', 'Current ratio', 'Quick ratio', 'Cash ratio',
    'Interest Coverage Ratio', 'Debt', 'Total Debt', 'Total Cash', 'Net Debt',
    'Payout Ratio', 'Dividend Yield',
  ]},
  { group: 'Cash Flow & Earnings', items: [
    'EBITDA', 'Free Cash Flow', 'Operating Cash Flow',
    'Sales', 'Profit after tax', 'Sales latest quarter', 'PAT latest quarter',
  ]},
  { group: 'Classification', items: [
    'Sector', 'Country',
  ]},
]

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
  // ── Top 5 presets (matching hero cards exactly) ──────────────────────────
  { name: '🏆 Warren Buffett', q: 'ROE > 20 AND Average ROE 5Years > 18 AND ROCE > 15 AND Net Margin > 15 AND Debt to Equity < 0.5 AND Interest Coverage Ratio > 5 AND Market Cap > 5000' },
  { name: '🚀 Momentum', q: 'Change % > 5 AND YOY Qtr profit growth > 20 AND YOY Qtr sales growth > 15 AND ROE > 15 AND Net Margin > 8 AND Market Cap > 2000' },
  { name: '📈 High Growth', q: 'PEG Ratio > 0 AND PEG Ratio < 1 AND Sales growth 3Years > 15 AND Profit growth 3Years > 20 AND Sales growth 5Years > 12 AND Gross Margin > 40 AND Debt to Equity < 0.8 AND Market Cap > 1000' },
  { name: '💰 Undervalued', q: 'P/E > 0 AND P/E < 15 AND P/B < 1.5 AND Current ratio > 2 AND Earnings yield > 6 AND Debt to Equity < 1 AND ROE > 10 AND Market Cap > 1000' },
  { name: '💵 Dividend Income', q: 'Dividend Yield > 2.5 AND Dividend Yield < 8 AND ROE > 12 AND Net Margin > 10 AND Interest Coverage Ratio > 4 AND Debt to Equity < 1 AND Market Cap > 5000' },
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
  { key: 'volume', label: 'Volume', type: 'compact' },
  { key: 'avgVolume', label: 'Average Volume', type: 'compact' },
  { key: 'yearHigh', label: '52 Week High', type: 'usd' },
  { key: 'yearLow', label: '52 Week Low', type: 'usd' },
  { key: 'beta', label: 'Beta', type: 'num' },
  { key: 'opMargin', label: 'Operating Margin', type: 'pctAbs' },
  { key: 'evSales', label: 'EV/Sales', type: 'num' },
  { key: 'pFcf', label: 'P/FCF', type: 'num' },
  { key: 'pOcf', label: 'P/OCF', type: 'num' },
  { key: 'payoutRatio', label: 'Payout Ratio', type: 'pctAbs' },
  { key: 'bookValuePs', label: 'Book Value / Share', type: 'usd' },
  { key: 'ebitda', label: 'EBITDA', type: 'compact' },
  { key: 'freeCashFlow', label: 'Free Cash Flow', type: 'compact' },
  { key: 'operatingCashFlow', label: 'Operating Cash Flow', type: 'compact' },
  { key: 'totalDebt', label: 'Total Debt', type: 'compact' },
  { key: 'totalCash', label: 'Total Cash', type: 'compact' },
  { key: 'netDebt', label: 'Net Debt', type: 'compact' },
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
  // Read query from URL ?q=... (shareable screen URLs) or ?preset=N
  const __urlParams = new URLSearchParams(window.location.search)
  const __urlQ = __urlParams.get('q')
  const __presetIdx = __urlParams.get('preset')
  if (__urlQ) {
    sessionStorage.setItem('ds-query', __urlQ)
  } else if (__presetIdx !== null) {
    const __pq = (window.__DS_PRESET_QUERIES__ || [])[parseInt(__presetIdx)]
    if (__pq) sessionStorage.setItem('ds-query', __pq.q)
  }
  const savedQ = window.__DS_FORCED_QUERY__ || sessionStorage.getItem('ds-query') || 'Market Cap > 10000 AND\nPrice to Earning < 30 AND\nReturn on Equity > 15'
  window.__DS_FORCED_QUERY__ = null
  let PAGE_SIZE = Number(sessionStorage.getItem('ds-screener-pagesize') || 25)
  if (![10, 25, 50].includes(PAGE_SIZE)) PAGE_SIZE = 25
  let currentPage = Number(sessionStorage.getItem('ds-screener-page') || 1)
  let currentConditions = []
  let selectedColumns = getScreenerColumns()
  let currentSort = getScreenerSort()
  
  el.innerHTML = `
    <div class="container" style="padding:24px 16px">
      <!-- ════════ BUILDER VIEW ════════ -->
      <div id="screener-builder-view">
        <h1 class="screener-page-h1">US Stock Screener</h1>
        <p class="screener-page-sub">Filter 5,000+ NYSE &amp; NASDAQ stocks by P/E, ROE, market cap, margins, debt and 30+ more metrics.</p>

        <div class="search-query-card">
          <h2 class="search-query-title">Build Your Screen</h2>
          <div class="search-query-grid">
            <div class="search-query-left">
              <label class="search-query-label" for="query-textarea">Your Filters</label>
              <div class="query-input-wrap">
                <textarea id="query-textarea" placeholder="e.g.  Market Cap > 100 AND
       Price to Earning < 30 AND
       Return on Equity > 15">${savedQ}</textarea>
                <div id="metric-suggest" class="metric-suggest hidden"></div>
              </div>
              <div class="search-run-row">
                <button class="btn btn-primary search-run-btn" id="run-query-btn">🔍 Run Screen</button>
              </div>
            </div>
            <aside class="search-query-example">
              <h3>Screen Examples</h3>
              <div class="screen-example-item">
                <span class="screen-example-tag">Quality Value</span>
                <p>Market Cap &gt; 2000 <strong>AND</strong></p>
                <p>Price to Earning &lt; 15 <strong>AND</strong></p>
                <p>Return on Equity &gt; 18%</p>
              </div>
              <div class="screen-example-item">
                <span class="screen-example-tag">Strong Balance Sheet</span>
                <p>Net Profit Margin &gt; 12 <strong>AND</strong></p>
                <p>Debt to Equity &lt; 0.5</p>
              </div>
              <div class="screen-example-item">
                <span class="screen-example-tag">Growth</span>
                <p>Revenue Growth &gt; 15 <strong>AND</strong></p>
                <p>Return on Capital Employed &gt; 20%</p>
              </div>
              <button type="button" class="search-query-example-link" onclick="document.getElementById('metrics-ref').style.display='block';document.getElementById('metrics-ref').scrollIntoView({behavior:'smooth'})">Browse all available metrics →</button>
            </aside>
          </div>

          <div class="query-tip">Tip: Combine conditions with <code>AND</code>. Operators: <code>&gt;</code> <code>&lt;</code> <code>&gt;=</code> <code>&lt;=</code> <code>=</code>. Market Cap values are in <strong>USD millions</strong>, so <code>100</code> means <code>$100 million</code>.</div>

          <div class="search-query-foot">
            <button class="btn search-foot-btn" id="add-ratio-btn">＋ Add Ratio</button>
            <button class="btn search-foot-btn" id="save-query-btn">Save Screen</button>
            <button class="btn search-foot-btn" id="export-query-btn" disabled>Download Excel</button>
            <button class="btn search-foot-btn" id="columns-btn">Edit Columns</button>
            <button class="btn search-foot-btn" id="share-query-btn" title="Copy shareable link">🔗 Share</button>
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
      </div>

      <!-- ════════ RESULTS VIEW ════════ -->
      <div id="screener-results-view" style="display:none">
        <div class="results-topbar">
          <button class="btn btn-outline btn-sm" id="back-to-query-btn">← Back to query</button>
          <button class="btn btn-outline btn-sm" id="results-edit-query-btn" style="display:none"></button>
        </div>
        <div id="column-editor-wrap"></div>
        <div id="query-results"></div>
      </div>
    </div>

    <div class="ratio-modal-backdrop hidden" id="ratio-modal-backdrop">
      <div class="ratio-modal" role="dialog" aria-label="Add ratio">
        <div class="ratio-modal-hdr">
          <strong>Add a ratio to your query</strong>
          <button type="button" class="ratio-modal-close" id="ratio-modal-close" aria-label="Close">×</button>
        </div>
        <input type="text" class="ratio-modal-search" id="ratio-modal-search" placeholder="Search ratios… e.g. ROE, debt, growth" autocomplete="off">
        <div class="ratio-modal-body" id="ratio-modal-body"></div>
      </div>
    </div>
  `

  window.setQuery = (i) => {
    const queries = window.__DS_PRESET_QUERIES__ || SAMPLE_QUERIES
    document.getElementById('query-textarea').value = queries[i].q.replace(/ AND /g, ' AND\n')
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

  // ── View swap: builder <-> results (same URL) ────────────────────────────
  function showResultsView() {
    const b = document.getElementById('screener-builder-view')
    const r = document.getElementById('screener-results-view')
    if (b) b.style.display = 'none'
    if (r) r.style.display = 'block'
    sessionStorage.setItem('ds-screener-view', 'results')
  }
  function showBuilderView() {
    const b = document.getElementById('screener-builder-view')
    const r = document.getElementById('screener-results-view')
    if (r) r.style.display = 'none'
    if (b) b.style.display = 'block'
    sessionStorage.setItem('ds-screener-view', 'builder')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  window.dsShowScreenerBuilder = showBuilderView
  document.getElementById('back-to-query-btn')?.addEventListener('click', showBuilderView)

  // Scroll results into view after a run.
  function scrollToResults() {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }
  async function runAndScroll(page = 1) {
    showResultsView()
    await runQuery(page)
    scrollToResults()
  }

  document.getElementById('run-query-btn').addEventListener('click', () => {
    trackEvent('run_screen_clicked', {
      query: document.getElementById('query-textarea').value.substring(0, 100),
      page: 'screener'
    })
    runAndScroll(1)
  })

  // ── "Add Ratio" modal: grouped, searchable ratio picker ─────────────────
  function insertRatioIntoQuery(name, def) {
    const ta = document.getElementById('query-textarea')
    if (!ta) return
    const op = def && def.string ? ' = ' : ' > '
    const trimmed = ta.value.replace(/\s+$/, '')
    const needsAnd = trimmed.length > 0
    ta.value = (needsAnd ? trimmed + ' AND\n' : '') + name + op
    ta.focus()
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }
  function renderRatioGroups(filter = '') {
    const body = document.getElementById('ratio-modal-body')
    if (!body) return
    const q = filter.trim().toLowerCase()
    const sections = RATIO_GROUPS.map(({ group, items }) => {
      const matched = items.filter(name => {
        if (!q) return true
        const def = METRICS[name]
        return name.toLowerCase().includes(q) || (def && def.key.toLowerCase().includes(q))
      })
      if (!matched.length) return ''
      return `<div class="ratio-group">
        <div class="ratio-group-title">${group}</div>
        <div class="ratio-group-chips">
          ${matched.map(name => {
            const def = METRICS[name] || {}
            const unit = def.unit ? `<span class="ratio-chip-unit">${def.unit}</span>` : ''
            return `<button type="button" class="ratio-chip" data-ratio="${name.replace(/"/g, '&quot;')}">${name}${unit}</button>`
          }).join('')}
        </div>
      </div>`
    }).join('')
    body.innerHTML = sections || `<div class="ratio-empty">No ratios match “${filter}”.</div>`
    body.querySelectorAll('.ratio-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.ratio
        insertRatioIntoQuery(name, METRICS[name])
        closeRatioModal()
      })
    })
  }
  function openRatioModal() {
    const bd = document.getElementById('ratio-modal-backdrop')
    if (!bd) return
    renderRatioGroups('')
    bd.classList.remove('hidden')
    const search = document.getElementById('ratio-modal-search')
    if (search) { search.value = ''; setTimeout(() => search.focus(), 30) }
  }
  function closeRatioModal() {
    document.getElementById('ratio-modal-backdrop')?.classList.add('hidden')
  }
  document.getElementById('add-ratio-btn')?.addEventListener('click', () => {
    trackEvent('add_ratio_clicked', { page: 'screener' })
    openRatioModal()
  })
  document.getElementById('ratio-modal-close')?.addEventListener('click', closeRatioModal)
  document.getElementById('ratio-modal-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'ratio-modal-backdrop') closeRatioModal()
  })
  document.getElementById('ratio-modal-search')?.addEventListener('input', e => renderRatioGroups(e.target.value))
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeRatioModal()
  })

  // ── Popular screens (bottom of page) ────────────────────────────────────
  document.querySelectorAll('.popular-screen-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.popularIdx, 10)
      const queries = window.__DS_PRESET_QUERIES__ || SAMPLE_QUERIES
      const preset = queries[idx]
      if (!preset) return
      document.getElementById('query-textarea').value = preset.q.replace(/ AND /gi, ' AND\n')
      currentPage = 1
      sessionStorage.setItem('ds-screener-page', '1')
      runAndScroll(1)
    })
  })

  document.getElementById('save-query-btn')?.addEventListener('click', () => {
    trackEvent('save_screen_clicked', { page: 'screener' })
    saveCurrentQuery()
  })
  document.getElementById('columns-btn')?.addEventListener('click', () => {
    trackEvent('edit_columns_clicked', { page: 'screener' })
    showResultsView()
    toggleColumnEditor()
    document.getElementById('column-editor')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
  document.getElementById('export-query-btn')?.addEventListener('click', () => {
    trackEvent('download_excel_clicked', { page: 'screener' })
    exportScreenerResults()
  })
  document.getElementById('share-query-btn')?.addEventListener('click', () => {
    const q = document.getElementById('query-textarea').value.trim()
    if (!q) return
    trackEvent('share_screen_clicked', { page: 'screener' })
    const url = `${SITE_ORIGIN}/screener?q=${encodeURIComponent(q)}`
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('share-query-btn')
      const orig = btn.textContent
      btn.textContent = '✓ Copied!'
      btn.style.color = '#10b981'
      setTimeout(() => { btn.textContent = orig; btn.style.color = '' }, 2000)
    }).catch(() => {
      // Fallback for older browsers
      prompt('Copy this shareable link:', url)
    })
  })
  // Decide which view to show on load.
  // If user arrived via a shared ?q= / ?preset link, or returned to a prior
  // results session, show results immediately. Otherwise show the builder.
  const __cameFromLink = !!(__urlQ || __presetIdx !== null)
  const __priorView = sessionStorage.getItem('ds-screener-view')
  if (__cameFromLink || __priorView === 'results') {
    showResultsView()
    runQuery(currentPage)
  } else {
    showBuilderView()
  }

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
    // Pro gate
    const proEmail = pro.getEmail()
    const isPro = proEmail ? await pro.check(proEmail) : false
    if (!isPro) {
      await pro.showUpgradeModal()
      return
    }
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
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'screen_saved', { screen_name: name, query: q.slice(0, 100) })
      }
    } catch (e) {
      if (/unauthorized|sign in/i.test(e.message || '')) {
        const refreshed = await refreshGoogleSession()
        if (refreshed) {
          try {
            await apiJson('/user/screens', { name, query: q })
            alert('Screen saved.')
            if (typeof window.gtag === 'function') {
              window.gtag('event', 'screen_saved', { screen_name: name, query: q.slice(0, 100) })
            }
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
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'screener_run', {
          filter_count: conditions.length,
          result_count: (res.results || []).length,
          query: q.slice(0, 100),
          signed_in: auth.signedIn()
        })
      }
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
    
    const topN = Math.min(5, results.length)
    el.innerHTML = `
      <div class="results-header">
        <h1 class="results-title">Screen Results</h1>
        <div class="results-header-actions">
          <button class="btn btn-outline btn-sm" id="summary-save-btn"><span class="btn-ico">💾</span> Save Screen</button>
        </div>
      </div>
      <div class="results-subbar">
        <div class="results-count">Matched <strong>${total.toLocaleString('en-US')}</strong> stocks — page ${page} of ${totalPages}</div>
        <div class="results-toolbar">
          <button class="btn btn-outline btn-sm" onclick="exportScreenerResults()"><span class="btn-ico">⤓</span> Export</button>
          <button class="btn btn-outline btn-sm" onclick="toggleColumnEditor()"><span class="btn-ico">⚙</span> Add Column</button>
          <button class="btn btn-outline btn-sm" id="summary-watch-btn"><span class="btn-ico">★</span> Watch top ${topN}</button>
        </div>
      </div>
      ${pillsHtml ? `<div class="results-pills">${pillsHtml}</div>` : ''}
      <div class="screener-sort-summary">Sorted by <strong>${sortLabel}</strong> · ${sortDirectionText}</div>
      <div class="card">
        <div class="tbl-scroll">
          <table class="tbl screener-results-table">
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
                  <td data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" style="cursor:pointer"><a href="${routeHref(`/stock/${s.ticker}`)}" data-route="/stock/${s.ticker}" onclick="navigate('/stock/${s.ticker}');return false" class="stock-link screener-company">${renderScreenerLogo(s.ticker)}<span class="screener-company-text"><strong>${s.ticker}</strong><span>${s.name || ''}</span></span></a></td>
                  ${activeCols.map(c => `<td class="${['pct','pctAbs'].includes(c.type) ? fmt.pctClass(s[c.key]) : ''}">${renderScreenerCellStable(s[c.key], c.type)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="results-pager-row">
        ${pagerHtml}
        <div class="results-perpage">
          <span>Results per page</span>
          ${[10, 25, 50].map(n => `<button type="button" class="perpage-btn ${PAGE_SIZE === n ? 'active' : ''}" data-perpage="${n}">${n}</button>`).join('')}
        </div>
      </div>
    `
    el.querySelectorAll('.perpage-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const n = Number(btn.dataset.perpage)
        if (![10, 25, 50].includes(n) || n === PAGE_SIZE) return
        PAGE_SIZE = n
        sessionStorage.setItem('ds-screener-pagesize', String(n))
        runQuery(1)
      })
    })
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

    // Sticky summary bar actions
    const summarySaveBtn = document.getElementById('summary-save-btn')
    if (summarySaveBtn) {
      summarySaveBtn.addEventListener('click', () => {
        if (!auth.signedIn()) { showSignInModal('Save this screen for later'); return }
        saveCurrentQuery()
      })
    }
    const summaryWatchBtn = document.getElementById('summary-watch-btn')
    if (summaryWatchBtn) {
      summaryWatchBtn.addEventListener('click', () => {
        const top = results.slice(0, 5)
        let added = 0
        top.forEach(s => {
          if (!watchlist.has(s.ticker)) {
            watchlist.add({ ticker: s.ticker, name: s.name, price: s.currentPrice ?? s.price, changePct: s.changePct, addedAt: Date.now() })
            added++
          }
        })
        summaryWatchBtn.textContent = added > 0 ? `✓ Added ${added} — View watchlist` : '✓ Already saved'
        summaryWatchBtn.classList.add('btn-success')
        summaryWatchBtn.onclick = () => navigate('/watchlist')
      })
    }

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
            <button id="ds-nudge-signin-btn" style="padding:8px 18px;border-radius:20px;background:#2563eb;color:#fff;border:none;font-weight:700;font-size:13px;cursor:pointer">Save Screen</button>
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
  // Render immediately from cached local items, then refresh + enrich in the
  // background so the page never blocks on slow API calls.
  let items = watchlist.get()
  paintWatchlist(el, items)

  // Background: pull the authoritative server list (signed-in), enrich any items
  // missing fields, repaint, and persist — all without blocking first paint.
  ;(async () => {
    try {
      if (auth.signedIn()) {
        const data = await api('/user/watchlist')
        if (Array.isArray(data.watchlist)) {
          items = data.watchlist.map(x => normalizeWatchItem({ ticker: x.ticker, name: x.name, price: x.price, exchange: x.exchange, change: x.change, changePct: x.change_pct, addedAt: x.added_at })).filter(Boolean)
          if (location.pathname === '/watchlist') paintWatchlist(el, items)
        }
      }
      const needsEnrichment = items.some(x => !x.exchange || x.change == null || x.changePct == null || x.price == null || !x.name)
      if (needsEnrichment) {
        items = await Promise.all(items.map(async item => {
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
        if (location.pathname === '/watchlist') paintWatchlist(el, items)
        // Persist enriched details back to the account (fire-and-forget).
        if (auth.signedIn()) {
          items
            .map(normalizeWatchItem)
            .filter(item => item?.ticker && watchItemHasDetails(item))
            .forEach(item => apiJson('/user/watchlist', item).catch(() => null))
        }
      }
      localStorage.setItem('ds-watchlist', JSON.stringify(items.map(normalizeWatchItem).filter(Boolean)))
    } catch {}
  })()
}

function paintWatchlist(el, items) {
  if (items.length === 0) {
    const trending = [
      { t: 'AAPL', n: 'Apple' },
      { t: 'MSFT', n: 'Microsoft' },
      { t: 'NVDA', n: 'NVIDIA' },
      { t: 'AMZN', n: 'Amazon' },
      { t: 'GOOGL', n: 'Alphabet' },
      { t: 'TSLA', n: 'Tesla' },
    ]
    el.innerHTML = `
      <div class="container" style="padding:48px 16px;max-width:720px">
        <div class="watchlist-empty">
          <div class="watchlist-empty-icon">⭐</div>
          <h1 class="watchlist-empty-title">Your watchlist is empty</h1>
          <p class="watchlist-empty-sub">Save stocks to track price moves, compare ideas side by side, and pick up where you left off — no setup required.</p>

          <div class="watchlist-why">
            <div class="watchlist-why-item"><strong>Track moves</strong><span>See price and % change for everything you're watching in one view.</span></div>
            <div class="watchlist-why-item"><strong>Stay organized</strong><span>Keep your best ideas together instead of re-searching every time.</span></div>
            <div class="watchlist-why-item"><strong>Sync anywhere</strong><span>${auth.signedIn() ? 'Synced to your account across devices.' : 'Sign in to sync across devices.'}</span></div>
          </div>

          <div class="watchlist-trending-label">Start with a trending stock</div>
          <div class="watchlist-trending">
            ${trending.map(s => `<a href="${routeHref(`/stock/${s.t}`)}" class="watchlist-trending-chip" data-route="/stock/${s.t}" onclick="navigate('/stock/${s.t}');return false"><strong>${s.t}</strong><span>${s.n}</span></a>`).join('')}
          </div>

          <div class="watchlist-empty-actions">
            <a href="${routeHref('/screener')}" class="btn btn-primary" data-route="/screener" onclick="navigate('/screener');return false">Open the screener</a>
            <a href="${routeHref('/')}" class="btn btn-outline" data-route="/" onclick="navigate('/');return false">Browse stocks</a>
          </div>
        </div>
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
                  <td data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" style="cursor:pointer"><a href="${routeHref(`/stock/${x.ticker}`)}" data-route="/stock/${x.ticker}" onclick="navigate('/stock/${x.ticker}');return false" class="stock-link"><strong style="color:#2563eb">${x.ticker}</strong> <span style="color:#6b7280;font-size:12px">${x.name || ''}</span></a></td>
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
// ALERTS
// ═══════════════════════════════════════════════════════════════════════
const ALERT_FUND_METRICS = [
  { v: 'pe', l: 'P/E Ratio' }, { v: 'pb', l: 'P/B Ratio' }, { v: 'ps', l: 'P/S Ratio' },
  { v: 'peg', l: 'PEG Ratio' }, { v: 'roe', l: 'ROE %' }, { v: 'roce', l: 'ROCE %' },
  { v: 'roa', l: 'ROA %' }, { v: 'netMargin', l: 'Net Margin %' }, { v: 'opm', l: 'Operating Margin %' },
  { v: 'debtToEquity', l: 'Debt / Equity' }, { v: 'dividendYield', l: 'Dividend Yield %' },
  { v: 'marketCap', l: 'Market Cap' }, { v: 'eps', l: 'EPS' }, { v: 'evEbitda', l: 'EV / EBITDA' },
]

const alerts = {
  list: () => api('/user/alerts').catch(() => ({ alerts: [], events: [] })),
  create: body => apiJson('/user/alerts', body),
  remove: id => apiDelete('/user/alerts', { id }),
}

function alertDescribe(a) {
  const op = a.operator === 'below' ? '<' : '>'
  if (a.type === 'price') return `Price ${op} $${a.threshold}`
  if (a.type === 'pct') return `Daily change ${op} ${a.threshold}%`
  if (a.type === 'fundamental') {
    const m = ALERT_FUND_METRICS.find(x => x.v === a.metric)
    return `${m ? m.l : a.metric} ${op} ${a.threshold}`
  }
  if (a.type === 'screen') return a.label || 'Screen membership change'
  return a.label || 'Alert'
}

function openAlertModal(stock) {
  if (!auth.signedIn()) {
    showActionToast('<strong>Sign in to set alerts.</strong> Alerts are free for signed-in users.', [
      { label: 'Go to Alerts', onClick: () => navigate('/alerts') },
    ])
    return
  }
  document.getElementById('ds-alert-modal')?.remove()
  const m = document.createElement('div')
  m.id = 'ds-alert-modal'
  m.className = 'ds-modal-overlay'
  const fundOpts = ALERT_FUND_METRICS.map(x => `<option value="${x.v}">${x.l}</option>`).join('')
  m.innerHTML = `
    <div class="ds-modal-card">
      <button class="ds-modal-close" id="alert-modal-close" aria-label="Close">×</button>
      <h2 class="ds-modal-title">🔔 Alert for ${stock.ticker}</h2>
      <p class="ds-modal-sub">Get an email when your condition is met. Current price: <strong>${fmt.usd(stock.price)}</strong></p>
      <label class="ds-field-label">Alert type</label>
      <select id="alert-type" class="ds-input">
        <option value="price">Price</option>
        <option value="pct">Daily % move</option>
        <option value="fundamental">Fundamental metric</option>
      </select>
      <div id="alert-metric-wrap" style="display:none">
        <label class="ds-field-label">Metric</label>
        <select id="alert-metric" class="ds-input">${fundOpts}</select>
      </div>
      <div class="ds-field-row">
        <div style="flex:1">
          <label class="ds-field-label">Condition</label>
          <select id="alert-op" class="ds-input">
            <option value="above">Rises above</option>
            <option value="below">Drops below</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="ds-field-label" id="alert-thresh-label">Price ($)</label>
          <input id="alert-thresh" class="ds-input" type="number" step="any" placeholder="e.g. ${stock.price ? (stock.price * 1.1).toFixed(2) : '100'}" />
        </div>
      </div>
      <div id="alert-modal-err" class="ds-modal-err"></div>
      <button id="alert-save" class="btn btn-primary" style="width:100%;margin-top:14px">Create alert</button>
    </div>
  `
  document.body.appendChild(m)
  const typeSel = m.querySelector('#alert-type')
  const metricWrap = m.querySelector('#alert-metric-wrap')
  const threshLabel = m.querySelector('#alert-thresh-label')
  const updateFields = () => {
    const t = typeSel.value
    metricWrap.style.display = t === 'fundamental' ? 'block' : 'none'
    threshLabel.textContent = t === 'price' ? 'Price ($)' : t === 'pct' ? 'Change (%)' : 'Value'
  }
  typeSel.addEventListener('change', updateFields)
  updateFields()
  const close = () => m.remove()
  m.querySelector('#alert-modal-close').addEventListener('click', close)
  m.addEventListener('click', e => { if (e.target === m) close() })
  m.querySelector('#alert-save').addEventListener('click', async () => {
    const err = m.querySelector('#alert-modal-err')
    err.textContent = ''
    const type = typeSel.value
    const operator = m.querySelector('#alert-op').value
    const threshold = Number(m.querySelector('#alert-thresh').value)
    if (!isFinite(threshold)) { err.textContent = 'Enter a valid number.'; return }
    const body = { type, ticker: stock.ticker, operator, threshold }
    if (type === 'fundamental') body.metric = m.querySelector('#alert-metric').value
    const btn = m.querySelector('#alert-save')
    btn.disabled = true; btn.textContent = 'Creating…'
    try {
      const res = await alerts.create(body)
      if (res?.error) throw new Error(res.error)
      trackEvent('alert_created', { ticker: stock.ticker, alert_type: type })
      close()
      showActionToast(`<strong>Alert set</strong> — ${stock.ticker} ${operator === 'below' ? 'below' : 'above'} ${threshold}. We'll email you.`, [
        { label: 'View alerts', onClick: () => navigate('/alerts') },
      ])
    } catch (e) {
      btn.disabled = false; btn.textContent = 'Create alert'
      err.textContent = e?.message || 'Could not create alert.'
    }
  })
}
window.openAlertModal = openAlertModal

async function renderAlertsPage(el) {
  setMeta({ title: 'Price & Screen Alerts — DeltaScreener', description: 'Set price, percent-move, fundamental, and screen alerts. Get emailed when conditions are met.', noindex: !auth.signedIn() })
  if (!auth.signedIn()) {
    el.innerHTML = `
      <div class="container" style="padding:48px 16px;max-width:680px">
        <div class="card" style="padding:40px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">🔔</div>
          <h1 style="font-size:24px;font-weight:800;margin:0 0 8px">Stock Alerts</h1>
          <p style="color:#6b7280;margin:0 0 20px;line-height:1.6">Sign in to set price, % move, fundamental, and screen alerts. We'll email you the moment a condition is met — free for signed-in users.</p>
          <button class="btn btn-primary" onclick="navigate('/profile')">Sign in to continue</button>
        </div>
      </div>`
    return
  }
  el.innerHTML = `<div class="container" style="padding:32px 16px;max-width:820px"><div class="card" style="padding:32px"><div class="empty">Loading your alerts…</div></div></div>`
  const data = await alerts.list()
  const list = data.alerts || []
  const events = data.events || []
  const rowHtml = a => `
    <div class="alert-row" data-id="${a.id}">
      <div class="alert-row-main">
        <span class="alert-row-ticker">${a.ticker || (a.type === 'screen' ? 'SCREEN' : '—')}</span>
        <span class="alert-row-desc">${alertDescribe(a)}</span>
      </div>
      <div class="alert-row-meta">
        ${a.last_triggered_at ? `<span class="alert-row-fired">Last fired ${fmt.date(a.last_triggered_at)}</span>` : `<span class="alert-row-active">Active</span>`}
        <button class="alert-row-del" data-del="${a.id}" aria-label="Delete">Delete</button>
      </div>
    </div>`
  const eventHtml = e => `
    <div class="alert-event-row">
      <span class="alert-event-tk">${e.ticker || '—'}</span>
      <span class="alert-event-msg">${e.message || ''}</span>
      <span class="alert-event-dt">${fmt.date(e.created_at)}</span>
    </div>`
  el.innerHTML = `
    <div class="container" style="padding:32px 16px;max-width:820px">
      <div class="card" style="margin-bottom:20px">
        <div class="card-hdr"><h2>Your Alerts</h2><span style="font-size:12px;color:#6b7280">${list.length} alert${list.length === 1 ? '' : 's'} · checked every 5 min · emailed when triggered</span></div>
        <div style="padding:8px 0">
          ${list.length ? list.map(rowHtml).join('') : '<div class="empty" style="padding:28px">No alerts yet. Open any stock and click <strong>Set Alert</strong>, or use the button below.</div>'}
        </div>
        <div style="padding:14px 18px;border-top:1px solid #eef0f3">
          <button class="btn btn-outline" onclick="navigate('/screener')">Find a stock to alert on →</button>
        </div>
      </div>
      ${events.length ? `<div class="card">
        <div class="card-hdr"><h2>Recent triggers</h2><span style="font-size:12px;color:#6b7280">Last ${events.length}</span></div>
        <div style="padding:8px 0">${events.map(eventHtml).join('')}</div>
      </div>` : ''}
    </div>`
  el.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del')
      btn.disabled = true; btn.textContent = 'Deleting…'
      try { await alerts.remove(Number(id)); el.querySelector(`.alert-row[data-id="${id}"]`)?.remove() }
      catch { btn.disabled = false; btn.textContent = 'Delete' }
    })
  })
}
route('/alerts', renderAlertsPage)

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
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'screen_deleted', { screen_id: id })
    }
    render()
  } catch (e) {
    alert('Could not delete screen: ' + e.message)
  }
}
window.deleteSavedScreen = deleteSavedScreen

// ═══════════════════════════════════════════════════════════════════════
// INIT
// Take over scroll restoration so the page always opens at the top instead of
// the browser restoring a previous mid-page scroll position.
try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual' } catch (e) {}
// Blog routes use light styles — don't apply dark theme on these pages
const _initPath = location.pathname
if (_initPath !== '/blog' && !_initPath.startsWith('/blog/')) {
  theme.apply(theme.get())
}
render().then(() => { window.scrollTo(0, 0); trackPageView() })
validateSession()
  .then(ok => ok ? syncUserData() : null)
  .finally(render)
// ═══════════════════════════════════════════════════════════════════════

// Expose preset queries globally so spa-shell injected script can override them
window.__DS_SAMPLE_QUERIES__ = SAMPLE_QUERIES
