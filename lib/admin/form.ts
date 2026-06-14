// FormData parsing helpers shared by the admin Server Actions. Kept tiny and dependency-free
// so both the products and content actions read the same way.

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function str(form: FormData, key: string): string {
  return (form.get(key)?.toString() ?? "").trim();
}

export function nullable(form: FormData, key: string): string | null {
  const v = str(form, key);
  return v === "" ? null : v;
}

export function checkbox(form: FormData, key: string): boolean {
  return form.get(key) === "on";
}

export function tags(form: FormData, key: string): string[] {
  return str(form, key)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
