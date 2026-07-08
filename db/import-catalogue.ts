import "dotenv/config";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { db, schema } from "./index";
import {
  buildCatalogue,
  parseFamiliaMasterRow,
  parseNewFormatRow,
  parseOldFormatRow,
  parseStockRow,
  type FamiliaMasterRow,
  type ParsedArticleTariffRow,
  type StockRow,
} from "@/lib/import/parse";
import { overrides } from "@/lib/import/overrides";

// Re-runnable catalogue seed importer (issues #5/#66, ADR-0018 + ADR-0019):
// joins the A3 familia master + tariff export(s) + stock snapshot on SKU,
// groups articles into Collection -> Product (line) -> Variant (colourway),
// and replaces the products/variants/prices tables. Source files are never
// committed to the repo (they carry cost prices) — point this at wherever
// they live locally, e.g. the business-provided samples in
// ~/ditex-data/a3-samples/.
//
// Usage:
//   npm run db:import -- \
//     --old-format="tarifa intento.xlsx" \
//     --new-format=ESPUMA.xlsx --new-format=prueba-terceira.xlsx \
//     --familia=familias_proyecto_maestro_simplificado.xlsx \
//     --stock="STOCK 22.06.2026.xlsx"
// All paths are resolved relative to --dir (default ~/ditex-data/a3-samples).
// --old-format / --new-format / --stock are optional; --familia is required.

function parseArgs(argv: string[]) {
  const args = new Map<string, string[]>();
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (!match) continue;
    const [, key, value] = match;
    const existing = args.get(key) ?? [];
    existing.push(value);
    args.set(key, existing);
  }
  return args;
}

function readSheetRows(filePath: string, sheetName?: string): Promise<Record<string, unknown>[]> {
  return new ExcelJS.Workbook().xlsx.readFile(filePath).then((wb) => {
    const ws = sheetName ? wb.getWorksheet(sheetName) : wb.worksheets[0];
    if (!ws) throw new Error(`Sheet ${sheetName ?? "(first)"} not found in ${filePath}`);

    const headers = new Map<number, string>();
    ws.getRow(1).eachCell((cell, colNumber) => {
      headers.set(colNumber, String(cell.value ?? "").trim());
    });

    const rows: Record<string, unknown>[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers.get(colNumber);
        if (header) record[header] = cell.value;
      });
      rows.push(record);
    });
    return rows;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = args.get("dir")?.[0] ?? join(homedir(), "ditex-data", "a3-samples");

  const familiaFile = args.get("familia")?.[0];
  if (!familiaFile) {
    throw new Error("--familia=<file> is required (the SKU -> web Familia master mapping)");
  }

  const oldFormatFile = args.get("old-format")?.[0];
  const newFormatFiles = args.get("new-format") ?? [];
  const stockFile =
    args.get("stock")?.[0] ??
    (existsSync(dir)
      ? readdirSync(dir).find((f) => f.startsWith("STOCK") && f.endsWith(".xlsx"))
      : undefined);

  const resolve = (f: string) => (existsSync(f) ? f : join(dir, f));

  console.log("Reading familia master:", resolve(familiaFile));
  const familiaMasterRaw = await readSheetRows(resolve(familiaFile));
  const familiaMaster = familiaMasterRaw
    .map(parseFamiliaMasterRow)
    .filter((r): r is FamiliaMasterRow => r !== null);

  const tariffRows: ParsedArticleTariffRow[] = [];

  if (oldFormatFile) {
    console.log("Reading old-format tariff export:", resolve(oldFormatFile));
    const rows = await readSheetRows(resolve(oldFormatFile), "TARIFA TODO");
    tariffRows.push(...rows.map(parseOldFormatRow).filter((r): r is ParsedArticleTariffRow => r !== null));
  }

  for (const file of newFormatFiles) {
    console.log("Reading new-format tariff export:", resolve(file));
    const rows = await readSheetRows(resolve(file));
    tariffRows.push(...rows.map(parseNewFormatRow).filter((r): r is ParsedArticleTariffRow => r !== null));
  }

  let stock: StockRow[] = [];
  if (stockFile) {
    console.log("Reading stock snapshot:", resolve(stockFile));
    const rows = await readSheetRows(resolve(stockFile));
    stock = rows.map(parseStockRow).filter((r): r is StockRow => r !== null);
  } else {
    console.warn("No stock file found/provided — every product will have stockTotal = null.");
  }

  const { products, report } = buildCatalogue({ familiaMaster, tariffRows, stock, overrides });

  const variantCount = products.reduce((n, p) => n + p.variants.length, 0);
  console.log(
    `\nJoined ${products.length} products (${variantCount} variants). Writing to the database (clear + insert)...`,
  );

  const { prices, products: productsTable, variants: variantsTable } = schema;
  await db.delete(prices);
  await db.delete(variantsTable);
  await db.delete(productsTable);

  for (const product of products) {
    const [insertedProduct] = await db
      .insert(productsTable)
      .values({
        slug: product.slug,
        name: product.name || product.slug,
        category: product.category,
        familia: product.familia,
        width: product.width,
        attributes: product.attributes,
      })
      .returning({ id: productsTable.id });

    if (product.prices.length > 0) {
      await db.insert(prices).values(
        product.prices.map((p) => ({
          productId: insertedProduct.id,
          variantId: null,
          zone: p.zone,
          unit: p.unit,
          amount: p.amount,
          onRequest: p.onRequest,
          qualifier: p.qualifier,
        })),
      );
    }

    for (const variant of product.variants) {
      const [insertedVariant] = await db
        .insert(variantsTable)
        .values({
          productId: insertedProduct.id,
          externalId: variant.externalId,
          label: variant.label,
          active: variant.active,
          stockTotal: variant.stockTotal,
        })
        .returning({ id: variantsTable.id });

      if (variant.prices.length > 0) {
        await db.insert(prices).values(
          variant.prices.map((p) => ({
            productId: insertedProduct.id,
            variantId: insertedVariant.id,
            zone: p.zone,
            unit: p.unit,
            amount: p.amount,
            onRequest: p.onRequest,
            qualifier: p.qualifier,
          })),
        );
      }
    }
  }

  console.log("\n=== Import report (for #6 human review) ===");
  console.log("Products imported:", products.length, "| Variants:", variantCount);
  console.log("Empty-Familia SKUs:", report.emptyFamiliaSkus.length, report.emptyFamiliaSkus.slice(0, 20));
  console.log(
    "Articles without tariff rows:",
    report.articlesWithoutTariffRows.length,
    report.articlesWithoutTariffRows.slice(0, 20),
  );
  console.log(
    "Unmatched tariff SKUs (not in familia master):",
    report.unmatchedTariffSkus.length,
    report.unmatchedTariffSkus.slice(0, 20),
  );
  console.log(
    "Unmatched stock SKUs (not in familia master):",
    report.unmatchedStockSkus.length,
    report.unmatchedStockSkus.slice(0, 20),
  );
  console.log("Duplicate tariff rows removed:", report.duplicateTariffRowCount);
  console.log(
    "Categories defaulted to 'accessory' (missing/unmapped Familia):",
    report.defaultedCategorySkus.length,
    report.defaultedCategorySkus.slice(0, 20),
  );
  console.log("Stock conflicts (disagreeing lot rows):", report.stockConflictSkus);
  console.log(
    "Suspect groups (member name doesn't start with the line name):",
    report.suspectGroupSkus.length,
    report.suspectGroupSkus.slice(0, 20),
  );
  console.log(
    "Empty variant labels (name==line; got the SKU as a placeholder):",
    report.emptyVariantLabelSkus.length,
    report.emptyVariantLabelSkus.slice(0, 20),
  );
  console.log(
    "Groups with inconsistent web Familia across members:",
    report.inconsistentFamiliaGroupKeys.length,
    report.inconsistentFamiliaGroupKeys.slice(0, 20),
  );
  console.log(
    "No Desc. familia anywhere (grouped via name-prefix fallback):",
    report.noLineDataSkus.length,
    report.noLineDataSkus.slice(0, 20),
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
