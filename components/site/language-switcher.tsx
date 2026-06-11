"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

const labels: Record<Locale, string> = { es: "ES", ca: "CA", en: "EN" };
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function buildHref(target: Locale) {
    const segments = pathname.split("/");
    segments[1] = target;
    return segments.join("/") || `/${target}`;
  }

  function persistLocale(target: Locale) {
    document.cookie = `NEXT_LOCALE=${target}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }

  return (
    <div className="flex items-center gap-0.5">
      {locales.map((code, i) => (
        <span key={code} className="flex items-center">
          {i > 0 && <span className="text-stone-300">·</span>}
          <Link
            href={buildHref(code)}
            onClick={() => persistLocale(code)}
            aria-current={code === locale ? "true" : undefined}
            className={
              code === locale
                ? "px-1.5 text-xs font-semibold text-ink"
                : "px-1.5 text-xs font-medium text-stone-400 hover:text-ink transition-colors"
            }
          >
            {labels[code]}
          </Link>
        </span>
      ))}
    </div>
  );
}
