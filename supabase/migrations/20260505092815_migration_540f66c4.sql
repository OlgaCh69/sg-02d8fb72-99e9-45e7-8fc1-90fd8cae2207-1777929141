-- Create ai_config table for customizing bot behavior
CREATE TABLE IF NOT EXISTS public.ai_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful AI assistant for a business. Answer questions professionally and concisely.',
  tone VARCHAR(50) DEFAULT 'professional',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 200,
  response_style VARCHAR(50) DEFAULT 'balanced',
  personality_traits TEXT[],
  custom_instructions TEXT,
  fallback_message TEXT DEFAULT 'I''m not sure about that. Would you like to speak with a human team member?',
  greeting_message TEXT DEFAULT 'Hi! How can I help you today?',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default config
INSERT INTO public.ai_config (
  system_prompt,
  tone,
  temperature,
  max_tokens,
  response_style,
  personality_traits,
  custom_instructions,
  fallback_message,
  greeting_message
) VALUES (
  'You are O.N.E.Tech''s AI Revenue Assistant. You help businesses capture and convert leads through intelligent conversations. Be helpful, professional, and revenue-focused. Keep responses concise (40-120 words). Ask qualifying questions when appropriate.',
  'professional',
  0.7,
  200,
  'balanced',
  ARRAY['helpful', 'professional', 'concise', 'revenue-focused'],
  'Focus on understanding the visitor''s business needs and goals. Qualify leads by asking about their business type, current challenges, and timeline.',
  'I''m not entirely sure about that. Would you like me to connect you with our team for a detailed answer?',
  'Hi! Want to see how we can help you capture more leads automatically?'
) ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_ai_config" ON public.ai_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_ai_config" ON public.ai_config
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_insert_ai_config" ON public.ai_config
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);