import { Container } from "@/components/ui/container";

// Temporary placeholder for marketing pages whose real content arrives with #28.
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <Container className="py-20 sm:py-28">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-stone-400">
        En construcción
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
        El contenido de esta página se está migrando desde la web actual. Próximamente.
      </p>
    </Container>
  );
}
