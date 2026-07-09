import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listArticles, listProducts, listRequests } from "@/lib/admin/data";

export default async function AdminHome() {
  await requireAdmin();
  const [products, articles, requests] = await Promise.all([
    listProducts(),
    listArticles(),
    listRequests(),
  ]);
  const published = articles.filter((a) => a.status === "published").length;
  const newRequests = requests.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Panel de administración</h1>
        <p className="mt-1 text-stone-600">
          Gestiona el catálogo, los precios y el contenido del sitio.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/productos"
          className="rounded-2xl border border-stone-200 bg-white p-6 transition-colors hover:border-stone-300"
        >
          <p className="text-3xl font-semibold">{products.length}</p>
          <p className="mt-1 text-stone-600">Productos en el catálogo</p>
          <p className="mt-4 text-sm font-medium text-brand-600">
            Gestionar productos y precios →
          </p>
        </Link>

        <Link
          href="/admin/contenido"
          className="rounded-2xl border border-stone-200 bg-white p-6 transition-colors hover:border-stone-300"
        >
          <p className="text-3xl font-semibold">
            {published}
            <span className="text-lg font-normal text-stone-400"> / {articles.length}</span>
          </p>
          <p className="mt-1 text-stone-600">Artículos publicados</p>
          <p className="mt-4 text-sm font-medium text-brand-600">Gestionar contenido →</p>
        </Link>

        <Link
          href="/admin/solicitudes"
          className="rounded-2xl border border-stone-200 bg-white p-6 transition-colors hover:border-stone-300"
        >
          <p className="text-3xl font-semibold">
            {newRequests}
            <span className="text-lg font-normal text-stone-400"> / {requests.length}</span>
          </p>
          <p className="mt-1 text-stone-600">Solicitudes nuevas</p>
          <p className="mt-4 text-sm font-medium text-brand-600">Ver solicitudes →</p>
        </Link>
      </div>

      {/* Roadmap surface — the admin is built to grow into dashboards/order views
          (ADR-0007). These land once the A3 Connector exposes order data (M4). */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">
          Próximamente
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-6 text-stone-400">
            <p className="font-medium">Pedidos</p>
            <p className="mt-1 text-sm">Estado de pedidos cuando el Conector A3 esté activo.</p>
          </div>
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-6 text-stone-400">
            <p className="font-medium">Analítica</p>
            <p className="mt-1 text-sm">Métricas de uso del sitio y del Área de Clientes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
