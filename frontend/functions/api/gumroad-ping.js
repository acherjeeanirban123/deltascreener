// Gumroad Ping webhook — receives sale/cancellation events
// POST https://deltascreener.com/api/gumroad-ping
// Gumroad sends form-encoded POST with sale details

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function onRequestPost({ request, env }) {
  try {
    const ct = request.headers.get('content-type') || ''
    let data = {}

    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const fd = await request.formData()
      for (const [k, v] of fd.entries()) data[k] = v
    } else {
      data = await request.json().catch(() => ({}))
    }

    const email       = (data.email || data.purchaser_email || '').toLowerCase().trim()
    const productId   = data.product_id || data.product_permalink || ''
    const saleId      = data.sale_id || data.subscription_id || ''
    const refunded    = data.refunded === 'true' || data.refunded === true
    const cancelled   = data.cancelled === 'true' || data.cancelled === true || data.subscription_cancelled === 'true'
    const reactivated = data.subscription_reactivated === 'true'

    if (!email) return new Response('missing email', { status: 400, headers: CORS })

    const db = env.DB

    if (refunded || cancelled) {
      // Mark as cancelled
      await db.prepare(
        `UPDATE pro_users SET status='cancelled', cancelled_at=datetime('now') WHERE email=?`
      ).bind(email).run()
    } else if (reactivated) {
      // Reactivate
      await db.prepare(
        `UPDATE pro_users SET status='active', cancelled_at=NULL WHERE email=?`
      ).bind(email).run()
    } else {
      // New sale or renewal — upsert
      await db.prepare(
        `INSERT INTO pro_users (email, status, product_id, sale_id, created_at)
         VALUES (?, 'active', ?, ?, datetime('now'))
         ON CONFLICT(email) DO UPDATE SET status='active', product_id=excluded.product_id, sale_id=excluded.sale_id, cancelled_at=NULL`
      ).bind(email, productId, saleId).run()
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
}
