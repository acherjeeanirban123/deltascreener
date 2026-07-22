import { renderSpaShell, SITE_ORIGIN } from './_lib/spa-shell.js'

const GUMROAD_URL = 'https://acherjeeanirban.gumroad.com/l/acuvpw'

export async function onRequestGet() {
  const title = 'Pricing — DeltaScreener Pro | US Stock Screener'
  const description = 'DeltaScreener is free for all investors. Upgrade to Pro for $5/month to unlock unlimited saved screens & alerts, full Excel export, and 10 years of financial history.'
  const canonicalUrl = `${SITE_ORIGIN}/pricing`

  const bodyHtml = `
  <style>
    body, html { background: #0a0f1a !important; color: #f3f4f6 !important; }
    .pricing-wrap { min-height: 100vh; background: #0a0f1a; font-family: Inter, system-ui, sans-serif; }

    .pricing-hero {
      position: relative;
      overflow: hidden;
      padding: 72px 16px 56px;
      text-align: center;
    }
    .pricing-hero::before {
      content: '';
      position: absolute;
      top: -120px; left: 50%; transform: translateX(-50%);
      width: 700px; height: 400px;
      background: radial-gradient(ellipse, rgba(45,212,191,.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .pricing-hero .eyebrow {
      display: inline-block;
      font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
      color: #2dd4bf; margin-bottom: 14px;
    }
    .pricing-hero h1 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: clamp(32px, 5vw, 52px);
      line-height: 1.08; letter-spacing: -.03em;
      color: #f9fafb; margin: 0 0 16px;
    }
    .pricing-hero p {
      font-size: 17px; color: #9ca3af; line-height: 1.7;
      max-width: 480px; margin: 0 auto 0;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      max-width: 820px;
      margin: 0 auto;
      padding: 0 16px 56px;
    }
    @media (max-width: 600px) { .plans-grid { grid-template-columns: 1fr; } }

    .plan-card {
      border-radius: 24px;
      padding: 36px 32px;
      position: relative;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.03);
    }
    .plan-card.pro {
      background: rgba(45,212,191,.04);
      border: 1px solid rgba(45,212,191,.28);
    }
    .plan-badge {
      position: absolute; top: -11px; left: 32px;
      background: rgba(45,212,191,.12);
      color: #2dd4bf; font-size: 10.5px; font-weight: 700;
      letter-spacing: .12em; text-transform: uppercase;
      padding: 4px 12px; border-radius: 6px;
      border: 1px solid rgba(45,212,191,.3);
      white-space: nowrap;
    }
    .plan-label {
      font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .plan-card:not(.pro) .plan-label { color: #6b7280; }
    .plan-card.pro .plan-label { color: #2dd4bf; }

    .plan-price {
      font-size: 46px; font-weight: 800; line-height: 1; letter-spacing: -.02em;
      color: #f9fafb; margin-bottom: 4px;
    }
    .plan-price span { font-size: 19px; font-weight: 500; color: #6b7280; }
    .plan-cadence { font-size: 13px; color: #6b7280; margin-bottom: 28px; }

    .plan-features {
      list-style: none; padding: 0; margin: 0 0 28px;
      display: flex; flex-direction: column; gap: 13px;
    }
    .plan-features li {
      font-size: 14px; color: #d1d5db;
      display: flex; gap: 10px; align-items: flex-start; line-height: 1.5;
    }
    .plan-features li .check { color: #2dd4bf; font-size: 15px; flex-shrink: 0; margin-top: 1px; }
    .plan-features li .lock { color: #4b5563; font-size: 13px; flex-shrink: 0; margin-top: 2px; }
    .plan-features li.locked { color: #4b5563; }

    .plan-btn {
      display: block; text-align: center;
      padding: 14px 20px; border-radius: 14px;
      font-weight: 800; font-size: 15px; text-decoration: none;
      transition: opacity .15s, transform .1s;
    }
    .plan-btn:hover { opacity: .9; transform: translateY(-1px); }
    .plan-btn.free {
      border: 1.5px solid rgba(255,255,255,.15);
      color: #9ca3af; background: transparent;
    }
    .plan-btn.cta {
      background: linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%);
      color: #0f1117;
      box-shadow: 0 2px 12px rgba(45,212,191,.18);
    }

    .divider {
      max-width: 820px; margin: 0 auto 40px;
      border: none; border-top: 1px solid rgba(255,255,255,.06);
    }

    .trust-bar {
      display: flex; justify-content: center; gap: 32px; flex-wrap: wrap;
      padding: 0 16px 56px; max-width: 820px; margin: 0 auto;
    }
    .trust-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #6b7280;
    }
    .trust-item .icon { font-size: 18px; }

    .compare-section {
      max-width: 820px; margin: 0 auto; padding: 0 16px 56px;
    }
    .compare-section h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 26px; font-weight: 700; color: #f9fafb;
      margin: 0 0 24px; text-align: center;
    }
    .compare-table {
      width: 100%; border-collapse: collapse; font-size: 14px;
    }
    .compare-table th {
      padding: 12px 16px; text-align: left;
      font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
      color: #6b7280; border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .compare-table th:not(:first-child) { text-align: center; }
    .compare-table td {
      padding: 14px 16px; color: #d1d5db;
      border-bottom: 1px solid rgba(255,255,255,.05);
    }
    .compare-table td:not(:first-child) { text-align: center; }
    .compare-table tr:last-child td { border-bottom: none; }
    .compare-table .yes { color: #2dd4bf; font-size: 18px; }
    .compare-table .no { color: #374151; font-size: 18px; }
    .compare-table .col-pro { background: rgba(45,212,191,.04); }

    .faq-section {
      max-width: 820px; margin: 0 auto; padding: 0 16px 56px;
    }
    .faq-section h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 26px; font-weight: 700; color: #f9fafb;
      margin: 0 0 24px; text-align: center;
    }
    .faq-item {
      padding: 20px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .faq-item:last-child { border-bottom: none; }
    .faq-q { font-size: 15px; font-weight: 700; color: #f3f4f6; margin-bottom: 8px; }
    .faq-a { font-size: 14px; color: #9ca3af; line-height: 1.75; }
    .faq-a a { color: #2dd4bf; text-decoration: none; }

    .bottom-cta {
      max-width: 820px; margin: 0 auto; padding: 0 16px 80px; text-align: center;
    }
    .bottom-cta-card {
      border-radius: 24px;
      background: linear-gradient(135deg, #0f2620 0%, #0a1628 100%);
      border: 1px solid rgba(45,212,191,.2);
      padding: 48px 32px;
    }
    .bottom-cta-card h2 {
      font-family: 'IBM Plex Serif', Georgia, serif;
      font-size: 28px; font-weight: 700; color: #f9fafb;
      margin: 0 0 12px; line-height: 1.25;
    }
    .bottom-cta-card p {
      color: #9ca3af; font-size: 15px; line-height: 1.7; margin: 0 0 28px;
    }
    .bottom-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn-primary-cta {
      padding: 14px 28px; border-radius: 14px;
      background: linear-gradient(135deg, #2dd4bf, #0d9488);
      color: #0f1117; font-weight: 800; font-size: 15px;
      text-decoration: none;
      box-shadow: 0 2px 12px rgba(45,212,191,.18);
    }
    .btn-secondary-cta {
      padding: 14px 28px; border-radius: 14px;
      border: 1.5px solid rgba(255,255,255,.15);
      color: #9ca3af; font-size: 15px; font-weight: 600;
      text-decoration: none;
    }
  </style>

  <div class="pricing-wrap">
    <!-- NAV BREADCRUMB -->
    <div style="max-width:820px;margin:0 auto;padding:20px 16px 0">
      <nav style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">
        <a href="/" style="color:#2dd4bf;text-decoration:none">Home</a>
        <span style="color:#374151;margin:0 6px">/</span>
        <span style="color:#6b7280">Pricing</span>
      </nav>
    </div>

    <!-- HERO -->
    <div class="pricing-hero">
      <div class="eyebrow">Pricing</div>
      <h1>Simple, transparent pricing</h1>
      <p>Professional-grade stock screening, free forever. Upgrade to Pro to unlock the full toolkit.</p>
    </div>

    <!-- PLAN CARDS -->
    <div class="plans-grid">
      <!-- FREE -->
      <div class="plan-card">
        <div class="plan-label">Free</div>
        <div class="plan-price">$0</div>
        <div class="plan-cadence">Forever free · No credit card</div>
        <ul class="plan-features">
          <li><span class="check">✓</span> Screen 5,000+ US stocks</li>
          <li><span class="check">✓</span> 30+ fundamental filters</li>
          <li><span class="check">✓</span> Full company pages</li>
          <li><span class="check">✓</span> 5-year financial history</li>
          <li><span class="check">✓</span> No sign-up required</li>
          <li><span class="check">✓</span> 3 saved screens</li>
          <li><span class="check">✓</span> 2 email alerts</li>
          <li class="locked"><span class="lock">—</span> Excel / CSV export</li>
          <li class="locked"><span class="lock">—</span> Years 6–10 of financials</li>
        </ul>
        <a href="/screener" class="plan-btn free">Start Screening Free</a>
      </div>

      <!-- PRO -->
      <div class="plan-card pro">
        <div class="plan-badge">Recommended</div>
        <div class="plan-label">Pro</div>
        <div class="plan-price">$5<span>/mo</span></div>
        <div class="plan-cadence">or <strong>$39/year — save 35%</strong> · Cancel anytime</div>
        <ul class="plan-features">
          <li><span class="check">✓</span> Everything in Free</li>
          <li><span class="check">✓</span> Unlimited saved screens</li>
          <li><span class="check">✓</span> Unlimited email alerts</li>
          <li><span class="check">✓</span> Full Excel export — up to 2,000 stocks</li>
          <li><span class="check">✓</span> 10-year financial history</li>
          <li><span class="check">✓</span> Unlimited watchlists</li>
          <li><span class="check">✓</span> Deep company pages — peers &amp; trends</li>
          <li><span class="check">✓</span> Priority support</li>
          <li><span class="check">✓</span> 30-day money-back guarantee</li>
        </ul>
        <a href="${GUMROAD_URL}?wanted=true" data-gumroad-overlay-checkout="true" class="plan-btn cta">Upgrade to Pro — $5/month</a>
      </div>
    </div>

    <!-- TRUST BAR -->
    <div class="trust-bar">
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="8" rx="1.5" stroke="#6b7280" stroke-width="1.5"/><path d="M7 9V6.5a3 3 0 016 0V9" stroke="#6b7280" stroke-width="1.5"/></svg> Secure checkout via Gumroad</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 016-6c2.5 0 4.6 1.5 5.5 3.6M16 10a6 6 0 01-6 6c-2.5 0-4.6-1.5-5.5-3.6" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/><path d="M15.5 4v3.5H12M4.5 16v-3.5H8" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> 30-day money-back guarantee</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 4l4 2v3c0 2.8-1.7 5.3-4 6-2.3-.7-4-3.2-4-6V6l4-2z" stroke="#6b7280" stroke-width="1.5" stroke-linejoin="round"/></svg> Instant Pro activation</div>
      <div class="trust-item"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="6.25" stroke="#6b7280" stroke-width="1.5"/><path d="M5.5 5.5l9 9" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg> No hidden fees</div>
    </div>

    <hr class="divider" />

    <!-- COMPARISON TABLE -->
    <div class="compare-section">
      <h2>Feature comparison</h2>
      <table class="compare-table">
        <thead>
          <tr>
            <th style="width:50%">Feature</th>
            <th>Free</th>
            <th class="col-pro" style="color:#2dd4bf">Pro</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Stock universe</td><td>5,000+ US stocks</td><td class="col-pro">5,000+ US stocks</td></tr>
          <tr><td>Fundamental filters</td><td>30+</td><td class="col-pro">30+</td></tr>
          <tr><td>Company pages &amp; financials</td><td class="yes">✓</td><td class="col-pro yes">✓</td></tr>
          <tr><td>Financial history</td><td style="color:#6b7280">5 years</td><td class="col-pro yes">✓ 10 years</td></tr>
          <tr><td>No sign-up required</td><td class="yes">✓</td><td class="col-pro yes">✓</td></tr>
          <tr><td>Saved screens</td><td style="color:#6b7280">3 max</td><td class="col-pro yes">✓ Unlimited</td></tr>
          <tr><td>Excel / CSV export</td><td class="no">—</td><td class="col-pro yes">✓ Up to 2,000 rows</td></tr>
          <tr><td>Email alerts</td><td style="color:#6b7280">2 active</td><td class="col-pro yes">✓ Unlimited</td></tr>
          <tr><td>Unlimited watchlists</td><td class="no">—</td><td class="col-pro yes">✓</td></tr>
          <tr><td>Priority support</td><td class="no">—</td><td class="col-pro yes">✓</td></tr>
          <tr><td>Money-back guarantee</td><td class="no">—</td><td class="col-pro yes">✓ 30 days</td></tr>
        </tbody>
      </table>
    </div>

    <hr class="divider" />

    <!-- FAQ -->
    <div class="faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-item">
        <div class="faq-q">Is DeltaScreener really free?</div>
        <div class="faq-a">Yes. The core screener — all 5,000+ US stocks, 30+ filters, company pages, and 10-year financials — is free forever. No account required.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">How does Pro activation work?</div>
        <div class="faq-a">After checkout on Gumroad, Pro is activated instantly. On DeltaScreener, click "Upgrade" in the nav, enter the email you used at checkout, and you're unlocked.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Can I cancel anytime?</div>
        <div class="faq-a">Yes. Cancel anytime from your Gumroad account. No cancellation fees. See our <a href="/refund">refund policy</a> for the 30-day guarantee.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">What payment methods are accepted?</div>
        <div class="faq-a">All major credit and debit cards — Visa, Mastercard, Amex, Discover. PayPal is also accepted at checkout.</div>
      </div>
      <div class="faq-item">
        <div class="faq-q">Is my payment secure?</div>
        <div class="faq-a">Yes. Payments are processed by Gumroad, a trusted platform used by thousands of creators. DeltaScreener never sees your card details.</div>
      </div>
    </div>

    <!-- BOTTOM CTA -->
    <div class="bottom-cta">
      <div class="bottom-cta-card">
        <h2>Ready to screen like a pro?</h2>
        <p>Join investors using DeltaScreener Pro to find their next great stock.<br>30-day money-back guarantee if you're not satisfied.</p>
        <div class="bottom-cta-btns">
          <a href="${GUMROAD_URL}?wanted=true" data-gumroad-overlay-checkout="true" class="btn-primary-cta">Upgrade to Pro — $5/month</a>
          <a href="/screener" class="btn-secondary-cta">Try Free First</a>
        </div>
      </div>
    </div>
  </div>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'DeltaScreener pricing, stock screener pro, stock screener subscription, US stock screener price',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonicalUrl }],
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
