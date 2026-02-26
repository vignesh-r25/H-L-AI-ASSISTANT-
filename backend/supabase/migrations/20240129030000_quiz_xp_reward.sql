-- Add xp_reward column to quiz_templates
ALTER TABLE public.quiz_templates 
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 100;

-- Optional: Add policy updates if needed, but existing ones should cover the new column implicitly for owners/admins
