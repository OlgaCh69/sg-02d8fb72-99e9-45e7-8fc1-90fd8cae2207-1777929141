-- Create proactive_triggers table for Triggers page
CREATE TABLE IF NOT EXISTS public.proactive_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('time_delay', 'scroll_depth', 'exit_intent', 'page_view')),
  trigger_value INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.proactive_triggers ENABLE ROW LEVEL SECURITY;

-- Auth users can do everything
CREATE POLICY "auth_all_proactive_triggers" ON public.proactive_triggers
  FOR ALL USING (auth.uid() IS NOT NULL);