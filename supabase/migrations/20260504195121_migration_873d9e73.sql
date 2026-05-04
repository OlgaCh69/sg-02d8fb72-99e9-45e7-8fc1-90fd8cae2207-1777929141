ALTER TABLE widget_settings ADD COLUMN IF NOT EXISTS allow_file_uploads BOOLEAN DEFAULT true;
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);