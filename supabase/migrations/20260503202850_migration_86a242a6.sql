-- Add channel field to conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'website';

-- Create social_profiles table for user profiles from social channels
CREATE TABLE IF NOT EXISTS social_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL, -- instagram, facebook, whatsapp
  platform_user_id TEXT NOT NULL UNIQUE,
  name TEXT,
  username TEXT,
  profile_pic_url TEXT,
  phone TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create channel_settings table for API credentials
CREATE TABLE IF NOT EXISTS channel_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL UNIQUE, -- instagram, facebook, whatsapp
  is_enabled BOOLEAN DEFAULT false,
  access_token TEXT,
  app_secret TEXT,
  verify_token TEXT,
  phone_number_id TEXT, -- for WhatsApp
  business_account_id TEXT, -- for Instagram/Facebook
  webhook_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_social_profiles_platform ON social_profiles(platform);
CREATE INDEX IF NOT EXISTS idx_social_profiles_platform_user_id ON social_profiles(platform_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);

-- RLS policies for social_profiles
ALTER TABLE social_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all social profiles" ON social_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.admin_role = 'admin'
    )
  );

CREATE POLICY "Service can insert social profiles" ON social_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update social profiles" ON social_profiles
  FOR UPDATE USING (true);

-- RLS policies for channel_settings
ALTER TABLE channel_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage channel settings" ON channel_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.admin_role = 'admin'
    )
  );

-- Add initial channel settings
INSERT INTO channel_settings (channel, is_enabled) 
VALUES 
  ('instagram', false),
  ('facebook', false),
  ('whatsapp', false)
ON CONFLICT (channel) DO NOTHING;