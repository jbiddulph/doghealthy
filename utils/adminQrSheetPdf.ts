import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export type AdminQrSheetItem = {
  petId: string
  dogName?: string | null
  tagUid?: string | null
}

const QR_PX = 85
const GAP_PX = 30
const BRAND_FONT_PX = 5
const NAME_FONT_PX = 5
const TAP_FONT_PX = 5
const BRAND_TEXT = 'doghealthy.uk'
const TAP_TEXT = 'TAP or SCAN'
const MARGIN_PX = 36
const LABEL_GAP_PX = 3
const TAP_GAP_PX = 4

function truncateCentered(doc: jsPDF, text: string, maxWidth: number): string {
  const raw = String(text || '').trim()
  if (!raw) return ''
  if (doc.getTextWidth(raw) <= maxWidth) return raw
  let out = raw
  while (out.length > 1 && doc.getTextWidth(`${out}…`) > maxWidth) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

/**
 * Build a multi-page A4 PDF of QR codes in a grid with 30px gaps.
 * Layout per cell (centered): brand → dog name → QR → TAP or SCAN
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
    unit: 'px',
    format: 'a4',
    hotfixes: ['px_scaling']
  })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  const headerH = BRAND_FONT_PX + LABEL_GAP_PX + NAME_FONT_PX + LABEL_GAP_PX
  const tapLineH = TAP_FONT_PX + TAP_GAP_PX
  const cellW = QR_PX
  const cellH = headerH + QR_PX + tapLineH
  const stepX = cellW + GAP_PX
  const stepY = cellH + GAP_PX

  const usableW = pageW - MARGIN_PX * 2
  const usableH = pageH - MARGIN_PX * 2
  const cols = Math.max(1, Math.floor((usableW + GAP_PX) / stepX))
  const rows = Math.max(1, Math.floor((usableH + GAP_PX) / stepY))
  const perPage = cols * rows

  // Center the grid block on each page
  const gridW = cols * cellW + (cols - 1) * GAP_PX
  const gridH = rows * cellH + (rows - 1) * GAP_PX
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
    const dataUrl = await QRCode.toDataURL(url, {
      width: QR_PX * 2,
      margin: 1,
      errorCorrectionLevel: 'M'
    })

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)

    // Brand
    doc.setFontSize(BRAND_FONT_PX)
    doc.text(BRAND_TEXT, centerX, y + BRAND_FONT_PX, {
      align: 'center',
      baseline: 'alphabetic'
    })

    // Dog name under brand
    const nameY = y + BRAND_FONT_PX + LABEL_GAP_PX + NAME_FONT_PX
    doc.setFontSize(NAME_FONT_PX)
    const dogName = truncateCentered(
      doc,
      items[i].dogName || 'Dog',
      cellW
    )
    doc.text(dogName, centerX, nameY, {
      align: 'center',
      baseline: 'alphabetic'
    })

    // QR
    const qrY = y + headerH
    doc.addImage(dataUrl, 'PNG', x, qrY, QR_PX, QR_PX)

    // TAP or SCAN below
    doc.setFontSize(TAP_FONT_PX)
    doc.text(TAP_TEXT, centerX, qrY + QR_PX + TAP_GAP_PX + TAP_FONT_PX, {
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
