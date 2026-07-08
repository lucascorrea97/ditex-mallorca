# Catalogue seed: multi-file A3 export join, tariff-row pricing, curated Familias

**Status:** Accepted
**Relates to:** ADR-0003 (website owns its data), ADR-0006 (seed from exports, Connector later), ADR-0011 (Client Area pricing)

## Context

ADR-0006 planned to seed the catalogue from the tariff PDFs, with A3 exports preferred if
available. They are. The business confirmed (2026-07-08, via the owner's daughter and whoever
runs A3) what A3 can and cannot export, and provided real samples. Key facts learned:

1. **A3 cannot export one complete file.** The export columns are fixed per saved "filtro";
   the header cannot be freely modified. There is no "all fields" export.
2. **Prices come as tariff rows, not columns.** The articles export has **one row per
   article × tariff** (`Nombre de la tarifa` / `Cod. tarifa`). Across the full catalogue the
   tariffs are:

   | Cod. | Tariff | Meaning | Web use |
   |---|---|---|---|
   | 1 | `PVP` | retail walk-in price | store, don't display |
   | 2 | `METRAJE` | fabric €/linear metre | **Client Area price** |
   | 3 | `PIEZA` | fabric €/full roll | **Client Area price** |
   | 4 | `ESPUMA PVP` | foam retail price | store, don't display |
   | 5 | `CORTE` | cut foam, Mallorca | **Client Area (Mallorca col.)** |
   | 6 | `CORTE ISLAS` | cut foam, Menorca/Ibiza | **Client Area (Men-Ibz col.)** |
   | 7 | `PLANCHA` | foam sheet, Mallorca | **Client Area (Mallorca col.)** |
   | 8 | `PLANCHA ISLAS` | foam sheet, Menorca/Ibiza | **Client Area (Men-Ibz col.)** |
   | 9 | `UNIDAD` | per unit (accessories, tools) | **Client Area price** |
   | 10 | `CAJA` | per box | **Client Area price** |
   | — | `EMBALAJE` | per package | **Client Area price** |

   The business confirmed the Client-facing prices are **METRAJE and PIEZA** (fabrics); the
   island split lives in the `… ISLAS` tariffs.
3. **A3 has no island tariffs for fabrics or accessories** — no `METRAJE ISLAS` /
   `PIEZA ISLAS` / `UNIDAD ISLAS` exist. **Resolved (business answer, 2026-07-08): correct by
   design.** Only foam carries per-item island prices, because inter-island freight for foam
   is charged **by volume**. Every other article has a single price plus an **order-level
   inter-island shipping rule**: orders ≥ 150 € ship free; below that, a flat **15 € delivery
   charge**. The rule lives in nobody's system — staff apply it **manually** as a delivery-fee
   line on the A3 invoice (clients usually wait until they reach 150 €; urgent orders pay).
   See "Update" below for consequences.
4. **A3's internal "familia" is not a web category.** Internally it is a fine-grained grouping
   (≈ one familia per fabric collection, e.g. OTELLO, SUITE — 1,600+ of them). For the web, the
   business prepared a **curated master mapping** (`familias_proyecto_maestro_simplificado.xlsx`):
   6,971 SKUs → **37 simplified Familias** (TELA, ESPUMA, CREMALLERAS, HILOS, …).
5. **Width and roll-length can't be exported anymore.** An earlier export attempt
   (`tarifa intento.xlsx`, 2026-02) *did* include `Ancho` (e.g. `320 CM`) and `Metros por pieza`,
   but the current saved filtro cannot — those columns ride along as a one-off historical file.
6. **Stock is a separate export** (per-lot rows; `Stock Total` repeated per SKU). It cannot be
   merged into the articles export.

## Decision

The seed importer (#5) ingests **multiple A3 export files joined on `Cód. artículo` (SKU)**,
rather than waiting for a single unified export that A3 cannot produce:

1. **Articles + tariffs export** (the reproducible go-forward format; sample: `ESPUMA.xlsx`,
   `prueba-terceira.xlsx`): SKU, name, supplier (`Cód. proveedor` + `NOMPRO`), `Bloqueado`
   (Sí → inactive), and one price row per tariff. **The full >6,000-SKU export arrives in this
   same format** (confirmed).
2. **Familia master** (`familias_proyecto_maestro_simplificado.xlsx`): the authoritative
   SKU → Familia (web category) mapping. Curated by the business for this project; it also
   implicitly defines the web-visible subset.
3. **Stock snapshot** (`STOCK 22.06.2026.xlsx`): aggregate to `Stock Total` per SKU; a SKU
   absent from the file has no stock (the export contains no zero rows).
4. **`tarifa intento.xlsx` (2026-02)** as a one-off enrichment for `Ancho` and
   `Metros por pieza` — best-available width data until the Connector or manual admin edits.

Pricing is stored **per tariff row** (tariff code + name + price against the product), and the
display layer decides which tariffs to show where (table above). Fabric collections keep coming
from the article name / A3 familia; the 37 curated Familias drive site navigation.

## Hard rules

- **`Precio coste` and `Precio compra` are dropped at parse time** — internal margins never
  enter the website database at all (defence in depth vs. only hiding them in the UI).
- Prices arrive as **strings with Spanish decimal commas** (`"22,3"`) in the new export format
  (floats in the old one) — normalise both; never `parseFloat` a comma string.
- Padded/whitespace-laden codes (`"       2"`) — trim everything.
- Exact duplicate rows occur — dedupe on (SKU, tariff code).
- Some familia-master rows have an empty Familia; some articles lack tariff rows — the import
  report must surface both for human review (#6).

## Consequences

- #5 is **unblocked**: the schema mapping is fully known; the full export is format-confirmed.
- Width/roll-length data is frozen at Feb-2026 quality until the A3 Connector (M3) or manual
  admin edits; acceptable for launch.
- Stock on the site is snapshot-based until the Connector; the Client Area should present it
  as availability, not a live count.
- Sample files live locally in `~/ditex-data/a3-samples/` (kept **out of the repo** because
  they contain cost prices).

## Update (2026-07-08): island pricing & SKU count resolved

Business answers to the two open questions:

1. **Non-foam island prices don't exist — by design** (see Context point 3). Consequences:
   - The Client Area shows Mallorca/Men-Ibz **columns only for foam** (which the price-table
     component already does — non-island-priced items get no zone columns). No manual price
     layer is needed.
   - Instead, the Client Area must **state the inter-island shipping rule** near prices
     (≥ 150 € free / 15 € below), so Men-Ibz Clients aren't surprised — tracked as its own issue.
   - The Material PDF's Men-Ibz column for non-foam items is not A3 data; do not try to
     import or reproduce it.
   - Process note: the manual 150 €/15 € invoice line is an **automation opportunity** —
     recorded in `docs/business/automation-opportunities.md`; when structured orders (#21)
     exist, the rule can be applied automatically.
2. **The catalogue is ~7,000 items, not >10,000.** The earlier ">10k SKUs" figure was wrong;
   the familia master (6,971 SKUs) is effectively the complete range. No missing data.

Remaining fine print for #6: whether the 150 €/15 € rule also applies to **Mallorca** van
deliveries or only inter-island, and whether the 15 € fee is identical for Menorca and Ibiza.

## Update (2026-07-08): foam prices are hidden — negotiated manually, not sold off A3

Business rule (owner's son-in-law, reviewing #5's seeded catalogue): **foam pricing is
negotiated per Client separately** — the A3 `CORTE`/`CORTE ISLAS`/`PLANCHA`/`PLANCHA ISLAS`
tariff amounts must never reach a Client, on the public Catalogue or in the Client Area.
This **supersedes** the "Update (2026-07-08): island pricing..." section above, which assumed
foam's Mallorca/Men-Ibz columns would render automatically from the imported tariff.

- Foam products still **show in the Catalogue and Client Area** — the "keep browsable, hide
  the price" option was chosen over dropping foam from the site entirely. Foam is still the
  hero/moat (CONTEXT.md, ADR-0014); only the *price* is withheld, not the product.
- The importer (#5) keeps ingesting and storing `CORTE`/`CORTE ISLAS`/`PLANCHA`/`PLANCHA ISLAS`
  as before (reference data, e.g. for a future manual-quote/admin workflow) — nothing changed
  in `db/import-catalogue.ts` or `lib/import/parse.ts`.
- The hiding happens one layer up, in `lib/prices.ts`: `m3`/`plancha` (foam's only two units)
  are absent from `UNIT_ORDER`, the same defence-in-depth mechanism already used for `pvp`
  (PVP/ESPUMA PVP retail prices). `buildPriceTable`, `formatPriceWithUnit`, and
  `isIslandPriced` all consult this whitelist, so a foam-only price set renders no rows, no
  zone columns, and no inline price string — never a bare unformatted leak.
- Consequence: for foam, expect a "contact us to negotiate" treatment wherever the site would
  otherwise render a price — that UI copy is a follow-up, not built yet.

## Update (2026-07-08): `tarifa intento.xlsx` is not an A3 export — demoted

The business clarified that `tarifa intento.xlsx` was **built by the partner with AI
assistance plus a pivot table**, not exported from A3. Everything above that treats it as
"the Feb-2026 full export" must be read accordingly:

- **Not a grouping source.** Its `Desc. familia` column is AI-derived; product/variant
  grouping now keys on the article-name colour convention instead (ADR-0019 update).
- **Prices/names seeded from it are placeholders** with unverified provenance. The fresh
  full articles+tariffs export (#60) supersedes them on the next `db:import` run; the #6
  verification should use that, not the current seed.
- **`Ancho` / `Metros por pieza` keep provisional status only** — likely pivoted from
  something real, but unverifiable. Kept for now (better than nothing pre-launch), added to
  the #6 spot-check list; the Connector (M3) or admin edits are the real fix.

The three confirmed-real A3 files (articles+tariffs samples, familia master, stock
snapshot) are unaffected and remain the trusted sources.
