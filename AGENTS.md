# Working in this repo

This is the **Ditex Mallorca** website rebuild. Before writing code, read:

- **[PLAN.md](./PLAN.md)** — the whole plan on one page.
- **[CONTEXT.md](./CONTEXT.md)** — the domain glossary. Use this vocabulary in code (Foam cutting, Client, Catalogue, Price List, Connector, Mallorca/Men-Ibz pricing).
- **[docs/adr/](./docs/adr/)** — why every decision was made. Respect the ADRs in the area you touch.

Work is tracked as GitHub issues (vertical slices). Staging is **noindex** until a single big-bang cutover (ADR-0005, ADR-0013) — never relax `app/robots.ts` or the layout `robots` metadata unless that is the explicit task.

<!-- BEGIN:parallel-agent-rules -->
# You are not alone in this repo — isolate your work

This repo is built by **multiple agent sessions in parallel, one per issue**. Two sessions in the same checkout share one git HEAD/index, so they corrupt each other: transient build failures from another session's mid-edit, near-duplicate files, and one session's commit sweeping in another's uncommitted changes. **Do not work directly in a shared checkout.**

1. **Start every issue in your own git worktree**, branched off `origin/main`:
   ```bash
   git fetch origin
   git worktree add ../ditex-<issue-number> -b feat/issue-<issue-number> origin/main
   cd ../ditex-<issue-number> && npm ci
   ```
   You now have an isolated working directory and index — a parallel session cannot break your build or contaminate your commits. Verify (`lint` / `test` / `build` / `typecheck`) and open your PR from here. When merged, clean up: `git worktree remove ../ditex-<issue-number>`.

2. **If you find uncommitted changes you didn't make, stop — another session is active.** Never `git add -A` or `git add .`; you'll grab their work. Stage only your files by explicit path, and prefer moving to a fresh worktree (step 1) before doing anything else.

3. **Coordinate on shared hot files** (`proxy.ts`, `package.json`, `lib/i18n.ts`, `messages/*.json`, `.github/workflows/ci.yml`). Run `git status` before assuming a clean base; if your change overlaps another in-flight issue, note it in your PR and open a follow-up issue rather than silently reconciling.
<!-- END:parallel-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:i18n-rules -->
# i18n — mandatory rules for every agent

The site is fully internationalised. **Every piece of UI text lives in a dictionary file.** Violating this breaks the CA and EN builds silently.

## The three files to know

| File | Purpose |
|------|---------|
| `lib/i18n.ts` | Locale list, `getDictionary`, `hasLocale`, `localePath` |
| `messages/es.json` | Spanish — source of truth for dictionary *structure* |
| `messages/ca.json` / `messages/en.json` | Must mirror `es.json` key-for-key |

Read `docs/adr/0017-i18n-built-in-dictionary-approach.md` before touching anything i18n-related.

## Rules

1. **Never hardcode UI text in TSX.** All user-visible strings come from `dict.*`. The only exceptions are temporary dev-only debug pages and aria attributes tied to HTML semantics.

2. **All pages live under `app/[lang]/`.** There is no `app/layout.tsx` — `app/[lang]/layout.tsx` is the root layout. Every page receives `params: Promise<{ lang: string }>`, calls `hasLocale(lang)` and `getDictionary(lang)`.

3. **Internal links use `localePath`.** Import it from `@/lib/i18n` and call `localePath(lang, "/your-path")`. Never hardcode `/nosotros` — always prefix with locale.

4. **Sync all three dictionaries.** When you add a key to one `messages/*.json`, add the translated equivalent to the other two in the same PR/commit. The TypeScript type `Dictionary` is inferred from `es.json` — a missing key in `ca.json` or `en.json` will cause a type error at build time only if the shape differs.

5. **`lib/site.ts` holds routes, not labels.** Nav labels are in `dict.nav[key]`. The `navRoutes` array holds `{ key, href }` pairs — the `key` matches a field in `dict.nav`.

6. **Adding a new locale** is config + strings only: add to `locales` array in `lib/i18n.ts`, create the JSON file, add the loader. No routing changes needed.

7. **`proxy.ts` (not `middleware.ts`)** is the Next.js 16 entry point for locale detection. In Next.js 16, middleware was renamed to proxy. Do not create a `middleware.ts` file.
<!-- END:i18n-rules -->
