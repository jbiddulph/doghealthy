-- NFC-WHITE-25MM was inserted without a manufacturer offer, so NFC Me order
-- create failed. Attach TagFlow (or first manufacturer) and create an offer.

WITH mfr AS (
  SELECT id
  FROM nfcme_companies
  WHERE company_type = 'manufacturer'
  ORDER BY CASE WHEN lower(name) = 'tagflow manufacturing' THEN 0 ELSE 1 END
  LIMIT 1
)
UPDATE nfcme_products p
SET manufacturer_id = mfr.id
FROM mfr
WHERE p.sku = 'NFC-WHITE-25MM'
  AND p.manufacturer_id IS NULL;

INSERT INTO nfcme_product_offers (
  product_id,
  manufacturer_id,
  unit_price_cents,
  currency,
  min_order_qty,
  stock_qty,
  lead_time_days,
  is_active,
  supports_engraving,
  supports_encoding
)
SELECT
  p.id,
  p.manufacturer_id,
  COALESCE(p.unit_price_cents, 100),
  COALESCE(p.currency, 'GBP'),
  COALESCE(p.min_order_qty, 1),
  COALESCE(p.stock_qty, 10000),
  5,
  true,
  true,
  true
FROM nfcme_products p
WHERE p.sku = 'NFC-WHITE-25MM'
  AND p.manufacturer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM nfcme_product_offers o
    WHERE o.product_id = p.id
      AND o.manufacturer_id = p.manufacturer_id
  );
