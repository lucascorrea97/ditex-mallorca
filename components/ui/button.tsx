import Link from "next/link";
import { clsx } from "clsx";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50";

const sizes = "h-11 px-6"; // large tap target (ADR-0001)

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  outline: "border border-stone-300 text-ink hover:border-ink hover:bg-stone-50",
  ghost: "text-ink hover:bg-stone-100",
};

type Props = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
} & ({ href: string } | { href?: undefined });

// Renders a styled Next.js Link when `href` is set, otherwise a plain button.
export function Button({ variant = "primary", className, children, ...props }: Props) {
  const cls = clsx(base, sizes, variants[variant], className);
  if (props.href) {
    return (
      <Link href={props.href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
