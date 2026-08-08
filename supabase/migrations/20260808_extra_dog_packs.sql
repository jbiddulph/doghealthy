-- Paid extra-dog packs (after the 3 free dogs): £2/dog includes NFC + QR + postage option

CREATE TABLE IF NOT EXISTS public.doghealthy_extra_dog_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 100),
  unit_price_cents INTEGER NOT NULL DEFAULT 200,
  postage_class TEXT NOT NULL DEFAULT 'second'
    CHECK (postage_class IN ('first', 'second', 'free')),
  postage_cents INTEGER NOT NULL DEFAULT 0,
  subtotal_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'gbp',
  status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  dog_ids UUID[] NOT NULL DEFAULT '{}',
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_phone TEXT,
  shipping_line1 TEXT,
  shipping_line2 TEXT,
  shipping_city TEXT,
  shipping_postcode TEXT,
  shipping_country TEXT DEFAULT 'GB',
  nfc_me_order_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_extra_dog_orders_user_id
  ON public.doghealthy_extra_dog_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_extra_dog_orders_status
  ON public.doghealthy_extra_dog_orders(status);

ALTER TABLE public.doghealthy_extra_dog_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own extra dog orders" ON public.doghealthy_extra_dog_orders;
CREATE POLICY "Users can view own extra dog orders"
  ON public.doghealthy_extra_dog_orders
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins full access extra dog orders" ON public.doghealthy_extra_dog_orders;
CREATE POLICY "Admins full access extra dog orders"
  ON public.doghealthy_extra_dog_orders
  FOR ALL
  USING (public.doghealthy_is_admin())
  WITH CHECK (public.doghealthy_is_admin());
