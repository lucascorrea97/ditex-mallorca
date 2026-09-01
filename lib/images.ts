// Single source of truth for every image slot on the site.
// A slot with src: null renders a branded placeholder — the site never shows broken boxes.
// Swapping in a real photo = set src to the file path (e.g. '/images/home-hero.jpg').
// Per-product catalogue images (#7) are out of scope — this covers marketing/section imagery only.

export type ImagePriority = 'P1' | 'P2' | 'P3';
export type ImageSource = 'own' | 'supplier' | 'stock';
export type AspectRatio = '16/9' | '4/3' | '3/2' | '1/1' | '3/4';

export interface ImageSlotDef {
  id: string;
  page: string;
  section: string;
  /** Human-readable shot description shown inside the branded placeholder. */
  purpose: string;
  aspectRatio: AspectRatio;
  /** P1 = must have at launch; P2 = high value; P3 = nice to have / stock ok. */
  priority: ImagePriority;
  /** own = Ditex photography; supplier = brand imagery; stock = curated free stock. */
  source: ImageSource;
  /** Spanish, SEO-bearing. Used as <img alt> and aria-label on placeholders. */
  alt: string;
  /** null = show placeholder; '/images/...' = render real photo via next/image. */
  src: string | null;
}

export const imageManifest: ImageSlotDef[] = [
  // ── Inicio ────────────────────────────────────────────────────────────────
  {
    // The home hero is a BESPOKE full-bleed treatment rendered directly in
    // app/[lang]/page.tsx (next/image), not via <ImageSlot> — so this entry is a record,
    // not a render source. The current image is an AI-generated INTERIM placeholder
    // (demo-only exception to ADR-0016); replace `/images/home-hero.jpg` with a real
    // foam-cutting photograph via #36 before public launch. `purpose` is that target shot.
    id: 'home-hero',
    page: 'inicio',
    section: 'hero',
    purpose: 'Espuma siendo cortada a volumen (m³) — la capacidad estrella de D.TEX',
    aspectRatio: '16/9',
    priority: 'P1',
    source: 'stock',
    alt: 'Bloques de espuma cortados a medida en distintas densidades — D.TEX Mallorca',
    src: '/images/home-hero.jpg',
  },
  {
    id: 'home-segment-tapiceria',
    page: 'inicio',
    section: 'segmentos',
    // purpose = the ideal own shot (a real workshop) for the eventual replacement. The
    // current src is the interim interior render moved here from the hero — it shows
    // upholstered furniture, so it's on-theme for the tapicería segment (and small enough
    // here that its low resolution doesn't show). source 'stock', alt describes the image.
    purpose: 'Taller de tapicería profesional: telas, espumas y accesorios D.TEX',
    aspectRatio: '4/3',
    priority: 'P2',
    source: 'stock',
    alt: 'Salón con sofás tapizados — tapicería de mobiliario con materiales D.TEX Mallorca',
    src: '/images/home-segment-tapiceria.jpg',
  },
  {
    id: 'home-segment-nautica',
    page: 'inicio',
    section: 'segmentos',
    purpose: 'Embarcación o interior náutico tapizado con materiales D.TEX',
    aspectRatio: '4/3',
    priority: 'P2',
    source: 'stock',
    alt: 'Tapicería náutica: espuma y materiales D.TEX para embarcaciones en Mallorca',
    src: null,
  },
  {
    id: 'home-segment-hosteleria',
    page: 'inicio',
    section: 'segmentos',
    purpose: 'Hotel, restaurante o alquiler vacacional con mobiliario tapizado',
    aspectRatio: '4/3',
    priority: 'P3',
    source: 'stock',
    alt: 'Materiales D.TEX para proyectos de hostelería y contract en Mallorca',
    src: null,
  },

  // ── Nosotros ──────────────────────────────────────────────────────────────
  {
    id: 'nosotros-almacen',
    page: 'nosotros',
    section: 'historia',
    purpose: 'Almacén D.TEX: rollos de espuma y tela apilados en Can Valero',
    aspectRatio: '4/3',
    priority: 'P1',
    source: 'own',
    alt: 'Almacén de D.TEX Mallorca en el Polígono Can Valero con espumas y telas',
    src: null,
  },
  {
    id: 'nosotros-equipo',
    page: 'nosotros',
    section: 'equipo',
    purpose: 'El equipo D.TEX en el almacén o durante el corte de espuma',
    aspectRatio: '4/3',
    priority: 'P2',
    source: 'own',
    alt: 'Equipo de D.TEX Mallorca, especialistas en espuma y materiales para tapicería',
    src: null,
  },

  // ── Servicios ─────────────────────────────────────────────────────────────
  {
    id: 'servicios-corte-espuma',
    page: 'servicios',
    section: 'corte-espuma',
    purpose: 'Máquina de corte en acción: espuma cortada a medida y a volumen (m³)',
    aspectRatio: '16/9',
    priority: 'P1',
    source: 'own',
    alt: 'Corte de gomaespuma a medida y a volumen m³ en D.TEX Mallorca',
    src: null,
  },
  {
    id: 'servicios-reparto',
    page: 'servicios',
    section: 'reparto',
    purpose: 'Furgonetas D.TEX en ruta — reparto diario a todas las islas Baleares',
    aspectRatio: '4/3',
    priority: 'P1',
    source: 'own',
    alt: 'Furgonetas de distribución D.TEX para reparto diario en las Islas Baleares',
    src: null,
  },

  // ── Productos ─────────────────────────────────────────────────────────────
  {
    id: 'productos-espuma',
    page: 'productos',
    section: 'espuma',
    purpose: 'Bloques y rollos de espuma en distintas densidades en el almacén D.TEX',
    aspectRatio: '4/3',
    priority: 'P1',
    source: 'own',
    alt: 'Espuma a medida en distintas densidades y grosores — D.TEX Mallorca',
    src: null,
  },
  {
    id: 'productos-telas',
    page: 'productos',
    section: 'telas',
    purpose: 'Muestrario de telas: texturas, colores y colecciones para tapicería',
    aspectRatio: '4/3',
    priority: 'P2',
    source: 'supplier',
    alt: 'Amplia colección de telas para tapicería profesional — D.TEX Mallorca',
    src: null,
  },
  {
    id: 'productos-polipieles',
    page: 'productos',
    section: 'polipieles',
    purpose: 'Muestras de polipiel y PVC: acabados y colores variados',
    aspectRatio: '4/3',
    priority: 'P2',
    source: 'supplier',
    alt: 'Polipieles y PVC en múltiples acabados y colores — D.TEX Mallorca',
    src: null,
  },
];

export function getImageSlot(id: string): ImageSlotDef | undefined {
  return imageManifest.find((slot) => slot.id === id);
}
