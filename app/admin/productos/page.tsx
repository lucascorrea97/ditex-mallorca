import Link from "next/link";
import { listProducts } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/auth";
import { CATEGORY_OPTIONS, labelFor } from "@/lib/admin/constants";
import { Badge } from "@/components/admin/ui";

export default async function ProductsPage() {
  await requireAdmin();
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos y precios</h1>
          <p className="mt-1 text-stone-600">{products.length} productos en el catálogo.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Nuevo producto
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
          Aún no hay productos. Crea el primero con “Nuevo producto”.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Colección</th>
                <th className="px-5 py-3 font-medium">Precios</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      className="font-medium text-stone-900 hover:text-brand-600"
                    >
                      {p.name}
                    </Link>
                    {p.code ? (
                      <span className="ml-2 text-xs text-stone-400">{p.code}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    {labelFor(CATEGORY_OPTIONS, p.category)}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{p.collection?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-stone-600">{p.prices.length}</td>
                  <td className="px-5 py-3">
                    {p.active ? (
                      <Badge tone="green">Activo</Badge>
                    ) : (
                      <Badge tone="neutral">Inactivo</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
