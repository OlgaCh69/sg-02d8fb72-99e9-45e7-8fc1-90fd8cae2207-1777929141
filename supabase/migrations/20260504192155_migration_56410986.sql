-- Drop existing conflicting tables if needed
DROP TABLE IF EXISTS visitor_memory CASCADE;
DROP TABLE IF EXISTS conversation_summaries CASCADE;
DROP TABLE IF EXISTS visitor_sessions CASCADE;
DROP TABLE IF EXISTS visitor_profiles CASCADE;
DROP TABLE IF EXISTS crm_sync_logs CASCADE;

-- A. visitor_profiles
CREATE TABLE visitor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  name TEXT,
  company TEXT,
  preferred_language TEXT DEFAULT 'en',
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'UNKNOWN' CHECK (lead_status IN ('HOT', 'WARM', 'COLD', 'UNKNOWN')),
  source TEXT,
  consent_memory BOOLEAN DEFAULT false,
  consent_analytics BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. visitor_sessions
CREATE TABLE visitor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  device TEXT,
  browser TEXT,
  country TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  time_on_site INTEGER DEFAULT 0,
  pages_visited JSONB DEFAULT '[]',
  trigger_type TEXT
);

-- Update conversations to reference new schema
ALTER TABLE conversations DROP COLUMN IF EXISTS visitor_id CASCADE;
ALTER TABLE conversations DROP COLUMN IF EXISTS session_id CASCADE;
ALTER TABLE conversations DROP COLUMN IF EXISTS user_profile_id CASCADE;
ALTER TABLE conversations ADD COLUMN visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD COLUMN session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN crm_synced BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN crm_sync_status TEXT;
ALTER TABLE conversations ADD COLUMN crm_sync_error TEXT;

-- C. conversation_summaries (new version)
CREATE TABLE conversation_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  summary TEXT,
  intent TEXT,
  service_interest TEXT,
  budget TEXT,
  timeline TEXT,
  urgency TEXT,
  objections TEXT,
  next_step TEXT,
  extracted_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- D. visitor_memory
CREATE TABLE visitor_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  confidence NUMERIC DEFAULT 0.8,
  source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. crm_sync_logs
CREATE TABLE crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  payload JSONB,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- G. analytics_events (update existing)
ALTER TABLE analytics_events DROP COLUMN IF EXISTS visitor_id CASCADE;
ALTER TABLE analytics_events DROP COLUMN IF EXISTS session_id CASCADE;
ALTER TABLE analytics_events ADD COLUMN visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE SET NULL;
ALTER TABLE analytics_events ADD COLUMN session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL;
ALTER TABLE analytics_events ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE analytics_events RENAME COLUMN event_type TO event_name;

-- E. website_pages to knowledge_sources
ALTER TABLE website_pages RENAME TO knowledge_sources;
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'website';
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE knowledge_sources ALTER COLUMN status DROP DEFAULT;
ALTER TABLE knowledge_sources RENAME COLUMN status TO approved;
ALTER TABLE knowledge_sources ALTER COLUMN approved TYPE BOOLEAN USING (approved = 'approved');
ALTER TABLE knowledge_sources ALTER COLUMN approved SET DEFAULT false;
ALTER TABLE knowledge_sources ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMP WITH TIME ZONE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitor_profiles_visitor_id ON visitor_profiles(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_profile_id ON visitor_sessions(visitor_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_visitor_profile_id ON conversations(visitor_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_visitor_profile_id ON conversation_summaries(visitor_profile_id);
CREATE INDEX IF NOT EXISTS idx_visitor_memory_visitor_profile_id ON visitor_memory(visitor_profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_profile_id ON analytics_events(visitor_profile_id);

-- RLS Policies (public access for widget)
ALTER TABLE visitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can manage visitor profiles" ON visitor_profiles FOR ALL USING (true);
CREATE POLICY "Public can manage visitor sessions" ON visitor_sessions FOR ALL USING (true);
CREATE POLICY "Public can manage visitor memory" ON visitor_memory FOR ALL USING (true);
CREATE POLICY "Public can manage conversation summaries" ON conversation_summaries FOR ALL USING (true);
CREATE POLICY "Public can view crm sync logs" ON crm_sync_logs FOR SELECT USING (true);
CREATE POLICY "Admins can manage crm sync logs" ON crm_sync_logs FOR INSERT WITH CHECK (true);