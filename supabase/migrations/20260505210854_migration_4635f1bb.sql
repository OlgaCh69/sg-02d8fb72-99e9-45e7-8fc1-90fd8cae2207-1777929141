-- Ensure RLS policies allow updates for approval
DROP POLICY IF EXISTS "allow_all_website_pages_update" ON public.website_pages;

CREATE POLICY "allow_all_website_pages_update" ON public.website_pages
  FOR UPDATE USING (true)
  WITH CHECK (true);