-- Add live takeover fields to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS is_live_takeover BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS taken_over_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS taken_over_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE;

-- Add admin sender tracking to messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sent_by_admin UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'ai' CHECK (message_type IN ('ai', 'admin', 'user', 'system'));

-- Create live takeover log table
CREATE TABLE IF NOT EXISTS live_takeover_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('takeover', 'release', 'message_sent')),
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active conversations query
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(status, is_live_takeover) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_conversations_takeover ON conversations(is_live_takeover, taken_over_by) WHERE is_live_takeover = true;

-- RLS policies for live takeover
ALTER TABLE live_takeover_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view takeover logs" ON live_takeover_logs FOR SELECT USING (true);
CREATE POLICY "Admins can insert takeover logs" ON live_takeover_logs FOR INSERT WITH CHECK (true);

-- Update messages policy to allow admin messages
DROP POLICY IF EXISTS "Anyone can read messages" ON messages;
CREATE POLICY "Anyone can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Admins can insert messages" ON messages FOR INSERT WITH CHECK (true);

COMMENT ON COLUMN conversations.is_live_takeover IS 'Whether an admin has taken over this conversation';
COMMENT ON COLUMN conversations.taken_over_by IS 'Admin user ID who took over the conversation';
COMMENT ON COLUMN messages.sent_by_admin IS 'Admin user ID if message was sent by admin';
COMMENT ON COLUMN messages.message_type IS 'Type of message: ai, admin, user, or system';