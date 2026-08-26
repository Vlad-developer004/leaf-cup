"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Укажите имя и фамилию"),
  addressLine: z.string().trim().min(1, "Укажите адрес"),
  city: z.string().trim().min(1, "Укажите город"),
  postalCode: z.string().trim().min(1, "Укажите индекс"),
  country: z.string().trim().min(1, "Укажите страну"),
  phone: z.string().trim().min(1, "Укажите телефон"),
  isDefault: z.boolean(),
});

export type AddressInput = z.infer<typeof addressSchema>;

type ActionResult = { success: true } | { success: false; error: string };

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user.id;
}

async function clearDefaultFor(userId: string) {
  await prisma.address.updateMany({
    where: { userId, isDefault: true },
    data: { isDefault: false },
  });
}

export async function createAddress(input: AddressInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Нужно войти в аккаунт." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  const existingCount = await prisma.address.count({ where: { userId } });
  const isDefault = parsed.data.isDefault || existingCount === 0;

  if (isDefault) await clearDefaultFor(userId);

  await prisma.address.create({
    data: { ...parsed.data, isDefault, userId },
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Нужно войти в аккаунт." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) {
    return { success: false, error: "Адрес не найден." };
  }

  if (parsed.data.isDefault) await clearDefaultFor(userId);

  await prisma.address.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function deleteAddress(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Нужно войти в аккаунт." };

  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) {
    return { success: false, error: "Адрес не найден." };
  }

  await prisma.address.delete({ where: { id } });

  if (address.isDefault) {
    const next = await prisma.address.findFirst({ where: { userId } });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  revalidatePath("/account/addresses");
  return { success: true };
}

export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Нужно войти в аккаунт." };

  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) {
    return { success: false, error: "Адрес не найден." };
  }

  await clearDefaultFor(userId);
  await prisma.address.update({ where: { id }, data: { isDefault: true } });

  revalidatePath("/account/addresses");
  return { success: true };
}
