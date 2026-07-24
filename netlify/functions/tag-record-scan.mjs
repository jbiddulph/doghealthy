import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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

/**
 * Record a public tag scan and return safe pet profile fields.
 * Body: { petId?: string, uid?: string, latitude?, longitude?, accuracyM? }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const body = JSON.parse(event.body || '{}')
    const petId = body.petId || null
    const uid = body.uid || null

    if (!petId && !uid) {
      return json(400, { error: 'petId or uid is required' })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    let tagQuery = admin
      .from('doghealthy_tags')
      .select('id, uid, pet_id, status')
      .eq('status', 'active')

    if (uid) tagQuery = tagQuery.eq('uid', uid)
    else tagQuery = tagQuery.eq('pet_id', petId)

    const { data: tag, error: tagError } = await tagQuery.maybeSingle()
    if (tagError) {
      console.error('tag-record-scan tag lookup:', tagError)
      return json(500, { error: 'Failed to look up tag' })
    }
    if (!tag) {
      return json(404, { error: 'No active tag found for this pet' })
    }

    const { data: dog, error: dogError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, breed, gender, color, microchip_number, photo_url, notes, nfc_tag_enabled, is_active')
      .eq('id', tag.pet_id)
      .eq('is_active', true)
      .maybeSingle()

    if (dogError) {
      console.error('tag-record-scan dog lookup:', dogError)
      return json(500, { error: 'Failed to load pet profile' })
    }
    if (!dog || !dog.nfc_tag_enabled) {
      return json(404, { error: 'Pet profile is not publicly available' })
    }

    const headers = event.headers || {}
    const userAgent = headers['user-agent'] || headers['User-Agent'] || null
    const ip = getClientIp(event)

    const latitude =
      typeof body.latitude === 'number' && Number.isFinite(body.latitude)
        ? body.latitude
        : null
    const longitude =
      typeof body.longitude === 'number' && Number.isFinite(body.longitude)
        ? body.longitude
        : null
    const accuracyM =
      typeof body.accuracyM === 'number' && Number.isFinite(body.accuracyM)
        ? body.accuracyM
        : null

    const { data: scan, error: scanError } = await admin
      .from('doghealthy_scans')
      .insert({
        tag_id: tag.id,
        ip,
        latitude,
        longitude,
        accuracy_m: accuracyM,
        user_agent: userAgent,
        device: parseDevice(userAgent)
      })
      .select('id, scanned_at')
      .single()

    if (scanError) {
      console.error('tag-record-scan insert:', scanError)
      return json(500, { error: 'Failed to record scan' })
    }

    return json(200, {
      scanId: scan.id,
      scannedAt: scan.scanned_at,
      tag: { id: tag.id, uid: tag.uid },
      dog: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        gender: dog.gender,
        color: dog.color,
        microchip_number: dog.microchip_number,
        photo_url: dog.photo_url,
        notes: dog.notes
      }
    })
  } catch (error) {
    console.error('tag-record-scan error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
