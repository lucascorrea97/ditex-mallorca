// Structured-data builders (issue #9, ADR-0002): LocalBusiness + Product JSON-LD.
// Pure functions returning plain objects — rendered by <JsonLd> (components/seo/json-ld.tsx).
//
// Foam leads the brand (ADR-0008); prices are deliberately NOT emitted because the public
// Catalogue never shows prices (ADR-0011, one-data-model/two-views) — they live in the
// gated Client Area. Product therefore carries no `offers`.

import { business } from "@/lib/site";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

// Stable @id so every page references the same business node.
export const BUSINESS_ID = `${SITE_URL}/#business`;

type JsonLdObject = Record<string, unknown>;

export function localBusinessJsonLd(description: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": BUSINESS_ID,
    name: business.name,
    legalName: business.legalName,
    description,
    url: SITE_URL,
    telephone: business.phone.display,
    email: business.email,
    foundingDate: business.foundingDate,
    image: absoluteUrl("/icon.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${business.address.street}, ${business.address.area}`,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: business.openingHours.days.map(
        (d) =>
          ({
            Mo: "Monday",
            Tu: "Tuesday",
            We: "Wednesday",
            Th: "Thursday",
            Fr: "Friday",
            Sa: "Saturday",
            Su: "Sunday",
          })[d],
      ),
      opens: business.openingHours.opens,
      closes: business.openingHours.closes,
    },
    areaServed: business.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    sameAs: [business.social.instagram, business.social.linkedin],
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  category: string;
  sku?: string | null;
  url: string; // canonical, absolute
  image?: string;
}): JsonLdObject {
  const ld: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    category: input.category,
    url: input.url,
    brand: { "@type": "Brand", name: business.name },
    // Sold by Ditex — links the Product to the LocalBusiness node.
    seller: { "@id": BUSINESS_ID },
  };
  if (input.sku) ld.sku = input.sku;
  if (input.image) ld.image = input.image;
  return ld;
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
