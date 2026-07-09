import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/seo";
import { listPublishedArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return localizedMetadata(lang, "/guias", {
    title: dict.guias.title,
    description: dict.guias.description,
  });
}

export default async function GuidesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const d = dict.guias;

  // Published-only, this locale only (ADR-0010: draft rows are admin-only).
  const guides = await listPublishedArticles(lang);

  const dateFmt = new Intl.DateTimeFormat(
    lang === "es" ? "es-ES" : lang === "ca" ? "ca-ES" : "en-GB",
    { dateStyle: "long" },
  );

  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 type-eyebrow text-stone-400">{d.eyebrow}</p>
          <h1 className="max-w-3xl type-h1">{d.h1}</h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">{d.lead}</p>
        </Container>
      </section>

      {/* Guide list */}
      <Container className="py-section-lg">
        {guides.length === 0 ? (
          <p className="text-stone-500">{d.noGuides}</p>
        ) : (
          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={localePath(lang, `/guias/${guide.slug}`)}
                className="group flex flex-col gap-2 px-8 py-6 first:rounded-t-2xl last:rounded-b-2xl hover:bg-stone-50"
              >
                {guide.publishedAt && (
                  <p className="text-xs uppercase tracking-wide text-stone-400">
                    {d.publishedOn} {dateFmt.format(guide.publishedAt)}
                  </p>
                )}
                <p className="font-semibold text-stone-900 group-hover:text-brand-600">
                  {guide.title}
                </p>
                {guide.excerpt && (
                  <p className="max-w-2xl text-sm text-stone-600">{guide.excerpt}</p>
                )}
                <span className="text-sm font-medium text-brand-600 group-hover:underline">
                  {d.readMore}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
