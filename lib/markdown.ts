// Guide bodies are stored as Markdown (db/schema.ts comment: "pasted from the
// AI draft") and rendered to HTML for the public page. `marked` is a small,
// zero-dependency parser — no headless browser, no plugin ecosystem, matching
// ADR-0001's "no fancy editor dependencies" (that ADR is about the admin
// editor, but the same simplicity bar applies here).
//
// TRUST BOUNDARY: content is authored by the single admin editor (ADR-0007) —
// never public/user input — so the raw HTML output is safe to render as-is.
// If Guides ever accept outside contributions, this needs a sanitiser first.

import { marked } from "marked";

export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false });
}
