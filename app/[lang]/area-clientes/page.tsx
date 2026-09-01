import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { DownloadPriceListButton } from "@/components/site/download-price-list-button";
import { ClientDocLink } from "@/components/site/client-doc-link";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { auth, signOut } from "@/auth";
import { parityMode } from "@/lib/flags";
import {
  clientDocHref,
  clientDocs,
  formatDocDate,
  formatDocSize,
} from "@/lib/client-docs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.areaClientes.title,
    description: dict.areaClientes.description,
    // Gated pages must never be indexed
    robots: { index: false, follow: false },
  };
}

export default async function ClientAreaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) notFound();
  // Narrowed to Locale — explicit cast so closures (Server Actions) see the type
  const lang = rawLang as Locale;

  // Server-side auth guard — defence-in-depth beyond the proxy check
  const session = await auth();
  if (!session) redirect(localePath(lang, "/area-clientes/acceder"));

  const dict = await getDictionary(lang);
  const d = dict.areaClientes;

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: localePath(lang, "/") });
  }

  return (
    <>
      {/* Header bar */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <p className="mb-4 type-eyebrow text-brand-600">{d.eyebrow}</p>
          <h1 className="max-w-2xl type-h1">{d.h1}</h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">{d.lead}</p>

          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-stone-300 px-5 text-sm font-medium text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {d.logoutLabel}
            </button>
          </form>
        </Container>
      </section>

      <Container className="py-section-lg">
        {/* The three real documents (#84) — the whole of the Client Area in M0, and
            the one thing the current site offers. Each link points at the authed
            /api/client-docs route; the files live in a PRIVATE Blob store and have no
            public URL (ADR-0007, 2026-09-01). Unconditional: these are parity, so they
            stay when the flag flips off and the richer catalogue returns alongside. */}
        <section aria-labelledby="documentos">
          <h2 id="documentos" className="type-h2-minor">
            {d.documentsTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-stone-600">{d.documentsLead}</p>

          <ul className="mt-8 divide-y divide-stone-100 rounded-2xl border border-stone-200">
            {clientDocs.map((doc) => {
              const label = d.documents[doc.slug];
              return (
                <li
                  key={doc.slug}
                  className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      {label.title}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-stone-600">
                      {label.description}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {d.documentUpdatedLabel} {formatDocDate(doc, lang)} · PDF ·{" "}
                      {formatDocSize(doc.bytes, lang)}
                    </p>
                  </div>
                  <ClientDocLink
                    href={clientDocHref(doc.slug)}
                    filename={doc.downloadFilename}
                    label={d.documentOpenLabel}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        {/* Prices now live on the catalogue pages (ADR-0011): one product DB, two views.
            The Client Area is the gate; browsing reveals the Price List in context.
            This block links into the hidden /catalogue area, so it is suppressed in
            parity mode (M0, ADR-0021 / #83) — flag off restores it verbatim. */}
        {!parityMode && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-8 py-12">
            <h2 className="type-h2-minor">{d.pricesLiveTitle}</h2>
            <p className="mt-4 max-w-2xl text-stone-600">{d.pricesLiveBody}</p>
            <div className="mt-8">
              <Button href={localePath(lang, "/catalogo")}>
                {d.browseCatalogueCta}
              </Button>
            </div>
          </div>
        )}

        {/* Auto-generated Price List PDF (#15, ADR-0011): a transition bridge for
            Clients who'd rather keep downloading a PDF than browse the site.
            Always current — rendered from the same data as the catalogue, never
            a manual upload. Spanish-only content for v1 (see the PR).
            Hidden in parity mode (M0, ADR-0021 / #83): it is generated from our own
            product DB, which the current site has no equivalent of, and showing it
            beside the three real tariffs would offer two rival "price lists". The
            route itself is gated to match — flag off restores both verbatim. */}
        {!parityMode && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-8 py-12">
            <h2 className="type-h2-minor">{d.priceListPdfTitle}</h2>
            <p className="mt-4 max-w-2xl text-stone-600">{d.priceListPdfBody}</p>
            <div className="mt-8">
              <DownloadPriceListButton label={dict.catalogo.downloadPriceListLabel} />
            </div>
          </div>
        )}

        {/* Reorder/enquiry Request flow (#21, ADR-0020): builds on the add-to-request
            widget on each Catalogue product page. The flow (area-clientes/solicitud)
            is hidden for M0 (ADR-0021 / #83), so this whole block is suppressed in
            parity mode — flag off restores it verbatim. */}
        {!parityMode && (
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-8 py-12">
            <h2 className="type-h2-minor">{d.requestSectionTitle}</h2>
            <p className="mt-4 max-w-2xl text-stone-600">{d.requestSectionBody}</p>
            <div className="mt-8">
              <Button href={localePath(lang, "/area-clientes/solicitud")}>
                {d.requestSectionCta}
              </Button>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
