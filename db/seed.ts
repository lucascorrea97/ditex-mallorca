import "dotenv/config";
import { db, schema } from "./index";

// Small, REAL sample from the current tariffs (Telas + Material) to prove the schema
// and rendering end-to-end. The full seed comes from the PDF importer (#5) and is later
// superseded by the A3 Connector (ADR-0006). Re-runnable: clears then inserts.
async function seed() {
  const { collections, products, variants, prices, articles } = schema;

  // Order matters: prices -> variants -> products -> collections (FKs).
  await db.delete(prices);
  await db.delete(variants);
  await db.delete(products);
  await db.delete(collections);
  await db.delete(articles);

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
  // Each is a single-colourway line for this hand-written fixture, so one default
  // Variant per Product (ADR-0019) — real multi-colourway grouping comes from #5/#66.
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
    await db.insert(variants).values({ productId: p.id, label: "", active: true });
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
  await db
    .insert(variants)
    .values({ productId: boatell.id, externalId: "41230-T", label: "", active: true, stockTotal: "120.00" });
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
  await db.insert(variants).values({ productId: foam.id, label: "", active: true });
  await db
    .insert(prices)
    .values({ productId: foam.id, zone: "all", unit: "m3", onRequest: true });

  // Content engine plumbing (#11, ADR-0010). Two fixtures, deliberately NOT real
  // foam expertise — that's #12/#49; inventing product claims here would be
  // exactly what ADR-0010's "human verifies technical claims" step exists to
  // prevent. Both exercise the admin CRUD; only the second exercises the
  // public /guias pipeline (a draft is never publicly visible by design).

  // A draft — proves listing/rendering/editing in the admin without ever
  // reaching the public site (ADR-0010: "only published rows reach the public
  // site"). Clearly marked as a placeholder, no specific technical claims.
  await db.insert(articles).values({
    locale: "es",
    slug: "guia-densidad-espuma-tapiceria",
    title: "[Borrador] Cómo elegir la densidad de espuma para tapicería",
    excerpt: "Borrador de ejemplo para probar el editor de contenidos — pendiente de contenido real (#12/#49).",
    body: "> **Borrador de ejemplo.** Este artículo es un marcador de posición para probar el sistema de publicación (issue #11); el contenido real, basado en la experiencia de D.TEX, llega con los issues #12 y #49.\n\n## Estructura prevista\n\nUna guía real explicará cómo elegir la densidad de espuma según el uso — sofás, colchones, náutica, hostelería — con la experiencia real del equipo de D.TEX.",
    status: "draft",
    useTags: ["espuma", "placeholder"],
  });

  // Published, in all three locales (same slug = translations, db/schema.ts
  // comment) — the fixture that proves the public pipeline end to end:
  // listing, detail page, hreflang across real translations, JSON-LD,
  // sitemap. Honest "coming soon" copy, not a fabricated expertise claim.
  const welcomeGuide = {
    slug: "guias-ditex",
    useTags: ["espuma", "nautica", "contract", "mueble"],
    status: "published" as const,
    publishedAt: new Date(),
  };
  await db.insert(articles).values([
    {
      ...welcomeGuide,
      locale: "es",
      title: "Bienvenido a las guías de D.TEX Mallorca",
      excerpt: "Estamos preparando guías de espuma y tapicería con la experiencia real de D.TEX. Vuelve pronto.",
      body: "Estamos preparando una serie de guías prácticas sobre espuma y tapicería, basadas en la experiencia real del equipo de D.TEX Mallorca, organizadas por sector: náutica, contract y mueble.\n\nEste artículo es un marcador de posición de la fase de cimentación del sistema de contenidos — las guías reales llegan próximamente.",
    },
    {
      ...welcomeGuide,
      locale: "ca",
      title: "Benvingut a les guies de D.TEX Mallorca",
      excerpt: "Estem preparant guies d'escuma i tapisseria amb l'experiència real de D.TEX. Torna aviat.",
      body: "Estem preparant una sèrie de guies pràctiques sobre escuma i tapisseria, basades en l'experiència real de l'equip de D.TEX Mallorca, organitzades per sector: nàutica, contract i moble.\n\nAquest article és un marcador de posició de la fase de fonamentació del sistema de continguts — les guies reals arriben properament.",
    },
    {
      ...welcomeGuide,
      locale: "en",
      title: "Welcome to D.TEX Mallorca's guides",
      excerpt: "We're preparing foam and upholstery guides drawing on D.TEX's real expertise. Check back soon.",
      body: "We're preparing a series of practical guides on foam and upholstery, grounded in the real experience of the D.TEX Mallorca team, organised by trade segment: marine, contract, and furniture-making.\n\nThis article is a placeholder from the content system's foundation phase — the real guides are coming soon.",
    },
  ]);

  const counts = {
    collections: (await db.select().from(collections)).length,
    products: (await db.select().from(products)).length,
    variants: (await db.select().from(variants)).length,
    prices: (await db.select().from(prices)).length,
    articles: (await db.select().from(articles)).length,
  };
  console.log("Seeded:", counts);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
