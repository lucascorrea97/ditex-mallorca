// The one pricing-helpers module (#57 reconciled the former lib/price.ts into this
// file — same domain, no reason for two near-identically-named modules). Two
// directions:
//   - input -> storage: parsePriceInput (admin Server Actions, the importer).
//   - storage -> display: everything else, for the Client Area (ADR-0011: one
//     product DB, two views — the public Catalogue hides prices, the gated
//     Client Area reveals them on the same pages). These take the `prices` rows
//     exactly as stored (db/schema.ts) and turn them into a legible Mallorca /
//     Men-Ibz table or a compact inline summary.
//
// IMPORTANT: only the SALE price (`amount`) ever reaches this layer. Precio coste /
// Precio compra do not exist in the datastore and must never be exposed (CONTEXT.md).

import type { Locale } from "@/lib/i18n";

/**
 * Normalise an admin-entered amount into a canonical 2-decimal string for storage,
 * or `null` when the field is blank or not a number. Accepts a comma or dot decimal
 * separator, since Spanish keyboards type "1,50". CONSULTA (on request) is handled by
 * the caller, not here — a `null` amount here just means "nothing entered".
 */
export function parsePriceInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed.replace(",", "."));
  if (Number.isNaN(num)) return null;
  return num.toFixed(2);
}

// A single price row, narrowed to the fields the display needs. `amount` is a numeric
// string because Postgres `numeric` serialises that way — and it DROPS trailing zeros
// ("18.50" comes back as "18.5"), so we always reformat to 2 decimals below.
export type PriceRow = {
  zone: string; // "all" | "mallorca" | "men_ibz"
  unit: string; // saleUnit enum
  amount: string | null; // null => on request (CONSULTA)
  onRequest: boolean;
  qualifier: string | null; // free-form tariff note, e.g. "15KG"
};

// Column order for the island pricing (CONTEXT.md: Mallorca first, then Men-Ibz).
// "all" is the single-zone fallback for items priced the same across islands (fabrics).
const ZONE_ORDER = ["mallorca", "men_ibz", "all"] as const;

// Row order across the mixed unit range so fabrics read Metraje→Pieza and materials
// group naturally.
//
// "pvp" (A3 tariffs PVP / ESPUMA PVP) is deliberately absent — those are retail
// walk-in prices, stored per ADR-0018 but never shown on the web.
//
// "m3"/"plancha" (foam's CORTE/CORTE ISLAS/PLANCHA/PLANCHA ISLAS) are also
// deliberately absent: foam pricing is negotiated manually per client, not sold
// off the imported A3 tariff, so those amounts are stored (for reference/admin
// use) but must never reach a Client. Foam items still show in the Catalogue —
// only the price is hidden, not the product.
//
// Leaving a unit out of this whitelist is what makes buildPriceTable /
// formatPriceWithUnit skip it automatically.
const UNIT_ORDER = ["metro", "pieza", "metro_lineal", "kg", "unidad", "caja", "embalaje"];

// Short suffix appended after the amount so every price reads with its unit
// ("18,50 €/m", "5,80 €/kg") — the acceptance criterion "prices shown with units".
export const UNIT_SUFFIX: Record<string, string> = {
  metro: "m",
  metro_lineal: "m",
  pieza: "pieza",
  kg: "kg",
  unidad: "ud",
  caja: "caja",
  embalaje: "embalaje",
};

// Euro-using locale tag per site language, so Intl formats "18,50 €" (es/ca) vs
// "€18.50" (en) correctly. CONTEXT.md: prices are in euros.
function localeTag(locale: Locale): string {
  switch (locale) {
    case "ca":
      return "ca-ES";
    case "en":
      return "en-IE"; // English locale that uses the euro
    default:
      return "es-ES";
  }
}

// Format a stored amount to a 2-decimal euro string, or null when there is nothing to
// show (on request / missing). Guards against the Postgres trailing-zero drop.
export function formatAmount(amount: string | null, locale: Locale): string | null {
  if (amount === null) return null;
  const n = Number(amount);
  if (Number.isNaN(n)) return null;
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// Amount already suffixed with its unit, e.g. "18,50 €/m". Returns null when the row
// has no showable amount, OR when its unit isn't in the display whitelist (UNIT_ORDER)
// — e.g. foam's m3/plancha, whose prices are stored but must never reach a Client.
export function formatPriceWithUnit(price: PriceRow, locale: Locale): string | null {
  if (!UNIT_ORDER.includes(price.unit)) return null;
  const amount = formatAmount(price.amount, locale);
  if (amount === null) return null;
  const suffix = UNIT_SUFFIX[price.unit];
  return suffix ? `${amount}/${suffix}` : amount;
}

export type PriceTableCell = { zone: string; price: PriceRow | undefined };
export type PriceTableRow = { unit: string; cells: PriceTableCell[] };
export type PriceTable = { zones: string[]; rows: PriceTableRow[] };

// Pivot the flat price rows into a (unit × zone) grid. Fabrics collapse to a single
// "all" column with Metraje/Pieza rows; island-priced materials get Mallorca + Men-Ibz
// columns. Any (unit, zone) combination absent from the data renders as an empty cell.
// Rows whose unit isn't in the display whitelist (UNIT_ORDER) — e.g. foam's m3/plancha
// — are dropped before computing zones too, so a foam-only price set renders a fully
// empty table rather than phantom Mallorca/Men-Ibz column headers with no cells.
export function buildPriceTable(prices: PriceRow[]): PriceTable {
  const displayable = prices.filter((p) => UNIT_ORDER.includes(p.unit));
  const zones = ZONE_ORDER.filter((z) => displayable.some((p) => p.zone === z));
  const units = UNIT_ORDER.filter((u) => displayable.some((p) => p.unit === u));
  const rows: PriceTableRow[] = units.map((unit) => ({
    unit,
    cells: zones.map((zone) => ({
      zone,
      price: displayable.find((p) => p.unit === unit && p.zone === zone),
    })),
  }));
  return { zones, rows };
}

// True when the item carries the two-column island pricing (Mallorca / Men-Ibz).
// Only looks at whitelisted (displayable) units — foam's mallorca/men_ibz rows
// exist in storage but their units are excluded from UNIT_ORDER above, so a
// foam-only price set correctly reports false here rather than showing empty
// island columns with no visible prices underneath.
export function isIslandPriced(prices: PriceRow[]): boolean {
  return prices.some((p) => UNIT_ORDER.includes(p.unit) && (p.zone === "mallorca" || p.zone === "men_ibz"));
}

// One (unit, zone) cell across every Variant of a Product line. `min`/`max` are
// equal when every variant shows the same amount (ADR-0019: "product-level
// price shown once when shared") — the caller renders a single value in that
// case and a "desde <min>" ("from") treatment when they differ, without ever
// exposing which specific colourway costs what (ADR-0001: a plain range beats
// a per-colour configurator).
export type PriceRangeCell = {
  zone: string;
  min: string | null; // 2-decimal string, or null when nothing displayable
  max: string | null;
  onRequest: boolean;
  qualifier: string | null;
};
export type PriceRangeRow = { unit: string; cells: PriceRangeCell[] };
export type PriceRangeTable = { zones: string[]; rows: PriceRangeRow[] };

// Same whitelist/pivot as buildPriceTable, but folded across every Variant's
// own effective price set (its override, or the Product's default when it has
// none) instead of a single price list.
export function buildPriceRangeTable(variantPriceSets: PriceRow[][]): PriceRangeTable {
  const displayableSets = variantPriceSets.map((set) => set.filter((p) => UNIT_ORDER.includes(p.unit)));
  const zones = ZONE_ORDER.filter((z) => displayableSets.some((set) => set.some((p) => p.zone === z)));
  const units = UNIT_ORDER.filter((u) => displayableSets.some((set) => set.some((p) => p.unit === u)));

  const rows: PriceRangeRow[] = units.map((unit) => ({
    unit,
    cells: zones.map((zone) => {
      const matches = displayableSets
        .map((set) => set.find((p) => p.unit === unit && p.zone === zone))
        .filter((p): p is PriceRow => p !== undefined);

      const amounts = matches
        .filter((p) => !p.onRequest && p.amount !== null)
        .map((p) => Number(p.amount));
      const qualifier = matches.find((p) => p.qualifier)?.qualifier ?? null;

      if (amounts.length === 0) {
        return {
          zone,
          min: null,
          max: null,
          onRequest: matches.some((p) => p.onRequest),
          qualifier,
        };
      }
      return {
        zone,
        min: Math.min(...amounts).toFixed(2),
        max: Math.max(...amounts).toFixed(2),
        onRequest: false,
        qualifier,
      };
    }),
  }));

  return { zones, rows };
}
