"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin/audit-log";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Укажите название"),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес (slug)")
    .regex(/^[a-z0-9-]+$/, "Адрес может содержать только латиницу, цифры и дефис"),
  description: z.string().trim(),
});

export type CategoryFormInput = z.input<typeof categorySchema>;

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }
  return session;
}

export async function createCategory(input: CategoryFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  let category;
  try {
    category = await prisma.category.create({
      data: { ...parsed.data, description: parsed.data.description || null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой адрес (slug) уже используется другой категорией." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "category.create",
    targetType: "Category",
    targetId: category.id,
    summary: `Создал категорию «${category.name}»`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  return { success: true };
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  try {
    await prisma.category.update({
      where: { id },
      data: { ...parsed.data, description: parsed.data.description || null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой адрес (slug) уже используется другой категорией." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "category.update",
    targetType: "Category",
    targetId: id,
    summary: `Изменил категорию «${parsed.data.name}»`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  return { success: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) {
    return { success: false, error: "Категория не найдена." };
  }
  if (category._count.products > 0) {
    return {
      success: false,
      error: "Сначала перенесите товары этой категории в другую — потом можно будет удалить.",
    };
  }

  await prisma.category.delete({ where: { id } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "category.delete",
    targetType: "Category",
    targetId: id,
    summary: `Удалил категорию «${category.name}»`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/catalog");
  return { success: true };
}
