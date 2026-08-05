-- Batch NFC sticker orders: qty, postage, replacements, payment tracking

ALTER TABLE public.doghealthy_nfc_orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS tags_per_dog INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS tag_quantity INTEGER,
  ADD COLUMN IF NOT EXISTS unit_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS postage_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER,
  ADD COLUMN IF NOT EXISTS total_cents INTEGER,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'gbp',
  ADD COLUMN IF NOT EXISTS product_sku TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

COMMENT ON COLUMN public.doghealthy_nfc_orders.order_type IS 'new | replacement';
COMMENT ON COLUMN public.doghealthy_nfc_orders.payment_status IS 'unpaid | paid | refunded | waived';

CREATE INDEX IF NOT EXISTS idx_doghealthy_nfc_orders_payment_status
  ON public.doghealthy_nfc_orders(payment_status);

CREATE INDEX IF NOT EXISTS idx_doghealthy_nfc_orders_stripe_session
  ON public.doghealthy_nfc_orders(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- Users can update their own unpaid orders only via service role in practice;
-- keep SELECT for owners (existing policy).
