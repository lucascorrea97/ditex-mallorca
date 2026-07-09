import { describe, expect, it } from "vitest";
import {
  buildPriceRangeTable,
  buildPriceTable,
  formatPriceWithUnit,
  isIslandPriced,
  type PriceRow,
} from "@/lib/prices";

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
