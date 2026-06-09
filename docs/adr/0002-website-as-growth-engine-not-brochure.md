# The website is a growth engine, not a brochure

There is no deadline pressure to launch. Given that, the site's primary job is **acquisition and retention** — generate leads, win new Clients (younger trade businesses, contract/hospitality buyers), sell more, and keep existing Clients — not merely to present the company. We optimise for long-term outcome over speed-to-launch.

Concretely this means three pillars carry equal weight:

1. **Best-in-class SEO and LLM/GEO ("generative engine") visibility** — the site should be the answer when someone searches *or asks an AI* about upholstery materials, foam, marine textiles, etc. in Mallorca/Baleares. Content (including a blog if that's what it takes), structured data, performance, and crawlability are first-class concerns, not afterthoughts.
2. **A working Client Area at launch** — non-negotiable. The live Price List must be solid on day one (see [CONTEXT.md](../../CONTEXT.md), ADR-0001).
3. **Self-service that removes phone/office load** — move things currently done only in person or by phone (order status, reordering, enquiries) onto the site so Clients stop calling to ask.

## Considered Options

- **Ship fast, iterate later** — rejected: no launch pressure exists, and a rushed brochure wouldn't move the growth needle.
- **Growth-engine, quality-first** (chosen) — invest in doing it properly because the payoff is leads and retention, not a checkbox.

## Consequences

- Architecture must favour SEO/GEO from the ground up: server-rendered, crawlable content; rich structured data (Product, LocalBusiness, etc.); fast Core Web Vitals; clean canonical URLs (also our weapon against the rogue `.com` — see future ADR).
- "Done" is judged by acquisition/retention outcomes, not just feature completeness.
- Self-service ordering/status is in scope to evaluate, gated by what A3 can expose and what the business is willing to operate.
