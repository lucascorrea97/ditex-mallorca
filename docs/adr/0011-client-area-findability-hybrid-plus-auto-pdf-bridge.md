# Client Area findability: hybrid search + browse, with an auto-generated PDF bridge

Neither we nor the user yet know whether Clients look things up by product *name* (e.g. CHANEL), by *use case* (foam for a restaurant bench), or just browse. The current PDF tariff is frequently updated and relied upon. Core Clients are older and non-technical (ADR-0001).

## Decision

Offer **all paths at once** and let analytics (ADR-0012) reveal real behaviour:

1. **Hybrid web findability** — a prominent **search** box (matches product names *and* use/application keywords) **plus** dead-simple **browse** by category/collection (Fabrics → collection → product; Foam by use; Materials by type). Belt-and-braces so name-thinkers and category-thinkers both succeed.
2. **Downloadable PDF as a transition bridge** — Clients can still download a price PDF exactly like today, so nobody is forced to change habits on day one. Adoption of the web UX happens at each Client's own pace.
3. **The PDF is auto-generated from the structured catalogue** — not manually uploaded. This eliminates the original pain (partner → email PDF → manual upload → copy link → paste on button) and guarantees the download is always current.

## Public catalogue vs private Price List

One product database, two views: the **public Catalogue** shows products **without prices** (crawlable, fuels foam-authority SEO/GEO — ADR-0008); logging into the **Client Area** reveals the **prices** (both Mallorca and Men-Ibz columns) on the same pages and in the PDF.

## Consequences

- Build cost is higher (search + browse + PDF generation), justified by de-risking the transition for non-technical Clients.
- The PDF generator renders from the same data as the web views — single source, no drift.
- The PDF bridge can be retired later if analytics show Clients have moved to web search/browse — a data-driven decision, not a guess.
