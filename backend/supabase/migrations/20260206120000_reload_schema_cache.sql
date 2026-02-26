-- Fix for "Could not find column in schema cache" error
-- This manually ensures the column exists and forces PostgREST to reload its cache

-- 1. Ensure column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text;

-- 2. Force schema cache reload (PostgREST specific)
NOTIFY pgrst, 'reload config';
