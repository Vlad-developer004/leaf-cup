"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin/audit-log";

const promoCodeSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Укажите код")
      .regex(/^[A-Za-z0-9-]+$/, "Код может содержать только латиницу, цифры и дефис")
      .transform((value) => value.toUpperCase()),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.coerce.number().positive("Значение должно быть больше нуля"),
    currency: z.string().trim(),
    isActive: z.boolean(),
    expiresAt: z.string(),
    minSubtotalEuros: z.string(),
    maxRedemptions: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENT" && (data.value < 1 || data.value > 100)) {
      ctx.addIssue({ code: "custom", message: "Процент должен быть от 1 до 100", path: ["value"] });
    }
    if (data.type === "FIXED" && !data.currency) {
      ctx.addIssue({ code: "custom", message: "Укажите валюту для фиксированной скидки", path: ["currency"] });
    }
  });

export type PromoCodeFormInput = z.input<typeof promoCodeSchema>;

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }
  return session;
}

function toPromoCodeData(parsed: z.infer<typeof promoCodeSchema>) {
  return {
    code: parsed.code,
    type: parsed.type,
    value: parsed.type === "PERCENT" ? Math.round(parsed.value) : Math.round(parsed.value * 100),
    currency: parsed.type === "FIXED" ? parsed.currency : null,
    isActive: parsed.isActive,
    expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
    minSubtotal: parsed.minSubtotalEuros ? Math.round(Number(parsed.minSubtotalEuros) * 100) : null,
    maxRedemptions: parsed.maxRedemptions ? Math.round(Number(parsed.maxRedemptions)) : null,
  };
}

export async function createPromoCode(input: PromoCodeFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = promoCodeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  let promoCode;
  try {
    promoCode = await prisma.promoCode.create({ data: toPromoCodeData(parsed.data) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой код уже используется." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "promocode.create",
    targetType: "PromoCode",
    targetId: promoCode.id,
    summary: `Создал промокод «${promoCode.code}»`,
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function updatePromoCode(id: string, input: PromoCodeFormInput): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = promoCodeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте поля формы." };
  }

  try {
    await prisma.promoCode.update({ where: { id }, data: toPromoCodeData(parsed.data) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "Такой код уже используется." };
    }
    throw error;
  }

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "promocode.update",
    targetType: "PromoCode",
    targetId: id,
    summary: `Изменил промокод «${parsed.data.code}»`,
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function setPromoCodeActive(id: string, isActive: boolean) {
  const session = await requireAdmin();
  const promoCode = await prisma.promoCode.update({ where: { id }, data: { isActive } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: isActive ? "promocode.activate" : "promocode.deactivate",
    targetType: "PromoCode",
    targetId: id,
    summary: `${isActive ? "Активировал" : "Деактивировал"} промокод «${promoCode.code}»`,
  });

  revalidatePath("/admin/promo-codes");
}

export async function deletePromoCode(id: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const promoCode = await prisma.promoCode.delete({ where: { id } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "promocode.delete",
    targetType: "PromoCode",
    targetId: id,
    summary: `Удалил промокод «${promoCode.code}»`,
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}
