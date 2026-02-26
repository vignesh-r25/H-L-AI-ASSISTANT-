-- 1. EXTEND LOGGING: Update award_xp to log for the graph
CREATE OR REPLACE FUNCTION award_xp(target_id UUID, amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
BEGIN
  UPDATE public.profiles
  SET 
    total_xp = GREATEST(0, COALESCE(total_xp, 0) + amount),
    updated_at = NOW()
  WHERE id = target_id
  RETURNING total_xp INTO new_xp;

  -- Log every XP gain/loss for the "Intellectual Flow" graph
  INSERT INTO public.gamification_logs (user_id, activity_type, xp_earned, created_at)
  VALUES (target_id, CASE WHEN amount > 0 THEN 'manual_award' ELSE 'manual_reduction' END, amount, NOW());

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp);
END;
$$;

-- 2. NEW PENALTY SYSTEM: Deduct XP and Streak
CREATE OR REPLACE FUNCTION deduct_streak_and_xp(target_id UUID, xp_amount INT, streak_deduction INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_xp INT;
  new_streak INT;
BEGIN
  UPDATE public.profiles
  SET 
    total_xp = GREATEST(0, COALESCE(total_xp, 0) - xp_amount),
    streak_count = GREATEST(0, COALESCE(streak_count, 0) - streak_deduction),
    updated_at = NOW()
  WHERE id = target_id
  RETURNING total_xp, streak_count INTO new_xp, new_streak;

  -- Log the special focus penalty for analytics
  INSERT INTO public.gamification_logs (user_id, activity_type, xp_earned, multiplier_applied)
  VALUES (target_id, 'focus_broken_penalty', -xp_amount, FALSE);

  RETURN jsonb_build_object('success', true, 'new_xp', new_xp, 'new_streak', new_streak);
END;
$$;
