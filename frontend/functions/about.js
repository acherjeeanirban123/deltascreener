import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'About DeltaScreener — Free US Stock Screener'
  const description = 'DeltaScreener is a free US stock screener for individual investors. Screen 5,000+ NYSE and NASDAQ stocks by P/E, ROE, debt, margins, and more — no sign-up required.'
  const canonicalUrl = `${SITE_ORIGIN}/about`

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#0f766e;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">About</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">About us</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 20px;color:#111827">About DeltaScreener</h1>
      <p style="font-size:17px;line-height:1.8;color:#374151;margin:0 0 20px">DeltaScreener is a free stock screening tool for individual investors in the US market. We believe professional-quality stock data should be accessible to everyone — not locked behind expensive subscriptions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">What we do</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We aggregate fundamental and valuation data for 5,000+ NYSE and NASDAQ-listed stocks and let you filter them using 30+ metrics — P/E ratio, ROE, Net Margin, Debt/Equity, Dividend Yield, Market Cap, and more. Every result links to a full stock detail page with 10 years of financial history. No sign-up required. No paywall.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">Data sources</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Stock data is sourced from Financial Modeling Prep (FMP). Fundamental metrics are refreshed periodically. While we make every effort to display accurate data, always verify figures with official company filings or your broker before making investment decisions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;font-weight:700;color:#111827;margin:36px 0 12px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">For feedback or questions: <a href="mailto:hello@deltascreener.com" style="color:#0f766e;font-weight:600">hello@deltascreener.com</a></p>
      <div style="padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Start screening</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Filter 5,000+ US stocks free — no account needed.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'about DeltaScreener, stock screener tool, free stock analysis, US stock data',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
