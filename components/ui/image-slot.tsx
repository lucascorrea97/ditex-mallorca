import Image from 'next/image';
import { clsx } from 'clsx';
import { getImageSlot } from '@/lib/images';

const aspectClasses = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
} as const;

interface Props {
  id: string;
  className?: string;
  /**
   * next/image `sizes` hint. Defaults to a sensible responsive value.
   * Override when the image occupies a known fixed width (e.g. half the viewport).
   */
  sizes?: string;
}

/**
 * Renders the real photo when available, otherwise a branded placeholder.
 * Every image position on the site goes through this component — no hard-coded <img> tags.
 * Swapping a placeholder for a real photo = one manifest edit in lib/images.ts.
 */
export function ImageSlot({ id, className, sizes }: Props) {
  const slot = getImageSlot(id);
  if (!slot) return null;

  const aspectClass = aspectClasses[slot.aspectRatio];

  if (slot.src) {
    return (
      <div className={clsx('relative overflow-hidden rounded-2xl', aspectClass, className)}>
        <Image
          src={slot.src}
          alt={slot.alt}
          fill
          sizes={sizes ?? '(max-width: 768px) 100vw, 50vw'}
          className="object-cover"
        />
      </div>
    );
  }

  // Branded placeholder — d·tex mark on a warm stone surface with slot description.
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl bg-stone-100',
        aspectClass,
        className,
      )}
      role="img"
      aria-label={slot.alt}
    >
      {/* d·tex mark, centered, barely visible — signals intentional placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-20 w-20 opacity-[0.18]">
          <Image src="/brand/dtex-mark.png" alt="" fill className="object-contain" />
        </div>
      </div>

      {/* Slot metadata — visible to editors; guides the photographer/shot list */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-200/70 to-transparent px-4 pb-4 pt-8">
        <p className="text-xs leading-snug text-stone-500">{slot.purpose}</p>
        <span className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-widest text-stone-400">
          {slot.priority} · {slot.source}
        </span>
      </div>
    </div>
  );
}
