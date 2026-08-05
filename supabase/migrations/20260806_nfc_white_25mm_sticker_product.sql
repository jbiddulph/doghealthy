-- Single DogHealthy NFC sticker product: 25mm × 25mm white NFC sticker @ £1.00
-- Deactivate legacy NFC Me catalogue options so checkout only offers one SKU.

UPDATE public.nfcme_products
SET is_active = false
WHERE sku IS DISTINCT FROM 'NFC-WHITE-25MM';

INSERT INTO public.nfcme_products (
  sku,
  name,
  description,
  tag_type,
  form_factor,
  unit_price_cents,
  currency,
  min_order_qty,
  stock_qty,
  is_active
)
VALUES (
  'NFC-WHITE-25MM',
  '25mm × 25mm NFC white sticker',
  'NTAG213 white adhesive NFC sticker (25mm × 25mm). Encoded to your dog’s DogHealthy profile URL. £1.00 each.',
  'ntags213',
  'sticker',
  100,
  'GBP',
  1,
  10000,
  true
)
ON CONFLICT (sku) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tag_type = EXCLUDED.tag_type,
  form_factor = EXCLUDED.form_factor,
  unit_price_cents = EXCLUDED.unit_price_cents,
  currency = EXCLUDED.currency,
  min_order_qty = EXCLUDED.min_order_qty,
  stock_qty = EXCLUDED.stock_qty,
  is_active = true;
