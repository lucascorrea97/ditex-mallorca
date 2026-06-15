"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/admin/auth";
import { nullable, slugify, str, tags } from "@/lib/admin/form";

type Status = typeof schema.articles.$inferInsert.status;

// Stamp publishedAt the first time an article goes live; clear it when pulled back to draft.
function publishedAt(status: Status | undefined, current: Date | null): Date | null {
  if (status === "published") return current ?? new Date();
  return null;
}

export async function createArticle(form: FormData) {
  await requireAdmin();
  const title = str(form, "title");
  if (!title) throw new Error("El título es obligatorio.");
  const status = (str(form, "status") || "draft") as Status;

  const [created] = await db
    .insert(schema.articles)
    .values({
      title,
      slug: str(form, "slug") || slugify(title),
      locale: str(form, "locale") || "es",
      excerpt: nullable(form, "excerpt"),
      body: str(form, "body"),
      status,
      useTags: tags(form, "useTags"),
      publishedAt: publishedAt(status, null),
    })
    .returning();

  revalidatePath("/admin/contenido");
  redirect(`/admin/contenido/${created.id}`);
}

export async function updateArticle(id: number, form: FormData) {
  await requireAdmin();
  const title = str(form, "title");
  if (!title) throw new Error("El título es obligatorio.");
  const status = (str(form, "status") || "draft") as Status;

  const existing = await db.query.articles.findFirst({
    where: eq(schema.articles.id, id),
  });

  await db
    .update(schema.articles)
    .set({
      title,
      slug: str(form, "slug") || slugify(title),
      locale: str(form, "locale") || "es",
      excerpt: nullable(form, "excerpt"),
      body: str(form, "body"),
      status,
      useTags: tags(form, "useTags"),
      publishedAt: publishedAt(status, existing?.publishedAt ?? null),
      updatedAt: new Date(),
    })
    .where(eq(schema.articles.id, id));

  revalidatePath("/admin/contenido");
  revalidatePath(`/admin/contenido/${id}`);
  redirect("/admin/contenido");
}

export async function deleteArticle(id: number) {
  await requireAdmin();
  await db.delete(schema.articles).where(eq(schema.articles.id, id));
  revalidatePath("/admin/contenido");
  redirect("/admin/contenido");
}
