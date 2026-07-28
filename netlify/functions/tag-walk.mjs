import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MIN_POINT_DISTANCE_M = Number(process.env.WALK_POINT_MIN_METERS || 10)

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

const distanceMeters = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const normalizeUkPhone = (raw) => {
  if (!raw) return null
  let phone = String(raw).trim().replace(/[\s()-]/g, '')
  if (phone.startsWith('00')) phone = `+${phone.slice(2)}`
  if (phone.startsWith('0') && phone.length === 11) phone = `+44${phone.slice(1)}`
  if (phone.startsWith('44') && !phone.startsWith('+')) phone = `+${phone}`
  if (phone.startsWith('+440') && phone.length === 14) phone = `+44${phone.slice(4)}`
  if (!/^\+44\d{10}$/.test(phone)) return null
  return phone
}

const parseGeo = (body) => {
  const latitude =
    typeof body.latitude === 'number' && Number.isFinite(body.latitude) ? body.latitude : null
  const longitude =
    typeof body.longitude === 'number' && Number.isFinite(body.longitude) ? body.longitude : null
  const accuracyM =
    typeof body.accuracyM === 'number' && Number.isFinite(body.accuracyM) ? body.accuracyM : null
  return { latitude, longitude, accuracyM }
}

/**
 * Walk GPS tracking.
 * Body: {
 *   action: 'start'|'point'|'end',
 *   petId, walkId?, clientToken?,
 *   walkerName?, walkerPhone?,  // required on start
 *   latitude?, longitude?, accuracyM?
 * }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Supabase environment is not configured' })
    }

    const body = JSON.parse(event.body || '{}')
    const action = body.action
    const petId = body.petId

    if (!petId) return json(400, { error: 'petId is required' })
    if (!['start', 'point', 'end'].includes(action)) {
      return json(400, { error: 'action must be start, point, or end' })
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: dog, error: dogError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, nfc_tag_enabled, is_active')
      .eq('id', petId)
      .eq('is_active', true)
      .maybeSingle()

    if (dogError) {
      console.error('tag-walk dog:', dogError)
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

    const headers = event.headers || {}
    const userAgent = headers['user-agent'] || headers['User-Agent'] || null
    const geo = parseGeo(body)

    if (action === 'start') {
      const { data: existing } = await admin
        .from('doghealthy_walks')
        .select('id, client_token, started_at')
        .eq('pet_id', petId)
        .eq('status', 'active')
        .maybeSingle()

      if (existing) {
        return json(400, {
          error: 'A walk is already in progress. End the walk first.',
          onWalk: true,
          walkId: existing.id
        })
      }

      if (geo.latitude == null || geo.longitude == null) {
        return json(400, { error: 'Location permission is required to start a walk' })
      }

      const walkerName =
        typeof body.walkerName === 'string' ? body.walkerName.trim().slice(0, 80) : ''
      const walkerPhone = normalizeUkPhone(
        typeof body.walkerPhone === 'string' ? body.walkerPhone.trim() : ''
      )

      if (!walkerName || walkerName.length < 2) {
        return json(400, { error: 'Please enter the walker’s name' })
      }
      if (!walkerPhone) {
        return json(400, {
          error: 'Please enter a valid UK mobile (07… / +44…). DogHealthy is UK-only.'
        })
      }

      const clientToken = randomBytes(24).toString('hex')

      const { data: scan, error: scanError } = await admin
        .from('doghealthy_scans')
        .insert({
          tag_id: tag.id,
          intent: 'walk_start',
          finder_name: walkerName,
          finder_phone: walkerPhone,
          ip: getClientIp(event),
          latitude: geo.latitude,
          longitude: geo.longitude,
          accuracy_m: geo.accuracyM,
          user_agent: userAgent,
          device: parseDevice(userAgent)
        })
        .select('id')
        .single()

      if (scanError) {
        console.error('tag-walk start scan:', scanError)
        return json(500, { error: 'Failed to start walk' })
      }

      const { data: walk, error: walkError } = await admin
        .from('doghealthy_walks')
        .insert({
          pet_id: petId,
          tag_id: tag.id,
          status: 'active',
          client_token: clientToken,
          walker_name: walkerName,
          walker_phone: walkerPhone,
          start_scan_id: scan.id,
          start_latitude: geo.latitude,
          start_longitude: geo.longitude,
          point_count: 1,
          distance_m: 0
        })
        .select('id, started_at, walker_name, walker_phone')
        .single()

      if (walkError) {
        console.error('tag-walk start walk:', walkError)
        return json(500, { error: 'Failed to create walk session' })
      }

      await admin.from('doghealthy_walk_points').insert({
        walk_id: walk.id,
        sequence: 1,
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy_m: geo.accuracyM
      })

      return json(200, {
        success: true,
        action: 'start',
        walkId: walk.id,
        clientToken,
        onWalk: true,
        pointCount: 1,
        distanceM: 0,
        walkerName: walk.walker_name,
        walkerPhone: walk.walker_phone,
        message: `Walk started for ${dog.name}. Keep this page open to track the route.`
      })
    }

    const walkId = body.walkId
    const clientToken = typeof body.clientToken === 'string' ? body.clientToken.trim() : ''
    if (!walkId || !clientToken) {
      return json(400, { error: 'walkId and clientToken are required' })
    }

    const { data: walk, error: walkLoadError } = await admin
      .from('doghealthy_walks')
      .select('*')
      .eq('id', walkId)
      .eq('pet_id', petId)
      .eq('client_token', clientToken)
      .maybeSingle()

    if (walkLoadError || !walk) {
      return json(404, { error: 'Walk session not found' })
    }

    if (action === 'point') {
      if (walk.status !== 'active') {
        return json(400, { error: 'This walk is no longer active', onWalk: false })
      }
      if (geo.latitude == null || geo.longitude == null) {
        return json(400, { error: 'GPS coordinates are required' })
      }

      const { data: lastPoints } = await admin
        .from('doghealthy_walk_points')
        .select('latitude, longitude, sequence')
        .eq('walk_id', walk.id)
        .order('sequence', { ascending: false })
        .limit(1)

      const last = lastPoints?.[0]
      let distanceDelta = 0
      if (last) {
        distanceDelta = distanceMeters(
          { latitude: Number(last.latitude), longitude: Number(last.longitude) },
          { latitude: geo.latitude, longitude: geo.longitude }
        )
        if (distanceDelta < MIN_POINT_DISTANCE_M) {
          return json(200, {
            success: true,
            action: 'point',
            skipped: true,
            reason: `Moved less than ${MIN_POINT_DISTANCE_M}m`,
            walkId: walk.id,
            onWalk: true,
            pointCount: walk.point_count,
            distanceM: Number(walk.distance_m || 0)
          })
        }
      }

      const nextSeq = (last?.sequence || 0) + 1
      const { error: pointError } = await admin.from('doghealthy_walk_points').insert({
        walk_id: walk.id,
        sequence: nextSeq,
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy_m: geo.accuracyM
      })

      if (pointError) {
        console.error('tag-walk point:', pointError)
        return json(500, { error: 'Failed to save walk point' })
      }

      const newDistance = Number(walk.distance_m || 0) + distanceDelta
      await admin
        .from('doghealthy_walks')
        .update({
          point_count: nextSeq,
          distance_m: newDistance
        })
        .eq('id', walk.id)

      return json(200, {
        success: true,
        action: 'point',
        skipped: false,
        walkId: walk.id,
        onWalk: true,
        pointCount: nextSeq,
        distanceM: Math.round(newDistance)
      })
    }

    // end
    if (walk.status !== 'active') {
      return json(400, { error: 'This walk is already ended', onWalk: false, walkId: walk.id })
    }

    const { data: endScan } = await admin
      .from('doghealthy_scans')
      .insert({
        tag_id: tag.id,
        intent: 'walk_end',
        ip: getClientIp(event),
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy_m: geo.accuracyM,
        user_agent: userAgent,
        device: parseDevice(userAgent)
      })
      .select('id')
      .single()

    if (geo.latitude != null && geo.longitude != null) {
      const { data: lastPoints } = await admin
        .from('doghealthy_walk_points')
        .select('latitude, longitude, sequence')
        .eq('walk_id', walk.id)
        .order('sequence', { ascending: false })
        .limit(1)

      const last = lastPoints?.[0]
      let distanceDelta = 0
      let nextSeq = walk.point_count || 0
      if (last) {
        distanceDelta = distanceMeters(
          { latitude: Number(last.latitude), longitude: Number(last.longitude) },
          { latitude: geo.latitude, longitude: geo.longitude }
        )
        if (distanceDelta >= MIN_POINT_DISTANCE_M || nextSeq === 0) {
          nextSeq += 1
          await admin.from('doghealthy_walk_points').insert({
            walk_id: walk.id,
            sequence: nextSeq,
            latitude: geo.latitude,
            longitude: geo.longitude,
            accuracy_m: geo.accuracyM
          })
        }
      }

      await admin
        .from('doghealthy_walks')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          end_scan_id: endScan?.id || null,
          end_latitude: geo.latitude,
          end_longitude: geo.longitude,
          point_count: nextSeq || walk.point_count,
          distance_m: Number(walk.distance_m || 0) + distanceDelta
        })
        .eq('id', walk.id)
    } else {
      await admin
        .from('doghealthy_walks')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          end_scan_id: endScan?.id || null
        })
        .eq('id', walk.id)
    }

    const { data: points } = await admin
      .from('doghealthy_walk_points')
      .select('id, sequence, recorded_at, latitude, longitude')
      .eq('walk_id', walk.id)
      .order('sequence', { ascending: true })

    const { data: finished } = await admin
      .from('doghealthy_walks')
      .select('id, started_at, ended_at, point_count, distance_m')
      .eq('id', walk.id)
      .single()

    return json(200, {
      success: true,
      action: 'end',
      walkId: walk.id,
      onWalk: false,
      walk: finished,
      points: (points || []).map((p) => ({
        id: p.id,
        sequence: p.sequence,
        recordedAt: p.recorded_at,
        latitude: Number(p.latitude),
        longitude: Number(p.longitude)
      })),
      message: `Walk ended for ${dog.name}.`
    })
  } catch (error) {
    console.error('tag-walk error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
