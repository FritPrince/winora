"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function refundOrder(orderId: string) {
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", orderId);

  revalidatePath("/admin/commandes");
}
