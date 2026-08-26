import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export const orderStatusLabels: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  FAILED: "Оплата не прошла",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

export const orderStatusBadgeVariant: Record<string, BadgeVariant> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};
