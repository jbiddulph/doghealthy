-- Allow walk start/end intents for care logging
ALTER TABLE public.doghealthy_scans
  DROP CONSTRAINT IF EXISTS doghealthy_scans_intent_check;

ALTER TABLE public.doghealthy_scans
  ADD CONSTRAINT doghealthy_scans_intent_check
  CHECK (intent IN (
    'scan',
    'found',
    'walk',
    'walk_start',
    'walk_end',
    'check_in',
    'check_out',
    'test'
  ));
