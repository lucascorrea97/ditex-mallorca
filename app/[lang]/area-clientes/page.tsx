import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { auth, signOut } from "@/auth";

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

      {/* Content shell — placeholder for upcoming Price List (#14) */}
      <Container className="py-section-lg">
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-8 py-16 text-center">
          <p className="type-eyebrow text-stone-400">{d.eyebrow}</p>
          <p className="mt-4 text-stone-500">{d.comingSoon}</p>
        </div>
      </Container>
    </>
  );
}
