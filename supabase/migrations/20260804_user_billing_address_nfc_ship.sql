-- Billing / shipping address on user profile for NFC chip fulfilment
-- Plus admin flag and NFC chip fulfilment status for operations

ALTER TABLE public.doghealthy_users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS billing_name TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_postcode TEXT,
  ADD COLUMN IF NOT EXISTS address_country TEXT NOT NULL DEFAULT 'GB',
  ADD COLUMN IF NOT EXISTS nfc_chip_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS nfc_chip_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nfc_chip_shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nfc_chip_dog_id UUID REFERENCES public.doghealthy_dogs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS nfc_chip_notes TEXT;

COMMENT ON COLUMN public.doghealthy_users.nfc_chip_status IS
  'none | pending | shipped | cancelled — physical NFC chip postage for QR/NFC tag subscribers';

CREATE INDEX IF NOT EXISTS idx_doghealthy_users_nfc_chip_status
  ON public.doghealthy_users(nfc_chip_status)
  WHERE nfc_chip_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_doghealthy_users_is_admin
  ON public.doghealthy_users(is_admin)
  WHERE is_admin = true;

-- Admins can read all profiles (for NFC fulfilment)
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.doghealthy_users;
CREATE POLICY "Admins can view all user profiles"
  ON public.doghealthy_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_users me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  );

-- Admins can update NFC chip fulfillment fields on any user
DROP POLICY IF EXISTS "Admins can update NFC chip fulfillment" ON public.doghealthy_users;
CREATE POLICY "Admins can update NFC chip fulfillment"
  ON public.doghealthy_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_users me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doghealthy_users me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  );

-- Admins can read dog names for NFC fulfilment lists
DROP POLICY IF EXISTS "Admins can view dogs for NFC fulfilment" ON public.doghealthy_dogs;
CREATE POLICY "Admins can view dogs for NFC fulfilment"
  ON public.doghealthy_dogs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doghealthy_users me
      WHERE me.id = auth.uid() AND me.is_admin = true
    )
  );
