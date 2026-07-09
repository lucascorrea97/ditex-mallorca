"use client";

// Add-to-request widget (#21, ADR-0020): lets a signed-in Client add this Product (or one
// of its colourway Variants) to the client-side Request cart (lib/request-cart.ts) without
// leaving the product page. Foam has no cut configurator here (that's #42) — it gets a
// plain quantity + free-text note describing the cut, no unit precision implied.

import { useState } from "react";
import Link from "next/link";
import { addLine, lineKey } from "@/lib/request-cart";

type VariantOption = {
  id: number;
  label: string;
  sku: string | null;
};

export function AddToRequestWidget({
  productId,
  productName,
  category,
  isFoam,
  units,
  unitLabels,
  variants,
  defaultVariant,
  requestHref,
  labels,
}: {
  productId: number;
  productName: string;
  category: string;
  isFoam: boolean;
  units: string[];
  unitLabels: Record<string, string>;
  variants: VariantOption[];
  defaultVariant: VariantOption | null;
  requestHref: string;
  labels: {
    heading: string;
    quantityLabel: string;
    unitLabel: string;
    colourLabel: string;
    noteLabel: string;
    foamNoteLabel: string;
    foamNotePlaceholder: string;
    addButton: string;
    addedConfirmation: string;
    viewRequestLink: string;
  };
}) {
  const hasColourChoice = variants.length > 1;
  const [variantId, setVariantId] = useState<number | null>(
    hasColourChoice ? variants[0].id : (defaultVariant?.id ?? null),
  );
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState(units[0] ?? "unidad");
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  const selectedVariant = hasColourChoice
    ? (variants.find((v) => v.id === variantId) ?? null)
    : defaultVariant;

  function handleAdd() {
    const qty = Number(quantity.replace(",", "."));
    if (!Number.isFinite(qty) || qty <= 0) return;
    if (hasColourChoice && variantId === null) return;

    addLine({
      key: lineKey(productId, selectedVariant?.id ?? null),
      productId,
      productName,
      variantId: hasColourChoice ? (selectedVariant?.id ?? null) : null,
      variantLabel: hasColourChoice ? (selectedVariant?.label ?? null) : null,
      sku: selectedVariant?.sku ?? null,
      category,
      unit: isFoam ? "unidad" : unit,
      quantity: qty,
      note,
    });
    setAdded(true);
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <p className="type-eyebrow text-stone-400">{labels.heading}</p>

      <div className="mt-4 space-y-4">
        {hasColourChoice && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              {labels.colourLabel}
              <select
                value={variantId ?? ""}
                onChange={(e) => setVariantId(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <label className="flex-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {labels.quantityLabel}
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
            />
          </label>

          {!isFoam && units.length > 0 && (
            <label className="flex-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
              {labels.unitLabel}
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {unitLabels[u] ?? u}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            {isFoam ? labels.foamNoteLabel : labels.noteLabel}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isFoam ? labels.foamNotePlaceholder : undefined}
              rows={isFoam ? 3 : 2}
              className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          {labels.addButton}
        </button>

        {added && (
          <p className="text-sm text-stone-600">
            {labels.addedConfirmation}{" "}
            <Link href={requestHref} className="font-medium text-brand-600 hover:underline">
              {labels.viewRequestLink}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
