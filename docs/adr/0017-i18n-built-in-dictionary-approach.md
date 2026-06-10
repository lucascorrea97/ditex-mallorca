# i18n: built-in Next.js routing with JSON dictionaries

**Status:** Accepted  
**Relates to:** ADR-0009 (languages ES+CA+EN)

## Decision

Use Next.js App Router's built-in `[lang]` dynamic segment for locale-prefixed URLs, with plain JSON dictionaries per locale in `messages/`. No third-party i18n library.

## Structure

```
messages/
  es.json   ← Spanish (default, source of truth for structure)
  ca.json   ← Catalan
  en.json   ← English
lib/
  i18n.ts   ← Locale config, getDictionary, hasLocale, localePath helpers
proxy.ts    ← Locale detection + redirect (Next.js 16 proxy file)
app/
  [lang]/
    layout.tsx          ← Root layout: sets <html lang>, Header, Footer
    page.tsx            ← Home
    nosotros/page.tsx
    servicios/page.tsx
    productos/page.tsx
    contacto/page.tsx
```

## How it works

1. **proxy.ts** intercepts every non-asset request. If the path has no locale prefix, it reads `Accept-Language` and redirects to `/{locale}/path`. Default locale is `es`.
2. **`[lang]` segment** makes the locale available to every layout and page via `params.lang`.
3. **getDictionary(lang)** loads the matching JSON file server-side only (dynamic import, cached by Next.js).
4. **localePath(locale, path)** builds locale-prefixed hrefs (`/es/contacto`, `/en/nosotros`, etc.). Use it for all internal links.
5. **LanguageSwitcher** is a client component that uses `usePathname()` to replace the locale segment in the current URL and render locale toggle links.

## URL slugs

All slugs use Spanish path segments across all locales (`/en/nosotros`, `/ca/servicios`). Spanish is the canonical language and slug translation is not worth the routing complexity at this stage.

## Dictionary structure

Each dictionary file mirrors the same JSON shape. The TypeScript type `Dictionary` is derived from `messages/es.json` via the `getDictionary` return type in `lib/i18n.ts`. All three files **must stay in sync** — add a key to all three when adding new content.

### Key naming conventions

- **Flat strings**: `"h1": "..."`, `"lead": "..."`
- **Highlighted phrases** (rendered in brand colour): split as `"h1Before"`, `"h1Accent"`, `"h1After"` — the component handles the `<span>` wrapping.
- **Translated arrays** (range chips, reasons, values, categories): keep as JSON arrays of strings or objects.
- **Page metadata**: `"title"` and `"description"` per page namespace.

## Adding a new locale (e.g. French)

1. Add `"fr"` to the `locales` array in `lib/i18n.ts`.
2. Create `messages/fr.json` with the same structure as `es.json`.
3. Add the loader to the `dictionaries` map in `lib/i18n.ts`.
4. No routing, proxy, or component changes needed.

## Adding a new page

1. Create `app/[lang]/your-route/page.tsx`.
2. Add a `navRoutes` entry in `lib/site.ts` if it belongs in the nav.
3. Add the translation namespace to **all three** `messages/*.json` files.
4. Use `getDictionary(lang)` and `localePath(lang, ...)` inside the page.

## Reasoning

- **No library** keeps the dependency count low (ADR-0001 simplicity, ADR-0007 free-tier stack). The Next.js built-in approach from the official docs covers everything needed.
- **JSON dictionaries** are plain files — any agent or developer can read and edit them without tooling.
- **Structure in ES first** means the source of truth is always the Spanish copy (business language), and translations are derived from it.
- Adding DE/FR later is config + strings only, with zero routing rework (ADR-0009 requirement met).
