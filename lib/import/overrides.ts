import type { ImportOverrides } from "@/lib/import/parse";

// Manual corrections for the exception classes the import report flags
// (ADR-0019: "overrides beat heuristics"). Edit this file when the report
// surfaces a suspect group, an empty variant label, or a familia typo — never
// hand-edit the generated products/variants directly, so re-running the
// importer (`npm run db:import`) stays stable and reproducible.
//
// Keys are exactly as they appear in the source data: `familiaLineCorrections`
// keys are the raw (uncorrected) `Desc. familia` value; `groupOverrides` and
// `variantLabelOverrides` keys are the A3 SKU (`Cód. artículo`).
export const overrides: ImportOverrides = {
  familiaLineCorrections: {},
  groupOverrides: {},
  variantLabelOverrides: {},
};
