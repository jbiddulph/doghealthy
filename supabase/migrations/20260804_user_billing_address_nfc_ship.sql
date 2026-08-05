-- Billing / shipping address on user profile for NFC chip postage
-- Plus admin flag and NFC chip postage status for operations

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

-- SECURITY DEFINER avoids infinite recursion when admin policies read doghealthy_users
CREATE OR REPLACE FUNCTION public.doghealthy_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.doghealthy_users WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.doghealthy_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.doghealthy_is_admin() TO authenticated, anon, service_role;

DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.doghealthy_users;
CREATE POLICY "Admins can view all user profiles"
  ON public.doghealthy_users
  FOR SELECT
  USING (public.doghealthy_is_admin());

DROP POLICY IF EXISTS "Admins can update NFC chip fulfillment" ON public.doghealthy_users;
CREATE POLICY "Admins can update NFC chip fulfillment"
  ON public.doghealthy_users
  FOR UPDATE
  USING (public.doghealthy_is_admin())
  WITH CHECK (public.doghealthy_is_admin());

DROP POLICY IF EXISTS "Admins can view dogs for NFC fulfilment" ON public.doghealthy_dogs;
CREATE POLICY "Admins can view dogs for NFC fulfilment"
  ON public.doghealthy_dogs
  FOR SELECT
  USING (public.doghealthy_is_admin());
