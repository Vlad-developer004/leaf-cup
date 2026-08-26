import { prisma } from "@/lib/prisma";

export async function getFavoriteProductIds(userId: string): Promise<Set<string>> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}

export function getFavoriteProducts(userId: string) {
  return prisma.product.findMany({
    where: { favorites: { some: { userId } }, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
}
