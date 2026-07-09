// SEO/GEO foundation (issue #9, ADR-0002).
//
// Everything here is DOMAIN-AGNOSTIC: the canonical host comes from one env var so a
// later flip from `.es` to `.com` (ADR-0004) is a config change, not a code change.
// Canonical and hreflang both target the configured canonical host.

import type { Metadata } from "next";
import { locales, defaultLocale, localePath, type Locale } from "@/lib/i18n";

// Canonical origin. Default is the `.es` we control today (ADR-0004); set
// NEXT_PUBLIC_SITE_URL to flip to `.com` once it is recovered. Trailing slash stripped
// so `${SITE_URL}${path}` never doubles up.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ditexmallorca.es"
).replace(/\/+$/, "");

// schema.org locale → BCP-47 / OpenGraph locale tags.
const OG_LOCALES: Record<Locale, string> = {
  es: "es_ES",
  ca: "ca_ES",
  en: "en_GB", // marine/nautical wedge leans UK English (ADR-0008/0009)
};

export const ogLocale = (locale: Locale): string => OG_LOCALES[locale];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical + hreflang for a route.
 *
 * @param locale           the locale of the page being rendered (its canonical points at itself)
 * @param path             the route WITHOUT a locale prefix, e.g. "/" or "/catalogo/espuma"
 * @param availableLocales which locales actually have a page at this path — defaults to
 *   every site locale (true for symmetric static routes like "/nosotros"). Pass a narrower
 *   set for content that isn't guaranteed to exist in every locale — e.g. a Guide (#11),
 *   which may not be translated into all three yet (ADR-0009) — so hreflang never points
 *   at a page that doesn't exist.
 */
export function alternatesFor(
  locale: Locale,
  path: string,
  availableLocales: readonly Locale[] = locales,
) {
  const languages: Record<string, string> = {};
  for (const l of availableLocales) {
    languages[l] = absoluteUrl(localePath(l, path));
  }
  // x-default points at the default locale (ES) for crawlers without a match —
  // only when the default locale is actually one of the available ones.
  if (availableLocales.includes(defaultLocale)) {
    languages["x-default"] = absoluteUrl(localePath(defaultLocale, path));
  }

  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages,
  };
}

/**
 * Per-page metadata for a public page: title/description + canonical/hreflang +
 * locale-matched OpenGraph. Keeps every page's generateMetadata to one call.
 *
 * @param path locale-agnostic route, e.g. "/catalogo/espuma"
 * @param availableLocales see alternatesFor — defaults to every site locale.
 */
export function localizedMetadata(
  locale: Locale,
  path: string,
  meta: { title: string; description?: string },
  availableLocales: readonly Locale[] = locales,
): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    alternates: alternatesFor(locale, path, availableLocales),
    openGraph: {
      type: "website",
      siteName: "D.TEX Mallorca",
      locale: ogLocale(locale),
      url: absoluteUrl(localePath(locale, path)),
      title: meta.title,
      description: meta.description,
    },
  };
}
