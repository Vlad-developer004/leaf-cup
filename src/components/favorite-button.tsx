"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/lib/favorite-actions";

export function FavoriteButton({
  productId,
  initialFavorited,
  className,
}: {
  productId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const next = !favorited;
    setFavorited(next);

    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (!result.success) {
        setFavorited(!next);
        if (result.requiresAuth) {
          router.push(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
        }
        return;
      }
      setFavorited(result.favorited);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={favorited}
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-90 disabled:pointer-events-none",
        className
      )}
    >
      <motion.span
        key={favorited ? "on" : "off"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="flex"
      >
        <Heart
          className={cn("h-4 w-4", favorited && "fill-primary text-primary")}
          strokeWidth={1.75}
        />
      </motion.span>
    </button>
  );
}
