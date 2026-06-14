import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/nav";

// Internal back-office (ADR-0007). It is deliberately NOT under app/[lang]/: a single
// Spanish-speaking editor uses it, so it sits outside the public i18n routing and is its
// own Next.js root layout (own <html>/<body>). Strings here are Spanish by design — the
// admin is never translated, unlike the public site. Never indexed.
export const metadata: Metadata = {
  title: "Administración · D.TEX Mallorca",
  robots: { index: false, follow: false },
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-ink">
        {isAdmin ? (
          <div className="mx-auto flex min-h-screen max-w-7xl">
            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-6 sm:flex">
              <div className="px-4">
                <p className="text-lg font-semibold">
                  D<span className="text-brand-600">·</span>TEX
                </p>
                <p className="mt-0.5 text-xs uppercase tracking-widest text-stone-400">
                  Administración
                </p>
              </div>
              <div className="mt-8 flex-1">
                <AdminNav />
              </div>
              <form action={logoutAction} className="px-1">
                <button
                  type="submit"
                  className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  Cerrar sesión
                </button>
              </form>
            </aside>

            {/* Mobile top bar */}
            <div className="flex w-full flex-col">
              <header className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-3 sm:hidden">
                <span className="font-semibold">
                  D<span className="text-brand-600">·</span>TEX Admin
                </span>
                <form action={logoutAction}>
                  <button type="submit" className="text-sm text-stone-500">
                    Salir
                  </button>
                </form>
              </header>
              {/* Mobile nav */}
              <div className="border-b border-stone-200 bg-white px-3 py-2 sm:hidden">
                <AdminNav />
              </div>

              <main className="flex-1 px-5 py-8 sm:px-10">{children}</main>
            </div>
          </div>
        ) : (
          // Login page (and any unauthenticated hit) — no shell.
          <main className="flex min-h-screen items-center justify-center px-5">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
