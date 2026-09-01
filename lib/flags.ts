// Central parity-mode flag — the keystone of Milestone M0 (ADR-0021, issue #83).
//
// M0 shows the family a surface that MATCHES the current ditexmallorca.es and HIDES
// everything the current site does not have yet: the whole /catalogo browse
// experience, /guias, and the request/enquiry flow (area-clientes/solicitud).
//
// Nothing is deleted. Flipping the flag OFF restores the full site byte-for-byte for
// the eventual big-bang launch (ADR-0013). This module is the ONE place the flag is
// read; every consumer (nav/footer via lib/site, the sitemap, the proxy route gate,
// and the parity pages that link into hidden areas) imports from here.

// Default ON: only an explicit "false" / "0" turns parity mode off, so an unset env
// var still yields the M0 demo. Read from process.env directly — NEXT_PUBLIC_ makes
// the value available in both server and client bundles.
export const parityMode =
  process.env.NEXT_PUBLIC_PARITY_MODE !== "false" &&
  process.env.NEXT_PUBLIC_PARITY_MODE !== "0";

// Route prefixes hidden while parityMode is on. Paths are locale-agnostic (no `/es`
// prefix) — matched against a pathname whose locale segment has already been stripped,
// and against the locale-agnostic `href`s in lib/site's navRoutes.
export const hiddenRoutePrefixes = [
  "/catalogo", // categories, search (buscar), collections, product/variant pages
  "/guias",
  "/area-clientes/solicitud", // the request/enquiry flow (area-clientes itself stays)
] as const;

// True when a locale-agnostic path falls inside a hidden area — an exact match or a
// sub-route. Note the boundary: "/area-clientes" stays visible; only its "/solicitud"
// sub-tree hides. Matching on `prefix` + "/" (never a bare startsWith) avoids
// false positives like "/catalogo-x".
export function isHiddenPath(path: string): boolean {
  return hiddenRoutePrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
