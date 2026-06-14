// Renders a JSON-LD structured-data block (ADR-0002). Server component — the script is
// part of the SSR HTML so crawlers and LLMs see it without executing JS.
//
// `data` comes from the builders in lib/json-ld.ts, which only contain values we author
// (no user input), so dangerouslySetInnerHTML is safe here. The `<` escape avoids any
// chance of breaking out of the <script> element.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
