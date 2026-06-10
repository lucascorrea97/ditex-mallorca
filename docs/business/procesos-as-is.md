# Procesos actuales (AS-IS) — resumen

Source: "Documento de Procesos Actuales.docx" (owner-provided, June 2026). This summary
keeps the operative facts in-repo so agents and tickets can rely on them. The .docx is the
original; update this file if a newer version arrives.

## Operating profile

| Fact | Value |
|---|---|
| Employees | 15 (Dirección, Administración, Compras, Comercial, Almacén, Corte, Reparto, Facturación) |
| ERP | A3 ERP |
| **Active SKUs** | **> 10,000** (the web tariff PDFs cover only a small printed subset — see ADR-0006) |
| Orders | ~80/day, ~800 order lines/day |
| **Foam cutting** | **65% of sales involve a cut; 95% of cuts are made-to-order** |
| Purchase-to-order | **85% of orders require buying from a supplier first** (lead time depends on supplier) |
| Complaints | ~15/month (register: a recently introduced Excel) |
| Delivery | 2 own drivers for Mallorca; **external carrier for Menorca/Ibiza** (matches the Men-Ibz price column) |
| Stock accuracy | ~5% variance ERP vs physical; annual inventory (December); no barcodes, no coded locations |

## How an order actually flows today

1. **Intake** — client asks via **WhatsApp, email, phone, counter visit, or sales visit**.
2. **Paper** — the request is written down by hand.
3. Stock checked; if absent (85% of the time) a **purchase order to the supplier** is raised.
4. The sales order is **typed into A3 later** (double data entry; transcription errors; no CRM).
5. **Cut orders** go to the cutting team **on paper**: client, foam grade, units, measures,
   client reference, date. The cut piece is identified by **writing the client's name on it
   in marker**. No unique order ID, no traceability, **no second check before dispatch**
   (typical errors: wrong measure / material / quantity).
6. **Dispatch** — checked against the delivery note; no picking list, no scanning.
7. **Delivery** — own vans (Mallorca) or external carrier (Men-Ibz); incidents not formally logged.
8. **Invoicing** — generated automatically in A3; collections followed up case-by-case.

## Risks the business itself identifies

- Operational dependence on two key people ("A y C") and on personal knowledge generally.
- Paper dependence in sales intake and cutting; no unique cut-order identifier; no traceability.
- No coded warehouse locations, no barcodes; no formal purchase planning or supplier KPIs.
- No historical incident register (Excel just introduced); no operational indicators.

## What this means for the website project

- **Catalogue scale**: >10k SKUs in A3 vs ~530 in the tariff PDFs. Which subset is
  web-visible is a **business decision** (asked in #6). Importer (#5), catalogue (#7) and
  search (#8) must be built for thousands of products, not hundreds.
- **Stock display**: with ~5% variance and no scanning, the site must show **availability
  bands** ("en stock" / "bajo pedido"), never exact live counts (#7, #18).
- **Order status (#20)** is even more valuable than assumed: 85% purchase-to-order means
  variable lead times — exactly what generates "¿dónde está mi pedido?" calls. Status
  vocabulary must include a *waiting-on-supplier* state.
- **Structured web intake (#21)** attacks the paper + double-entry problem at the source.
- See [automation-opportunities.md](./automation-opportunities.md) for the full map.
