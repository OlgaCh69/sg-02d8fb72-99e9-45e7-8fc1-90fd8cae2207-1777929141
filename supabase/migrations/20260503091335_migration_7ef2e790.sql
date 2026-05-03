-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_role text DEFAULT 'user';

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  page_url text,
  referrer text,
  device text,
  browser text,
  country text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'abandoned')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  timestamp timestamp with time zone DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  name text,
  email text NOT NULL,
  phone text,
  company text,
  inquiry_type text,
  lead_score integer DEFAULT 0,
  crm_synced boolean DEFAULT false,
  crm_sync_error text,
  captured_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'chat_opened', 'message_sent', 'lead_captured', 'crm_synced', 'session_start')),
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  page_url text,
  referrer text,
  device text,
  browser text,
  country text,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamp with time zone DEFAULT now()
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- CRM settings table
CREATE TABLE IF NOT EXISTS crm_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url text NOT NULL,
  api_key text,
  provider text DEFAULT 'custom',
  field_mappings jsonb DEFAULT '{}'::jsonb,
  headers jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Widget settings table
CREATE TABLE IF NOT EXISTS widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  welcome_message text DEFAULT 'Hi! How can I help you today?',
  primary_color text DEFAULT '#4F46E5',
  button_text text DEFAULT 'Chat with us',
  lead_capture_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);

-- RLS Policies

-- Conversations: admin full access, public insert only
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all conversations" ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can insert conversations" ON conversations FOR INSERT WITH CHECK (true);

-- Messages: admin full access, public insert only
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Leads: admin full access, public insert only
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view all leads" ON leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Admin can update leads" ON leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);

-- Analytics events: admin full access, public insert only
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view analytics" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can insert events" ON analytics_events FOR INSERT WITH CHECK (true);

-- Knowledge base: admin full access, public read active only
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage knowledge base" ON knowledge_base FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can read active entries" ON knowledge_base FOR SELECT USING (is_active = true);

-- CRM settings: admin only
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage CRM settings" ON crm_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);

-- Widget settings: admin full access, public read
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage widget settings" ON widget_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.admin_role = 'admin')
);
CREATE POLICY "Public can read widget settings" ON widget_settings FOR SELECT USING (true);

-- Seed initial data
INSERT INTO knowledge_base (question, answer, category) VALUES
  ('What are your business hours?', 'We are available Monday to Friday, 9 AM to 6 PM EST. For urgent matters outside business hours, please leave a message and we''ll get back to you within 24 hours.', 'general'),
  ('How can I contact support?', 'You can reach our support team via this chat, email at support@example.com, or call us at (555) 123-4567.', 'support'),
  ('What services do you offer?', 'We offer a comprehensive range of services including consulting, implementation, and ongoing support. Please tell me more about your specific needs so I can provide detailed information.', 'services'),
  ('Do you offer a free trial?', 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.', 'pricing'),
  ('What is your pricing?', 'Our pricing varies based on your needs and team size. I can connect you with our sales team to discuss a custom plan that fits your requirements.', 'pricing')
ON CONFLICT DO NOTHING;

-- Insert default widget settings
INSERT INTO widget_settings (id, welcome_message, primary_color) VALUES
  (gen_random_uuid(), 'Hi! How can I help you today?', '#4F46E5')
ON CONFLICT DO NOTHING;