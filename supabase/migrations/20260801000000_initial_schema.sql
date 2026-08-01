-- Winora initial schema
-- Mirrors the data model in PLAN.md section 8.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  country text,
  role text not null default 'customer'
    check (role in ('customer', 'admin', 'support')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- security definer + fixed search_path so this can be called from RLS
-- policies (including on `profiles` itself) without recursive RLS checks.
-- Must be defined after `profiles` exists — a `language sql` function
-- body is parsed and planned against the catalog at creation time.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

create policy "profiles: read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- vendors — unused while Winora stays mono-marque, kept for phase 2
-- ---------------------------------------------------------------------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  payout_details jsonb,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.vendors enable row level security;

create policy "vendors: admin only" on public.vendors
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors (id) on delete set null,
  slug text not null unique,
  title text not null,
  description text,
  category text,
  price_xof integer not null check (price_xof >= 0),
  price_eur integer not null check (price_eur >= 0),
  cover_image text,
  preview_video_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_mystery boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: public read published" on public.products
  for select using (status = 'published' or public.is_admin());

create policy "products: admin insert" on public.products
  for insert with check (public.is_admin());

create policy "products: admin update" on public.products
  for update using (public.is_admin()) with check (public.is_admin());

create policy "products: admin delete" on public.products
  for delete using (public.is_admin());

create trigger set_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- product_files — never exposed directly to clients. An Edge Function
-- checks for a paid order and hands back a short-lived signed URL instead.
-- ---------------------------------------------------------------------

create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  file_type text not null,
  version text,
  checksum text,
  created_at timestamptz not null default now()
);

create index product_files_product_id_idx on public.product_files (product_id);

alter table public.product_files enable row level security;
-- Intentionally no policy for anon/authenticated: only service_role
-- (Edge Functions) and admins via the dashboard can read this table.

-- ---------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  billing_interval text not null
    check (billing_interval in ('month', 'quarter', 'year')),
  product_quota integer,
  created_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "plans: public read" on public.plans for select using (true);

create policy "plans: admin write" on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null
    check (status in ('active', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  provider_reference text,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions: read own or admin" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

-- Writes happen via the payment webhook handler / admin dashboard using
-- service_role, never directly by the client.

-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal integer not null check (subtotal >= 0),
  discount integer not null default 0 check (discount >= 0),
  total integer not null check (total >= 0),
  currency text not null,
  payment_provider text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

create policy "orders: read own or admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "orders: insert own" on public.orders
  for insert with check (auth.uid() = user_id);

-- Status transitions (paid/failed/refunded) happen only through the
-- Moneroo webhook handler using service_role — never a client update.

create trigger set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  unit_price integer not null check (unit_price >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.order_items enable row level security;

create policy "order_items: read via own order" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- downloads
-- ---------------------------------------------------------------------

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items (id) on delete cascade,
  signed_url_token text not null,
  expires_at timestamptz not null,
  download_count integer not null default 0
);

alter table public.downloads enable row level security;

create policy "downloads: read via own order" on public.downloads
  for select using (
    public.is_admin() or exists (
      select 1 from public.order_items
      join public.orders on orders.id = order_items.order_id
      where order_items.id = downloads.order_item_id
        and orders.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  is_verified_purchase boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);

alter table public.reviews enable row level security;

create policy "reviews: public read published" on public.reviews
  for select using (
    status = 'published' or auth.uid() = user_id or public.is_admin()
  );

-- Verified-purchase badge is guaranteed by construction: insertion is only
-- allowed if a paid order for this product already exists for this user.
create policy "reviews: insert if verified purchase" on public.reviews
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.order_items
      join public.orders on orders.id = order_items.order_id
      where order_items.product_id = reviews.product_id
        and orders.user_id = auth.uid()
        and orders.status = 'paid'
    )
  );

create policy "reviews: admin moderate" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- affiliates
-- ---------------------------------------------------------------------

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  code text not null unique,
  commission_rate numeric(5, 2) not null
    check (commission_rate >= 0 and commission_rate <= 100),
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now()
);

alter table public.affiliates enable row level security;

create policy "affiliates: read own or admin" on public.affiliates
  for select using (auth.uid() = profile_id or public.is_admin());

create policy "affiliates: admin write" on public.affiliates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- affiliate_clicks
-- ---------------------------------------------------------------------

create table public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  session_id text not null,
  converted boolean not null default false,
  created_at timestamptz not null default now()
);

create index affiliate_clicks_affiliate_id_idx on public.affiliate_clicks (affiliate_id);

alter table public.affiliate_clicks enable row level security;

create policy "affiliate_clicks: read own or admin" on public.affiliate_clicks
  for select using (
    public.is_admin() or exists (
      select 1 from public.affiliates
      where affiliates.id = affiliate_clicks.affiliate_id
        and affiliates.profile_id = auth.uid()
    )
  );

-- Inserts happen via the click-tracking endpoint using service_role.

-- ---------------------------------------------------------------------
-- affiliate_payouts
-- ---------------------------------------------------------------------

create table public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  amount integer not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz
);

alter table public.affiliate_payouts enable row level security;

create policy "affiliate_payouts: read own or admin" on public.affiliate_payouts
  for select using (
    public.is_admin() or exists (
      select 1 from public.affiliates
      where affiliates.id = affiliate_payouts.affiliate_id
        and affiliates.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- discount_codes — validated server-side at checkout, not read by clients
-- ---------------------------------------------------------------------

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent', 'fixed')),
  value integer not null check (value >= 0),
  max_uses integer,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.discount_codes enable row level security;

create policy "discount_codes: admin only" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- mystery_rotations
-- ---------------------------------------------------------------------

create table public.mystery_rotations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  week_start date not null,
  week_end date not null,
  reveal_at timestamptz not null
);

alter table public.mystery_rotations enable row level security;

create policy "mystery_rotations: public read" on public.mystery_rotations
  for select using (true);

create policy "mystery_rotations: admin write" on public.mystery_rotations
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- exchange_rates
-- ---------------------------------------------------------------------

create table public.exchange_rates (
  currency_code text primary key,
  rate_to_xof numeric(12, 4) not null,
  updated_at timestamptz not null default now()
);

alter table public.exchange_rates enable row level security;

create policy "exchange_rates: public read" on public.exchange_rates
  for select using (true);

create policy "exchange_rates: admin write" on public.exchange_rates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- notifications_log
-- ---------------------------------------------------------------------

create table public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  channel text not null check (channel in ('email', 'whatsapp')),
  template text not null,
  status text not null,
  sent_at timestamptz
);

alter table public.notifications_log enable row level security;

create policy "notifications_log: admin only" on public.notifications_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy "admin_audit_log: admin only" on public.admin_audit_log
  for all using (public.is_admin()) with check (public.is_admin());
