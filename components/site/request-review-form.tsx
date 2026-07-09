"use client";

// Request review/submit form (#21, ADR-0020): reads the client-side cart built by the
// add-to-request widget on each product page (lib/request-cart.ts), lets the Client edit
// quantities/units/notes and remove lines, capture business name + contact (the shared
// Client Area password identifies no one), then POSTs to /api/requests. No price is shown
// or promised anywhere in this flow.

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  clearCart,
  readCart,
  removeLine,
  updateLine,
  type RequestCartLine,
} from "@/lib/request-cart";

type Labels = {
  emptyCart: string;
  browseCatalogueLink: string;
  lineQuantity: string;
  lineUnit: string;
  lineNote: string;
  removeLine: string;
  businessNameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  contactHint: string;
  generalNoteLabel: string;
  submitButton: string;
  submitting: string;
  confirmationHeading: string;
  confirmationBody: string;
  referenceLabel: string;
  backToAreaClientes: string;
  errorRequired: string;
  genericError: string;
};

const submitButtonClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-50";

export function RequestReviewForm({
  labels,
  unitLabels,
  shippingRuleNote,
  catalogueHref,
  areaClientesHref,
}: {
  labels: Labels;
  unitLabels: Record<string, string>;
  shippingRuleNote: string;
  catalogueHref: string;
  areaClientesHref: string;
}) {
  // Read once on mount — the cart lives in localStorage, unreadable during SSR, and the
  // add-widget and this page are never open at the same time so no live-sync is needed.
  const [lines, setLines] = useState<RequestCartLine[] | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [generalNote, setGeneralNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    // localStorage is a browser-only external system, unavailable during SSR — this read
    // must happen post-mount. It's a one-time hydration-safe read, not a subscription:
    // after this, the cart is owned/edited by local component state (add/remove/update
    // below call setLines directly), so useSyncExternalStore's ongoing-sync model doesn't
    // fit — there is nothing external left to stay in sync with once this effect runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readCart());
  }, []);

  if (reference) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
        <h2 className="type-h2-minor">{labels.confirmationHeading}</h2>
        <p className="mt-3 text-stone-600">{labels.confirmationBody}</p>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-stone-400">
          {labels.referenceLabel}
        </p>
        <p className="type-h1 text-stone-900">{reference}</p>
        <div className="mt-8">
          <Link href={areaClientesHref} className="text-brand-600 hover:underline">
            {labels.backToAreaClientes}
          </Link>
        </div>
      </div>
    );
  }

  if (lines === null) return null;

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
        <p className="text-stone-600">{labels.emptyCart}</p>
        <div className="mt-6">
          <Link href={catalogueHref} className="text-brand-600 hover:underline">
            {labels.browseCatalogueLink}
          </Link>
        </div>
      </div>
    );
  }

  const hasNonFoamLine = lines.some((l) => l.category !== "foam");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!businessName.trim() || (!contactPhone.trim() && !contactEmail.trim())) {
      setError(labels.errorRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
          note: generalNote,
          lines: lines!.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.productName,
            variantLabel: l.variantLabel,
            sku: l.sku,
            quantity: l.quantity,
            unit: l.unit,
            note: l.note,
          })),
        }),
      });
      if (!res.ok) {
        setError(labels.genericError);
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as { reference: string };
      clearCart();
      setReference(data.reference);
    } catch {
      setError(labels.genericError);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ul className="space-y-4">
        {lines.map((line) => (
          <li key={line.key} className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-stone-900">{line.productName}</p>
                {line.variantLabel && (
                  <p className="text-sm text-stone-500">{line.variantLabel}</p>
                )}
                {line.sku && <p className="text-xs text-stone-400">SKU: {line.sku}</p>}
              </div>
              <button
                type="button"
                onClick={() => setLines(removeLine(line.key))}
                className="text-sm text-stone-400 hover:text-stone-700"
              >
                {labels.removeLine}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {labels.lineQuantity}
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={line.quantity}
                  onChange={(e) =>
                    setLines(updateLine(line.key, { quantity: Number(e.target.value) }))
                  }
                  className="mt-1 block w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
                />
              </label>
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {labels.lineUnit}
                <span className="mt-1 block px-1 py-2 text-sm font-normal normal-case tracking-normal text-stone-700">
                  {unitLabels[line.unit] ?? line.unit}
                </span>
              </p>
            </div>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-stone-400">
              {labels.lineNote}
              <textarea
                value={line.note}
                onChange={(e) => setLines(updateLine(line.key, { note: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-700"
              />
            </label>
          </li>
        ))}
      </ul>

      {hasNonFoamLine && (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          {shippingRuleNote}
        </p>
      )}

      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
          {labels.businessNameLabel}
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-700"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <label className="flex-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {labels.phoneLabel}
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-700"
            />
          </label>
          <label className="flex-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {labels.emailLabel}
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-700"
            />
          </label>
        </div>
        <p className="text-xs text-stone-400">{labels.contactHint}</p>

        <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
          {labels.generalNoteLabel}
          <textarea
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-700"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className={submitButtonClass}>
        {submitting ? labels.submitting : labels.submitButton}
      </button>
    </form>
  );
}
