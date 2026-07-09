"use client";

// Client-side Request cart (#21, ADR-0020): the Client Area's shared password gives no
// per-Client session to hold an in-progress Request in, so the lines a Client adds while
// browsing different Catalogue pages live in localStorage until the review page reads them
// once and submits to POST /api/requests.

const STORAGE_KEY = "ditex-request-cart";

export type RequestCartLine = {
  key: string;
  productId: number;
  productName: string;
  variantId: number | null;
  variantLabel: string | null;
  sku: string | null;
  category: string;
  unit: string;
  quantity: number;
  note: string;
};

function hasStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function lineKey(productId: number, variantId: number | null): string {
  return `${productId}-${variantId ?? "default"}`;
}

export function readCart(): RequestCartLine[] {
  if (!hasStorage()) return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(lines: RequestCartLine[]): void {
  if (!hasStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

// Adding a line for a product/variant already in the cart replaces it (same key) rather
// than appending a duplicate — the add-to-request widget always submits the current
// quantity/unit/note for that colourway, not a delta on top of what's already there.
export function addLine(line: RequestCartLine): RequestCartLine[] {
  const lines = readCart().filter((l) => l.key !== line.key);
  lines.push(line);
  writeCart(lines);
  return lines;
}

export function removeLine(key: string): RequestCartLine[] {
  const lines = readCart().filter((l) => l.key !== key);
  writeCart(lines);
  return lines;
}

export function updateLine(
  key: string,
  patch: Partial<Pick<RequestCartLine, "quantity" | "unit" | "note">>,
): RequestCartLine[] {
  const lines = readCart().map((l) => (l.key === key ? { ...l, ...patch } : l));
  writeCart(lines);
  return lines;
}

export function clearCart(): void {
  if (!hasStorage()) return;
  localStorage.removeItem(STORAGE_KEY);
}
