"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { checkbox, nullable, slugify, str, tags } from "@/lib/admin/form";
import { parsePriceInput } from "@/lib/prices";

// ── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(form: FormData) {
  await requireAdmin();
  const name = str(form, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const collectionId = str(form, "collectionId");

  const [created] = await db
    .insert(schema.products)
    .values({
      name,
      slug: str(form, "slug") || slugify(name),
      category: str(form, "category") as typeof schema.products.$inferInsert.category,
      code: nullable(form, "code"),
      width: nullable(form, "width"),
      description: nullable(form, "description"),
      collectionId: collectionId ? Number(collectionId) : null,
      useTags: tags(form, "useTags"),
    })
    .returning();

  // Manually-created admin products aren't A3 articles, so they get a single
  // unlabelled default Variant to carry `active` (ADR-0019 moved it off Product).
  // Per-variant editing (labels, multiple colourways) is a future admin ticket.
  await db.insert(schema.variants).values({
    productId: created.id,
    label: "",
    active: checkbox(form, "active"),
  });

  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${created.id}`);
}

export async function updateProduct(id: number, form: FormData) {
  await requireAdmin();
  const name = str(form, "name");
  if (!name) throw new Error("El nombre es obligatorio.");

  const collectionId = str(form, "collectionId");

  await db
    .update(schema.products)
    .set({
      name,
      slug: str(form, "slug") || slugify(name),
      category: str(form, "category") as typeof schema.products.$inferInsert.category,
      code: nullable(form, "code"),
      width: nullable(form, "width"),
      description: nullable(form, "description"),
      collectionId: collectionId ? Number(collectionId) : null,
      useTags: tags(form, "useTags"),
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, id));

  // Simplification: this form has one "active" checkbox for the whole line, so
  // it sets every existing Variant to match. Fine for admin-created single-
  // variant products; per-variant toggling for imported multi-colourway lines
  // is a future admin ticket (ADR-0019).
  await db
    .update(schema.variants)
    .set({ active: checkbox(form, "active"), updatedAt: new Date() })
    .where(eq(schema.variants.productId, id));

  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${id}`);
  redirect("/admin/productos");
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  // Prices are removed via the FK cascade (db/schema.ts).
  await db.delete(schema.products).where(eq(schema.products.id, id));
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

// ── Prices (managed inline on the product page) ──────────────────────────────

function priceAmount(form: FormData): { amount: string | null; onRequest: boolean } {
  const onRequest = checkbox(form, "onRequest");
  if (onRequest) return { amount: null, onRequest: true };
  return { amount: parsePriceInput(str(form, "amount")), onRequest: false };
}

export async function addPrice(productId: number, form: FormData) {
  await requireAdmin();
  const { amount, onRequest } = priceAmount(form);
  await db.insert(schema.prices).values({
    productId,
    zone: str(form, "zone") as typeof schema.prices.$inferInsert.zone,
    unit: str(form, "unit") as typeof schema.prices.$inferInsert.unit,
    amount,
    onRequest,
    qualifier: nullable(form, "qualifier"),
  });
  revalidatePath(`/admin/productos/${productId}`);
}

export async function updatePrice(priceId: number, productId: number, form: FormData) {
  await requireAdmin();
  const { amount, onRequest } = priceAmount(form);
  await db
    .update(schema.prices)
    .set({
      zone: str(form, "zone") as typeof schema.prices.$inferInsert.zone,
      unit: str(form, "unit") as typeof schema.prices.$inferInsert.unit,
      amount,
      onRequest,
      qualifier: nullable(form, "qualifier"),
      updatedAt: new Date(),
    })
    .where(eq(schema.prices.id, priceId));
  revalidatePath(`/admin/productos/${productId}`);
}

export async function deletePrice(priceId: number, productId: number) {
  await requireAdmin();
  await db.delete(schema.prices).where(eq(schema.prices.id, priceId));
  revalidatePath(`/admin/productos/${productId}`);
}
