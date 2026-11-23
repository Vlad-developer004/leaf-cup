import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { localizeProduct, localizeProducts } from "@/lib/translations";
import { getCategories } from "@/lib/get-categories-uncached";

export const CATALOG_TAG = "catalog";
const HOUR = 3600;

export const getFeaturedProducts = unstable_cache(
  async (locale: string) => {
    const rows = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    });
    return localizeProducts(rows, locale);
  },
  ["featured-products"],
  { tags: [CATALOG_TAG], revalidate: HOUR }
);

export const getCatalogPage = unstable_cache(
  async (locale: string, categorySlug: string, requestedPage: number, pageSize: number) => {
    const where = {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    };
    const totalCount = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const page = Math.min(Math.max(1, requestedPage || 1), totalPages);
    const rows = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { products: await localizeProducts(rows, locale), totalPages, page };
  },
  ["catalog-page"],
  { tags: [CATALOG_TAG], revalidate: HOUR }
);

export const getProductBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
    if (!product || !product.isActive) return null;
    return localizeProduct(product, locale);
  },
  ["product-by-slug"],
  { tags: [CATALOG_TAG], revalidate: HOUR }
);

export const getCachedCategories = unstable_cache(
  async (locale: string) => {
    return getCategories(locale);
  },
  ["categories"],
  { tags: [CATALOG_TAG], revalidate: HOUR }
);
