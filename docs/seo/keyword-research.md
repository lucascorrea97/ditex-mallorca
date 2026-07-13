# SEO/GEO keyword + market research — foam/upholstery, Balearics

**Issue:** #49 · **Status:** Research deliverable, no site code changed · **Feeds:** #9 (metadata),
#10 (homepage copy), #11 (content guides), #32 (copywriting)

> The issue body asked for this at `docs/marketing/seo-research.md`; the task that produced
> this document specified `docs/seo/keyword-research.md` instead. Same deliverable, different
> path — flagging in case anything else links to the old path.

## Method and caveats

This is agent-doable market research done via web search (no Search Console / Ahrefs / SEMrush
access), grounded in the project's own ADRs and domain glossary (CONTEXT.md). **Every volume
figure in this document is a relevance/intent estimate, not a measured number** — marked
"est." throughout. Where a real number exists (e.g. a stat from `docs/business/`), it's cited
as such. Rank keywords by **relevance to the ADR-0008 foam-led wedge and by buyer intent**, not
by guessed traffic. Sources are cited inline; all research was done in July 2026.

---

## 1. Keyword map (ES / CA / EN), by trade segment and intent

Three intent types recur in every cluster below:
- **Transactional (T)** — ready to buy/contact ("comprar", "proveedor", "presupuesto")
- **Informational (I)** — researching before buying (density guides, "how to choose")
- **Navigational (N)** — looking for a specific brand (Ditex, or a named competitor)

### 1.1 Foam — the moat (ADR-0008). Own this cluster first.

| Priority | ES | CA | EN | Intent | Segment |
|---|---|---|---|---|---|
| ★★★ | espuma a medida Mallorca | escuma a mida Mallorca | custom foam cutting Mallorca | T | Local trade |
| ★★★ | corte de espuma a medida | tall d'escuma a mida | foam cut to size Mallorca | T | Local trade |
| ★★★ | gomaespuma Mallorca / gomaespuma Palma | escuma de goma Mallorca | foam rubber Mallorca | T | Local trade |
| ★★★ | densidades de espuma para tapicería | densitats d'escuma per a tapisseria | upholstery foam density guide | I | Local trade |
| ★★★ | espuma viscoelástica tapicería | escuma viscoelàstica | viscoelastic memory foam upholstery | I | Local trade |
| ★★☆ | espuma alta densidad sofá | escuma d'alta densitat | high-density foam sofa | I | Local trade |
| ★★☆ | espuma para cojines a medida | escuma per a coixins a mida | custom cushion foam | I/T | Local trade + Marine |
| ★★☆ | tipos de espuma para tapizar | tipus d'escuma per tapissar | types of upholstery foam | I | Local trade |

**Uniquely-ownable, low/no local competition found (flag for ADR-0008 marquee positioning):**

| Priority | ES | Why it's ownable |
|---|---|---|
| ★★★★ | **corte de espuma a volumen (m³)** / espuma a granel Mallorca | No Balearic competitor found claims volumetric (m³) cutting. Gomex (the one other Palma foam retailer found) is explicitly retail/DIY, "sin cantidad mínima," with only a passing "volume discount for professionals" line — not a wholesale/volumetric claim ([gomex.es/espuma](https://gomex.es/espuma/)). |
| ★★★★ | **espuma al por mayor Mallorca** / proveedor de espuma para tapiceros | Nobody local positions as trade-wholesale-only. Peninsular players (ALLFIBRE, Madrid) do serve wholesale at scale but aren't geo-relevant to Balearic searches ([allfibre.com](https://www.allfibre.com/)). |
| ★★★ | espuma industrial Mallorca | Same gap — "industrial/volumen" framing is absent locally. |
| ★★★ | proveedor de espuma para otros cortadores / quién corta espuma en Mallorca a otros negocios | The literal "even competitors buy their foam from us" trust signal (ADR-0008) has **no equivalent claim found anywhere** in the competitive set researched. This is the single highest-leverage line in the whole keyword map — see §5, it needs an explicit business sign-off on wording before publishing. |

### 1.2 Fabrics / polipiel / PVC — the one-stop range around the foam core

| Priority | ES | CA | EN | Intent |
|---|---|---|---|---|
| ★★☆ | telas para tapicería Mallorca | teles per a tapisseria Mallorca | upholstery fabric supplier Mallorca | T |
| ★★☆ | tela tapicería por metro / metraje | tela per metres | fabric by the metre upholstery | T |
| ★★☆ | polipiel para tapizar | pell sintètica per tapissar | faux leather upholstery fabric | T |
| ★★☆ | PVC para tapizar / skay para tapizar | PVC per tapissar | PVC upholstery fabric | T |
| ★★☆ | distribuidor telas tapicería Baleares | distribuïdor teles Balears | upholstery fabric distributor Balearics | N/T |
| ★☆☆ | proveedor accesorios tapicería (cremalleras, hilos, grapas) | proveïdor accessoris tapisseria | upholstery accessories supplier (zippers, thread, staples) | T |
| ★☆☆ | comprar tela al por mayor tapicero | comprar tela a l'engròs tapisser | wholesale upholstery fabric Spain | T |

These are real, competitive keywords ([Texlimca](https://texlimca.com/blog/rollo-de-telas-al-por-mayor-espana), [Telas del Pozo Hogar](https://www.telasdelpozohogar.com/proveedor-telas-por-mayor/), [Alberto Ferre](https://www.albertoferre.com/en/2025/10/13/las-5-mejores-telas-para-tapiceria/) all rank nationally for fabric-wholesale terms) — Ditex's edge here isn't the fabric itself (peninsular wholesalers are bigger), it's **local + foam-bundled + inter-island delivery** (CONTEXT.md: Inter-island shipping rule already ships this).

### 1.3 Marine / nautical — the growth wedge (CONTEXT.md: Trade segments #2)

| Priority | ES | EN | Intent |
|---|---|---|---|
| ★★★ | espuma para cojines de barco | boat cushion foam / marine foam | I/T |
| ★★★ | espuma náutica hidrófuga | marine-grade foam Mallorca | I/T |
| ★★☆ | polipiel náutico Mallorca | marine vinyl supplier Mallorca | T |
| ★★☆ | PVC náutico / tela náutica resistente | marine upholstery fabric supplier Mallorca | T |
| ★★☆ | tapicería náutica Mallorca telas (supply angle, not service) | yacht upholstery fabric supplier Mallorca | N/T |
| ★☆☆ | — | wholesale marine foam Balearics | T |

**Important nuance for this cluster**: most companies ranking here (Universal Nautic, Fiaka
Ambient, Heavy Seas, Tapicería Delfín, Super Yacht Designs, Dream Boats Interiors, Marine
Project) are **upholstery service/fitting businesses**, not material suppliers — see §3. Ditex's
angle is the material/foam **behind** those businesses, not competing with their fitting
service. National players like [Nauticol.es](https://nauticol.es/60-tapiceria-nautica) already
rank for generic "polipiel náutico" — Ditex's wedge is Mallorca-local + fast (no mainland
shipping wait) + foam-bundled.

### 1.4 Contract / hospitality (CONTEXT.md: Trade segments #3)

| Priority | ES | EN | Intent |
|---|---|---|---|
| ★★☆ | telas ignífugas hostelería Mallorca | fire-retardant fabric hotels Balearics | T |
| ★★☆ | textil contract hoteles Baleares | contract fabric supplier Mallorca | T |
| ★☆☆ | tapicería para hoteles Mallorca | — | T |
| ★☆☆ | proveedor textil hostelería Mallorca | — | N/T |

Real local players exist here (Sutexho, Bartolomé Adrover — both Balearic, see §3) and
peninsular contract specialists (Fresmarvi, Avdelaura, Gabana Fabrics) rank nationally. Lowest
priority of the three segments per CONTEXT.md's own ordering — treat as a later content wave.

### 1.5 Local modifiers (stack onto every cluster above)

`Mallorca` · `Palma` · `Baleares` / `Illes Balears` · `Menorca` · `Ibiza` / `Eivissa` ·
`Can Valero` (Ditex's own industrial estate — genuinely hyperlocal, near-zero competition) ·
`islas` (for the inter-island shipping-rule content already live on the site).

---

## 2. GEO / LLM-answer angle — question set for #11 guide topics

These are the real-world phrasings buyers use (drawn from the "People Also Ask"-style patterns
surfaced during search, plus domain reasoning from CONTEXT.md/ADR-0008). Each maps to a guide
candidate in §4.

1. ¿Qué densidad de espuma necesito para un sofá de uso diario? → Guide 1
2. ¿Cuál es la diferencia entre espuma HR y espuma viscoelástica? → Guide 1
3. ¿Qué densidad de espuma es mejor para cojines de barco o exterior? → Guide 2
4. What foam density is best for marine/boat cushions? → Guide 2
5. ¿Dónde puedo cortar espuma a medida en Mallorca? → Guide 1 / homepage (#10)
6. ¿Cuánto cuesta cortar espuma a medida? (no price promise — route to Request/#21) → Guide 1 FAQ
7. ¿Quién vende espuma al por mayor en Mallorca para tapiceros? → Guide 3
8. Is there a foam supplier in Mallorca that other foam cutters buy from? → Guide 3 (the marquee claim)
9. Where can I get foam cut to volume (m³) in Mallorca? → Guide 3
10. ¿Qué tela usar para tapizar cojines de un barco? → Guide 4
11. ¿Dónde comprar polipiel náutico en Mallorca? → Guide 4
12. What marine vinyl/fabric resists UV and salt water? → Guide 4
13. ¿Qué proveedor de telas ignífugas/contract hay en Mallorca para hoteles? → Guide 5
14. ¿Puedo llevar mi propio patrón/plantilla para el corte de espuma? → Guide 1 FAQ
15. ¿Qué grosor de espuma necesito para un cabecero o respaldo? → Guide 1
16. ¿Hay envío de material de tapicería a Menorca e Ibiza? → existing shippingRuleNote copy (#62/#70/#73) — reuse, don't re-derive
17. ¿Qué significa "precio a consultar" en espuma? → short FAQ tied to the existing foam-price-hidden UX (`lib/prices.ts`)
18. Quina escuma és millor per a un sofà de tapisseria a Mallorca? (CA parity of Q1)
19. ¿Cuáles son las mejores telas de exterior resistentes al sol y al agua? → Guide 4 (crossover with terrace/outdoor, not just marine)
20. ¿Qué es la densidad de espuma en kg/m³ y cómo se mide? → Guide 1, foundational definition (good for a featured-snippet-style FAQ block + FAQPage structured data)

Structured-data note (ties to ADR-0002/ADR-0010): each guide should carry `FAQPage` /
`HowTo`-style JSON-LD for its 2-4 most concrete Q&As — LLMs and Google both favour specific,
well-structured answers over prose, which is exactly the "AI-drafted from real expertise"
model ADR-0010 already commits to.

---

## 3. Competitor landscape

### 3.1 The rogue `.com` — not a normal competitor, flag this first

**`ditexmallorca.com` is live and indexed**, and it isn't a squatter with unrelated content —
it presents itself **as Ditex itself**: same trade name "D.TEX Mallorca," same address
(`C/ Quatre de Novembre, 4`), a contact email `pedidos@ditexmallorca.com`, a phone number
(`+34 971 25 41 27`), and near-identical boilerplate ("Excelencia y calidad en el servicio,"
"soluciones textiles innovadoras... desde 2010") to what's currently live on the real
`ditexmallorca.es`. Both domains right now show generic, non-keyword-targeted copy — neither
is foam-led (ADR-0008), so the new site's content strategy alone should out-rank both once
live, per ADR-0004's "out-SEO it meanwhile" plan.

**Two things worth flagging to the business directly** (see §5 — this may deserve its own
urgent issue, not just a line item):
- Both sites currently disagree on how long the business has existed — "since 2010" vs
  "over 30 years" appear together on the same page. Worth a real number for GEO citability
  (LLMs favour specific, verifiable facts).
- If `pedidos@ditexmallorca.com` / `+34 971 25 41 27` are live and monitored by the third
  party holding the domain (ADR-0004), **real customer enquiries may currently be reaching
  someone other than Ditex.** This is worth confirming urgently, independent of the SEO
  timeline.

### 3.2 Balearic general fabric/upholstery shops (local trade segment)

| Competitor | Positioning | Foam/volume claim? | Source |
|---|---|---|---|
| Don Telas (Palma) | Curtains + general decor fabrics, branded lines (Aquaclean, KA Intl, Agora, Acrisol) | Mentions custom foam cutting, no density/volume claim | [dontelas.es](https://dontelas.es/) |
| Interlar Decoración (Palma, est. 1993) | Home textiles + interior design + upholstery service | No | [interlardecoracion.com](https://www.interlardecoracion.com/) |
| La Filadora (Palma, est. 1918) | Century-old fabric shop + foam cuts + in-house sewing/upholstery workshop | Foam cuts mentioned, retail-scale | [facebook.com/lafiladorapalma](https://www.facebook.com/lafiladorapalma/), [Última Hora profile](https://www.ultimahora.es/noticias/local/2018/08/31/1022443/victoria-sanchez-filadora-ahora-esta-volviendo-valorar-producto-local-tradicional.html) |
| Textiles Tomeu (Palma) | General fabric shop, SATTLER-brand outdoor fabrics | No | [Páginas Amarillas listing](https://www.paginasamarillas.es/f/palma/textiles-tomeu_153173786_000000001.html) |

None of these four are positioned as **B2B trade-wholesale first** the way Ditex is — they read
retail/interiors-facing (curtains, home decor, walk-in). That's a genuine gap: none of them
target "tapicero profesional" or "mayorista" language head-on.

### 3.3 Foam-specific competitor

**Gomex** (Palma, since 1955) is the only other dedicated foam retailer found in Mallorca.
Explicitly retail/DIY: "sin cantidad mínima," 7 densities, precision cutting, but the page
targets sofa owners, DIY/costume makers and small renovations — "descuentos por volumen para
profesionales" is a minor mention, not a positioning. **No m³/volumetric claim, no
wholesale-to-other-cutters claim.** ([gomex.es/espuma](https://gomex.es/espuma/)) — this is the
clearest direct evidence that ADR-0008's wedge is real and currently unclaimed locally.

### 3.4 Peninsular foam wholesalers (rank nationally, not Balearic-local)

ALLFIBRE (Madrid, 2,200 m² facility, widest density range claimed in Spain — [allfibre.com](https://www.allfibre.com/)),
El Taller de la Espuma, Espuma a Medida, Hiperespuma, Alcalá Espuma, Textilcort — all rank for
generic "espuma a medida" / density-guide content nationally. They will outrank Ditex on
un-geo-modified queries; Ditex should not try to compete head-on there and should instead lean
hard on `Mallorca`/`Baleares`/`Can Valero` modifiers plus same-day/local delivery, where none of
these peninsular players can compete (shipping to islands is slow/costly for them).

### 3.5 Marine upholstery service businesses (Mallorca) — potential B2B customers, not just competitors

Universal Nautic, Yacht Fabric Mallorca, Fiaka Ambient (3,000 m² factory), Heavy Seas, Tapicería
Delfín, Super Yacht Designs, Dream Boats Interiors, Marine Project — all Palma-based marine
upholstery **fitters/fabricators**, not material distributors. [Nauticol.es](https://nauticol.es/)
is the one peninsular *material* supplier found ranking for "polipiel náutico." **Read this
cluster two ways**: (a) SEO competitors for material-supply search terms if a boat owner
searches directly, and (b) a wholesale sales channel — these fitters need foam/polipiel/PVC from
somewhere, and Ditex's guide content (§4, Guide 4) can be written to speak to them as much as to
end boat owners.

### 3.6 Contract/hospitality

Balearic-local: **Sutexho** and **Bartolomé Adrover** (both Palma-based hospitality textile
wholesalers, per [Proveedores.com's Balearics listing](https://www.proveedores.com/textil-para-hosteleria/islas-baleares)).
Peninsular, ranking nationally: Fresmarvi, Avdelaura, Gabana Fabrics, Lyba Textiles. Lower
priority per CONTEXT.md's own segment ordering — worth a page, not a launch-blocking one.

### 3.7 Marketplaces / low-relevance long tail

Amazon (foam boat-cushion products, US-centric results even in `.es` search), Milanuncios
(second-hand foam/mattresses) — low relevance, not worth targeting directly, but worth knowing
they absorb some "cojín espuma barco" long-tail traffic that guide content can still intercept
with better, local, expert answers.

---

## 4. Prioritised content plan — first 5 guides

Ordered by ADR-0008 foam-first priority, segment priority (CONTEXT.md), and keyword ownability
found above. Each feeds #11 (content engine) directly and should inform #10 (homepage) and #32
(copywriting) with the same target phrases.

| # | Guide (working ES title) | Segment | Primary keywords targeted | Why first |
|---|---|---|---|---|
| 1 | **Densidades de espuma para tapicería: guía completa** | Local trade (core) | densidad espuma sofá, espuma viscoelástica tapicería, tipos de espuma para tapizar, espuma alta densidad | Highest-relevance foam cluster, broadest segment reach, proven demand (multiple peninsular competitors already rank here — Ditex needs a stronger, more technical version to compete, not to create demand from scratch) |
| 2 | **Espuma náutica: qué densidad usar para cojines de barco** | Marine (growth wedge) | espuma para cojines de barco, espuma náutica hidrófuga, marine foam Mallorca, boat cushion foam | No Balearic-local competitor addresses this; EN version pulls the international marine buyer directly (ADR-0009's reason for shipping English at all) |
| 3 | **Corte de espuma a volumen (m³) en Mallorca — para tapiceros y otros cortadores** | Local trade + trust/authority | corte de espuma a volumen, espuma al por mayor Mallorca, proveedor de espuma para tapiceros | The single most ownable claim found in this whole research (§1.1, §3.3) — this is the ADR-0008 marquee page. **Needs business sign-off on exact wording before drafting** (§5) |
| 4 | **Polipiel y PVC náutico: materiales para tapicería de barcos** | Marine | polipiel náutico Mallorca, PVC náutico, marine vinyl supplier Mallorca | Positions Ditex as the material supplier *behind* the marine fitters found in §3.5 — B2B angle |
| 5 | **Telas contract e ignífugas para hoteles y restaurantes en Mallorca** | Contract/hospitality | telas ignífugas hostelería Mallorca, textil contract hoteles Baleares | Lowest segment priority per CONTEXT.md, but real local demand exists (Sutexho, Bartolomé Adrover already serve it) — good fourth/fifth guide once the foam/marine wave lands |

**Sequencing note**: Guides 1 and 3 should probably ship together or in quick succession —
Guide 1 earns the informational traffic, Guide 3 converts it with the trust claim and points at
the Catalogue/Request flow (#21). Guide 3 is blocked on §5's messaging sign-off; 1, 2, and 4 are
not.

**Homepage (#10) implication**: the ADR-0008 "even the competition buys their foam from us"
line has zero competitive claim to counter it anywhere in the researched set (§3) — it should
be the single strongest line on the homepage, once worded and approved (§5).

---

## 5. Needs-the-business list (short messaging brief → should become an owner issue)

Keep this concrete enough to hand to the owner/partner as a checklist, per how this project
tracks owner actions (a fully-described issue, not a chat aside).

1. **Exact wording sign-off for the "competitors buy our cut foam" claim** (ADR-0008's marquee
   trust signal, and Guide 3 in §4). How explicit can the site be — name the fact that other
   local foam-cutters resell Ditex's cut foam, without naming them? Confirm the business is
   comfortable with this being a headline claim, not a quiet aside.
2. **A real "years in business" number.** Both live domains currently show a contradiction
   ("since 2010" vs "over 30 years" — §3.1). GEO/LLM citations favour specific, verifiable
   facts; pick one number and confirm it.
3. **Client-facing words for "wholesale/trade."** Is `mayorista`, `al por mayor`,
   `profesional`, or something else the term staff actually use with Clients? CONTEXT.md
   already fixes "Client" over "customer" — this brief needs the equivalent for the
   wholesale/volume framing (§1.1, §4 Guide 3).
4. **Tone check for CA and marine-EN copy.** Formal `usted` or the trade-familiar `tú`/`vosaltres`
   register the business actually uses on calls? Any Mallorquí-specific wording preferences
   over standard Catalan?
5. **Confirm which contact details are current and correct** — independent of the domain
   recovery timeline (ADR-0004), verify the phone/email the rogue `.com` currently displays
   (`pedidos@ditexmallorca.com`, `+34 971 25 41 27`) aren't actively diverting real enquiries
   (§3.1). This may warrant its own urgent issue rather than waiting on #49/#32.
6. **Real photos/case studies for the marine and contract/hospitality guides** (Guides 2, 4, 5)
   — a named yacht refit or hotel project (with permission) makes the content far more
   GEO-citable than generic stock claims, per ADR-0010's "specific, expert content gets cited"
   principle.
7. **Any density/technical claims the business wants double-checked** before Guide 1 and Guide 2
   publish — ADR-0010 requires human accuracy review on foam/density facts specifically.

---

## Summary for #49

**Top 10 priority keywords** (see §1 for full map): corte de espuma a volumen (m³) · espuma al
por mayor Mallorca · espuma a medida Mallorca · densidades de espuma para tapicería · espuma
viscoelástica tapicería · espuma para cojines de barco / marine foam Mallorca · polipiel náutico
Mallorca · telas para tapicería Mallorca · gomaespuma Mallorca · proveedor de espuma para
tapiceros.

**Proposed first 5 guides** (see §4): (1) Densidades de espuma para tapicería — guía completa,
(2) Espuma náutica — densidad para cojines de barco, (3) Corte de espuma a volumen (m³) en
Mallorca, (4) Polipiel y PVC náutico para tapicería de barcos, (5) Telas contract e ignífugas
para hoteles en Mallorca.
