"use client";

// The download link for a Client Area document (#84). Points at the authenticated
// route (/api/client-docs/<slug>), never at a Blob URL — the private store has no
// public URL by design, and routing every read through the session check is what makes
// the login mean anything (ADR-0007, 2026-09-01).
//
// A plain <a> rather than next/link, for the same reason as the Price List button:
// next/link soft-navigates and tries to render the PDF response as page content, which
// hangs. `target="_blank"` opens the browser's own PDF viewer in a new tab, matching
// the current site's behaviour and keeping the Client Area page behind it.
//
// Downloads are tracked (ADR-0012) so the family can see which of the three documents
// Clients actually use — the same signal that will decide what to build next.

import { clsx } from "clsx";
import { trackPdfDownload } from "@/lib/analytics";

const base =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2";

export function ClientDocLink({
  href,
  filename,
  label,
  className,
}: {
  href: string;
  /** Analytics label — the real filename, so the report reads like the file list. */
  filename: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackPdfDownload(filename)}
      className={clsx(base, className)}
    >
      {label}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </a>
  );
}
