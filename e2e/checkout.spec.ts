import { test, expect } from "@playwright/test";



test("guest can browse, add to cart, register, and pay for an order", async ({ page }) => {
  const uniqueEmail = `e2e-${Date.now()}@example.com`;

  await page.goto("/catalog/tea-sencha");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "В корзину" }).click();
  await expect(page.getByRole("button", { name: "Добавлено" })).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText("Сенча").first()).toBeVisible({ timeout: 10_000 });

  await page.goto("/register");
  await page.getByLabel("Имя").fill("E2E");
  await page.getByLabel("Фамилия").fill("Test");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.locator("#password").fill("E2ETestPassword123!");
  await page.locator("#terms").click();
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();

  await page.waitForURL("/", { timeout: 15_000 });

  await page.goto("/checkout");
  await page.locator("#fullName").fill("E2E Test");
  await page.locator("#addressLine").fill("Teststrasse 1");
  await page.locator("#city").fill("Berlin");
  await page.locator("#postalCode").fill("10115");
  await page.locator("#country").fill("Germany");
  await page.locator("#phone").fill("+491234567890");
  await page.getByRole("button", { name: "Продолжить к оплате" }).click();

  const paymentFrame = page.frameLocator('iframe[title="Защищенное окно для ввода платежных данных"]');
  await paymentFrame.getByText("Карта", { exact: true }).click({ timeout: 15_000 });
  await paymentFrame.locator("#payment-numberInput").fill("4242424242424242");
  await paymentFrame.locator("#payment-expiryInput").fill("12/34");
  await paymentFrame.locator("#payment-cvcInput").fill("123");

  await page.getByRole("button", { name: "Оплатить" }).click();

  await page.waitForURL(/\/checkout\/success/, { timeout: 20_000 });
  await expect(page.getByText("Заказ оформлен")).toBeVisible();
});
