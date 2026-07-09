import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getRequest } from "@/lib/admin/data";
import { Badge, SubmitButton } from "@/components/admin/ui";
import { toggleRequestStatus } from "../actions";

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

// Admin-only display labels (Spanish-only, ADR-0007) — mirrors the sale_unit enum in
// db/schema.ts. Separate from messages/*.json's saleUnits, which is Client-facing/i18n.
const UNIT_LABELS: Record<string, string> = {
  metro: "metro",
  pieza: "pieza",
  kg: "kg",
  metro_lineal: "metro lineal",
  unidad: "unidad",
  m3: "m³",
  plancha: "plancha",
  caja: "caja",
  embalaje: "embalaje",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const requestId = Number(id);
  if (Number.isNaN(requestId)) notFound();

  const request = await getRequest(requestId);
  if (!request) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/solicitudes" className="text-sm text-stone-500 hover:text-stone-900">
          ← Solicitudes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold">{request.reference}</h1>
          {request.status === "new" ? (
            <Badge tone="amber">Nueva</Badge>
          ) : (
            <Badge tone="green">Atendida</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-stone-500">
          Recibida el {dateFmt.format(request.createdAt)}
        </p>
      </div>

      <section className="grid gap-6 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Negocio
          </p>
          <p className="mt-1 text-stone-900">{request.businessName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Contacto
          </p>
          <p className="mt-1 text-stone-900">{request.contactPhone || "—"}</p>
          <p className="text-stone-900">{request.contactEmail || "—"}</p>
        </div>
        {request.note && (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Nota general
            </p>
            <p className="mt-1 text-stone-700">{request.note}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">
          Líneas ({request.lines.length})
        </h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Cantidad</th>
                <th className="px-5 py-3 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {request.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-5 py-3">
                    <p className="text-stone-900">{line.productName}</p>
                    {line.variantLabel && (
                      <p className="text-sm text-stone-500">{line.variantLabel}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 font-mono text-stone-600">{line.sku || "—"}</td>
                  <td className="px-5 py-3 text-stone-700">
                    {line.quantity} {UNIT_LABELS[line.unit] ?? line.unit}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{line.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-stone-200 pt-6">
        <form action={toggleRequestStatus.bind(null, request.id, request.status)}>
          <SubmitButton type="submit">
            {request.status === "new" ? "Marcar como atendida" : "Marcar como nueva"}
          </SubmitButton>
        </form>
      </section>
    </div>
  );
}
