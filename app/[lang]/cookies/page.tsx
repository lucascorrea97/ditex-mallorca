import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { LegalPageHeader } from "@/components/site/legal-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/cookies", {
    title: dict.cookies.title,
    description: dict.cookies.description,
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
  const d = dict.cookies;

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

      <Container className="py-section-lg">
        <div className="max-w-2xl space-y-10">
          <p className="text-stone-600 leading-relaxed">{d.intro}</p>

          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-medium">{d.tableHeadName}</th>
                  <th className="px-5 py-3 font-medium">{d.tableHeadPurpose}</th>
                  <th className="px-5 py-3 font-medium">{d.tableHeadDuration}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {d.cookieList.map((cookie) => (
                  <tr key={cookie.name}>
                    <td className="px-5 py-3 font-mono text-xs text-stone-900">
                      {cookie.name}
                    </td>
                    <td className="px-5 py-3 text-stone-600">{cookie.purpose}</td>
                    <td className="px-5 py-3 text-stone-600">{cookie.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="type-h2-minor">{d.whyNoBannerHeading}</h2>
            <div className="mt-3 space-y-3 text-stone-600 leading-relaxed">
              {d.whyNoBannerParagraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="type-h2-minor">{d.manageHeading}</h2>
            <p className="mt-3 text-stone-600 leading-relaxed">{d.manageParagraph}</p>
          </div>
        </div>
      </Container>
    </>
  );
}
