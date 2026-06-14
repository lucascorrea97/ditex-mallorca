import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listCollections } from "@/lib/admin/data";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();
  const collections = await listCollections();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/productos" className="text-sm text-stone-500 hover:text-stone-900">
          ← Productos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Nuevo producto</h1>
        <p className="mt-1 text-stone-600">
          Crea el producto y luego añade sus precios desde la ficha.
        </p>
      </div>

      <ProductForm
        action={createProduct}
        collections={collections}
        submitLabel="Crear producto"
      />
    </div>
  );
}
