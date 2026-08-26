"use client";

import { Link } from "@/components/localized-link";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";

export function LogoMark({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <motion.span
        whileHover={{ scale: 1.08, rotate: -6 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
      >
        <Leaf className="h-5 w-5" strokeWidth={2.25} />
      </motion.span>
      {showWordmark && (
        <span className="hidden font-heading text-lg font-medium tracking-tight whitespace-nowrap sm:inline">
          Leaf &amp; Cup
        </span>
      )}
    </Link>
  );
}
