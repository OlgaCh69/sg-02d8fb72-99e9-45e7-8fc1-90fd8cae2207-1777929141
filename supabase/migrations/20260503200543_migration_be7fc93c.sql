-- Create website_pages table to store crawled content
CREATE TABLE IF NOT EXISTS website_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  content TEXT,
  content_hash TEXT,
  meta_description TEXT,
  last_crawled TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, approved, excluded
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_settings table for configuration
CREATE TABLE IF NOT EXISTS crawl_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_url TEXT NOT NULL,
  crawl_frequency TEXT DEFAULT 'weekly', -- daily, weekly, manual
  excluded_patterns TEXT[] DEFAULT '{}',
  max_pages INTEGER DEFAULT 100,
  last_crawl_started TIMESTAMP WITH TIME ZONE,
  last_crawl_completed TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_logs table for tracking
CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  pages_found INTEGER DEFAULT 0,
  pages_crawled INTEGER DEFAULT 0,
  pages_updated INTEGER DEFAULT 0,
  pages_new INTEGER DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'running', -- running, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin access
CREATE POLICY "Admins can manage website_pages" ON website_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Admins can manage crawl_settings" ON crawl_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Admins can view crawl_logs" ON crawl_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.admin_role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_website_pages_url ON website_pages(url);
CREATE INDEX IF NOT EXISTS idx_website_pages_status ON website_pages(status);
CREATE INDEX IF NOT EXISTS idx_website_pages_last_crawled ON website_pages(last_crawled);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_crawl_id ON crawl_logs(crawl_id);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at DESC);