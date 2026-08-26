import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const [activeProductCount, lowStockCount, actionableOrderCount, revenueByCurrency, activePromoCodeCount] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } } }),
      prisma.order.count({ where: { status: { in: ["PENDING", "PAID"] } } }),
      prisma.order.groupBy({
        by: ["currency"],
        where: { status: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.promoCode.count({ where: { isActive: true } }),
    ]);

  const revenueText = revenueByCurrency.length
    ? revenueByCurrency
        .map((row) => formatPrice(row._sum.totalAmount ?? 0, row.currency))
        .join(" + ")
    : formatPrice(0, "EUR");

  const stats: { label: string; value: string | number; href: string; hint?: string }[] = [
    { label: t("admin.activeProducts"), value: activeProductCount, href: "/admin/products" },
    {
      label: t("admin.lowStock"),
      value: lowStockCount,
      href: "/admin/products",
      hint: t("admin.lowStockHint", { threshold: LOW_STOCK_THRESHOLD }),
    },
    { label: t("admin.actionableOrders"), value: actionableOrderCount, href: "/admin/orders" },
    { label: t("admin.revenue"), value: revenueText, href: "/admin/orders" },
    { label: t("admin.activePromoCodes"), value: activePromoCodeCount, href: "/admin/promo-codes" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminNav.dashboard")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.06}>
            <Link href={stat.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="font-heading text-2xl font-medium">{stat.value}</span>
                  {stat.hint && (
                    <span className="ml-2 text-xs text-muted-foreground">{stat.hint}</span>
                  )}
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
