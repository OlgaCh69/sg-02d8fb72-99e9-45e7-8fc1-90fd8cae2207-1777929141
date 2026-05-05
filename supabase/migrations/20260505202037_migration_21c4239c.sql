-- Create website_pages table for tracking crawled pages
CREATE TABLE IF NOT EXISTS public.website_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  status TEXT NOT NULL DEFAULT 'discovered' CHECK (status IN ('discovered', 'crawled', 'indexed', 'approved', 'excluded', 'error')),
  word_count INTEGER DEFAULT 0,
  content_hash TEXT,
  extracted_content TEXT,
  approved BOOLEAN DEFAULT false,
  excluded BOOLEAN DEFAULT false,
  error_message TEXT,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_chunks table for storing content chunks
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  approved BOOLEAN DEFAULT false,
  embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_logs table for tracking crawl operations
CREATE TABLE IF NOT EXISTS public.crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_type TEXT NOT NULL CHECK (crawl_type IN ('full', 'sitemap', 'single_url', 're-index')),
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
  pages_discovered INTEGER DEFAULT 0,
  pages_crawled INTEGER DEFAULT 0,
  pages_indexed INTEGER DEFAULT 0,
  pages_failed INTEGER DEFAULT 0,
  message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_website_pages_status ON public.website_pages(status);
CREATE INDEX IF NOT EXISTS idx_website_pages_approved ON public.website_pages(approved);
CREATE INDEX IF NOT EXISTS idx_website_pages_url ON public.website_pages(url);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_page_id ON public.knowledge_chunks(website_page_id);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON public.crawl_logs(status);

-- Enable RLS
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users can read, admins can write)
CREATE POLICY "public_read_website_pages" ON public.website_pages FOR SELECT USING (true);
CREATE POLICY "auth_insert_website_pages" ON public.website_pages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_website_pages" ON public.website_pages FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_website_pages" ON public.website_pages FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read_knowledge_chunks" ON public.knowledge_chunks FOR SELECT USING (true);
CREATE POLICY "auth_insert_knowledge_chunks" ON public.knowledge_chunks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_knowledge_chunks" ON public.knowledge_chunks FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_knowledge_chunks" ON public.knowledge_chunks FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "public_read_crawl_logs" ON public.crawl_logs FOR SELECT USING (true);
CREATE POLICY "auth_insert_crawl_logs" ON public.crawl_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_crawl_logs" ON public.crawl_logs FOR UPDATE USING (auth.uid() IS NOT NULL);