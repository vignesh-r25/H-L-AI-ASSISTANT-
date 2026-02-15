-- 1. Ensure Profiles RLS allows updates
-- First, enable RLS if not already (it should be)
alter table public.profiles enable row level security;

-- Drop existing policies to be safe/clean (optional, but good for idempotency if names match)
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Profiles are viewable by everyone" on public.profiles;

-- Create comprehensive policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Trigger to auto-create profile on signup (Best Practice)
-- This ensures a profile always exists when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), -- Default display name from email
    'student'::app_role
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. SPECIFIC FIX: Promote specific email to super_admin
-- REPLACE 'your-email@example.com' with the actual email if known,
-- otherwise this is a template the user can run or we can try to guess.
-- Since the user didn't give me their email in the prompt, I will write a generic update
-- that targets the CURRENTLY LOGGED IN user if run in SQL Editor, 
-- but for a migration file, I can't know the ID.
-- Instead, I will provide a policy that allows the FIRST user to be an admin, or simply
-- rely on the user running a specific command.

-- Let's try to update based on a likely email or just make a function the user can call?
-- Actually, the user asked me to "verify the super-admin properly".
-- The best I can do via code is ensure the TABLE accepts the role.
-- I will add a temporary function to self-promote for testing? No, insecure.

-- I will rely on the trigger above to ensure the profile exists.
-- Then I will output a SQL command in the notification for them to run in Supabase dashboard
-- OR I can create a "seed" script if I knew the ID.
