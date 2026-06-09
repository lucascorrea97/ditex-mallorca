import { db } from "@/db";

// TEMPORARY verification page for the data layer (#3). Proves a typed query renders
// server-side. Remove when the real catalogue (#7) and gated prices (#14) land.
export const dynamic = "force-dynamic";

function eur(amount: string | number | null) {
  if (amount === null) return "consultar";
  return `${Number(amount).toFixed(2)}€`;
}

export default async function DbCheck() {
  let items;
  try {
    items = await db.query.products.findMany({
      with: { collection: true, prices: true },
      orderBy: (p, { asc }) => [asc(p.category), asc(p.name)],
    });
  } catch {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-stone-900">
        <h1 className="text-xl font-semibold">db-check</h1>
        <p className="mt-2 text-stone-600">
          No hay base de datos configurada en este entorno. En local: copia{" "}
          <code>.env.example</code> a <code>.env</code>, ejecuta{" "}
          <code>docker compose up -d</code>, <code>npm run db:migrate</code> y{" "}
          <code>npm run db:seed</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-stone-900">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-stone-400">
        db-check · temporal (#3)
      </p>
      <h1 className="mb-8 text-2xl font-semibold">
        Catálogo — {items.length} productos sembrados
      </h1>
      <ul className="space-y-4">
        {items.map((p) => (
          <li key={p.id} className="rounded-lg border border-stone-200 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{p.name}</span>
              <span className="text-xs uppercase tracking-wide text-stone-400">
                {p.category}
                {p.collection ? ` · ${p.collection.name}` : ""}
              </span>
            </div>
            {p.width ? <p className="text-sm text-stone-500">{p.width}</p> : null}
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
              {p.prices.map((pr) => (
                <li key={pr.id}>
                  {pr.zone !== "all" ? `${pr.zone}: ` : ""}
                  {eur(pr.onRequest ? null : pr.amount)}
                  <span className="text-stone-400"> /{pr.unit}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
