import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { db, schema } from "@/db";
import { localizedMetadata } from "@/lib/seo";
import { CATEGORY_SLUGS } from "@/lib/catalogue";
import type { CategoryValue } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const [col] = await db
    .select({ name: schema.collections.name, category: schema.collections.category })
    .from(schema.collections)
    .where(eq(schema.collections.slug, slug))
    .limit(1);
  if (!col) return {};
  const dict = await getDictionary(lang);
  const catName =
    col.category
      ? (dict.catalogo.categoryNames as Record<string, string>)[col.category]
      : undefined;
  return localizedMetadata(lang, `/catalogo/coleccion/${slug}`, {
    title: `${col.name}${catName ? ` — ${catName}` : ""} | D.TEX Mallorca`,
    description: `${col.name}: ${dict.catalogo.collectionProducts.toLowerCase()} — D.TEX Mallorca`,
  });
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const [collection] = await db
    .select()
    .from(schema.collections)
    .where(eq(schema.collections.slug, slug))
    .limit(1);
  if (!collection) notFound();

  const products = await db
    .select()
    .from(schema.products)
    .where(
      and(
        eq(schema.products.collectionId, collection.id),
        eq(schema.products.active, true),
      ),
    )
    .orderBy(asc(schema.products.name));

  // Fetch available units per product (no amounts — public view, ADR-0011)
  const productIds = products.map((p) => p.id);
  const allPrices =
    productIds.length > 0
      ? await db
          .select({
            productId: schema.prices.productId,
            unit: schema.prices.unit,
            onRequest: schema.prices.onRequest,
          })
          .from(schema.prices)
          .where(inArray(schema.prices.productId, productIds))
      : [];

  // Group by productId
  const pricesByProduct = new Map<
    number,
    { productId: number; unit: string; onRequest: boolean }[]
  >();
  for (const pr of allPrices) {
    if (!pricesByProduct.has(pr.productId))
      pricesByProduct.set(pr.productId, []);
    pricesByProduct.get(pr.productId)!.push(pr);
  }

  const dict = await getDictionary(lang);
  const d = dict.catalogo;
  const saleUnits = d.saleUnits as Record<string, string>;
  const catNames = d.categoryNames as Record<string, string>;

  const categoryHref = collection.category
    ? localePath(
        lang,
        `/catalogo/${CATEGORY_SLUGS[collection.category as CategoryValue]}`,
      )
    : localePath(lang, "/catalogo");

  const categoryName = collection.category
    ? catNames[collection.category]
    : undefined;

  return (
    <>
      {/* Breadcrumb + Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-stone-400">
            <Link
              href={localePath(lang, "/catalogo")}
              className="hover:text-stone-600"
            >
              {d.backToCatalogue}
            </Link>
            {categoryName && (
              <>
                <span>/</span>
                <Link href={categoryHref} className="hover:text-stone-600">
                  {categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-600">{collection.name}</span>
          </nav>

          <p className="mb-4 type-eyebrow text-stone-400">{d.collectionLabel}</p>
          <h1 className="type-h1">{collection.name}</h1>

          {(collection.stockNote || collection.deliveryTerms) && (
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {collection.stockNote && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.stockNoteLabel}
                  </dt>
                  <dd className="mt-1 text-sm text-stone-700">
                    {collection.stockNote}
                  </dd>
                </div>
              )}
              {collection.deliveryTerms && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.deliveryTermsLabel}
                  </dt>
                  <dd className="mt-1 text-sm text-stone-700">
                    {collection.deliveryTerms}
                  </dd>
                </div>
              )}
            </dl>
          )}

          <p className="mt-6 text-sm text-stone-500">
            {d.pricesNote}{" "}
            <strong className="text-stone-700">{d.clientAreaLabel}</strong>{" "}
            {d.pricesNote2}
          </p>
        </Container>
      </section>

      {/* Product list */}
      <Container className="py-section-lg">
        <h2 className="mb-6 type-h2-minor">{d.collectionProducts}</h2>

        {products.length === 0 ? (
          <p className="text-stone-500">{d.noProducts}</p>
        ) : (
          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200">
            {products.map((product) => {
              const prices = pricesByProduct.get(product.id) ?? [];
              const hasOnRequest = prices.some((p) => p.onRequest);
              const units = [...new Set(prices.map((p) => p.unit))];

              return (
                <Link
                  key={product.id}
                  href={localePath(lang, `/catalogo/producto/${product.slug}`)}
                  className="group flex items-start justify-between gap-6 px-8 py-6 first:rounded-t-2xl last:rounded-b-2xl hover:bg-stone-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900 group-hover:text-brand-600">
                      {product.name}
                    </p>
                    {product.width && (
                      <p className="mt-0.5 text-xs text-stone-500">
                        {d.widthLabel}: {product.width}
                      </p>
                    )}
                    {units.length > 0 && !hasOnRequest && (
                      <p className="mt-1 text-xs text-stone-400">
                        {d.availableAs}:{" "}
                        {units.map((u) => saleUnits[u] ?? u).join(", ")}
                      </p>
                    )}
                    {hasOnRequest && (
                      <p className="mt-1 text-xs text-stone-400">{d.onRequest}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-brand-600 group-hover:underline">
                    Ver →
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Container>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-stone-50">
        <Container className="py-section">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="type-h2-minor">{d.clientAreaCta}</h2>
              <p className="mt-2 text-stone-600">
                {d.pricesNote}{" "}
                <strong className="text-stone-800">{d.clientAreaLabel}</strong>{" "}
                {d.pricesNote2}
              </p>
            </div>
            <Button
              href={localePath(lang, "/contacto")}
              variant="outline"
              className="shrink-0"
            >
              {d.requestAccess}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
