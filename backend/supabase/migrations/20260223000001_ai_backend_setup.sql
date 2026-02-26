/* 
  AI Integration & Usage Setup
  This script ensures all tables for AI features (materials, quizzes, flashcards, chat) are correctly configured.
*/


-- 1. AI Usage Logs (New)
-- Useful for debugging and monitoring AI response quality/costs
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    feature TEXT NOT NULL, -- e.g. 'chat', 'quiz_gen', 'summary'
    prompt TEXT,
    response TEXT,
    tokens_estimate INTEGER,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure materials table has summary fields
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='materials' AND column_name='summary') THEN
        ALTER TABLE public.materials ADD COLUMN summary TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='materials' AND column_name='key_takeaways') THEN
        ALTER TABLE public.materials ADD COLUMN key_takeaways JSONB;
    END IF;
END $$;

-- 3. RLS Policies for Usage Logs
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI logs" ON public.ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log AI usage" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Helper function to award XP for AI activities
CREATE OR REPLACE FUNCTION public.award_ai_xp(
    p_user_id UUID,
    p_activity TEXT,
    p_xp INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.gamification_logs (user_id, activity_type, xp_earned)
    VALUES (p_user_id, p_activity, p_xp);
    
    UPDATE public.profiles
    SET total_xp = total_xp + p_xp
    WHERE id = p_user_id;
END;
$$;

-- 5. Final Schema Refresh
NOTIFY pgrst, 'reload schema';
