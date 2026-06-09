# Working in this repo

This is the **Ditex Mallorca** website rebuild. Before writing code, read:

- **[PLAN.md](./PLAN.md)** — the whole plan on one page.
- **[CONTEXT.md](./CONTEXT.md)** — the domain glossary. Use this vocabulary in code (Foam cutting, Client, Catalogue, Price List, Connector, Mallorca/Men-Ibz pricing).
- **[docs/adr/](./docs/adr/)** — why every decision was made. Respect the ADRs in the area you touch.

Work is tracked as GitHub issues (vertical slices). Staging is **noindex** until a single big-bang cutover (ADR-0005, ADR-0013) — never relax `app/robots.ts` or the layout `robots` metadata unless that is the explicit task.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
