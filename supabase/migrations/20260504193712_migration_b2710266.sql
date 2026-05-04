-- Add lead score history tracking
CREATE TABLE IF NOT EXISTS lead_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id) ON DELETE CASCADE,
  old_score INTEGER,
  new_score INTEGER,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_score_history_profile ON lead_score_history(visitor_profile_id);

-- Enable RLS
ALTER TABLE lead_score_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lead score history" ON lead_score_history FOR SELECT USING (true);
CREATE POLICY "Admins can insert lead score history" ON lead_score_history FOR INSERT WITH CHECK (true);