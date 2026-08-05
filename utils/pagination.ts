export const DOG_RECORDS_PAGE_SIZE = 20

export function pageRange(page: number, pageSize: number) {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const from = (safePage - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to, page: safePage }
}

export function totalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}
