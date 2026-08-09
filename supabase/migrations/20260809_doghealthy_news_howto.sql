-- How-to guides share doghealthy_news; homepage /how-to lists category = howto.

ALTER TABLE public.doghealthy_news
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'news';

ALTER TABLE public.doghealthy_news
  DROP CONSTRAINT IF EXISTS doghealthy_news_category_check;

ALTER TABLE public.doghealthy_news
  ADD CONSTRAINT doghealthy_news_category_check
  CHECK (category IN ('news', 'howto'));

CREATE INDEX IF NOT EXISTS idx_doghealthy_news_howto
  ON public.doghealthy_news (published_at DESC)
  WHERE is_published = true AND category = 'howto';
