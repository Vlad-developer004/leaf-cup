import "server-only";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import type { PromoCode } from "@/generated/prisma/client";

export type PromoValidation =
  | { valid: true; code: string; discountAmount: number }
  | { valid: false; error: string };

export function calculateDiscount(promo: Pick<PromoCode, "type" | "value">, subtotal: number) {
  if (promo.type === "PERCENT") {
    return Math.min(subtotal, Math.round((subtotal * promo.value) / 100));
  }
  return Math.min(subtotal, promo.value);
}

// Проверяет промокод заново на каждый вызов (не доверяет ранее сохранённому
// результату) — код мог истечь, исчерпать лимит использований или перестать
// действовать в админке между применением в корзине и оформлением заказа.
// Промокоды доступны только вошедшим пользователям (userId === null всегда
// невалиден) — и каждый пользователь может использовать конкретный код
// только один раз, это проверяется по PromoCodeRedemption.
export async function validatePromoCode(
  rawCode: string,
  subtotal: number,
  currency: string,
  userId: string | null,
): Promise<PromoValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, error: "Введите промокод." };
  }
  if (!userId) {
    return {
      valid: false,
      error: "Промокоды доступны только зарегистрированным пользователям — войдите в аккаунт.",
    };
  }

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) {
    return { valid: false, error: "Промокод не найден или больше не действует." };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { valid: false, error: "Срок действия промокода истёк." };
  }
  if (promo.maxRedemptions !== null && promo.timesRedeemed >= promo.maxRedemptions) {
    return { valid: false, error: "Лимит использований этого промокода исчерпан." };
  }
  if (promo.currency && promo.currency !== currency) {
    return { valid: false, error: "Этот промокод не действует для валюты вашей корзины." };
  }
  if (promo.minSubtotal !== null && subtotal < promo.minSubtotal) {
    return {
      valid: false,
      error: `Промокод действует при заказе от ${formatPrice(promo.minSubtotal, currency)}.`,
    };
  }

  const alreadyUsed = await prisma.promoCodeRedemption.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
  });
  if (alreadyUsed) {
    return { valid: false, error: "Вы уже использовали этот промокод." };
  }

  return { valid: true, code: promo.code, discountAmount: calculateDiscount(promo, subtotal) };
}

export type AppliedPromo =
  | { code: string; discountAmount: number; invalid: false }
  | { code: string; discountAmount: 0; invalid: true; error: string };

// Для отображения в корзине: если код был применён, но с тех пор перестал
// действовать, не роняем страницу — показываем предупреждение и позволяем
// его убрать, скидка при этом не учитывается в итоге.
export async function getAppliedPromo(
  storedCode: string | null,
  subtotal: number,
  currency: string,
  userId: string | null,
): Promise<AppliedPromo | null> {
  if (!storedCode) return null;

  const result = await validatePromoCode(storedCode, subtotal, currency, userId);
  if (!result.valid) {
    return { code: storedCode, discountAmount: 0, invalid: true, error: result.error };
  }
  return { code: result.code, discountAmount: result.discountAmount, invalid: false };
}
