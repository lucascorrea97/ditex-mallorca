import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { nav, business } from "@/lib/site";
import logo from "@/public/brand/ditex-logo.png";

// Sticky site header: logo + primary nav + phone CTA. Mobile uses a JS-free <details>
// menu. Language switcher is a placeholder until i18n (#2).
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label={business.name} className="shrink-0">
          <Image src={logo} alt={business.name} priority className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-stone-600 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href={business.phone.href} variant="outline">
            {business.phone.display}
          </Button>
        </div>

        {/* Mobile menu — no JavaScript required */}
        <details className="relative md:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-stone-300 [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Menú</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={business.phone.href}
              className="mt-1 block rounded-lg bg-brand-600 px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              {business.phone.display}
            </a>
          </div>
        </details>
      </Container>
    </header>
  );
}
