-- Order status is otherwise only touched by service_role (webhook,
-- checkout action) — this adds the one legitimate client-side path:
-- an authenticated admin issuing a refund from /admin/commandes.
create policy "orders: admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
