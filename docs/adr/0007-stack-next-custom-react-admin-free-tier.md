# Stack: one Next.js app, custom React admin, free-tier infra

Maintained by the user (a React developer) plus AI agents — no team. Budget is free-tier only, without sacrificing quality; not enterprise scale.

## Decision

A **single Next.js (App Router) application** containing both:

- **Public site** — server-rendered/statically generated for the SEO/GEO goal (ADR-0002): fast Core Web Vitals, crawlable content, structured data. Multilingual ES/CA/EN via Next i18n routing.
- **Custom React admin** at a login-gated `/admin` — plain client-side React (the user's strength), not a headless CMS. Chosen over Sanity/Payload because the roadmap (order dashboards, analytics, data viz) is bespoke React work that a CMS handles poorly, AI agents build custom CRUD cheaply, and a tailored admin is simpler for the non-technical editor (ADR-0001) than a generic CMS UI.

## Stack

- **Framework:** Next.js (App Router) — React, so the user's skills transfer; best-in-class for SEO/SSR.
- **Hosting:** Vercel Hobby (free) — also provides the noindex preview/staging deploys ADR-0005 needs.
- **Database:** Postgres on a free serverless tier (Neon or Supabase). The website's own datastore (ADR-0003/0006).
- **ORM:** Drizzle (typed, lightweight, agent-friendly).
- **Auth:** Auth.js (NextAuth) — **do not hand-roll auth.** Covers admin login and the Client Area gate.
- **Images:** Cloudinary free tier (auto-optimisation helps Core Web Vitals) or Supabase Storage — for product photos / richer visualisation.
- **UI:** Tailwind + a headless component kit (shadcn/ui) to build the simple, accessible UI of ADR-0001 quickly.

## Considered Options

- **Headless CMS (Sanity/Payload)** — rejected: weak at the bespoke dashboards on the roadmap; extra system to learn; less tailored for the one non-technical editor.
- **Plain React SPA (Vite)** — rejected for the public site: no SSR, fatal for the SEO/GEO priority. Retained conceptually only for the admin, which lives inside the Next app instead.

## Consequences

- One codebase, one deploy, shared types between public site, admin, and the future A3 Connector.
- Everything sits on free tiers; if a tier is outgrown, the pieces (DB, images) swap independently.
- Auth is the only part we don't build ourselves — deliberately.
