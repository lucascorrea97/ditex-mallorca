# Reorder/enquiry Request flow (no online payment)

**Status:** Accepted
**Relates to:** ADR-0002 (self-service goals), ADR-0007 (admin back-office), ADR-0011 (Client
Area pricing), ADR-0018/ADR-0019 (catalogue/product model), issue #21, issue #42 (foam
configurator, out of scope here), issue #18 (A3 Connector, future)

## Context

Per `docs/business/procesos-as-is.md`, ~80 orders/day arrive by WhatsApp/email/phone/counter,
get written on paper, and are re-typed into A3 by hand — double entry, transcription errors,
and **no unique identifier** on the paper note itself. PLAN.md's M4 milestone calls for a
reorder/enquiry flow with **no online payment**: the Client assembles a structured ask from
the Catalogue, the office confirms price and fulfils through A3 exactly as today. ADR-0001's
audience (older, non-technical trade Clients) rules out a cart-and-checkout metaphor.

Two constraints shape the design:

- The **Client Area** (ADR-0011) is a single shared password — `session.user.id` is always the
  literal `"shared-client"`. There is no per-Client identity to attach a request to, unlike a
  normal e-commerce account.
- **Foam prices are hidden** (`lib/prices.ts`'s `UNIT_ORDER` whitelist excludes `pvp`/`m3`/
  `plancha`) and cut-to-measure foam is a distinct, larger problem (#42, the cut configurator).
  This flow must not promise a foam price or attempt cut-measure capture.

## Decision

**Request** (Solicitud) is the new domain concept: a structured, non-binding ask a Client
builds from the Catalogue and sends to the office. It is stored in the DB, not emailed —
that's the system of record and the future join point for the A3 Connector (#18).

- **Schema**: `requests` (reference, business name, contact phone/email, general note, status
  `new`/`handled`, timestamps) + `request_lines` (product/variant snapshot, quantity, unit,
  per-line note). See `db/schema.ts`.
- **Identity capture on the request, not the session**: because the shared password carries no
  Client identity, the form requires a business name and at least one contact method
  (phone or email) — the same fields a phone/counter order would capture on paper today.
- **Denormalised line snapshot**: `product_id`/`variant_id` are `set null` on delete (not
  `cascade`) because a full `db:import` catalogue re-seed deletes and recreates every product/
  variant with fresh ids. `product_name`, `variant_label`, `sku` are captured at request time
  so the office — and any future Connector hand-off — can always read what was actually asked
  for, independent of later catalogue churn.
- **Human-readable reference**: every request gets a unique reference (`P-<id>`, e.g.
  `P-1024`) built from the row's own `serial` id at insert time — this directly answers the
  paper workflow's missing-unique-ID problem. It is shown in the confirmation and searchable
  in the admin list.
- **No price is ever promised** in the form, confirmation, or admin view. The office confirms
  price by phone/email as today; the flow never bypasses `lib/prices.ts`'s display whitelist,
  and foam lines are captured as a plain quantity + free-text note (e.g. "70x40cm"), not a cut
  configurator — that remains #42's scope.
- **Inter-island shipping rule note**: surfaced on the review page whenever the request
  contains at least one non-foam line, reusing the existing `catalogo.shippingRuleNote`
  dictionary copy rather than duplicating it.
- **Admin list, Spanish-only**: a new `/admin/solicitudes` view lists requests (reference,
  business name, status, created date) and a detail page to flip `new` → `handled`, mirroring
  the existing `app/admin/productos` / `app/admin/contenido` conventions (`requireAdmin()`,
  `revalidatePath`, no i18n — the back-office is Spanish-only per ADR-0007).
- **No notification integration in this PR.** Which channel (email, WhatsApp, an A3 inbox) the
  office wants for new-request alerts is a business decision, not an engineering default — a
  follow-up `needs-owner-input` issue is opened for it. Until it lands, staff must check
  `/admin/solicitudes` to see new requests.
- **Client-side cart, no server session**: since there's no per-Client session to hold
  in-progress state, the request being assembled while browsing multiple product pages lives
  in `localStorage` (`lib/request-cart.ts`), read once by the review page on mount.

## Consequences

- The Catalogue product page (Client Area view only, gated the same way pricing is) gains an
  add-to-request widget: quantity, unit, and — when the Product has more than one Variant — a
  required colourway selector.
- A new `POST /api/requests` route handler is the only write path: it validates business
  name + contact + non-empty lines, reserves the reference, and inserts the request and its
  lines in one transaction.
- This is deliberately **not** an "order" (ADR terminology discipline, CONTEXT.md): no price is
  confirmed, no payment occurs, and fulfilment still runs entirely through A3 as today. A
  future Connector-backed "order status" feature (already scoped as a distinct placeholder on
  the admin home page) is a different concept and should not be merged with this one.
- Risk accepted: the reference's numeric part is a global sequence, not a per-year counter
  reset to `0001` — uniqueness is guaranteed, human-friendly year-numbering is not. Acceptable
  for v1; revisit only if the office asks for it.
