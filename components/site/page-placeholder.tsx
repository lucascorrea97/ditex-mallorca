import { Container } from "@/components/ui/container";

export function PagePlaceholder({
  title,
  eyebrow,
  body,
}: {
  title: string;
  eyebrow: string;
  body: string;
}) {
  return (
    <Container className="py-hero sm:py-hero-sm">
      <p className="mb-3 type-eyebrow font-medium text-stone-400">
        {eyebrow}
      </p>
      <h1 className="type-h1">{title}</h1>
      <p className="mt-5 max-w-xl type-lead text-stone-600">{body}</p>
    </Container>
  );
}
