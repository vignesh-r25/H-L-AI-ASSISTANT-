-- Focus Chamber Mechanics

-- Function to handle penalties (Lock-In failure)
CREATE OR REPLACE FUNCTION handle_lockin_penalty(user_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_xp INT;
  new_xp INT;
BEGIN
  -- Get current XP
  SELECT total_xp INTO current_xp FROM public.profiles WHERE id = user_id;
  
  -- Calculate new XP (prevent negative XP if desired, or allow it for high stakes)
  -- User requested high stakes, so we allow dropping, but maybe floor at 0 to avoid bugs?
  -- "3 strikes = -50 XP".
  new_xp := GREATEST(0, COALESCE(current_xp, 0) - amount);

  UPDATE public.profiles
  SET total_xp = new_xp
  WHERE id = user_id;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp, 'penalty', amount);
END;
$$;

-- Function to handle success (Victory)
CREATE OR REPLACE FUNCTION reward_focus_success(user_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
BEGIN
  UPDATE public.profiles
  SET total_xp = COALESCE(total_xp, 0) + amount
  WHERE id = user_id
  RETURNING total_xp INTO new_xp;

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp, 'reward', amount);
END;
$$;
