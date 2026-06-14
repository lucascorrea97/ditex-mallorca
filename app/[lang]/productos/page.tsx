import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/productos", {
    title: dict.productos.title,
    description: dict.productos.description,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.productos;

  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 type-eyebrow text-stone-400">
            {d.eyebrow}
          </p>
          <h1 className="max-w-3xl type-h1">
            {d.h1Before}{" "}
            <span className="text-brand-600">{d.h1Accent}</span>
            {d.h1After}
          </h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">
            {d.lead}
          </p>
          <p className="mt-4 text-sm text-stone-500">
            {d.clientAreaNote}{" "}
            <strong className="text-stone-700">{d.clientAreaLabel}</strong>{" "}
            {d.clientAreaNote2}
          </p>
          <div className="mt-8">
            <Button href={localePath(lang, "/catalogo")}>
              {d.ctaBrowseCatalogue}
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <Container className="py-section-lg">
        <div className="grid gap-8 lg:grid-cols-2">
          {d.categories.map((cat) => (
            <div
              key={cat.name}
              className="overflow-hidden rounded-2xl border border-stone-200"
            >
              {"imageId" in cat && cat.imageId && (
                <ImageSlot
                  id={cat.imageId}
                  className="rounded-none"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="p-8">
                <h2 className="type-h2-minor">{cat.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {cat.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {cat.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-sm text-stone-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-stone-50">
        <Container className="py-section">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="type-h2-minor">{d.ctaClientHeading}</h2>
              <p className="mt-2 text-stone-600">{d.ctaClientBody}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href={localePath(lang, "/contacto")} variant="outline">
                {d.ctaRequestAccess}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
