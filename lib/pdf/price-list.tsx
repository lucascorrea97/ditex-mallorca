// Auto-generated Price List PDF (issue #15, ADR-0011: "the PDF is a transition
// bridge — always current, generated from the same data as the Client Area,
// never a manual upload"). Pure rendering — the route handler (app/api/
// price-list/route.ts) owns auth + the DB query; this module only turns
// already-fetched rows into a PDF Buffer, so it stays testable without a DB.
//
// Spanish-only content for v1 (the printed tariff this replaces is Spanish —
// noted in the PR); the *download button* around it is dictionary-driven,
// three locales, same as everywhere else on the site.
//
// Every price goes through lib/prices.ts's whitelist (buildPriceTable /
// buildPriceRangeTable / formatPriceWithUnit / formatPriceRangeCellText) —
// never a raw price row — so foam and PVP/ESPUMA PVP are excluded here the
// same way they are on the web pages, by construction, not a separate check.

import { Document, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildPriceRangeTable,
  buildPriceTable,
  formatPriceRangeCellText,
  formatPriceWithUnit,
  type PriceRow,
} from "@/lib/prices";
import type { CategoryValue } from "@/lib/catalogue";
import es from "@/messages/es.json";

// Reused verbatim from the site's own Spanish dictionary — never a second,
// drifting copy of the same copy (es.json is the source of truth either way).
const d = es.catalogo;

const RANGE_LABELS = { onRequestLabel: d.onRequest, fromLabel: d.priceFromLabel };

export type PdfVariant = {
  id: number;
  externalId: string | null;
  label: string;
  active: boolean;
  prices: PriceRow[];
};

export type PdfProduct = {
  id: number;
  name: string;
  category: CategoryValue;
  familia: string | null;
  prices: PriceRow[]; // product-level default
  variants: PdfVariant[];
};

function effectivePrices(product: PdfProduct, variant: PdfVariant): PriceRow[] {
  return variant.prices.length > 0 ? variant.prices : product.prices;
}

// A Client reading over the phone can say a code far more reliably than a
// colour name ("M450455", not "the burgundy one, I think") — so every
// Variant's own A3 SKU (externalId) rides along next to its label. Falls
// back gracefully if either piece is missing (shouldn't happen for
// A3-imported data, but admin-created products may lack a code).
function variantEntry(v: PdfVariant): string | null {
  if (v.label && v.externalId) return `${v.label} (${v.externalId})`;
  return v.label || v.externalId || null;
}

// One product's price, as a single printable line — "18,50 €/m · 13,20
// €/pieza" for a shared price, "desde 12,00 €/ud" when colourways differ,
// the foam contact-us label when it's foam. Mirrors PriceInline's web
// convention, built from the exact same lib/prices.ts helpers.
function priceLine(product: PdfProduct, activeVariants: PdfVariant[]): string {
  if (product.category === "foam") return d.foamPriceHeading;

  if (activeVariants.length <= 1) {
    const prices = activeVariants[0] ? effectivePrices(product, activeVariants[0]) : product.prices;
    const { rows } = buildPriceTable(prices);
    const parts = rows.flatMap((row) =>
      row.cells
        .map((cell) => (cell.price ? formatPriceWithUnit(cell.price, "es") : null))
        .filter((text): text is string => text !== null),
    );
    return parts.length > 0 ? parts.join(" · ") : d.onRequest;
  }

  const { rows } = buildPriceRangeTable(activeVariants.map((v) => effectivePrices(product, v)));
  const parts = rows.flatMap((row) =>
    row.cells
      .map((cell) => formatPriceRangeCellText(cell, row.unit, "es", RANGE_LABELS)?.text ?? null)
      .filter((text): text is string => text !== null),
  );
  return parts.length > 0 ? parts.join(" · ") : d.onRequest;
}

const styles = StyleSheet.create({
  page: { paddingTop: 70, paddingBottom: 50, paddingHorizontal: 36, fontSize: 9, fontFamily: "Helvetica" },
  header: {
    position: "absolute",
    top: 24,
    left: 36,
    right: 36,
    borderBottom: "1 solid #d6d3d1",
    paddingBottom: 8,
  },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  subtitle: { fontSize: 8, color: "#78716c", marginTop: 2 },
  familiaHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: "#f5f5f4",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 3,
    borderBottom: "0.5 solid #e7e5e4",
    gap: 10,
  },
  name: { fontFamily: "Helvetica-Bold" },
  colourways: { fontSize: 7.5, color: "#78716c", marginTop: 1 },
  price: { textAlign: "right", minWidth: 130 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: "#a8a29e",
    textAlign: "center",
  },
});

const FAMILIA_FALLBACK = "SIN FAMILIA";

function groupByFamilia(products: PdfProduct[]): [string, PdfProduct[]][] {
  const groups = new Map<string, PdfProduct[]>();
  for (const p of products) {
    const key = p.familia ?? FAMILIA_FALLBACK;
    const existing = groups.get(key) ?? [];
    existing.push(p);
    groups.set(key, existing);
  }
  for (const list of groups.values()) list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

export function PriceListDocument({ products, generatedAt }: { products: PdfProduct[]; generatedAt: Date }) {
  // Discontinued (Bloqueado) Variants never appear; a Product with none left
  // active shouldn't be in this list at all (the caller filters it out too,
  // but this stays correct even if it slips through).
  const listable = products
    .map((p) => ({ product: p, activeVariants: p.variants.filter((v) => v.active) }))
    .filter(({ activeVariants }) => activeVariants.length > 0);

  const groups = groupByFamilia(listable.map(({ product }) => product));
  const activeVariantsByProductId = new Map(listable.map(({ product, activeVariants }) => [product.id, activeVariants]));

  const dateLabel = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(generatedAt);

  return (
    <Document title="D.TEX Mallorca — Lista de Precios">
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.title}>D.TEX Mallorca — Lista de Precios</Text>
          <Text style={styles.subtitle}>
            Generado el {dateLabel} · {listable.length} productos · {d.shippingRuleNote}
          </Text>
        </View>

        {groups.map(([familia, familiaProducts]) => (
          <View key={familia}>
            <Text style={styles.familiaHeading}>{familia}</Text>
            {familiaProducts.map((product) => {
              const activeVariants = activeVariantsByProductId.get(product.id) ?? [];
              const isMultiVariant = activeVariants.length > 1;
              // Multi-colourway: every Variant's own label + code, so a Client
              // can order "M450455" instead of guessing at "the burgundy one".
              // Single-variant: just the one code under the name (its label is
              // normally empty for a standalone Product — nothing to pair it with).
              const variantEntries = isMultiVariant
                ? activeVariants.map(variantEntry).filter((entry): entry is string => entry !== null)
                : [];
              const soleCode = !isMultiVariant ? activeVariants[0]?.externalId : null;
              return (
                <View key={product.id} style={styles.row} wrap={false}>
                  <View style={{ flexGrow: 1 }}>
                    <Text style={styles.name}>{product.name}</Text>
                    {soleCode && <Text style={styles.colourways}>Cód. {soleCode}</Text>}
                    {variantEntries.length > 0 && (
                      <Text style={styles.colourways}>{variantEntries.join(", ")}</Text>
                    )}
                  </View>
                  <Text style={styles.price}>{priceLine(product, activeVariants)}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `D.TEX Mallorca · Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  );
}

export async function renderPriceListPdf(products: PdfProduct[], generatedAt = new Date()): Promise<Buffer> {
  return renderToBuffer(<PriceListDocument products={products} generatedAt={generatedAt} />);
}
