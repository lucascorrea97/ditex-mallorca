# Centralized design tokens; copy is provisional pending a marketing pass

Two decisions from the v1 design review (#27).

## 1. Everything visual flows through centralized tokens

Colour tone, type scale, and spacing/density must be changeable **globally from one place**, not by editing values scattered across components. The user approved the v1 tones, scale, and density but explicitly wants to retune them smoothly later.

- **Colour** is already tokenized (`@theme` in `app/globals.css`): `ink` + `brand-*` + neutrals. Changing the brand red is a one-line change.
- **Typography scale and spacing/density** are still raw Tailwind utilities in components — these get consolidated into themeable tokens / a single scale knob so they're equally easy to retune. Tracked as a follow-up issue.

Rule going forward: components consume tokens/semantic classes, never magic values. Reviews check this.

## 2. All marketing copy is provisional

The hero wording and every page's copy in v1 are **placeholders**. Final wording and positioning must come from a dedicated, professional **marketing + branding effort grounded in real market research** — treated seriously, not written ad-hoc. Do not polish or treat current prose as final; it exists only to exercise the design. Tracked as its own issue.

## Consequences

- A token-consolidation issue (typography + spacing) and a marketing/brand-copy research issue are created alongside this ADR.
- Until the marketing pass, copy is functional filler; effort on wording before then is wasted.
- The design system is the contract: retuning tone/scale/density should never require touching component internals.
