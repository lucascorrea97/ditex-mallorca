import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getArticle } from "@/lib/admin/data";
import { ArticleForm } from "@/components/admin/article-form";
import { SubmitButton } from "@/components/admin/ui";
import { deleteArticle, updateArticle } from "../actions";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const articleId = Number(id);
  if (Number.isNaN(articleId)) notFound();

  const article = await getArticle(articleId);
  if (!article) notFound();

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/contenido" className="text-sm text-stone-500 hover:text-stone-900">
          ← Contenido
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{article.title}</h1>
      </div>

      <ArticleForm
        action={updateArticle.bind(null, articleId)}
        article={article}
        submitLabel="Guardar cambios"
      />

      <section className="border-t border-stone-200 pt-6">
        <form action={deleteArticle.bind(null, articleId)}>
          <SubmitButton type="submit" variant="danger">
            Eliminar artículo
          </SubmitButton>
          <p className="mt-2 text-xs text-stone-500">
            Esta acción no se puede deshacer.
          </p>
        </form>
      </section>
    </div>
  );
}
