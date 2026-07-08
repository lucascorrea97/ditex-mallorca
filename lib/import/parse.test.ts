import { describe, expect, it } from "vitest";
import {
  aggregateStock,
  buildCatalogue,
  buildPriceRecords,
  categoryForFamilia,
  dedupeTariffRows,
  deriveFallbackGroup,
  deriveVariantLabel,
  mapTariffCode,
  normaliseLineKey,
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
    familiaDescripcion: null,
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
    // The go-forward filtro doesn't export Desc. familia (ADR-0019) — grouping
    // for these rows falls back to name-prefix matching, not this field.
    expect(parsed?.familiaDescripcion).toBeNull();
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
    expect(parsed?.familiaDescripcion).toBe("OTELLO");
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

describe("normaliseLineKey", () => {
  it("uppercases and collapses whitespace", () => {
    expect(normaliseLineKey("  allante  ")).toBe("ALLANTE");
    expect(normaliseLineKey("Vivo   Algodon   3")).toBe("VIVO ALGODON 3");
  });
});

describe("deriveVariantLabel", () => {
  it("strips the line prefix off the article name — ADR-0019's own ALLANTE example", () => {
    const result = deriveVariantLabel("ALLANTE C-832 BURGUNDY", normaliseLineKey("ALLANTE"));
    expect(result).toEqual({ label: "C-832 BURGUNDY", suspect: false });
  });

  it("returns an empty label, not suspect, when the article name equals the line name (name==line)", () => {
    const result = deriveVariantLabel("VIVO ALGODON 3", normaliseLineKey("VIVO ALGODON 3"));
    expect(result).toEqual({ label: "", suspect: false });
  });

  it("flags as suspect when the article name doesn't start with the line name at all", () => {
    const result = deriveVariantLabel("SOMETHING ELSE ENTIRELY", normaliseLineKey("ALLANTE"));
    expect(result).toEqual({ label: "SOMETHING ELSE ENTIRELY", suspect: true });
  });
});

describe("deriveFallbackGroup", () => {
  it("splits at the first digit-bearing token, matching the real ALLANTE colour-code convention", () => {
    expect(deriveFallbackGroup("ALLANTE C-832 BURGUNDY")).toEqual({
      lineKey: "ALLANTE",
      label: "C-832 BURGUNDY",
    });
  });

  it("treats the whole name as a singleton line when no digit-bearing token exists", () => {
    expect(deriveFallbackGroup("JUNTA EP")).toEqual({ lineKey: "JUNTA EP", label: "" });
  });
});

describe("buildCatalogue", () => {
  const oteloMaster: FamiliaMasterRow[] = [
    { sku: "T0001801", name: "OTELLO C-1 CRUDO", familia: "TELA" },
  ];

  it("groups a lone SKU into one product with a single default variant", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50", familiaDescripcion: "OTELLO" }),
      tariffRow({ sku: "T0001801", tariffCode: 3, amount: "13.20", familiaDescripcion: "OTELLO" }),
    ];
    const stock: StockRow[] = [{ sku: "T0001801", stockTotal: "59.80" }];

    const { products, report } = buildCatalogue({ familiaMaster: oteloMaster, tariffRows, stock });

    expect(products).toEqual([
      {
        slug: "otello",
        name: "OTELLO",
        category: "fabric",
        familia: "TELA",
        width: null,
        attributes: {},
        prices: [
          { zone: "all", unit: "metro", amount: "18.50", onRequest: false, qualifier: null },
          { zone: "all", unit: "pieza", amount: "13.20", onRequest: false, qualifier: null },
        ],
        variants: [
          {
            externalId: "T0001801",
            label: "C-1 CRUDO",
            active: true,
            stockTotal: "59.80",
            prices: [],
          },
        ],
      },
    ]);
    expect(report.articlesWithoutTariffRows).toEqual([]);
    expect(report.emptyFamiliaSkus).toEqual([]);
    expect(report.unmatchedTariffSkus).toEqual([]);
    expect(report.unmatchedStockSkus).toEqual([]);
    expect(report.suspectGroupSkus).toEqual([]);
    expect(report.emptyVariantLabelSkus).toEqual([]);
  });

  it("gives a variant absent from the stock file a null stockTotal (no stock, not zero)", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50", familiaDescripcion: "OTELLO" }),
    ];

    const { products } = buildCatalogue({ familiaMaster: oteloMaster, tariffRows, stock: [] });

    expect(products[0].variants[0].stockTotal).toBeNull();
  });

  it("flags a familia-master SKU with no tariff rows in the report, but still imports it as an empty-priced variant", () => {
    const { products, report } = buildCatalogue({
      familiaMaster: oteloMaster,
      tariffRows: [],
      stock: [],
    });

    expect(products).toHaveLength(1);
    expect(products[0].prices).toEqual([]);
    expect(products[0].variants[0].prices).toEqual([]);
    expect(report.articlesWithoutTariffRows).toEqual(["T0001801"]);
  });

  it("flags an empty-Familia master row and defaults its category, but still imports it", () => {
    const blankFamiliaMaster: FamiliaMasterRow[] = [
      { sku: "M561400", name: "MALLA TRICOTTUBE", familia: null },
    ];
    const tariffRows = [
      tariffRow({ sku: "M561400", tariffCode: 9, amount: "5.00", familiaDescripcion: "MALLA TRICOTTUBE" }),
    ];

    const { products, report } = buildCatalogue({
      familiaMaster: blankFamiliaMaster,
      tariffRows,
      stock: [],
    });

    expect(products[0].category).toBe("accessory");
    expect(products[0].familia).toBeNull();
    expect(report.emptyFamiliaSkus).toEqual(["M561400"]);
    expect(report.defaultedCategorySkus).toEqual(["M561400"]);
  });

  it("excludes a tariff row whose SKU isn't in the familia master, and reports it as unmatched", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50", familiaDescripcion: "OTELLO" }),
      tariffRow({ sku: "T9999999", tariffCode: 2, amount: "1.00", familiaDescripcion: "SOMETHING" }),
    ];

    const { products, report } = buildCatalogue({ familiaMaster: oteloMaster, tariffRows, stock: [] });

    expect(products).toHaveLength(1);
    expect(report.unmatchedTariffSkus).toEqual(["T9999999"]);
  });

  it("reports a stock row whose SKU isn't in the familia master as unmatched", () => {
    const tariffRows = [
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50", familiaDescripcion: "OTELLO" }),
    ];
    const stock: StockRow[] = [{ sku: "T9999999", stockTotal: "5.00" }];

    const { report } = buildCatalogue({ familiaMaster: oteloMaster, tariffRows, stock });

    expect(report.unmatchedStockSkus).toEqual(["T9999999"]);
  });

  it("carries width/metros por pieza enrichment at product level and dedupes tariff rows", () => {
    const tariffRows = [
      tariffRow({
        sku: "T0001801",
        tariffCode: 2,
        amount: "18.50",
        ancho: "320 CM",
        metrosPorPieza: "30",
        familiaDescripcion: "OTELLO",
      }),
      tariffRow({ sku: "T0001801", tariffCode: 2, amount: "18.50", familiaDescripcion: "OTELLO" }), // exact duplicate
    ];

    const { products, report } = buildCatalogue({ familiaMaster: oteloMaster, tariffRows, stock: [] });

    expect(products[0].width).toBe("320 CM");
    expect(products[0].attributes).toEqual({ metros_por_pieza: "30" });
    expect(products[0].variants[0].prices).toEqual([]);
    expect(products[0].prices).toHaveLength(1);
    expect(report.duplicateTariffRowCount).toBe(1);
  });

  it("groups multiple SKUs under one line (ALLANTE), attaching the shared price at product level and overriding only the variant that differs", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "M450455", name: "ALLANTE C-832 BURGUNDY", familia: "PIEL" },
      { sku: "M450457", name: "ALLANTE C-896 SEA CRUISE", familia: "PIEL" },
      { sku: "M450460", name: "ALLANTE C-900 GOLD", familia: "PIEL" },
    ];
    const tariffRows = [
      tariffRow({ sku: "M450455", tariffCode: 9, amount: "12.00", familiaDescripcion: "ALLANTE" }),
      tariffRow({ sku: "M450457", tariffCode: 9, amount: "12.00", familiaDescripcion: "ALLANTE" }),
      tariffRow({ sku: "M450460", tariffCode: 9, amount: "15.00", familiaDescripcion: "ALLANTE" }),
    ];

    const { products } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products).toHaveLength(1);
    const [allante] = products;
    expect(allante.name).toBe("ALLANTE");
    expect(allante.slug).toBe("allante");
    expect(allante.prices).toEqual([
      { zone: "all", unit: "unidad", amount: "12.00", onRequest: false, qualifier: null },
    ]);
    expect(allante.variants.map((v) => v.externalId)).toEqual(["M450455", "M450457", "M450460"]);
    expect(allante.variants.map((v) => v.label)).toEqual([
      "C-832 BURGUNDY",
      "C-896 SEA CRUISE",
      "C-900 GOLD",
    ]);
    expect(allante.variants[0].prices).toEqual([]); // matches the default, inherits
    expect(allante.variants[1].prices).toEqual([]); // matches the default, inherits
    expect(allante.variants[2].prices).toEqual([
      { zone: "all", unit: "unidad", amount: "15.00", onRequest: false, qualifier: null },
    ]); // GOLD overrides
  });

  it("keeps VIVO ALGODON 3/4/5/8/9 as five separate products, not one merged group, and flags their empty labels", () => {
    const numbers = [3, 4, 5, 8, 9];
    const familiaMaster: FamiliaMasterRow[] = numbers.map((n) => ({
      sku: `M20000${n}`,
      name: `VIVO ALGODON ${n}`,
      familia: "FIBRAS Y RELLENOS",
    }));
    const tariffRows = numbers.map((n) =>
      tariffRow({
        sku: `M20000${n}`,
        tariffCode: 9,
        amount: "3.00",
        familiaDescripcion: `VIVO ALGODON ${n}`,
      }),
    );

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products).toHaveLength(5);
    expect(products.map((p) => p.name).sort()).toEqual([
      "VIVO ALGODON 3",
      "VIVO ALGODON 4",
      "VIVO ALGODON 5",
      "VIVO ALGODON 8",
      "VIVO ALGODON 9",
    ]);
    // name==line for every one of these -> empty label -> SKU placeholder, flagged for an override
    for (const p of products) {
      expect(p.variants[0].label).toBe(p.variants[0].externalId);
    }
    expect(report.emptyVariantLabelSkus.sort()).toEqual([
      "M200003",
      "M200004",
      "M200005",
      "M200008",
      "M200009",
    ]);
  });

  it("flags a member whose name doesn't start with the line name as suspect, but still groups it", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "T1", name: "ALLANTE C-1 RED", familia: "PIEL" },
      { sku: "T2", name: "TYPO NAME HERE", familia: "PIEL" },
    ];
    const tariffRows = [
      tariffRow({ sku: "T1", tariffCode: 9, amount: "10.00", familiaDescripcion: "ALLANTE" }),
      tariffRow({ sku: "T2", tariffCode: 9, amount: "10.00", familiaDescripcion: "ALLANTE" }),
    ];

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products).toHaveLength(1);
    expect(products[0].variants).toHaveLength(2);
    expect(report.suspectGroupSkus).toEqual(["T2"]);
  });

  it("falls back to name-prefix matching and flags it, when a SKU has no Desc. familia anywhere", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "T9", name: "TERCEIRA C-9128 CRUDO", familia: "TELA" },
    ];
    const tariffRows = [
      tariffRow({ sku: "T9", tariffCode: 2, amount: "20.00", familiaDescripcion: null }),
    ];

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products[0].name).toBe("TERCEIRA");
    expect(products[0].variants[0].label).toBe("C-9128 CRUDO");
    expect(report.noLineDataSkus).toEqual(["T9"]);
  });

  it("flags a group whose members disagree on web Familia, and stores the most common one", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "T1", name: "ALLANTE C-1 RED", familia: "PIEL" },
      { sku: "T2", name: "ALLANTE C-2 BLUE", familia: "PIEL" },
      { sku: "T3", name: "ALLANTE C-3 GREEN", familia: "TELA" },
    ];
    const tariffRows = ["T1", "T2", "T3"].map((sku) =>
      tariffRow({ sku, tariffCode: 9, amount: "10.00", familiaDescripcion: "ALLANTE" }),
    );

    const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock: [] });

    expect(products[0].familia).toBe("PIEL");
    expect(report.inconsistentFamiliaGroupKeys).toEqual(["ALLANTE"]);
  });

  it("applies a familia-line correction override so a typo'd Desc. familia still merges into the right group", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "T1", name: "ALLANTE C-1 RED", familia: "PIEL" },
      { sku: "T2", name: "ALLANTE C-2 BLUE", familia: "PIEL" },
    ];
    const tariffRows = [
      tariffRow({ sku: "T1", tariffCode: 9, amount: "10.00", familiaDescripcion: "ALLANTE" }),
      tariffRow({ sku: "T2", tariffCode: 9, amount: "10.00", familiaDescripcion: "ALANTE" }), // typo
    ];

    const { products } = buildCatalogue({
      familiaMaster,
      tariffRows,
      stock: [],
      overrides: { familiaLineCorrections: { ALANTE: "ALLANTE" } },
    });

    expect(products).toHaveLength(1);
    expect(products[0].variants).toHaveLength(2);
  });

  it("applies a variant-label override instead of the SKU placeholder, and clears the empty-label flag", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "M1", name: "VIVO ALGODON 3", familia: "FIBRAS Y RELLENOS" },
    ];
    const tariffRows = [
      tariffRow({ sku: "M1", tariffCode: 9, amount: "3.00", familiaDescripcion: "VIVO ALGODON 3" }),
    ];

    const { products, report } = buildCatalogue({
      familiaMaster,
      tariffRows,
      stock: [],
      overrides: { variantLabelOverrides: { M1: "ÚNICO" } },
    });

    expect(products[0].variants[0].label).toBe("ÚNICO");
    expect(report.emptyVariantLabelSkus).toEqual([]);
  });

  it("applies a group override to force a SKU into a specific line regardless of its own Desc. familia", () => {
    const familiaMaster: FamiliaMasterRow[] = [
      { sku: "T1", name: "ALLANTE C-1 RED", familia: "PIEL" },
      { sku: "T9", name: "MISFILED ARTICLE", familia: "PIEL" },
    ];
    const tariffRows = [
      tariffRow({ sku: "T1", tariffCode: 9, amount: "10.00", familiaDescripcion: "ALLANTE" }),
      tariffRow({ sku: "T9", tariffCode: 9, amount: "10.00", familiaDescripcion: "WRONG LINE" }),
    ];

    const { products } = buildCatalogue({
      familiaMaster,
      tariffRows,
      stock: [],
      overrides: { groupOverrides: { T9: "ALLANTE" } },
    });

    expect(products).toHaveLength(1);
    expect(products[0].variants.map((v) => v.externalId).sort()).toEqual(["T1", "T9"]);
  });
});
