# Content parity + design upgrade; reproduce-then-refine

The first public-site deliverable is a **content-complete baseline**: every piece of content from the current `ditexmallorca.es` (all text and images) ported onto a fresh, cohesive design system that is clearly better than today's site and organised around the foam-led IA (ADR-0008). From that viewable baseline, design is fine-tuned iteratively against the deployed preview.

## The distinction that matters

- **Parity on content** — we lose *nothing*. Every page, paragraph, and image the current site has must exist in the new one (or be deliberately retired with a reason). This protects the cutover (ADR-0005) and the business's existing SEO/text.
- **Leapfrog on design and structure** — we do **not** clone the current visual design. It has weak bones (placeholder/base64 images, redundant navigation, generic "excelencia y calidad" positioning). Reproducing it would inherit its mediocrity and undercut the "clearly more valuable" bar the owners must see (ADR-0013). Instead, the content lands on a proper design system with foam-led messaging.

## Reproduce-then-refine workflow

1. Build a **design system / layout shell** (tokens, typography, components, header/nav/footer, responsive) — the foundation everything renders into.
2. **Migrate content + assets** from the live WordPress into the real marketing pages (Inicio, Nosotros, Servicios, Productos, Contacto).
3. Deploy to the noindex/auth-walled preview so the user can **see a decent reproduction** and start fine-tuning.
4. Iterate design against the real thing — much easier than designing in the abstract.

## Why this sequencing (before the catalogue)

- It produces the viewable baseline the user needs to give design feedback.
- The catalogue (#7), Client Area, and admin all render *into* this design system — building it first makes them faster and visually consistent.

## Consequences

- New work items: a design-system/shell issue and a content+asset migration issue (created alongside this ADR). The foam-led homepage (#10) builds on the design system.
- The current site's logo and brand colours are extracted as the *starting point* for the design system; they are then refined, not treated as fixed.
- "Better than the existing site" is the explicit minimum bar for the baseline; it is a floor, not the ceiling.
