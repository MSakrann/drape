insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;

create policy "catalog public read"
on storage.objects for select
using (bucket_id = 'catalog');

create policy "catalog authenticated insert own prefix"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalog'
  and (storage.foldername(name))[1] = auth.uid()::text
);
