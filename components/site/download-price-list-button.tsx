"use client";

// The Price List PDF download (#15, ADR-0011): a real file download (the
// route returns Content-Disposition: attachment), not a page. A plain <a> is
// deliberate here, not an oversight — next/link performs a client-side/soft
// navigation and tries to render the response as page content, which for a
// binary PDF response just hangs (confirmed manually: the browser sat on
// "rendering" forever and never downloaded). A real, uninterrupted browser
// navigation is what makes Content-Disposition: attachment actually trigger
// a download, so this intentionally opts out of the next/link convention.
// Tracked via analytics (issue #15 acceptance criterion) so retiring the PDF
// bridge later is a data-driven call (ADR-0011), not a guess.

import { clsx } from "clsx";
import { trackPdfDownload } from "@/lib/analytics";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

export function DownloadPriceListButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-html-link-for-pages -- see comment above
    <a
      href="/api/price-list"
      onClick={() => trackPdfDownload("ditex-lista-de-precios.pdf")}
      className={clsx(base, className)}
    >
      {label}
    </a>
  );
}
