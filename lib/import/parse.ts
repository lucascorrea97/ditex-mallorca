// Pure parsing/mapping/join logic for the A3 catalogue seed importer (issue #5,
// ADR-0018). No I/O here — reading files is db/import-catalogue.ts's job.

import { parsePriceInput } from "@/lib/price";
import { slugify } from "@/lib/admin/form";
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

// Old-format export (tarifa intento.xlsx, Feb 2026) — a one-off, unverified-
// provenance source for Ancho/Metros por pieza only (ADR-0018 update: the file
// isn't an A3 export; kept "better than nothing pre-launch"). No Bloqueado
// column, so active always defaults true. ` Cód familia`/`Desc. familia` (A3's
// internal familia code and its AI-derived description) are NOT read — ADR-0019's
// update demoted `Desc. familia` as a grouping source; the article-name colour
// convention (see deriveNameBasedGroup) replaces it entirely. The top-level `PVP`
// column is also out of scope and intentionally unread.
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
// Product/Variant grouping (ADR-0019, corrected by its 2026-07-08 update): A3
// articles group by the article-name colour convention (`LINE C-<code>`), NOT
// `Desc. familia` — that file turned out not to be A3 data (ADR-0018 update).
// ---------------------------------------------------------------------------

// Uppercase + collapsed whitespace — the join key for grouping.
export function normaliseLineKey(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toUpperCase();
}

// The real, business-maintained colourway convention: articles are named
// `LINE C-<code/colour>` (e.g. "ALLANTE C-832 BURGUNDY"). Splits at the first
// " C-" marker: the line is everything before it, the variant label is
// everything from "C-" onward (ADR-0019 update, measured on the full 6,971-
// article catalogue: 5,573 articles carry the marker -> ~612 multi-colour
// Products; the other 1,398 have no marker -> standalone Products, each with
// one default (empty-label) Variant — this is what keeps `VIVO ALGODON 3/4/5/
// 8/9` correctly separate, since none of those names contain " C-").
export function deriveNameBasedGroup(articleName: string): {
  lineKey: string;
  lineDisplay: string;
  label: string;
  hasMarker: boolean;
} {
  const name = articleName.trim().replace(/\s+/g, " ");
  const markerIndex = name.indexOf(" C-");

  if (markerIndex <= 0) {
    return { lineKey: normaliseLineKey(name), lineDisplay: name, label: "", hasMarker: false };
  }

  const lineDisplay = name.slice(0, markerIndex);
  const label = name.slice(markerIndex + 1); // skip the space; keep the "C-" prefix
  return { lineKey: normaliseLineKey(lineDisplay), lineDisplay, label, hasMarker: true };
}

function tokenize(name: string): string[] {
  return normaliseLineKey(name).split(" ");
}

// ADR-0019 update: "under-grouping is accepted" for no-marker articles that
// nonetheless look like colour-word variants of each other (e.g. "CABO 4 MM
// NEGRO" / "CABO 4 MM BLANCO") — they stay standalone Products rather than
// being merged automatically (wrong merges are worse than a few extra thin
// pages), but the import report should surface the near-miss for a manual
// `groupOverrides` merge. Flags any pair of standalone names with the same
// token count differing in at most one position (0 = an exact duplicate name
// under two different SKUs, also worth a human look).
export function findNearDuplicateStandaloneSkus(standalone: { sku: string; name: string }[]): string[] {
  const flagged = new Set<string>();

  for (let i = 0; i < standalone.length; i++) {
    const a = tokenize(standalone[i].name);
    for (let j = i + 1; j < standalone.length; j++) {
      const b = tokenize(standalone[j].name);
      if (a.length !== b.length) continue;

      let diff = 0;
      for (let k = 0; k < a.length && diff <= 1; k++) {
        if (a[k] !== b[k]) diff++;
      }
      if (diff <= 1) {
        flagged.add(standalone[i].sku);
        flagged.add(standalone[j].sku);
      }
    }
  }

  return [...flagged];
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
// Manual corrections for the exceptions the import report flags (ADR-0019:
// "overrides beat heuristics"). The importer CLI supplies these from
// lib/import/overrides.ts; kept as an injected param here so this module stays
// pure/dependency-free and easy to test. Never hand-edit generated rows —
// fix the override instead, so re-runs stay stable.
// ---------------------------------------------------------------------------

export type ImportOverrides = {
  // SKU -> a line name to force it into, bypassing whatever the article-name
  // split would have produced (fixes a near-duplicate/under-grouped SKU, or a
  // genuinely misfiled one).
  groupOverrides?: Record<string, string>;
  // SKU -> a real variant label, replacing the "" a no-marker standalone
  // product's single variant gets by default.
  variantLabelOverrides?: Record<string, string>;
};

// ---------------------------------------------------------------------------
// Top-level join: familia master (the web-visible SKU universe, ADR-0018),
// grouped into Collection -> Product (line) -> Variant (colourway) per
// ADR-0019, plus tariff rows + stock -> an import report for #6.
// ---------------------------------------------------------------------------

export type BuiltVariant = {
  externalId: string;
  label: string;
  active: boolean;
  stockTotal: string | null;
  prices: PriceRecord[]; // empty = inherits the product-level default
};

export type BuiltProduct = {
  slug: string;
  name: string;
  category: CategoryValue;
  familia: string | null;
  width: string | null;
  attributes: Record<string, string>;
  prices: PriceRecord[]; // product-level default, shown for every variant unless overridden
  variants: BuiltVariant[];
};

export type ImportReport = {
  emptyFamiliaSkus: string[];
  articlesWithoutTariffRows: string[];
  unmatchedTariffSkus: string[];
  unmatchedStockSkus: string[];
  duplicateTariffRowCount: number;
  defaultedCategorySkus: string[];
  stockConflictSkus: string[];
  // ADR-0019 additions:
  inconsistentFamiliaGroupKeys: string[]; // a group's members disagree on web Familia
  singleMemberMarkerGroupSkus: string[]; // used the " C-" marker but ended up alone — review for a merge
  nearDuplicateStandaloneSkus: string[]; // standalone names differing by <=1 token — possible under-grouping
};

// Canonical, order-independent key for a set of price records — used to find the
// "mode" (most common) price set among a group's variants.
function priceSetKey(prices: PriceRecord[]): string {
  return JSON.stringify(
    [...prices].sort((a, b) => `${a.zone}:${a.unit}`.localeCompare(`${b.zone}:${b.unit}`)),
  );
}

export function buildCatalogue(input: {
  familiaMaster: FamiliaMasterRow[];
  tariffRows: ParsedArticleTariffRow[];
  stock: StockRow[];
  overrides?: ImportOverrides;
}): { products: BuiltProduct[]; report: ImportReport } {
  const { familiaMaster, tariffRows, stock, overrides = {} } = input;
  const groupOverrides = overrides.groupOverrides ?? {};
  const variantLabelOverrides = overrides.variantLabelOverrides ?? {};

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
  const inconsistentFamiliaGroupKeys: string[] = [];

  // Pass 1: resolve each SKU's group (lineKey/displayName) and variant label,
  // purely from the article name's colour-code marker (ADR-0019 update).
  type ResolvedMember = {
    master: FamiliaMasterRow;
    lineKey: string;
    label: string;
    hasMarker: boolean;
  };
  const groups = new Map<string, { displayName: string; members: ResolvedMember[] }>();

  for (const master of familiaMaster) {
    if (!master.familia) emptyFamiliaSkus.push(master.sku);

    const rowsForSku = tariffRowsBySku.get(master.sku) ?? [];
    if (rowsForSku.length === 0) articlesWithoutTariffRows.push(master.sku);

    const derived = deriveNameBasedGroup(master.name);
    const lineDisplay = groupOverrides[master.sku] ?? derived.lineDisplay;
    const lineKey = normaliseLineKey(lineDisplay);
    const label = variantLabelOverrides[master.sku] ?? derived.label;

    const group = groups.get(lineKey) ?? { displayName: lineDisplay, members: [] };
    group.members.push({ master, lineKey, label, hasMarker: derived.hasMarker });
    groups.set(lineKey, group);
  }

  // Groups that ended up with exactly one member are either a genuine
  // standalone Product (no marker, e.g. VIVO ALGODON 3 — expected, not
  // flagged) or a marker-based group that never found its siblings (flagged
  // for a possible merge), plus the standalone pool feeds the near-duplicate
  // check below (ADR-0019 update).
  const singleMemberMarkerGroupSkus: string[] = [];
  const standaloneForDuplicateCheck: { sku: string; name: string }[] = [];
  for (const group of groups.values()) {
    if (group.members.length !== 1) continue;
    const [only] = group.members;
    if (only.hasMarker) {
      singleMemberMarkerGroupSkus.push(only.master.sku);
    } else {
      standaloneForDuplicateCheck.push({ sku: only.master.sku, name: only.master.name });
    }
  }
  const nearDuplicateStandaloneSkus = findNearDuplicateStandaloneSkus(standaloneForDuplicateCheck);

  // Pass 2: build a Product per group, with its Variants and product/variant prices.
  const defaultedCategorySkus: string[] = [];
  const usedSlugs = new Set<string>();

  const products: BuiltProduct[] = [...groups.values()].map(({ displayName, members }) => {
    // Web Familia (37-category): mode across the group's members.
    const familiaCounts = new Map<string | null, number>();
    for (const m of members) {
      familiaCounts.set(m.master.familia, (familiaCounts.get(m.master.familia) ?? 0) + 1);
    }
    let productFamilia: string | null = null;
    let bestCount = -1;
    for (const m of members) {
      // Iterate in member order so ties break on first-seen, deterministically.
      const c = familiaCounts.get(m.master.familia) ?? 0;
      if (c > bestCount) {
        bestCount = c;
        productFamilia = m.master.familia;
      }
    }
    if (new Set(members.map((m) => m.master.familia)).size > 1) {
      inconsistentFamiliaGroupKeys.push(members[0].lineKey);
    }

    for (const m of members) {
      if (categoryForFamilia(m.master.familia).defaulted) defaultedCategorySkus.push(m.master.sku);
    }
    const { category } = categoryForFamilia(productFamilia);

    // Width/Metros por pieza enrichment: first non-null across the whole group.
    let width: string | null = null;
    let metrosPorPieza: string | null = null;
    for (const m of members) {
      const rows = tariffRowsBySku.get(m.master.sku) ?? [];
      if (width === null) width = rows.find((r) => r.ancho !== null)?.ancho ?? null;
      if (metrosPorPieza === null) {
        metrosPorPieza = rows.find((r) => r.metrosPorPieza !== null)?.metrosPorPieza ?? null;
      }
    }
    const attributes: Record<string, string> = {};
    if (metrosPorPieza) attributes.metros_por_pieza = metrosPorPieza;

    // Build each variant's own full price set first.
    const variantPrices = members.map((m) => buildPriceRecords(tariffRowsBySku.get(m.master.sku) ?? []));

    // The product-level default is the most common price set among variants
    // (ADR-0019: "attach prices at product level unless they differ").
    const counts = new Map<string, { prices: PriceRecord[]; count: number }>();
    for (const prices of variantPrices) {
      const key = priceSetKey(prices);
      const entry = counts.get(key);
      if (entry) entry.count++;
      else counts.set(key, { prices, count: 1 });
    }
    let defaultPrices: PriceRecord[] = [];
    let defaultCount = -1;
    for (const prices of variantPrices) {
      const entry = counts.get(priceSetKey(prices))!;
      if (entry.count > defaultCount) {
        defaultCount = entry.count;
        defaultPrices = entry.prices;
      }
    }
    const defaultKey = priceSetKey(defaultPrices);

    const variants: BuiltVariant[] = members.map((m, i) => ({
      externalId: m.master.sku,
      label: m.label,
      active: (tariffRowsBySku.get(m.master.sku) ?? []).every((r) => r.active),
      stockTotal: stockBySku.get(m.master.sku) ?? null,
      prices: priceSetKey(variantPrices[i]) === defaultKey ? [] : variantPrices[i],
    }));

    let slug = slugify(displayName);
    if (usedSlugs.has(slug)) {
      let n = 2;
      while (usedSlugs.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    usedSlugs.add(slug);

    return {
      slug,
      name: displayName,
      category,
      familia: productFamilia,
      width,
      attributes,
      prices: defaultPrices,
      variants,
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
      inconsistentFamiliaGroupKeys,
      singleMemberMarkerGroupSkus,
      nearDuplicateStandaloneSkus,
    },
  };
}
