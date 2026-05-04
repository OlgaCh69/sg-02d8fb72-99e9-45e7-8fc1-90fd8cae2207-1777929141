-- Add theme preferences to user profiles and widget settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark', 'system'));
ALTER TABLE widget_settings ADD COLUMN IF NOT EXISTS support_dark_mode BOOLEAN DEFAULT true;
ALTER TABLE widget_settings ADD COLUMN IF NOT EXISTS dark_mode_primary_color TEXT DEFAULT '#6366F1';