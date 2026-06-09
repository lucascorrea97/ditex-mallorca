import Link from "next/link";
import { Container } from "@/components/ui/container";
import { nav, business } from "@/lib/site";

const year = 2026;

export function Footer() {
  const a = business.address;
  return (
    <footer className="mt-24 border-t border-stone-200 bg-stone-50">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold">
            d<span className="text-brand-600">·</span>tex
            <span className="ml-2 text-sm font-normal text-stone-500">Distribuidora Textil</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
            Especialistas en espuma a medida y materiales para tapicería profesional en
            Mallorca y Baleares desde 2010.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-stone-600 hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Contacto
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
            <p>{business.hours}</p>
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
          <p>Aviso legal · Política de privacidad · Cookies</p>
        </Container>
      </div>
    </footer>
  );
}
