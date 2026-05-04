CREATE TABLE IF NOT EXISTS public.channel_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  webhook_url TEXT,
  access_token TEXT,
  phone_number_id TEXT,
  verify_token TEXT,
  app_secret TEXT,
  page_id TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.channel_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_all_channel_configs" ON public.channel_configs;
CREATE POLICY "auth_all_channel_configs" ON public.channel_configs
  FOR ALL USING (auth.uid() IS NOT NULL);