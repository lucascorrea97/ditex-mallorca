import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { LegalPageHeader, LegalSections } from "@/components/site/legal-page";

// The fourth footer legal page (#85, M0 parity — the current ditexmallorca.es has an
// /accesibilidad/ page and we did not). Same shape as aviso-legal: the shared legal-page
// components plus a dictionary-driven `sections` array, so adding a section is a
// messages/*.json edit in three locales and nothing else.
//
// Like the other three (#79) the copy is DRAFT PENDING BUSINESS REVIEW. It deliberately
// stops short of declaring formal WCAG 2.2 AA / EN 301 549 conformance: no external audit
// has been done, and an unfounded conformance claim is exactly the kind of statement a
// business should not publish. Section 3 says so plainly instead.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/accesibilidad", {
    title: dict.accesibilidad.title,
    description: dict.accesibilidad.description,
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
  const d = dict.accesibilidad;

  return (
    <>
      <LegalPageHeader
        eyebrow={d.eyebrow}
        h1={d.h1}
        draftNotice={d.draftNotice}
        lastUpdated={d.lastUpdated}
        spanishPrevailsNote={d.spanishPrevailsNote}
        showSpanishPrevails={lang !== "es"}
      />
      <LegalSections sections={d.sections} />
    </>
  );
}
