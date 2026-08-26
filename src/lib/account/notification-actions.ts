"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const notificationsSchema = z.object({
  emailAnnouncements: z.boolean(),
  emailBagReminder: z.boolean(),
});

export type NotificationsInput = z.infer<typeof notificationsSchema>;

type ActionResult = { success: true } | { success: false; error: string };

export async function updateNotificationPrefs(input: NotificationsInput): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Нужно войти в аккаунт." };
  }

  const parsed = notificationsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Не удалось сохранить настройки." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/account/notifications");
  return { success: true };
}
