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
Ditex's signature capability: cutting foam (gomaespuma) to exact specification, including to volume (m³) and high densities. The basis of their wholesale authority — even other foam-cutters buy from Ditex. Treated as the hero of the brand, not just a product line.
_Avoid_: foam service, cushion cutting

**Trade segments**:
The professional buyer groups the site targets, in priority order: (1) **local upholstery trade** — sole traders, workshops, furniture-makers (the core, defend it); (2) **marine / nautical** — yacht refit and boat upholstery (higher value, international-leaning, growth wedge); (3) **contract / hospitality** — hotels, restaurants, holiday rentals. Retail individuals are out of focus.
_Avoid_: customers, market (reserve "market" for geography)

**Client Area**:
The password-protected section of the site where authorised Clients view the Price List and related documents. Today it is gated by a single shared password handed out selectively; per-Client logins are a future evolution, not a current requirement.
_Avoid_: portal, dashboard, login area, member area

**Price List** (Tarifa):
The set of products and prices shown inside the Client Area. The same Price List is shown to every Client who has access — prices do not vary *per Client*. They do, however, vary *by destination island*: the Material tariff lists separate **Mallorca** and **Menorca/Ibiza** prices for the same item (the latter carries inter-island freight). Maintained today as two PDFs (Telas, Material) the owner's side produces and uploads manually. The PDFs already tell Clients that the website is the canonical place for up-to-date prices.
_Avoid_: catalogue (the catalogue is public; the Price List is gated and includes prices)

**Collection** (Colección):
A named grouping of fabrics within the Telas tariff (e.g. CHARLINE, NEW GENERATION). Carries shared attributes — stock availability and delivery terms — that apply to all fabrics inside it.
_Avoid_: range, family, group

**Metraje / Pieza**:
The two ways a fabric is priced and sold: **Metraje** = price per linear metre (cut to length); **Pieza** = price per full roll. A single fabric usually has both.
_Avoid_: unit price, bulk price

**Mallorca / Men-Ibz pricing**:
The two-column island pricing on Material items. **Mallorca** = local price; **Men-Ibz** (Menorca / Ibiza) = the higher price reflecting inter-island shipping. Some items read CONSULTA (price on request) for the second column.
_Avoid_: zone pricing, regional pricing

**Catalogue**:
A public-facing presentation of the product range (fabrics, foam, polipieles, PVC, accessories) without prices. Distinct from the Price List, which is private and priced.
_Avoid_: price list, products page

**A3**:
The on-premise Windows + SQL Server business-management software (Wolters Kluwer a3ERP family) the owner's side uses to manage orders, stock, transport, and tax-agency reporting. The **source of truth** for product, price, stock, and order data. Runs inside the office; never exposed to the internet. Ditex staff are not technical about its internals.
_Avoid_: the ERP, the system, the database

**Connector**:
The small local program (a Windows service / scheduled job running on or beside the A3 machine) that syncs data between A3 and the website's own datastore. The only thing that ever talks to A3. See ADR-0003.
_Avoid_: the bridge, the integration, the API (the website's API is a separate thing)
