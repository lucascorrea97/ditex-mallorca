import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ui/image-slot";

export const metadata: Metadata = {
  title: "Productos — D.TEX Mallorca",
  description:
    "Catálogo de materiales para tapicería profesional: espuma a medida, telas, polipieles, PVC, fibras y accesorios. Distribución a todas las Islas Baleares.",
};

const categories = [
  {
    imageId: "productos-espuma",
    name: "Espuma a medida",
    description:
      "Gomaespuma de alta calidad en diferentes densidades y grosores, cortada a medida para cada pedido. Disponible a volumen (m³) para proyectos de gran escala.",
    highlights: [
      "Múltiples densidades (blanda, media, alta)",
      "Corte a medida en cualquier formato",
      "Corte a volumen (m³)",
      "Para tapicería, colchonería, náutica y contract",
    ],
  },
  {
    imageId: "productos-telas",
    name: "Telas",
    description:
      "Amplia variedad de estilos, colores y texturas para adaptarse a cualquier proyecto. Desde telas durables para muebles de alta rotación hasta elegantes acabados para interiorismo.",
    highlights: [
      "Venta por metro lineal (metraje) o rollo completo (pieza)",
      "Múltiples colecciones y acabados",
      "Opciones para interior y exterior",
      "Adecuadas para muebles, hostelería y náutica",
    ],
  },
  {
    imageId: "productos-polipieles",
    name: "Polipieles",
    description:
      "Excelente alternativa al cuero natural, con acabados variados, fácil limpieza y alta durabilidad. Ideales para muebles de salón, tapicería de vehículos y embarcaciones.",
    highlights: [
      "Gran variedad de colores y acabados",
      "Fácil mantenimiento y limpieza",
      "Alta durabilidad",
      "Adecuadas para uso intensivo",
    ],
  },
  {
    name: "PVC",
    description:
      "Material de alta calidad especialmente indicado para exteriores y entornos húmedos. Resistente al agua, moho y rayos UV.",
    highlights: [
      "Resistente al agua y a la intemperie",
      "Protección UV",
      "Múltiples colores y diseños",
      "Ideal para muebles de exterior y náutica",
    ],
  },
  {
    name: "Fibras y rellenos",
    description:
      "Rellenos y materiales complementarios para proyectos de tapicería: fibra de poliéster, vatelina, guata y otros materiales de refuerzo y confort.",
    highlights: [
      "Fibra de poliéster",
      "Vatelina y guata",
      "Materiales de refuerzo",
      "Complementos para espumas",
    ],
  },
  {
    name: "Accesorios",
    description:
      "Todo lo necesario para el taller: sistemas de sujeción, herrajes, materiales de acabado y componentes especializados para náutica.",
    highlights: [
      "Tachas, grapas y adhesivos",
      "Cinchas y velcros",
      "Hilos para tapicería",
      "Argollas, rieles y sistemas para cortinas",
      "Materiales náuticos especializados",
    ],
  },
];

export default function Page() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Catálogo
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Materiales para tapicería profesional,{" "}
            <span className="text-brand-600">todo en un solo lugar</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Desde espuma a medida hasta los accesorios más específicos. Suministramos a
            talleres de tapicería, fabricantes de muebles, empresas náuticas y proyectos
            de hostelería en toda Baleares.
          </p>
          <p className="mt-4 text-sm text-stone-500">
            Los precios y disponibilidad están disponibles en el{" "}
            <strong className="text-stone-700">Área de Clientes</strong> (acceso
            restringido a clientes autorizados).
          </p>
        </Container>
      </section>

      {/* Categories */}
      <Container className="py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="overflow-hidden rounded-2xl border border-stone-200"
            >
              {cat.imageId && (
                <ImageSlot
                  id={cat.imageId}
                  className="rounded-none"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="p-8">
                <h2 className="text-xl font-semibold tracking-tight">{cat.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {cat.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {cat.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <section className="border-t border-stone-200 bg-stone-50">
        <Container className="py-16">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                ¿Eres cliente de D.TEX?
              </h2>
              <p className="mt-2 text-stone-600">
                Accede al Área de Clientes para consultar precios y disponibilidad.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/contacto" variant="outline">
                Solicitar acceso
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
