"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Аватар хранится как data URL прямо в БД — в проекте нет файлового
// хранилища (S3 и т.п.), а изображение уже сжимается на клиенте перед
// отправкой, так что 1.5 МБ с запасом хватает на разумный аватар.
const MAX_IMAGE_LENGTH = 1_500_000;

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя"),
  lastName: z.string().trim().min(1, "Введите фамилию"),
  phone: z.string().trim().optional(),
  image: z
    .string()
    .trim()
    .max(MAX_IMAGE_LENGTH, "Изображение слишком большое")
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Нужно войти в аккаунт." };
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      ...(parsed.data.image !== undefined ? { image: parsed.data.image || null } : {}),
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { success: true };
}
