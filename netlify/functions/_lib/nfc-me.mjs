const NFC_API_BASE = (
  process.env.NFC_ME_BASE_URL ||
  process.env.NFC_ME_API_BASE_URL ||
  'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1'
).replace(/\/$/, '')

export const NFC_ORDERS_URL = `${NFC_API_BASE}/orders/`
export const NFC_API_KEY = process.env.NFC_ME_API_KEY
export const CANONICAL_SELL_SKU = 'NFC-WHITE-25MM'

/** Legacy SKUs still present on older failed order payloads. */
const LEGACY_SKU_ALIASES = {
  'DOG-NFC-TAG': CANONICAL_SELL_SKU,
  'NTAG213-STICKER': CANONICAL_SELL_SKU
}

const DEFAULT_FULFILMENT_SKUS = [CANONICAL_SELL_SKU, 'DOG-NFC-TAG', 'NTAG213-STICKER']

export function nfcMeFulfilmentSkus(preferred) {
  const envSku = String(process.env.NFC_ME_FULFILMENT_SKU || '').trim().toUpperCase()
  const preferredSku = String(preferred || '').trim().toUpperCase()
  const aliasedPreferred = LEGACY_SKU_ALIASES[preferredSku] || preferredSku
  const ordered = [CANONICAL_SELL_SKU, envSku, aliasedPreferred, preferredSku, ...DEFAULT_FULFILMENT_SKUS]
    .map((sku) => LEGACY_SKU_ALIASES[sku] || sku)
    .filter(Boolean)
  const unique = []
  for (const sku of ordered) {
    if (!unique.includes(sku)) unique.push(sku)
  }
  if (!unique.length) unique.push(CANONICAL_SELL_SKU)
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
      if (responseJson && typeof responseJson === 'object' && !responseJson.error && !responseJson.detail && !responseJson.message) {
        last.json = { ...responseJson, error: `NFC API error ${nfcResponse.status}: ${msg}` }
      } else if (!responseJson) {
        last.json = { error: `NFC API error ${nfcResponse.status}` }
      }
      const retryable =
        nfcResponse.status === 400 &&
        /manufacturer offers|unknown (or inactive )?product|invalid sku|minimum order quantity/i.test(msg)
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
