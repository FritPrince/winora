import Image from "next/image";
import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  deleteProductFile,
  updateProduct,
  uploadCoverImage,
  uploadProductFile,
} from "../actions";

export default async function EditProduitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, created, error } = await searchParams;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: files } = await supabase
    .from("product_files")
    .select("id, storage_path, file_type, version, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-foreground">
        {product.title}
      </h1>

      {created && (
        <p className="mb-6 rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-foreground">
          Produit créé — ajoute une image de couverture et un fichier
          ci-dessous, puis publie-le quand il est prêt.
        </p>
      )}
      {saved && (
        <p className="mb-6 rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-foreground">
          Enregistré.
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-lg border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <ProductForm
          action={updateProduct.bind(null, id)}
          product={product}
          submitLabel="Enregistrer"
        />

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Image de couverture
            </h2>
            <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-[#0d1b2e]">
              {product.cover_image ? (
                <Image
                  src={product.cover_image}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-serif text-2xl text-gold">W</span>
                </div>
              )}
            </div>
            <form
              action={uploadCoverImage.bind(null, id)}
              className="flex flex-col gap-2"
            >
              <input
                type="file"
                name="cover"
                accept="image/*"
                required
                className="text-xs text-foreground-muted"
              />
              <Button type="submit" variant="outline" size="sm">
                Envoyer l&apos;image
              </Button>
            </form>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Fichier livré à l&apos;achat
            </h2>
            {files && files.length > 0 ? (
              <ul className="mb-3 flex flex-col gap-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs"
                  >
                    <span className="truncate text-foreground-muted">
                      {file.storage_path.split("/").pop()}
                    </span>
                    <form
                      action={deleteProductFile.bind(
                        null,
                        id,
                        file.id,
                        file.storage_path,
                      )}
                    >
                      <button
                        type="submit"
                        className="text-ember hover:underline"
                      >
                        Retirer
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-xs text-foreground-muted">
                Aucun fichier — la commande ne pourra rien livrer tant
                qu&apos;il n&apos;y en a pas au moins un.
              </p>
            )}
            <form
              action={uploadProductFile.bind(null, id)}
              className="flex flex-col gap-2"
            >
              <input
                type="file"
                name="file"
                required
                className="text-xs text-foreground-muted"
              />
              <Button type="submit" variant="outline" size="sm">
                Ajouter le fichier
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
