import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { Field, Input, SubmitButton } from "@/components/admin/ui";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  // Already an admin — skip straight in.
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role === "admin") {
    redirect("/admin");
  }

  const { error, callbackUrl } = await searchParams;
  const returnUrl = callbackUrl ?? "/admin";

  async function loginAction(formData: FormData) {
    "use server";
    const password = formData.get("password")?.toString() ?? "";
    const cb = formData.get("callbackUrl")?.toString() ?? "/admin";
    try {
      await signIn("admin", { password, redirectTo: cb });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/admin/login?error=invalid&callbackUrl=${encodeURIComponent(cb)}`);
      }
      throw err; // re-throw NEXT_REDIRECT so Next.js handles it
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-stone-400">
        D<span className="text-brand-600">·</span>TEX · Administración
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Acceso interno</h1>
      <p className="mt-2 text-sm text-stone-600">
        Introduce la contraseña de administración para gestionar productos, precios y
        contenido.
      </p>

      <form action={loginAction} className="mt-7 space-y-5">
        <input type="hidden" name="callbackUrl" value={returnUrl} />

        <Field label="Contraseña" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Contraseña incorrecta. Inténtalo de nuevo.
          </p>
        ) : null}

        <SubmitButton type="submit" className="w-full">
          Entrar
        </SubmitButton>
      </form>
    </div>
  );
}
