import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'Refund Policy — DeltaScreener'
  const description = 'DeltaScreener refund policy. Cancel your Pro subscription anytime. We offer a 30-day money-back guarantee on all Pro plans.'
  const canonicalUrl = `${SITE_ORIGIN}/refund`

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:56px 16px 80px;font-family:Inter,system-ui,sans-serif;color:#111827">
      <nav style="margin-bottom:24px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2563eb;text-decoration:none">Home</a>
        <span style="color:#9ca3af;margin:0 6px">/</span>
        <span style="color:#374151">Refund Policy</span>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;margin-bottom:10px">Legal</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(32px,5vw,48px);line-height:1.08;letter-spacing:-.04em;margin:0 0 16px;color:#111827">Refund Policy</h1>
      <p style="font-size:14px;color:#9ca3af;margin:0 0 40px">Last updated: June 2026</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">30-Day Money-Back Guarantee</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">If you are not satisfied with DeltaScreener Pro for any reason, contact us within 30 days of your initial purchase and we will issue a full refund — no questions asked.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Cancellation</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">You may cancel your Pro subscription at any time from your account settings. Upon cancellation, your Pro access will continue until the end of your current billing period. We do not charge cancellation fees.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Renewals</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">Pro subscriptions renew automatically each month. You will receive an email reminder before each renewal. To avoid being charged for the next billing period, cancel before your renewal date.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">Exceptions</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 24px">Refunds after 30 days are granted at our sole discretion. We reserve the right to refuse refunds for accounts found to be in violation of our <a href="/terms" style="color:#2563eb">Terms of Service</a>.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:22px;font-weight:700;color:#111827;margin:0 0 12px">How to Request a Refund</h2>
      <p style="font-size:16px;line-height:1.8;color:#374151;margin:0 0 32px">Email us at <a href="mailto:hello@deltascreener.com" style="color:#2563eb;font-weight:600">hello@deltascreener.com</a> with your account email and order details. We will process your refund within 5–10 business days.</p>

      <div style="padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#2563eb;margin-bottom:8px">Questions?</strong>
        <p style="margin:0;color:#374151;line-height:1.7;font-size:14px">Contact us at <a href="mailto:hello@deltascreener.com" style="color:#2563eb">hello@deltascreener.com</a> and we'll get back to you within 1 business day.</p>
      </div>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'DeltaScreener refund policy, cancel subscription, money back guarantee',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  })
}
