-- Create user_profiles table to unify users across channels and sessions
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  phone TEXT,
  full_name TEXT,
  visitor_id TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_conversations INT DEFAULT 0,
  lead_status TEXT CHECK (lead_status IN ('hot', 'warm', 'cold', 'none')) DEFAULT 'none',
  lead_score INT DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation_summaries table for efficient memory retrieval
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  intent TEXT,
  key_points JSONB DEFAULT '[]',
  extracted_data JSONB DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_attributes table for flexible key-value storage
CREATE TABLE IF NOT EXISTS user_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_profile_id, attribute_key)
);

-- Link conversations to user_profiles
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add memory consent tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS memory_consent BOOLEAN DEFAULT false;

-- Add conversation summary trigger
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS needs_summary BOOLEAN DEFAULT true;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_visitor_id ON user_profiles(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user ON conversation_summaries(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_conversation ON conversation_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_attributes_profile ON user_attributes(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_profile ON conversations(user_profile_id);

-- RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Public can create user profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (true);

-- RLS policies for conversation_summaries
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view summaries" ON conversation_summaries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Public can create summaries" ON conversation_summaries
  FOR INSERT WITH CHECK (true);

-- RLS policies for user_attributes
ALTER TABLE user_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view attributes" ON user_attributes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Public can manage attributes" ON user_attributes
  FOR ALL USING (true);