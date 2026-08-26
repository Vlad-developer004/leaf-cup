import { prisma } from "@/lib/prisma";

export function getAdminCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
