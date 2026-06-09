# Big-bang launch: no public MVP; go live only when the full product is complete

The site goes public in a single cutover only once the full scope — public foam-led site, Client Area, A3 Connector, and order-status self-service — is built, polished, and signed off. There is no phased public release / MVP; clients first see the new site as a complete, impressive product.

## Reasoning

- Consistent with "no rush, quality over speed" (ADR-0002) and "don't replace the live site until complete" (ADR-0005).
- **Decisive reason (business/political, not technical):** the owners (the user's in-laws) have *not* asked for a new website. The user will only present this once it adds *a lot* of value over the existing site — a like-for-like reskin would read as low value and undercut his credibility as he moves into an IT role in the family business. He develops privately, with his partner's domain knowledge, until the value is undeniable. A soft launch of a marketing-equivalent site would defeat this purpose. This outweighs the SEO-timing argument below.

## Accepted consequences (flagged, eyes open)

- **Launch is gated on A3.** Because A3 integration is in launch scope, the public go-live cannot happen until the Connector works — the least-controllable, highest-unknown piece (ADR-0003/0006). The PDF-seed (ADR-0006) still de-risks *building* the catalogue, but no longer de-risks *launch timing*.
- **SEO compounding is deferred.** SEO/GEO authority builds over time; delaying launch delays the ranking clock and lets the rogue `.com` keep winning in the meantime — a real cost against the #1 goal (ADR-0002/0008).

## Rejected alternative

- **Soft launch in two waves** — ship the public foam site + Client Area first (start the SEO clock, kill the manual-PDF pain, end the `.com` confusion), then add A3 + self-service in production. **Firmly rejected:** the business/political reason above (present only when value is undeniable) is load-bearing and does not change with A3 timelines. Kept on record only so the trade-off (deferred SEO compounding) is understood, not as a live option.

## Note

Items that inherently require production data are **not** launch gates and move to a post-launch backlog: analytics-driven tuning, retiring the PDF bridge (ADR-0011/0012), online checkout, German market, and the `.com` → canonical flip once recovered (ADR-0004).
