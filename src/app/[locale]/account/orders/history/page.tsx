import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { OrderList } from "@/components/account/order-list";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("orders.historyLabel") + " — Leaf & Cup",
  };
}

export default async function OrderHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const orders = await getOrdersForUser(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("orders.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/account/orders" className="hover:text-foreground">
          {t("orders.title")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("orders.historyLabel")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("orders.historyLabel")}
      </h1>

      <OrderList
        orders={orders}
        emptyText={t("orders.historyEmpty")}
        locale={locale}
        t={t}
        dict={{
          toCatalogBtn: t("cart.toCatalogBtn"),
          orderNumber: t("orders.orderNumber"),
          shippingAddress: t("checkout.addressTitle"),
          total: t("checkout.total"),
        }}
      />
    </main>
  );
}
