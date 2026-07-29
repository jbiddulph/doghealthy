-- Guest contact inquiries on classifieds listings (unregistered visitors)
CREATE TABLE IF NOT EXISTS public.doghealthy_listing_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.doghealthy_listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.doghealthy_users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  message TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_listing_inquiries_listing
  ON public.doghealthy_listing_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_seller
  ON public.doghealthy_listing_inquiries(seller_id);

ALTER TABLE public.doghealthy_listing_inquiries ENABLE ROW LEVEL SECURITY;

-- Sellers can read inquiries about their listings
DROP POLICY IF EXISTS "Sellers can view their listing inquiries" ON public.doghealthy_listing_inquiries;
CREATE POLICY "Sellers can view their listing inquiries"
  ON public.doghealthy_listing_inquiries
  FOR SELECT
  USING (seller_id = auth.uid());

-- Inserts go through service role (Netlify function); no public INSERT
