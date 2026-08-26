"use client";

import { Link } from "@/components/localized-link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductArt } from "@/components/product-art";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart-actions";

export type CartItemDict = {
  decreaseLabel: string;
  increaseLabel: string;
  outOfStock: string;
  removeLabel: string;
};

export function CartItemRow({
  item,
  dict,
}: {
  item: {
    id: string;
    quantity: number;
    product: {
      slug: string;
      name: string;
      priceAmount: number;
      currency: string;
      stock: number;
      images: string[];
      category: { slug: string; name: string };
    };
  };
  dict: CartItemDict;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [limited, setLimited] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  function changeQuantity(quantity: number) {
    startTransition(async () => {
      const result = await updateCartItemQuantity(item.id, quantity);
      setLimited(result.limited);
      router.refresh();
    });
  }

  function remove() {
    setIsRemoving(true);
  }

  useEffect(() => {
    if (!isRemoving) return;
    const timeout = setTimeout(() => {
      startTransition(async () => {
        await removeCartItem(item.id);
        router.refresh();
      });
    }, 220);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoving]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={
        isRemoving
          ? { opacity: 0, x: -24, scale: 0.97 }
          : { opacity: 1, y: 0, x: 0, scale: 1 }
      }
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 py-6"
    >
      <Link href={`/catalog/${item.product.slug}`} className="shrink-0">
        <ProductArt
          icon={getCategoryIcon(item.product.category.slug)}
          images={item.product.images}
          alt={item.product.name}
          sizes="96px"
          className="h-24 w-24 rounded-lg"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-xs text-muted-foreground">{item.product.category.name}</span>
        <Link
          href={`/catalog/${item.product.slug}`}
          className="truncate font-heading font-medium hover:underline"
        >
          {item.product.name}
        </Link>
        <span className="text-sm text-muted-foreground">
          {formatPrice(item.product.priceAmount, item.product.currency)}
        </span>
        <div className="mt-auto flex items-center">
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending || isRemoving}
              onClick={() => changeQuantity(item.quantity - 1)}
              aria-label={dict.decreaseLabel}
            >
              <Minus />
            </Button>
            <span className="w-6 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isPending || isRemoving || item.quantity >= item.product.stock}
              onClick={() => changeQuantity(item.quantity + 1)}
              aria-label={dict.increaseLabel}
            >
              <Plus />
            </Button>
          </div>
        </div>
        {limited && (
          <span className="text-xs text-muted-foreground">
            {dict.outOfStock}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-heading font-medium whitespace-nowrap">
          {formatPrice(item.product.priceAmount * item.quantity, item.product.currency)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isPending || isRemoving}
          onClick={remove}
          aria-label={dict.removeLabel}
          className="text-muted-foreground"
        >
          <X />
        </Button>
      </div>
    </motion.div>
  );
}
