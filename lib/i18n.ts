export const locales = ["es", "ca", "en"] as const;
export const defaultLocale = "es" as const;
export type Locale = (typeof locales)[number];

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

const dictionaries = {
  es: () => import("@/messages/es.json").then((m) => m.default),
  ca: () => import("@/messages/ca.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.es>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();

export function localePath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/**
 * True when the pathname already carries a locale prefix (`/es`, `/es/…`).
 * The proxy uses this to decide whether to redirect an unprefixed request. Keeping
 * it pure lets us lock the SEO guardrail from issue #47: an already-prefixed URL is
 * never re-detected or redirected — shared links, hreflang alternates and crawlers
 * must always reach the exact URL they asked for.
 */
export function hasLocalePrefix(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

/**
 * Resolve the preferred locale for an *unprefixed* request. Precedence (issue #47):
 * explicit cookie (persisted by the language switcher) > first serviceable
 * Accept-Language match (exact, then base language) > `defaultLocale` ("es", the
 * primary market — where cookieless, headerless crawlers correctly land).
 */
export function resolvePreferredLocale(
  cookie: string | undefined,
  acceptLanguage: string,
): Locale {
  if (cookie && hasLocale(cookie)) return cookie;

  for (const entry of acceptLanguage.split(",")) {
    const lang = entry.split(";")[0].trim().toLowerCase();
    if (hasLocale(lang)) return lang;
    const base = lang.split("-")[0];
    if (hasLocale(base)) return base;
  }

  return defaultLocale;
}
