-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'master');

-- Create profiles table with gamification fields
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  role app_role DEFAULT 'student',
  total_xp INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  last_login_date DATE DEFAULT CURRENT_DATE,
  multiplier_active BOOLEAN DEFAULT FALSE,
  multiplier_expires_at TIMESTAMPTZ,
  deep_learn_unlocked BOOLEAN DEFAULT FALSE,
  custom_flashcards_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table for RBAC (separate from profiles as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create materials table for PDFs and videos
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('pdf', 'video', 'youtube', 'image')),
  content_url TEXT,
  summary TEXT,
  raw_transcript TEXT,
  key_takeaways JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  last_reviewed TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  score INTEGER,
  max_score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gamification_logs table
CREATE TABLE public.gamification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  multiplier_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  duration_minutes INTEGER,
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Create chat_messages table for AI conversations
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is master
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'master'
  )
$$;

-- Update streak and XP function
CREATE OR REPLACE FUNCTION public.update_streak_and_xp(
  p_user_id UUID,
  p_activity_type TEXT,
  p_base_xp INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_final_xp INTEGER;
  v_new_streak INTEGER;
  v_multiplier_active BOOLEAN;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  
  -- Check if multiplier has expired
  IF v_profile.multiplier_active AND v_profile.multiplier_expires_at < NOW() THEN
    v_multiplier_active := FALSE;
    UPDATE public.profiles SET multiplier_active = FALSE WHERE id = p_user_id;
  ELSE
    v_multiplier_active := v_profile.multiplier_active;
  END IF;
  
  -- Calculate streak
  IF v_profile.last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := v_profile.streak_count + 1;
  ELSIF v_profile.last_login_date = CURRENT_DATE THEN
    v_new_streak := v_profile.streak_count;
  ELSE
    v_new_streak := 1;
  END IF;
  
  -- Check for 7-day streak multiplier
  IF v_new_streak >= 7 AND NOT v_multiplier_active THEN
    v_multiplier_active := TRUE;
    UPDATE public.profiles 
    SET multiplier_active = TRUE, 
        multiplier_expires_at = NOW() + INTERVAL '24 hours'
    WHERE id = p_user_id;
  END IF;
  
  -- Calculate final XP with multiplier
  IF v_multiplier_active THEN
    v_final_xp := FLOOR(p_base_xp * 2.5);
  ELSE
    v_final_xp := p_base_xp;
  END IF;
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    total_xp = total_xp + v_final_xp,
    streak_count = v_new_streak,
    last_login_date = CURRENT_DATE,
    deep_learn_unlocked = CASE WHEN total_xp + v_final_xp >= 1000 THEN TRUE ELSE deep_learn_unlocked END,
    custom_flashcards_unlocked = CASE WHEN total_xp + v_final_xp >= 500 THEN TRUE ELSE custom_flashcards_unlocked END,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the activity
  INSERT INTO public.gamification_logs (user_id, activity_type, xp_earned, multiplier_applied)
  VALUES (p_user_id, p_activity_type, v_final_xp, v_multiplier_active);
  
  RETURN v_final_xp;
END;
$$;

-- Create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_master());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for materials
CREATE POLICY "Users can view own materials" ON public.materials
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create materials" ON public.materials
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own materials" ON public.materials
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own materials" ON public.materials
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Masters can view all materials" ON public.materials
  FOR SELECT USING (public.is_master());

-- RLS Policies for flashcards
CREATE POLICY "Users can view own flashcards" ON public.flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create flashcards" ON public.flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards" ON public.flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards" ON public.flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for quizzes
CREATE POLICY "Users can view own quizzes" ON public.quizzes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for gamification_logs
CREATE POLICY "Users can view own logs" ON public.gamification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs" ON public.gamification_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);