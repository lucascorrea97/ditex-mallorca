# Parity-first demo milestone (M0): reproduce the current site, feature-flag the rest

**Status:** Accepted (2026-09-01)
**Amends:** ADR-0013 (big-bang, no public MVP) · ADR-0011 (Client Area findability) · ADR-0005 (build offline until cutover)

## Context

We are far from the full-scope launch — it is gated on business inputs we don't control (the
A3 export #60, A3 discovery #17, price verification #6, photography #36, messaging #76). We
have meanwhile built a lot the current site does *not* have (browsable catalogue, ~2,200
product pages with variants, search, guides, a generated price-list PDF, a request/enquiry
flow). None of it is visible to the family yet, so the progress is invisible and buy-in is
stalling.

ADR-0013's big-bang stance (no public MVP) was accepted for family-credibility reasons, and
PLAN.md explicitly named it the #1 revisit candidate. The son-in-law (driving the build) has
decided to revisit it — not to launch, but to **demonstrate**.

## Decision

Introduce **Milestone M0 — Parity Demo**: a curated surface of the new site that **matches
what the current `ditexmallorca.es` has today, and hides everything it doesn't**, shown to
the family behind the existing noindex + Vercel auth wall to win buy-in. The live WordPress
site is untouched (ADR-0005 still holds); this is **not** a public launch (ADR-0013's
big-bang cutover remains the eventual model — M0 is a private demo, decided 2026-09-01).

### What M0 must MATCH (the current site's surface)
Home · About ("más de 30 años al sector textil") · Materials/textiles · Products · **Client
Area = the 3 real PDFs** (Telas tariff, Material tariff, Catálogo) behind login · Contact ·
Legal (aviso legal, privacidad, cookies, **accesibilidad**).

### What M0 must HIDE (built, but the current site lacks it)
The whole `/catalogo` (categories, search, collections, product/variant pages) · `/guias` ·
the request/enquiry flow (`area-clientes/solicitud`) · the auto-generated price-list PDF and
on-page price tables in the Client Area.

### How to hide — flag, don't delete
A single **parity flag** (e.g. `NEXT_PUBLIC_PARITY_MODE`) drives hiding centrally: hidden
routes are removed from nav + footer, dropped from the sitemap, and blocked at the route level
(return 404 / redirect home) so nothing is reachable by URL. All hidden code stays in the
repo, untouched, re-enabled by flipping the flag off. No feature is deleted or reverted.

### Client Area in M0 (amends ADR-0011)
ADR-0011's generated-PDF + price-table bridge is **hidden for M0** and replaced by serving the
**3 real, current PDFs** as downloads behind the existing shared-password login. Rationale:
(1) exact parity with the current site; (2) the imported catalogue still carries February
*placeholder* prices (source file demoted, ADR-0018/0019) — showing our generated tables would
show wrong numbers. The generated bridge returns when real prices land (#60) and full scope
resumes.

## Consequences

- New work: a parity-flag/gating mechanism, a PDF-serving Client Area, an accesibilidad page,
  and a content-parity check on the static pages. Tracked as M0 issues.
- The `Catálogo-nov-2025.pdf` is ~82 MB — too big to commit to git. Serve it via blob/object
  storage or compress it first; decided in the Client-Area issue, not here.
- Existing feature issues (#42 configurator, #18–#21 A3/self-service, guides content #32/#12)
  are **not** cancelled — they are post-M0, unchanged.
- Flipping `NEXT_PUBLIC_PARITY_MODE` off restores the full experience for the eventual
  big-bang launch — M0 adds a switch, it does not fork the product.
- If the family reacts well, the natural next step is the real cutover (#23), at which point
  ADR-0013's big-bang decision gets formally re-evaluated with their buy-in in hand.
