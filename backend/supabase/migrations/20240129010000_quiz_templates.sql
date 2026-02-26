-- Create quiz_templates table
create table public.quiz_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  questions jsonb not null, -- Array of { question, options, correct_answer }
  created_by uuid references public.profiles(id) not null,
  is_published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS
alter table public.quiz_templates enable row level security;

create policy "Quiz templates are viewable by everyone"
  on public.quiz_templates for select
  using ( true );

create policy "Quiz templates are insertable by teachers and admins"
  on public.quiz_templates for insert
  with check (
    public.has_role('teacher', auth.uid()) or
    public.has_role('super_admin', auth.uid()) or
    public.has_role('master', auth.uid())
  );

create policy "Quiz templates are updateable by creators or admins"
  on public.quiz_templates for update
  using (
    auth.uid() = created_by or
    public.has_role('super_admin', auth.uid()) or
    public.has_role('master', auth.uid())
  );
