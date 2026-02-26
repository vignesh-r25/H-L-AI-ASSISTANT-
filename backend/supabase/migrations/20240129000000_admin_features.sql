-- Update app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create announcements table
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.announcements enable row level security;

-- Policies
create policy "Announcements are viewable by everyone"
  on public.announcements for select
  using ( true );

create policy "Announcements are insertable by teachers and admins"
  on public.announcements for insert
  with check (
    public.has_role('teacher', auth.uid()) or
    public.has_role('super_admin', auth.uid()) or
    public.has_role('master', auth.uid()) -- keeping master for backward compatibility if needed
  );

create policy "Announcements are updateable by creators or admins"
  on public.announcements for update
  using (
    auth.uid() = created_by or
    public.has_role('super_admin', auth.uid()) or
    public.has_role('master', auth.uid())
  );

create policy "Announcements are deletable by creators or admins"
  on public.announcements for delete
  using (
    auth.uid() = created_by or
    public.has_role('super_admin', auth.uid()) or
    public.has_role('master', auth.uid())
  );

-- Update has_role function to handle multiple roles if needed, 
-- but the simple check in policies above uses distinct calls.
-- Let's ensure has_role exists and works.
-- Existing has_role:
-- create function public.has_role(_role app_role, _user_id uuid) returns boolean as $$
--   select exists (
--     select 1 from public.profiles
--     where id = _user_id and role = _role
--   );
-- $$ language sql security definer;
