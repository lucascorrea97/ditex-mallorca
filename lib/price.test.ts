import { describe, expect, it } from "vitest";
import { formatEur, parsePriceInput } from "@/lib/price";

// Prices are the regression-prone bit: Postgres `numeric` round-trips as a string,
// and Spanish keyboards type a comma. These lock the 2-decimal behaviour end to end.

describe("formatEur", () => {
  it("always shows exactly 2 decimals", () => {
    expect(formatEur("1.50")).toBe("1.50€");
    expect(formatEur("1.5")).toBe("1.50€");
    expect(formatEur(1.5)).toBe("1.50€");
    expect(formatEur("2")).toBe("2.00€");
  });

  it("re-pads the trailing zero Postgres numeric loses through Number()", () => {
    // The exact regression from CONTEXT/ADR notes: numeric "10.00" → Number 10 → "10.00€".
    expect(formatEur("10.00")).toBe("10.00€");
    expect(Number("10.00")).toBe(10); // the trap this guards against
  });

  it("rounds to 2 decimals", () => {
    expect(formatEur("1.005")).toBe("1.00€"); // banker-free toFixed rounding, locked as-is
    expect(formatEur("1.239")).toBe("1.24€");
  });

  it("renders on-request (CONSULTA) prices as the label", () => {
    expect(formatEur(null)).toBe("consultar");
  });
});

describe("parsePriceInput", () => {
  it("normalises to a canonical 2-decimal string for storage", () => {
    expect(parsePriceInput("1.5")).toBe("1.50");
    expect(parsePriceInput("10")).toBe("10.00");
  });

  it("accepts the Spanish comma decimal separator", () => {
    expect(parsePriceInput("1,50")).toBe("1.50");
    expect(parsePriceInput("12,9")).toBe("12.90");
  });

  it("treats blank or non-numeric input as no price (null)", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("   ")).toBeNull();
    expect(parsePriceInput("CONSULTA")).toBeNull();
    expect(parsePriceInput("abc")).toBeNull();
  });
});
