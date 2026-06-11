import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { locales, defaultLocale, hasLocale } from "@/lib/i18n";
import type { NextAuthRequest } from "next-auth";

const LOCALE_COOKIE = "NEXT_LOCALE";

function getPreferredLocale(request: NextAuthRequest): string {
  // 1. Explicit cookie — set when the user manually switches language
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && hasLocale(cookie)) return cookie;

  // 2. Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const entry of acceptLanguage.split(",")) {
    const lang = entry.split(";")[0].trim().toLowerCase();
    if ((locales as readonly string[]).includes(lang)) return lang;
    const prefix = lang.split("-")[0];
    if ((locales as readonly string[]).includes(prefix)) return prefix;
  }

  // 3. Default locale
  return defaultLocale;
}

// auth() wraps our proxy so req.auth holds the JWT session (or null).
// This is the single place that handles both locale detection and the Client
// Area gate — no additional middleware files needed.
export const proxy = auth(function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── Locale detection ──────────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (!pathnameHasLocale) {
    const locale = getPreferredLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // ── Client Area gate ──────────────────────────────────────────────────────
  // Protect /[lang]/area-clientes/** but never the login page itself (loop
  // guard) or the Auth.js API routes (/api/auth/**).
  const lang = pathname.split("/")[1]; // "es" | "ca" | "en"
  const afterLang = pathname.slice(lang.length + 1); // e.g. "/area-clientes"

  const isClientArea = afterLang.startsWith("/area-clientes");
  const isLoginPage = afterLang.startsWith("/area-clientes/acceder");

  if (isClientArea && !isLoginPage && !request.auth) {
    const loginUrl = new URL(`/${lang}/area-clientes/acceder`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Match all paths except Next.js internals, static files, and Auth.js API routes
    "/((?!api/auth|_next/static|_next/image|_next/data|.*\\.\\w+$).*)",
  ],
};
