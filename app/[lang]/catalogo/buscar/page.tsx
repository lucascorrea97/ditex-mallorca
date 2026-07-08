import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, or, ilike, sql, inArray } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { db, schema } from "@/db";
import { auth } from "@/auth";
import { PriceInline } from "@/components/site/price-table";
import type { PriceRow } from "@/lib/prices";
import SearchTracker from "./search-tracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.catalogo.searchHeading} — D.TEX Mallorca`,
    robots: "noindex",
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const dict = await getDictionary(lang);
  const d = dict.catalogo;
  const catNames = d.categoryNames as Record<string, string>;
  const saleUnits = d.saleUnits as Record<string, string>;

  // ADR-0011: prices are revealed only to authenticated Clients.
  const session = await auth();
  const showPrices = !!session;

  let products: (typeof schema.products.$inferSelect)[] = [];

  if (query.length >= 2) {
    products = await db
      .select()
      .from(schema.products)
      .where(
        and(
          eq(schema.products.active, true),
          or(
            ilike(schema.products.name, `%${query}%`),
            sql`EXISTS (
              SELECT 1 FROM unnest(${schema.products.useTags}) AS t
              WHERE t ILIKE ${"%" + query + "%"}
            )`,
          ),
        ),
      )
      .orderBy(asc(schema.products.name));
  }

  // Fetch price rows for the matched products (authenticated only).
  const pricesByProduct = new Map<number, PriceRow[]>();
  if (showPrices && products.length > 0) {
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
      .where(
        inArray(
          schema.prices.productId,
          products.map((p) => p.id),
        ),
      );
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

  return (
    <>
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
            <span className="text-stone-600">{d.searchHeading}</span>
          </nav>
          <h1 className="max-w-3xl type-h1">{d.searchHeading}</h1>
          <form
            action={localePath(lang, "/catalogo/buscar")}
            method="GET"
            className="mt-6 flex gap-3"
          >
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={d.searchPlaceholder}
              aria-label={d.searchLabel}
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <Button variant="primary">{d.searchButton}</Button>
          </form>
        </Container>
      </section>

      <Container className="py-section-lg">
        {query.length >= 2 && (
          <>
            <SearchTracker query={query} resultsCount={products.length} />
            <p className="mb-6 text-sm text-stone-500">
              {products.length}{" "}
              {products.length === 1
                ? d.searchResultSingular
                : d.searchResultPlural}{" "}
              «{query}»
            </p>

            {products.length > 0 ? (
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={localePath(
                      lang,
                      `/catalogo/producto/${product.slug}`,
                    )}
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
                      <p className="mt-0.5 text-xs text-stone-400">
                        {catNames[product.category]}
                      </p>
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
                      {d.viewProduct}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone-200 p-12 text-center">
                <p className="font-semibold text-stone-700">
                  {d.searchNoResults} «{query}»
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {d.searchNoResultsBody}
                </p>
                <Button
                  href={localePath(lang, "/catalogo")}
                  variant="outline"
                  className="mt-6"
                >
                  {d.backToCatalogue}
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
}
