-- Remote Procedure Call (RPC) to secure XP awarding
-- IMPROVED: Case-insensitive role check
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION award_xp(target_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
DECLARE
  executor_role TEXT;
  new_xp INT;
BEGIN
  -- Get the role of the user trying to call this function
  SELECT role INTO executor_role FROM public.profiles WHERE id = auth.uid();

  -- Check permissions (Case Insensitive)
  IF LOWER(executor_role) NOT IN ('teacher', 'super_admin', 'master', 'super-admin') THEN
    RAISE EXCEPTION 'Unauthorized: Your role (%) is not allowed to award XP.', executor_role;
  END IF;

  -- Perform the update
  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + amount
  WHERE id = target_id
  RETURNING total_xp INTO new_xp;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp);
END;
$$;
