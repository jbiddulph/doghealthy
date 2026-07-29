-- Guest messages on classifieds (nullable sender + contact fields)
ALTER TABLE public.doghealthy_messages
  ALTER COLUMN sender_id DROP NOT NULL;

ALTER TABLE public.doghealthy_messages
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Guest rows must have contact details; logged-in rows must have sender_id
ALTER TABLE public.doghealthy_messages
  DROP CONSTRAINT IF EXISTS doghealthy_messages_sender_or_guest_chk;

ALTER TABLE public.doghealthy_messages
  ADD CONSTRAINT doghealthy_messages_sender_or_guest_chk
  CHECK (
    (sender_id IS NOT NULL AND guest_email IS NULL)
    OR
    (sender_id IS NULL AND guest_email IS NOT NULL AND guest_name IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_guest_email
  ON public.doghealthy_messages(guest_email)
  WHERE guest_email IS NOT NULL;

-- Sellers can mark received messages as read
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.doghealthy_messages;
CREATE POLICY "Recipients can mark messages read"
  ON public.doghealthy_messages
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
