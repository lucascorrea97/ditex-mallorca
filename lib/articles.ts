// Public read model for Guides (issue #11, ADR-0010): only `published` rows,
// only for the requesting locale. Kept separate from lib/admin/data.ts, which
// reads every row (drafts included) for the editor — the same split already
// used for products (lib/products.ts vs lib/admin/data.ts).

import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Locale } from "@/lib/i18n";

export async function listPublishedArticles(locale: Locale) {
  return db.query.articles.findMany({
    where: and(eq(schema.articles.locale, locale), eq(schema.articles.status, "published")),
    orderBy: (a) => [desc(a.publishedAt)],
  });
}

export async function getPublishedArticle(locale: Locale, slug: string) {
  return db.query.articles.findFirst({
    where: and(
      eq(schema.articles.locale, locale),
      eq(schema.articles.slug, slug),
      eq(schema.articles.status, "published"),
    ),
  });
}

// A Guide need not be translated into all three locales at once (ADR-0009:
// "marine/GEO content is authored ES + EN first") — so hreflang alternates
// must reflect which locales actually have a *published* row for this slug,
// not every locale the site supports. Returns just the locales, cheaply.
export async function getPublishedTranslationLocales(slug: string): Promise<Locale[]> {
  const rows = await db.query.articles.findMany({
    where: and(eq(schema.articles.slug, slug), eq(schema.articles.status, "published")),
    columns: { locale: true },
  });
  return rows.map((r) => r.locale as Locale);
}
