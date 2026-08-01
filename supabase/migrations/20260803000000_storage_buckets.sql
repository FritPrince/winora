-- product-covers: public bucket for catalogue images.
-- product-files: private bucket for the actual digital deliverables —
-- never readable by clients directly, only via short-lived signed URLs
-- generated server-side after checking for a paid order (see
-- src/app/api/telechargement/[orderItemId]/route.ts).

insert into storage.buckets (id, name, public)
values
  ('product-covers', 'product-covers', true),
  ('product-files', 'product-files', false)
on conflict (id) do nothing;

create policy "product-covers: public read" on storage.objects
  for select using (bucket_id = 'product-covers');

create policy "product-covers: admin write" on storage.objects
  for insert with check (bucket_id = 'product-covers' and public.is_admin());

create policy "product-covers: admin update" on storage.objects
  for update using (bucket_id = 'product-covers' and public.is_admin());

create policy "product-covers: admin delete" on storage.objects
  for delete using (bucket_id = 'product-covers' and public.is_admin());

-- No select policy at all for product-files: admins manage it through
-- the regular authenticated client (still gated by is_admin() below),
-- but reading a file's bytes to build a signed URL always goes through
-- service_role, never a customer session.
create policy "product-files: admin write" on storage.objects
  for insert with check (bucket_id = 'product-files' and public.is_admin());

create policy "product-files: admin update" on storage.objects
  for update using (bucket_id = 'product-files' and public.is_admin());

create policy "product-files: admin delete" on storage.objects
  for delete using (bucket_id = 'product-files' and public.is_admin());

create policy "product-files: admin read" on storage.objects
  for select using (bucket_id = 'product-files' and public.is_admin());
