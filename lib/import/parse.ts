// Pure parsing/mapping/join logic for the A3 catalogue seed importer (issue #5,
// ADR-0018). No I/O here — reading files is db/import-catalogue.ts's job.

import { parsePriceInput } from "@/lib/price";
import type { CategoryValue } from "@/lib/catalogue";

// A row as read from an xlsx sheet, keyed by header name (not column position —
// real A3 exports don't keep a stable column order even within the same format).
type SourceRow = Record<string, unknown>;

function normaliseCode(raw: unknown): string {
  return String(raw ?? "").trim();
}

function normaliseAmount(raw: unknown): string | null {
  if (typeof raw === "number") return parsePriceInput(String(raw));
  return parsePriceInput(String(raw ?? ""));
}

// Blank/whitespace-only cells come back from xlsx as "" or null depending on the
// sheet — both mean "absent", never "zero" or the literal empty string.
function normaliseOptionalText(raw: unknown): string | null {
  const trimmed = String(raw ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

// ---------------------------------------------------------------------------
// Tariff code -> (zone, unit) map
// ---------------------------------------------------------------------------

export type TariffZone = "all" | "mallorca" | "men_ibz";
export type SaleUnit =
  | "metro"
  | "pieza"
  | "kg"
  | "metro_lineal"
  | "unidad"
  | "m3"
  | "plancha"
  | "caja"
  | "embalaje"
  | "pvp";

// The full A3 tariff map (ADR-0018), confirmed against the Feb 2026 full export:
// codes 1-11 sum to exactly 13,423 rows across the whole catalogue. "pvp" (codes
// 1 and 4) is stored but is excluded from lib/prices.ts's display whitelist, so
// retail walk-in prices are never shown on the web.
const TARIFF_MAP: Record<number, { zone: TariffZone; unit: SaleUnit }> = {
  1: { zone: "all", unit: "pvp" }, // PVP
  2: { zone: "all", unit: "metro" }, // METRAJE
  3: { zone: "all", unit: "pieza" }, // PIEZA
  4: { zone: "all", unit: "pvp" }, // ESPUMA PVP
  5: { zone: "mallorca", unit: "m3" }, // CORTE
  6: { zone: "men_ibz", unit: "m3" }, // CORTE ISLAS
  7: { zone: "mallorca", unit: "plancha" }, // PLANCHA
  8: { zone: "men_ibz", unit: "plancha" }, // PLANCHA ISLAS
  9: { zone: "all", unit: "unidad" }, // UNIDAD
  10: { zone: "all", unit: "caja" }, // CAJA
  11: { zone: "all", unit: "embalaje" }, // EMBALAJE
};

export function mapTariffCode(code: number): { zone: TariffZone; unit: SaleUnit } | undefined {
  return TARIFF_MAP[code];
}

// ---------------------------------------------------------------------------
// Familia -> category fallback map
// ---------------------------------------------------------------------------

// Best-effort mapping from the 37 curated web Familias down to the pre-existing
// 6-value `category` enum (lib/catalogue.ts), which products.category still
// requires NOT NULL. This is our own judgment call, not specified by ADR-0018 —
// unmapped/missing Familias fall back to "accessory" and are flagged via
// `defaulted` so the import report can surface them for #6.
const FAMILIA_TO_CATEGORY: Record<string, CategoryValue> = {
  TELA: "fabric",
  ESPUMA: "foam",
  FOAMIZADO: "foam",
  PIEL: "polipiel",
  "PLÁSTICOS": "pvc",
  BOATELLE: "material",
  "FIBRAS Y RELLENOS": "material",
  "ALMOHADAS Y CUADRANTES": "material",
  COLCHONES: "material",
  "EDREDONES Y DUVETS": "material",
  "GEL ASIENTO": "material",
  "IMPERMEABILIZACIÓN": "material",
  MUELLES: "material",
  PERFILES: "material",
  PLOMO: "material",
  PLUMA: "material",
  "RIELES, BARRAS Y GUÍAS": "material",
  TERMOSELADO: "material",
  CINCHAS: "material",
  ACCESORIOS: "accessory",
  CREMALLERAS: "accessory",
  HILOS: "accessory",
  GRAPAS: "accessory",
  VELCRO: "accessory",
  "TACHAS, CLAVOS Y SEMENCES": "accessory",
  "PATAS Y DESLIZANTES": "accessory",
  CINTAS: "accessory",
  MECANISMOS: "accessory",
  CORDONES: "accessory",
  "GALONES, FLECOS Y BORLAS": "accessory",
  "ADHESIVOS Y COLAS": "accessory",
  "AGUJAS Y ALFILERES": "accessory",
  "VIVOS Y BURLETES": "accessory",
  MUESTRARIOS: "accessory",
  "MÁQUINAS Y HERRAMIENTAS": "accessory",
  PORTES: "accessory",
};

export function categoryForFamilia(familia: string | null): {
  category: CategoryValue;
  defaulted: boolean;
} {
  const trimmed = familia?.trim();
  if (!trimmed) return { category: "accessory", defaulted: true };

  const category = FAMILIA_TO_CATEGORY[trimmed];
  if (!category) return { category: "accessory", defaulted: true };

  return { category, defaulted: false };
}

// ---------------------------------------------------------------------------
// Article + tariff row parsers (new go-forward format, and the old Feb 2026
// one-off enrichment format) — both produce the same normalised shape.
// ---------------------------------------------------------------------------

export type ParsedArticleTariffRow = {
  sku: string;
  name: string;
  active: boolean;
  ancho: string | null;
  metrosPorPieza: string | null;
  tariffCode: number;
  tariffName: string;
  amount: string | null;
};

// New-format export (the reproducible go-forward "filtro"; e.g. ESPUMA.xlsx,
// prueba-terceira.xlsx shape). One row per article x tariff. `Precio coste` /
// `Precio compra` (internal margins) are never read here — dropped at parse
// time, per ADR-0018 — nor is `Precio venta` (not part of the confirmed
// pricing model) or the supplier columns (out of scope for this issue).
export function parseNewFormatRow(row: SourceRow): ParsedArticleTariffRow | null {
  const sku = normaliseCode(row["Cód. artículo"]);
  const tariffCode = Number(normaliseCode(row["Cod. tarifa"]));
  if (!sku || !Number.isFinite(tariffCode)) return null;

  return {
    sku,
    name: String(row["Artículo"] ?? "").trim(),
    active: normaliseCode(row["Bloqueado"]).toLowerCase() !== "sí",
    ancho: null, // not exported by the new-format filtro (ADR-0018)
    metrosPorPieza: null, // not exported by the new-format filtro (ADR-0018)
    tariffCode,
    tariffName: normaliseCode(row["Nombre de la tarifa"]),
    amount: normaliseAmount(row["Precio de la tarifa"]),
  };
}

// Old-format export (tarifa intento.xlsx, Feb 2026) — the one-off source of
// Ancho/Metros por pieza. No Bloqueado column, so active always defaults true.
// ` Cód familia`/`Desc. familia` (A3's internal collection-like familia) and the
// top-level `PVP` column are out of scope for this issue and intentionally unread.
export function parseOldFormatRow(row: SourceRow): ParsedArticleTariffRow | null {
  const sku = normaliseCode(row["CODART"]);
  const tariffCode = Number(normaliseCode(row["TARIFA"]));
  if (!sku || !Number.isFinite(tariffCode)) return null;

  return {
    sku,
    name: String(row["Descripción"] ?? "").trim(),
    active: true, // this format has no Bloqueado column
    ancho: normaliseOptionalText(row["Ancho"]),
    metrosPorPieza: normaliseOptionalText(row["Metros por pieza"]),
    tariffCode,
    tariffName: normaliseCode(row["DESCTARIFA"]),
    amount: normaliseAmount(row["Precio tarifa"]),
  };
}

// "Exact duplicate rows occur — dedupe on (SKU, tariff code)" (ADR-0018). Keyed
// on the raw pair, before zone/unit mapping — two different tariff codes can map
// to the same (zone, unit) (PVP and ESPUMA PVP both -> all/pvp), so deduping on
// the mapped shape would wrongly collapse them.
export function dedupeTariffRows(rows: ParsedArticleTariffRow[]): {
  rows: ParsedArticleTariffRow[];
  duplicates: ParsedArticleTariffRow[];
} {
  const seen = new Set<string>();
  const deduped: ParsedArticleTariffRow[] = [];
  const duplicates: ParsedArticleTariffRow[] = [];

  for (const row of rows) {
    const key = `${row.sku}::${row.tariffCode}`;
    if (seen.has(key)) {
      duplicates.push(row);
    } else {
      seen.add(key);
      deduped.push(row);
    }
  }

  return { rows: deduped, duplicates };
}

// ---------------------------------------------------------------------------
// Price records: tariff row -> (zone, unit, amount), plus the foam CONSULTA gap-fill
// ---------------------------------------------------------------------------

export type PriceRecord = {
  zone: TariffZone;
  unit: SaleUnit;
  amount: string | null;
  onRequest: boolean;
  qualifier: string | null;
};

// The two foam unit families that carry a Mallorca/Men-Ibz split (ADR-0018).
// Every other unit is single-price by design — never a CONSULTA candidate.
const FOAM_UNITS: SaleUnit[] = ["m3", "plancha"];

// Maps a single SKU's already-deduped tariff rows to (zone, unit, amount) price
// records, then synthesizes a CONSULTA (on-request) Men-Ibz row for any foam unit
// that has a Mallorca price but no `... ISLAS` row — per the business's confirmed
// gap-filling rule (issue #5), since A3 has no explicit "no islands price" marker.
export function buildPriceRecords(rows: ParsedArticleTariffRow[]): PriceRecord[] {
  const records: PriceRecord[] = [];

  for (const row of rows) {
    const mapped = mapTariffCode(row.tariffCode);
    if (!mapped) continue;
    records.push({
      zone: mapped.zone,
      unit: mapped.unit,
      amount: row.amount,
      onRequest: false,
      qualifier: null,
    });
  }

  for (const unit of FOAM_UNITS) {
    const hasMallorca = records.some((r) => r.unit === unit && r.zone === "mallorca");
    const hasMenIbz = records.some((r) => r.unit === unit && r.zone === "men_ibz");
    if (hasMallorca && !hasMenIbz) {
      records.push({ zone: "men_ibz", unit, amount: null, onRequest: true, qualifier: "CONSULTA" });
    }
  }

  return records;
}

// ---------------------------------------------------------------------------
// Familia master + stock parsers
// ---------------------------------------------------------------------------

export type FamiliaMasterRow = { sku: string; name: string; familia: string | null };

export function parseFamiliaMasterRow(row: SourceRow): FamiliaMasterRow | null {
  const sku = normaliseCode(row["Cód. artículo"]);
  if (!sku) return null;

  return {
    sku,
    name: String(row["Artículo"] ?? "").trim(),
    familia: normaliseOptionalText(row["Familia"]),
  };
}

export type StockRow = { sku: string; stockTotal: string };

export function parseStockRow(row: SourceRow): StockRow | null {
  const sku = normaliseCode(row["Cód. artículo"]);
  const stockTotal = normaliseAmount(row["Stock Total"]);
  if (!sku || stockTotal === null) return null;

  return { sku, stockTotal };
}

// Stock Total is already the per-SKU aggregate, repeated on every per-lot row
// (verified against the real export) — so aggregation means collapsing
// duplicates, not summing. Keeps the first value seen; disagreements are
// surfaced as conflicts rather than silently overwritten, for the import report.
export function aggregateStock(rows: StockRow[]): {
  stockBySku: Map<string, string>;
  conflicts: string[];
} {
  const stockBySku = new Map<string, string>();
  const conflicts: string[] = [];

  for (const { sku, stockTotal } of rows) {
    const existing = stockBySku.get(sku);
    if (existing === undefined) {
      stockBySku.set(sku, stockTotal);
    } else if (existing !== stockTotal) {
      conflicts.push(sku);
    }
  }

  return { stockBySku, conflicts };
}

// ---------------------------------------------------------------------------
// Top-level join: familia master (the web-visible SKU universe, ADR-0018) +
// tariff rows + stock -> built products, and an import report for #6.
// ---------------------------------------------------------------------------

export type BuiltProduct = {
  externalId: string;
  slug: string;
  name: string;
  category: CategoryValue;
  familia: string | null;
  active: boolean;
  width: string | null;
  attributes: Record<string, string>;
  stockTotal: string | null;
  prices: PriceRecord[];
};

export type ImportReport = {
  emptyFamiliaSkus: string[];
  articlesWithoutTariffRows: string[];
  unmatchedTariffSkus: string[];
  unmatchedStockSkus: string[];
  duplicateTariffRowCount: number;
  defaultedCategorySkus: string[];
  stockConflictSkus: string[];
};

export function buildCatalogue(input: {
  familiaMaster: FamiliaMasterRow[];
  tariffRows: ParsedArticleTariffRow[];
  stock: StockRow[];
}): { products: BuiltProduct[]; report: ImportReport } {
  const { familiaMaster, tariffRows, stock } = input;

  const skuUniverse = new Set(familiaMaster.map((r) => r.sku));

  const { rows: dedupedTariffRows, duplicates } = dedupeTariffRows(tariffRows);
  const tariffRowsBySku = new Map<string, ParsedArticleTariffRow[]>();
  const unmatchedTariffSkus: string[] = [];
  for (const row of dedupedTariffRows) {
    if (!skuUniverse.has(row.sku)) {
      unmatchedTariffSkus.push(row.sku);
      continue;
    }
    const existing = tariffRowsBySku.get(row.sku) ?? [];
    existing.push(row);
    tariffRowsBySku.set(row.sku, existing);
  }

  const { stockBySku, conflicts: stockConflictSkus } = aggregateStock(stock);
  const unmatchedStockSkus = stock
    .map((r) => r.sku)
    .filter((sku, i, all) => all.indexOf(sku) === i) // unique
    .filter((sku) => !skuUniverse.has(sku));

  const emptyFamiliaSkus: string[] = [];
  const articlesWithoutTariffRows: string[] = [];
  const defaultedCategorySkus: string[] = [];

  const products: BuiltProduct[] = familiaMaster.map((master) => {
    if (!master.familia) emptyFamiliaSkus.push(master.sku);

    const rowsForSku = tariffRowsBySku.get(master.sku) ?? [];
    if (rowsForSku.length === 0) articlesWithoutTariffRows.push(master.sku);

    const { category, defaulted } = categoryForFamilia(master.familia);
    if (defaulted) defaultedCategorySkus.push(master.sku);

    const ancho = rowsForSku.find((r) => r.ancho !== null)?.ancho ?? null;
    const metrosPorPieza = rowsForSku.find((r) => r.metrosPorPieza !== null)?.metrosPorPieza ?? null;
    const attributes: Record<string, string> = {};
    if (metrosPorPieza) attributes.metros_por_pieza = metrosPorPieza;

    return {
      externalId: master.sku,
      slug: master.sku.toLowerCase(),
      name: master.name,
      category,
      familia: master.familia,
      active: rowsForSku.every((r) => r.active),
      width: ancho,
      attributes,
      stockTotal: stockBySku.get(master.sku) ?? null,
      prices: buildPriceRecords(rowsForSku),
    };
  });

  return {
    products,
    report: {
      emptyFamiliaSkus,
      articlesWithoutTariffRows,
      unmatchedTariffSkus,
      unmatchedStockSkus,
      duplicateTariffRowCount: duplicates.length,
      defaultedCategorySkus,
      stockConflictSkus,
    },
  };
}
