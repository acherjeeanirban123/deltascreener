import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Terms of Service — DeltaScreener'
  const description = 'Terms of service for DeltaScreener. By using our free US stock screener, you agree to these terms. Educational use only — not investment advice.'
  const canonicalUrl = `${SITE_ORIGIN}/terms`

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Terms</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Terms of Service</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Acceptance of terms</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">By accessing or using DeltaScreener, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Permitted use</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 8px">DeltaScreener is provided free of charge for personal, non-commercial, educational use. You may not:</p>
      <ul style="font-size:16px;line-height:1.8;color:#374151;padding-left:24px;margin:0 0 16px">
        <li style="margin-bottom:8px">Systematically scrape or extract data in bulk via automated means without written permission</li>
        <li style="margin-bottom:8px">Redistribute or resell data obtained from the site</li>
        <li style="margin-bottom:8px">Interfere with or disrupt the site's infrastructure</li>
      </ul>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">No investment advice</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Nothing on DeltaScreener constitutes investment advice. All data and content is for informational and educational purposes only. See our <a href="/disclaimer" style="color:#2563eb;font-weight:600">Disclaimer</a> for full details.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Limitation of liability</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of, or inability to use, the site or any data it contains.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Contact</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Questions: <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a></p>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'DeltaScreener terms of service, terms and conditions, usage policy',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
