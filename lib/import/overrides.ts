import type { ImportOverrides } from "@/lib/import/parse";

// Manual corrections for the exception classes the import report flags
// (ADR-0019: "overrides beat heuristics"). Edit this file when the report
// surfaces a single-member marker group or a near-duplicate standalone pair
// that should actually be one Product — never hand-edit the generated
// products/variants directly, so re-running the importer (`npm run
// db:import`) stays stable and reproducible.
//
// Keys are the A3 SKU (`Cód. artículo`).
export const overrides: ImportOverrides = {
  groupOverrides: {},
  variantLabelOverrides: {},
};
