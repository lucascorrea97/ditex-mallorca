import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.servicios.title, description: dict.servicios.description };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.servicios;

  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {d.eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {d.h1Before}{" "}
            <span className="text-brand-600">{d.h1Accent}</span>
            {d.h1After}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            {d.lead}
          </p>
        </Container>
      </section>

      {/* Featured: foam cutting */}
      <Container className="py-20">
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-8 sm:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            {d.starServiceEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {d.starServiceHeading}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
            {d.starServiceBody}
          </p>
          <p className="mt-4 text-sm font-medium text-brand-700">
            {d.starServiceNote}
          </p>
          <div className="mt-8">
            <ImageSlot
              id="servicios-corte-espuma"
              className="rounded-2xl"
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={localePath(lang, "/contacto")}>{d.starServiceCtaContact}</Button>
            <Button href={localePath(lang, "/productos")} variant="outline">
              {d.starServiceCtaProducts}
            </Button>
          </div>
        </div>
      </Container>

      {/* Other services */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{d.materialsHeading}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {d.services.map((s) => (
              <div
                key={s.name}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                {"imageId" in s && s.imageId && (
                  <ImageSlot
                    id={s.imageId}
                    className="rounded-none"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-ink">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <Container className="py-20">
        <p className="mx-auto max-w-2xl text-center text-2xl font-medium leading-snug sm:text-3xl">
          {d.ctaQuestion}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button href={localePath(lang, "/contacto")}>{d.ctaContact}</Button>
        </div>
      </Container>
    </>
  );
}
