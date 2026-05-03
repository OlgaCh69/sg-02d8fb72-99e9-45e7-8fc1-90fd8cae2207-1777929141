-- Add human handover tracking
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS handover_requested BOOLEAN DEFAULT false;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS handover_requested_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS handover_reason TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Add lead qualification fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_interest TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('high', 'medium', 'low'));

-- Update conversations to track needs summary flag
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS needs_summary BOOLEAN DEFAULT true;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMP WITH TIME ZONE;