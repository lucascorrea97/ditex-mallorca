// Spanish labels for the schema enums, shown in the admin (ADR-0001 — the editor is a
// non-technical Spanish speaker, so dropdowns read in plain Spanish, not DB codes).
// Keep the keys in sync with db/schema.ts; the values are pure presentation.

export const CATEGORY_OPTIONS = [
  { value: "fabric", label: "Telas" },
  { value: "foam", label: "Espuma" },
  { value: "polipiel", label: "Polipiel" },
  { value: "pvc", label: "PVC" },
  { value: "material", label: "Material" },
  { value: "accessory", label: "Accesorio" },
] as const;

export const ZONE_OPTIONS = [
  { value: "all", label: "Todas las islas" },
  { value: "mallorca", label: "Mallorca" },
  { value: "men_ibz", label: "Menorca / Ibiza" },
] as const;

export const UNIT_OPTIONS = [
  { value: "metro", label: "Metro (metraje)" },
  { value: "pieza", label: "Pieza (rollo)" },
  { value: "kg", label: "Kilo" },
  { value: "metro_lineal", label: "Metro lineal" },
  { value: "unidad", label: "Unidad" },
  { value: "m3", label: "m³ (volumen)" },
] as const;

export const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicado" },
] as const;

export const LOCALE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "ca", label: "Català" },
  { value: "en", label: "English" },
] as const;

// Small helper for tables/badges: turn an enum value into its Spanish label.
export function labelFor(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}
