import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getAdminOrderById } from "@/lib/admin/orders";
import { getAllowedNextStatuses } from "@/lib/admin/order-transitions";
import { getOrderStatusLabels, orderStatusBadgeVariant } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Reveal } from "@/components/reveal";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("orders.orderNumber") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const allowedNextStatuses = getAllowedNextStatuses(order.status);
  const statusLabels = getOrderStatusLabels(t);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">
          {t("orders.orderNumber")}{order.id.slice(-8).toUpperCase()}
        </h1>
        <Badge variant={orderStatusBadgeVariant[order.status]}>
          {statusLabels[order.status]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="flex flex-col gap-2 rounded-xl border p-6">
          <span className="font-heading font-medium">{t("adminOrders.customerAndShipping")}</span>
          <p className="text-sm text-muted-foreground">{order.user.email}</p>
          <p className="text-sm text-muted-foreground">
            {order.shippingFullName}, {order.shippingAddressLine}, {order.shippingCity}{" "}
            {order.shippingPostalCode}, {order.shippingCountry}
          </p>
          <p className="text-sm text-muted-foreground">{order.shippingPhone}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("adminOrders.placedOn")}{" "}
            {new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(
              order.createdAt
            )}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="flex flex-col gap-3 rounded-xl border p-6">
          <span className="font-heading font-medium">{t("adminOrders.statusChange")}</span>
          <OrderStatusForm orderId={order.id} allowedNextStatuses={allowedNextStatuses} />
        </Reveal>
      </div>

      <Reveal delay={0.14} className="rounded-xl border p-6">
        <span className="font-heading font-medium">{t("adminOrders.items")}</span>
        <div className="mt-4 flex flex-col divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span className="text-muted-foreground">
                {formatPrice(item.priceAmount * item.quantity, order.currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="font-heading font-medium">{t("checkout.total")}</span>
          <span className="font-heading font-medium">
            {formatPrice(order.totalAmount, order.currency)}
          </span>
        </div>
      </Reveal>
    </div>
  );
}
