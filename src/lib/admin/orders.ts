import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { ADMIN_PAGE_SIZE } from "@/lib/admin/products";

export type OrderSortKey = "date" | "amount";

const SORT_FIELD: Record<OrderSortKey, string> = {
  date: "createdAt",
  amount: "totalAmount",
};

export async function getAdminOrders({
  page = 1,
  status,
  search,
  sort,
  dir = "desc",
}: {
  page?: number;
  status?: OrderStatus;
  search?: string;
  sort?: OrderSortKey;
  dir?: "asc" | "desc";
}) {
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" as const } },
            { user: { email: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const totalCount = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const orderBy = sort ? { [SORT_FIELD[sort]]: dir } : { createdAt: "desc" as const };

  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy,
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
