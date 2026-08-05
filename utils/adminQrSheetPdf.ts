import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export type AdminQrSheetItem = {
  petId: string
  tagUid?: string | null
}

const QR_PX = 100
const GAP_PX = 30
const BRAND_FONT_PX = 5
const TAP_FONT_PX = 5
const BRAND_TEXT = 'doghealthy.uk'
const TAP_TEXT = 'TAP or SCAN'
const MARGIN_PX = 36
const BRAND_GAP_PX = 4
const TAP_GAP_PX = 4

/**
 * Build a multi-page A4 PDF of QR codes in a ~100×100px grid with 30px gaps.
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

  const brandLineH = BRAND_FONT_PX + BRAND_GAP_PX
  const tapLineH = TAP_FONT_PX + TAP_GAP_PX
  const cellW = QR_PX
  const cellH = brandLineH + QR_PX + tapLineH
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
    const pageIndex = Math.floor(i / perPage)
    const indexOnPage = i % perPage
    if (i > 0 && indexOnPage === 0) {
      doc.addPage()
    }

    const col = indexOnPage % cols
    const row = Math.floor(indexOnPage / cols)
    const x = originX + col * stepX
    const y = originY + row * stepY

    const url = `${site}/dogs/${items[i].petId}`
    const dataUrl = await QRCode.toDataURL(url, {
      width: QR_PX * 2,
      margin: 1,
      errorCorrectionLevel: 'M'
    })

    // Brand above
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(BRAND_FONT_PX)
    doc.setTextColor(30, 30, 30)
    doc.text(BRAND_TEXT, x + cellW / 2, y + BRAND_FONT_PX, {
      align: 'center',
      baseline: 'alphabetic'
    })

    // QR
    const qrY = y + brandLineH
    doc.addImage(dataUrl, 'PNG', x, qrY, QR_PX, QR_PX)

    // TAP or SCAN below
    doc.setFontSize(TAP_FONT_PX)
    doc.text(TAP_TEXT, x + cellW / 2, qrY + QR_PX + TAP_GAP_PX + TAP_FONT_PX, {
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
