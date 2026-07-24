-- Found-dog reporting + scan intent for SMS alerts

ALTER TABLE public.doghealthy_scans
  ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT 'scan'
    CHECK (intent IN ('scan', 'found', 'walk', 'check_in', 'check_out', 'test')),
  ADD COLUMN IF NOT EXISTS finder_note TEXT,
  ADD COLUMN IF NOT EXISTS sms_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sms_sid TEXT,
  ADD COLUMN IF NOT EXISTS sms_error TEXT;

CREATE INDEX IF NOT EXISTS idx_doghealthy_scans_intent
  ON public.doghealthy_scans(intent);

ALTER TABLE public.doghealthy_dogs
  ADD COLUMN IF NOT EXISTS is_lost BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS lost_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS found_reported_at TIMESTAMP WITH TIME ZONE;

-- Optional notify preference on owner profile
ALTER TABLE public.doghealthy_users
  ADD COLUMN IF NOT EXISTS notify_found_sms BOOLEAN DEFAULT true;
