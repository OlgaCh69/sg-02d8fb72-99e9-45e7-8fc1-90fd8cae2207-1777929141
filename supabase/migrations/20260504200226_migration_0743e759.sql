-- Create knowledge cache table for performance
CREATE TABLE IF NOT EXISTS knowledge_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  query_hash TEXT NOT NULL UNIQUE,
  cached_results JSONB NOT NULL,
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_knowledge_cache_hash ON knowledge_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_knowledge_cache_expires ON knowledge_cache(expires_at);

ALTER TABLE knowledge_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cache" ON knowledge_cache FOR SELECT USING (true);
CREATE POLICY "System can manage cache" ON knowledge_cache FOR ALL USING (true) WITH CHECK (true);

-- Add widget lazy loading script
CREATE TABLE IF NOT EXISTS widget_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lazy_load_enabled BOOLEAN DEFAULT true,
  cache_ttl_hours INTEGER DEFAULT 24,
  max_cache_size_mb INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO widget_performance (lazy_load_enabled, cache_ttl_hours) VALUES (true, 24) ON CONFLICT DO NOTHING;

ALTER TABLE widget_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read performance settings" ON widget_performance FOR SELECT USING (true);
CREATE POLICY "Admins can manage performance" ON widget_performance FOR ALL USING (true) WITH CHECK (true);