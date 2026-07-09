# Ditex Mallorca

The website for D.TEX Mallorca (legal entity RIBOT FUSTER, S.L.), a B2B textile and upholstery materials distributor based in Palma de Mallorca, serving professional clients across the Balearic Islands.

Ditex's defining strength is **foam**: they are the foremost foam supplier in the Balearics and one of the very few able to cut foam to volume (m³) — so much so that competitors offering foam-cutting source their cut foam from Ditex to resell. Foam is the moat; fabrics, polipieles, PVC, fibres and accessories round out a one-stop materials offer for the upholstery trade.

## Language

**Ditex** (D.TEX Mallorca):
The business. A distributor — it resells fabrics, foam, synthetic leather, PVC, and upholstery accessories to professionals; it does not manufacture them.
_Avoid_: the brand, the client (Ditex is us, not a customer)

**Client**:
A professional buyer of Ditex (an upholsterer, boat-fitter, hotel/contract furnisher, or other trade business). Always a business or tradesperson. Core Clients are Spanish- and Catalan-speaking sole traders and small workshops, including furniture-makers who supply hotels, contract projects, and boat businesses. Walk-in individuals buying loose/single pieces exist but are **not** the focus — they are not where the money is.
_Avoid_: customer, user, buyer

**Foam cutting** (corte de espuma a medida):
Ditex's signature capability: cutting foam (gomaespuma) to exact specification, including to volume (m³) and high densities. The basis of their wholesale authority — even other foam-cutters buy from Ditex. **65% of all sales involve a cut; 95% of cuts are made-to-order** (80–100 cut orders/day). Treated as the hero of the brand, not just a product line.
_Avoid_: foam service, cushion cutting

**Cut order** (orden de corte):
The instruction the cutting team works from: client, foam grade, units, measures, client reference, date. Today it is a **paper** note with no unique identifier — the cut piece is labelled by writing the client's name on it in marker. Digitising this (unique IDs, standard sheet, second check) is a key automation opportunity (see docs/business/).
_Avoid_: cut ticket, work order

**Trade segments**:
The professional buyer groups the site targets, in priority order: (1) **local upholstery trade** — sole traders, workshops, furniture-makers (the core, defend it); (2) **marine / nautical** — yacht refit and boat upholstery (higher value, international-leaning, growth wedge); (3) **contract / hospitality** — hotels, restaurants, holiday rentals. Retail individuals are out of focus.
_Avoid_: customers, market (reserve "market" for geography)

**Client Area**:
The password-protected section of the site where authorised Clients view the Price List and related documents. Today it is gated by a single shared password handed out selectively; per-Client logins are a future evolution, not a current requirement.
_Avoid_: portal, dashboard, login area, member area

**Price List** (Tarifa):
The set of products and prices shown inside the Client Area. The same Price List is shown to every Client who has access — prices do not vary *per Client*. They do, however, vary *by destination island*: the Material tariff lists separate **Mallorca** and **Menorca/Ibiza** prices for the same item (the latter carries inter-island freight). Maintained today as PDFs (Telas, Material) generated from a Word document an employee keeps — these cover only the **subset** of products worth a printed catalogue, not the full range. A3 holds the complete catalogue and exports it as Excel. The PDFs already tell Clients that the website is the canonical place for up-to-date prices.
_Avoid_: catalogue (the catalogue is public; the Price List is gated and includes prices)

**Collection** (Colección):
A named grouping of fabrics within the Telas tariff (e.g. CHARLINE, NEW GENERATION). Carries shared attributes — stock availability and delivery terms — that apply to all fabrics inside it. Sits **above** Products: a Collection groups several Products (lines). Do not confuse with **Familia** below.
_Avoid_: range, family, group

**Product** (line):
One commercial line — what the Catalogue shows as **one page**: ALLANTE, OTELLO, VIVO ALGODON 3. Keyed by the **article-name colour convention** in A3: the normalised name before the ` C-` colour marker (`ALLANTE C-832 BURGUNDY` → ALLANTE); names without the marker are standalone Products. Overrides correct the exceptions. A Product contains one or more Variants. (ADR-0019, update section)
_Avoid_: article (that's a Variant), item

**Variant** (colourway):
One A3 article inside a Product — usually a colourway (e.g. ALLANTE **C-832 BURGUNDY**). Carries the A3 SKU (`Cód. artículo`) as its external id, a label (article name minus the line name), and its own prices when they differ from the Product's (68 lines have colour-dependent prices). Products with a single article get one default Variant. (ADR-0019)
_Avoid_: colour option, SKU (as a UI word), sub-product

**Familia** (web category):
One of the **37 simplified product categories** (TELA, ESPUMA, CREMALLERAS, HILOS, MÁQUINAS Y HERRAMIENTAS, …) that organise the website's Catalogue. Defined by the business in a curated master mapping (`familias_proyecto_maestro_simplificado.xlsx`, SKU → Familia) prepared for this project — **not** exported from A3, whose internal "familia" is a much finer grouping (see Collection). The master mapping also implicitly defines which SKUs are web-visible. (ADR-0018)
_Avoid_: A3 familia, category (in code, `familia` means this curated web category)

**Metraje / Pieza**:
The two ways a fabric is priced and sold: **Metraje** = price per linear metre (cut to length); **Pieza** = price per full roll. A single fabric usually has both.
_Avoid_: unit price, bulk price

**Mallorca / Men-Ibz pricing**:
The two-column island pricing — which applies **only to foam**. **Mallorca** = local price (delivered by Ditex's own two vans); **Men-Ibz** (Menorca / Ibiza) = the higher price reflecting the **external carrier**, whose foam freight is charged **by volume** (hence per-item island prices; in A3 these are the `… ISLAS` tariffs). Some items read CONSULTA (price on request) for the second column. Every non-foam article has a **single price** regardless of island — inter-island delivery is covered by the **Inter-island shipping rule** instead. (ADR-0018)
_Avoid_: zone pricing, regional pricing

**Inter-island shipping rule**:
The order-level delivery policy for everything except foam: orders of **150 € or more ship to Menorca/Ibiza free**; below that, a flat **15 € delivery charge** applies. Not configured in A3 — staff add the fee **manually** as an invoice line, and Clients often wait to reach 150 € before ordering. The Client Area must state this rule near prices; automating it is a recorded automation opportunity (docs/business/automation-opportunities.md). (ADR-0018)
_Avoid_: shipping cost, freight surcharge (that's the foam `… ISLAS` price difference)

**Catalogue**:
A public-facing presentation of the product range (fabrics, foam, polipieles, PVC, accessories) without prices. Distinct from the Price List, which is private and priced.
_Avoid_: price list, products page

**A3**:
The on-premise Windows + SQL Server business-management software (Wolters Kluwer a3ERP family) the owner's side uses to manage orders, stock, transport, and tax-agency reporting. The **source of truth** for product, price, stock, and order data. Runs inside the office; never exposed to the internet. Ditex staff are not technical about its internals.
_Avoid_: the ERP, the system, the database

**A3 tariff** (tarifa de venta):
A named per-unit price channel inside A3 — each article carries one price row per tariff: `PVP`, `METRAJE`, `PIEZA`, `ESPUMA PVP`, `CORTE`, `CORTE ISLAS`, `PLANCHA`, `PLANCHA ISLAS`, `UNIDAD`, `CAJA`, `EMBALAJE`. The `… ISLAS` variants carry the Menorca/Ibiza surcharge and exist **only for foam** (`CORTE`/`PLANCHA`). Clients see METRAJE/PIEZA (fabrics) and the foam pairs; `PVP`/`ESPUMA PVP` are retail walk-in prices, never shown on the web. Not to be confused with the **Price List (Tarifa)** — the Client-facing document/section built *from* these tariffs. (ADR-0018)
_Avoid_: price type, price list (reserve for the Client-facing Price List)

**Connector**:
The small local program (a Windows service / scheduled job running on or beside the A3 machine) that syncs data between A3 and the website's own datastore. The only thing that ever talks to A3. See ADR-0003.
_Avoid_: the bridge, the integration, the API (the website's API is a separate thing)

**Guide** (Guía):
A published piece of the content engine (`articles` table) — foam/application know-how by trade segment (marine, contract, furniture-makers), not a generic blog post. AI-drafted from real business expertise, reviewed and published by the non-technical editor; only `published` rows reach `/guias`, `draft` rows are admin-only. One DB row per locale (same `slug` across locales = translations of the same Guide) — a Guide need not be translated into all three locales at once. The SEO/GEO surface that earns search rankings and LLM citations (ADR-0002, ADR-0008, ADR-0010).
_Avoid_: article (reserve for a Variant's A3 article, or generically "blog post"), post
