"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart-actions";
import { dispatchFlyToCart } from "@/components/fly-to-cart";

export function AddToCartButton({
  productId,
  stock,
  imageUrl,
}: {
  productId: string;
  stock: number;
  imageUrl?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "added" | "limited">("idle");

  if (stock <= 0) {
    return (
      <Button size="lg" className="px-6" disabled>
        {t("catalog.outOfStock")}
      </Button>
    );
  }

  function handleClick() {
    if (imageUrl) {
      const source = document.getElementById("product-hero-image");
      if (source) dispatchFlyToCart(imageUrl, source);
    }
    startTransition(async () => {
      const result = await addToCart(productId);
      setStatus(result.limited ? "limited" : "added");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" className="gap-2 overflow-hidden px-6" onClick={handleClick} disabled={isPending}>
        <AnimatePresence mode="popLayout" initial={false}>
          {status === "added" ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <motion.span
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
              >
                <Check className="size-4" />
              </motion.span>
              {t("product.addToCartAdded")}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {t("product.addToCartIdle")}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
      {status === "limited" && (
        <span className="text-xs text-muted-foreground">
          {t("product.addToCartLimitedNote")}
        </span>
      )}
    </div>
  );
}
