// The Client Area documents (#84, M0 parity) — the ONE place that says which files
// exist, where they live in the private Blob store, and how they're labelled.
//
// Why a registry and not "read the store at request time": the `[doc]` URL segment is
// client-supplied, so it must never reach `get()` directly (that would let anyone with
// a session walk the whole store). Instead the segment is looked up in this fixed
// allow-list and only a `blobPathname` from *here* is ever fetched. See
// app/api/client-docs/[doc]/route.ts.
//
// Storage decision: ADR-0007's 2026-09-01 update — private Vercel Blob + an
// authenticated serving route. These PDFs are deliberately NOT in git or /public;
// /public is served with no auth, which would defeat the gated Client Area.
//
// Uploading (one-time, from a laptop — never through a function; Vercel caps function
// request bodies at 4.5 MB): `npm run docs:upload`. See scripts/upload-client-docs.ts.

import type { Locale } from "@/lib/i18n";

// Stable, public-facing identifiers used in the URL (/api/client-docs/<slug>). They are
// intentionally decoupled from the dated blob pathname: when a new tariff is uploaded the
// pathname changes but every link the family has shared keeps working.
export const clientDocSlugs = ["tarifa-telas", "tarifa-material", "catalogo"] as const;

export type ClientDocSlug = (typeof clientDocSlugs)[number];

export type ClientDoc = {
  slug: ClientDocSlug;
  /** Fixed pathname in the private `ditex-documents` store. Never client-supplied. */
  blobPathname: string;
  /** Filename the browser sees. Kept identical to the current site's files so Clients
   *  recognise what they downloaded (parity, ADR-0021). */
  downloadFilename: string;
  /** Publication date. `precision` is honest about what we actually know: the tariffs
   *  are dated to the day in their filename, the catalogue only to the month. */
  updatedAt: string;
  precision: "day" | "month";
  /** Byte size of the uploaded blob, shown on the page so a Client on a phone knows
   *  what they're about to download. Printed by `npm run docs:upload` — update it here
   *  when a new version is uploaded. Static on purpose: it keeps the gated page render
   *  free of three extra network round-trips for data that changes twice a year. */
  bytes: number;
};

export const clientDocs: readonly ClientDoc[] = [
  {
    slug: "tarifa-telas",
    blobPathname: "client-docs/Tarifa-telas-07-08-2026.pdf",
    downloadFilename: "Tarifa-telas-07-08-2026.pdf",
    updatedAt: "2026-08-07",
    precision: "day",
    bytes: 2_325_523,
  },
  {
    slug: "tarifa-material",
    blobPathname: "client-docs/Material-tarifa-09-07-2026.pdf",
    downloadFilename: "Material-tarifa-09-07-2026.pdf",
    updatedAt: "2026-07-09",
    precision: "day",
    bytes: 1_003_331,
  },
  {
    slug: "catalogo",
    // The web-optimised render of the original 85.4 MB export (see the PR / the gs
    // command in scripts/upload-client-docs.ts). 100 pages, text still vector.
    blobPathname: "client-docs/Catalogo-nov-2025.pdf",
    downloadFilename: "Catalogo-nov-2025.pdf",
    updatedAt: "2025-11-01",
    precision: "month",
    bytes: 14_148_590,
  },
];

/**
 * Resolve a client-supplied URL segment to a known document, or `undefined`.
 * This is the allow-list check that keeps the serving route from being a
 * read-anything proxy over the Blob store — the only way a pathname reaches `get()`.
 */
export function findClientDoc(slug: string): ClientDoc | undefined {
  return clientDocs.find((doc) => doc.slug === slug);
}

/** The authed route that serves a document. Never link to a blob URL directly. */
export function clientDocHref(slug: ClientDocSlug): string {
  return `/api/client-docs/${slug}`;
}

// Locale tags for Intl. Kept local rather than exported from lib/i18n (a shared hot file
// other agent sessions are editing) — see the PR note about consolidating the three
// copies of this map once the in-flight branches land.
const intlLocales: Record<Locale, string> = {
  es: "es-ES",
  ca: "ca-ES",
  en: "en-GB",
};

/**
 * "7 de agosto de 2026" / "noviembre de 2025" — the month-precision form omits the day
 * rather than inventing the 1st, which is what `dateStyle: "long"` would print.
 * Parsed as UTC noon so a negative timezone offset can't roll the date back a day.
 */
export function formatDocDate(doc: ClientDoc, locale: Locale): string {
  const date = new Date(`${doc.updatedAt}T12:00:00Z`);
  const options: Intl.DateTimeFormatOptions =
    doc.precision === "month"
      ? { year: "numeric", month: "long", timeZone: "UTC" }
      : { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
  return new Intl.DateTimeFormat(intlLocales[locale], options).format(date);
}

/**
 * "14,1 MB" (es) / "14.1 MB" (en) — locale-aware because the decimal separator differs.
 * Falls back to KB under 1 MB so a future small tariff doesn't render as "0,3 MB".
 */
export function formatDocSize(bytes: number, locale: Locale): string {
  const useMegabytes = bytes >= 1_000_000;
  return new Intl.NumberFormat(intlLocales[locale], {
    style: "unit",
    unit: useMegabytes ? "megabyte" : "kilobyte",
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(bytes / (useMegabytes ? 1_000_000 : 1_000));
}
