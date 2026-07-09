import Link from "next/link";
import { listRequests } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/auth";
import { Badge } from "@/components/admin/ui";

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });

export default async function RequestsPage() {
  await requireAdmin();
  const requests = await listRequests();
  const newCount = requests.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Solicitudes</h1>
        <p className="mt-1 text-stone-600">
          Solicitudes de pedido enviadas desde el Área de Clientes. {newCount} nueva
          {newCount === 1 ? "" : "s"} de {requests.length} en total.
        </p>
      </header>

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
          Todavía no se ha recibido ninguna solicitud.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Referencia</th>
                <th className="px-5 py-3 font-medium">Negocio</th>
                <th className="px-5 py-3 font-medium">Contacto</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Recibida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/solicitudes/${r.id}`}
                      className="font-mono font-medium text-stone-900 hover:text-brand-600"
                    >
                      {r.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-stone-700">{r.businessName}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {r.contactPhone || r.contactEmail || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {r.status === "new" ? (
                      <Badge tone="amber">Nueva</Badge>
                    ) : (
                      <Badge tone="green">Atendida</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{dateFmt.format(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
