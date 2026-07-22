import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEFAULT_SKU = (process.env.NFC_ME_PRODUCT_SKU || 'DOG-NFC-TAG').toUpperCase()

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  },
  body: JSON.stringify(body)
})

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {})
  }

  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing auth token' })
    }
    const accessToken = authHeader.slice(7)

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid or expired session' })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data, error } = await admin
      .from('nfcme_products')
      .select('id, sku, name, description, tag_type, form_factor, unit_price_cents, currency, min_order_qty, stock_qty')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('nfc-list-products error:', error)
      return json(500, { error: 'Failed to load NFC products' })
    }

    const products = data || []
    const defaultSku = products.some((p) => p.sku === DEFAULT_SKU)
      ? DEFAULT_SKU
      : products[0]?.sku || DEFAULT_SKU

    return json(200, { products, defaultSku })
  } catch (error) {
    console.error('nfc-list-products error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
