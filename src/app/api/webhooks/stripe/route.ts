import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    await handlePaymentSucceeded(event.data.object);
  } else if (event.type === "payment_intent.payment_failed") {
    await handlePaymentFailed(event.data.object);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { items: true, user: true },
  });
  if (!order || order.status !== "PENDING") return;

  // updateMany + stock: { gte: quantity } вместо простого decrement — не даёт
  // stock уйти в минус, если два заказа на один и тот же товар оплатились
  // почти одновременно (decrement сам по себе такой гонки не видит).
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({
      where: {
        cartId: order.cartId,
        productId: { in: order.items.map((item) => item.productId).filter((id): id is string => !!id) },
      },
    });

    // Промокод "израсходован" только при подтверждённой оплате — если платёж
    // не пройдёт, cart.promoCode остаётся и код можно применить повторно.
    // Запись PromoCodeRedemption — источник истины для правила "один код на
    // пользователя один раз" (@@unique в схеме), timesRedeemed — просто
    // счётчик для админки.
    if (order.promoCode) {
      await tx.cart.update({ where: { id: order.cartId }, data: { promoCode: null } });

      const promo = await tx.promoCode.findUnique({ where: { code: order.promoCode } });
      if (promo) {
        try {
          await tx.promoCodeRedemption.create({
            data: { promoCodeId: promo.id, userId: order.userId, orderId: order.id },
          });
          await tx.promoCode.update({
            where: { id: promo.id },
            data: { timesRedeemed: { increment: 1 } },
          });
        } catch (err) {
          // P2002 — гонка из двух почти одновременно оплаченных заказов с
          // одним и тем же кодом у одного пользователя: запись о погашении
          // уже есть, просто не удваиваем счётчик, остальную часть заказа
          // (статус/склад/корзину) это не должно откатывать.
          if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002")) {
            throw err;
          }
        }
      }
    }
  });

  try {
    await sendOrderConfirmationEmail(order.user.email, order);
  } catch (err) {
    console.error("Failed to send order confirmation email", err);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({ where: { stripePaymentIntentId: paymentIntent.id } });
  if (!order || order.status !== "PENDING") return;

  await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
}
