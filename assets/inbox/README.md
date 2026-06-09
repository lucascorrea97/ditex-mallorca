# Photo inbox

Drop supplied photos here. An agent will map them into the manifest and wire up the slot.

## How it works

1. **Rename the file** to match the slot `id` from `lib/images.ts`.
   - Examples: `home-hero.jpg`, `nosotros-almacen.jpg`, `servicios-corte-espuma.jpg`
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`

2. **Drop it in this folder** (`assets/inbox/`).

3. **Tell the agent**: _"Wire up the photo I just dropped in the inbox."_
   The agent will:
   - Copy the file to `public/images/<slot-id>.<ext>`
   - Update the `src` field in `lib/images.ts` from `null` to `'/images/<slot-id>.<ext>'`
   - Confirm which slot was wired

The site then shows the real photo instead of the branded placeholder — no other code changes needed.

## Current shot list (priority order)

| ID | Priority | What to capture |
|----|----------|-----------------|
| `home-hero` | P1 | Espuma siendo cortada a medida / a volumen (m³) |
| `nosotros-almacen` | P1 | Almacén: rollos de espuma y tela apilados |
| `servicios-corte-espuma` | P1 | Máquina de corte en acción |
| `servicios-reparto` | P1 | Furgonetas D.TEX en ruta |
| `productos-espuma` | P1 | Bloques/rollos de espuma en almacén |
| `home-segment-tapiceria` | P2 | Taller de tapicería con materiales D.TEX |
| `home-segment-nautica` | P2 | Interior náutico tapizado (stock ok) |
| `nosotros-equipo` | P2 | El equipo D.TEX en el almacén |
| `productos-telas` | P2 | Muestrario de telas (imagen de proveedor ok) |
| `productos-polipieles` | P2 | Muestras de polipiel/PVC (imagen de proveedor ok) |
| `home-segment-hosteleria` | P3 | Hotel/restaurante con mobiliario tapizado (stock ok) |

## Notes

- **No AI-generated images** — see ADR-0016. Authenticity is the point.
- P1 shots are needed at launch; P2/P3 can stay as branded placeholders initially.
- Per-product catalogue images (hundreds of SKUs from A3) are a separate stream — out of scope here.
