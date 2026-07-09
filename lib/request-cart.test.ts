import { beforeEach, describe, expect, it } from "vitest";
import {
  addLine,
  clearCart,
  lineKey,
  readCart,
  removeLine,
  type RequestCartLine,
  updateLine,
} from "@/lib/request-cart";

// vitest.config.ts runs in a plain Node environment (no jsdom) — this module only ever
// touches `localStorage` via `typeof localStorage !== "undefined"`, which resolves through
// the global scope without throwing even when the identifier was never declared. That's
// exactly what lets us polyfill a minimal in-memory localStorage here instead of pulling in
// jsdom just for this one module.
class FakeLocalStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: FakeLocalStorage }).localStorage =
    new FakeLocalStorage();
});

function line(overrides: Partial<RequestCartLine> = {}): RequestCartLine {
  return {
    key: lineKey(1, null),
    productId: 1,
    productName: "ALLANTE",
    variantId: null,
    variantLabel: null,
    sku: "M450455",
    category: "fabric",
    unit: "metro",
    quantity: 3,
    note: "",
    ...overrides,
  };
}

describe("readCart", () => {
  it("returns an empty array when nothing has been stored", () => {
    expect(readCart()).toEqual([]);
  });
});

describe("addLine", () => {
  it("adds a new line and it shows up in readCart", () => {
    addLine(line());
    expect(readCart()).toEqual([line()]);
  });

  it("replaces an existing line with the same key instead of duplicating it", () => {
    addLine(line({ quantity: 3 }));
    addLine(line({ quantity: 5, note: "urgente" }));

    const cart = readCart();
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ quantity: 5, note: "urgente" });
  });

  it("keeps distinct variants of the same product as separate lines", () => {
    addLine(line({ key: lineKey(1, 10), variantId: 10, variantLabel: "C-832 BURGUNDY" }));
    addLine(line({ key: lineKey(1, 20), variantId: 20, variantLabel: "C-896 SEA CRUISE" }));

    expect(readCart()).toHaveLength(2);
  });
});

describe("removeLine", () => {
  it("removes only the matching line", () => {
    addLine(line({ key: "a" }));
    addLine(line({ key: "b" }));

    removeLine("a");

    expect(readCart().map((l) => l.key)).toEqual(["b"]);
  });
});

describe("updateLine", () => {
  it("patches quantity/unit/note on the matching line, leaving others untouched", () => {
    addLine(line({ key: "a", quantity: 1 }));

    updateLine("a", { quantity: 7, note: "70x40cm" });

    expect(readCart()[0]).toMatchObject({ quantity: 7, note: "70x40cm" });
  });
});

describe("clearCart", () => {
  it("empties the cart", () => {
    addLine(line());
    clearCart();
    expect(readCart()).toEqual([]);
  });
});
