"use client";

import { Link } from "@/components/localized-link";
import { ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function CartLink({
  count,
  size = "icon",
}: {
  count: number;
  size?: "icon" | "icon-lg";
}) {
  const { t } = useTranslation();
  return (
    <Button asChild variant="secondary" size={size} className="relative" aria-label={t("cartLink.ariaLabel")}>
      <Link href="/cart" id="cart-icon">
        <ShoppingCart />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
            >
              {count > 99 ? "99+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </Button>
  );
}
