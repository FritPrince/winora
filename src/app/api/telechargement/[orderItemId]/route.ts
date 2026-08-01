import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const SIGNED_URL_TTL_SECONDS = 600;

// Never exposes storage paths or files directly — only ever a short-lived
// signed URL, and only after confirming this order_item belongs to a paid
// order owned by the requesting user.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderItemId: string }> },
) {
  const { orderItemId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id, product_id, orders!inner(user_id, status)")
    .eq("id", orderItemId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "paid")
    .single();

  if (!orderItem) {
    return NextResponse.json(
      { error: "Fichier introuvable ou commande non payée." },
      { status: 404 },
    );
  }

  const serviceRole = createServiceRoleClient();
  const { data: file } = await serviceRole
    .from("product_files")
    .select("storage_path")
    .eq("product_id", orderItem.product_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!file) {
    return NextResponse.json(
      { error: "Aucun fichier disponible pour ce produit." },
      { status: 404 },
    );
  }

  const { data: signed, error: signError } = await serviceRole.storage
    .from("product-files")
    .createSignedUrl(file.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed) {
    return NextResponse.json(
      { error: "Impossible de générer le lien de téléchargement." },
      { status: 500 },
    );
  }

  await serviceRole.from("downloads").insert({
    order_item_id: orderItemId,
    signed_url_token: signed.signedUrl.split("token=")[1] ?? "",
    expires_at: new Date(
      Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    ).toISOString(),
    download_count: 1,
  });

  return NextResponse.redirect(signed.signedUrl);
}
