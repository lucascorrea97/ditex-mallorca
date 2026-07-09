import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("converts common Markdown constructs to HTML", () => {
    const html = renderMarkdown("# Heading\n\nA **bold** claim with a [link](https://example.com).");

    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it("renders lists", () => {
    const html = renderMarkdown("- one\n- two");

    expect(html).toContain("<ul>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<li>two</li>");
  });

  it("returns a plain string synchronously, not a Promise", () => {
    const result = renderMarkdown("hello");
    expect(typeof result).toBe("string");
  });
});
