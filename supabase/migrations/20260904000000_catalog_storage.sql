insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 10485760, array['image/jpeg']::text[])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "catalog public read" on storage.objects;
drop policy if exists "catalog authenticated select own prefix" on storage.objects;
drop policy if exists "catalog authenticated insert own prefix" on storage.objects;

create policy "catalog authenticated select own prefix"
on storage.objects for select
to authenticated
using (
  bucket_id = 'catalog'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "catalog authenticated insert own prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalog'
  and (storage.foldername(name))[1] = auth.uid()::text
);
