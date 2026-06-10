import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

function getPreferredLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const entry of acceptLanguage.split(",")) {
    const lang = entry.split(";")[0].trim().toLowerCase();
    if ((locales as readonly string[]).includes(lang)) return lang;
    const prefix = lang.split("-")[0];
    if ((locales as readonly string[]).includes(prefix)) return prefix;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  const locale = getPreferredLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and files with extensions
    "/((?!_next/static|_next/image|_next/data|.*\\.\\w+$).*)",
  ],
};
