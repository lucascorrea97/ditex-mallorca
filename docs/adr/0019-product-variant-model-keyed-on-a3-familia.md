# Product/variant model keyed on A3's familia description

**Status:** Accepted
**Relates to:** ADR-0003 (website owns its data), ADR-0018 (A3 export seed), ADR-0011 (Client Area pricing)

## Context

The A3 catalogue is SKU-level: one article per colourway (`M450455 ALLANTE C-832 BURGUNDY`,
`M450457 ALLANTE C-896 SEA CRUISE`, …). Showing one page per SKU would give the Catalogue
40 near-identical ALLANTE pages. The site must show **one Product ("Allante") with its
colourways inside**, some of which may carry different prices.

There is no explicit "parent product" field in A3 — but there is a reliable proxy.
**A3's familia entity** (fine-grained, ≈ one per commercial line) is deliberately curated
by the business as the colour-less line name: ALLANTE's 40 colourways share familia
"ALLANTE" (across two unrelated code ranges, `T4001` + `M4504`), while the five distinct
`VIVO ALGODON 3/4/5/8/9` articles each get their **own** familia. Measured on the full Feb
export (6,157 SKUs): grouping by `Desc. familia` yields **582 multi-colour Products +
1,008 standalone Products**, consistent with article names in ~95% of cases; mismatches
are typos/whitespace, not wrong groupings. **68 lines have colour-dependent prices**, so
variants must be able to carry their own prices.

Notably unreliable alternatives, rejected:
- **Familia code / SKU prefix** — A3 reuses codes across lines (`M4504` holds both ALLANTE
  and SUNDANCE).
- **A new "cod producto" field in A3** — A3's export headers are fixed per filtro (ADR-0018),
  so a new field likely couldn't be exported; and web presentation grouping is a website
  concern, not ERP data (ADR-0003). Standard retail practice: the ERP thinks in SKUs, the
  web/PIM layer owns the product grouping.

## Decision

Model the catalogue as **Collection → Product → Variant**:

- **Product** = the commercial line (one Catalogue page). Keyed by **normalised
  `Desc. familia`** (uppercase, collapsed whitespace). The existing `products` table already
  sits at this level ("CHANEL"); ALLANTE, OTELLO, VIVO ALGODON 3 are each one Product.
- **Variant (colourway)** = one A3 article inside a Product. New `variants` table: A3 SKU as
  `externalId` (the Connector's future join key — it moves here from `products`), variant
  label (article name minus the line prefix, e.g. "C-832 BURGUNDY"), active flag.
  Products with a single article get one default variant.
- **Prices** stay one row per (zone, unit) but gain a nullable `variantId`: a product-level
  row is the default for all colourways; variant-level rows override it (needed for the ~68
  varying lines). Display shows a range when variants differ.
- **Overrides beat heuristics**: the importer derives grouping + variant labels mechanically,
  and a small override mechanism (admin-editable) corrects the exceptions the import report
  flags — suspect groups, empty variant labels (5 known), typo'd familia names. Never
  hand-fix generated rows directly; fix the override so re-runs are stable.

The 37 curated Familias (ADR-0018) are unaffected — they stay the *category* axis;
Collections stay the marketing grouping above Products.

## Data source

`Desc. familia` comes from the Feb-2026 full export (`tarifa intento.xlsx`); the go-forward
articles+tariffs export format does **not** include it. A fresh SKU → `Desc. familia`
mapping is requested in #60; until it lands, the Feb file is the grouping source and
articles newer than Feb fall back to name-prefix matching + review.

## Consequences

- #5 (importer) targets this shape: group by normalised familia description, split variant
  labels, attach prices at product level unless they vary.
- The Catalogue product page gains a colourway list (own issue); URL slugs are per Product,
  not per SKU — good for SEO (one strong page per line, not 40 thin ones).
- The Connector (M3) syncs at SKU level against `variants.externalId`; product grouping
  remains website-owned and stable across syncs.
- Risk accepted: familia-name typos can split a Product until an override fixes it; the
  import report makes these visible rather than silent.
