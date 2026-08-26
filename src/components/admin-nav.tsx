"use client";

import { Link } from "@/components/localized-link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AdminNav({
  dict,
  showTeam = false,
}: {
  dict: {
    dashboard: string;
    products: string;
    categories: string;
    orders: string;
    promoCodes: string;
    team: string;
    auditLog: string;
  };
  showTeam?: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: dict.dashboard },
    { href: "/admin/products", label: dict.products },
    { href: "/admin/categories", label: dict.categories },
    { href: "/admin/orders", label: dict.orders },
    { href: "/admin/promo-codes", label: dict.promoCodes },

    ...(showTeam
      ? [
          { href: "/admin/team", label: dict.team },
          { href: "/admin/audit-log", label: dict.auditLog },
        ]
      : []),
  ];

  return (
    <div className="border-b">

      <nav className="mx-auto flex w-full max-w-6xl flex-wrap gap-1 px-6">
        {links.map((link) => {
          const isActive =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-3 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
              {isActive && (
                <motion.span
                  layoutId="admin-nav-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
