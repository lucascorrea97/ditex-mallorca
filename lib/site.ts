// Single source of truth for site-wide constants (nav routes + business contact details).
// Real data from the current ditexmallorca.es. Used by the header, footer, and later
// the contact page and LocalBusiness structured data (#9).
//
// Nav labels are NOT here — they live in messages/*.json so each locale renders its own.
// Use navRoutes[].key to look up the label from the active dictionary.

export const navRoutes = [
  { key: "home", href: "/" },
  { key: "nosotros", href: "/nosotros" },
  { key: "servicios", href: "/servicios" },
  { key: "productos", href: "/productos" },
  { key: "contacto", href: "/contacto" },
] as const satisfies ReadonlyArray<{ key: string; href: string }>;

export type NavKey = (typeof navRoutes)[number]["key"];

export const business = {
  name: "D.TEX Mallorca",
  legalName: "RIBOT FUSTER, S.L.",
  address: {
    street: "C/ 4 de Noviembre Nº4",
    area: "Polígono Industrial Can Valero",
    postalCode: "07014",
    city: "Palma de Mallorca",
  },
  phone: { display: "+34 971 25 41 27", href: "tel:+34971254127" },
  email: "pedidos@ditexmallorca.com",
  social: {
    instagram: "https://www.instagram.com/ditex_mallorca/",
    linkedin: "https://www.linkedin.com/company/ditex-mallorca/",
  },
} as const;
