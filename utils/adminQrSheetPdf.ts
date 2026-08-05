import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export type AdminQrSheetItem = {
  petId: string
  dogName?: string | null
  tagUid?: string | null
}

/** Sticker layout is specified in CSS-style pixels at 144 PPI. */
const PPI = 144
const QR_PX = 85
const GAP_PX = 30
const BRAND_FONT_PX = 5
const NAME_FONT_PX = 5
const TAP_FONT_PX = 5
const MARGIN_PX = 36
const LABEL_GAP_PX = 3
const TAP_GAP_PX = 4

const BRAND_TEXT = 'doghealthy.uk'
const TAP_TEXT = 'TAP or SCAN'

const pxToIn = (px: number) => px / PPI
/** jsPDF setFontSize always uses points (1/72"). */
const pxToPt = (px: number) => (px / PPI) * 72

function truncateCentered(doc: jsPDF, text: string, maxWidthIn: number): string {
  const raw = String(text || '').trim()
  if (!raw) return ''
  if (doc.getTextWidth(raw) <= maxWidthIn) return raw
  let out = raw
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > maxWidthIn) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

/**
 * Build a multi-page A4 PDF of QR codes.
 * Cell size is 85×85px at 144 PPI (~0.59"), with 30px gaps at the same PPI.
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
    unit: 'in',
    format: 'a4'
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const qrIn = pxToIn(QR_PX)
  const gapIn = pxToIn(GAP_PX)
  const marginIn = pxToIn(MARGIN_PX)
  const labelGapIn = pxToIn(LABEL_GAP_PX)
  const tapGapIn = pxToIn(TAP_GAP_PX)
  const brandPt = pxToPt(BRAND_FONT_PX)
  const namePt = pxToPt(NAME_FONT_PX)
  const tapPt = pxToPt(TAP_FONT_PX)

  // Approximate line heights from font size in inches
  const brandLineIn = pxToIn(BRAND_FONT_PX) + labelGapIn
  const nameLineIn = pxToIn(NAME_FONT_PX) + labelGapIn
  const headerH = brandLineIn + nameLineIn
  const tapLineH = pxToIn(TAP_FONT_PX) + tapGapIn

  const cellW = qrIn
  const cellH = headerH + qrIn + tapLineH
  const stepX = cellW + gapIn
  const stepY = cellH + gapIn

  const usableW = pageW - marginIn * 2
  const usableH = pageH - marginIn * 2
  const cols = Math.max(1, Math.floor((usableW + gapIn) / stepX))
  const rows = Math.max(1, Math.floor((usableH + gapIn) / stepY))
  const perPage = cols * rows

  const gridW = cols * cellW + (cols - 1) * gapIn
  const gridH = rows * cellH + (rows - 1) * gapIn
  const originX = (pageW - gridW) / 2
  const originY = (pageH - gridH) / 2

  const site = String(baseUrl || 'https://doghealthy.co.uk').replace(/\/$/, '')

  for (let i = 0; i < items.length; i++) {
    const indexOnPage = i % perPage
    if (i > 0 && indexOnPage === 0) {
      doc.addPage()
    }

    const col = indexOnPage % cols
    const row = Math.floor(indexOnPage / cols)
    const x = originX + col * stepX
    const y = originY + row * stepY
    const centerX = x + cellW / 2

    const url = `${site}/dogs/${items[i].petId}`
    // Exact 85×85 bitmap → 144 PPI when placed at 85/144"
    const dataUrl = await QRCode.toDataURL(url, {
      width: QR_PX,
      margin: 1,
      errorCorrectionLevel: 'M'
    })

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)

    // Brand
    doc.setFontSize(brandPt)
    doc.text(BRAND_TEXT, centerX, y + pxToIn(BRAND_FONT_PX), {
      align: 'center',
      baseline: 'alphabetic'
    })

    // Dog name under brand
    const nameY = y + brandLineIn + pxToIn(NAME_FONT_PX)
    doc.setFontSize(namePt)
    const dogName = truncateCentered(doc, items[i].dogName || 'Dog', cellW)
    doc.text(dogName, centerX, nameY, {
      align: 'center',
      baseline: 'alphabetic'
    })

    // QR at 85px × 85px @ 144 PPI
    const qrY = y + headerH
    doc.addImage(dataUrl, 'PNG', x, qrY, qrIn, qrIn)

    // TAP or SCAN below
    doc.setFontSize(tapPt)
    doc.text(TAP_TEXT, centerX, qrY + qrIn + tapGapIn + pxToIn(TAP_FONT_PX), {
      align: 'center',
      baseline: 'alphabetic'
    })
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
