"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrder, type ShippingInput } from "@/lib/checkout-actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const appearanceByTheme: Record<"light" | "dark", StripeElementsOptions["appearance"]> = {
  light: {
    theme: "stripe",
    variables: {
      colorPrimary: "#8a5638",
      colorBackground: "#fdfcfa",
      colorText: "#3a2f26",
      colorDanger: "#b3392f",
      borderRadius: "8px",
      fontFamily: "var(--font-sans), sans-serif",
    },
  },
  dark: {
    theme: "night",
    variables: {
      colorPrimary: "#c99368",
      colorBackground: "#3a2f27",
      colorText: "#f4ede2",
      colorDanger: "#e2897c",
      borderRadius: "8px",
      fontFamily: "var(--font-sans), sans-serif",
    },
  },
};

const emptyShipping: ShippingInput = {
  fullName: "",
  addressLine: "",
  city: "",
  postalCode: "",
  country: "",
  phone: "",
};

export type CheckoutDict = {
  addressTitle: string;
  defaultAddressNote: string;
  fullNameLabel: string;
  addressLineLabel: string;
  cityLabel: string;
  postalCodeLabel: string;
  countryLabel: string;
  phoneLabel: string;
  submitAddressIdle: string;
  submitAddressPending: string;
  editAddressBtn: string;
  paymentTitle: string;
  payIdle: string;
  payPending: string;
  payError: string;
};

export function CheckoutForm({
  initialShipping,
  dict,
}: {
  initialShipping?: ShippingInput;
  dict: CheckoutDict;
}) {
  const { resolvedTheme } = useTheme();
  const [shipping, setShipping] = useState<ShippingInput>(initialShipping ?? emptyShipping);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createOrder(shipping);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
    });
  }

  if (clientSecret && orderId) {
    const appearance = appearanceByTheme[resolvedTheme === "dark" ? "dark" : "light"];
    return (
      <div className="flex flex-col gap-6">
        <AddressSummary shipping={shipping} onEdit={() => setClientSecret(null)} dict={dict} />
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <PaymentStep orderId={orderId} dict={dict} />
        </Elements>
      </div>
    );
  }

  return (
    <form onSubmit={handleAddressSubmit} className="flex flex-col gap-5 rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-heading font-medium">{dict.addressTitle}</span>
        {initialShipping && (
          <span className="text-xs text-muted-foreground">
            {dict.defaultAddressNote}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="fullName">{dict.fullNameLabel}</Label>
          <Input
            id="fullName"
            required
            value={shipping.fullName}
            onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="addressLine">{dict.addressLineLabel}</Label>
          <Input
            id="addressLine"
            required
            value={shipping.addressLine}
            onChange={(e) => setShipping({ ...shipping, addressLine: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">{dict.cityLabel}</Label>
          <Input
            id="city"
            required
            value={shipping.city}
            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postalCode">{dict.postalCodeLabel}</Label>
          <Input
            id="postalCode"
            required
            value={shipping.postalCode}
            onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="country">{dict.countryLabel}</Label>
          <Input
            id="country"
            required
            value={shipping.country}
            onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">{dict.phoneLabel}</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={shipping.phone}
            onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? dict.submitAddressPending : dict.submitAddressIdle}
      </Button>
    </form>
  );
}

function AddressSummary({ shipping, onEdit, dict }: { shipping: ShippingInput; onEdit: () => void; dict: CheckoutDict }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border p-6">
      <div className="flex flex-col gap-1 text-sm">
        <span className="font-heading font-medium">{dict.addressTitle}</span>
        <span className="text-muted-foreground">
          {shipping.fullName}, {shipping.addressLine}, {shipping.city} {shipping.postalCode},{" "}
          {shipping.country}
        </span>
        <span className="text-muted-foreground">{shipping.phone}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        {dict.editAddressBtn}
      </button>
    </div>
  );
}

function PaymentStep({ orderId, dict }: { orderId: string; dict: CheckoutDict }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? dict.payError);
      setIsPaying(false);
      return;
    }

    router.push(`/checkout/success?order=${orderId}`);
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-5 rounded-xl border p-6">
      <span className="font-heading font-medium">{dict.paymentTitle}</span>
      <PaymentElement />

      <p className="text-xs text-muted-foreground">{t("checkout.demoNotice")}</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full gap-2" disabled={!stripe || isPaying}>
        {isPaying ? (
          dict.payPending
        ) : (
          <>
            <Check /> {dict.payIdle}
          </>
        )}
      </Button>
    </form>
  );
}
