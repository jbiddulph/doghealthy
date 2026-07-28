/**
 * UK mobile format for DogHealthy / Twilio SMS:
 * +44 followed by exactly 10 digits (no leading 0 after the country code).
 * Example: 07935085736 → +447935085736
 */

export const UK_MOBILE_E164_REGEX = /^\+44\d{10}$/

export function normalizeUkMobile(raw: string | null | undefined): string | null {
  if (!raw) return null

  let phone = String(raw).trim().replace(/[\s()-]/g, '')

  if (phone.startsWith('00')) {
    phone = `+${phone.slice(2)}`
  }

  // 7XXXXXXXXX (10 digits, missing leading 0) → +447XXXXXXXXX
  if (/^7\d{9}$/.test(phone)) {
    phone = `+44${phone}`
  }

  if (phone.startsWith('0') && phone.length === 11) {
    // 07XXXXXXXXX → +447XXXXXXXXX
    phone = `+44${phone.slice(1)}`
  }

  if (phone.startsWith('44') && !phone.startsWith('+')) {
    phone = `+${phone}`
  }

  // If user typed +4407... strip the extra 0 after country code
  if (phone.startsWith('+440') && phone.length === 14) {
    phone = `+44${phone.slice(4)}`
  }

  if (!UK_MOBILE_E164_REGEX.test(phone)) {
    return null
  }

  return phone
}

export function isValidUkMobile(raw: string | null | undefined): boolean {
  return normalizeUkMobile(raw) !== null
}

export function ukMobileHint(raw: string): string {
  const normalized = normalizeUkMobile(raw)
  if (normalized) return normalized
  return 'Use a UK mobile like 07XXX XXXXXX — saved as +44XXXXXXXXXX'
}
