import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { articles } from "@/db/schema";
import { LOCALE_OPTIONS, STATUS_OPTIONS } from "@/lib/admin/constants";
import { Field, Input, Select, Textarea, SubmitButton } from "@/components/admin/ui";

type Article = InferSelectModel<typeof articles>;

// Shared by the create and edit content pages. `action` is a bound Server Action.
export function ArticleForm({
  action,
  article,
  submitLabel,
}: {
  action: (form: FormData) => void | Promise<void>;
  article?: Article;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-3xl space-y-6">
      <Field label="Título" htmlFor="title">
        <Input id="title" name="title" defaultValue={article?.title ?? ""} required />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Idioma" htmlFor="locale">
          <Select id="locale" name="locale" defaultValue={article?.locale ?? "es"}>
            {LOCALE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estado" htmlFor="status">
          <Select id="status" name="status" defaultValue={article?.status ?? "draft"}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Enlace (slug)" htmlFor="slug" hint="Se genera del título si lo dejas vacío.">
          <Input id="slug" name="slug" defaultValue={article?.slug ?? ""} />
        </Field>
      </div>

      <Field
        label="Resumen"
        htmlFor="excerpt"
        hint="Frase corta para listados y buscadores."
      >
        <Input id="excerpt" name="excerpt" defaultValue={article?.excerpt ?? ""} />
      </Field>

      <Field
        label="Etiquetas de uso"
        htmlFor="useTags"
        hint="Separadas por comas, p. ej. espuma, nautica."
      >
        <Input
          id="useTags"
          name="useTags"
          defaultValue={(article?.useTags ?? []).join(", ")}
        />
      </Field>

      <Field
        label="Contenido"
        htmlFor="body"
        hint="Texto del artículo en Markdown (puedes pegar el borrador del asistente)."
      >
        <Textarea id="body" name="body" className="min-h-96" defaultValue={article?.body ?? ""} />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton type="submit">{submitLabel}</SubmitButton>
        <Link
          href="/admin/contenido"
          className="text-sm font-medium text-stone-500 hover:text-stone-900"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
