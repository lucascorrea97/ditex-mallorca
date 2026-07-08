import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// The product kinds Ditex sells. Foam is the moat (ADR-0008) but modelled as one
// category among the one-stop range (CONTEXT.md).
export const categoryEnum = pgEnum("category", [
  "fabric", // telas
  "foam", // espuma / gomaespuma
  "polipiel", // synthetic leather
  "pvc",
  "material", // boatell, fibras, rellenos, cuadrantes...
  "accessory", // tachas, velcros, hilos, grapas...
]);

// Price varies by destination island because of freight (CONTEXT.md: Mallorca / Men-Ibz).
// Fabrics in the Telas tariff are single-zone -> "all".
export const priceZoneEnum = pgEnum("price_zone", ["all", "mallorca", "men_ibz"]);

// How a product is sold/priced. Fabrics: metro (metraje) + pieza. Materials: kg,
// metro_lineal, unidad. Foam: m3 (corte, cut to volume) + plancha (foam sheet).
// caja/embalaje are A3's box/package tariffs. "pvp" is the retail walk-in price
// (A3 tariffs PVP / ESPUMA PVP) — stored per ADR-0018 ("store, don't display") but
// deliberately left out of lib/prices.ts's UNIT_ORDER, so it never renders on the web.
export const saleUnitEnum = pgEnum("sale_unit", [
  "metro",
  "pieza",
  "kg",
  "metro_lineal",
  "unidad",
  "m3",
  "plancha",
  "caja",
  "embalaje",
  "pvp",
]);

// Editorial content state. The owner's daughter drafts/reviews AI-assisted articles
// (ADR-0010) and only "published" ones ever reach the public site.
export const articleStatusEnum = pgEnum("article_status", ["draft", "published"]);

// A Collection groups fabrics (CHARLINE, NEW GENERATION...) and carries shared stock
// and delivery terms (CONTEXT.md). Nullable category so material groupings can reuse it.
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(), // future A3 mapping (ADR-0006)
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: categoryEnum("category"),
  stockNote: text("stock_note"),
  deliveryTerms: text("delivery_terms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    externalId: text("external_id").unique(), // future A3 article id (ADR-0006)
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(), // TEJIDO / item name, e.g. "CHANEL"
    code: text("code"), // CODIGO (materials); null for most fabrics
    category: categoryEnum("category").notNull(),
    // The curated web Familia (TELA, ESPUMA, CREMALLERAS...) from the business's
    // familia master mapping — the categorisation source of truth (ADR-0018,
    // CONTEXT.md: Familia). Distinct from `category` above (a coarser 6-value nav
    // grouping derived from it) and from A3's internal familia (see Collection).
    // Null when the master mapping row itself has no Familia (surfaced in the
    // import report for #6).
    familia: text("familia"),
    collectionId: integer("collection_id").references(() => collections.id),
    width: text("width"), // ANCHO, e.g. "140 CM" — units vary, kept as text
    // Stock Total aggregated per SKU from the A3 stock snapshot export. Null means
    // the SKU is absent from the stock file, which A3 uses to mean no stock
    // (ADR-0018) — not the same as a confirmed zero.
    stockTotal: numeric("stock_total", { precision: 10, scale: 2 }),
    // Heterogeneous specs (gramaje, density, mts/kg...) and the future home for
    // A3 fields the web UI doesn't model explicitly.
    attributes: jsonb("attributes").$type<Record<string, string>>().default({}).notNull(),
    // Use/application tags drive both hybrid search (ADR-0011) and SEO/GEO (ADR-0008),
    // e.g. ["hosteleria", "nautica", "sofa"].
    useTags: text("use_tags").array().default([]).notNull(),
    description: text("description"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_familia_idx").on(t.familia),
    index("products_collection_idx").on(t.collectionId),
  ],
);

// One row per (product, zone, unit). Lets a fabric carry metro + pieza, and a material
// carry mallorca + men_ibz, in one uniform shape. amount is null when on request (CONSULTA).
export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    zone: priceZoneEnum("zone").default("all").notNull(),
    unit: saleUnitEnum("unit").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }), // null => on request
    onRequest: boolean("on_request").default(false).notNull(), // CONSULTA
    qualifier: text("qualifier"), // free-form note from the tariff, e.g. "15KG"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("prices_product_idx").on(t.productId)],
);

// Editorial content — the foam/application guides and local-intent pages that power the
// SEO/GEO moat (ADR-0008, ADR-0010). Produced by AI agents, reviewed and published by the
// non-technical editor through /admin until the content engine matures. One row per
// (slug, locale) so the same article can carry an ES/CA/EN translation (ADR-0009).
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    locale: text("locale").notNull().default("es"), // "es" | "ca" | "en" (lib/i18n)
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"), // short summary for listings / meta description
    body: text("body").notNull().default(""), // markdown, pasted from the AI draft
    status: articleStatusEnum("status").default("draft").notNull(),
    // Use/application tags mirror products — drive related-content links and GEO intent.
    useTags: text("use_tags").array().default([]).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // A slug is unique within a locale; the same slug across locales = translations.
    uniqueIndex("articles_slug_locale_idx").on(t.slug, t.locale),
    index("articles_status_idx").on(t.status),
  ],
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, { fields: [prices.productId], references: [products.id] }),
}));
