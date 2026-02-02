-- Align 'quizzes' table with QuizManager requirements
-- User created 'quizzes' with: id, created_at, title, description, xp_reward, teacher_id
-- We need to add: questions (json), is_published (boolean)

ALTER TABLE public.quizzes 
ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Ensure RLS is enabled (User already did this, but good to be sure)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Policy for Students to Read Published Quizzes
CREATE POLICY "Students can read published quizzes" ON public.quizzes
FOR SELECT
USING (is_published = true);

-- Policy for Teachers/Admins to do everything
CREATE POLICY "Teachers and Admins can manage quizzes" ON public.quizzes
FOR ALL
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'super_admin')
);
