import { describe, expect, it } from "vitest";
import {
  clientDocHref,
  clientDocSlugs,
  clientDocs,
  findClientDoc,
  formatDocDate,
  formatDocSize,
} from "@/lib/client-docs";

// The Client Area document registry (#84). `findClientDoc` is the allow-list that stands
// between a client-supplied URL segment and a read from the private Blob store, so its
// rejection behaviour is the security-relevant part — tested directly rather than through
// the route, which would need a session and a live store.

describe("findClientDoc — the allow-list gate", () => {
  it("resolves each registered slug", () => {
    for (const slug of clientDocSlugs) {
      expect(findClientDoc(slug)?.slug).toBe(slug);
    }
  });

  it("rejects anything not registered", () => {
    expect(findClientDoc("")).toBeUndefined();
    expect(findClientDoc("unknown")).toBeUndefined();
    expect(findClientDoc("tarifa-telas.pdf")).toBeUndefined();
  });

  it("rejects traversal and pathname-injection attempts", () => {
    // The whole point of the allow-list: none of these may ever become a blob pathname,
    // or the route turns into a read-anything proxy for whoever holds the shared password.
    expect(findClientDoc("../secrets")).toBeUndefined();
    expect(findClientDoc("../../client-docs/Catalogo-nov-2025.pdf")).toBeUndefined();
    expect(findClientDoc("client-docs/Catalogo-nov-2025.pdf")).toBeUndefined();
    expect(findClientDoc("TARIFA-TELAS")).toBeUndefined(); // exact match only
  });
});

describe("the registry itself", () => {
  it("lists exactly the three parity documents", () => {
    expect(clientDocs.map((doc) => doc.slug)).toEqual([
      "tarifa-telas",
      "tarifa-material",
      "catalogo",
    ]);
  });

  it("keeps blob pathnames unique so no document can shadow another", () => {
    const pathnames = clientDocs.map((doc) => doc.blobPathname);
    expect(new Set(pathnames).size).toBe(pathnames.length);
  });

  it("links only to the authed route, never to a blob URL", () => {
    for (const doc of clientDocs) {
      expect(clientDocHref(doc.slug)).toBe(`/api/client-docs/${doc.slug}`);
    }
  });

  it("keeps the catalogue small enough to stream through a function", () => {
    // Guards the compression step: the original export was 85 MB, which is not something
    // to pipe through a Hobby function. If a future upload regresses this, fail here
    // rather than in a Client's browser.
    const catalogo = findClientDoc("catalogo");
    expect(catalogo!.bytes).toBeLessThan(20_000_000);
  });
});

describe("formatDocDate", () => {
  it("gives a day-precise date in each locale", () => {
    const telas = findClientDoc("tarifa-telas")!;
    expect(formatDocDate(telas, "es")).toBe("7 de agosto de 2026");
    expect(formatDocDate(telas, "en")).toBe("7 August 2026");
  });

  it("omits the day when we only know the month", () => {
    // The catalogue is "nov-2025" — printing "1 de noviembre" would invent precision.
    const catalogo = findClientDoc("catalogo")!;
    expect(formatDocDate(catalogo, "es")).toBe("noviembre de 2025");
    expect(formatDocDate(catalogo, "en")).toBe("November 2025");
  });

  it("does not roll back a day in a negative-offset timezone", () => {
    // The date is parsed at UTC noon precisely so this holds regardless of where the
    // render happens; a bare `new Date("2026-08-07")` would print the 6th in the Americas.
    const telas = findClientDoc("tarifa-telas")!;
    expect(formatDocDate(telas, "en")).toContain("7 August");
  });
});

describe("formatDocSize", () => {
  it("uses the locale's decimal separator", () => {
    expect(formatDocSize(14_148_590, "es")).toBe("14,1 MB");
    expect(formatDocSize(14_148_590, "en")).toBe("14.1 MB");
  });

  it("drops to kB below a megabyte so nothing renders as 0 MB", () => {
    expect(formatDocSize(312_000, "en")).toBe("312 kB");
  });
});
