import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, count } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { db, schema } from "@/db";
import { CATEGORY_ORDER, CATEGORY_SLUGS } from "@/lib/catalogue";
import type { CategoryValue } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/catalogo", {
    title: dict.catalogo.title,
    description: dict.catalogo.description,
  });
}

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.catalogo;

  const rows = await db
    .select({ category: schema.products.category, total: count() })
    .from(schema.products)
    .where(eq(schema.products.active, true))
    .groupBy(schema.products.category);

  const countByCategory = Object.fromEntries(rows.map((r) => [r.category, r.total]));
  const categories = CATEGORY_ORDER.filter((cat) => (countByCategory[cat] ?? 0) > 0);

  const catNames = d.categoryNames as Record<CategoryValue, string>;
  const catDescs = d.categoryDescriptions as Record<CategoryValue, string>;

  const foam = categories.find((c) => c === "foam");
  const rest = categories.filter((c) => c !== "foam");

  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 type-eyebrow text-stone-400">{d.eyebrow}</p>
          <h1 className="max-w-3xl type-h1">
            {d.h1Before}{" "}
            <span className="text-brand-600">{d.h1Accent}</span>
            {d.h1After}
          </h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">{d.lead}</p>
          <p className="mt-4 text-sm text-stone-500">
            {d.pricesNote}{" "}
            <strong className="text-stone-700">{d.clientAreaLabel}</strong>
            {" "}{d.pricesNote2}
          </p>
          <form
            action={localePath(lang, "/catalogo/buscar")}
            method="GET"
            className="mt-6 flex gap-3"
          >
            <input
              type="search"
              name="q"
              placeholder={d.searchPlaceholder}
              aria-label={d.searchLabel}
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <Button variant="primary">{d.searchButton}</Button>
          </form>
        </Container>
      </section>

      <Container className="py-section-lg">
        {/* Foam hero — the moat (ADR-0008) */}
        {foam && (
          <Link
            href={localePath(lang, `/catalogo/${CATEGORY_SLUGS[foam]}`)}
            className="group mb-6 flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-8 transition-colors hover:border-brand-500 sm:flex-row sm:items-start sm:gap-8"
          >
            <div className="flex-1">
              <p className="type-eyebrow text-brand-600">{catNames[foam]}</p>
              <h2 className="mt-3 type-h2-featured">{catNames[foam]}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-700">
                {catDescs[foam]}
              </p>
            </div>
            <span className="shrink-0 self-end text-sm font-medium text-brand-600 group-hover:underline sm:self-center">
              {countByCategory[foam]} {d.products} →
            </span>
          </Link>
        )}

        {/* Remaining categories */}
        {rest.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((cat) => (
              <Link
                key={cat}
                href={localePath(lang, `/catalogo/${CATEGORY_SLUGS[cat]}`)}
                className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-8 transition-colors hover:border-brand-500"
              >
                <p className="type-eyebrow text-stone-400">{catNames[cat]}</p>
                <h2 className="type-h2-minor">{catNames[cat]}</h2>
                <p className="flex-1 text-sm leading-relaxed text-stone-600">
                  {catDescs[cat]}
                </p>
                <span className="mt-2 text-sm font-medium text-brand-600 group-hover:underline">
                  {countByCategory[cat]} {d.products} →
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>

      {/* Client Area CTA */}
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
