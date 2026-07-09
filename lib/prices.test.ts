import { describe, expect, it } from "vitest";
import {
  buildPriceRangeTable,
  buildPriceTable,
  formatAmount,
  formatPriceRangeCellText,
  formatPriceWithUnit,
  isIslandPriced,
  parsePriceInput,
  type PriceRow,
} from "@/lib/prices";

// #57: this coverage was ported from the now-deleted lib/price.test.ts when
// lib/price.ts (parsePriceInput, formatEur) was reconciled into this module.
// formatEur itself didn't survive — formatAmount (below) is the one display
// formatter now; its null contract differs deliberately (null, not a
// "consultar" string — callers already choose their own on-request label).

describe("parsePriceInput", () => {
  it("normalises to a canonical 2-decimal string for storage", () => {
    expect(parsePriceInput("1.5")).toBe("1.50");
    expect(parsePriceInput("10")).toBe("10.00");
  });

  it("accepts the Spanish comma decimal separator", () => {
    expect(parsePriceInput("1,50")).toBe("1.50");
    expect(parsePriceInput("12,9")).toBe("12.90");
  });

  it("treats blank or non-numeric input as no price (null)", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("   ")).toBeNull();
    expect(parsePriceInput("CONSULTA")).toBeNull();
    expect(parsePriceInput("abc")).toBeNull();
  });
});

describe("formatAmount", () => {
  // Intl.NumberFormat's es-ES currency output joins the amount and symbol with
  // a non-breaking space (U+00A0), not a regular space — assert against the
  // real character rather than eyeballing a copy-pasted literal.
  const NBSP = " ";

  it("always shows exactly 2 decimals", () => {
    expect(formatAmount("1.50", "es")).toBe(`1,50${NBSP}€`);
    expect(formatAmount("1.5", "es")).toBe(`1,50${NBSP}€`);
    expect(formatAmount("2", "es")).toBe(`2,00${NBSP}€`);
  });

  it("re-pads the trailing zero Postgres numeric loses through Number()", () => {
    // The exact regression from CONTEXT/ADR notes: numeric "10.00" → Number 10
    // → still 2 decimals, because Intl.NumberFormat's minimumFractionDigits
    // re-pads regardless of what Number() already dropped.
    expect(formatAmount("10.00", "es")).toBe(`10,00${NBSP}€`);
    expect(Number("10.00")).toBe(10); // the trap this guards against
  });

  it("returns null for a missing amount — callers choose their own on-request label", () => {
    expect(formatAmount(null, "es")).toBeNull();
  });
});

// Foam pricing is negotiated manually per client, not sold off the imported A3
// tariff (business rule, 2026-07-08) — CORTE/CORTE ISLAS/PLANCHA/PLANCHA ISLAS
// amounts are stored but must never reach a Client, even though the underlying
// price rows exist with real amounts and mallorca/men_ibz zones.

const foamPrices: PriceRow[] = [
  { zone: "mallorca", unit: "m3", amount: "5.00", onRequest: false, qualifier: null },
  { zone: "men_ibz", unit: "m3", amount: "7.50", onRequest: false, qualifier: null },
  { zone: "mallorca", unit: "plancha", amount: "12.00", onRequest: false, qualifier: null },
  { zone: "men_ibz", unit: "plancha", amount: null, onRequest: true, qualifier: "CONSULTA" },
];

describe("buildPriceTable", () => {
  it("renders an empty table for foam's m3/plancha units — never surfaces a manually-negotiated price", () => {
    const table = buildPriceTable(foamPrices);

    expect(table.rows).toEqual([]);
    expect(table.zones).toEqual([]);
  });

  it("still renders a fabric's metro/pieza prices normally", () => {
    const fabricPrices: PriceRow[] = [
      { zone: "all", unit: "metro", amount: "18.50", onRequest: false, qualifier: null },
      { zone: "all", unit: "pieza", amount: "13.20", onRequest: false, qualifier: null },
    ];

    const table = buildPriceTable(fabricPrices);

    expect(table.zones).toEqual(["all"]);
    expect(table.rows.map((r) => r.unit)).toEqual(["metro", "pieza"]);
  });
});

describe("formatPriceWithUnit", () => {
  it("returns null for a foam m3/plancha row, even with a real stored amount", () => {
    expect(formatPriceWithUnit(foamPrices[0], "es")).toBeNull();
  });
});

describe("isIslandPriced", () => {
  it("returns false for a foam-only price set (its mallorca/men_ibz rows aren't displayable units)", () => {
    expect(isIslandPriced(foamPrices)).toBe(false);
  });

  it("still returns true for a genuinely island-priced displayable unit", () => {
    const materialPrices: PriceRow[] = [
      { zone: "mallorca", unit: "kg", amount: "5.80", onRequest: false, qualifier: null },
      { zone: "men_ibz", unit: "kg", amount: "10.75", onRequest: false, qualifier: "15KG" },
    ];
    expect(isIslandPriced(materialPrices)).toBe(true);
  });
});

describe("buildPriceRangeTable", () => {
  it("collapses min===max into a single value when every variant shares the same price (ADR-0019)", () => {
    const variants: PriceRow[][] = [
      [{ zone: "all", unit: "unidad", amount: "12.00", onRequest: false, qualifier: null }],
      [{ zone: "all", unit: "unidad", amount: "12.00", onRequest: false, qualifier: null }],
    ];

    const table = buildPriceRangeTable(variants);

    expect(table.rows).toEqual([
      { unit: "unidad", cells: [{ zone: "all", min: "12.00", max: "12.00", onRequest: false, qualifier: null }] },
    ]);
  });

  it("reports a min/max spread when variants differ — the ~68 colour-dependent lines", () => {
    const variants: PriceRow[][] = [
      [{ zone: "all", unit: "unidad", amount: "12.00", onRequest: false, qualifier: null }],
      [{ zone: "all", unit: "unidad", amount: "12.00", onRequest: false, qualifier: null }],
      [{ zone: "all", unit: "unidad", amount: "15.00", onRequest: false, qualifier: null }],
    ];

    const table = buildPriceRangeTable(variants);

    expect(table.rows[0].cells[0]).toEqual({
      zone: "all",
      min: "12.00",
      max: "15.00",
      onRequest: false,
      qualifier: null,
    });
  });

  it("never surfaces a foam m3/plancha price, even when variants differ", () => {
    const variants: PriceRow[][] = [
      [{ zone: "mallorca", unit: "m3", amount: "5.00", onRequest: false, qualifier: null }],
      [{ zone: "mallorca", unit: "m3", amount: "9.00", onRequest: false, qualifier: null }],
    ];

    const table = buildPriceRangeTable(variants);

    expect(table.rows).toEqual([]);
    expect(table.zones).toEqual([]);
  });
});

describe("formatPriceRangeCellText", () => {
  const labels = { onRequestLabel: "Precio a consultar", fromLabel: "desde" };

  it("shows a single value with its unit suffix when every variant agrees", () => {
    const cell = { zone: "all", min: "12.00", max: "12.00", onRequest: false, qualifier: null };
    expect(formatPriceRangeCellText(cell, "unidad", "es", labels)?.text).toBe("12,00 €/ud");
  });

  it("prefixes with the 'from' label when variants differ (ADR-0019)", () => {
    const cell = { zone: "all", min: "12.00", max: "15.00", onRequest: false, qualifier: null };
    expect(formatPriceRangeCellText(cell, "unidad", "es", labels)?.text).toBe("desde 12,00 €/ud");
  });

  it("uses the on-request label for a CONSULTA cell", () => {
    const cell = { zone: "men_ibz", min: null, max: null, onRequest: true, qualifier: null };
    expect(formatPriceRangeCellText(cell, "m3", "es", labels)?.text).toBe("Precio a consultar");
  });

  it("returns null when the cell has nothing displayable", () => {
    const cell = { zone: "all", min: null, max: null, onRequest: false, qualifier: null };
    expect(formatPriceRangeCellText(cell, "unidad", "es", labels)).toBeNull();
  });

  it("carries the qualifier through unchanged", () => {
    const cell = { zone: "men_ibz", min: "10.75", max: "10.75", onRequest: false, qualifier: "15KG" };
    expect(formatPriceRangeCellText(cell, "kg", "es", labels)?.qualifier).toBe("15KG");
  });
});
