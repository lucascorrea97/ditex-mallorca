"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

// Top-level admin sections. Add a new entry here (e.g. "Pedidos", "Analítica") when the
// dashboards/order views on the roadmap (ADR-0007) arrive — the shell needs no other change.
const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Inicio", exact: true },
  { href: "/admin/productos", label: "Productos y precios" },
  { href: "/admin/contenido", label: "Contenido" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-600 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
