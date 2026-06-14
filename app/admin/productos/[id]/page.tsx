import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getProduct, listCollections } from "@/lib/admin/data";
import { ZONE_OPTIONS, UNIT_OPTIONS } from "@/lib/admin/constants";
import { ProductForm } from "@/components/admin/product-form";
import { Field, Input, Select, SubmitButton } from "@/components/admin/ui";
import {
  addPrice,
  deletePrice,
  deleteProduct,
  updatePrice,
  updateProduct,
} from "../actions";

type Price = NonNullable<Awaited<ReturnType<typeof getProduct>>>["prices"][number];

// One editable price line. Two small forms side by side: save (with the fields) and delete.
function PriceRow({ price, productId }: { price: Price; productId: number }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-4">
      <form
        action={updatePrice.bind(null, price.id, productId)}
        className="flex flex-1 flex-wrap items-end gap-3"
      >
        <Field label="Isla" htmlFor={`zone-${price.id}`}>
          <Select
            id={`zone-${price.id}`}
            name="zone"
            defaultValue={price.zone}
            className="w-40"
          >
            {ZONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Unidad" htmlFor={`unit-${price.id}`}>
          <Select
            id={`unit-${price.id}`}
            name="unit"
            defaultValue={price.unit}
            className="w-40"
          >
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Importe (€)" htmlFor={`amount-${price.id}`}>
          <Input
            id={`amount-${price.id}`}
            name="amount"
            inputMode="decimal"
            defaultValue={price.amount ?? ""}
            placeholder="0.00"
            className="w-28"
          />
        </Field>
        <Field label="Nota" htmlFor={`qualifier-${price.id}`}>
          <Input
            id={`qualifier-${price.id}`}
            name="qualifier"
            defaultValue={price.qualifier ?? ""}
            placeholder="p. ej. 15KG"
            className="w-28"
          />
        </Field>
        <label className="flex h-11 items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="onRequest"
            defaultChecked={price.onRequest}
            className="h-5 w-5 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
          />
          Consulta
        </label>
        <SubmitButton type="submit">Guardar</SubmitButton>
      </form>
      <form action={deletePrice.bind(null, price.id, productId)}>
        <SubmitButton type="submit" variant="danger">
          Eliminar
        </SubmitButton>
      </form>
    </div>
  );
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const [product, collections] = await Promise.all([
    getProduct(productId),
    listCollections(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/productos" className="text-sm text-stone-500 hover:text-stone-900">
          ← Productos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
      </div>

      {/* Product details */}
      <ProductForm
        action={updateProduct.bind(null, productId)}
        collections={collections}
        product={product}
        submitLabel="Guardar cambios"
      />

      {/* Prices */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Precios</h2>
          <p className="mt-1 text-sm text-stone-600">
            Una línea por isla y unidad. Marca “Consulta” cuando el precio sea bajo
            petición (CONSULTA).
          </p>
        </div>

        {product.prices.length === 0 ? (
          <p className="text-sm text-stone-500">Este producto todavía no tiene precios.</p>
        ) : (
          <div className="space-y-3">
            {product.prices.map((price) => (
              <PriceRow key={price.id} price={price} productId={productId} />
            ))}
          </div>
        )}

        {/* Add a price */}
        <form
          action={addPrice.bind(null, productId)}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-stone-300 bg-white p-4"
        >
          <Field label="Isla" htmlFor="new-zone">
            <Select id="new-zone" name="zone" defaultValue="all" className="w-40">
              {ZONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Unidad" htmlFor="new-unit">
            <Select id="new-unit" name="unit" defaultValue="metro" className="w-40">
              {UNIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Importe (€)" htmlFor="new-amount">
            <Input
              id="new-amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              className="w-28"
            />
          </Field>
          <Field label="Nota" htmlFor="new-qualifier">
            <Input
              id="new-qualifier"
              name="qualifier"
              placeholder="p. ej. 15KG"
              className="w-28"
            />
          </Field>
          <label className="flex h-11 items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              name="onRequest"
              className="h-5 w-5 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
            />
            Consulta
          </label>
          <SubmitButton type="submit">Añadir precio</SubmitButton>
        </form>
      </section>

      {/* Danger zone */}
      <section className="border-t border-stone-200 pt-6">
        <form action={deleteProduct.bind(null, productId)}>
          <SubmitButton type="submit" variant="danger">
            Eliminar producto
          </SubmitButton>
          <p className="mt-2 text-xs text-stone-500">
            Se eliminará el producto y todos sus precios. Esta acción no se puede deshacer.
          </p>
        </form>
      </section>
    </div>
  );
}
