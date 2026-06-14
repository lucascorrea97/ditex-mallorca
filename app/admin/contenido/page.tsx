import Link from "next/link";
import { listArticles } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/auth";
import { LOCALE_OPTIONS, labelFor } from "@/lib/admin/constants";
import { Badge } from "@/components/admin/ui";

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function ContentPage() {
  await requireAdmin();
  const articles = await listArticles();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Contenido</h1>
          <p className="mt-1 text-stone-600">
            Guías y artículos del sitio. {articles.length} en total.
          </p>
        </div>
        <Link
          href="/admin/contenido/nuevo"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Nuevo artículo
        </Link>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
          Aún no hay artículos. Crea el primero con “Nuevo artículo”.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Idioma</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Actualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/contenido/${a.id}`}
                      className="font-medium text-stone-900 hover:text-brand-600"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    {labelFor(LOCALE_OPTIONS, a.locale)}
                  </td>
                  <td className="px-5 py-3">
                    {a.status === "published" ? (
                      <Badge tone="green">Publicado</Badge>
                    ) : (
                      <Badge tone="amber">Borrador</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{dateFmt.format(a.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
