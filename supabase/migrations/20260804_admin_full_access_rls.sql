-- Full admin access to DogHealthy tables via doghealthy_is_admin()
-- (SECURITY DEFINER helper — must not recurse through RLS)

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

-- Prevent non-admins from escalating is_admin on their own profile
CREATE OR REPLACE FUNCTION public.doghealthy_protect_admin_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT public.doghealthy_is_admin() THEN
      RAISE EXCEPTION 'Only admins can change is_admin';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS doghealthy_protect_admin_flag ON public.doghealthy_users;
CREATE TRIGGER doghealthy_protect_admin_flag
  BEFORE UPDATE ON public.doghealthy_users
  FOR EACH ROW
  EXECUTE FUNCTION public.doghealthy_protect_admin_flag();

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'doghealthy_users',
    'doghealthy_dogs',
    'doghealthy_vaccinations',
    'doghealthy_medications',
    'doghealthy_appointments',
    'doghealthy_health_records',
    'doghealthy_weight_logs',
    'doghealthy_vets',
    'doghealthy_tags',
    'doghealthy_scans',
    'doghealthy_walks',
    'doghealthy_walk_points',
    'doghealthy_nfc_orders',
    'doghealthy_messages',
    'doghealthy_notifications',
    'doghealthy_listings',
    'doghealthy_listing_inquiries',
    'doghealthy_email_leads'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins full access', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (public.doghealthy_is_admin()) WITH CHECK (public.doghealthy_is_admin())',
        'Admins full access',
        t
      );
    END IF;
  END LOOP;
END $$;

-- Replace narrower admin-only policies now covered by "Admins full access"
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.doghealthy_users;
DROP POLICY IF EXISTS "Admins can update NFC chip fulfillment" ON public.doghealthy_users;
DROP POLICY IF EXISTS "Admins can view dogs for NFC fulfilment" ON public.doghealthy_dogs;
