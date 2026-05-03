-- Just ensure the profiles table has the right structure and RLS policies
-- Users will be created through the registration UI

-- Make sure all profile fields exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_role TEXT;

-- Ensure widget_settings table has a default row
INSERT INTO public.widget_settings (welcome_message, primary_color, is_enabled, position)
VALUES ('Hi! How can I help you today?', '#4F46E5', true, 'bottom-right')
ON CONFLICT DO NOTHING;

-- Add a test admin user profile (if auth user exists with this email)
-- This will only work if someone has signed up with admin@example.com
UPDATE public.profiles 
SET admin_role = 'admin', company_name = 'Admin Company'
WHERE email = 'admin@example.com';