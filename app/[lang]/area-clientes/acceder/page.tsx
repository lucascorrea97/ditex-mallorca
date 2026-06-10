import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { auth, signIn } from "@/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.acceder.title, description: dict.acceder.description };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { lang: rawLang } = await params;
  if (!hasLocale(rawLang)) notFound();
  // Narrowed to Locale — explicit cast so closures (Server Actions) see the type
  const lang = rawLang as Locale;

  // Already authenticated — skip to the Client Area
  const session = await auth();
  if (session) redirect(localePath(lang, "/area-clientes"));

  const { error, callbackUrl } = await searchParams;
  const dict = await getDictionary(lang);
  const d = dict.acceder;

  const returnUrl = callbackUrl ?? localePath(lang, "/area-clientes");

  async function loginAction(formData: FormData) {
    "use server";
    const password = formData.get("password")?.toString() ?? "";
    const cb = formData.get("callbackUrl")?.toString() ?? localePath(lang, "/area-clientes");
    try {
      await signIn("credentials", { password, redirectTo: cb });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(
          `${localePath(lang, "/area-clientes/acceder")}?error=invalid&callbackUrl=${encodeURIComponent(cb)}`,
        );
      }
      throw err; // re-throw NEXT_REDIRECT so Next.js handles it
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center border-b border-stone-200 bg-stone-50">
      <Container className="py-section">
        <div className="mx-auto max-w-sm">
          <p className="mb-4 type-eyebrow text-stone-400">{d.eyebrow}</p>
          <h1 className="type-h1">{d.h1}</h1>
          <p className="mt-4 type-lead text-stone-600">{d.lead}</p>

          <form action={loginAction} className="mt-8 space-y-5">
            <input type="hidden" name="callbackUrl" value={returnUrl} />

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                {d.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder={d.passwordPlaceholder}
                className="block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {d.errorInvalid}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              {d.submitLabel}
            </button>
          </form>

          <p className="mt-8 text-sm text-stone-500">
            {d.requestAccessLabel}{" "}
            <a
              href={localePath(lang, "/contacto")}
              className="font-medium text-brand-600 hover:underline"
            >
              {d.requestAccessCta}
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
