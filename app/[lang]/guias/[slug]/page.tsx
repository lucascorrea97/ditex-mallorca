import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { absoluteUrl, localizedMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { getPublishedArticle, getPublishedTranslationLocales } from "@/lib/articles";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const article = await getPublishedArticle(lang, slug);
  if (!article) return {};

  // Hreflang only for locales that actually have a published translation of
  // this Guide (ADR-0009) — never a link to a page that doesn't exist.
  const translatedLocales = await getPublishedTranslationLocales(slug);

  return localizedMetadata(
    lang,
    `/guias/${slug}`,
    {
      title: `${article.title} | D.TEX Mallorca`,
      description: article.excerpt ?? article.title,
    },
    translatedLocales,
  );
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const article = await getPublishedArticle(lang, slug);
  if (!article) notFound();

  const dict = await getDictionary(lang);
  const d = dict.guias;

  const dateFmt = new Intl.DateTimeFormat(
    lang === "es" ? "es-ES" : lang === "ca" ? "ca-ES" : "en-GB",
    { dateStyle: "long" },
  );

  const canonicalUrl = absoluteUrl(localePath(lang, `/guias/${slug}`));
  const published = article.publishedAt ?? article.createdAt;
  const articleLd = articleJsonLd({
    headline: article.title,
    description: article.excerpt ?? article.title,
    url: canonicalUrl,
    datePublished: published.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    useTags: article.useTags,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: d.backToGuides, url: absoluteUrl(localePath(lang, "/guias")) },
    { name: article.title, url: canonicalUrl },
  ]);

  const bodyHtml = renderMarkdown(article.body);

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd data={breadcrumbLd} />

      {/* Breadcrumb + intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <nav className="mb-4 flex items-center gap-2 text-sm text-stone-400">
            <Link href={localePath(lang, "/guias")} className="hover:text-stone-600">
              {d.backToGuides}
            </Link>
            <span>/</span>
            <span className="text-stone-600">{article.title}</span>
          </nav>

          <p className="mb-4 type-eyebrow text-stone-400">{d.eyebrow}</p>
          <h1 className="max-w-3xl type-h1">{article.title}</h1>
          {article.publishedAt && (
            <p className="mt-6 text-sm text-stone-500">
              {d.publishedOn} {dateFmt.format(article.publishedAt)}
            </p>
          )}
        </Container>
      </section>

      {/* Body */}
      <Container className="py-section-lg">
        <div className="grid gap-10 lg:grid-cols-[1fr_260px]">
          <div
            className="max-w-2xl leading-relaxed text-stone-700 [&_h2]:type-h2-minor [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_a]:text-brand-600 [&_a]:underline [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_strong]:font-semibold [&_strong]:text-ink"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {article.useTags.length > 0 && (
            <aside>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {d.applicationsLabel}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {article.useTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </Container>
    </>
  );
}
