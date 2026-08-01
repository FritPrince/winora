"use server";

import { redirect } from "next/navigation";

import type { CartItem } from "@/lib/cart/cart-context";
import { initializeMonerooPayment } from "@/lib/moneroo";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getSiteUrl } from "@/lib/site-url";

export async function checkout(items: CartItem[]) {
  if (items.length === 0) {
    redirect("/panier");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subtotal = items.reduce((sum, i) => sum + i.priceXof * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      subtotal,
      discount: 0,
      total: subtotal,
      currency: "XOF",
      payment_provider: "moneroo",
    })
    .select()
    .single();

  if (orderError || !order) {
    redirect(
      `/panier?error=${encodeURIComponent("Impossible de créer la commande.")}`,
    );
  }

  const orderItemsPayload = items.flatMap((item) =>
    Array.from({ length: item.quantity }, () => ({
      order_id: order.id,
      product_id: item.productId,
      unit_price: item.priceXof,
    })),
  );

  await supabase.from("order_items").insert(orderItemsPayload);

  const fullName = String(user.user_metadata?.full_name ?? "").trim();
  const [firstName, ...rest] = fullName ? fullName.split(" ") : ["Client"];
  const lastName = rest.join(" ") || "Winora";

  let checkoutUrl: string | null = null;
  let paymentId: string | null = null;
  let initError: string | null = null;

  try {
    const payment = await initializeMonerooPayment({
      amount: subtotal,
      currency: "XOF",
      customerEmail: user.email!,
      customerFirstName: firstName,
      customerLastName: lastName,
      returnUrl: `${getSiteUrl()}/commande/${order.id}`,
      metadata: { order_id: order.id },
    });
    checkoutUrl = payment.checkout_url;
    paymentId = payment.id;
  } catch (err) {
    initError = err instanceof Error ? err.message : "Paiement indisponible.";
  }

  if (initError || !checkoutUrl || !paymentId) {
    redirect(
      `/panier?error=${encodeURIComponent(initError ?? "Paiement indisponible.")}`,
    );
  }

  // Only service_role touches provider_reference/status past creation —
  // same rule as everywhere else money-related in this schema.
  const serviceRole = createServiceRoleClient();
  await serviceRole
    .from("orders")
    .update({ provider_reference: paymentId })
    .eq("id", order.id);

  redirect(checkoutUrl);
}
