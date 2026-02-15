-- DEBUG VERSION: Permissions check removed
-- Run this to verify if the connection works at all.

CREATE OR REPLACE FUNCTION award_xp(target_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
BEGIN
  -- DEBUG: Skipping permission check to isolate the issue
  -- IF executor_role ... THEN RAISE EXCEPTION ... END IF;

  -- Update XP
  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + amount
  WHERE id = target_id
  RETURNING total_xp INTO new_xp;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp);
END;
$$;
