import { Link } from "@/components/localized-link";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getOrderStatusLabels, orderStatusBadgeVariant } from "@/lib/order-status";
import type { getOrdersForUser } from "@/lib/orders";

type Order = Awaited<ReturnType<typeof getOrdersForUser>>[number];

export type OrderListDict = {
  toCatalogBtn: string;
  orderNumber: string;
  shippingAddress: string;
  total: string;
};

export function OrderList({
  orders,
  emptyText,
  showShippingAddress = false,
  locale,
  t,
  dict,
}: {
  orders: Order[];
  emptyText: string;
  showShippingAddress?: boolean;
  locale: string;
  t: (key: string) => string;
  dict: OrderListDict;
}) {
  const statusLabels = getOrderStatusLabels(t);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border py-16 text-center">
        <Package className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-muted-foreground">{emptyText}</p>
        <Button asChild className="mt-2 px-6">
          <Link href="/catalog">{dict.toCatalogBtn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
            <div>
              <p className="font-heading font-medium">
                {dict.orderNumber} {order.id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(order.createdAt)}
              </p>
            </div>
            <Badge variant={orderStatusBadgeVariant[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>

          <div className="flex flex-col gap-3 py-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                {item.product ? (
                  <Link href={`/catalog/${item.product.slug}`} className="hover:underline">
                    {item.productName} × {item.quantity}
                  </Link>
                ) : (
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {formatPrice(item.priceAmount * item.quantity, order.currency)}
                </span>
              </div>
            ))}
          </div>

          {showShippingAddress && (
            <div className="flex flex-col gap-1 border-t py-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{dict.shippingAddress}</span>
              <span>
                {order.shippingFullName}, {order.shippingAddressLine}, {order.shippingCity}{" "}
                {order.shippingPostalCode}, {order.shippingCountry}
              </span>
              <span>{order.shippingPhone}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-heading font-medium">{dict.total}</span>
            <span className="font-heading font-medium">
              {formatPrice(order.totalAmount, order.currency)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
