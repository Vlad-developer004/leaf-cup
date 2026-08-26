"use client";

import { useEffect } from "react";
import { Link } from "@/components/localized-link";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

type OrderView = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  promoCode: string | null;
  discountAmount: number;
  items: { id: string; productName: string; priceAmount: number; quantity: number }[];
};

export type SuccessDict = {
  successTitle: string;
  successDesc: string;
  pendingTitle: string;
  pendingDesc: string;
  failedTitle: string;
  failedDesc: string;
  retryBtn: string;
  total: string;
  discount: string;
  homeBtn: string;
  successDemoNote: string;
};

export function SuccessView({ order, dict }: { order: OrderView; dict: SuccessDict }) {
  const router = useRouter();

  useEffect(() => {
    if (order.status !== "PENDING") return;
    const timeout = setTimeout(() => router.refresh(), 2000);
    return () => clearTimeout(timeout);
  }, [order.status, router]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      {order.status === "PAID" && (
        <>
          <CircleCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
          <h1 className="font-heading text-2xl font-medium tracking-tight">{dict.successTitle}</h1>
          <p className="text-muted-foreground">{dict.successDesc}{order.id}.</p>
          <p className="max-w-sm text-xs text-muted-foreground">{dict.successDemoNote}</p>
        </>
      )}

      {order.status === "PENDING" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" strokeWidth={1.5} />
          <h1 className="font-heading text-2xl font-medium tracking-tight">{dict.pendingTitle}</h1>
          <p className="text-muted-foreground">{dict.pendingDesc}</p>
        </>
      )}

      {order.status === "FAILED" && (
        <>
          <CircleX className="h-12 w-12 text-destructive" strokeWidth={1.5} />
          <h1 className="font-heading text-2xl font-medium tracking-tight">{dict.failedTitle}</h1>
          <p className="text-muted-foreground">{dict.failedDesc}</p>
          <Button asChild size="lg" className="mt-2 px-6">
            <Link href="/checkout">{dict.retryBtn}</Link>
          </Button>
        </>
      )}

      {order.status === "PAID" && (
        <div className="mt-2 flex w-full flex-col gap-2 rounded-xl border p-6 text-left text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.priceAmount * item.quantity, order.currency)}
              </span>
            </div>
          ))}
          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">
                {dict.discount} ({order.promoCode})
              </span>
              <span className="font-medium text-primary">
                −{formatPrice(order.discountAmount, order.currency)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-2">
            <span className="font-heading font-medium">{dict.total}</span>
            <span className="font-heading font-medium">{formatPrice(order.totalAmount, order.currency)}</span>
          </div>
        </div>
      )}

      <Button asChild variant="outline" size="lg" className="mt-2 px-6">
        <Link href="/">{dict.homeBtn}</Link>
      </Button>
    </main>
  );
}
