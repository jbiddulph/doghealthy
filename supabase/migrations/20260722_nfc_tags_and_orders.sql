-- NFC dog tags: public profile flag + local order tracking
-- Run this manually in the Supabase SQL editor

-- Allow NFC-enabled dog profiles to be viewed publicly (for tag scans)
ALTER TABLE public.doghealthy_dogs
ADD COLUMN IF NOT EXISTS nfc_tag_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nfc_ordered_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_doghealthy_dogs_nfc_tag_enabled
  ON public.doghealthy_dogs(nfc_tag_enabled)
  WHERE nfc_tag_enabled = true;

-- Public read of NFC-enabled dogs only (limited fields via policy still selects row;
-- the public page only displays safe fields)
DROP POLICY IF EXISTS "Public can view NFC-enabled dogs" ON public.doghealthy_dogs;
CREATE POLICY "Public can view NFC-enabled dogs"
  ON public.doghealthy_dogs
  FOR SELECT
  USING (nfc_tag_enabled = true AND is_active = true);

-- Local NFC order records
CREATE TABLE IF NOT EXISTS public.doghealthy_nfc_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
  dog_ids UUID[] NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  nfc_me_order_id TEXT,
  shipping_name VARCHAR(255) NOT NULL,
  shipping_email VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(50),
  shipping_line1 TEXT NOT NULL,
  shipping_line2 TEXT,
  shipping_city VARCHAR(255) NOT NULL,
  shipping_postcode VARCHAR(50) NOT NULL,
  shipping_country VARCHAR(2) NOT NULL DEFAULT 'GB',
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_doghealthy_nfc_orders_user_id
  ON public.doghealthy_nfc_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_doghealthy_nfc_orders_status
  ON public.doghealthy_nfc_orders(status);

ALTER TABLE public.doghealthy_nfc_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own NFC orders" ON public.doghealthy_nfc_orders;
CREATE POLICY "Users can view their own NFC orders"
  ON public.doghealthy_nfc_orders
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own NFC orders" ON public.doghealthy_nfc_orders;
CREATE POLICY "Users can insert their own NFC orders"
  ON public.doghealthy_nfc_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_doghealthy_nfc_orders_updated_at ON public.doghealthy_nfc_orders;
CREATE TRIGGER update_doghealthy_nfc_orders_updated_at
  BEFORE UPDATE ON public.doghealthy_nfc_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
