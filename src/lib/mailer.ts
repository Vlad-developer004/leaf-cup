import { Resend } from "resend";
import { formatPrice } from "@/lib/format";

export async function sendOrderConfirmationEmail(
  email: string,
  order: {
    id: string;
    totalAmount: number;
    currency: string;
    items: { productName: string; priceAmount: number; quantity: number }[];
  },
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemsHtml = order.items
    .map(
      (item) =>
        `<li>${item.productName} × ${item.quantity} — ${formatPrice(item.priceAmount * item.quantity, order.currency)}</li>`,
    )
    .join("");

  await resend.emails.send({
    from: "Leaf & Cup <onboarding@resend.dev>",
    to: email,
    subject: "Ваш заказ оплачен — Leaf & Cup",
    html: `
      <p>Спасибо за заказ! Оплата прошла успешно.</p>
      <p>Номер заказа: ${order.id}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Итого: ${formatPrice(order.totalAmount, order.currency)}</strong></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Leaf & Cup <onboarding@resend.dev>",
    to: email,
    subject: "Восстановление пароля — Leaf & Cup",
    html: `
      <p>Вы запросили сброс пароля для аккаунта на Leaf & Cup.</p>
      <p><a href="${resetUrl}">Придумать новый пароль</a></p>
      <p>Ссылка действительна 1 час. Если это были не вы — просто проигнорируйте это письмо.</p>
    `,
  });
}
