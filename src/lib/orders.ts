import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Called from both the Moneroo webhook and the order return page (as a
// fallback in case the webhook hasn't arrived yet) — never from a
// customer-facing update, which is why this always goes through
// service_role rather than the customer's own session.
export async function markOrderPaid(providerReference: string) {
  const supabase = createServiceRoleClient();
  await supabase
    .from("orders")
    .update({ status: "paid" })
    .eq("provider_reference", providerReference)
    .eq("status", "pending");
}
