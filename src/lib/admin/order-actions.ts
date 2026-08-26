"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { getAllowedNextStatuses } from "@/lib/admin/order-transitions";
import { logAdminAction } from "@/lib/admin/audit-log";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
): Promise<ActionResult> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) {
    return { success: false, error: "Заказ не найден." };
  }

  const allowed = getAllowedNextStatuses(order.status);
  if (!allowed.includes(nextStatus)) {
    return { success: false, error: "Такой переход статуса недопустим." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "order.status_change",
    targetType: "Order",
    targetId: orderId,
    summary: `Сменил статус заказа #${orderId.slice(-8).toUpperCase()}: ${order.status} → ${nextStatus}`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account");
  return { success: true };
}
