import "dotenv/config";
import { db, schema } from "./index";

// Small, REAL sample from the current tariffs (Telas + Material) to prove the schema
// and rendering end-to-end. The full seed comes from the PDF importer (#5) and is later
// superseded by the A3 Connector (ADR-0006). Re-runnable: clears then inserts.
async function seed() {
  const { collections, products, prices } = schema;

  // Order matters: prices -> products -> collections (FKs).
  await db.delete(prices);
  await db.delete(products);
  await db.delete(collections);

  const [charline] = await db
    .insert(collections)
    .values({
      slug: "charline",
      name: "CHARLINE",
      category: "fabric",
      stockNote: "No disponible en stock — pedido a fábrica a diario",
      deliveryTerms:
        "Plazo de entrega 4-5 días bajo grupaje · Express 4-5 días (15€) · Express 24h (60€)",
    })
    .returning();

  // CHARLINE fabrics: name, ANCHO, metraje (€/m), pieza (€/m on a full roll).
  const fabrics: Array<[string, string, string, number, number]> = [
    ["chanel", "CHANEL", "140 CM", 18.5, 13.2],
    ["karan", "KARAN", "140 CM", 13.5, 9.7],
    ["lancome", "LANCOME", "140 CM", 9.8, 7.1],
    ["madame", "MADAME", "140 CM", 14.5, 10.5],
  ];

  for (const [slug, name, width, metraje, pieza] of fabrics) {
    const [p] = await db
      .insert(products)
      .values({
        slug,
        name,
        category: "fabric",
        collectionId: charline.id,
        width,
        useTags: ["tapiceria", "decoracion"],
      })
      .returning();
    await db.insert(prices).values([
      { productId: p.id, zone: "all", unit: "metro", amount: metraje.toFixed(2) },
      { productId: p.id, zone: "all", unit: "pieza", amount: pieza.toFixed(2) },
    ]);
  }

  // A material with the dual island pricing (Mallorca vs Men-Ibz) from the BOATELL tariff.
  const [boatell] = await db
    .insert(products)
    .values({
      slug: "boatell-41230-t",
      name: "Boatell 41230-T",
      code: "41230-T",
      category: "material",
      width: "ANCHO 160",
      attributes: { gramaje: "150 GRMS", rendimiento: "60 MTS / 15 KG" },
      useTags: ["relleno", "tapiceria"],
    })
    .returning();
  await db.insert(prices).values([
    { productId: boatell.id, zone: "mallorca", unit: "kg", amount: "5.80" },
    { productId: boatell.id, zone: "men_ibz", unit: "kg", amount: "10.75", qualifier: "15KG" },
  ]);

  // Foam (the moat) — real density, price on request since the foam tariff is bespoke.
  const [foam] = await db
    .insert(products)
    .values({
      slug: "espuma-d25-corte-a-medida",
      name: "Espuma D25 — corte a medida",
      category: "foam",
      attributes: { densidad: "25 kg/m³", corte: "a medida (m³)" },
      useTags: ["cojines", "sofa", "hosteleria", "nautica"],
      description:
        "Gomaespuma de densidad 25 cortada a medida, incluso a volumen (m³). Consultar precio según medidas.",
    })
    .returning();
  await db
    .insert(prices)
    .values({ productId: foam.id, zone: "all", unit: "m3", onRequest: true });

  const counts = {
    collections: (await db.select().from(collections)).length,
    products: (await db.select().from(products)).length,
    prices: (await db.select().from(prices)).length,
  };
  console.log("Seeded:", counts);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
