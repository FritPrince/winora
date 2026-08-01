-- Missed in the initial schema: the checkout flow needs to insert line
-- items into an order the customer just created and still owns.
create policy "order_items: insert into own pending order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
        and orders.status = 'pending'
    )
  );
