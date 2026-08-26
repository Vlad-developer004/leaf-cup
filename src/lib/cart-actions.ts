"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getOrCreateCart } from "@/lib/cart";
import { validatePromoCode } from "@/lib/promo";

export async function syncCartOnLogin() {
  await getOrCreateCart();
  revalidatePath("/", "layout");
}

export async function addToCart(productId: string, quantity = 1) {
  const cart = await getOrCreateCart();
  const [product, existing] = await Promise.all([
    prisma.product.findUniqueOrThrow({ where: { id: productId }, select: { stock: true } }),
    prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { quantity: true },
    }),
  ]);

  const desired = (existing?.quantity ?? 0) + quantity;
  const clamped = Math.min(desired, product.stock);

  if (clamped <= 0) {
    revalidatePath("/", "layout");
    return { added: false, limited: true };
  }

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: clamped },
    create: { cartId: cart.id, productId, quantity: clamped },
  });
  revalidatePath("/", "layout");
  return { added: true, limited: clamped < desired };
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const cart = await getOrCreateCart();

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
    revalidatePath("/", "layout");
    return { quantity: 0, limited: false };
  }

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { select: { stock: true } } },
  });
  if (!item) {
    revalidatePath("/", "layout");
    return { quantity: 0, limited: false };
  }

  const clamped = Math.min(quantity, item.product.stock);
  await prisma.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity: clamped },
  });
  revalidatePath("/", "layout");
  return { quantity: clamped, limited: clamped < quantity };
}

export async function removeCartItem(itemId: string) {
  const cart = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  revalidatePath("/", "layout");
}

type PromoActionResult =
  | { success: true; code: string; discountAmount: number }
  | { success: false; error: string };

export async function applyPromoCode(rawCode: string): Promise<PromoActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Промокоды доступны только зарегистрированным пользователям — войдите в аккаунт.",
    };
  }

  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    return { success: false, error: "Корзина пуста." };
  }

  const currencies = new Set(cart.items.map((item) => item.product.currency));
  if (currencies.size > 1) {
    return { success: false, error: "В корзине товары в разных валютах — промокод недоступен." };
  }
  const currency = [...currencies][0];
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.priceAmount * item.quantity,
    0,
  );

  const result = await validatePromoCode(rawCode, subtotal, currency, session.user.id);
  if (!result.valid) {
    return { success: false, error: result.error };
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { promoCode: result.code } });
  revalidatePath("/", "layout");
  return { success: true, code: result.code, discountAmount: result.discountAmount };
}

export async function removePromoCode() {
  const cart = await getOrCreateCart();
  await prisma.cart.update({ where: { id: cart.id }, data: { promoCode: null } });
  revalidatePath("/", "layout");
}
