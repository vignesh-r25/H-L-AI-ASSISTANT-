-- Enable Teachers and Admins to update user profiles (for XP/Streak management)

-- Policy: "Teachers and Admins can update any profile"
CREATE POLICY "Teachers and Admins can update any profile" ON public.profiles
FOR UPDATE
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'super_admin', 'master')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('teacher', 'super_admin', 'master')
);

-- Note: Users can already update their own profile via "Users can update own profile" policy
