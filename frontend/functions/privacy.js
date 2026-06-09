import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Privacy Policy — DeltaScreener'
  const description = "DeltaScreener's privacy policy: what data we collect, how it's used, and your rights. We do not sell personal data."
  const canonicalUrl = `${SITE_ORIGIN}/privacy`

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#0f766e;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Privacy</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Privacy Policy</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Information we collect</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener does not require account registration and does not collect personally identifiable information unless you voluntarily provide it. We use <strong>Google Analytics 4 (GA4)</strong> to collect anonymized usage data including pages visited and session duration. GA4 data is subject to Google's privacy policy.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Cookies</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">We use:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:24px;margin:0 0 16px">
        <li style="margin-bottom:8px"><strong>Analytics cookies</strong> — Google Analytics for anonymized session data. Opt out via <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style="color:#0f766e">Google's opt-out tool</a>.</li>
        <li style="margin-bottom:8px"><strong>Functional storage</strong> — first-party localStorage to remember your theme preference and screener state. These do not track you across sites.</li>
      </ul>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We do not use advertising cookies or sell cookie data to third parties.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Third-party services</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">We use: Google Analytics, Cloudflare (hosting/CDN), and Financial Modeling Prep (stock data). Each has its own privacy policy.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">For privacy questions: <a href="mailto:hello@deltascreener.com" style="color:#0f766e;font-weight:600">hello@deltascreener.com</a></p>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'DeltaScreener privacy policy, data collection, cookies',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
