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
    <Container className="py-20 sm:py-28">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-stone-400">
        {eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">{body}</p>
    </Container>
  );
}
