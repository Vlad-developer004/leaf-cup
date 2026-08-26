import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const ORDER_STATUS_KEYS: Record<string, string> = {
  PENDING: "orderStatus.pending",
  PAID: "orderStatus.paid",
  FAILED: "orderStatus.failed",
  SHIPPED: "orderStatus.shipped",
  DELIVERED: "orderStatus.delivered",
  CANCELLED: "orderStatus.cancelled",
};

export function getOrderStatusLabels(t: (key: string) => string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(ORDER_STATUS_KEYS).map(([status, key]) => [status, t(key)])
  );
}

export const orderStatusBadgeVariant: Record<string, BadgeVariant> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};
