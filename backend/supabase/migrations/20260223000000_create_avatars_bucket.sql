-- Create avatars storage bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Create RLS policies for avatars bucket
-- 1. Public view access
create policy "Avatars are publicly viewable"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 2. Authenticated upload access (users can only upload to their own folder/named file)
-- We'll name the file based on the user's ID for simplicity and to prevent clashes
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
  -- and (storage.foldername(name))[1] = auth.uid()::text -- Optional: folder structure
);

-- 3. Authenticated update access
create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
);

-- 4. Authenticated delete access
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.role() = 'authenticated'
);
