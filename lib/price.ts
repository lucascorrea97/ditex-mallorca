// Price parsing/formatting for the Price List (Tarifa). Kept as pure, dependency-free
// functions so they can be unit-tested and reused by both the admin Server Actions
// (input → storage) and any display surface (storage → label). See CONTEXT.md for the
// domain terms (Price List, CONSULTA, Mallorca/Men-Ibz).

/**
 * Normalise an admin-entered amount into a canonical 2-decimal string for storage,
 * or `null` when the field is blank or not a number. Accepts a comma or dot decimal
 * separator, since Spanish keyboards type "1,50". CONSULTA (on request) is handled by
 * the caller, not here — a `null` amount here just means "nothing entered".
 */
export function parsePriceInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const num = Number(trimmed.replace(",", "."));
  if (Number.isNaN(num)) return null;
  return num.toFixed(2);
}

/**
 * Format a stored price for display. Postgres `numeric` comes back as a string
 * ("1.50"), and `Number("1.50")` drops the trailing zero — so we always re-pad to
 * exactly 2 decimals. `null` (an on-request / CONSULTA price) renders as the label.
 */
export function formatEur(amount: string | number | null): string {
  if (amount === null) return "consultar";
  return `${Number(amount).toFixed(2)}€`;
}
