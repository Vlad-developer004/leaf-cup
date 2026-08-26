"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ToggleResult =
  | { success: true; favorited: boolean }
  | { success: false; error: string; requiresAuth?: boolean };

export async function toggleFavorite(productId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Нужно войти в аккаунт.", requiresAuth: true };
  }

  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath("/account/favorites");
    return { success: true, favorited: false };
  }

  await prisma.favorite.create({ data: { userId, productId } });
  revalidatePath("/account/favorites");
  return { success: true, favorited: true };
}
