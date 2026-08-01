import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NouveauProduitPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl text-foreground">
        Nouveau produit
      </h1>

      {error && (
        <p className="mb-6 rounded-lg border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <ProductForm action={createProduct} submitLabel="Créer le produit" />
    </div>
  );
}
