-- Physical NFC / QR tags + scan tracking
-- Public URL encoded on stickers/QR: /dogs/{pet_id}

CREATE TABLE IF NOT EXISTS public.doghealthy_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL UNIQUE,
  pet_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'lost', 'replaced', 'inactive')),
  manufacturer_id TEXT,
  activated_at TIMESTAMP WITH TIME ZONE,
  lost_at TIMESTAMP WITH TIME ZONE,
  replaced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- One active tag per pet (v1)
CREATE UNIQUE INDEX IF NOT EXISTS idx_doghealthy_tags_one_active_per_pet
  ON public.doghealthy_tags(pet_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_doghealthy_tags_pet_id
  ON public.doghealthy_tags(pet_id);

CREATE INDEX IF NOT EXISTS idx_doghealthy_tags_status
  ON public.doghealthy_tags(status);

CREATE TABLE IF NOT EXISTS public.doghealthy_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES public.doghealthy_tags(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  ip TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  accuracy_m NUMERIC,
  user_agent TEXT,
  device JSONB
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_scans_tag_scanned_at
  ON public.doghealthy_scans(tag_id, scanned_at DESC);

ALTER TABLE public.doghealthy_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doghealthy_scans ENABLE ROW LEVEL SECURITY;

-- Owners can view tags for their dogs
DROP POLICY IF EXISTS "Owners can view tags for their dogs" ON public.doghealthy_tags;
CREATE POLICY "Owners can view tags for their dogs"
  ON public.doghealthy_tags
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_dogs d
      WHERE d.id = pet_id AND d.user_id = auth.uid()
    )
  );

-- Owners can insert tags for their dogs
DROP POLICY IF EXISTS "Owners can insert tags for their dogs" ON public.doghealthy_tags;
CREATE POLICY "Owners can insert tags for their dogs"
  ON public.doghealthy_tags
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doghealthy_dogs d
      WHERE d.id = pet_id AND d.user_id = auth.uid()
    )
  );

-- Owners can update tags for their dogs
DROP POLICY IF EXISTS "Owners can update tags for their dogs" ON public.doghealthy_tags;
CREATE POLICY "Owners can update tags for their dogs"
  ON public.doghealthy_tags
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_dogs d
      WHERE d.id = pet_id AND d.user_id = auth.uid()
    )
  );

-- Owners can view scans for their dogs' tags
DROP POLICY IF EXISTS "Owners can view scans for their dogs" ON public.doghealthy_scans;
CREATE POLICY "Owners can view scans for their dogs"
  ON public.doghealthy_scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.doghealthy_tags t
      JOIN public.doghealthy_dogs d ON d.id = t.pet_id
      WHERE t.id = tag_id AND d.user_id = auth.uid()
    )
  );

-- No public INSERT on scans via anon client (Netlify function uses service role)

DROP TRIGGER IF EXISTS update_doghealthy_tags_updated_at ON public.doghealthy_tags;
CREATE TRIGGER update_doghealthy_tags_updated_at
  BEFORE UPDATE ON public.doghealthy_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
