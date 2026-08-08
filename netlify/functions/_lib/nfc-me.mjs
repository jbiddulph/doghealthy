const NFC_API_BASE = (
  process.env.NFC_ME_BASE_URL ||
  process.env.NFC_ME_API_BASE_URL ||
  'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1'
).replace(/\/$/, '')

export const NFC_ORDERS_URL = `${NFC_API_BASE}/orders/`
export const NFC_API_KEY = process.env.NFC_ME_API_KEY
export const CANONICAL_SELL_SKU = 'NFC-WHITE-25MM'

/** SKUs NFC Me manufacturers are known to list. Our local sell SKU is not one of them. */
const DEFAULT_FULFILMENT_SKUS = ['NTAG213-STICKER', 'DOG-NFC-TAG']

export function nfcMeFulfilmentSkus(preferred) {
  const envSku = String(process.env.NFC_ME_FULFILMENT_SKU || '').trim().toUpperCase()
  const preferredSku = String(preferred || '').trim().toUpperCase()
  const ordered = [envSku, preferredSku, ...DEFAULT_FULFILMENT_SKUS].filter(Boolean)
  const unique = []
  for (const sku of ordered) {
    if (sku === CANONICAL_SELL_SKU) continue
    if (!unique.includes(sku)) unique.push(sku)
  }
  if (!unique.length) unique.push('NTAG213-STICKER')
  return unique
}

export function withFulfilmentSku(payload, sku) {
  const quantity = Number(payload?.items?.[0]?.quantity) || 1
  return {
    ...payload,
    items: [{ sku, quantity }]
  }
}

export async function submitNfcMeOrder(payload, preferredSku) {
  if (!NFC_API_KEY) {
    return { ok: false, status: 503, json: { error: 'NFC_ME_API_KEY is not configured' }, sku: null }
  }

  const skus = nfcMeFulfilmentSkus(preferredSku || payload?.items?.[0]?.sku)
  let last = { ok: false, status: 502, json: { error: 'No NFC Me SKU attempted' }, sku: null }

  for (const sku of skus) {
    const body = withFulfilmentSku(payload || {}, sku)
    try {
      const nfcResponse = await fetch(NFC_ORDERS_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': NFC_API_KEY,
          Authorization: `Bearer ${NFC_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(body)
      })
      const responseText = await nfcResponse.text()
      let responseJson = null
      try {
        responseJson = responseText ? JSON.parse(responseText) : null
      } catch {
        responseJson = { raw: responseText }
      }

      if (nfcResponse.ok) {
        const remote = responseJson?.order || responseJson
        const remoteOrderId =
          remote?.id || remote?.order_number || responseJson?.id || responseJson?.order_id || null
        return {
          ok: true,
          status: nfcResponse.status,
          json: responseJson,
          sku,
          payload: body,
          nfcMeOrderId: remoteOrderId ? String(remoteOrderId) : null
        }
      }

      last = { ok: false, status: nfcResponse.status, json: responseJson, sku, payload: body }
      const msg = JSON.stringify(responseJson || {})
      const retryable =
        nfcResponse.status === 400 &&
        /manufacturer offers|unknown (or inactive )?product|invalid sku/i.test(msg)
      if (!retryable) break
    } catch (err) {
      last = {
        ok: false,
        status: 502,
        json: { error: err?.message || 'NFC fulfilment failed' },
        sku,
        payload: body
      }
    }
  }

  return last
}
