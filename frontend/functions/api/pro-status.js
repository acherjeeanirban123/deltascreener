// Pro status check — called by frontend to check if email is Pro
// GET /api/pro-status?email=user@example.com

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS })
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()

  if (!email) {
    return new Response(JSON.stringify({ pro: false }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const row = await env.DB.prepare(
      `SELECT status FROM pro_users WHERE email=? LIMIT 1`
    ).bind(email).first()

    const isPro = row?.status === 'active'
    return new Response(JSON.stringify({ pro: isPro, status: row?.status || null }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ pro: false, error: e.message }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
}
