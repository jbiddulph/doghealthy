import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PUBLIC_BASE_URL = (process.env.NUXT_PUBLIC_BASE_URL || 'https://doghealthy.co.uk').replace(/\/$/, '')
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER
const SMS_COOLDOWN_MINUTES = Number(process.env.FOUND_SMS_COOLDOWN_MINUTES || 30)

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

const normalizeUkPhone = (raw) => {
  if (!raw) return null
  let phone = String(raw).replace(/[\s()-]/g, '')
  if (phone.startsWith('00')) phone = `+${phone.slice(2)}`
  if (phone.startsWith('07')) phone = `+44${phone.slice(1)}`
  if (phone.startsWith('44') && !phone.startsWith('+')) phone = `+${phone}`
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) return null
  return phone
}

const mapsLink = (lat, lng) =>
  lat != null && lng != null
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : null

async function sendTwilioSms({ to, body }) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { ok: false, error: 'Twilio is not configured' }
  }

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
  const params = new URLSearchParams({
    To: to,
    From: TWILIO_FROM_NUMBER,
    Body: body
  })

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    return {
      ok: false,
      error: data?.message || data?.error_message || `Twilio error ${response.status}`
    }
  }
  return { ok: true, sid: data.sid }
}

/**
 * Report a found dog: record scan intent=found and SMS the owner (Twilio).
 * Body: { petId, scanId?, latitude?, longitude?, accuracyM?, finderNote? }
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
    if (!petId) return json(400, { error: 'petId is required' })

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: dog, error: dogError } = await admin
      .from('doghealthy_dogs')
      .select('id, name, user_id, nfc_tag_enabled, is_active')
      .eq('id', petId)
      .eq('is_active', true)
      .maybeSingle()

    if (dogError) {
      console.error('tag-report-found dog:', dogError)
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

    const { data: owner } = await admin
      .from('doghealthy_users')
      .select('id, full_name, phone, notify_found_sms')
      .eq('id', dog.user_id)
      .maybeSingle()

    const headers = event.headers || {}
    const userAgent = headers['user-agent'] || headers['User-Agent'] || null
    const ip = getClientIp(event)
    const latitude =
      typeof body.latitude === 'number' && Number.isFinite(body.latitude) ? body.latitude : null
    const longitude =
      typeof body.longitude === 'number' && Number.isFinite(body.longitude) ? body.longitude : null
    const accuracyM =
      typeof body.accuracyM === 'number' && Number.isFinite(body.accuracyM) ? body.accuracyM : null
    const finderNote =
      typeof body.finderNote === 'string' ? body.finderNote.trim().slice(0, 500) : null

    let scanId = body.scanId || null
    if (scanId) {
      await admin
        .from('doghealthy_scans')
        .update({
          intent: 'found',
          finder_note: finderNote,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          accuracy_m: accuracyM ?? undefined
        })
        .eq('id', scanId)
        .eq('tag_id', tag.id)
    } else {
      const { data: scan, error: scanError } = await admin
        .from('doghealthy_scans')
        .insert({
          tag_id: tag.id,
          intent: 'found',
          finder_note: finderNote,
          ip,
          latitude,
          longitude,
          accuracy_m: accuracyM,
          user_agent: userAgent,
          device: parseDevice(userAgent)
        })
        .select('id')
        .single()

      if (scanError) {
        console.error('tag-report-found scan insert:', scanError)
        return json(500, { error: 'Failed to record found report' })
      }
      scanId = scan.id
    }

    await admin
      .from('doghealthy_dogs')
      .update({ found_reported_at: new Date().toISOString() })
      .eq('id', petId)

    // Rate-limit SMS: skip if another found SMS was sent recently for this tag
    const cooldownSince = new Date(Date.now() - SMS_COOLDOWN_MINUTES * 60 * 1000).toISOString()
    const { data: recentSms } = await admin
      .from('doghealthy_scans')
      .select('id, sms_sent_at')
      .eq('tag_id', tag.id)
      .eq('intent', 'found')
      .not('sms_sent_at', 'is', null)
      .gte('sms_sent_at', cooldownSince)
      .neq('id', scanId)
      .limit(1)

    let sms = { sent: false, skipped: false, reason: null, sid: null }

    if (recentSms?.length) {
      sms = {
        sent: false,
        skipped: true,
        reason: `Owner already notified within the last ${SMS_COOLDOWN_MINUTES} minutes`,
        sid: null
      }
    } else if (owner?.notify_found_sms === false) {
      sms = { sent: false, skipped: true, reason: 'Owner has SMS alerts disabled', sid: null }
    } else {
      const to = normalizeUkPhone(owner?.phone)
      if (!to) {
        sms = {
          sent: false,
          skipped: true,
          reason: 'Owner has no valid mobile number on their profile',
          sid: null
        }
        await admin
          .from('doghealthy_scans')
          .update({ sms_error: sms.reason })
          .eq('id', scanId)
      } else {
        const loc = mapsLink(latitude, longitude)
        const message = [
          `DogHealthy: someone reported finding ${dog.name}.`,
          loc ? `Approx location: ${loc}` : 'Location was not shared.',
          `View: ${PUBLIC_BASE_URL}/dogs/${petId}`
        ].join(' ')

        const result = await sendTwilioSms({ to, body: message })
        if (result.ok) {
          sms = { sent: true, skipped: false, reason: null, sid: result.sid }
          await admin
            .from('doghealthy_scans')
            .update({
              sms_sent_at: new Date().toISOString(),
              sms_sid: result.sid,
              sms_error: null
            })
            .eq('id', scanId)
        } else {
          sms = { sent: false, skipped: false, reason: result.error, sid: null }
          await admin
            .from('doghealthy_scans')
            .update({ sms_error: result.error })
            .eq('id', scanId)
        }
      }
    }

    return json(200, {
      success: true,
      scanId,
      sms,
      message:
        'Thank you — the owner has been notified where possible. Please keep the dog safe and contact a local vet if needed.'
    })
  } catch (error) {
    console.error('tag-report-found error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
