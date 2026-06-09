import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Servicios — D.TEX Mallorca",
  description:
    "Corte de espuma a medida (m³), suministro de telas, polipieles, PVC y accesorios para tapicería. Reparto diario a todas las Islas Baleares.",
};

const services = [
  {
    name: "Telas para tapicería",
    text: "Amplia variedad de texturas, colores y estilos — desde opciones durables para muebles de alta rotación hasta tejidos elegantes para proyectos de interiorismo. Disponibles por metro lineal (metraje) o rollo completo (pieza).",
  },
  {
    name: "Polipieles y PVC",
    text: "Excelente alternativa al cuero natural con acabados variados, fácil limpieza y alta durabilidad. El PVC es ideal para exteriores: resistente al agua, moho y rayos UV. Disponibles en múltiples colores para tapicería de muebles, vehículos y embarcaciones.",
  },
  {
    name: "Accesorios y suministros",
    text: "Todo lo que el taller necesita: tachas, adhesivos, cinchas, velcros, hilos, grapas, argollas, rieles y sistemas de sujeción para cortinas. Materiales náuticos especializados para proyectos de embarcaciones.",
  },
  {
    name: "Reparto a todas las islas",
    text: "Servicio de distribución diario a Mallorca, Menorca, Ibiza y Formentera. Entrega eficiente y en condiciones óptimas para que el taller nunca pare de trabajar.",
  },
];

export default function Page() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Servicios
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Todo lo que necesitas para tapicería,{" "}
            <span className="text-brand-600">en un solo proveedor</span>.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            Desde el corte de espuma a volumen hasta el reparto a cualquier isla.
            Llevamos más de 30 años de experiencia en el sector para que tú puedas
            centrarte en tu oficio.
          </p>
        </Container>
      </section>

      {/* Featured: foam cutting */}
      <Container className="py-20">
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-8 sm:p-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
            Servicio estrella
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Corte de espuma a medida
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
            Cortamos gomaespuma a cualquier medida, en múltiples densidades y grosores.
            Incluido a volumen (m³) — una capacidad que muy pocos distribuidores en
            Baleares pueden ofrecer. Talleres, fabricantes de muebles, empresas náuticas
            y proyectos de hostelería confían en nosotros para sus pedidos de espuma
            personalizados.
          </p>
          <p className="mt-4 text-sm font-medium text-brand-700">
            Incluso otros distribuidores que ofrecen corte de espuma nos compran a
            nosotros para cubrir sus pedidos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contacto">Solicitar presupuesto</Button>
            <Button href="/productos" variant="outline">
              Ver gama de espumas
            </Button>
          </div>
        </div>
      </Container>

      {/* Other services */}
      <section className="border-y border-stone-200 bg-stone-50">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Materiales y suministros
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.name} className="rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="font-semibold text-ink">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <Container className="py-20">
        <p className="mx-auto max-w-2xl text-center text-2xl font-medium leading-snug sm:text-3xl">
          ¿Tienes un proyecto? Cuéntanos qué necesitas y te asesoramos sin compromiso.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button href="/contacto">Contactar</Button>
        </div>
      </Container>
    </>
  );
}
