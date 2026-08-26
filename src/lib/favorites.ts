import { prisma } from "@/lib/prisma";
import { localizeProducts } from "@/lib/translations";

export async function getFavoriteProductIds(userId: string): Promise<Set<string>> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { productId: true },
  });
  return new Set(favorites.map((f) => f.productId));
}

export async function getFavoriteProducts(userId: string, locale: string) {
  const products = await prisma.product.findMany({
    where: { favorites: { some: { userId } }, isActive: true },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  return localizeProducts(products, locale);
}
