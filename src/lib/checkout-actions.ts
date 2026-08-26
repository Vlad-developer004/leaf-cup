"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getCart } from "@/lib/cart";
import { validatePromoCode } from "@/lib/promo";

const shippingSchema = z.object({
  fullName: z.string().trim().min(1, "Укажите имя и фамилию"),
  addressLine: z.string().trim().min(1, "Укажите адрес"),
  city: z.string().trim().min(1, "Укажите город"),
  postalCode: z.string().trim().min(1, "Укажите индекс"),
  country: z.string().trim().min(1, "Укажите страну"),
  phone: z.string().trim().min(1, "Укажите телефон"),
});

export type ShippingInput = z.infer<typeof shippingSchema>;

type CreateOrderResult =
  | { success: true; orderId: string; clientSecret: string }
  | { success: false; error: string };

export async function createOrder(input: ShippingInput): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Нужно войти в аккаунт, чтобы оформить заказ." };
  }

  const parsed = shippingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте адрес доставки." };
  }
  const shipping = parsed.data;

  const cart = await getCart();
  if (cart.items.length === 0) {
    return { success: false, error: "Корзина пуста." };
  }

  const outOfStock = cart.items.find((item) => item.quantity > item.product.stock);
  if (outOfStock) {
    return {
      success: false,
      error: `«${outOfStock.product.name}» — на складе меньше, чем в корзине (доступно: ${outOfStock.product.stock}). Обновите количество в корзине.`,
    };
  }

  const currencies = new Set(cart.items.map((item) => item.product.currency));
  if (currencies.size > 1) {
    return {
      success: false,
      error: "В корзине товары в разных валютах — оформите заказы отдельно для каждой валюты.",
    };
  }
  const currency = [...currencies][0];
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.priceAmount * item.quantity,
    0,
  );

  // Промокод перепроверяется здесь заново (не доверяем тому, что он был
  // валиден в момент применения в корзине) — тот же принцип, что и с
  // проверкой stock выше: между корзиной и оформлением заказа код мог
  // истечь или исчерпать лимит использований.
  let promoCode: string | null = null;
  let discountAmount = 0;
  if (cart.promoCode) {
    const promoResult = await validatePromoCode(cart.promoCode, subtotal, currency, session.user.id);
    if (!promoResult.valid) {
      return {
        success: false,
        error: `Промокод «${cart.promoCode}» больше не действует (${promoResult.error}). Уберите его в корзине и попробуйте снова.`,
      };
    }
    promoCode = promoResult.code;
    discountAmount = promoResult.discountAmount;
  }

  const totalAmount = subtotal - discountAmount;
  if (totalAmount <= 0) {
    return { success: false, error: "Скидка по промокоду не может полностью покрыть стоимость заказа." };
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      cartId: cart.id,
      totalAmount,
      currency,
      promoCode,
      discountAmount,
      shippingFullName: shipping.fullName,
      shippingAddressLine: shipping.addressLine,
      shippingCity: shipping.city,
      shippingPostalCode: shipping.postalCode,
      shippingCountry: shipping.country,
      shippingPhone: shipping.phone,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          priceAmount: item.product.priceAmount,
          quantity: item.quantity,
        })),
      },
    },
  });

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: totalAmount,
    currency: currency.toLowerCase(),
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!paymentIntent.client_secret) {
    return { success: false, error: "Не удалось создать платёж. Попробуйте ещё раз." };
  }

  return { success: true, orderId: order.id, clientSecret: paymentIntent.client_secret };
}
