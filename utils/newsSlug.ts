export const slugifyNewsTitle = (title: string) =>
  String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'article'

export const newsArticlePath = (article: { slug: string; category?: string | null }) =>
  article.category === 'howto' ? `/how-to/${article.slug}` : `/news/${article.slug}`
