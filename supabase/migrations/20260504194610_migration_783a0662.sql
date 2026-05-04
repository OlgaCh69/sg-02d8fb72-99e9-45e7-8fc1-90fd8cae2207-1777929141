-- 1. AI Quality Control Tables
CREATE TABLE IF NOT EXISTS answer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id),
  feedback_type TEXT CHECK (feedback_type IN ('correct', 'incorrect', 'partially_correct')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_confidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source_type TEXT,
  source_url TEXT,
  knowledge_match_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Appointment Booking
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  appointment_type TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 30,
  meeting_url TEXT,
  calendar_event_id TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Follow-up Automation
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  follow_up_type TEXT CHECK (follow_up_type IN ('email', 'whatsapp', 'sms')),
  subject TEXT,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'sent', 'failed')) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hot_lead_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  reminder_type TEXT DEFAULT 'unanswered_hot_lead',
  due_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'notified', 'dismissed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sales Playbooks
CREATE TABLE IF NOT EXISTS playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  intent_trigger TEXT,
  description TEXT,
  flow_steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playbook_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  playbook_id UUID REFERENCES playbooks(id),
  current_step INTEGER DEFAULT 0,
  step_data JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Spam & Abuse Protection
CREATE TABLE IF NOT EXISTS abuse_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  abuse_type TEXT CHECK (abuse_type IN ('spam', 'offensive', 'prompt_injection', 'rate_limit')),
  message_content TEXT,
  ip_address TEXT,
  user_agent TEXT,
  auto_flagged BOOLEAN DEFAULT false,
  admin_reviewed BOOLEAN DEFAULT false,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(visitor_id, endpoint, window_start)
);

-- 6. A/B Testing
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  variant_type TEXT CHECK (variant_type IN ('welcome_message', 'trigger_timing', 'lead_capture_timing')),
  variant_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  traffic_percentage NUMERIC(5,2) DEFAULT 50.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id TEXT NOT NULL,
  variant_id UUID REFERENCES ab_test_variants(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted BOOLEAN DEFAULT false,
  conversion_type TEXT,
  converted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(visitor_id, variant_id)
);

-- 7. Notifications
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT CHECK (notification_type IN ('hot_lead', 'booking', 'crm_sync_failed')),
  enabled BOOLEAN DEFAULT true,
  delivery_method TEXT CHECK (delivery_method IN ('email', 'webhook', 'whatsapp', 'slack')),
  delivery_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_type TEXT,
  visitor_profile_id UUID REFERENCES visitor_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  title TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Team Inbox
CREATE TABLE IF NOT EXISTS conversation_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  admin_id UUID REFERENCES profiles(id),
  note_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  tag_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update conversations table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS inbox_status TEXT CHECK (inbox_status IN ('open', 'pending', 'resolved', 'archived')) DEFAULT 'open';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);

-- 9. Business Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_working_day BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. File Uploads
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

-- 11. Security & Audit
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_role TEXT CHECK (admin_role IN ('owner', 'admin', 'agent', 'viewer')) DEFAULT 'viewer';

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT,
  resource_type TEXT,
  resource_id TEXT,
  changes JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Performance - Knowledge Cache
CREATE TABLE IF NOT EXISTS knowledge_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  query_hash TEXT UNIQUE NOT NULL,
  cached_results JSONB DEFAULT '[]',
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Reporting
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  total_chats INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  hot_leads INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  top_questions JSONB DEFAULT '[]',
  failed_crm_syncs INTEGER DEFAULT 0,
  best_converting_pages JSONB DEFAULT '[]',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Testing
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_name TEXT,
  test_mode BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  test_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_confidence_score ON message_confidence(confidence_score);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_playbook_priority ON playbooks(priority DESC, is_active);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_flagged ON abuse_reports(auto_flagged, admin_reviewed);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(visitor_id, endpoint, window_start);
CREATE INDEX IF NOT EXISTS idx_ab_assignments ON ab_test_assignments(visitor_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pending ON notifications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_inbox ON conversations(inbox_status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_cache_hash ON knowledge_cache(query_hash);

-- RLS Policies
ALTER TABLE answer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE hot_lead_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for all new tables
CREATE POLICY "Admins can manage answer feedback" ON answer_feedback FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view message confidence" ON message_confidence FOR SELECT USING (true);
CREATE POLICY "Admins can manage appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage follow ups" ON follow_ups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage reminders" ON hot_lead_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage playbooks" ON playbooks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view playbook executions" ON playbook_executions FOR SELECT USING (true);
CREATE POLICY "Admins can manage abuse reports" ON abuse_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage blocked IPs" ON blocked_ips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can insert rate limits" ON rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage AB tests" ON ab_test_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public can view AB assignments" ON ab_test_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage notification settings" ON notification_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Admins can manage assignments" ON conversation_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage notes" ON conversation_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage tags" ON conversation_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage business hours" ON business_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage uploads" ON uploaded_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public can read knowledge cache" ON knowledge_cache FOR SELECT USING (true);
CREATE POLICY "Admins can view reports" ON weekly_reports FOR SELECT USING (true);
CREATE POLICY "Admins can manage test sessions" ON test_sessions FOR ALL USING (true) WITH CHECK (true);