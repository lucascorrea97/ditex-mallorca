import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { RequestReviewForm } from "@/components/site/request-review-form";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { auth } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.solicitud.pageTitle,
    description: dict.solicitud.pageDescription,
    robots: { index: false, follow: false },
  };
}

export default async function RequestPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Server-side auth guard — defence-in-depth beyond the proxy check (#21, ADR-0020).
  const session = await auth();
  if (!session) redirect(localePath(lang, "/area-clientes/acceder"));

  const dict = await getDictionary(lang);
  const d = dict.solicitud;

  return (
    <>
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-hero sm:py-hero-sm">
          <h1 className="type-h1">{d.heading}</h1>
          <p className="mt-6 max-w-xl type-lead text-stone-600">{d.lead}</p>
        </Container>
      </section>

      <Container className="py-section-lg">
        <div className="mx-auto max-w-2xl">
          <RequestReviewForm
            labels={{
              emptyCart: d.emptyCart,
              browseCatalogueLink: d.browseCatalogueLink,
              lineQuantity: d.lineQuantity,
              lineUnit: d.lineUnit,
              lineNote: d.lineNote,
              removeLine: d.removeLine,
              businessNameLabel: d.businessNameLabel,
              phoneLabel: d.phoneLabel,
              emailLabel: d.emailLabel,
              contactHint: d.contactHint,
              generalNoteLabel: d.generalNoteLabel,
              submitButton: d.submitButton,
              submitting: d.submitting,
              confirmationHeading: d.confirmationHeading,
              confirmationBody: d.confirmationBody,
              referenceLabel: d.referenceLabel,
              backToAreaClientes: d.backToAreaClientes,
              errorRequired: d.errorRequired,
              genericError: d.genericError,
            }}
            unitLabels={dict.catalogo.saleUnits as Record<string, string>}
            shippingRuleNote={dict.catalogo.shippingRuleNote}
            catalogueHref={localePath(lang, "/catalogo")}
            areaClientesHref={localePath(lang, "/area-clientes")}
          />
        </div>
      </Container>
    </>
  );
}
