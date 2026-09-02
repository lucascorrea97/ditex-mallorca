import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { business } from "@/lib/site";

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
      {/* Hero — full-bleed cinematic. The image is an AI-generated INTERIM placeholder
          (demo-only exception to ADR-0016, see its 2026-09-01 update); replace with a real
          foam-cutting photograph via #36 before public launch. Mirrored so the dark
          negative space sits left, under the headline; foam blocks bleed off to the right. */}
      <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden bg-ink">
        <Image
          src="/images/home-hero.jpg"
          alt={d.heroImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-right"
        />
        {/* Legibility scrim (ADR-0001): darkest on the left under the text, fading toward
            the foam blocks on the right; a subtle bottom vignette anchors the type. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
          aria-hidden
        />
        <Container className="relative py-hero sm:py-hero-sm">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 type-eyebrow font-medium text-white/90 backdrop-blur-sm">
              {d.badge}
            </p>
            <h1 className="type-h1-hero text-white">
              {d.h1Before} <span className="text-brand-500">{d.h1Accent}</span>{" "}
              {d.h1After}
            </h1>
            <p className="mt-6 max-w-lg type-lead text-stone-200">{d.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href={localePath(lang, "/productos")}>{d.ctaProducts}</Button>
              <Link
                href={localePath(lang, "/contacto")}
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                {d.ctaContact}
              </Link>
            </div>
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

      {/* Why us (#86 content parity). The current site carries a "Por qué elegirnos"
          trio on its home page and ours had nothing equivalent. The three reasons are
          drawn from claims this site already makes elsewhere (the foam moat of ADR-0008,
          the one-stop range, daily island delivery) rather than imported from the old
          copy — the old version leans on the disputed years figure (#76). #32 may
          rewrite the wording; the section is what closes the parity gap. */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-section">
          <h2 className="type-h2">{d.whyHeading}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {d.why.map((w) => (
              <div key={w.name} className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="font-semibold">{w.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{w.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact details (#86 content parity). The current home shows the phone and email
          in its hero and a full address/hours block further down; ours showed neither, so
          a visitor landing here had to navigate away to find a phone number. Rendered from
          lib/site's `business` — the single source of truth — and labelled from the
          contacto dictionary rather than duplicating four label strings per locale. */}
      <Container className="py-section">
        <h2 className="type-h2">{d.contactHeading}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="type-eyebrow text-stone-400">{dict.contacto.addressLabel}</p>
            <address className="mt-2 text-sm not-italic leading-relaxed text-stone-600">
              {business.address.street}
              <br />
              {business.address.area}
              <br />
              {business.address.postalCode} {business.address.city}
            </address>
          </div>
          <div>
            <p className="type-eyebrow text-stone-400">{dict.contacto.phoneLabel}</p>
            <a
              href={business.phone.href}
              className="mt-2 block text-sm text-stone-600 hover:text-ink"
            >
              {business.phone.display}
            </a>
          </div>
          <div>
            <p className="type-eyebrow text-stone-400">{dict.contacto.emailLabel}</p>
            <a
              href={`mailto:${business.email}`}
              className="mt-2 block break-all text-sm text-stone-600 hover:text-ink"
            >
              {business.email}
            </a>
          </div>
          <div>
            <p className="type-eyebrow text-stone-400">{dict.contacto.hoursLabel}</p>
            <p className="mt-2 text-sm text-stone-600">{dict.footer.hours}</p>
          </div>
        </div>
        <div className="mt-8">
          <Button variant="outline" href={localePath(lang, "/contacto")}>
            {d.contactCta}
          </Button>
        </div>
      </Container>
    </>
  );
}
