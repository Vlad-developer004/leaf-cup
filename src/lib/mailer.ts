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

const ROLE_LABELS: Record<"ADMIN" | "SUPERADMIN", string> = {
  ADMIN: "администратора",
  SUPERADMIN: "суперадминистратора",
};

export async function sendAdminInviteEmail(
  email: string,
  role: "ADMIN" | "SUPERADMIN",
  signInUrl: string,
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Leaf & Cup <onboarding@resend.dev>",
    to: email,
    subject: "Вам открыт доступ в админ-панель — Leaf & Cup",
    html: `
      <p>Вам назначена роль ${ROLE_LABELS[role]} в Leaf & Cup.</p>
      <p>Зарегистрируйтесь или войдите на этот email, чтобы получить доступ: <a href="${signInUrl}">${signInUrl}</a></p>
      <p>Если вы не ожидали этого письма — просто проигнорируйте его.</p>
    `,
  });
}

export async function sendRoleChangedEmail(
  email: string,
  role: "ADMIN" | "SUPERADMIN",
  adminUrl: string,
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Leaf & Cup <onboarding@resend.dev>",
    to: email,
    subject: "Ваша роль в Leaf & Cup изменена",
    html: `
      <p>Вам назначена роль ${ROLE_LABELS[role]} в Leaf & Cup.</p>
      <p>Админ-панель: <a href="${adminUrl}">${adminUrl}</a></p>
    `,
  });
}
