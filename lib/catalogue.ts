// Catalogue routing utilities: maps DB category enum values ↔ URL slugs.
// Foam leads per ADR-0008 — it's the moat and the brand anchor.

export type CategoryValue =
  | "fabric"
  | "foam"
  | "polipiel"
  | "pvc"
  | "material"
  | "accessory";

// DB enum value → URL slug (Spanish, SEO-bearing)
export const CATEGORY_SLUGS: Record<CategoryValue, string> = {
  foam: "espuma",
  fabric: "telas",
  polipiel: "polipieles",
  pvc: "pvc",
  material: "material",
  accessory: "accesorios",
};

// URL slug → DB enum value (reverse of above)
export const SLUG_TO_CATEGORY = Object.fromEntries(
  (Object.entries(CATEGORY_SLUGS) as [CategoryValue, string][]).map(
    ([k, v]) => [v, k],
  ),
) as Record<string, CategoryValue>;

// Render order: foam always first (ADR-0008)
export const CATEGORY_ORDER: CategoryValue[] = [
  "foam",
  "fabric",
  "polipiel",
  "pvc",
  "material",
  "accessory",
];
