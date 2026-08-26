import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { localizeCategories } from "@/lib/translations";

const fetchCategories = cache(() =>
  prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  })
);

export async function getCategories(locale: string) {
  const categories = await fetchCategories();
  return localizeCategories(categories, locale);
}
