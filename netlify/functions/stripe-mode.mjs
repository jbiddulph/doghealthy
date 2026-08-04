/**
 * GET /.netlify/functions/stripe-mode
 * Returns whether the server STRIPE_SECRET_KEY is test or live (no secrets exposed).
 * Use this to verify Netlify env after changing keys.
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    }
  }
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  const secret = String(process.env.STRIPE_SECRET_KEY || '').trim()
  const forcedMode = String(process.env.STRIPE_MODE || '').trim().toLowerCase() || null
  let mode = 'missing'
  if (secret.includes('REPLACE_ME')) mode = 'placeholder'
  else if (secret.startsWith('sk_test_')) mode = 'test'
  else if (secret.startsWith('sk_live_')) mode = 'live'
  else if (secret) mode = 'unknown'

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify({
      mode,
      stripeModeEnv: forcedMode,
      okForTestCards: mode === 'test',
      hint:
        mode === 'test'
          ? 'Server is in TEST mode — use card 4242 4242 4242 4242.'
          : mode === 'live'
            ? 'Server still has sk_live_… — update STRIPE_SECRET_KEY to sk_test_… in Netlify and redeploy.'
            : 'Set STRIPE_SECRET_KEY to sk_test_… in Netlify Environment variables, then redeploy.'
    })
  }
}
