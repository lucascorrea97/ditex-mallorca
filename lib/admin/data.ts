import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

// Read queries for the admin. Writes live in each route's actions.ts as Server Actions.
// Kept separate from lib/catalogue.ts (the public read model) because the admin needs
// every row — drafts, inactive products — not just what the public site shows.

export async function listProducts() {
  return db.query.products.findMany({
    with: { collection: true, prices: true, variants: { with: { prices: true } } },
    orderBy: (p) => [asc(p.category), asc(p.name)],
  });
}

export async function getProduct(id: number) {
  return db.query.products.findFirst({
    where: eq(schema.products.id, id),
    with: {
      collection: true,
      prices: { orderBy: (pr) => [asc(pr.zone), asc(pr.unit)] },
      variants: { with: { prices: true }, orderBy: (v) => [asc(v.label)] },
    },
  });
}

export async function listCollections() {
  return db.query.collections.findMany({ orderBy: (c) => [asc(c.name)] });
}

export async function listArticles() {
  return db.query.articles.findMany({
    orderBy: (a) => [desc(a.updatedAt)],
  });
}

export async function getArticle(id: number) {
  return db.query.articles.findFirst({ where: eq(schema.articles.id, id) });
}
