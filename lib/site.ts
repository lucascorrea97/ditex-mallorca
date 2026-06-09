// Single source of truth for site-wide constants (nav + business contact details).
// Real data from the current ditexmallorca.es. Used by the header, footer, and later
// the contact page and LocalBusiness structured data (#9).

export const nav = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/servicios", label: "Servicios" },
  { href: "/productos", label: "Productos" },
  { href: "/contacto", label: "Contacto" },
] as const;

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
  hours: "Lun – Vie: 7:00 a 14:00h",
  social: {
    instagram: "https://www.instagram.com/ditex_mallorca/",
    linkedin: "https://www.linkedin.com/company/ditex-mallorca/",
  },
} as const;
