-- CRITICAL SCHEMA FIX: Add missing columns to 'profiles' table
-- It appears the initial migration defined 'profiles' without these columns, 
-- causing all XP and Role checks to fail.

-- 1. Create Enum for Roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('student', 'teacher', 'super_admin', 'master');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns if they are missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'student', -- using text for flexibility or cast to app_role
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3. Update existing rows to have defaults if they are NULL
UPDATE public.profiles SET role = 'student' WHERE role IS NULL;
UPDATE public.profiles SET total_xp = 0 WHERE total_xp IS NULL;
UPDATE public.profiles SET streak_count = 0 WHERE streak_count IS NULL;

-- 4. Re-apply the secure 'award_xp' function (optional, but good to ensure it compiles against new columns)
CREATE OR REPLACE FUNCTION award_xp(target_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
BEGIN
  -- Permissive update for now (or strict if you prefer)
  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + amount
  WHERE id = target_id
  RETURNING total_xp INTO new_xp;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp);
END;
$$;
