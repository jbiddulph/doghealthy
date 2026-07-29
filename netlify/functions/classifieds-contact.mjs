import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
})

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())

/**
 * Guest contact → seller's doghealthy_messages inbox (no email provider required).
 * Body: { listingId, name, email, phone?, message, website? }
 */
export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return json(204, {})
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json(503, { error: 'Server is not configured' })
    }

    const body = JSON.parse(event.body || '{}')

    if (body.website) {
      return json(200, { ok: true })
    }

    const listingId = body.listingId
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim() || null
    const message = String(body.message || '').trim()

    if (!listingId) return json(400, { error: 'Listing is required' })
    if (!name || name.length < 2) return json(400, { error: 'Please enter your name' })
    if (!isValidEmail(email)) return json(400, { error: 'Please enter a valid email address' })
    if (!message || message.length < 10) {
      return json(400, { error: 'Please write a slightly longer message (at least 10 characters)' })
    }
    if (message.length > 4000) return json(400, { error: 'Message is too long' })

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: listing, error: listingError } = await admin
      .from('doghealthy_listings')
      .select('id, title, user_id, status')
      .eq('id', listingId)
      .eq('status', 'active')
      .maybeSingle()

    if (listingError) {
      console.error('classifieds-contact listing:', listingError)
      return json(500, { error: 'Failed to look up listing' })
    }
    if (!listing) {
      return json(404, { error: 'Listing not found or no longer active' })
    }

    const { error: msgError } = await admin.from('doghealthy_messages').insert({
      listing_id: listing.id,
      sender_id: null,
      recipient_id: listing.user_id,
      content: message,
      guest_name: name,
      guest_email: email,
      guest_phone: phone,
      is_read: false
    })

    if (msgError) {
      console.error('classifieds-contact message insert:', msgError)
      return json(500, { error: 'Failed to send your message. Please try again.' })
    }

    await admin.from('doghealthy_notifications').insert({
      user_id: listing.user_id,
      type: 'message',
      reference_id: listing.id,
      title: `New enquiry: ${listing.title}`,
      message: `${name} (${email})${phone ? ` · ${phone}` : ''}: ${message.slice(0, 280)}`,
      is_read: false
    })

    return json(200, {
      ok: true,
      message:
        'Your message has been sent to the seller’s DogHealthy inbox. They can contact you by email or phone using the details you provided.'
    })
  } catch (error) {
    console.error('classifieds-contact error:', error)
    return json(500, { error: error?.message || 'Unexpected server error' })
  }
}
