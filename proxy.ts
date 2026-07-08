import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasLocalePrefix, resolvePreferredLocale } from "@/lib/i18n";

const LOCALE_COOKIE = "NEXT_LOCALE";

// auth() wraps our proxy so req.auth holds the JWT session (or null).
// This is the single place that handles both locale detection and the Client
// Area gate — no additional middleware files needed.
export const proxy = auth(function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── Admin back-office gate ──────────────────────────────────────────────────
  // /admin is an internal, single-locale tool (ADR-0007) — it lives OUTSIDE the
  // [lang] routing, so it must be handled before locale detection (which would
  // otherwise redirect /admin → /es/admin). Requires an admin-role session;
  // the login page itself is always reachable to avoid a redirect loop.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLoginPage = pathname === "/admin/login";
    const role = (request.auth?.user as { role?: string } | undefined)?.role;
    if (!isLoginPage && role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return; // never apply locale routing to the admin
  }

  // ── Locale detection ──────────────────────────────────────────────────────
  // Only unprefixed paths are redirected; already-prefixed URLs are left exactly
  // as requested (SEO guardrail, issue #47). The cookie/Accept-Language precedence
  // lives in resolvePreferredLocale (see @/lib/i18n) so it can be unit-tested.
  if (!hasLocalePrefix(pathname)) {
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const locale = resolvePreferredLocale(cookie, acceptLanguage);
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
