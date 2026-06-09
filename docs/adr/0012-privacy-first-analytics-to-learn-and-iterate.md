# Privacy-first analytics, used to learn and iterate

Decisions about Client behaviour (search vs browse vs PDF — ADR-0011) and content performance (ADR-0010) should be driven by real data, not assumptions. We instrument the site from launch and iterate on what we observe.

## Decision

- Use **cookieless, privacy-first analytics** (e.g. Plausible or self-hosted Umami, or Vercel Web Analytics) rather than Google Analytics.
- Track the questions that actually matter: how Clients find prices (search / browse / PDF download), which products and content pages draw traffic, which search terms and segments convert to enquiries, and Core Web Vitals.

## Why cookieless

- The Clients are EU; the old site carried a heavy cookie-consent banner. Cookieless analytics needs **no consent banner**, which keeps the UI clean and frictionless for non-technical users (ADR-0001) and simplifies GDPR.
- We need *aggregate behaviour*, not per-person surveillance — privacy-first tools give exactly that.

## Consequences

- Roadmap decisions (e.g. retire the PDF bridge, double down on a content theme, reorder navigation) are made from observed behaviour.
- Analytics is a launch requirement, not a later add-on — the learning loop only works if we measure from day one.
- Keeps the project on free tiers (these tools have free/self-hosted options).
