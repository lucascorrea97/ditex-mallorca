# Ditex Mallorca — Project Plan

> Planning artifact. Synthesises the grilling session into one place. The authoritative
> *why* for each decision lives in [docs/adr/](./docs/adr/); the shared vocabulary lives
> in [CONTEXT.md](./CONTEXT.md). This file is the map, not the territory.

## Vision

Rebuild Ditex Mallorca's web presence into a **growth engine**: the website — and the
**AI answer** — that wins Ditex new trade clients and keeps existing ones, anchored on the
one thing no competitor can claim: **Ditex are the foam authority of the Balearics**
(cut-to-volume m³ foam; even competitors resell Ditex's cut foam).

## Priorities (in order)

1. **SEO + LLM/GEO visibility** — be the answer for upholstery/foam materials in Mallorca, in search *and* in LLMs. (ADR-0002, ADR-0008, ADR-0010)
2. **A working Client Area at launch** — live prices clients trust. (ADR-0011)
3. **Self-service that removes phone/office load** — order status first. (ADR-0003)

## Who it's for

Core: Spanish/Catalan-speaking trade — sole traders, workshops, furniture-makers supplying
hotels/contract/boats. Growth wedge: marine/nautical (international, English-leaning). Third:
contract/hospitality. Retail walk-ins are deliberately out of focus. (CONTEXT: Trade segments)

Languages at launch: **ES + CA + EN**. German/French deferred — only offer languages the
business can service. (ADR-0009)

## The three-domains problem

| Domain | Status | Plan |
|---|---|---|
| `ditexmallorca.es` | Ours (WordPress) | **Canonical.** Build new site here; 301 old URLs at cutover. |
| `ditexmallorca.com` | Rogue, locked at OVH, held by a disliked local IT firm, expires 2027-01-21 | Recover via **UDRP** (business owns a trademark) + drop-catch watch; out-SEO it meanwhile. (ADR-0004) |
| `ditex.vercel.app` | Abandoned prototype (ours) | Superseded by this build. |

## Architecture (one Next.js app, free-tier)

- **Public site** — Next.js App Router, SSR/SSG, structured data, ES/CA/EN. The SEO/GEO surface.
- **Custom React admin** at login-gated `/admin` — bespoke (not a CMS), so it extends into
  dashboards/analytics later. Auth via Auth.js (the one thing we don't hand-roll). (ADR-0007)
- **Own datastore** (Postgres, free tier) — the website owns its data. (ADR-0003)
- **A3 Connector** — small local service by the on-prem A3 ERP; syncs catalogue/prices/stock
  out and order-status out; never exposes A3 to the internet. (ADR-0003)
- Hosting Vercel Hobby; images Cloudinary/Supabase; cookieless analytics. All free-tier.

## Data & catalogue

- One product database → **two views**: public **Catalogue** (no prices, crawlable) and the
  **Client Area** (same pages + Mallorca/Men-Ibz prices). (ADR-0011)
- **Seeded now** from the parsed tariff PDFs (Telas ~530 fabrics in collections; Material with
  island pricing); **A3 Connector** becomes source of truth later — same schema, no rebuild. (ADR-0006)
- **Findability**: prominent search + simple browse + an **auto-generated downloadable PDF**
  as a transition bridge (kills the manual upload workflow; always current). (ADR-0011)

## Launch model

**Big-bang launch — no public MVP.** Build entirely offline on noindex staging; keep the live
WordPress untouched; cut over `.es` only when the *full* product (through A3 + order-status) is
done and signed off. (ADR-0005, ADR-0013)

> ⚠️ Known trade-off: this **gates launch on A3** (least-controllable piece) and **defers
> SEO compounding**. The rejected alternative — soft-launch the public site + Client Area
> first, then layer A3/self-service — is the #1 revisit candidate. (ADR-0013)

### Build milestones (all pre-launch)
- **M1 — Foundation:** design system + content-complete baseline (all current-site content/images
  ported onto a better, foam-led design — ADR-0014) → then foam-led public site + full public
  Catalogue (PDF-seeded) + structured data + i18n + analytics + first batch of foam/application content.
- **M2 — Client Area:** Auth.js login, prices (both island columns), hybrid search/browse,
  auto-generated PDF, simple custom admin for price/content edits.
- **M3 — A3 Connector:** A3 becomes source of truth for catalogue/prices/stock.
- **M4 — Self-service:** order-status lookup; reorder/enquiry flow (no online payment).
- **Cutover:** sign-off → 301s in place → DNS switch → Client Area live from minute one.

### Post-launch backlog (needs production data / capacity)
Analytics-driven tuning · retire the PDF bridge if data supports · full online checkout (maybe)
· German market once serviceable · flip canonical to `.com` once recovered · admin dashboards.

## Open questions / homework

- **A3 discovery** (blocks M3): exact product/version; Link API licensed?; where it runs;
  the A3 reseller-partner contact; always-on internet + who can install the Connector.
- **Domain recovery:** file UDRP (owner's decision/budget) using the existing trademark; arm a
  drop-catch watch for 2027-01-21.
- **Price sanity-check:** human verification of PDF-parsed prices before launch.
- **Catalogue source:** can A3 export Excel/CSV? Prefer it over PDF parsing for the seed.

## Decision log

See [docs/adr/](./docs/adr/) — ADR-0001 through ADR-0013. Start there for the *why* behind
anything above.
