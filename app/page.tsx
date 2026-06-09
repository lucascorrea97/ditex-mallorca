// Placeholder home page for the staging scaffold (issue #1).
// The real foam-led homepage is issue #10 — do not treat this as final design.
export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-stone-50 px-6 py-24 text-stone-900">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium uppercase tracking-widest text-stone-500">
          Entorno de staging · no indexado
        </span>

        <div className="flex flex-col items-center gap-3">
          <p className="text-5xl font-semibold tracking-tight sm:text-6xl">
            D.TEX <span className="text-amber-700">Mallorca</span>
          </p>
          <p className="max-w-md text-lg leading-relaxed text-stone-600">
            Especialistas en <strong className="text-stone-900">espuma a medida</strong>{" "}
            y materiales para tapicería profesional en Baleares.
          </p>
        </div>

        <p className="max-w-lg text-sm leading-relaxed text-stone-500">
          Sitio nuevo en construcción. La web actual sigue activa en{" "}
          <a
            href="https://ditexmallorca.es"
            className="font-medium text-amber-700 underline-offset-4 hover:underline"
          >
            ditexmallorca.es
          </a>{" "}
          hasta que esta versión esté completa.
        </p>
      </main>
    </div>
  );
}
