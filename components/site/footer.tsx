import Link from "next/link";
import { Container } from "@/components/ui/container";
import { navRoutes, business, type NavKey } from "@/lib/site";
import { localePath, type Locale, type Dictionary } from "@/lib/i18n";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

const year = 2026;

export function Footer({ locale, dict }: FooterProps) {
  const a = business.address;
  return (
    <footer className="mt-24 border-t border-stone-200 bg-stone-50">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold">
            d<span className="text-brand-600">·</span>tex
            <span className="ml-2 text-sm font-normal text-stone-500">{dict.footer.tagline}</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
            {dict.footer.description}
          </p>
        </div>

        <div>
          <h3 className="type-eyebrow text-stone-400">
            {dict.footer.navHeading}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {navRoutes.map((item) => (
              <li key={item.key}>
                <Link
                  href={localePath(locale, item.href)}
                  className="text-sm text-stone-600 hover:text-ink"
                >
                  {dict.nav[item.key as NavKey]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="type-eyebrow text-stone-400">
            {dict.footer.contactHeading}
          </h3>
          <address className="mt-4 space-y-2.5 text-sm not-italic text-stone-600">
            <p>
              {a.street}
              <br />
              {a.area}
              <br />
              {a.postalCode} {a.city}
            </p>
            <p>
              <a href={business.phone.href} className="hover:text-ink">
                {business.phone.display}
              </a>
            </p>
            <p>
              <a href={`mailto:${business.email}`} className="hover:text-ink">
                {business.email}
              </a>
            </p>
            <p>{dict.footer.hours}</p>
          </address>
          <div className="mt-4 flex gap-4 text-sm text-stone-600">
            <a href={business.social.instagram} className="hover:text-ink">
              Instagram
            </a>
            <a href={business.social.linkedin} className="hover:text-ink">
              LinkedIn
            </a>
          </div>
        </div>
      </Container>

      <div className="border-t border-stone-200">
        <Container className="flex flex-col gap-2 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.name} · {business.legalName}
          </p>
          <p>{dict.footer.legal}</p>
        </Container>
      </div>
    </footer>
  );
}
