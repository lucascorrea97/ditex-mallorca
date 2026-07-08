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
   `PIEZA ISLAS` / `UNIDAD ISLAS` exist. The Mallorca/Men-Ibz columns printed in the Material
   PDF may therefore be maintained **manually in the Word document**, not in A3. Whether the
   PDF island prices for non-foam items are authoritative is a verification question (#6).
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
- The Material PDF's island columns for **non-foam** items need business verification (#6) —
  they may not exist in A3 at all.
- Sample files live locally in `~/ditex-data/a3-samples/` (kept **out of the repo** because
  they contain cost prices).
