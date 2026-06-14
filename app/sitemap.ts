import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";
import { locales } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import { CATEGORY_ORDER, CATEGORY_SLUGS } from "@/lib/catalogue";
import { db, schema } from "@/db";

// Dynamic: the sitemap reads the product DB, which isn't available at build time
// (matches the catalogue pages — ADR-0006/0007).
export const dynamic = "force-dynamic";

// One sitemap row per (locale × path), each carrying the full set of hreflang
// alternates (ADR-0004: canonical + per-locale URLs on the configured host).
function localized(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap {
  return locales.map((locale) => {
    const { canonical, languages } = alternatesFor(locale, path);
    return {
      url: canonical,
      lastModified: opts.lastModified,
      changeFrequency: opts.changeFrequency,
      priority: opts.priority,
      alternates: { languages },
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static marketing + catalogue index routes (locale-agnostic paths).
  const staticPaths: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/catalogo", priority: 0.9 },
    { path: "/productos", priority: 0.7 },
    { path: "/servicios", priority: 0.7 },
    { path: "/nosotros", priority: 0.6 },
    { path: "/contacto", priority: 0.6 },
  ];

  // Category landing pages — foam first (ADR-0008).
  const categoryPaths = CATEGORY_ORDER.map((category) => ({
    path: `/catalogo/${CATEGORY_SLUGS[category]}`,
    priority: category === "foam" ? 0.9 : 0.8,
  }));

  // Dynamic: collections + active products from the DB.
  const [collections, products] = await Promise.all([
    db
      .select({ slug: schema.collections.slug, updatedAt: schema.collections.updatedAt })
      .from(schema.collections)
      .orderBy(asc(schema.collections.slug)),
    db
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(eq(schema.products.active, true))
      .orderBy(asc(schema.products.slug)),
  ]);

  return [
    ...staticPaths.flatMap((p) =>
      localized(p.path, { priority: p.priority, changeFrequency: "weekly" }),
    ),
    ...categoryPaths.flatMap((p) =>
      localized(p.path, { priority: p.priority, changeFrequency: "weekly" }),
    ),
    ...collections.flatMap((c) =>
      localized(`/catalogo/coleccion/${c.slug}`, {
        lastModified: c.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }),
    ),
    ...products.flatMap((p) =>
      localized(`/catalogo/producto/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      }),
    ),
  ];
}
