import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto — D.TEX Mallorca",
  description:
    "Contacta con D.TEX Mallorca. C/ 4 de Noviembre Nº4, Polígono Industrial Can Valero, Palma. Tel: +34 971 25 41 27. Lunes a viernes, 7:00–14:00h.",
};

const a = business.address;

export default function Page() {
  return (
    <>
      {/* Intro */}
      <section className="border-b border-stone-200 bg-stone-50">
        <Container className="py-20 sm:py-24">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            Contacto
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Estamos aquí para ayudarte.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
            Para pedidos, consultas técnicas o solicitudes de acceso al Área de Clientes,
            llámanos o escríbenos.
          </p>
        </Container>
      </section>

      <Container className="py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Contact details */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Datos de contacto</h2>
            <address className="mt-8 space-y-6 not-italic">

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-700" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Dirección
                  </p>
                  <p className="mt-1 text-stone-700">
                    {a.street}
                    <br />
                    {a.area}
                    <br />
                    {a.postalCode} {a.city}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-700" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Teléfono
                  </p>
                  <a
                    href={business.phone.href}
                    className="mt-1 block text-stone-700 hover:text-ink"
                  >
                    {business.phone.display}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-700" aria-hidden>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Email
                  </p>
                  <a
                    href={`mailto:${business.email}`}
                    className="mt-1 block text-stone-700 hover:text-ink"
                  >
                    {business.email}
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-700" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                    Horario
                  </p>
                  <p className="mt-1 text-stone-700">{business.hours}</p>
                </div>
              </div>
            </address>

            {/* Map placeholder */}
            <div className="mt-10 flex h-52 items-center justify-center rounded-2xl border border-stone-200 bg-stone-100">
              <div className="text-center">
                <p className="text-sm font-medium text-stone-500">Mapa</p>
                <p className="mt-1 text-xs text-stone-400">
                  Polígono Industrial Can Valero, Palma
                </p>
                <a
                  href="https://maps.google.com/?q=C%2F+4+de+Noviembre+N%C2%BA4,+Pol%C3%ADgono+Industrial+Can+Valero,+07014+Palma+de+Mallorca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline"
                >
                  Abrir en Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Envíanos un mensaje</h2>
            <p className="mt-2 text-sm text-stone-500">
              Formulario de contacto — próximamente disponible.
            </p>

            {/* Form placeholder */}
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Nombre
                  </label>
                  <div className="mt-1.5 h-11 rounded-lg border border-stone-300 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Email
                  </label>
                  <div className="mt-1.5 h-11 rounded-lg border border-stone-300 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Mensaje
                  </label>
                  <div className="mt-1.5 h-28 rounded-lg border border-stone-300 bg-white" />
                </div>
                <div className="h-11 rounded-full bg-stone-200" />
              </div>
              <p className="mt-5 text-xs text-stone-400">
                Responsable del tratamiento: RIBOT FUSTER, S.L. (D.TEX MALLORCA). Los
                datos se tratarán para gestionar su consulta conforme a nuestra política
                de privacidad.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
