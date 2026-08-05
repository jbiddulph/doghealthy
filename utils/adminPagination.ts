export const ADMIN_PAGE_SIZE = 50

export function adminPageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const safePage = Math.max(1, Math.floor(page) || 1)
  const from = (safePage - 1) * pageSize
  const to = from + pageSize - 1
  return { from, to, page: safePage }
}

export function adminTotalPages(total: number, pageSize = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}
