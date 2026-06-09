# The website owns its own data; A3 syncs in via a local Connector

A3ERP is an on-premise Windows + SQL Server application running inside the Ditex office. It is not cloud-hosted and must never be exposed directly to the public internet. Therefore the public website will **own its own datastore** (products, prices, stock snapshots, order-status snapshots), and a small **Connector** running on/next to the A3 machine will sync data between A3 and the website.

## How it works

- **Catalogue / Price List (A3 → website):** the Connector reads items, families, prices, and stock from A3 (via Link API if licensed, otherwise SQL read) and pushes them to the website's datastore. The public site and Client Area always render from the website's own copy — fast, SEO-friendly, and resilient if A3 is offline.
- **Order status (A3 → website):** the Connector pushes order-state changes to the website (on a schedule and/or via A3 webhooks/Link API) so Clients can self-serve "where's my order" without phoning the office.
- **Enquiries / reorders (website → A3), later phase:** structured requests captured on the site are written into A3 via the C# DLL / Link API, or simply delivered to the office to key in. Writes are sequential, never parallel (the A3 write path is not concurrency-safe).

## Considered Options

- **Website calls A3 in real time** — rejected: A3 is on-prem, fragile, not concurrency-safe, and would mean exposing the office ERP/SQL to the internet. Also couples public page speed to ERP responsiveness — bad for SEO and reliability.
- **Website owns its data, Connector syncs** (chosen) — decouples a fast public site from a fragile on-prem ERP; A3 stays behind the office firewall; the site survives A3 downtime.

## Consequences

- We must build/host a small Connector (a local Windows service or scheduled job) near A3. This is the integration's real cost and risk, not the website itself.
- Sync is eventually-consistent: prices/stock/status on the site are as fresh as the last sync, not millisecond-live. For this business that is fine (prices change occasionally; order status in near-real-time is plenty).
- **Open unknowns to confirm with the business / their A3 provider before building** — see the discovery list in the planning notes. We do not yet know: exact A3 product/version, whether Link API is licensed, server/network setup, or who administers it.
