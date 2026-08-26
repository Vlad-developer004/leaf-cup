import { prisma } from "@/lib/prisma";

export function getAdminPromoCodes() {
  return prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
}
