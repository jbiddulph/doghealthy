const ACTIVE_STATUSES = new Set(['active', 'trialing'])
const PAID_THROUGH_STATUSES = new Set(['canceled', 'cancelled', 'past_due', 'unpaid'])
const PERIOD_GRACE_MS = 24 * 60 * 60 * 1000

export function isActiveSubscription(status, periodEndIso) {
  const normalised = String(status || '').toLowerCase().trim()
  if (ACTIVE_STATUSES.has(normalised)) return true

  if (!periodEndIso || !PAID_THROUGH_STATUSES.has(normalised)) return false
  const periodEnd = new Date(periodEndIso)
  if (Number.isNaN(periodEnd.getTime())) return false
  return periodEnd.getTime() > Date.now() - PERIOD_GRACE_MS
}

export function stripeSubscriptionPeriodEndUnix(sub) {
  if (!sub || typeof sub !== 'object') return null
  if (Number.isFinite(sub.current_period_end)) return Number(sub.current_period_end)
  const items = Array.isArray(sub.items?.data) ? sub.items.data : []
  const ends = items
    .map((item) => Number(item?.current_period_end))
    .filter((n) => Number.isFinite(n) && n > 0)
  return ends.length ? Math.max(...ends) : null
}
