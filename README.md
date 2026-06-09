# ditex-mallorca

Revamp of the web presence for **D.TEX Mallorca** (RIBOT FUSTER, S.L.) — a B2B textile and
upholstery-materials distributor in Palma de Mallorca, and the **foam authority of the
Balearics**.

> **Status: planning.** No application code yet. This repo currently holds the thinking —
> the domain glossary, the decision log, and the plan — produced in a `grill-with-docs`
> session. Build starts from here.

## Start here

| Doc | What it is |
|---|---|
| [PLAN.md](./PLAN.md) | The whole plan on one page — vision, architecture, launch model, milestones, open questions. |
| [CONTEXT.md](./CONTEXT.md) | The domain glossary — the shared language for this project. Read before naming anything. |
| [docs/adr/](./docs/adr/) | The decision log — *why* every choice was made. Index below. |

## Decisions (ADRs)

1. [Simplicity-first UI for aging, non-technical clients](./docs/adr/0001-simplicity-first-for-aging-non-technical-clients.md)
2. [The website is a growth engine, not a brochure](./docs/adr/0002-website-as-growth-engine-not-brochure.md)
3. [Website owns its data; A3 syncs via a local Connector](./docs/adr/0003-website-owns-its-data-a3-syncs-via-local-connector.md)
4. [Domain strategy: `.es` canonical, recover `.com` via UDRP](./docs/adr/0004-domain-strategy-es-canonical-pursue-com-via-udrp.md)
5. [Build offline; keep WordPress live until cutover](./docs/adr/0005-build-offline-keep-wordpress-live-until-cutover.md)
6. [Seed catalogue from PDFs; A3 Connector later](./docs/adr/0006-seed-catalogue-from-pdfs-a3-connector-later.md)
7. [Stack: one Next.js app, custom React admin, free-tier](./docs/adr/0007-stack-next-custom-react-admin-free-tier.md)
8. [Foam-led positioning](./docs/adr/0008-foam-led-positioning.md)
9. [Languages: ES + CA + EN; defer DE/FR](./docs/adr/0009-languages-es-ca-en-defer-de-fr.md)
10. [AI-assisted content engine; user as expertise conduit](./docs/adr/0010-ai-assisted-content-engine-user-as-expertise-conduit.md)
11. [Client Area findability: hybrid + auto-PDF bridge](./docs/adr/0011-client-area-findability-hybrid-plus-auto-pdf-bridge.md)
12. [Privacy-first analytics to learn and iterate](./docs/adr/0012-privacy-first-analytics-to-learn-and-iterate.md)
13. [Big-bang launch: no public MVP](./docs/adr/0013-big-bang-launch-no-public-mvp.md)
14. [Content parity + design upgrade; reproduce-then-refine](./docs/adr/0014-content-parity-design-upgrade-reproduce-then-refine.md)
15. [Centralized design tokens; copy is provisional pending a marketing pass](./docs/adr/0015-centralized-design-tokens-provisional-copy.md)
16. [Imagery: own-photography first, manifest-driven, no AI](./docs/adr/0016-imagery-own-photography-first-manifest-driven.md)

## The one-paragraph version

Build a foam-led, SEO/GEO-first site on Next.js (free-tier), seeded from the current tariff
PDFs and later fed live by the on-prem **A3** ERP via a local Connector. A public catalogue
(no prices, crawlable) doubles as a logged-in **Client Area** (with Mallorca/Men-Ibz prices +
an auto-generated PDF). Built entirely offline on `ditexmallorca.es`, launched big-bang once
A3 and order-status self-service are done. Meanwhile, recover the rogue `ditexmallorca.com`
via a trademark-backed UDRP. See [PLAN.md](./PLAN.md).
