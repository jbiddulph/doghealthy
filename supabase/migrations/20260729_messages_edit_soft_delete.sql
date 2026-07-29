-- Soft-delete per participant + edit tracking for inbox messages
ALTER TABLE public.doghealthy_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sender_deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recipient_deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_doghealthy_messages_recipient_unread
  ON public.doghealthy_messages(recipient_id, is_read)
  WHERE recipient_deleted_at IS NULL AND is_read = FALSE;

-- Sender can edit own message content (+ edited_at)
DROP POLICY IF EXISTS "Users can update their own messages" ON public.doghealthy_messages;
DROP POLICY IF EXISTS "Senders can edit own messages" ON public.doghealthy_messages;
CREATE POLICY "Senders can edit own messages"
  ON public.doghealthy_messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Recipient can mark read / soft-delete from their inbox
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.doghealthy_messages;
DROP POLICY IF EXISTS "Recipients can update received messages" ON public.doghealthy_messages;
CREATE POLICY "Recipients can update received messages"
  ON public.doghealthy_messages
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Hard delete: only the sender may remove the row entirely
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.doghealthy_messages;
DROP POLICY IF EXISTS "Senders can hard-delete own messages" ON public.doghealthy_messages;
CREATE POLICY "Senders can hard-delete own messages"
  ON public.doghealthy_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Participants soft-delete via UPDATE (policies above).
-- Guest messages (sender_id null): recipient soft-deletes with recipient_deleted_at.
