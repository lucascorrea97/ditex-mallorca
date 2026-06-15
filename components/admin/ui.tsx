import { clsx } from "clsx";

// Admin form primitives. They reuse the same design tokens as the public site (brand
// colours, stone neutrals, rounded controls, large 44px tap targets — ADR-0001) but live
// here because the public design system has no form inputs yet. Plain server components:
// the admin is form + Server Action driven, so almost nothing needs client interactivity.

const inputBase =
  "block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-stone-50";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={clsx(inputBase, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={clsx(inputBase, "min-h-40 font-mono text-sm", className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select className={clsx(inputBase, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
}

type SubmitVariant = "primary" | "danger";

const submitVariants: Record<SubmitVariant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
};

// Form submit button. Mirrors the public Button styling but supports the `formAction`,
// `name`/`value` and `type` a form needs — which the public <Button> deliberately omits.
export function SubmitButton({
  variant = "primary",
  className,
  children,
  ...props
}: { variant?: SubmitVariant } & React.ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50",
        submitVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Coloured status pill for tables (active/inactive, draft/published).
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "green" | "amber";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-600",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
