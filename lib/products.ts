import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

// A Product (line) counts as active/visible on the public site when at least one
// of its Variants (A3 articles) is active — Bloqueado now lives per-SKU on the
// Variant, not on the Product line itself (ADR-0019). Used as a subquery
// wherever the public site used to filter `products.active = true` directly.
export function activeProductIds() {
  return db
    .selectDistinct({ id: schema.variants.productId })
    .from(schema.variants)
    .where(eq(schema.variants.active, true));
}
