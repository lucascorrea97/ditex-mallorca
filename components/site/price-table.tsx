// Client Area price rendering (ADR-0011). Two presentations of the same data:
//   • <PriceTable>  — full (unit × zone) grid for the product page.
//   • <PriceInline> — one-line summary for catalogue list rows.
// Both are price-reveal-only: they are rendered exclusively behind the auth check on
// each page, never in the logged-out Catalogue. Keep the layout plain and legible for
// older, non-technical Clients (ADR-0001).

import type { Locale } from "@/lib/i18n";
import {
  buildPriceTable,
  formatAmount,
  formatPriceWithUnit,
  isIslandPriced,
  type PriceRow,
} from "@/lib/prices";

type Labels = {
  // zone key ("mallorca" | "men_ibz" | "all") → column header
  zoneLabels: Record<string, string>;
  // saleUnit key → row label (reuses dict.catalogo.saleUnits)
  unitLabels: Record<string, string>;
  onRequestLabel: string; // "Precio a consultar"
};

function cellText(
  price: PriceRow | undefined,
  locale: Locale,
  onRequestLabel: string,
): string {
  if (!price) return "—";
  if (price.onRequest) return onRequestLabel;
  const withUnit = formatPriceWithUnit(price, locale);
  return withUnit ?? onRequestLabel;
}

export function PriceTable({
  prices,
  locale,
  labels,
}: {
  prices: PriceRow[];
  locale: Locale;
  labels: Labels;
}) {
  const { zones, rows } = buildPriceTable(prices);
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-stone-200">
            <th className="py-2 pr-4 text-xs font-semibold uppercase tracking-widest text-stone-400" />
            {zones.map((zone) => (
              <th
                key={zone}
                className="py-2 pl-4 text-right text-xs font-semibold uppercase tracking-widest text-stone-500"
              >
                {labels.zoneLabels[zone] ?? zone}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ unit, cells }) => (
            <tr key={unit} className="border-b border-stone-100 last:border-0">
              <th
                scope="row"
                className="py-3 pr-4 text-sm font-medium text-stone-600"
              >
                {labels.unitLabels[unit] ?? unit}
              </th>
              {cells.map(({ zone, price }) => (
                <td
                  key={zone}
                  className="py-3 pl-4 text-right text-sm tabular-nums text-stone-900"
                >
                  <span className="font-semibold">
                    {cellText(price, locale, labels.onRequestLabel)}
                  </span>
                  {price?.qualifier && (
                    <span className="ml-1 text-xs font-normal text-stone-400">
                      ({price.qualifier})
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Compact one-liner for list rows: "Metraje 18,50 €/m · Pieza 13,20 €/m" for fabrics,
// "Mallorca 5,80 €/kg · Men-Ibz 10,75 €/kg" for island-priced materials.
export function PriceInline({
  prices,
  locale,
  labels,
}: {
  prices: PriceRow[];
  locale: Locale;
  labels: Labels;
}) {
  const island = isIslandPriced(prices);
  const shown = prices.filter((p) => !p.onRequest && p.amount !== null);

  if (shown.length === 0) {
    const onRequest = prices.some((p) => p.onRequest);
    return onRequest ? (
      <span className="text-sm text-stone-500">{labels.onRequestLabel}</span>
    ) : null;
  }

  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm text-stone-700">
      {shown.map((price, i) => {
        const label = island
          ? (labels.zoneLabels[price.zone] ?? price.zone)
          : (labels.unitLabels[price.unit] ?? price.unit);
        const amount = formatPriceWithUnit(price, locale) ?? formatAmount(price.amount, locale);
        return (
          <span key={`${price.zone}-${price.unit}-${i}`}>
            {i > 0 && <span className="mr-1.5 text-stone-300">·</span>}
            <span className="text-stone-400">{label}</span>{" "}
            <span className="font-semibold text-stone-900 tabular-nums">
              {amount}
            </span>
            {price.qualifier && (
              <span className="ml-1 text-xs text-stone-400">
                ({price.qualifier})
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
