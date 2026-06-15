import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { ArticleForm } from "@/components/admin/article-form";
import { createArticle } from "../actions";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/contenido" className="text-sm text-stone-500 hover:text-stone-900">
          ← Contenido
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Nuevo artículo</h1>
        <p className="mt-1 text-stone-600">
          Guárdalo como borrador y publícalo cuando esté revisado.
        </p>
      </div>

      <ArticleForm action={createArticle} submitLabel="Crear artículo" />
    </div>
  );
}
