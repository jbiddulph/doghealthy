-- Public news articles; homepage shows featured published rows.

CREATE TABLE IF NOT EXISTS public.doghealthy_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  image_author TEXT,
  image_author_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES public.doghealthy_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT doghealthy_news_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_news_published
  ON public.doghealthy_news (published_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_doghealthy_news_featured
  ON public.doghealthy_news (published_at DESC)
  WHERE is_published = true AND is_featured = true;

ALTER TABLE public.doghealthy_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published news" ON public.doghealthy_news;
CREATE POLICY "Public can read published news"
  ON public.doghealthy_news
  FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins full access news" ON public.doghealthy_news;
CREATE POLICY "Admins full access news"
  ON public.doghealthy_news
  FOR ALL
  USING (public.doghealthy_is_admin())
  WITH CHECK (public.doghealthy_is_admin());

GRANT SELECT ON public.doghealthy_news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doghealthy_news TO authenticated;
