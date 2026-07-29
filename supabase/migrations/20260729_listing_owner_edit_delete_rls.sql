-- Ensure listing owners can update/delete their own rows reliably
DROP POLICY IF EXISTS "Users can update their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can update their own listings"
  ON public.doghealthy_listings
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.doghealthy_listings;
CREATE POLICY "Users can delete their own listings"
  ON public.doghealthy_listings
  FOR DELETE
  USING (user_id = auth.uid());
