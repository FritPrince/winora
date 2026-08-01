"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function saveMonerooSettings(formData: FormData) {
  const supabase = await createClient();

  const mode = String(formData.get("mode") ?? "sandbox");
  const sandboxKey = String(formData.get("sandbox_secret_key") ?? "").trim();
  const liveKey = String(formData.get("live_secret_key") ?? "").trim();
  const webhookSecret = String(formData.get("webhook_secret") ?? "").trim();

  const update: Record<string, string> = { mode };
  // Blank field = keep the value already stored, so the form never has
  // to display a secret back to re-save it.
  if (sandboxKey) update.sandbox_secret_key = sandboxKey;
  if (liveKey) update.live_secret_key = liveKey;
  if (webhookSecret) update.webhook_secret = webhookSecret;

  const { error } = await supabase
    .from("moneroo_settings")
    .update(update)
    .eq("id", true);

  if (error) {
    redirect(`/admin/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/settings?saved=1");
}
