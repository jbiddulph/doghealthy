import { randomBytes } from 'node:crypto'

const NFC_PRODUCT_SKU = (process.env.NFC_ME_PRODUCT_SKU || 'NFC-WHITE-25MM').toUpperCase()

const makeUid = () => randomBytes(8).toString('hex')

export function nextDogNames(existingNames, startIndex, quantity) {
  const taken = new Set((existingNames || []).map((n) => String(n || '').toLowerCase()))
  const names = []
  let n = Math.max(1, startIndex)
  while (names.length < quantity) {
    let candidate = `dog${n}`
    let suffix = 2
    while (taken.has(candidate.toLowerCase())) {
      candidate = `dog${n}_${suffix}`
      suffix += 1
    }
    names.push(candidate)
    taken.add(candidate.toLowerCase())
    n += 1
  }
  return names
}

export async function createPlaceholderDogs(admin, { userId, quantity, nfcCount = 0 }) {
  const { data: existingDogs, error: dogsError } = await admin
    .from('doghealthy_dogs')
    .select('id, name')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (dogsError) throw dogsError

  const existingCount = existingDogs?.length || 0
  const names = nextDogNames(
    (existingDogs || []).map((d) => d.name),
    existingCount + 1,
    quantity
  )
  const nowIso = new Date().toISOString()
  const paidStart = Math.max(0, names.length - Math.max(0, nfcCount))

  const rows = names.map((name, index) => {
    const withNfc = nfcCount > 0 && index >= paidStart
    return {
      user_id: userId,
      name,
      breed: 'Mixed breed',
      gender: 'unknown',
      notes: withNfc
        ? 'Added via extra dog pack with NFC + QR. Please update this profile.'
        : 'Added via Add Multiple Dogs. Please update this profile.',
      is_active: true,
      nfc_tag_enabled: withNfc,
      nfc_ordered_at: withNfc ? nowIso : null
    }
  })

  const { data: created, error: insertError } = await admin
    .from('doghealthy_dogs')
    .insert(rows)
    .select('id, name')

  if (insertError) throw insertError

  const byName = new Map((created || []).map((dog) => [dog.name, dog]))
  const ordered = names.map((name) => byName.get(name)).filter(Boolean)
  const nfcDogs = ordered.slice(paidStart)
  const tagRows = nfcDogs.map((dog) => ({
    uid: makeUid(),
    pet_id: dog.id,
    status: 'active',
    manufacturer_id: NFC_PRODUCT_SKU,
    activated_at: nowIso
  }))
  if (tagRows.length) {
    const { error: tagError } = await admin.from('doghealthy_tags').insert(tagRows)
    if (tagError) throw tagError
  }

  return {
    dogIds: ordered.map((dog) => dog.id),
    names,
    nfcDogs,
    nowIso
  }
}
