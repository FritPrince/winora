"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function readProductFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    price_xof: Number(formData.get("price_xof") ?? 0),
    price_eur: Number(formData.get("price_eur") ?? 0),
    status: String(formData.get("status") ?? "draft"),
    is_mystery: formData.get("is_mystery") === "on",
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const fields = readProductFields(formData);

  const { data: product, error } = await supabase
    .from("products")
    .insert(fields)
    .select("id")
    .single();

  if (error || !product) {
    redirect(
      `/admin/produits/nouveau?error=${encodeURIComponent(error?.message ?? "Erreur inconnue")}`,
    );
  }

  redirect(`/admin/produits/${product.id}?created=1`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient();
  const fields = readProductFields(formData);

  const { error } = await supabase
    .from("products")
    .update(fields)
    .eq("id", productId);

  if (error) {
    redirect(
      `/admin/produits/${productId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/admin/produits");
  redirect(`/admin/produits/${productId}?saved=1`);
}

export async function uploadCoverImage(productId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("cover") as File | null;

  if (!file || file.size === 0) {
    redirect(`/admin/produits/${productId}`);
  }

  const path = `${productId}/${randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("product-covers")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    redirect(
      `/admin/produits/${productId}?error=${encodeURIComponent(uploadError.message)}`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-covers").getPublicUrl(path);

  await supabase
    .from("products")
    .update({ cover_image: publicUrl })
    .eq("id", productId);

  revalidatePath("/admin/produits");
  redirect(`/admin/produits/${productId}?saved=1`);
}

export async function uploadProductFile(productId: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    redirect(`/admin/produits/${productId}`);
  }

  const path = `${productId}/${randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("product-files")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    redirect(
      `/admin/produits/${productId}?error=${encodeURIComponent(uploadError.message)}`,
    );
  }

  await supabase.from("product_files").insert({
    product_id: productId,
    storage_path: path,
    file_type: file.type || "application/octet-stream",
    version: "1",
  });

  redirect(`/admin/produits/${productId}?saved=1`);
}

export async function deleteProductFile(
  productId: string,
  fileId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from("product-files").remove([storagePath]);
  await supabase.from("product_files").delete().eq("id", fileId);
  redirect(`/admin/produits/${productId}?saved=1`);
}
