# Product/variant model keyed on the article-name colour convention

**Status:** Accepted — grouping key changed 2026-07-08, see the Update section (the original
familia-description key rested on a file that turned out not to be A3 data)
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

## Update (2026-07-08): grouping key corrected — article-name convention, not `Desc. familia`

**Provenance correction.** The business clarified that `tarifa intento.xlsx` is **not an A3
export**: the partner built it with AI assistance and a pivot table. Its `Desc. familia`
column is therefore AI-derived grouping, not ERP master data — everything above that treats
it as "deliberately curated by the business in A3" is wrong. A cross-check against the real
article names found 307/5,004 disagreements, including outright AI errors (a MACHO part
grouped under a HEMBRA line; CREMALLERA VISLON renamed "NAUTICA"). The file is **demoted to
a one-time review aid**; it is not a data source. (This also removes it as the width /
metros-por-pieza source — see ADR-0018's corresponding update.)

**New grouping key.** The real, business-maintained signal is the **article-name colour
convention** in A3 itself: colourways are named `LINE C-<code/colour>` (`ALLANTE C-832
BURGUNDY`). Measured on the full real catalogue (familia master, 6,971 articles):

- 5,573 articles carry the ` C-` marker → parse `line = name before " C-"`,
  `variant label = the rest`. Result: **612 multi-colour Products** (OTELLO 61, MYSTIC 54 …)
  + 193 single-colour lines.
- 1,398 articles have no marker → standalone Products (one default Variant). This keeps
  `VIVO ALGODON 3/4/5/8/9` correctly separate.
- **~2,200 Products** for 6,971 articles overall.

**Known under-grouping, accepted.** 629 no-marker articles look like colour-*word* variants
(`CABO 4 mm NEGRO/BLANCO POLYESTER`). They stay standalone until an **override** merges
them — under-grouping shows a few extra thin pages; wrong grouping shows lies. The import
report lists these (near-duplicate names differing by one token) plus single-member ` C-`
groups for human review; overrides are the only correction mechanism (never hand-edits),
so re-runs stay stable.

Everything else in this ADR stands: the Collection → Product → Variant model, the schema
shape, website-owned grouping, per-variant price overrides, per-Product slugs/pages.
