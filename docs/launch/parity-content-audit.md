# Content-parity audit — the static pages

**Issue:** #86 · **Status:** audit complete; straightforward gaps filled in the same PR ·
**Relates to:** ADR-0014 (content parity: reproduce, then refine), ADR-0021 (M0 parity-first
demo), ADR-0008 (foam-led positioning), #76 (owner sign-offs), #83 (parity flag)

> Goal (ADR-0021): the M0 demo should read as **"the same site, better"** — nothing the family
> currently shows the world may quietly go missing. This document is the page-by-page evidence
> that it doesn't, plus the list of things that are deliberately different and the ones only
> the business can settle.

## Method

Fetched the five live pages named in #86 directly from `https://ditexmallorca.es` on
**2026-09-01**, stripped scripts/styles and extracted the visible text and heading structure,
then compared each against our built page and its `messages/*.json` entries.

| Page | Live URL crawled | Our equivalent |
|---|---|---|
| Inicio | `/` | `/[lang]` |
| Nosotros | `/mas-de-30-anos-al-sector-textil/` | `/[lang]/nosotros` |
| Servicios | `/materiales-textiles/` | `/[lang]/servicios` |
| Productos | `/productos/` | `/[lang]/productos` |
| Contacto | `/contacto-2/` | `/[lang]/contacto` |

URLs come from the crawl already recorded in [`301-map.md`](./301-map.md) (the canonical slugs,
not the orphan duplicates). All five returned 200.

## Summary

| Page | Verdict | Gaps found | Action |
|---|---|---|---|
| Inicio | **Was thinner than the live home** | Contact details absent; no "why us" section | **Filled** |
| Nosotros | Richer, one section missing | No mission statement | **Filled** |
| Servicios | Richer than live | — | None needed |
| Productos | Richer than live | Catalan word in Spanish copy | **Fixed** |
| Contacto | Matches, one block missing | Social links only in footer | **Filled** |

Three items are **business-dependent and deliberately not resolved here** — see
[Routed to #76](#routed-to-76).

---

## Inicio

### What the live home carries

Hero (`Excelencia y calidad en el servicio` / *"Ofreciendo soluciones textiles innovadoras y de
alta calidad desde 2010"*), phone and email in the hero, a "Calidad en el servicio" blurb, an
animated **"Años de experiencia" counter**, "Quiénes somos" (two paragraphs), six service-quality
bullets, a "Qué Ofrecemos" services teaser, a **"Nuestros clientes"** logo wall, the five product
categories, a **"Por qué elegirnos"** trio, and a full contact block (address, email, phone,
hours) with social links and a contact form.

### What we carried

Hero (foam-led), the foam-moat trust line, the "Una gama completa" chip row, and the three
sector cards. Four sections against the live page's nine.

### Gaps and what happened

| Gap | Assessment | Action |
|---|---|---|
| **No contact details anywhere on the home page** | Real regression. The live home puts the phone and email in the hero and repeats the full block lower down. A visitor landing on our home had to navigate away to find a phone number — worse than what exists today. | **Filled.** New "Dónde estamos" section rendering address, phone, email and hours from `lib/site.ts` (`business`), labelled from the existing `contacto` dictionary keys rather than duplicating four label strings per locale. |
| **No "Por qué elegirnos" section** | Real gap — the live home has one. | **Filled.** Three reasons sourced from claims this site *already* makes (the ADR-0008 foam moat, the one-stop range, daily island delivery) rather than copied from the live page, whose version leans on the disputed years figure. #32 may rewrite the wording; the section is what closes the gap. |
| "Nuestros clientes" logo wall | Needs real client logos and permission to use them. | **Not filled** — needs the business. See [#76](#routed-to-76). |
| Six service-quality bullets | Already covered on our Nosotros page (`reasons`), which the live site also duplicates across Inicio and Nosotros. | No action. |
| "Años de experiencia" counter | The number itself is disputed. | See [#76](#routed-to-76). |
| Contact form | Ours exists on `/contacto` with a "próximamente" note, matching the live form's placement. The live home also embeds one. | No action — one form on the contact page is the better pattern, not a parity loss. |

## Nosotros

### What the live page carries

"Quiénes somos" (two paragraphs), the experience counter, the six bullets, an explicit
**"Misión"** section, four company values (Profesionalismo, Confianza, Progreso y aprendizaje,
Compromiso), and the "Por qué elegirnos" trio.

### Comparison

Ours is materially richer: a three-paragraph story, two stat blocks, the same four values, five
"why work with us" reasons, a team section and a location line.

| Gap | Action |
|---|---|
| **No mission statement** — the live site gives it a whole section | **Filled.** `missionHeading` + `missionBody`, condensed from the business's own published wording. No new claims introduced. |
| The years figure | See [#76](#routed-to-76) — this page is where the contradiction is most visible. |

## Servicios

The live page carries an intro plus four services: Telas, Espumas, Accesorios y suministros,
Servicio de reparto.

Ours carries all four (Polipieles and PVC are merged into one entry, and the live Servicios page
does not cover them separately either) **plus** a dedicated "Servicio estrella" treatment of
made-to-measure foam cutting — the ADR-0008 positioning the live site buries.

**No content gaps.** One flag only: the lead sentence repeats the disputed "más de 30 años"
figure — see [#76](#routed-to-76).

## Productos

The live page carries five categories with a paragraph each — Telas, Polipieles, PVC, Accesorios,
Espumas — and a closing commitment line.

Ours carries **six** (the five plus "Fibras y rellenos"), each with a longer description *and* a
four-point highlight list, plus the Client Area cross-link. Every live category description's
substance is present in ours, including the details easy to lose: metraje-vs-pieza selling, PVC's
water/mould/UV resistance, and the nautical fittings (rieles, sistemas de sujeción) named in the
live Accesorios text.

| Finding | Action |
|---|---|
| **Bug:** the Spanish PVC description read *"exteriores y **entorns** húmedos"* — `entorns` is Catalan, leaked into `es.json` | **Fixed** → `entornos`. A scan for other cross-locale leaks in all three dictionaries came back clean. |
| The live closing commitment line | No action — ours ends with the Client Area CTA, which is more useful than a generic sign-off. |

## Contacto

Contact details verified against the live site **and** `lib/site.ts`:

| Detail | Live site | `lib/site.ts` | Our page | Match |
|---|---|---|---|---|
| Address | C/ 4 de Noviembre Nº4, Polígono Industrial Can Valero, 07014 Palma de Mallorca | same | renders from `business.address` | ✅ |
| Phone | 971254127 / +34 971 25 41 27 | `+34 971 25 41 27` | renders from `business.phone` | ✅ |
| Email | pedidos@ditexmallorca.com | `pedidos@ditexmallorca.com` | renders from `business.email` | ✅ |
| Hours | Lun - Vier: 7:00 a 14:00h | `07:00`–`14:00`, Mo–Fr | `Lun – Vie: 7:00 a 14:00h` | ✅ |
| Privacy notice under the form | RIBOT FUSTER, S.L. (D.TEX MALLORCA) responsable notice | — | present, same substance | ✅ |

> **Note for the record:** the legal pages (#79) use a *different* pair —
> `administracion@ditexmallorca.com` and `+34 971 25 44 63`. Both pairs are real; the marketing
> pages use the orders contact and the legal pages the administrative one. That is a reasonable
> split, but it is worth the business confirming it is intentional rather than drift.

| Gap | Action |
|---|---|
| **Social links** — the live contact page has a "Nuestras redes sociales" block; ours only linked them from the global footer | **Filled.** New `socialHeading` key + Instagram/LinkedIn rendered from `business.social`. |

---

## Routed to #76

Per #86, real business claims go on the owner brief rather than into copy. Three items:

### 1. The years figure — three contradictory numbers, and we already ship one of them

This is the important one. **The live site contradicts itself on the same page:**

- its About page slug is literally `/mas-de-30-anos-al-sector-textil/`
- body copy: *"Llevamos **más de 30 años** al sector textil"*
- the paragraph immediately above it: *"desde nuestro comienzo en **2010**"*
- the animated counter on that same page is configured `data-to-value="10"` → renders **"10+"**

Three different numbers — 30, 15-ish (2010), and 10 — visible simultaneously.

**Our build inherited the contradiction rather than resolving it.** It currently appears in:

| Location | Value | Locales |
|---|---|---|
| `nosotros.stat1Value` | `+30` | es, ca, en |
| `nosotros.stat2Label` | "Más de 15 años sirviendo al sector" | es, ca, en |
| `nosotros.reasons[4]` | "Más de 30 años de experiencia sectorial acumulada" | es, ca, en |
| `servicios.lead` | "Llevamos más de 30 años de experiencia" | es, ca, en |
| `nosotros.storyP1` | "nació en 2010" | es, ca, en |
| `lib/site.ts` `foundingDate` | `2010` | — emitted in **LocalBusiness JSON-LD** |

So our Nosotros page displays "+30" and "2010 / more than 15 years" side by side, while the
structured data tells search engines `foundingDate: 2010`. Beyond looking careless, a visible
claim contradicting our own structured data is a GEO/SEO credibility problem exactly where
ADR-0002 wants us strongest.

**Not resolved here — this is #76 item 2.** Both readings are defensible ("the company was
founded in 2010" vs "the founders bring 30+ years of sector experience between them"), and the
fix depends on which is true. Once the business picks, the change is mechanical: the six
locations above, in three locales.

### 2. "Nuestros clientes" logo wall

The live home shows client logos. Reproducing it needs the actual logos and permission to
display them — a business decision plus an assets task (overlaps #36). Flagged, not built.

### 3. Two live claims deliberately not copied across

- **"Garantía de satisfacción del 100%"** — a warranty claim. Not copied into our copy without
  sign-off on what it actually commits the business to.
- **"Sistema de control de calidad"** — implies a formal quality-management system. Not copied
  without confirmation that one exists in a describable form.

Both currently sit in the live site's six-bullet list. Neither is in ours, and neither should be
until someone confirms them.

---

## Deliberate differences (upgrades, not regressions)

Recorded so a future reader doesn't "fix" them back:

- **The home page is foam-led** (#10, ADR-0008). The live home opens with the generic
  "Excelencia y calidad en el servicio"; ours opens with made-to-measure foam and the
  competitors-buy-from-us trust line. This is the single most deliberate departure in the
  rebuild — a positioning decision, not a parity gap.
- **Three locales.** The live site is Spanish-only; ca/en are net-new (ADR-0009).
- **A real catalogue.** `/catalogo` is DB-backed with per-product pricing behind the Client Area
  gate — nothing on the live site corresponds to it. Hidden in M0 by the #83 parity flag.
- **Accessibility page.** Was the last outstanding gap in `301-map.md`; closed by #85.
- **No cookie-consent banner.** The live site runs a Complianz banner; ours sets no
  consent-requiring cookies, which `/cookies` explains (#79). Fewer things on screen, on purpose.
- **Placeholder junk not reproduced.** The live footer still ships an unfinished widget reading
  *"Loren ipsum"*, *"000 000 000"*, *"email@email.com"*, and its copyright says "Ⓒ 2024". Ours
  does not, obviously.

## Changes made in this PR

| Change | Files | Locales |
|---|---|---|
| Home: contact details section | `app/[lang]/page.tsx`, `home.contactHeading`, `home.contactCta` | 3 |
| Home: "Por qué elegirnos" trio | `app/[lang]/page.tsx`, `home.whyHeading`, `home.why[]` | 3 |
| Nosotros: mission statement | `app/[lang]/nosotros/page.tsx`, `nosotros.missionHeading`, `nosotros.missionBody` | 3 |
| Contacto: social links block | `app/[lang]/contacto/page.tsx`, `contacto.socialHeading` | 3 |
| Fix `entorns` → `entornos` | `messages/es.json` | es |

All copy is dictionary-driven; no strings were hardcoded into TSX (AGENTS.md i18n rules). No
page in the parity nav is now thinner than its live equivalent.
