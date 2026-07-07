// DeltaScreener — Daily Reddit Post Agent
// Runs every day at 4:00 AM UTC (9:30 AM IST)
// Sends a ready-to-post Reddit post + image to acherjeeanirban@gmail.com

const SCREENER_API = 'https://api.deltascreener.com'
const SITE_URL = 'https://deltascreener.com'
const TO_EMAIL = 'acherjeeanirban@gmail.com'
const FROM_EMAIL = 'agent@deltascreener.com'

// ─── Daily themes — rotates through 7 post types ─────────────────────────────
const THEMES = [
  {
    name: 'High ROE Compounders',
    subreddits: ['r/stocks', 'r/investing', 'r/SecurityAnalysis'],
    conditions: [
      { metric: 'ROE', op: '>', value: '20' },
      { metric: 'Debt to Equity', op: '<', value: '0.5' },
      { metric: 'Net Margin', op: '>', value: '15' },
      { metric: 'Market Cap', op: '>', value: '5000' },
    ],
    title: (stocks) => `I screened 5,000+ US stocks for high ROE + low debt. Here are the ${stocks.length} that passed.`,
    body: (stocks, url) => `
I ran a 3-filter screen on DeltaScreener across all 5,000+ US listed stocks:

- **ROE > 20%** (capital efficiency)
- **Debt/Equity < 0.5** (low leverage)
- **Net Margin > 15%** (real profitability)

**${stocks.length} stocks passed.** Top results:

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — ROE: ${s.roe != null ? s.roe.toFixed(1) + '%' : '—'} | D/E: ${s.debtEquity != null ? s.debtEquity.toFixed(2) : '—'} | Net Margin: ${s.netMargin != null ? s.netMargin.toFixed(1) + '%' : '—'}`).join('\n')}

You can run this exact screen yourself (free, no sign-up):
${url}

What stocks on this list do you own? Anything missing that should be here?
    `.trim(),
  },
  {
    name: 'Undervalued Dividend Stocks',
    subreddits: ['r/dividends', 'r/stocks', 'r/ValueInvesting'],
    conditions: [
      { metric: 'Dividend Yield', op: '>', value: '2' },
      { metric: 'P/E Ratio', op: '<', value: '18' },
      { metric: 'Payout Ratio', op: '<', value: '60' },
      { metric: 'Market Cap', op: '>', value: '2000' },
    ],
    title: (stocks) => `Dividend stocks with P/E under 18 and yield over 2% — ${stocks.length} names right now`,
    body: (stocks, url) => `
Screened for dividend stocks that aren't overpriced. Filters:

- **Dividend Yield > 2%**
- **P/E < 18** (not overvalued)
- **Payout Ratio < 60%** (sustainable dividend)
- **Market Cap > $2B**

**${stocks.length} stocks passed.** Top picks:

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — Yield: ${s.dividendYield != null ? s.dividendYield.toFixed(2) + '%' : '—'} | P/E: ${s.pe != null ? s.pe.toFixed(1) : '—'} | Payout: ${s.payoutRatio != null ? s.payoutRatio.toFixed(0) + '%' : '—'}`).join('\n')}

Full list + data: ${url}

Anyone holding any of these? Which would you add to a dividend portfolio?
    `.trim(),
  },
  {
    name: 'High Growth Low PEG',
    subreddits: ['r/stocks', 'r/investing', 'r/SecurityAnalysis'],
    conditions: [
      { metric: 'PEG Ratio', op: '>', value: '0' },
      { metric: 'PEG Ratio', op: '<', value: '1' },
      { metric: 'Sales growth 3Years', op: '>', value: '15' },
      { metric: 'Market Cap', op: '>', value: '1000' },
    ],
    title: (stocks) => `PEG ratio under 1.0 with 15%+ revenue growth — ${stocks.length} stocks the market may be underpricing`,
    body: (stocks, url) => `
PEG ratio under 1 means you're paying less than 1x for each unit of growth. Combined with strong revenue growth, it's one of the cleanest signals for undervalued growth.

Filters used:
- **PEG Ratio 0–1.0**
- **3-Year Revenue Growth > 15%**
- **Market Cap > $1B**

**${stocks.length} results:**

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — PEG: ${s.pegRatio != null ? s.pegRatio.toFixed(2) : '—'} | 3Y Rev Growth: ${s.salesGrowth3y != null ? '+' + s.salesGrowth3y.toFixed(1) + '%' : '—'}`).join('\n')}

Run it yourself on DeltaScreener (free): ${url}

Do any of these look attractive to you right now?
    `.trim(),
  },
  {
    name: 'Quality Moat Stocks',
    subreddits: ['r/ValueInvesting', 'r/stocks', 'r/investing'],
    conditions: [
      { metric: 'ROCE', op: '>', value: '20' },
      { metric: 'Gross Margin', op: '>', value: '40' },
      { metric: 'Profit growth 5Years', op: '>', value: '10' },
      { metric: 'Market Cap', op: '>', value: '5000' },
    ],
    title: (stocks) => `Screened for "moat" stocks: ROCE > 20%, Gross Margin > 40%, 5-year profit growth > 10%. ${stocks.length} passed.`,
    body: (stocks, url) => `
Trying to find businesses with genuine competitive advantages. Used 3 filters:

- **ROCE > 20%** (high returns on capital = moat signal)
- **Gross Margin > 40%** (pricing power)
- **5-Year Profit Growth > 10%** (sustainable earnings)

**${stocks.length} stocks made the cut:**

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — ROCE: ${s.roce != null ? s.roce.toFixed(1) + '%' : '—'} | Gross Margin: ${s.grossMargin != null ? s.grossMargin.toFixed(1) + '%' : '—'} | 5Y Profit CAGR: ${s.profitGrowth5y != null ? s.profitGrowth5y.toFixed(1) + '%' : '—'}`).join('\n')}

Full screener: ${url}

Which of these do you think has the strongest moat?
    `.trim(),
  },
  {
    name: 'Small Cap Hidden Gems',
    subreddits: ['r/smallstreetbets', 'r/stocks', 'r/investing'],
    conditions: [
      { metric: 'Market Cap', op: '>', value: '300' },
      { metric: 'Market Cap', op: '<', value: '2000' },
      { metric: 'ROE', op: '>', value: '15' },
      { metric: 'Debt to Equity', op: '<', value: '1' },
    ],
    title: (stocks) => `Small-cap stocks ($300M–$2B) with ROE > 15% and low debt — ${stocks.length} names flying under the radar`,
    body: (stocks, url) => `
Small caps get less analyst coverage = more inefficiencies. Screened for quality small caps:

- **Market Cap $300M – $2B**
- **ROE > 15%**
- **Debt/Equity < 1.0**

**${stocks.length} results:**

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — Market Cap: $${s.marketCap != null ? (s.marketCap / 1000).toFixed(1) + 'B' : '—'} | ROE: ${s.roe != null ? s.roe.toFixed(1) + '%' : '—'} | D/E: ${s.debtEquity != null ? s.debtEquity.toFixed(2) : '—'}`).join('\n')}

Screener link (free): ${url}

Any of these on your watchlist? What small caps are you following right now?
    `.trim(),
  },
  {
    name: 'Cash-Rich Stocks',
    subreddits: ['r/stocks', 'r/ValueInvesting', 'r/SecurityAnalysis'],
    conditions: [
      { metric: 'Free Cash Flow', op: '>', value: '500' },
      { metric: 'FCF Margin', op: '>', value: '15' },
      { metric: 'Debt to Equity', op: '<', value: '0.5' },
      { metric: 'Market Cap', op: '>', value: '5000' },
    ],
    title: (stocks) => `Stocks generating massive free cash flow with FCF margin > 15% and almost no debt — ${stocks.length} names`,
    body: (stocks, url) => `
Free cash flow is the most honest profitability metric — it's hard to fake. Screened for:

- **FCF > $500M**
- **FCF Margin > 15%**
- **Debt/Equity < 0.5**
- **Market Cap > $5B**

**${stocks.length} cash machines:**

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — FCF: $${s.freeCashFlow != null ? (s.freeCashFlow / 1000).toFixed(1) + 'B' : '—'} | FCF Margin: ${s.fcfMargin != null ? s.fcfMargin.toFixed(1) + '%' : '—'}`).join('\n')}

Run the full screen: ${url}

Which of these would you buy at current prices?
    `.trim(),
  },
  {
    name: 'Momentum + Fundamentals',
    subreddits: ['r/stocks', 'r/investing', 'r/StockMarket'],
    conditions: [
      { metric: 'Change %', op: '>', value: '5' },
      { metric: 'ROE', op: '>', value: '15' },
      { metric: 'Net Margin', op: '>', value: '10' },
      { metric: 'Market Cap', op: '>', value: '2000' },
    ],
    title: (stocks) => `Stocks up 5%+ this week that also have strong fundamentals (ROE > 15%, Net Margin > 10%) — ${stocks.length} names`,
    body: (stocks, url) => `
Price momentum alone is risky. Momentum backed by strong fundamentals is different. Screened for:

- **Recent price change > 5%**
- **ROE > 15%**
- **Net Margin > 10%**
- **Market Cap > $2B**

**${stocks.length} results — momentum with substance:**

${stocks.slice(0, 8).map((s, i) => `${i + 1}. **${s.ticker}** — Change: ${s.change != null ? (s.change > 0 ? '+' : '') + s.change.toFixed(1) + '%' : '—'} | ROE: ${s.roe != null ? s.roe.toFixed(1) + '%' : '—'} | Net Margin: ${s.netMargin != null ? s.netMargin.toFixed(1) + '%' : '—'}`).join('\n')}

Full screen: ${url}

Are any of these on your radar? What's driving the moves?
    `.trim(),
  },
]

// ─── SVG image generator ─────────────────────────────────────────────────────
function generateSVG(theme, stocks) {
  const topStocks = stocks.slice(0, 8)
  const barWidth = 420
  const rowH = 44
  const headerH = 70
  const footerH = 48
  const totalH = headerH + topStocks.length * rowH + footerH + 20
  const totalW = 680

  // Pick a metric to visualize based on theme
  const metricMap = {
    'High ROE Compounders': { key: 'roe', label: 'ROE %', color: '#2dd4bf' },
    'Undervalued Dividend Stocks': { key: 'dividendYield', label: 'Div Yield %', color: '#818cf8' },
    'High Growth Low PEG': { key: 'salesGrowth3y', label: '3Y Revenue Growth %', color: '#34d399' },
    'Quality Moat Stocks': { key: 'roce', label: 'ROCE %', color: '#f59e0b' },
    'Small Cap Hidden Gems': { key: 'roe', label: 'ROE %', color: '#2dd4bf' },
    'Cash-Rich Stocks': { key: 'fcfMargin', label: 'FCF Margin %', color: '#10b981' },
    'Momentum + Fundamentals': { key: 'netMargin', label: 'Net Margin %', color: '#f472b6' },
  }
  const metric = metricMap[theme.name] || { key: 'roe', label: 'ROE %', color: '#2dd4bf' }

  const values = topStocks.map(s => Number(s[metric.key]) || 0)
  const maxVal = Math.max(...values, 1)

  const bars = topStocks.map((s, i) => {
    const val = Number(s[metric.key]) || 0
    const bw = Math.round((val / maxVal) * barWidth)
    const y = headerH + i * rowH
    const textColor = '#f3f4f6'
    return `
      <rect x="140" y="${y + 8}" width="${bw}" height="${rowH - 18}" fill="${metric.color}" rx="4" opacity="0.85"/>
      <text x="4" y="${y + rowH / 2 + 5}" font-family="Inter,system-ui,sans-serif" font-size="13" font-weight="700" fill="${textColor}">${s.ticker}</text>
      <text x="${140 + bw + 8}" y="${y + rowH / 2 + 5}" font-family="Inter,system-ui,sans-serif" font-size="12" fill="${metric.color}" font-weight="700">${val > 0 ? val.toFixed(1) + '%' : '—'}</text>
    `
  }).join('')

  const gridLines = [0, 25, 50, 75, 100].map(pct => {
    const x = 140 + Math.round((pct / 100) * barWidth)
    const label = ((pct / 100) * maxVal).toFixed(0)
    return `
      <line x1="${x}" y1="${headerH}" x2="${x}" y2="${headerH + topStocks.length * rowH}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
      <text x="${x}" y="${headerH + topStocks.length * rowH + 18}" font-family="Inter,system-ui,sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">${label}</text>
    `
  }).join('')

  return `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f1829"/>
      <stop offset="100%" stop-color="#0a1018"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${totalW}" height="${totalH}" fill="url(#bg)" rx="16"/>
  <rect width="${totalW}" height="${totalH}" fill="none" stroke="rgba(45,212,191,0.2)" stroke-width="1.5" rx="16"/>

  <!-- Header -->
  <text x="24" y="30" font-family="Inter,system-ui,sans-serif" font-size="11" font-weight="800" fill="#2dd4bf" letter-spacing="2" text-transform="uppercase">DELTASCREENER.COM</text>
  <text x="24" y="56" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="800" fill="#f9fafb">${theme.name} — Top Picks by ${metric.label}</text>

  <!-- Divider -->
  <line x1="24" y1="${headerH - 4}" x2="${totalW - 24}" y2="${headerH - 4}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Grid + bars -->
  ${gridLines}
  ${bars}

  <!-- Divider -->
  <line x1="24" y1="${headerH + topStocks.length * rowH + 26}" x2="${totalW - 24}" y2="${headerH + topStocks.length * rowH + 26}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  <!-- Footer -->
  <text x="24" y="${totalH - 16}" font-family="Inter,system-ui,sans-serif" font-size="12" fill="#6b7280">Free stock screener · deltascreener.com/screener · No sign-up required</text>
</svg>`
}

// ─── Build share URL ──────────────────────────────────────────────────────────
function buildScreenerUrl(conditions) {
  const q = conditions.map(c => `${c.metric} ${c.op} ${c.value}`).join(' AND ')
  return `${SITE_URL}/screener?q=${encodeURIComponent(q)}`
}

// ─── Send email via MailChannels ──────────────────────────────────────────────
async function sendEmail(subject, htmlBody, svgImage) {
  const svgBase64 = btoa(unescape(encodeURIComponent(svgImage)))

  const payload = {
    personalizations: [{ to: [{ email: TO_EMAIL, name: 'Anirban' }] }],
    from: { email: FROM_EMAIL, name: 'DeltaScreener Agent' },
    subject,
    content: [
      {
        type: 'text/html',
        value: htmlBody,
      },
    ],
    attachments: [
      {
        content: svgBase64,
        filename: 'reddit-post-image.svg',
        type: 'image/svg+xml',
        disposition: 'attachment',
      },
    ],
  }

  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  return res
}

// ─── Build HTML email body ────────────────────────────────────────────────────
function buildEmailHtml({ theme, postTitle, postBody, subreddits, screenerUrl, stockCount, dateStr, svgImage }) {
  const subredditLinks = subreddits.map(s =>
    `<a href="https://reddit.com/${s}" style="color:#2dd4bf;text-decoration:none;font-weight:700">${s}</a>`
  ).join(' · ')

  const redditNewPostUrl = `https://www.reddit.com/r/${subreddits[0].replace('r/', '')}/submit?title=${encodeURIComponent(postTitle)}`

  // Inline SVG in email
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgImage)))}`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:Inter,system-ui,sans-serif;color:#f3f4f6">
  <div style="max-width:640px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
      <div style="background:linear-gradient(135deg,#2dd4bf,#0d9488);border-radius:12px;padding:10px 16px;font-size:13px;font-weight:900;color:#0f1117;letter-spacing:.05em">DELTA</div>
      <div>
        <div style="font-size:18px;font-weight:800;color:#f9fafb">Daily Reddit Post</div>
        <div style="font-size:12px;color:#6b7280">${dateStr} · ${theme.name}</div>
      </div>
    </div>

    <!-- Stats bar -->
    <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
      <div style="background:rgba(45,212,191,.08);border:1px solid rgba(45,212,191,.2);border-radius:10px;padding:10px 16px;flex:1;min-width:120px">
        <div style="font-size:11px;color:#6b7280;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Stocks Found</div>
        <div style="font-size:24px;font-weight:900;color:#2dd4bf">${stockCount}</div>
      </div>
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 16px;flex:1;min-width:120px">
        <div style="font-size:11px;color:#6b7280;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px">Post To</div>
        <div style="font-size:13px;font-weight:700;color:#f3f4f6">${subreddits.join(', ')}</div>
      </div>
    </div>

    <!-- Image -->
    <div style="margin-bottom:24px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
      <img src="${svgDataUrl}" style="width:100%;display:block" alt="Screener chart"/>
      <div style="background:rgba(255,255,255,.04);padding:8px 14px;font-size:11px;color:#6b7280">📎 SVG image also attached — save and upload to Reddit</div>
    </div>

    <!-- Post title -->
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px 24px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#2dd4bf;margin-bottom:10px">📌 POST TITLE</div>
      <div style="font-size:17px;font-weight:700;color:#f9fafb;line-height:1.4">${postTitle}</div>
    </div>

    <!-- Post body -->
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:20px 24px;margin-bottom:20px">
      <div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#2dd4bf;margin-bottom:12px">📝 POST BODY (copy-paste this)</div>
      <pre style="font-family:Inter,system-ui,sans-serif;font-size:14px;color:#e5e7eb;line-height:1.75;white-space:pre-wrap;margin:0">${postBody}</pre>
    </div>

    <!-- CTA buttons -->
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px">
      <a href="${redditNewPostUrl}" target="_blank" style="flex:1;min-width:160px;display:block;text-align:center;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,#ff4500,#cc3700);color:#fff;text-decoration:none;font-weight:800;font-size:14px">Post on ${subreddits[0]} →</a>
      <a href="${screenerUrl}" target="_blank" style="flex:1;min-width:160px;display:block;text-align:center;padding:14px 20px;border-radius:12px;background:rgba(45,212,191,.15);border:1px solid rgba(45,212,191,.3);color:#2dd4bf;text-decoration:none;font-weight:700;font-size:14px">Verify Screen →</a>
    </div>

    <!-- Subreddits to post in -->
    <div style="background:rgba(255,255,255,.03);border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:700;color:#9ca3af;margin-bottom:8px">BEST SUBREDDITS FOR THIS POST</div>
      <div style="font-size:14px">${subredditLinks}</div>
    </div>

    <!-- Tips -->
    <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:20px">
      <div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:8px;letter-spacing:.06em;text-transform:uppercase">Tips for max engagement</div>
      <ul style="font-size:13px;color:#9ca3af;line-height:1.8;padding-left:20px;margin:0">
        <li>Post between <strong style="color:#f3f4f6">9–11 AM or 7–9 PM EST</strong> for highest Reddit activity</li>
        <li>Upload the attached SVG image as the post image (or convert to PNG first)</li>
        <li>Reply to every comment in the first hour — boosts visibility</li>
        <li>Don't post the same content to multiple subreddits on the same day</li>
      </ul>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,.06);text-align:center;font-size:12px;color:#4b5563">
      DeltaScreener Agent · Sent daily at 9:30 AM IST · <a href="${SITE_URL}" style="color:#2dd4bf;text-decoration:none">deltascreener.com</a>
    </div>
  </div>
</body>
</html>`
}

// ─── Main handler ─────────────────────────────────────────────────────────────
async function runAgent() {
  // Pick theme based on day of week (0=Sun … 6=Sat)
  const day = new Date().getDay()
  const theme = THEMES[day % THEMES.length]

  // Fetch screener results
  let stocks = []
  try {
    const res = await fetch(`${SCREENER_API}/screener/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conditions: theme.conditions, page: 1, limit: 20, sort: { col: 'marketCap', dir: 'desc' } }),
    })
    const data = await res.json()
    stocks = data.results || []
  } catch (e) {
    console.error('Screener fetch failed:', e)
    stocks = []
  }

  if (stocks.length === 0) {
    console.log('No stocks found, skipping email')
    return
  }

  const screenerUrl = buildScreenerUrl(theme.conditions)
  const postTitle = theme.title(stocks)
  const postBody = theme.body(stocks, screenerUrl)
  const svgImage = generateSVG(theme, stocks)

  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata'
  })

  const htmlBody = buildEmailHtml({
    theme,
    postTitle,
    postBody,
    subreddits: theme.subreddits,
    screenerUrl,
    stockCount: stocks.length,
    dateStr,
    svgImage,
  })

  const emailSubject = `📊 Reddit Post Ready: "${postTitle.slice(0, 60)}…" [${dateStr}]`

  const res = await sendEmail(emailSubject, htmlBody, svgImage)
  console.log('Email sent:', res.status, await res.text().catch(() => ''))
}

// ─── Cloudflare Worker entry points ──────────────────────────────────────────
export default {
  // Cron trigger (daily at 4 AM UTC)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runAgent())
  },

  // HTTP trigger — hit /trigger to send immediately (for testing)
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/trigger') {
      ctx.waitUntil(runAgent())
      return new Response(JSON.stringify({ ok: true, message: 'Agent triggered — email sending now' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ ok: true, message: 'DeltaScreener Reddit Agent. POST /trigger to run now.' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
