import { Container } from "@/components/ui/container";

// Shared layout pieces for the three legal pages (#79, LSSI/RGPD: aviso-legal, privacidad,
// cookies). All three are DRAFT PENDING BUSINESS REVIEW (see each page's PR/issue) — the
// banner below is deliberately prominent, not a footnote, so a reader can't miss it while
// the text is still unconfirmed by the business/gestor.

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export function LegalPageHeader({
  eyebrow,
  h1,
  draftNotice,
  lastUpdated,
  spanishPrevailsNote,
  showSpanishPrevails,
}: {
  eyebrow: string;
  h1: string;
  draftNotice: string;
  lastUpdated: string;
  spanishPrevailsNote: string;
  showSpanishPrevails: boolean;
}) {
  return (
    <section className="border-b border-stone-200 bg-stone-50">
      <Container className="py-hero sm:py-hero-sm">
        <p className="mb-4 type-eyebrow text-stone-400">{eyebrow}</p>
        <h1 className="max-w-2xl type-h1">{h1}</h1>
        <p className="mt-4 text-sm text-stone-500">{lastUpdated}</p>

        <div className="mt-6 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {draftNotice}
        </div>

        {showSpanishPrevails && (
          <p className="mt-4 max-w-2xl text-sm italic text-stone-500">
            {spanishPrevailsNote}
          </p>
        )}
      </Container>
    </section>
  );
}

export function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <Container className="py-section-lg">
      <div className="max-w-2xl space-y-10">
        {sections.map((section) => (
          <div key={section.heading}>
            <h2 className="type-h2-minor">{section.heading}</h2>
            {section.paragraphs.length > 0 && (
              <div className="mt-3 space-y-3 text-stone-600 leading-relaxed">
                {section.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )}
            {section.list && section.list.length > 0 && (
              <ul className="mt-3 space-y-2">
                {section.list.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                    <span className="text-stone-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}
