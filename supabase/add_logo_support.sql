-- Add logo_url column to cafes
alter table public.cafes add column logo_url text;

-- Create storage bucket for logos
insert into storage.buckets (id, name, public) values ('cafe-logos', 'cafe-logos', true);

-- Allow public access to view logos
create policy "Logos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'cafe-logos' );

-- Allow authenticated users to upload logos
create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check (
    bucket_id = 'cafe-logos' and auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads (optional, but good for replacing)
create policy "Users can update their uploaded logos"
  on storage.objects for update
  using ( bucket_id = 'cafe-logos' and auth.role() = 'authenticated' );

-- Allow users to delete their own uploads
create policy "Users can delete their uploaded logos"
  on storage.objects for delete
  using ( bucket_id = 'cafe-logos' and auth.role() = 'authenticated' );
