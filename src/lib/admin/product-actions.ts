"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin/audit-log";

const productSchema = z.object({
  name: z.string().trim().min(1, "Укажите название"),
  slug: z
    .string()
    .trim()
    .min(1, "Укажите адрес (slug)")
    .regex(/^[a-z0-9-]+$/, "Адрес может содержать только латиницу, цифры и дефис"),
  description: z.string().trim().min(1, "Укажите описание"),
  priceEuros: z.coerce.number().positive("Цена должна быть больше нуля"),
  currency: z.string().trim().min(1, "Укажите валюту"),
  stock: z.coerce.number().int("Остаток должен быть целым числом").min(0, "Остаток не может быть отрицательным"),
  categoryId: z.string().trim().min(1, "Выберите категорию"),
  imagesText: z.string(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

export type ProductFormInput = z.input<typeof productSchema>;

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }
  return session;
}

function toProductData(parsed: z.infer<typeof productSchema>) {
  return {
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    priceAmount: Math.round(parsed.priceEuros * 100),
    currency: parsed.currency,
    stock: parsed.stock,
    categoryId: parsed.categoryId,
    images: parsed.imagesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    isFeatured: parsed.isFeatured,
    isActive: parsed.isActive,
  };
}

export async function createProduct(input: ProductFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  let product;
  try {
    product = await prisma.product.create({ data: toProductData(parsed.data) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой адрес (slug) уже используется другим товаром." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "product.create",
    targetType: "Product",
    targetId: product.id,
    summary: `Создал товар «${product.name}»`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { success: true };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  try {
    await prisma.product.update({ where: { id }, data: toProductData(parsed.data) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой адрес (slug) уже используется другим товаром." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "product.update",
    targetType: "Product",
    targetId: id,
    summary: `Изменил товар «${parsed.data.name}»`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${parsed.data.slug}`);
  return { success: true };
}

export async function setProductActive(id: string, isActive: boolean) {
  const session = await requireAdmin();
  const product = await prisma.product.update({ where: { id }, data: { isActive } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: isActive ? "product.show" : "product.hide",
    targetType: "Product",
    targetId: id,
    summary: `${isActive ? "Показал" : "Скрыл"} товар «${product.name}»`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
}


export async function bulkSetProductActive(ids: string[], isActive: boolean): Promise<ActionResult> {
  const session = await requireAdmin();
  if (ids.length === 0) {
    return { success: false, error: "Ничего не выбрано." };
  }

  await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: isActive ? "product.bulk_show" : "product.bulk_hide",
    targetType: "Product",
    summary: `${isActive ? "Показал" : "Скрыл"} товары (${ids.length} шт.)`,
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { success: true };
}
