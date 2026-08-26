import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight, History, PackageOpen, Truck, type LucideIcon } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("orders.title") + " — Leaf & Cup",
  };
}

const ACTIVE_STATUSES = ["PENDING", "PAID", "SHIPPED"] as const;
const SHIPPED_STATUSES = ["SHIPPED", "DELIVERED"] as const;

export default async function AccountOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [historyCount, activeCount, shipmentsCount] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.count({ where: { userId: session.user.id, status: { in: [...ACTIVE_STATUSES] } } }),
    prisma.order.count({ where: { userId: session.user.id, status: { in: [...SHIPPED_STATUSES] } } }),
  ]);

  const menuItems: { href: string; icon: LucideIcon; label: string; subtitle: string }[] = [
    {
      href: "/account/orders/history",
      icon: History,
      label: t("orders.historyLabel"),
      subtitle: historyCount > 0 ? `${t("orders.historyCount")}${historyCount}` : t("orders.historyEmpty"),
    },
    {
      href: "/account/orders/active",
      icon: PackageOpen,
      label: t("orders.activeLabel"),
      subtitle: activeCount > 0 ? `${t("orders.activeCount")}${activeCount}` : t("orders.activeEmpty"),
    },
    {
      href: "/account/orders/shipments",
      icon: Truck,
      label: t("orders.shipmentsLabel"),
      subtitle: shipmentsCount > 0 ? `${t("orders.shipmentsCount")}${shipmentsCount}` : t("orders.shipmentsEmpty"),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("orders.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("orders.title")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("orders.title")}
      </h1>

      <div className="flex flex-col divide-y rounded-xl border">
        {menuItems.map(({ href, icon: Icon, label, subtitle }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground transition-transform duration-200 ease-out group-hover:scale-105">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-heading font-medium">{label}</span>
              <span className="truncate text-sm text-muted-foreground">{subtitle}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </main>
  );
}
