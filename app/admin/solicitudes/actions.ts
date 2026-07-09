"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";

// Flip a Request's status (#21, ADR-0020). No richer workflow than new/handled for v1 —
// "handled" means the office has called/emailed the Client back with a confirmed price.
export async function toggleRequestStatus(id: number, currentStatus: string) {
  await requireAdmin();
  const nextStatus = currentStatus === "new" ? "handled" : "new";

  await db
    .update(schema.requests)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(schema.requests.id, id));

  revalidatePath("/admin/solicitudes");
  revalidatePath(`/admin/solicitudes/${id}`);
}
