# Build the new site offline; keep the live WordPress untouched until cutover

The new site is built and completed in a separate environment. The existing `ditexmallorca.es` WordPress site — including its current Client Area and PDF Price List workflow — stays live and **unchanged** until the new site is fully complete, reviewed, and approved. Only then do we cut over.

## Why

- No deadline pressure (ADR-0002), so there is no reason to risk the running business on a half-finished site.
- The current Client Area is operationally relied upon (Clients are told prices live "on the website"); it must not break mid-build.

## How

- Develop on a non-public environment (preview/staging, or a `staging.`/`new.` host) that is **noindex + access-restricted** so Google never indexes it and it can't create duplicate-content competition with the live `.es` or the rogue `.com`.
- Keep a list of current WordPress URLs so we can 301-redirect them to the new structure at cutover (preserving SEO equity).
- **Cutover** is a deliberate switch (DNS / web root) done once the new site is signed off, with redirects in place and the live Client Area reachable from the first minute.

## Consequences

- We need a staging host and a rollback plan; cutover is a planned event, not a gradual replace.
- "Fully complete" is defined by ADR-0013: the cutover happens only when the full product (through A3 + order-status self-service) is done — a single big-bang launch, no public MVP.
- During the build, any urgent price changes still go through the old WordPress PDF flow — the new system does not become the source of truth until cutover.
- The old WordPress site should be archived (export) before decommissioning, not deleted outright.
