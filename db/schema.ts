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

// A Request starts "new" and the office flips it to "handled" once they've
// called/emailed the Client back with a confirmed price (ADR-0020). No richer
// workflow than this for v1 — the office still fulfils through A3 as today.
export const requestStatusEnum = pgEnum("request_status", ["new", "handled"]);

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

// A Product is the commercial LINE (one Catalogue page), not an A3 article — e.g.
// ALLANTE is one Product with ~40 colourway Variants inside (ADR-0019). Keyed by
// normalised A3 `Desc. familia` at import time; no A3 identity lives here anymore
// (see Variant.externalId) since a line has no native A3 id of its own.
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(), // the line name, e.g. "ALLANTE"
    code: text("code"), // CODIGO (materials); null for most fabrics
    category: categoryEnum("category").notNull(),
    // The curated web Familia (TELA, ESPUMA, CREMALLERAS...) from the business's
    // familia master mapping — the categorisation source of truth (ADR-0018,
    // CONTEXT.md: Familia). Distinct from `category` above (a coarser 6-value nav
    // grouping derived from it) and from A3's internal familia (ADR-0019's grouping
    // key — see Variant/`Desc. familia`). Null when the master mapping row itself
    // has no Familia (surfaced in the import report for #6).
    familia: text("familia"),
    collectionId: integer("collection_id").references(() => collections.id),
    width: text("width"), // ANCHO, e.g. "140 CM" — units vary, kept as text
    // Heterogeneous specs (gramaje, density, mts/kg...) and the future home for
    // A3 fields the web UI doesn't model explicitly.
    attributes: jsonb("attributes").$type<Record<string, string>>().default({}).notNull(),
    // Use/application tags drive both hybrid search (ADR-0011) and SEO/GEO (ADR-0008),
    // e.g. ["hosteleria", "nautica", "sofa"].
    useTags: text("use_tags").array().default([]).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("products_category_idx").on(t.category),
    index("products_familia_idx").on(t.familia),
    index("products_collection_idx").on(t.collectionId),
  ],
);

// A Variant is one A3 article (colourway) inside a Product line (ADR-0019). The A3
// SKU identity (`externalId`, `active`/Bloqueado, `stockTotal`) lives here, per
// article, not on the Product it belongs to. Every Product gets at least one
// Variant, even single-colourway lines ("Products with a single article get one
// default variant").
export const variants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    externalId: text("external_id").unique(), // A3 Cód. artículo — the Connector's future join key
    // Article name minus the line prefix, e.g. "C-832 BURGUNDY". Empty when the
    // article name equals the line name outright (name==line, ~5 known cases) —
    // the importer then falls back to the SKU as a placeholder and flags it in the
    // import report; a real label comes from an override (ADR-0019), not a hand-edit.
    label: text("label").notNull().default(""),
    active: boolean("active").default(true).notNull(), // Bloqueado (Sí -> inactive), per SKU
    // Stock Total aggregated per SKU from the A3 stock snapshot export. Null means
    // the SKU is absent from the stock file, which A3 uses to mean no stock
    // (ADR-0018) — not the same as a confirmed zero.
    stockTotal: numeric("stock_total", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

// One row per (product-or-variant, zone, unit). A product-level row (variantId
// null) is the default shown for every colourway; a variant-level row overrides
// it for the ~68 lines where colour changes the price (ADR-0019). Lets a fabric
// carry metro + pieza, and a material carry mallorca + men_ibz, in one uniform
// shape. amount is null when on request (CONSULTA).
export const prices = pgTable(
  "prices",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "cascade" }),
    zone: priceZoneEnum("zone").default("all").notNull(),
    unit: saleUnitEnum("unit").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }), // null => on request
    onRequest: boolean("on_request").default(false).notNull(), // CONSULTA
    qualifier: text("qualifier"), // free-form note from the tariff, e.g. "15KG"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("prices_product_idx").on(t.productId),
    index("prices_variant_idx").on(t.variantId),
  ],
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

// A Request (ADR-0020, issue #21): a structured, non-binding ask a Client
// assembles from the Catalogue and sends to the office — the office confirms
// price and fulfils through A3 as today; never paid online. The Client Area's
// shared password (CONTEXT.md) doesn't identify who's asking, so business
// name + contact are captured on the request itself, not inferred from a
// session. `reference` is the paper workflow's missing unique ID
// (docs/business/procesos-as-is.md) — human-readable, shown in the
// confirmation, e.g. "P-2026-0001".
export const requests = pgTable(
  "requests",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    businessName: text("business_name").notNull(),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    note: text("note"), // free-text note for the whole request
    status: requestStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("requests_status_idx").on(t.status)],
);

// One line per requested Product/Variant. productId/variantId are `set null`
// on delete (not cascade) because a full catalogue re-import (`db:import`)
// deletes and recreates every product/variant with fresh ids — a Request must
// outlive that. productName/variantLabel/sku are a denormalised snapshot
// taken at request time so the office (and any future A3 Connector hand-off,
// #18) can always read what was actually asked for, even after the FK goes
// null or the catalogue changes shape entirely.
export const requestLines = pgTable(
  "request_lines",
  {
    id: serial("id").primaryKey(),
    requestId: integer("request_id")
      .references(() => requests.id, { onDelete: "cascade" })
      .notNull(),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: integer("variant_id").references(() => variants.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    variantLabel: text("variant_label"), // null for a single-variant/product-level line
    sku: text("sku"), // the Variant's A3 code at request time, if known
    quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
    unit: saleUnitEnum("unit").notNull(),
    note: text("note"), // e.g. a colour clarification, or "70x40cm" for a foam line
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("request_lines_request_idx").on(t.requestId)],
);

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  variants: many(variants),
  prices: many(prices),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, { fields: [variants.productId], references: [products.id] }),
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, { fields: [prices.productId], references: [products.id] }),
  variant: one(variants, { fields: [prices.variantId], references: [variants.id] }),
}));

export const requestsRelations = relations(requests, ({ many }) => ({
  lines: many(requestLines),
}));

export const requestLinesRelations = relations(requestLines, ({ one }) => ({
  request: one(requests, { fields: [requestLines.requestId], references: [requests.id] }),
  product: one(products, { fields: [requestLines.productId], references: [products.id] }),
  variant: one(variants, { fields: [requestLines.variantId], references: [variants.id] }),
}));
