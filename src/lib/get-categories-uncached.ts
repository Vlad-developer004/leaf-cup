import "server-only";
import { prisma } from "@/lib/prisma";
import { localizeCategories } from "@/lib/translations";

export async function getCategories(locale: string) {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  });
  return localizeCategories(categories, locale);
}
