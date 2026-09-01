import type { MetadataRoute } from "next";
import { asc, eq, inArray } from "drizzle-orm";
import { locales, type Locale } from "@/lib/i18n";
import { alternatesFor } from "@/lib/seo";
import { CATEGORY_ORDER, CATEGORY_SLUGS } from "@/lib/catalogue";
import { db, schema } from "@/db";
import { activeProductIds } from "@/lib/products";
import { parityMode, isHiddenPath } from "@/lib/flags";

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
    { path: "/guias", priority: 0.7 },
    { path: "/contacto", priority: 0.6 },
  ].filter((p) => !parityMode || !isHiddenPath(p.path));

  // Parity mode (M0, ADR-0021 / #83): only the parity static pages are listed —
  // the catalogue, guides and their DB-driven child routes stay out of the sitemap
  // entirely. Short-circuit here so the sitemap needs no DB while the flag is on.
  if (parityMode) {
    return staticPaths.flatMap((p) =>
      localized(p.path, { priority: p.priority, changeFrequency: "weekly" }),
    );
  }

  // Category landing pages — foam first (ADR-0008).
  const categoryPaths = CATEGORY_ORDER.map((category) => ({
    path: `/catalogo/${CATEGORY_SLUGS[category]}`,
    priority: category === "foam" ? 0.9 : 0.8,
  }));

  // Dynamic: collections + active products from the DB.
  const [collections, products, publishedArticles] = await Promise.all([
    db
      .select({ slug: schema.collections.slug, updatedAt: schema.collections.updatedAt })
      .from(schema.collections)
      .orderBy(asc(schema.collections.slug)),
    db
      .select({ slug: schema.products.slug, updatedAt: schema.products.updatedAt })
      .from(schema.products)
      .where(inArray(schema.products.id, activeProductIds()))
      .orderBy(asc(schema.products.slug)),
    db
      .select({
        slug: schema.articles.slug,
        locale: schema.articles.locale,
        updatedAt: schema.articles.updatedAt,
      })
      .from(schema.articles)
      .where(eq(schema.articles.status, "published"))
      .orderBy(asc(schema.articles.slug)),
  ]);

  // One sitemap row per published Guide *row* (not per slug) — a Guide may
  // not be translated into every locale yet (ADR-0009), so hreflang for each
  // entry is limited to its real sibling translations, never a 404'ing link.
  const translationsBySlug = new Map<string, Locale[]>();
  for (const a of publishedArticles) {
    const list = translationsBySlug.get(a.slug) ?? [];
    list.push(a.locale as Locale);
    translationsBySlug.set(a.slug, list);
  }
  const articleEntries: MetadataRoute.Sitemap = publishedArticles.map((a) => {
    const { canonical, languages } = alternatesFor(
      a.locale as Locale,
      `/guias/${a.slug}`,
      translationsBySlug.get(a.slug) ?? [a.locale as Locale],
    );
    return {
      url: canonical,
      lastModified: a.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages },
    };
  });

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
    ...articleEntries,
  ];
}
