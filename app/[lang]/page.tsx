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
  return localizedMetadata(lang, "/", {
    title: dict.home.title,
    description: dict.home.description,
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.home;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 type-eyebrow font-medium text-brand-700">
            {d.badge}
          </p>
          <h1 className="max-w-3xl type-h1-hero">
            {d.h1Before} <span className="text-brand-600">{d.h1Accent}</span>{" "}
            {d.h1After}
          </h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">
            {d.lead}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href={localePath(lang, "/productos")}>{d.ctaProducts}</Button>
            <Button href={localePath(lang, "/contacto")} variant="outline">
              {d.ctaContact}
            </Button>
          </div>
          <div className="mt-12">
            <ImageSlot id="home-hero" sizes="(max-width: 768px) 100vw, 80vw" />
          </div>
        </Container>
      </section>

      {/* Trust signal — the foam moat (ADR-0008) */}
      <Container className="py-section">
        <p className="mx-auto max-w-3xl text-center type-trust">
          {d.trustBefore}{" "}
          <span className="text-brand-600">{d.trustAccent}</span>
          {d.trustAfter}
        </p>
      </Container>

      {/* One-stop range */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-section">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">
            {d.rangeHeading}
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {d.range.map((r) => (
              <li
                key={r}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
              >
                {r}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Segments */}
      <Container className="py-section">
        <h2 className="type-h2">{d.sectorsHeading}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {d.segments.map((s) => (
            <div key={s.title} className="overflow-hidden rounded-2xl border border-stone-200">
              <ImageSlot
                id={s.imageId}
                className="rounded-none"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="p-6">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
