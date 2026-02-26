-- Create materials table
create table public.materials (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  title text not null,
  type text not null check (type in ('pdf', 'youtube')),
  url text not null,
  size text null,
  user_id uuid not null default auth.uid (),
  constraint materials_pkey primary key (id),
  constraint materials_user_id_fkey foreign KEY (user_id) references auth.users (id)
);

-- Enable RLS
alter table public.materials enable row level security;

-- Policies
create policy "Users can view their own materials" on public.materials
  for select using (auth.uid() = user_id);

create policy "Users can insert their own materials" on public.materials
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own materials" on public.materials
  for delete using (auth.uid() = user_id);

-- Storage bucket for materials
insert into storage.buckets (id, name, public) values ('materials', 'materials', true);

create policy "Authenticated users can upload materials" on storage.objects
  for insert with check ( bucket_id = 'materials' and auth.role() = 'authenticated' );

create policy "Authenticated users can view materials" on storage.objects
  for select using ( bucket_id = 'materials' and auth.role() = 'authenticated' );
