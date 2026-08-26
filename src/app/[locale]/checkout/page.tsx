import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getAppliedPromo } from "@/lib/promo";
import { localizeProducts } from "@/lib/translations";
import { CheckoutForm } from "./checkout-form";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("checkout.metaTitle") + " — Leaf & Cup",
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=/checkout");
  }

  const [rawCart, defaultAddress] = await Promise.all([
    getCart(),
    prisma.address.findFirst({
      where: { userId: session.user.id, isDefault: true },
    }),
  ]);
  if (rawCart.items.length === 0) {
    redirect("/cart");
  }
  const localizedProducts = await localizeProducts(
    rawCart.items.map((item) => item.product),
    locale
  );
  const cart = {
    ...rawCart,
    items: rawCart.items.map((item, index) => ({ ...item, product: localizedProducts[index] })),
  };

  const currencies = new Set(cart.items.map((item) => item.product.currency));
  const mixedCurrencies = currencies.size > 1;
  const currency = [...currencies][0];
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.priceAmount * item.quantity,
    0,
  );
  const appliedPromo = !mixedCurrencies
    ? await getAppliedPromo(cart.promoCode, subtotal, currency, session.user.id)
    : null;
  const discountAmount = appliedPromo && !appliedPromo.invalid ? appliedPromo.discountAmount : 0;
  const totalAmount = subtotal - discountAmount;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <h1 className="mb-4 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("checkout.title")}
      </h1>

      <div className="mb-8 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        {t("checkout.demoNotice")}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
        {mixedCurrencies ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {t("checkout.mixedCurrenciesError")}
          </div>
        ) : (
          <CheckoutForm
            initialShipping={
              defaultAddress
                ? {
                    fullName: defaultAddress.fullName,
                    addressLine: defaultAddress.addressLine,
                    city: defaultAddress.city,
                    postalCode: defaultAddress.postalCode,
                    country: defaultAddress.country,
                    phone: defaultAddress.phone,
                  }
                : undefined
            }
            dict={{
              addressTitle: t("checkout.addressTitle"),
              defaultAddressNote: t("checkout.defaultAddressNote"),
              fullNameLabel: t("checkout.fullNameLabel"),
              addressLineLabel: t("checkout.addressLineLabel"),
              cityLabel: t("checkout.cityLabel"),
              postalCodeLabel: t("checkout.postalCodeLabel"),
              countryLabel: t("checkout.countryLabel"),
              phoneLabel: t("checkout.phoneLabel"),
              submitAddressIdle: t("checkout.submitAddressIdle"),
              submitAddressPending: t("checkout.submitAddressPending"),
              editAddressBtn: t("checkout.editAddressBtn"),
              paymentTitle: t("checkout.paymentTitle"),
              payIdle: t("checkout.payIdle"),
              payPending: t("checkout.payPending"),
              payError: t("checkout.payError"),
            }}
          />
        )}

        <div className="flex h-fit flex-col gap-5 rounded-xl border p-6">
          <span className="font-heading font-medium">{t("checkout.orderSummary")}</span>

          <div className="flex flex-col gap-3 divide-y">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 pt-3 first:pt-0 text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.product.priceAmount * item.quantity, item.product.currency)}
                </span>
              </div>
            ))}
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">
                {t("cart.discount")} ({appliedPromo?.code})
              </span>
              <span className="font-medium text-primary">−{formatPrice(discountAmount, currency)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-heading font-medium">{t("checkout.total")}</span>
            <span className="font-heading text-lg font-medium">{formatPrice(totalAmount, currency)}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
