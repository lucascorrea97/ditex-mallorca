import { describe, expect, it } from "vitest";
import {
  aggregateStock,
  buildCatalogue,
  buildPriceRecords,
  categoryForFamilia,
  dedupeTariffRows,
  mapTariffCode,
  parseFamiliaMasterRow,
  parseNewFormatRow,
  parseOldFormatRow,
  parseStockRow,
} from "@/lib/import/parse";
import type { FamiliaMasterRow, StockRow } from "@/lib/import/parse";

// Synthetic fixtures only — never real A3 export rows (they carry cost prices).

function tariffRow(overrides: Partial<import("@/lib/import/parse").ParsedArticleTariffRow>) {
  return {
    sku: "T0000001",
    name: "TEST FABRIC",
    active: true,
    ancho: null,
    metrosPorPieza: null,
    tariffCode: 2,
    tariffName: "METRAJE",
    amount: "10.00",
    ...overrides,
  };
}

describe("parseNewFormatRow", () => {
  it("extracts sku, name, tariff code/name, and normalises the comma-decimal amount", () => {
    const row = {
      "Cód. artículo": "T6060928",
      "Artículo": "TERCEIRA C-9128 CRUDO",
      "Bloqueado": "No",
      "Precio de la tarifa": "22,3",
      "Nombre de la tarifa": "METRAJE",
      "Cod. tarifa": "       2",
    };

    const parsed = parseNewFormatRow(row);

    expect(parsed?.sku).toBe("T6060928");
    expect(parsed?.name).toBe("TERCEIRA C-9128 CRUDO");
    expect(parsed?.tariffCode).toBe(2);
    expect(parsed?.tariffName).toBe("METRAJE");
    expect(parsed?.amount).toBe("22.30");
  });

  it("marks Bloqueado: Sí as inactive, and No/absent as active", () => {
    const blocked = parseNewFormatRow({
      "Cód. artículo": "M353007",
      "Artículo": "HILO ESPUMA",
      "Bloqueado": "Sí",
      "Precio de la tarifa": "10",
      "Nombre de la tarifa": "PVP",
      "Cod. tarifa": "1",
    });
    expect(blocked?.active).toBe(false);

    const notBlocked = parseNewFormatRow({
      "Cód. artículo": "M353008",
      "Artículo": "HILO ESPUMA 2",
      "Bloqueado": "No",
      "Precio de la tarifa": "10",
      "Nombre de la tarifa": "PVP",
      "Cod. tarifa": "1",
    });
    expect(notBlocked?.active).toBe(true);
  });

  it("never reads Precio coste / Precio compra, even if present on the row", () => {
    const row = {
      "Cód. artículo": "T6060928",
      "Artículo": "TERCEIRA C-9128 CRUDO",
      "Bloqueado": "No",
      "Precio coste": "5,10",
      "Precio compra": "6,20",
      "Precio venta": "9,99",
      "Precio de la tarifa": "22,3",
      "Nombre de la tarifa": "METRAJE",
      "Cod. tarifa": "2",
    };

    const parsed = parseNewFormatRow(row);

    expect(JSON.stringify(parsed)).not.toContain("5,1");
    expect(JSON.stringify(parsed)).not.toContain("6,2");
    expect(JSON.stringify(parsed)).not.toContain("9,99");
    expect(Object.keys(parsed ?? {})).not.toContain("Precio coste");
    expect(Object.keys(parsed ?? {})).not.toContain("Precio compra");
  });
});

describe("parseOldFormatRow", () => {
  it("extracts sku, name, ancho, metros por pieza, tariff code/name, and normalises the float amount", () => {
    const row = {
      "CODART": "T0001801",
      " Cód familia": "T0001",
      "Desc. familia": "OTELLO",
      "Descripción": "OTELLO C-1 CRUDO",
      "PVP": 25,
      "Ancho": "320 CM",
      "Metros por pieza": "      30",
      "TARIFA": "       2",
      "DESCTARIFA": "METRAJE",
      "Precio tarifa": 18.5,
    };

    const parsed = parseOldFormatRow(row);

    expect(parsed?.sku).toBe("T0001801");
    expect(parsed?.name).toBe("OTELLO C-1 CRUDO");
    expect(parsed?.active).toBe(true); // no Bloqueado column in this format
    expect(parsed?.ancho).toBe("320 CM");
    expect(parsed?.metrosPorPieza).toBe("30");
    expect(parsed?.tariffCode).toBe(2);
    expect(parsed?.tariffName).toBe("METRAJE");
    expect(parsed?.amount).toBe("18.50");
  });

  it("treats blank Ancho and null Metros por pieza as absent, not zero", () => {
    const row = {
      "CODART": "M010101",
      "Descripción": "JUNTA EP-403G",
      "Ancho": "",
      "Metros por pieza": null,
      "TARIFA": "       9",
      "DESCTARIFA": "UNIDAD",
      "Precio tarifa": 40,
    };

    const parsed = parseOldFormatRow(row);

    expect(parsed?.ancho).toBeNull();
    expect(parsed?.metrosPorPieza).toBeNull();
  });
});

describe("mapTariffCode", () => {
  it("maps all 11 known tariff codes to their (zone, unit)", () => {
    expect(mapTariffCode(1)).toEqual({ zone: "all", unit: "pvp" });
    expect(mapTariffCode(2)).toEqual({ zone: "all", unit: "metro" });
    expect(mapTariffCode(3)).toEqual({ zone: "all", unit: "pieza" });
    expect(mapTariffCode(4)).toEqual({ zone: "all", unit: "pvp" });
    expect(mapTariffCode(5)).toEqual({ zone: "mallorca", unit: "m3" });
    expect(mapTariffCode(6)).toEqual({ zone: "men_ibz", unit: "m3" });
    expect(mapTariffCode(7)).toEqual({ zone: "mallorca", unit: "plancha" });
    expect(mapTariffCode(8)).toEqual({ zone: "men_ibz", unit: "plancha" });
    expect(mapTariffCode(9)).toEqual({ zone: "all", unit: "unidad" });
    expect(mapTariffCode(10)).toEqual({ zone: "all", unit: "caja" });
    expect(mapTariffCode(11)).toEqual({ zone: "all", unit: "embalaje" });
  });

  it("returns undefined for an unrecognised tariff code", () => {
    expect(mapTariffCode(99)).toBeUndefined();
  });
});

describe("parseFamiliaMasterRow", () => {
  it("extracts sku, name and familia", () => {
    const parsed = parseFamiliaMasterRow({
      "Cód. artículo": "M310105",
      "Artículo": "GRAPAS BEA 80/12",
      "Familia": "GRAPAS",
    });

    expect(parsed).toEqual({ sku: "M310105", name: "GRAPAS BEA 80/12", familia: "GRAPAS" });
  });

  it("treats a blank/whitespace-only Familia as null, not an error", () => {
    const parsed = parseFamiliaMasterRow({
      "Cód. artículo": "M561400",
      "Artículo": "MALLA TRICOTTUBE",
      "Familia": "   ",
    });

    expect(parsed?.familia).toBeNull();
  });
});

describe("parseStockRow", () => {
  it("extracts sku and stock total, normalising the comma decimal", () => {
    const parsed = parseStockRow({
      "Cód. artículo": "T4004900",
      "Artículo": "ACOLCHADO ROMBO 15X15 C-BL",
      "Stock Total": "59,8",
      "Almacén": "Almacén central",
      "Stock Almacen": "59,8",
      "Und.Ubicación": "2",
      "LOTE": "15802",
    });

    expect(parsed).toEqual({ sku: "T4004900", stockTotal: "59.80" });
  });
});

describe("aggregateStock", () => {
  it("collapses repeated per-lot rows for the same SKU into one entry (Stock Total is already the SKU total, not a per-lot quantity)", () => {
    const rows = [
      { sku: "T4004900", stockTotal: "59.80" },
      { sku: "T4004900", stockTotal: "59.80" },
      { sku: "T4004900", stockTotal: "59.80" },
    ];

    const { stockBySku, conflicts } = aggregateStock(rows);

    expect(stockBySku.size).toBe(1);
    expect(stockBySku.get("T4004900")).toBe("59.80");
    expect(conflicts).toEqual([]);
  });

  it("keeps the first value and flags a conflict when lot rows disagree", () => {
    const rows = [
      { sku: "T4004900", stockTotal: "59.80" },
      { sku: "T4004900", stockTotal: "12.00" },
    ];

    const { stockBySku, conflicts } = aggregateStock(rows);

    expect(stockBySku.get("T4004900")).toBe("59.80");
    expect(conflicts).toEqual(["T4004900"]);
  });
});

describe("categoryForFamilia", () => {
  it("maps known Familias to their explicit category, not defaulted", () => {
    expect(categoryForFamilia("TELA")).toEqual({ category: "fabric", defaulted: false });
    expect(categoryForFamilia("ESPUMA")).toEqual({ category: "foam", defaulted: false });
    expect(categoryForFamilia("FOAMIZADO")).toEqual({ category: "foam", defaulted: false });
    expect(categoryForFamilia("PIEL")).toEqual({ category: "polipiel", defaulted: false });
    expect(categoryForFamilia("PLÁSTICOS")).toEqual({ category: "pvc", defaulted: false });
    expect(categoryForFamilia("BOATELLE")).toEqual({ category: "material", defaulted: false });
    expect(categoryForFamilia("GRAPAS")).toEqual({ category: "accessory", defaulted: false });
  });

  it("defaults to accessory when familia is null, blank, or unrecognised", () => {
    expect(categoryForFamilia(null)).toEqual({ category: "accessory", defaulted: true });
    expect(categoryForFamilia("")).toEqual({ category: "accessory", defaulted: true });
    expect(categoryForFamilia("UN FAMILIA NUEVA")).toEqual({
      category: "accessory",
      defaulted: true,
    });
  });
});

describe("dedupeTariffRows", () => {
  it("keeps the first row and reports the rest as duplicates when (sku, tariffCode) repeats", () => {
    const rows = [
      tariffRow({ sku: "T0000001", tariffCode: 2, amount: "10.00" }),
      tariffRow({ sku: "T0000001", tariffCode: 2, amount: "10.00" }),
      tariffRow({ sku: "T0000001", tariffCode: 3, amount: "7.00" }),
    ];

    const { rows: deduped, duplicates } = dedupeTariffRows(rows);

    expect(deduped).toEqual([rows[0], rows[2]]);
    expect(duplicates).toEqual([rows[1]]);
  });

  it("does not dedupe two different tariff codes that map to the same (zone, unit) — e.g. PVP and ESPUMA PVP", () => {
    const rows = [
      tariffRow({ sku: "M0000001", tariffCode: 1, tariffName: "PVP", amount: "10.00" }),
      tariffRow({ sku: "M0000001", tariffCode: 4, tariffName: "ESPUMA PVP", amount: "12.00" }),
    ];

    const { rows: deduped, duplicates } = dedupeTariffRows(rows);

    expect(deduped).toHaveLength(2);
    expect(duplicates).toEqual([]);
  });
});

describe("buildPriceRecords", () => {
  it("maps each deduped tariff row to its (zone, unit, amount)", () => {
    const rows = [
      tariffRow({ sku: "T1", tariffCode: 2, tariffName: "METRAJE", amount: "18.50" }),
      tariffRow({ sku: "T1", tariffCode: 3, tariffName: "PIEZA", amount: "13.20" }),
    ];

    const prices = buildPriceRecords(rows);

    expect(prices).toEqual([
      { zone: "all", unit: "metro", amount: "18.50", onRequest: false, qualifier: null },
      { zone: "all", unit: "pieza", amount: "13.20", onRequest: false, qualifier: null },
    ]);
  });

  it("synthesizes a CONSULTA men_ibz row for foam CORTE with no CORTE ISLAS", () => {
    const rows = [
      tariffRow({ sku: "M1", tariffCode: 5, tariffName: "CORTE", amount: "5.00" }),
    ];

    const prices = buildPriceRecords(rows);

    expect(prices).toEqual([
      { zone: "mallorca", unit: "m3", amount: "5.00", onRequest: false, qualifier: null },
      { zone: "men_ibz", unit: "m3", amount: null, onRequest: true, qualifier: "CONSULTA" },
    ]);
  });

  it("does not synthesize CONSULTA when CORTE ISLAS is already present", () => {
    const rows = [
      tariffRow({ sku: "M1", tariffCode: 5, tariffName: "CORTE", amount: "5.00" }),
      tariffRow({ sku: "M1", tariffCode: 6, tariffName: "CORTE ISLAS", amount: "7.50" }),
    ];

    const prices = buildPriceRecords(rows);

    expect(prices).toEqual([
      { zone: "mallorca", unit: "m3", amount: "5.00", onRequest: false, qualifier: null },
      { zone: "men_ibz", unit: "m3", amount: "7.50", onRequest: false, qualifier: null },
    ]);
  });

  it("does not synthesize CONSULTA for non-foam units (e.g. METRAJE has no islands pair)", () => {
    const rows = [tariffRow({ sku: "T1", tariffCode: 2, tariffName: "METRAJE", amount: "18.50" })];

    const prices = buildPriceRecords(rows);

    expect(prices).toEqual([
      { zone: "all", unit: "metro", amount: "18.50", onRequest: false, qualifier: null },
    ]);
  });
});

describe("buildCatalogue", () => {
  const familiaMaster: FamiliaMasterRow[] = [
    { sku: "T0001801", name: "OTELLO C-1 CRUDO", familia: "TELA" },
  ];

  it("builds one product per familia-master SKU, joining its tariff prices and stock", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, tariffName: "METRAJE", amount: "18.50" }),
      tariffRow({ sku: "T0001801", tariffCode: 3, tariffName: "PIEZA", amount: "13.20" }),
    ];
    const stock: StockRow[] = [{ sku: "T0001801", stockTotal: "59.80" }];

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock });

    expect(products).toEqual([
      {
        externalId: "T0001801",
        slug: "t0001801",
        name: "OTELLO C-1 CRUDO",
        category: "fabric",
        familia: "TELA",
        active: true,
        width: null,
        attributes: {},
        stockTotal: "59.80",
        prices: [
          { zone: "all", unit: "metro", amount: "18.50", onRequest: false, qualifier: null },
          { zone: "all", unit: "pieza", amount: "13.20", onRequest: false, qualifier: null },
        ],
      },
    ]);
    expect(report.articlesWithoutTariffRows).toEqual([]);
    expect(report.emptyFamiliaSkus).toEqual([]);
    expect(report.unmatchedTariffSkus).toEqual([]);
    expect(report.unmatchedStockSkus).toEqual([]);
  });

  it("gives a SKU absent from the stock file a null stockTotal (no stock, not zero)", () => {
    const tariffRows = [tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50" })];

    const { products } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products[0].stockTotal).toBeNull();
  });

  it("flags a familia-master SKU with no tariff rows in the report, but still imports it", () => {
    const { products, report } = buildCatalogue({ familiaMaster, tariffRows: [], stock: [] });

    expect(products).toHaveLength(1);
    expect(products[0].prices).toEqual([]);
    expect(report.articlesWithoutTariffRows).toEqual(["T0001801"]);
  });

  it("flags an empty-Familia master row and defaults its category, but still imports it", () => {
    const blankFamiliaMaster: FamiliaMasterRow[] = [
      { sku: "M561400", name: "MALLA TRICOTTUBE", familia: null },
    ];
    const tariffRows = [tariffRow({ sku: "M561400", tariffCode: 9, amount: "5.00" })];

    const { products, report } = buildCatalogue({
      familiaMaster: blankFamiliaMaster,
      tariffRows,
      stock: [],
    });

    expect(products[0].category).toBe("accessory");
    expect(products[0].familia).toBeNull();
    expect(report.emptyFamiliaSkus).toEqual(["M561400"]);
  });

  it("excludes a tariff row whose SKU isn't in the familia master, and reports it as unmatched", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50" }),
      tariffRow({ sku: "T9999999", tariffCode: 2, amount: "1.00" }),
    ];

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products).toHaveLength(1);
    expect(report.unmatchedTariffSkus).toEqual(["T9999999"]);
  });

  it("reports a stock row whose SKU isn't in the familia master as unmatched", () => {
    const tariffRows = [tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50" })];
    const stock: StockRow[] = [{ sku: "T9999999", stockTotal: "5.00" }];

    const { report } = buildCatalogue({ familiaMaster, tariffRows, stock });

    expect(report.unmatchedStockSkus).toEqual(["T9999999"]);
  });

  it("carries width/metros por pieza enrichment and dedupes tariff rows", () => {
    const tariffRows = [
      tariffRow({
        sku: "T0001801",
        tariffCode: 2,
        amount: "18.50",
        ancho: "320 CM",
        metrosPorPieza: "30",
      }),
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50" }), // exact duplicate
    ];

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products[0].width).toBe("320 CM");
    expect(products[0].attributes).toEqual({ metros_por_pieza: "30" });
    expect(products[0].prices).toHaveLength(1);
    expect(report.duplicateTariffRowCount).toBe(1);
  });
});
