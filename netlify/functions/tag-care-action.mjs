import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const ALLOWED_INTENTS = new Set(['check_in', 'check_out', 'walk_start', 'walk_end'])

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

const getClientIp = (event) => {
  const headers = event.headers || {}
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return headers['client-ip'] || headers['x-nf-client-connection-ip'] || null
}

const parseDevice = (ua) => {
  if (!ua) return null
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua)
  return {
    isMobile: mobile,
    platform: /iPhone|iPad|iOS/i.test(ua)
      ? 'ios'
      : /Android/i.test(ua)
        ? 'android'
        : /Windows/i.test(ua)
          ? 'windows'
          : /Mac/i.test(ua)
            ? 'mac'
            : 'other'
  }
}

const labels = {
  check_in: 'Checked in',
  check_out: 'Checked out',
  walk_start: 'Walk started',
  walk_end: 'Walk ended'
}

/**
 * Record a care action (no SMS).
 * Body: { petId, intent: 'check_in'|'check_out'|'walk_start'|'walk_end', latitude?, longitude?, accuracyM? }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const body = JSON.parse(event.body || '{}')
    const petId = body.petId
    const intent = body.intent

    if (!petId) return json(400, { error: 'petId is required' })
    if (!ALLOWED_INTENTS.has(intent)) {
      return json(400, { error: 'intent must be check_in, check_out, walk_start, or walk_end' })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: dog, error: dogError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, nfc_tag_enabled, is_active')
      .eq('id', petId)
      .eq('is_active', true)
      .maybeSingle()

    if (dogError) {
      console.error('tag-care-action dog:', dogError)
      return json(500, { error: 'Failed to load pet' })
    }
    if (!dog || !dog.nfc_tag_enabled) {
      return json(404, { error: 'Pet profile is not publicly available' })
    }

    const { data: tag, error: tagError } = await admin
      .from('doghealthy_tags')
      .select('id, uid')
      .eq('pet_id', petId)
      .eq('status', 'active')
      .maybeSingle()

    if (tagError || !tag) {
      return json(404, { error: 'No active tag for this pet' })
    }

    // Walk toggle guard: can't start if already on walk / can't end if not
    const { data: recentWalks } = await admin
      .from('doghealthy_scans')
      .select('intent, scanned_at')
      .eq('tag_id', tag.id)
      .in('intent', ['walk_start', 'walk_end', 'walk'])
      .order('scanned_at', { ascending: false })
      .limit(1)

    const lastWalk = recentWalks?.[0]?.intent
    const onWalk = lastWalk === 'walk_start' || lastWalk === 'walk'

    if (intent === 'walk_start' && onWalk) {
      return json(400, { error: 'A walk is already in progress. End the walk first.', onWalk: true })
    }
    if (intent === 'walk_end' && !onWalk) {
      return json(400, { error: 'No walk is in progress.', onWalk: false })
    }

    const headers = event.headers || {}
    const userAgent = headers['user-agent'] || headers['User-Agent'] || null
    const latitude =
      typeof body.latitude === 'number' && Number.isFinite(body.latitude) ? body.latitude : null
    const longitude =
      typeof body.longitude === 'number' && Number.isFinite(body.longitude) ? body.longitude : null
    const accuracyM =
      typeof body.accuracyM === 'number' && Number.isFinite(body.accuracyM) ? body.accuracyM : null

    const { data: scan, error: scanError } = await admin
      .from('doghealthy_scans')
      .insert({
        tag_id: tag.id,
        intent,
        ip: getClientIp(event),
        latitude,
        longitude,
        accuracy_m: accuracyM,
        user_agent: userAgent,
        device: parseDevice(userAgent)
      })
      .select('id, scanned_at, intent')
      .single()

    if (scanError) {
      console.error('tag-care-action insert:', scanError)
      return json(500, { error: 'Failed to record action' })
    }

    const nowOnWalk =
      intent === 'walk_start' || intent === 'walk'
        ? true
        : intent === 'walk_end'
          ? false
          : onWalk

    return json(200, {
      success: true,
      scanId: scan.id,
      intent: scan.intent,
      scannedAt: scan.scanned_at,
      onWalk: nowOnWalk,
      message: `${labels[intent]} for ${dog.name}.`
    })
  } catch (error) {
    console.error('tag-care-action error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
