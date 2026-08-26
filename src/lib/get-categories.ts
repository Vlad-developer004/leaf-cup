import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getCategories = cache(() =>
  prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  })
);
