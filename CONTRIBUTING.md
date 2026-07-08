# Contributing

Read [AGENTS.md](./AGENTS.md) first — it covers the domain language ([CONTEXT.md](./CONTEXT.md)), the decision log ([docs/adr/](./docs/adr/)), the i18n rules, and the "this is not the Next.js you know" warning (read `node_modules/next/dist/docs/` before writing Next 16 code).

## Local checks

Every PR is gated by CI (`.github/workflows/ci.yml`) on Node 22. Run the same checks locally before pushing:

```bash
npm run lint       # eslint
npm test           # vitest run — the unit tests below
npm run build      # next build (no DATABASE_URL needed; the db client is lazy)
npm run typecheck  # tsc --noEmit
```

`npm run test:watch` re-runs tests on change while you work.

## Testing approach — targeted and logic-first

We test **the logic worth protecting, not coverage for its own sake**. Vitest runs pure functions in a plain Node environment (no jsdom/React until a component genuinely needs it).

**What we test:**

- **Pricing** (`lib/price.ts`) — the 2-decimal EUR formatting and the Postgres-`numeric`→JS-number trailing-zero trap, plus admin input parsing (comma/dot separator, blank → CONSULTA).
- **Locale precedence** (`lib/i18n.ts`) — cookie > Accept-Language > default `es`, and the SEO guardrail that already-prefixed URLs are never redirected (issue #47).
- As they land, the **A3 import mapping** (#5) and the **cut-request** logic (#42) are prime targets — add tests for those via the `/tdd` flow.

**What we don't test:** presentational components, styling, and thin DB/UI glue. When a decision rule lives inside a component or a Server Action, extract it into a pure function in `lib/` and test that (as done for locale precedence and pricing) — tests should exercise behaviour through public interfaces and survive refactors.

Test files are colocated as `*.test.ts` next to the code they cover.
