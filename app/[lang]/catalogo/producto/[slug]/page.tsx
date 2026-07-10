import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { absoluteUrl, localizedMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { db, schema } from "@/db";
import { CATEGORY_SLUGS } from "@/lib/catalogue";
import type { CategoryValue } from "@/lib/catalogue";
import { auth } from "@/auth";
import { PriceRangeTable, PriceTable } from "@/components/site/price-table";
import { AddToRequestWidget } from "@/components/site/add-to-request-widget";
import type { Locale } from "@/lib/i18n";
import type { PriceRow } from "@/lib/prices";

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
  return localizedMetadata(lang, `/catalogo/producto/${slug}`, {
    title: `${product.name}${catName ? ` — ${catName}` : ""} | D.TEX Mallorca`,
    description: product.description ?? `${product.name} — D.TEX Mallorca`,
  });
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
    with: { collection: true, prices: true, variants: { with: { prices: true } } },
  });
  // A Product line is visible when at least one of its Variants (A3 articles) is
  // active — Bloqueado now lives per-SKU on the Variant, not the line (ADR-0019).
  if (!product || !product.variants.some((v) => v.active)) notFound();

  const dict = await getDictionary(lang);
  const d = dict.catalogo;
  const catNames = d.categoryNames as Record<string, string>;
  const saleUnits = d.saleUnits as Record<string, string>;
  const ds = dict.solicitud;

  // ADR-0011: one product DB, two views. Prices are revealed only to authenticated
  // Clients — the logged-out Catalogue stays price-free.
  const session = await auth();
  const showPrices = !!session;
  const isFoam = product.category === "foam";

  const categorySlug = CATEGORY_SLUGS[product.category as CategoryValue];
  const categoryName = catNames[product.category];
  const categoryHref = localePath(lang, `/catalogo/${categorySlug}`);

  const collectionHref = product.collection
    ? localePath(lang, `/catalogo/coleccion/${product.collection.slug}`)
    : null;

  // Colourways (ADR-0019): discontinued (Bloqueado) Variants are never listed.
  // A single Variant is the common, single-colour case — no colourway section
  // at all then, so a single-variant product's page looks exactly as before.
  const activeVariants = product.variants.filter((v) => v.active);
  const isMultiVariant = activeVariants.length > 1;

  // Effective price for one Variant: its own override, or the line's default
  // when it has none (ADR-0019: "product-level row is the default for all
  // colourways; variant-level rows override it").
  const defaultPrices = product.prices;
  function effectivePrices(v: (typeof activeVariants)[number]): PriceRow[] {
    return v.prices.length > 0 ? v.prices : defaultPrices;
  }

  // Available units — no price amounts (ADR-0011 one-data-model/two-views).
  // Folded across every active Variant's effective prices, not just the
  // line default, in case one colourway alone carries an extra tariff row.
  const allDisplayPrices = activeVariants.flatMap(effectivePrices);
  const units = [...new Set(allDisplayPrices.map((p) => p.unit))];
  const onRequest = allDisplayPrices.some((p) => p.onRequest);

  // Add-to-request widget data (#21, ADR-0020): the same active-Variant colourways shown
  // above, reduced to the id/label/sku shape the client-side Request cart snapshots.
  const variantOptions = activeVariants.map((v) => ({
    id: v.id,
    label: v.label || v.externalId || String(v.id),
    sku: v.externalId,
  }));
  const defaultVariantOption = !isMultiVariant ? variantOptions[0] : null;
  const requestUnits = units.filter((u) => u in saleUnits);

  // Attributes: key-value pairs from the JSONB field
  const attrs = Object.entries(product.attributes ?? {});

  // Structured data (ADR-0002). No price/offers — the public Catalogue is price-free
  // (ADR-0011); prices live in the gated Client Area.
  const canonicalUrl = absoluteUrl(localePath(lang, `/catalogo/producto/${slug}`));
  const productLd = productJsonLd({
    name: product.name,
    description: product.description ?? `${product.name} — ${categoryName}`,
    category: categoryName,
    sku: product.code,
    url: canonicalUrl,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: d.backToCatalogue, url: absoluteUrl(localePath(lang, "/catalogo")) },
    { name: categoryName, url: absoluteUrl(categoryHref) },
    ...(product.collection && collectionHref
      ? [{ name: product.collection.name, url: absoluteUrl(collectionHref) }]
      : []),
    { name: product.name, url: canonicalUrl },
  ]);

  return (
    <>
      <JsonLd data={productLd} />
      <JsonLd data={breadcrumbLd} />
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
          {showPrices ? (
            <p className="mt-6 text-sm text-stone-500">{d.pricesClientNote}</p>
          ) : (
            <p className="mt-6 text-sm text-stone-500">
              {d.pricesNote}{" "}
              <strong className="text-stone-700">{d.clientAreaLabel}</strong>{" "}
              {d.pricesNote2}
            </p>
          )}
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

              {/* Colourways (ADR-0019) — only when there's more than one to
                  distinguish; a single-colour product shows nothing here, so
                  its page looks exactly as it did before Variants existed. */}
              {isMultiVariant && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    {d.colourwaysHeading}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {activeVariants.map((v) => (
                      <span
                        key={v.id}
                        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600"
                      >
                        {v.label || v.externalId}
                      </span>
                    ))}
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

          {/* Right: prices (authenticated) or Client Area CTA (public) */}
          {showPrices ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="type-eyebrow text-stone-400">{d.pricesHeading}</p>
              <div className="mt-4">
                {isFoam ? (
                  // ADR-0018 update: foam is negotiated per Client, not sold off
                  // the imported A3 tariff — lib/prices.ts already withholds
                  // the amount everywhere, so this is the only place a price
                  // would have rendered; show the contact treatment instead.
                  <div>
                    <p className="type-h2-minor text-stone-900">{d.foamPriceHeading}</p>
                    <p className="mt-2 text-sm text-stone-600">{d.foamPriceBody}</p>
                  </div>
                ) : isMultiVariant ? (
                  <PriceRangeTable
                    variantPrices={activeVariants.map(effectivePrices)}
                    locale={lang as Locale}
                    labels={{
                      zoneLabels: d.priceZones as Record<string, string>,
                      unitLabels: saleUnits,
                      onRequestLabel: d.onRequest,
                      fromLabel: d.priceFromLabel,
                    }}
                  />
                ) : (
                  <PriceTable
                    prices={effectivePrices(activeVariants[0])}
                    locale={lang as Locale}
                    labels={{
                      zoneLabels: d.priceZones as Record<string, string>,
                      unitLabels: saleUnits,
                      onRequestLabel: d.onRequest,
                    }}
                  />
                )}
              </div>
              {/* Inter-island shipping rule (#62, CONTEXT.md): non-foam articles have no
                  Men-Ibz price — this is display-only, never a computed fee. Foam already
                  carries real Mallorca/Men-Ibz columns above, so it never gets this note. */}
              {!isFoam && (
                <p className="mt-4 text-sm text-stone-600">{d.shippingRuleNote}</p>
              )}
              <p className="mt-6 text-xs text-stone-400">{d.pricesClientNote}</p>
              <div className="mt-6">
                <Button href={localePath(lang, "/contacto")}>
                  {d.contactCta}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Add-to-request (#21, ADR-0020): Client Area only, alongside the price box
              above rather than replacing the existing "Solicitar presupuesto" contact CTA. */}
          {showPrices && (
            <div className="lg:col-start-2">
              <AddToRequestWidget
                productId={product.id}
                productName={product.name}
                category={product.category}
                isFoam={isFoam}
                units={requestUnits}
                unitLabels={saleUnits}
                variants={isMultiVariant ? variantOptions : []}
                defaultVariant={defaultVariantOption}
                requestHref={localePath(lang, "/area-clientes/solicitud")}
                labels={{
                  heading: ds.addToRequestHeading,
                  quantityLabel: ds.quantityLabel,
                  unitLabel: ds.unitLabel,
                  colourLabel: ds.colourLabel,
                  noteLabel: ds.noteLabel,
                  foamNoteLabel: ds.foamNoteLabel,
                  foamNotePlaceholder: ds.foamNotePlaceholder,
                  addButton: ds.addButton,
                  addedConfirmation: ds.addedConfirmation,
                  viewRequestLink: ds.viewRequestLink,
                }}
              />
            </div>
          )}

          {!showPrices && (
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
          )}
        </div>
      </Container>
    </>
  );
}
