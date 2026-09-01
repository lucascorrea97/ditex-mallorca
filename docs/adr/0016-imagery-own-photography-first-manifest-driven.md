# Imagery: own-photography first, manifest-driven, no AI

Content migration (#28) confirmed the current `ditexmallorca.es` uses base64 pixel-placeholders — there is **no real photography to migrate**. The new site needs imagery created, above all to make the foam moat visible (ADR-0008). This is a sourcing problem, not a migration one.

## Source priority

1. **Ditex's own photography** — foam being cut (including to m³), the warehouse, fabric/foam rolls, the island delivery vans, the team at work. This *is* the moat made visible, and no competitor can fake it. Highest value, highest authenticity.
2. **Supplier / brand product imagery** — many telas/polipieles brands provide professional swatch/product photography to their distributors; obtain usage rights and reuse.
3. **Curated stock** (Unsplash/Pexels, free tier) — only as a *temporary* supplement for generic scenes (interiors, yachts) where own-photography isn't practical. Clearly marked as placeholder-grade.

**No AI-generated imagery** for heroes, products, people, or the foam story. For a trust-based B2B, fake-looking imagery backfires; authenticity is the point.

## Mechanism

- A typed **image manifest** is the single source of truth for every image slot: id, page/section, purpose, aspect ratio, priority, source-strategy, and Spanish (SEO-bearing) alt text. Components render against the manifest — not hard-coded `<img>`s.
- A reusable **`ImageSlot`** renders a tasteful **branded placeholder** (d·tex mark on a subtle surface + the slot's intended description) for any slot without a real asset yet. So the site always looks intentional, and swapping in a real photo is a **one-line manifest change**.
- **Workflow** (ADR-0010 conduit): the user drops supplied photos into a known inbox folder; an agent maps them into the manifest and wires the slots. This is the user's "save images locally so agents can find them" instinct, formalised — and more robust than screenshots, which agents can't place from reliably.

## Consequences

- **Per-product catalogue images** (hundreds of SKUs, #7) are a separate, larger asset stream tied to A3 — out of scope here. This ADR covers marketing/section imagery.
- Alt text is Spanish and doubles as SEO (foam/segment keywords).
- Priority 1 = hero + foam-cutting shots; everything else can ride branded placeholders until captured, so launch is never blocked on a full shoot.
- Annotated screenshots of pages are fine as a *human communication aid* for the shot list, but the manifest — not screenshots — is the machine-readable contract.

## Update (2026-09-01): demo-only exception — AI-generated interim hero

This ADR bars AI imagery. For the **M0 parity demo** (ADR-0021) the owner chose to use a
single **AI-generated hero image** as a temporary placeholder, to present a powerful,
foam-led home page while real photography is gathered. This is an explicit, narrow exception:

- **Scope:** the home hero only (`/images/home-hero.jpg`), and only while the site is a
  private demo behind the auth wall. Not the public launch.
- **Why allowed here:** the goal is to win family buy-in now; the image is abstract
  (precision-cut foam blocks, no people/uncanny industrial action), so it reads as premium
  materials imagery rather than a fabricated scene.
- **Must be replaced before public launch** with a real foam-cutting photograph (#36). The
  no-AI rule stands for every other slot and for anything that ships publicly.
- The manifest `home-hero` entry and the hero comment in `app/[lang]/page.tsx` both flag the
  swap. The hero copy's proof line ("even competitors buy our cut foam") is pending owner
  sign-off on wording (#76).
