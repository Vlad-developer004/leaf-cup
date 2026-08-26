import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";

export function getOrdersForUser(userId: string, statuses?: OrderStatus[]) {
  return prisma.order.findMany({
    where: { userId, ...(statuses ? { status: { in: statuses } } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { slug: true, images: true } },
        },
      },
    },
  });
}
