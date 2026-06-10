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
