import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { db, schema } from "@/db";
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
  const product = await db.query.products.findFirst({
    where: eq(schema.products.slug, slug),
    with: { collection: true },
  });
  if (!product) return {};
  const dict = await getDictionary(lang);
  const catName = (dict.catalogo.categoryNames as Record<string, string>)[
    product.category
  ];
  return {
    title: `${product.name}${catName ? ` — ${catName}` : ""} | D.TEX Mallorca`,
    description: product.description ?? `${product.name} — D.TEX Mallorca`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const product = await db.query.products.findFirst({
    where: eq(schema.products.slug, slug),
    with: { collection: true, prices: true },
  });
  if (!product || !product.active) notFound();

  const dict = await getDictionary(lang);
  const d = dict.catalogo;
  const catNames = d.categoryNames as Record<string, string>;
  const saleUnits = d.saleUnits as Record<string, string>;

  const categorySlug = CATEGORY_SLUGS[product.category as CategoryValue];
  const categoryName = catNames[product.category];
  const categoryHref = localePath(lang, `/catalogo/${categorySlug}`);

  const collectionHref = product.collection
    ? localePath(lang, `/catalogo/coleccion/${product.collection.slug}`)
    : null;

  // Available units — no price amounts (ADR-0011 one-data-model/two-views)
  const units = [...new Set(product.prices.map((p) => p.unit))];
  const onRequest = product.prices.some((p) => p.onRequest);

  // Attributes: key-value pairs from the JSONB field
  const attrs = Object.entries(product.attributes ?? {});

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
            <span>/</span>
            <Link href={categoryHref} className="hover:text-stone-600">
              {categoryName}
            </Link>
            {product.collection && collectionHref && (
              <>
                <span>/</span>
                <Link href={collectionHref} className="hover:text-stone-600">
                  {product.collection.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-stone-600">{product.name}</span>
          </nav>

          <p className="mb-4 type-eyebrow text-stone-400">{categoryName}</p>
          <h1 className="type-h1">{product.name}</h1>
          {product.description && (
            <p className="mt-6 max-w-xl type-lead text-stone-600">
              {product.description}
            </p>
          )}
          <p className="mt-6 text-sm text-stone-500">
            {d.pricesNote}{" "}
            <strong className="text-stone-700">{d.clientAreaLabel}</strong>{" "}
            {d.pricesNote2}
          </p>
        </Container>
      </section>

      {/* Product details */}
      <Container className="py-section-lg">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: details */}
          <div>
            <dl className="space-y-5">
              {/* Category */}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {d.categoryLabel}
                </dt>
                <dd className="mt-1 text-stone-700">{categoryName}</dd>
              </div>

              {/* Collection */}
              {product.collection && collectionHref && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.collectionLabel}
                  </dt>
                  <dd className="mt-1">
                    <Link
                      href={collectionHref}
                      className="text-brand-600 hover:underline"
                    >
                      {product.collection.name}
                    </Link>
                  </dd>
                </div>
              )}

              {/* Code */}
              {product.code && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.codeLabel}
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-stone-700">
                    {product.code}
                  </dd>
                </div>
              )}

              {/* Width */}
              {product.width && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.widthLabel}
                  </dt>
                  <dd className="mt-1 text-stone-700">{product.width}</dd>
                </div>
              )}

              {/* Extra attributes from JSONB (e.g. densidad, gramaje) */}
              {attrs.map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {key}
                  </dt>
                  <dd className="mt-1 text-stone-700">{value}</dd>
                </div>
              ))}

              {/* Available units */}
              {(units.length > 0 || onRequest) && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.availableAs}
                  </dt>
                  <dd className="mt-2">
                    {onRequest ? (
                      <span className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600">
                        {d.onRequest}
                      </span>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {units.map((u) => (
                          <li
                            key={u}
                            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
                          >
                            {saleUnits[u] ?? u}
                          </li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
              )}

              {/* Use tags */}
              {product.useTags.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Usos
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {product.useTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {/* Collection delivery info */}
              {product.collection?.stockNote && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.stockNoteLabel}
                  </dt>
                  <dd className="mt-1 text-sm text-stone-600">
                    {product.collection.stockNote}
                  </dd>
                </div>
              )}
              {product.collection?.deliveryTerms && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.deliveryTermsLabel}
                  </dt>
                  <dd className="mt-1 text-sm text-stone-600">
                    {product.collection.deliveryTerms}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Right: price CTA */}
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
            <p className="type-eyebrow text-stone-400">{d.clientAreaLabel}</p>
            <p className="mt-3 type-h2-minor">
              {d.pricesNote}{" "}
              <strong className="text-stone-900">{d.clientAreaLabel}</strong>
            </p>
            <p className="mt-3 text-sm text-stone-600">{d.pricesNote2}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={localePath(lang, "/contacto")}>
                {d.contactCta}
              </Button>
              <Button href={localePath(lang, "/contacto")} variant="outline">
                {d.requestAccess}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
