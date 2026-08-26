import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/products";

export async function getAdminOrders({
  page = 1,
  status,
}: {
  page?: number;
  status?: OrderStatus;
}) {
  const where = status ? { status } : {};

  const totalCount = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    skip: (clampedPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return { orders, page: clampedPage, totalPages, totalCount };
}

export function getAdminOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { email: true } } },
  });
}
