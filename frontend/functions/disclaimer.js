import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Disclaimer — DeltaScreener'
  const description = 'DeltaScreener is a stock data and screening tool, not a financial advisor. All information is for educational purposes only. Read our full disclaimer before making investment decisions.'
  const canonicalUrl = `${SITE_ORIGIN}/disclaimer`

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Disclaimer</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 8px;color:#111827">Disclaimer</h1>
      <p style="font-size:13px;color:#9ca3af;margin:0 0 36px">Last updated: June 2026</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Not investment advice</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener is a financial data and stock screening tool. All content — including stock data, metrics, screener results, and blog articles — is provided for <strong>educational and informational purposes only</strong>. Nothing on DeltaScreener constitutes investment advice, a solicitation to buy or sell any security, or a recommendation of any investment strategy.</p>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">We are not registered investment advisors, broker-dealers, or financial planners. Before making any investment decision, consult a qualified financial professional and conduct your own independent research.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Data accuracy</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">Stock data is sourced from third-party providers, primarily Financial Modeling Prep (FMP). We do not guarantee the accuracy, completeness, or timeliness of any data displayed. Data may be delayed, contain errors, or differ from official company filings. Always verify against official SEC filings or your brokerage platform before making financial decisions.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">No liability</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 16px">DeltaScreener and its operators shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or reliance on any information on this website. Use of DeltaScreener is at your own risk.</p>
      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:32px 0 10px">Past performance</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Past financial performance of any stock or strategy shown does not guarantee future results. Investing involves risk, including possible loss of principal.</p>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'DeltaScreener disclaimer, investment disclaimer, stock data disclaimer',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
