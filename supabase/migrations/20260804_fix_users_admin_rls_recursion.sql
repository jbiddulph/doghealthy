-- Fix infinite recursion in doghealthy_users admin RLS policies.
-- Policies must not SELECT doghealthy_users under RLS; use SECURITY DEFINER helper.

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
