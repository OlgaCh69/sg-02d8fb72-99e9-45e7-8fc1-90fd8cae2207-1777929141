-- Add fields for context awareness and triggers
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS page_title TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS trigger_type TEXT; -- time_based, scroll_based, exit_intent, manual

-- Add fields for human handover
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS human_handover_requested BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS human_handover_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES profiles(id);

-- Create trigger_settings table
CREATE TABLE IF NOT EXISTS trigger_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enabled BOOLEAN DEFAULT false,
  trigger_type TEXT NOT NULL, -- time_delay, scroll_percentage, exit_intent
  trigger_value INTEGER, -- seconds for time_delay, percentage for scroll
  page_match_pattern TEXT, -- URL pattern to match (e.g., /pricing, /contact)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for trigger_settings
ALTER TABLE trigger_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read trigger settings" ON trigger_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage trigger settings" ON trigger_settings FOR ALL USING (true);

-- Create page_rules table for context-aware responses
CREATE TABLE IF NOT EXISTS page_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_pattern TEXT NOT NULL, -- URL pattern (e.g., /pricing, /services/*)
  custom_welcome_message TEXT,
  custom_tone TEXT, -- sales, support, neutral
  priority_questions TEXT[], -- Array of priority questions to ask
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for page_rules
ALTER TABLE page_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read page rules" ON page_rules FOR SELECT USING (enabled = true);
CREATE POLICY "Admins can manage page rules" ON page_rules FOR ALL USING (true);