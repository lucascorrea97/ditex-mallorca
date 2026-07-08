import { describe, expect, it } from "vitest";
import { hasLocalePrefix, resolvePreferredLocale } from "@/lib/i18n";

// Locale precedence and the SEO guardrail (issue #47). These are the decision rules the
// proxy delegates to; testing them here keeps the routing behaviour honest without spinning
// up the whole request pipeline.

describe("resolvePreferredLocale — precedence: cookie > Accept-Language > default", () => {
  it("prefers a valid cookie over the Accept-Language header", () => {
    // The exact bug from #47: browser prefers en, but the user chose es → es wins.
    expect(resolvePreferredLocale("es", "en-US,en;q=0.9")).toBe("es");
  });

  it("falls back to Accept-Language when there is no cookie", () => {
    expect(resolvePreferredLocale(undefined, "en-US,en;q=0.9")).toBe("en");
    expect(resolvePreferredLocale(undefined, "ca-ES,ca;q=0.9")).toBe("ca");
  });

  it("matches an Accept-Language base language when the region variant is unlisted", () => {
    expect(resolvePreferredLocale(undefined, "en-GB")).toBe("en");
  });

  it("picks the first serviceable Accept-Language entry, skipping ones we don't serve", () => {
    expect(resolvePreferredLocale(undefined, "de-DE,de;q=0.9,en;q=0.8")).toBe("en");
  });

  it("defaults to es (primary market) with no cookie and nothing serviceable", () => {
    expect(resolvePreferredLocale(undefined, "")).toBe("es");
    expect(resolvePreferredLocale(undefined, "de-DE,fr;q=0.8")).toBe("es");
  });

  it("ignores an invalid cookie value and continues resolving", () => {
    expect(resolvePreferredLocale("de", "en-US")).toBe("en");
    expect(resolvePreferredLocale("", "en-US")).toBe("en");
  });
});

describe("hasLocalePrefix — the guardrail against redirecting prefixed URLs", () => {
  it("is true for a bare or nested locale path", () => {
    expect(hasLocalePrefix("/es")).toBe(true);
    expect(hasLocalePrefix("/en/contacto")).toBe(true);
    expect(hasLocalePrefix("/ca/area-clientes/acceder")).toBe(true);
  });

  it("is false for unprefixed paths (these are the only ones the proxy redirects)", () => {
    expect(hasLocalePrefix("/")).toBe(false);
    expect(hasLocalePrefix("/contacto")).toBe(false);
  });

  it("does not treat a non-locale segment that merely starts with a locale as prefixed", () => {
    expect(hasLocalePrefix("/espuma")).toBe(false); // "es" + "puma", not the es locale
    expect(hasLocalePrefix("/english")).toBe(false);
  });
});
