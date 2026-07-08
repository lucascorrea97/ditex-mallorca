import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, isNull, count, inArray } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { db, schema } from "@/db";
import { localizedMetadata } from "@/lib/seo";
import { SLUG_TO_CATEGORY } from "@/lib/catalogue";
import type { CategoryValue } from "@/lib/catalogue";
import { activeProductIds } from "@/lib/products";
import { auth } from "@/auth";
import { PriceInline } from "@/components/site/price-table";
import type { PriceRow } from "@/lib/prices";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { lang, categorySlug } = await params;
  if (!hasLocale(lang)) return {};
  const category = SLUG_TO_CATEGORY[categorySlug];
  if (!category) return {};
  const dict = await getDictionary(lang);
  const name =
    (dict.catalogo.categoryNames as Record<string, string>)[category] ??
    categorySlug;
  return localizedMetadata(lang, `/catalogo/${categorySlug}`, {
    title: `${name} — D.TEX Mallorca`,
    description: (dict.catalogo.categoryDescriptions as Record<string, string>)[
      category
    ],
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; categorySlug: string }>;
}) {
  const { lang, categorySlug } = await params;
  if (!hasLocale(lang)) notFound();
  const category = SLUG_TO_CATEGORY[categorySlug] as CategoryValue | undefined;
  if (!category) notFound();

  const dict = await getDictionary(lang);
  const d = dict.catalogo;
  const catNames = d.categoryNames as Record<string, string>;
  const catDescs = d.categoryDescriptions as Record<string, string>;

  // For fabric: show collections + standalone products
  // For all others: show products directly
  const isFabric = category === "fabric";

  const [collections, standaloneProducts] = await Promise.all([
    isFabric
      ? db
          .select({
            id: schema.collections.id,
            slug: schema.collections.slug,
            name: schema.collections.name,
            stockNote: schema.collections.stockNote,
            deliveryTerms: schema.collections.deliveryTerms,
          })
          .from(schema.collections)
          .where(eq(schema.collections.category, "fabric"))
          .orderBy(asc(schema.collections.name))
      : Promise.resolve([] as typeof schema.collections.$inferSelect[]),
    db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.category, category),
          inArray(schema.products.id, activeProductIds()),
          isFabric ? isNull(schema.products.collectionId) : undefined,
        ),
      )
      .orderBy(asc(schema.products.name)),
  ]);

  // For fabric collections, get product counts
  const collectionCounts = isFabric
    ? await Promise.all(
        collections.map(async (col) => {
          const [row] = await db
            .select({ total: count() })
            .from(schema.products)
            .where(
              and(
                eq(schema.products.collectionId, col.id),
                inArray(schema.products.id, activeProductIds()),
              ),
            );
          return { id: col.id, total: row?.total ?? 0 };
        }),
      )
    : [];
  const countByCollection = Object.fromEntries(
    collectionCounts.map((r) => [r.id, r.total]),
  );

  // ADR-0011: reveal prices only to authenticated Clients. Fetch price rows for the
  // listed products and show a compact per-row summary when logged in.
  const session = await auth();
  const showPrices = !!session;
  const saleUnits = d.saleUnits as Record<string, string>;

  const standaloneIds = standaloneProducts.map((p) => p.id);
  const pricesByProduct = new Map<number, PriceRow[]>();
  if (showPrices && standaloneIds.length > 0) {
    const rows = await db
      .select({
        productId: schema.prices.productId,
        zone: schema.prices.zone,
        unit: schema.prices.unit,
        amount: schema.prices.amount,
        onRequest: schema.prices.onRequest,
        qualifier: schema.prices.qualifier,
      })
      .from(schema.prices)
      .where(inArray(schema.prices.productId, standaloneIds));
    for (const r of rows) {
      if (!pricesByProduct.has(r.productId)) pricesByProduct.set(r.productId, []);
      pricesByProduct.get(r.productId)!.push({
        zone: r.zone,
        unit: r.unit,
        amount: r.amount,
        onRequest: r.onRequest,
        qualifier: r.qualifier,
      });
    }
  }

  const categoryName = catNames[category];
  const categoryDesc = catDescs[category];
  const isFoam = category === "foam";

  return (
    <>
      {/* Breadcrumb + Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <nav className="mb-4 flex items-center gap-2 text-sm text-stone-400">
            <Link
              href={localePath(lang, "/catalogo")}
              className="hover:text-stone-600"
            >
              {d.backToCatalogue}
            </Link>
            <span>/</span>
            <span className="text-stone-600">{categoryName}</span>
          </nav>
          <p
            className={`mb-4 type-eyebrow ${isFoam ? "text-brand-600" : "text-stone-400"}`}
          >
            {categoryName}
          </p>
          <h1 className="max-w-3xl type-h1">{categoryName}</h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">{categoryDesc}</p>
          <p className="mt-4 text-sm text-stone-500">
            {d.pricesNote}{" "}
            <strong className="text-stone-700">{d.clientAreaLabel}</strong>{" "}
            {d.pricesNote2}
          </p>
        </Container>
      </section>

      <Container className="py-section-lg">
        {/* Collections (fabrics only) */}
        {isFabric && collections.length > 0 && (
          <div className="mb-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  href={localePath(lang, `/catalogo/coleccion/${col.slug}`)}
                  className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-8 transition-colors hover:border-brand-500"
                >
                  <p className="type-eyebrow text-stone-400">
                    {d.collectionLabel}
                  </p>
                  <h2 className="type-h2-minor">{col.name}</h2>
                  {col.stockNote && (
                    <p className="text-xs text-stone-500">{col.stockNote}</p>
                  )}
                  <span className="mt-auto text-sm font-medium text-brand-600 group-hover:underline">
                    {countByCollection[col.id]} {d.products} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Direct products (foam, materials, etc. — or standalone fabric products) */}
        {standaloneProducts.length > 0 && (
          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200">
            {standaloneProducts.map((product) => (
              <Link
                key={product.id}
                href={localePath(lang, `/catalogo/producto/${product.slug}`)}
                className="group flex items-start justify-between gap-6 px-8 py-6 first:rounded-t-2xl last:rounded-b-2xl hover:bg-stone-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-stone-900 group-hover:text-brand-600">
                    {product.name}
                  </p>
                  {product.code && (
                    <p className="mt-0.5 text-xs text-stone-400">
                      {d.codeLabel}: {product.code}
                    </p>
                  )}
                  {product.width && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {d.widthLabel}: {product.width}
                    </p>
                  )}
                  {product.useTags.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {product.useTags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-stone-200 px-2.5 py-0.5 text-xs text-stone-500"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  {showPrices && (
                    <div className="mt-2">
                      <PriceInline
                        prices={pricesByProduct.get(product.id) ?? []}
                        locale={lang as Locale}
                        labels={{
                          zoneLabels: d.priceZones as Record<string, string>,
                          unitLabels: saleUnits,
                          onRequestLabel: d.onRequest,
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sm text-brand-600 group-hover:underline">
                  Ver →
                </span>
              </Link>
            ))}
          </div>
        )}

        {collections.length === 0 && standaloneProducts.length === 0 && (
          <p className="text-stone-500">{d.noProducts}</p>
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
