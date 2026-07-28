-- Finder contact on found reports + GPS walk tracking

ALTER TABLE public.doghealthy_scans
  ADD COLUMN IF NOT EXISTS finder_name TEXT,
  ADD COLUMN IF NOT EXISTS finder_phone TEXT;

-- Walk sessions (Start walk → GPS points → End walk)
CREATE TABLE IF NOT EXISTS public.doghealthy_walks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.doghealthy_dogs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.doghealthy_tags(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  client_token TEXT NOT NULL,
  walker_name TEXT,
  walker_phone TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  ended_at TIMESTAMP WITH TIME ZONE,
  point_count INTEGER NOT NULL DEFAULT 0,
  distance_m NUMERIC NOT NULL DEFAULT 0,
  start_latitude NUMERIC,
  start_longitude NUMERIC,
  end_latitude NUMERIC,
  end_longitude NUMERIC,
  start_scan_id UUID REFERENCES public.doghealthy_scans(id) ON DELETE SET NULL,
  end_scan_id UUID REFERENCES public.doghealthy_scans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_doghealthy_walks_one_active_per_pet
  ON public.doghealthy_walks(pet_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_doghealthy_walks_pet_started
  ON public.doghealthy_walks(pet_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_doghealthy_walks_tag_started
  ON public.doghealthy_walks(tag_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_doghealthy_walks_client_token
  ON public.doghealthy_walks(client_token);

CREATE TABLE IF NOT EXISTS public.doghealthy_walk_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  walk_id UUID NOT NULL REFERENCES public.doghealthy_walks(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy_m NUMERIC
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_doghealthy_walk_points_walk_seq
  ON public.doghealthy_walk_points(walk_id, sequence);

CREATE INDEX IF NOT EXISTS idx_doghealthy_walk_points_walk_recorded
  ON public.doghealthy_walk_points(walk_id, recorded_at ASC);

ALTER TABLE public.doghealthy_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doghealthy_walk_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view walks for their dogs" ON public.doghealthy_walks;
CREATE POLICY "Owners can view walks for their dogs"
  ON public.doghealthy_walks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_dogs d
      WHERE d.id = pet_id AND d.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can view walk points for their dogs" ON public.doghealthy_walk_points;
CREATE POLICY "Owners can view walk points for their dogs"
  ON public.doghealthy_walk_points
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.doghealthy_walks w
      JOIN public.doghealthy_dogs d ON d.id = w.pet_id
      WHERE w.id = walk_id AND d.user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_doghealthy_walks_updated_at ON public.doghealthy_walks;
CREATE TRIGGER update_doghealthy_walks_updated_at
  BEFORE UPDATE ON public.doghealthy_walks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
