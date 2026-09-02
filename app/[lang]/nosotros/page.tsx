import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";

// The real team (owner-supplied photos + names, confirmed 2026-09-02). One flat list
// rendered as a compact card grid; the department shows on each card (dict.nosotros
// .departments, i18n — names are not translated). Order = departments top-to-bottom.
const team = [
  { name: "Javier", dept: "gerencia", photo: "/images/team/team-javier.jpg" },
  { name: "Pia", dept: "admin", photo: "/images/team/team-03.jpg" },
  { name: "Manolo", dept: "admin", photo: "/images/team/team-08.jpg" },
  { name: "Paula", dept: "admin", photo: "/images/team/team-11.jpg" },
  { name: "Miguel Ángel", dept: "almacen", photo: "/images/team/team-07.jpg" },
  { name: "Pere", dept: "almacen", photo: "/images/team/team-06.jpg" },
  { name: "Pedro", dept: "almacen", photo: "/images/team/team-01.jpg" },
  { name: "Pau", dept: "corte", photo: "/images/team/team-02.jpg" },
  { name: "Xavi", dept: "corte", photo: "/images/team/team-04.jpg" },
  { name: "Albert", dept: "reparto", photo: "/images/team/team-05.jpg" },
  { name: "Marcial", dept: "reparto", photo: "/images/team/team-09.jpg" },
  { name: "Pablo", dept: "comercial", photo: "/images/team/team-pablo.jpg" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/nosotros", {
    title: dict.nosotros.title,
    description: dict.nosotros.description,
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
  const d = dict.nosotros;

  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 type-eyebrow text-stone-400">
            {d.eyebrow}
          </p>
          <h1 className="max-w-3xl type-h1">
            {d.h1}{" "}
            <span className="text-brand-600">{d.h1Accent}</span>.
          </h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">
            {d.lead}
          </p>
        </Container>
      </section>

      {/* Story */}
      <Container className="py-section-lg">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="type-h2">{d.storyHeading}</h2>
            <div className="mt-5 space-y-4 text-stone-600 leading-relaxed">
              <p>{d.storyP1}</p>
              <p>{d.storyP2}</p>
              <p>{d.storyP3}</p>
            </div>

            {/* Misión (#86 content parity). The current site devotes a whole section of its
                About page to a mission statement and ours had none. Condensed from the
                business's own published wording — no new claims introduced. */}
            <h2 className="mt-10 type-h2">{d.missionHeading}</h2>
            <p className="mt-5 text-stone-600 leading-relaxed">{d.missionBody}</p>
          </div>

          <div className="flex flex-col gap-6">
            <ImageSlot id="nosotros-almacen" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
                <p className="type-stat text-brand-600">{d.stat1Value}</p>
                <p className="mt-1 text-stone-600">{d.stat1Label}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
                <p className="type-stat text-brand-600">{d.stat2Value}</p>
                <p className="mt-1 text-stone-600">{d.stat2Label}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="text-sm font-medium text-stone-700">
                {d.locationLabel}{" "}
                <span className="font-semibold text-brand-600">{d.locationAccent}</span>
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Team — Quiénes somos: compact modern card grid that fills the width; the
          department shows on each card. */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-section">
          <h2 className="type-h2">{d.teamHeading}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {team.map((m) => (
              <figure
                key={m.photo}
                className="overflow-hidden rounded-xl bg-white ring-1 ring-stone-200"
              >
                <div className="relative aspect-square">
                  <Image
                    src={m.photo}
                    alt={`${m.name} — ${d.departments[m.dept]}, D.TEX Mallorca`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
                  <p className="truncate text-xs font-medium text-brand-600">
                    {d.departments[m.dept]}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Values */}
      <Container className="py-section">
        <h2 className="type-h2">{d.valuesHeading}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {d.values.map((v) => (
            <div key={v.name} className="rounded-2xl border border-stone-200 bg-white p-6">
              <h3 className="font-semibold text-ink">{v.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.text}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Why us */}
      <section className="border-t border-stone-200 bg-stone-50">
        <Container className="py-section-lg">
          <h2 className="type-h2">{d.whyHeading}</h2>
          <ul className="mt-8 space-y-4">
            {d.reasons.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <span className="block h-2 w-2 rounded-full bg-brand-600" />
                </span>
                <span className="leading-relaxed text-stone-700">{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button href={localePath(lang, "/contacto")}>{d.ctaContact}</Button>
            <Button href={localePath(lang, "/productos")} variant="outline">
              {d.ctaProducts}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
