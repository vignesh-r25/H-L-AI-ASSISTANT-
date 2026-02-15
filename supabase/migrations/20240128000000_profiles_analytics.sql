-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  email text,
  notifications boolean default true,
  email_updates boolean default false,
  theme text default 'system'
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Create trigger to create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create activity_logs table for analytics
create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  action_type text not null, -- 'view_material', 'create_flashcard', 'complete_quiz'
  metadata jsonb,
  created_at timestamp with time zone default now()
);

alter table public.activity_logs enable row level security;
create policy "Users can view own logs" on activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on activity_logs for insert with check (auth.uid() = user_id);
