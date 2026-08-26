import { OrderStatus } from "@/generated/prisma/client";

// Единственный источник истины по факту оплаты — вебхук Stripe (PENDING →
// PAID/FAILED). Отсюда вручную доступны только переходы после оплаты и
// отмена зависшего неоплаченного заказа.
const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: [OrderStatus.CANCELLED],
  PAID: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
};

export function getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}
