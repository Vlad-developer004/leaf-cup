import { prisma } from "@/lib/prisma";

export const ADMIN_PAGE_SIZE = 15;

// Ниже этого остатка товар считается "заканчивающимся" на дашборде админки —
// произвольное, но задокументированное число, не привязано ни к чему в схеме.
export const LOW_STOCK_THRESHOLD = 5;

export async function getAdminProducts({
  page = 1,
  search,
  categorySlug,
}: {
  page?: number;
  search?: string;
  categorySlug?: string;
}) {
  const where = {
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip: (clampedPage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
  });

  return { products, page: clampedPage, totalPages, totalCount };
}

export function getAdminProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}
