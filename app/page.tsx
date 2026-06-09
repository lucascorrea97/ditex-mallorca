import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";

// v1 foam-led home, built to show the design system (#27). Real copy/imagery and the
// full homepage treatment come with content migration (#28) and the homepage issue (#10).

const segments = [
  {
    imageId: "home-segment-tapiceria",
    title: "Tapicería y mobiliario",
    text: "Telas, espumas y accesorios para talleres y fabricantes de muebles.",
  },
  {
    imageId: "home-segment-nautica",
    title: "Náutica",
    text: "Materiales y espumas a medida para tapicería de embarcaciones.",
  },
  {
    imageId: "home-segment-hosteleria",
    title: "Hostelería y contract",
    text: "Suministro para proyectos de hoteles, restaurantes y rentals.",
  },
];

const range = ["Espuma a medida", "Telas", "Polipieles", "PVC", "Fibras y rellenos", "Accesorios"];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-700">
            Distribuidora textil · Baleares
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Los especialistas en <span className="text-brand-600">espuma a medida</span> de
            Mallorca.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Cortamos espuma a cualquier medida, incluso a volumen (m³). Y completamos tu
            taller con telas, polipieles, PVC y accesorios — todo en un solo proveedor,
            con reparto a todas las islas.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/productos">Ver productos</Button>
            <Button href="/contacto" variant="outline">
              Contactar
            </Button>
          </div>
          <div className="mt-12">
            <ImageSlot id="home-hero" sizes="(max-width: 768px) 100vw, 80vw" />
          </div>
        </Container>
      </section>

      {/* Trust signal — the foam moat (ADR-0008) */}
      <Container className="py-16">
        <p className="mx-auto max-w-3xl text-center text-2xl font-medium leading-snug sm:text-3xl">
          Somos referencia en espuma en Baleares: hasta otros distribuidores que ofrecen
          corte de espuma{" "}
          <span className="text-brand-600">nos compran a nosotros</span>.
        </p>
      </Container>

      {/* One-stop range */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-16">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">
            Una gama completa
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {range.map((r) => (
              <li
                key={r}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
              >
                {r}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Segments */}
      <Container className="py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Para cada sector</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {segments.map((s) => (
            <div key={s.title} className="overflow-hidden rounded-2xl border border-stone-200">
              <ImageSlot id={s.imageId} className="rounded-none" sizes="(max-width: 640px) 100vw, 33vw" />
              <div className="p-6">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
