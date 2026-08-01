import { createClient } from "@supabase/supabase-js";

// Bypasses RLS entirely. Server-only — never import this from a Client
// Component, and only call it from code paths that have already done
// their own authorization check (webhooks, or server actions that read
// system-managed fields like order status / provider settings).
export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
