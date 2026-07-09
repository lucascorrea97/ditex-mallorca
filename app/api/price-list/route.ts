import { auth } from "@/auth";
import { db } from "@/db";
import { renderPriceListPdf, type PdfProduct } from "@/lib/pdf/price-list";

// Client Area-only (ADR-0011): behind the same auth check as the gated pages —
// not locale-scoped, since the PDF's content is Spanish-only for v1 (see the
// PR notes). Generated on request, no caching: the simplest way to guarantee
// "always current" per ADR-0011 ("single source, no drift") without having to
// invalidate a cache on every `npm run db:import` run. If this ever gets slow
// enough to matter, the natural next step is caching keyed to the importer's
// last run, not before.
export const runtime = "nodejs"; // @react-pdf/renderer needs Node APIs, not Edge
export const dynamic = "force-dynamic";
// Measured against the real ~2,200-product catalogue: ~12s to render 64 pages.
// Comfortably under Vercel's default, but set explicitly so a bigger catalogue
// (the fresh full export, #60) doesn't silently start timing out.
export const maxDuration = 30;

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("No autorizado.", { status: 401 });
  }

  const rows = await db.query.products.findMany({
    with: { prices: true, variants: { with: { prices: true } } },
  });

  const products: PdfProduct[] = rows.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    familia: p.familia,
    prices: p.prices,
    variants: p.variants.map((v) => ({
      id: v.id,
      externalId: v.externalId,
      label: v.label,
      active: v.active,
      prices: v.prices,
    })),
  }));

  const pdf = await renderPriceListPdf(products);
  const filename = `ditex-lista-de-precios-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
