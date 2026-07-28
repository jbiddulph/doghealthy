-- Walker contact details on walk sessions

ALTER TABLE public.doghealthy_walks
  ADD COLUMN IF NOT EXISTS walker_name TEXT,
  ADD COLUMN IF NOT EXISTS walker_phone TEXT;
