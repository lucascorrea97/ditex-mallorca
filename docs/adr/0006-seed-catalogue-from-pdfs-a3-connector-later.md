# Seed the catalogue from the current tariff PDFs; A3 Connector takes over later

The Client Area and public Catalogue launch on product/price data **parsed from the two current tariff PDFs** (Telas ~530 fabrics in collections; Material wadding/fibre/cushion items with Mallorca + Men-Ibz pricing). The A3 Connector (ADR-0003) becomes the source of truth in a later phase, writing into the **same data model**.

## Why

- The A3 integration has open unknowns and an on-site Connector to build — the slowest, least-controllable piece. Blocking the whole project on it contradicts "build offline now" (ADR-0005) and "quality over speed but no artificial blockers" (ADR-0002).
- We already have the PDFs parsed into structured data; the seed is essentially free.

## How

- Parse both tariffs into the website's datastore in the structure A3 will later feed (items, collections, units metraje/pieza, dual island pricing).
- Provide a **simple admin screen** (must itself satisfy ADR-0001 simplicity — the owner's daughter is not technical) for the owner's side to correct and update prices until the Connector exists.
- When the Connector lands, A3 becomes authoritative; the manual admin path is retired for catalogue/price fields (may remain for website-only fields A3 doesn't hold, e.g. marketing copy, images).

## Consequences

- Parsed PDF prices need a human sanity-check before launch (PDF table extraction is imperfect).
- Someone on the owner's side owns keeping prices current until the Connector ships.
- No rebuild at Connector time: same schema, the data's origin just changes from "typed by a human" to "synced from A3".
- If A3 can already export Excel/CSV, prefer that over PDF parsing as the seed — cleaner and more reliable.
