"use client";

// The Price List PDF download (#15, ADR-0011): a real file download (the
// route returns Content-Disposition: attachment), not a client-side page
// transition — but next/link renders a plain <a> for a route it doesn't
// recognise as an app page, so it works fine here and keeps the lint rule happy.
// Tracked via analytics (issue #15 acceptance criterion) so retiring the PDF
// bridge later is a data-driven call (ADR-0011), not a guess.

import Link from "next/link";
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
    <Link
      href="/api/price-list"
      onClick={() => trackPdfDownload("ditex-lista-de-precios.pdf")}
      className={clsx(base, className)}
    >
      {label}
    </Link>
  );
}
