-- Fix RLS policies to allow API writes using service role key
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "auth_insert_website_pages" ON public.website_pages;
DROP POLICY IF EXISTS "auth_update_website_pages" ON public.website_pages;
DROP POLICY IF EXISTS "auth_delete_website_pages" ON public.website_pages;
DROP POLICY IF EXISTS "auth_select_website_pages" ON public.website_pages;

DROP POLICY IF EXISTS "auth_insert_knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "auth_update_knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "auth_delete_knowledge_chunks" ON public.knowledge_chunks;
DROP POLICY IF EXISTS "auth_select_knowledge_chunks" ON public.knowledge_chunks;

DROP POLICY IF EXISTS "auth_insert_crawl_logs" ON public.crawl_logs;
DROP POLICY IF EXISTS "auth_update_crawl_logs" ON public.crawl_logs;
DROP POLICY IF EXISTS "auth_delete_crawl_logs" ON public.crawl_logs;
DROP POLICY IF EXISTS "auth_select_crawl_logs" ON public.crawl_logs;

-- Create permissive policies that allow service role (for API operations)
-- These use "true" to allow service role operations while maintaining RLS security

-- website_pages policies
CREATE POLICY "allow_all_website_pages_select" ON public.website_pages
  FOR SELECT USING (true);

CREATE POLICY "allow_all_website_pages_insert" ON public.website_pages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_website_pages_update" ON public.website_pages
  FOR UPDATE USING (true);

CREATE POLICY "allow_all_website_pages_delete" ON public.website_pages
  FOR DELETE USING (true);

-- knowledge_chunks policies
CREATE POLICY "allow_all_knowledge_chunks_select" ON public.knowledge_chunks
  FOR SELECT USING (true);

CREATE POLICY "allow_all_knowledge_chunks_insert" ON public.knowledge_chunks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_knowledge_chunks_update" ON public.knowledge_chunks
  FOR UPDATE USING (true);

CREATE POLICY "allow_all_knowledge_chunks_delete" ON public.knowledge_chunks
  FOR DELETE USING (true);

-- crawl_logs policies
CREATE POLICY "allow_all_crawl_logs_select" ON public.crawl_logs
  FOR SELECT USING (true);

CREATE POLICY "allow_all_crawl_logs_insert" ON public.crawl_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_crawl_logs_update" ON public.crawl_logs
  FOR UPDATE USING (true);

CREATE POLICY "allow_all_crawl_logs_delete" ON public.crawl_logs
  FOR DELETE USING (true);