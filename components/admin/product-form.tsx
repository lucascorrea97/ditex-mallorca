import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { collections as collectionsTable, products } from "@/db/schema";
import { CATEGORY_OPTIONS } from "@/lib/admin/constants";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/admin/ui";

type Product = InferSelectModel<typeof products>;
type Collection = InferSelectModel<typeof collectionsTable>;

// The core product fields. Shared by the create and edit pages so they never drift.
// `action` is a bound Server Action; `product` is undefined when creating.
// `active` lives on Variants now, not Product (ADR-0019) — the caller computes
// it (e.g. "any variant active") and passes it in, since it isn't part of the
// products row itself.
export function ProductForm({
  action,
  collections,
  product,
  active = true,
  submitLabel,
}: {
  action: (form: FormData) => void | Promise<void>;
  collections: Collection[];
  product?: Product;
  active?: boolean;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-6">
      <Field label="Nombre" htmlFor="name" hint="El nombre del producto, p. ej. CHANEL.">
        <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="category">
          <Select id="category" name="category" defaultValue={product?.category ?? "fabric"}>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Colección" htmlFor="collectionId" hint="Opcional.">
          <Select
            id="collectionId"
            name="collectionId"
            defaultValue={product?.collectionId?.toString() ?? ""}
          >
            <option value="">— Sin colección —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Código" htmlFor="code" hint="Código de material (si lo tiene).">
          <Input id="code" name="code" defaultValue={product?.code ?? ""} />
        </Field>
        <Field label="Ancho" htmlFor="width" hint="P. ej. 140 CM.">
          <Input id="width" name="width" defaultValue={product?.width ?? ""} />
        </Field>
      </div>

      <Field
        label="Etiquetas de uso"
        htmlFor="useTags"
        hint="Separadas por comas, p. ej. sofa, nautica, hosteleria."
      >
        <Input
          id="useTags"
          name="useTags"
          defaultValue={(product?.useTags ?? []).join(", ")}
        />
      </Field>

      <Field label="Descripción" htmlFor="description" hint="Opcional.">
        <Textarea
          id="description"
          name="description"
          className="min-h-28"
          defaultValue={product?.description ?? ""}
        />
      </Field>

      <label className="flex items-center gap-3 text-sm text-stone-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={active}
          className="h-5 w-5 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
        />
        Visible en el sitio (activo)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton type="submit">{submitLabel}</SubmitButton>
        <Link
          href="/admin/productos"
          className="text-sm font-medium text-stone-500 hover:text-stone-900"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
