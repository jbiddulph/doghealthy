import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'node:crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
})

const makeUid = () => randomBytes(8).toString('hex')

/**
 * Ensure an active doghealthy_tags row for a pet owned by the caller.
 * Body: { petId: string, manufacturerId?: string }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const authHeader = event.headers.authorization || event.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return json(401, { error: 'Missing auth token' })
    }
    const accessToken = authHeader.slice(7)

    const body = JSON.parse(event.body || '{}')
    const petId = body.petId
    const manufacturerId = body.manufacturerId || null

    if (!petId) {
      return json(400, { error: 'petId is required' })
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError || !userData?.user) {
      return json(401, { error: 'Invalid or expired session' })
    }
    const user = userData.user

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: dog, error: dogError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, user_id, is_active')
      .eq('id', petId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (dogError) {
      console.error('tag-ensure dog lookup:', dogError)
      return json(500, { error: 'Failed to look up dog' })
    }
    if (!dog) {
      return json(404, { error: 'Dog not found on your account' })
    }

    const { data: existing, error: existingError } = await admin
      .from('doghealthy_tags')
      .select('id, uid, pet_id, status, manufacturer_id, activated_at')
      .eq('pet_id', petId)
      .eq('status', 'active')
      .maybeSingle()

    if (existingError) {
      console.error('tag-ensure existing tag:', existingError)
      return json(500, { error: 'Failed to look up tag' })
    }

    // Creating a new tag requires an active Stripe subscription
    if (!existing) {
      const { data: profile } = await admin
        .from('doghealthy_users')
        .select('subscription_status, subscription_current_period_end')
        .eq('id', user.id)
        .maybeSingle()

      const status = String(profile?.subscription_status || '').toLowerCase()
      const periodEnd = profile?.subscription_current_period_end
        ? new Date(profile.subscription_current_period_end)
        : null
      const periodOk = !periodEnd || periodEnd.getTime() > Date.now() - 24 * 60 * 60 * 1000
      const subscribed = (status === 'active' || status === 'trialing') && periodOk

      if (!subscribed) {
        return json(402, {
          error: 'A DogHealthy subscription is required to create NFC / QR tags.',
          code: 'subscription_required'
        })
      }
    }

    let tag = existing
    if (!tag) {
      const now = new Date().toISOString()
      const { data: created, error: createError } = await admin
        .from('doghealthy_tags')
        .insert({
          uid: makeUid(),
          pet_id: petId,
          status: 'active',
          manufacturer_id: manufacturerId,
          activated_at: now
        })
        .select('id, uid, pet_id, status, manufacturer_id, activated_at')
        .single()

      if (createError) {
        console.error('tag-ensure create:', createError)
        return json(500, { error: 'Failed to create tag' })
      }
      tag = created
    }

    await admin
      .from('doghealthy_dogs')
      .update({
        nfc_tag_enabled: true,
        nfc_ordered_at: tag.activated_at || new Date().toISOString()
      })
      .eq('id', petId)
      .eq('user_id', user.id)

    const tagUrl = `${PUBLIC_BASE_URL}/dogs/${petId}`

    return json(200, {
      tag: {
        id: tag.id,
        uid: tag.uid,
        petId: tag.pet_id,
        status: tag.status,
        manufacturerId: tag.manufacturer_id,
        activatedAt: tag.activated_at
      },
      tagUrl,
      petId,
      petName: dog.name
    })
  } catch (error) {
    console.error('tag-ensure error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
