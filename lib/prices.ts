// Price display helpers for the Client Area (ADR-0011: one product DB, two views —
// the public Catalogue hides prices, the gated Client Area reveals them on the same
// pages). These utilities take the `prices` rows exactly as stored (db/schema.ts) and
// turn them into a legible Mallorca / Men-Ibz table or a compact inline summary.
//
// IMPORTANT: only the SALE price (`amount`) ever reaches this layer. Precio coste /
// Precio compra do not exist in the datastore and must never be exposed (CONTEXT.md).

import type { Locale } from "@/lib/i18n";

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
// group naturally. "pvp" (A3 tariffs PVP / ESPUMA PVP) is deliberately absent — those
// are retail walk-in prices, stored per ADR-0018 but never shown on the web; leaving
// them out of this whitelist is what makes buildPriceTable/formatPriceWithUnit skip
// them automatically.
const UNIT_ORDER = [
  "metro",
  "pieza",
  "metro_lineal",
  "kg",
  "unidad",
  "m3",
  "plancha",
  "caja",
  "embalaje",
];

// Short suffix appended after the amount so every price reads with its unit
// ("18,50 €/m", "5,80 €/kg") — the acceptance criterion "prices shown with units".
export const UNIT_SUFFIX: Record<string, string> = {
  metro: "m",
  metro_lineal: "m",
  pieza: "pieza",
  kg: "kg",
  unidad: "ud",
  m3: "m³",
  plancha: "plancha",
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
// has no showable amount.
export function formatPriceWithUnit(price: PriceRow, locale: Locale): string | null {
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
export function buildPriceTable(prices: PriceRow[]): PriceTable {
  const zones = ZONE_ORDER.filter((z) => prices.some((p) => p.zone === z));
  const units = UNIT_ORDER.filter((u) => prices.some((p) => p.unit === u));
  const rows: PriceTableRow[] = units.map((unit) => ({
    unit,
    cells: zones.map((zone) => ({
      zone,
      price: prices.find((p) => p.unit === unit && p.zone === zone),
    })),
  }));
  return { zones, rows };
}

// True when the item carries the two-column island pricing (Mallorca / Men-Ibz).
export function isIslandPriced(prices: PriceRow[]): boolean {
  return prices.some((p) => p.zone === "mallorca" || p.zone === "men_ibz");
}
