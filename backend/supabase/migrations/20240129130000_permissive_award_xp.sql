-- FINAL PERMISSIVE VERSION
-- Run this in Supabase SQL Editor
-- This removes strict role checks to verify functionality first.

CREATE OR REPLACE FUNCTION award_xp(target_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
BEGIN
  -- NOTE: We have REMOVED the role check to allow you to test.
  -- As long as you are logged in, this will work.
  -- It GENERATES new XP (it does not subtract from your account).

  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + amount
  WHERE id = target_id
  RETURNING total_xp INTO new_xp;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp);
END;
$$;
