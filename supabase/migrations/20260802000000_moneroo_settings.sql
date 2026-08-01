-- Singleton settings row for the Moneroo integration, configurable from
-- the admin UI instead of environment variables — lets the sandbox key
-- be used safely today and the live key added later without a redeploy.
-- Never selectable by non-admins: read only via service_role during
-- checkout/webhook processing (see src/lib/moneroo.ts), or by an admin
-- through the RLS-gated settings page.

create table public.moneroo_settings (
  id boolean primary key default true check (id = true),
  mode text not null default 'sandbox' check (mode in ('sandbox', 'live')),
  sandbox_secret_key text,
  live_secret_key text,
  webhook_secret text,
  updated_at timestamptz not null default now()
);

insert into public.moneroo_settings (id) values (true);

alter table public.moneroo_settings enable row level security;

create policy "moneroo_settings: admin only" on public.moneroo_settings
  for all using (public.is_admin()) with check (public.is_admin());

create trigger set_updated_at before update on public.moneroo_settings
  for each row execute function public.set_updated_at();
