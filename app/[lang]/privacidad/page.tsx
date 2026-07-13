import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { LegalPageHeader, LegalSections } from "@/components/site/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/privacidad", {
    title: dict.privacidad.title,
    description: dict.privacidad.description,
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
  const d = dict.privacidad;

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
