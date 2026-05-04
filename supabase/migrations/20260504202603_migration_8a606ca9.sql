-- Prompt Management Tables
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('system', 'greeting', 'fallback', 'lead_capture', 'qualification', 'handoff', 'custom')),
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  prompt_content TEXT NOT NULL,
  system_instructions TEXT,
  temperature NUMERIC DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 500,
  variables JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, version_number)
);

CREATE TABLE IF NOT EXISTS prompt_test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES prompt_templates(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_input TEXT NOT NULL,
  expected_output TEXT,
  context_variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_case_id UUID REFERENCES prompt_test_cases(id) ON DELETE CASCADE,
  version_id UUID REFERENCES prompt_versions(id) ON DELETE CASCADE,
  actual_output TEXT,
  passed BOOLEAN,
  response_time INTEGER,
  tokens_used INTEGER,
  error_message TEXT,
  tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES prompt_versions(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  user_satisfaction NUMERIC,
  response_relevance NUMERIC,
  lead_conversion BOOLEAN,
  handoff_requested BOOLEAN,
  tokens_used INTEGER,
  response_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompt_ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL,
  description TEXT,
  version_a_id UUID REFERENCES prompt_versions(id),
  version_b_id UUID REFERENCES prompt_versions(id),
  traffic_split NUMERIC DEFAULT 0.5,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES prompt_versions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage prompts" ON prompt_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage versions" ON prompt_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage test cases" ON prompt_test_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can view test results" ON prompt_test_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "System can track performance" ON prompt_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admins can manage AB tests" ON prompt_ab_tests FOR ALL USING (true) WITH CHECK (true);

-- Create default system prompt template
INSERT INTO prompt_templates (name, description, category, is_active)
VALUES (
  'Default System Prompt',
  'Main AI assistant system prompt',
  'system',
  true
) ON CONFLICT DO NOTHING;

-- Create first version
INSERT INTO prompt_versions (
  template_id,
  version_number,
  prompt_content,
  system_instructions,
  is_published
)
SELECT 
  id,
  1,
  'You are an AI assistant for a business.

Your goals:
- Help website visitors clearly and professionally.
- Answer using approved website knowledge when available.
- Qualify leads naturally.
- Capture contact details when useful.
- Recommend relevant services/products.
- Avoid making up facts.
- If unsure, say you are not sure and offer to collect details for human follow-up.
- Keep answers concise, friendly, and conversion-focused.
- Do not ask the same qualification question if the answer already exists in memory.
- If the user is high intent, guide them toward contact, quote, booking, or human support.

Available context variables:
{{page_url}} - Current page URL
{{page_title}} - Current page title
{{visitor_name}} - Visitor name if known
{{lead_score}} - Lead score (0-100)
{{lead_status}} - HOT, WARM, COLD, UNKNOWN
{{previous_summary}} - Summary of previous conversations
{{user_memory}} - User preferences and qualifications
{{knowledge_chunks}} - Relevant knowledge base content

CURRENT CONTEXT:
Page URL: {{page_url}}
Page title: {{page_title}}

USER MEMORY:
{{user_memory}}

RECENT CHAT:
{{recent_messages}}

RELEVANT KNOWLEDGE:
{{knowledge_chunks}}

CURRENT USER MESSAGE:
{{user_message}}',
  'Keep responses under 120 words unless user asks for detail. Use knowledge base first. Personalize based on memory when relevant.',
  true
FROM prompt_templates
WHERE name = 'Default System Prompt'
ON CONFLICT (template_id, version_number) DO NOTHING;