import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart-item-row";
import { PromoCodeForm } from "@/components/promo-code-form";
import { auth } from "@/auth";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getAppliedPromo } from "@/lib/promo";
import { localizeProducts } from "@/lib/translations";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("cart.title") + " — Leaf & Cup",
  };
}

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const [rawCart, session] = await Promise.all([getCart(), auth()]);
  const userId = session?.user?.id ?? null;
  const localizedProducts = await localizeProducts(
    rawCart.items.map((item) => item.product),
    locale
  );
  const cart = {
    ...rawCart,
    items: rawCart.items.map((item, index) => ({ ...item, product: localizedProducts[index] })),
  };

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("cart.emptyTitle")}</h1>
        <p className="text-muted-foreground">{t("cart.emptyDesc")}</p>
        <Button asChild size="lg" className="mt-2 px-6">
          <Link href="/catalog">{t("cart.toCatalogBtn")}</Link>
        </Button>
      </main>
    );
  }

  const totalsByCurrency = new Map<string, number>();
  for (const item of cart.items) {
    const currency = item.product.currency;
    const current = totalsByCurrency.get(currency) ?? 0;
    totalsByCurrency.set(currency, current + item.product.priceAmount * item.quantity);
  }

  const currencies = [...totalsByCurrency.keys()];
  const singleCurrency = currencies.length === 1 ? currencies[0] : null;
  const subtotal = singleCurrency ? totalsByCurrency.get(singleCurrency)! : 0;
  const appliedPromo = singleCurrency
    ? await getAppliedPromo(cart.promoCode, subtotal, singleCurrency, userId)
    : null;
  const discountAmount = appliedPromo && !appliedPromo.invalid ? appliedPromo.discountAmount : 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("cart.title")}
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
        <div className="divide-y">
          {cart.items.map((item) => (
            <CartItemRow key={item.id} item={item} dict={{
              decreaseLabel: t("cart.decreaseLabel"),
              increaseLabel: t("cart.increaseLabel"),
              outOfStock: t("cart.outOfStock"),
              removeLabel: t("cart.removeLabel"),
            }} />
          ))}
        </div>

        <div className="flex h-fit flex-col gap-5 rounded-xl border p-6">
          <span className="font-heading font-medium">{t("cart.orderSummary")}</span>

          {singleCurrency && userId && (
            <PromoCodeForm
              appliedPromo={appliedPromo}
              dict={{
                placeholder: t("cart.promoPlaceholder"),
                applyBtn: t("cart.applyPromo"),
                applyingBtn: t("cart.applyingPromo"),
                removeLabel: t("cart.removePromo"),
                invalidNotice: appliedPromo && appliedPromo.invalid ? appliedPromo.error : "",
              }}
            />
          )}

          {singleCurrency && !userId && (
            <div className="border-y py-3 text-xs text-muted-foreground">
              {t("cart.promoLoginRequired")}{" "}
              <Link href="/sign-in?callbackUrl=/cart" className="font-medium text-foreground underline-offset-4 hover:underline">
                {t("cart.promoLoginLink")}
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm">
            {[...totalsByCurrency.entries()].map(([currency, amount]) => (
              <div key={currency} className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span className="font-medium">{formatPrice(amount, currency)}</span>
              </div>
            ))}
            {discountAmount > 0 && singleCurrency && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t("cart.discount")}</span>
                <span className="font-medium text-primary">
                  −{formatPrice(discountAmount, singleCurrency)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("cart.delivery")}</span>
              <span className="font-medium">{t("cart.freeDelivery")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-heading font-medium">{t("cart.total")}</span>
            <span className="font-heading text-lg font-medium">
              {singleCurrency
                ? formatPrice(subtotal - discountAmount, singleCurrency)
                : [...totalsByCurrency.entries()]
                    .map(([currency, amount]) => formatPrice(amount, currency))
                    .join(" + ")}
            </span>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">{t("cart.checkoutBtn")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
