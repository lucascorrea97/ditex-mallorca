import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Nosotros — D.TEX Mallorca",
  description:
    "Distribuidora textil en Mallorca desde 2010. Especialistas en espuma a medida y materiales para tapicería profesional.",
};

const values = [
  {
    name: "Profesionalidad",
    text: "Equipo altamente formado con décadas de experiencia en el sector textil y de la tapicería.",
  },
  {
    name: "Confianza",
    text: "Transparencia y cumplimiento de compromisos como base de cada relación con nuestros clientes.",
  },
  {
    name: "Progreso",
    text: "Mejora continua a través del aprendizaje y la innovación en materiales y servicio.",
  },
  {
    name: "Compromiso",
    text: "Superar las expectativas de nuestros clientes y construir relaciones a largo plazo.",
  },
];

const reasons = [
  "Espuma a medida con corte a volumen (m³) — capacidad única en Baleares",
  "Gama completa: telas, polipieles, PVC, fibras y accesorios en un solo proveedor",
  "Reparto diario a todas las islas",
  "Atención personalizada y asesoramiento técnico",
  "Más de 30 años de experiencia sectorial acumulada",
];

export default function Page() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Nosotros
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Especialistas en espuma y materiales para tapicería{" "}
            <span className="text-brand-600">en Mallorca y Baleares</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Desde 2010 suministramos a tapiceros, fabricantes de muebles, empresas
            náuticas y proyectos de hostelería con todo lo que necesitan para trabajar:
            espuma a medida, telas, polipieles, PVC y accesorios, con reparto a todas las
            islas.
          </p>
        </Container>
      </section>

      {/* Story */}
      <Container className="py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Nuestra historia</h2>
            <div className="mt-5 space-y-4 text-stone-600 leading-relaxed">
              <p>
                D.TEX Mallorca nació en 2010 con la vocación de dar un servicio serio y
                profesional al sector de la tapicería en las Islas Baleares. Dos
                emprendedores con décadas de experiencia en el textil pusieron en marcha
                una distribuidora que hoy es referencia en el archipiélago.
              </p>
              <p>
                Con el tiempo nos hemos convertido en el proveedor de referencia para
                espuma a medida en Baleares. Cortamos espuma a cualquier dimensión,
                incluido a volumen (m³) y en altas densidades — una capacidad que pocos
                pueden ofrecer. De hecho, otros distribuidores que ofrecen corte de espuma
                nos compran a nosotros para cubrir sus pedidos.
              </p>
              <p>
                Alrededor de ese núcleo hemos construido una gama completa de materiales
                de tapicería — telas, polipieles, PVC, fibras y accesorios — para que
                nuestros clientes puedan resolver cualquier proyecto desde un solo
                proveedor, sin perder tiempo ni asumir riesgos de coordinación.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="text-4xl font-semibold text-brand-600">+30</p>
              <p className="mt-1 text-stone-600">
                Años de experiencia acumulada en el sector textil
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="text-4xl font-semibold text-brand-600">2010</p>
              <p className="mt-1 text-stone-600">
                Año de fundación. Más de 15 años sirviendo al sector en Baleares
              </p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <p className="text-sm font-medium text-stone-700">
                Polígono Industrial Can Valero, Palma de Mallorca — distribución a{" "}
                <span className="font-semibold text-brand-600">todas las islas</span>
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Values */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Nuestros valores</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.name} className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="font-semibold text-ink">{v.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why us */}
      <Container className="py-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          Por qué trabajar con nosotros
        </h2>
        <ul className="mt-8 space-y-4">
          {reasons.map((r) => (
            <li key={r} className="flex items-start gap-3">
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <span className="block h-2 w-2 rounded-full bg-brand-600" />
              </span>
              <span className="leading-relaxed text-stone-700">{r}</span>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex flex-wrap gap-3">
          <Button href="/contacto">Contactar</Button>
          <Button href="/productos" variant="outline">
            Ver productos
          </Button>
        </div>
      </Container>
    </>
  );
}
