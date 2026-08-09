/**
 * Insert an in-app notification for every DogHealthy admin.
 */
export async function notifyAdmins(admin, { type, referenceId, title, message }) {
  if (!referenceId || !title) return
  try {
    const { data: admins, error } = await admin
      .from('doghealthy_users')
      .select('id')
      .eq('is_admin', true)

    if (error) {
      console.error('notifyAdmins list:', error)
      return
    }
    if (!admins?.length) return

    const nowIso = new Date().toISOString()
    const rows = admins.map((row) => ({
      user_id: row.id,
      type: String(type || 'nfc_order').slice(0, 50),
      reference_id: referenceId,
      title: String(title).slice(0, 255),
      message: message ? String(message).slice(0, 2000) : null,
      is_read: false,
      sent_at: nowIso
    }))

    const { error: insertError } = await admin.from('doghealthy_notifications').insert(rows)
    if (insertError) console.error('notifyAdmins insert:', insertError)
  } catch (err) {
    console.error('notifyAdmins:', err)
  }
}

export function formatShipLine(order) {
  return [
    order.shipping_name,
    order.shipping_email,
    [order.shipping_line1, order.shipping_city, order.shipping_postcode].filter(Boolean).join(', ')
  ]
    .filter(Boolean)
    .join(' · ')
}
