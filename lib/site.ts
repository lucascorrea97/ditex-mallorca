// Single source of truth for site-wide constants (nav routes + business contact details).
// Real data from the current ditexmallorca.es. Used by the header, footer, and later
// the contact page and LocalBusiness structured data (#9).
//
// Nav labels are NOT here — they live in messages/*.json so each locale renders its own.
// Use navRoutes[].key to look up the label from the active dictionary.

import { parityMode, isHiddenPath } from "@/lib/flags";

export const navRoutes = [
  { key: "home", href: "/" },
  { key: "nosotros", href: "/nosotros" },
  { key: "servicios", href: "/servicios" },
  { key: "productos", href: "/productos" },
  { key: "guias", href: "/guias" },
  { key: "contacto", href: "/contacto" },
] as const satisfies ReadonlyArray<{ key: string; href: string }>;

export type NavKey = (typeof navRoutes)[number]["key"];

// The nav/footer links visible in the current mode. In parity mode (M0, ADR-0021)
// this drops Guías — the only nav route pointing into a hidden area. Flip the flag
// off and the full nav returns. Header and footer both render from this list so the
// filter lives in exactly one place (the flag itself, lib/flags).
export const visibleNavRoutes = parityMode
  ? navRoutes.filter((route) => !isHiddenPath(route.href))
  : navRoutes;

// Footer-only legal pages (#79, LSSI/RGPD) — deliberately separate from navRoutes: these
// don't belong in the main nav, only the footer's legal-links column.
export const legalRoutes = [
  { key: "avisoLegal", href: "/aviso-legal" },
  { key: "privacidad", href: "/privacidad" },
  { key: "cookies", href: "/cookies" },
] as const satisfies ReadonlyArray<{ key: string; href: string }>;

export type LegalKey = (typeof legalRoutes)[number]["key"];

export const business = {
  name: "D.TEX Mallorca",
  legalName: "RIBOT FUSTER, S.L.",
  foundingDate: "2010",
  address: {
    street: "C/ 4 de Noviembre Nº4",
    area: "Polígono Industrial Can Valero",
    postalCode: "07014",
    city: "Palma de Mallorca",
    region: "Islas Baleares",
    country: "ES",
  },
  phone: { display: "+34 971 25 41 27", href: "tel:+34971254127" },
  email: "pedidos@ditexmallorca.com",
  // Lun–Vie 7:00–14:00 (mirrors footer/contact copy). Used for openingHoursSpecification.
  openingHours: { days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "07:00", closes: "14:00" },
  // The trade geography Ditex serves (CONTEXT.md). Drives LocalBusiness areaServed.
  areaServed: ["Mallorca", "Menorca", "Ibiza", "Formentera"],
  social: {
    instagram: "https://www.instagram.com/ditex_mallorca/",
    linkedin: "https://www.linkedin.com/company/ditex-mallorca/",
  },
} as const;
