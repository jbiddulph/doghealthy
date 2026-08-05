import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export type AdminQrSheetItem = {
  petId: string
  dogName?: string | null
  tagUid?: string | null
}

/** Physical circular sticker diameter. */
const STICKER_MM = 24
/** Gap between stickers for cutting. */
const GAP_MM = 5
const PAGE_MARGIN_MM = 8
/** Keep artwork clear of the circular die-cut edge. */
const EDGE_PAD_MM = 1.1

/**
 * Previous label size was 5px @ 144 PPI ≈ 2.5pt.
 * Double that and use bold for sticker readability.
 */
const BRAND_PT = 5
const NAME_PT = 5
const TAP_PT = 5
const LABEL_GAP_MM = 0.45
const QR_PRINT_PPI = 144

const BRAND_TEXT = 'doghealthy.uk'
const TAP_TEXT = 'TAP or SCAN'

function truncateCentered(doc: jsPDF, text: string, maxWidthMm: number): string {
  const raw = String(text || '').trim()
  if (!raw) return ''
  if (doc.getTextWidth(raw) <= maxWidthMm) return raw
  let out = raw
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > maxWidthMm) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

/** Max horizontal width that still sits inside the circle at a given Y (doc units = mm). */
function chordWidthMm(cy: number, y: number, radius: number, pad: number): number {
  const dy = Math.abs(y - cy)
  if (dy >= radius - pad) return 0
  return Math.max(0, 2 * Math.sqrt(radius * radius - dy * dy) - pad * 2)
}

/**
 * Multi-page A4 PDF of QR stickers sized for 24mm circular die-cuts.
 * Layout (centered in each circle): brand → dog name → QR → TAP or SCAN
 */
export async function buildAdminQrSheetPdf(
  items: AdminQrSheetItem[],
  baseUrl: string
): Promise<Blob> {
  if (!items.length) {
    throw new Error('No QR codes to export')
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const cell = STICKER_MM
  const step = cell + GAP_MM
  const radius = STICKER_MM / 2

  const cols = Math.max(1, Math.floor((pageW - PAGE_MARGIN_MM * 2 + GAP_MM) / step))
  const rows = Math.max(1, Math.floor((pageH - PAGE_MARGIN_MM * 2 + GAP_MM) / step))
  const perPage = cols * rows

  const gridW = cols * cell + (cols - 1) * GAP_MM
  const gridH = rows * cell + (rows - 1) * GAP_MM
  const originX = (pageW - gridW) / 2
  const originY = (pageH - gridH) / 2

  const site = String(baseUrl || 'https://doghealthy.co.uk').replace(/\/$/, '')

  // Approximate glyph heights in mm (pt → mm)
  const ptToMm = (pt: number) => (pt * 25.4) / 72
  const brandH = ptToMm(BRAND_PT)
  const nameH = ptToMm(NAME_PT)
  const tapH = ptToMm(TAP_PT)

  // Reserve vertical space for labels; QR fills the rest inside the circle
  const labelsH = brandH + LABEL_GAP_MM + nameH + LABEL_GAP_MM + LABEL_GAP_MM + tapH
  const usableDiameter = STICKER_MM - EDGE_PAD_MM * 2
  const qrSize = Math.max(8, Math.min(usableDiameter - labelsH, usableDiameter * 0.62))

  const contentH =
    brandH + LABEL_GAP_MM + nameH + LABEL_GAP_MM + qrSize + LABEL_GAP_MM + tapH

  const qrPx = Math.max(QR_PRINT_PPI, Math.round((qrSize / 25.4) * QR_PRINT_PPI))

  for (let i = 0; i < items.length; i++) {
    const indexOnPage = i % perPage
    if (i > 0 && indexOnPage === 0) {
      doc.addPage()
    }

    const col = indexOnPage % cols
    const row = Math.floor(indexOnPage / cols)
    const x = originX + col * step
    const y = originY + row * step
    const cx = x + radius
    const cy = y + radius

    // Optional light cut guide (very faint) for alignment when printing/cutting
    doc.setDrawColor(210, 210, 210)
    doc.setLineWidth(0.1)
    doc.circle(cx, cy, radius, 'S')

    const url = `${site}/dogs/${items[i].petId}`
    const dataUrl = await QRCode.toDataURL(url, {
      width: qrPx,
      margin: 1,
      errorCorrectionLevel: 'M'
    })

    let cursorY = cy - contentH / 2

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)

    // Brand
    doc.setFontSize(BRAND_PT)
    const brandBaseline = cursorY + brandH
    const brandMaxW = chordWidthMm(cy, brandBaseline - brandH / 2, radius, EDGE_PAD_MM)
    doc.text(
      truncateCentered(doc, BRAND_TEXT, brandMaxW || usableDiameter * 0.7),
      cx,
      brandBaseline,
      { align: 'center', baseline: 'alphabetic' }
    )
    cursorY = brandBaseline + LABEL_GAP_MM

    // Dog name
    doc.setFontSize(NAME_PT)
    const nameBaseline = cursorY + nameH
    const nameMaxW = chordWidthMm(cy, nameBaseline - nameH / 2, radius, EDGE_PAD_MM)
    doc.text(
      truncateCentered(doc, items[i].dogName || 'Dog', nameMaxW || usableDiameter * 0.7),
      cx,
      nameBaseline,
      { align: 'center', baseline: 'alphabetic' }
    )
    cursorY = nameBaseline + LABEL_GAP_MM

    // QR (centered in remaining band)
    const qrX = cx - qrSize / 2
    const qrY = cursorY
    doc.addImage(dataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    cursorY = qrY + qrSize + LABEL_GAP_MM

    // TAP or SCAN
    doc.setFontSize(TAP_PT)
    const tapBaseline = cursorY + tapH
    const tapMaxW = chordWidthMm(cy, tapBaseline - tapH / 2, radius, EDGE_PAD_MM)
    doc.text(
      truncateCentered(doc, TAP_TEXT, tapMaxW || usableDiameter * 0.7),
      cx,
      tapBaseline,
      { align: 'center', baseline: 'alphabetic' }
    )
  }

  return doc.output('blob')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
