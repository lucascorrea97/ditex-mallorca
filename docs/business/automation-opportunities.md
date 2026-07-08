# Automation opportunities (from the AS-IS process audit)

Derived from [procesos-as-is.md](./procesos-as-is.md). Ranked by value ÷ effort, and split
between what the **website project already covers**, what's **new and near**, and what is
**future ops work** (the user's growing IT role, beyond the website).

## Already on the roadmap — now validated & sharpened by the audit

| Opportunity | Where | Sharpened by the audit |
|---|---|---|
| Structured order/enquiry intake | #21 | Today: WhatsApp/phone/paper → re-typed into A3 (~80 orders/day, double entry, no CRM). A structured web request that lands as data (and later writes to A3 via the Connector) removes transcription at the source. |
| Order-status self-service | #20 | 85% of orders wait on a supplier purchase → variable lead times → status page must include "esperando material" so clients stop phoning. |
| Live Price List / catalogue | #5/#7/#14 | Kills the A3 → Word → PDF → upload chain. Scale is ~7k SKUs (business-confirmed 2026-07-08), not ~530. |
| Admin dashboards / indicators | #16 (extends) | The business has *no operational KPIs*; once orders/incidents flow through the site+Connector, basic indicators are nearly free. |

## New, high-value, near-term (website-adjacent)

1. **Foam cut configurator** (new issue) — 65% of sales involve a cut and 95% are bespoke.
   A dead-simple web form: foam grade → measures → quantity → client reference, producing a
   **structured cut request** (quote/enquiry per ADR — no online payment). Each request gets a
   **unique ID** — the very thing the cutting workflow lacks. Start as enquiry (#21 pattern);
   later it can print a standardized **cut sheet** for the workshop.
2. **Digital cut sheet for the workshop** — even *without* the web: generate printed cut
   orders with unique IDs, standard layout, and a verification checkbox (today: marker pen on
   foam, interpretation errors, no second check, ~15 claims/month). Small tool, big error
   reduction. Needs business buy-in → owner-decision ticket.
3. **Incident register** — they just started an Excel. A tiny structured register (admin
   area) with cause categories gives traceability + the missing KPIs. Candidate for the
   custom admin (#16) later.
4. **Automatic inter-island delivery fee** — the 150 €/15 € shipping rule (see CONTEXT.md:
   Inter-island shipping rule) is applied **manually**: staff remember the rule and type a
   delivery-fee line onto the A3 invoice, order by order (learned 2026-07-08). Once structured
   orders/enquiries exist (#21, and the cut configurator), the site can apply the rule
   automatically — show the fee (or the "X € left for free shipping" nudge) at request time,
   and pass it through to A3 via the Connector later. Zero-decision automation with a built-in
   upsell nudge.

## Future ops backlog (beyond the website; not now)

- **CRM-lite** — per-Client accounts (already a future phase) naturally seed a customer record.
- **Barcodes + coded warehouse locations + picking lists** — the audit's biggest warehouse
  gaps; likely A3 modules/partner territory, big change-management. Not software we build first.
- **Purchase planning / supplier KPIs** — analytics over A3 data via the Connector, once it exists.
- **Delivery incident log / route notes** — small, after order-status ships.

## Decision needed from the business (tracked as an owner ticket)

Which of the near-term items to pursue and in what order — especially: web-visible product
subset (all ~7k vs tariff subset), the cut configurator, and the workshop cut sheet
(changes how the cutting team works; needs their buy-in).
