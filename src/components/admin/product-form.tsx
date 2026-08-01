import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProductFormValues {
  title?: string;
  slug?: string;
  description?: string | null;
  category?: string | null;
  price_xof?: number;
  price_eur?: number;
  status?: string;
  is_mystery?: boolean;
}

export function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  product?: ProductFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" name="title" defaultValue={product?.title} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">
          Slug (utilisé dans l&apos;URL, ex: mon-produit)
        </Label>
        <Input id="slug" name="slug" defaultValue={product?.slug} required />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Catégorie</Label>
        <Input id="category" name="category" defaultValue={product?.category ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="price_xof">Prix (XOF)</Label>
          <Input
            id="price_xof"
            name="price_xof"
            type="number"
            min={0}
            defaultValue={product?.price_xof}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="price_eur">Prix (EUR)</Label>
          <Input
            id="price_eur"
            name="price_eur"
            type="number"
            min={0}
            defaultValue={product?.price_eur}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Statut</Label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "draft"}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground"
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
          <option value="archived">Archivé</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="is_mystery"
          defaultChecked={product?.is_mystery}
        />
        Produit mystère de la semaine
      </label>

      <Button type="submit" className="mt-2 self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
