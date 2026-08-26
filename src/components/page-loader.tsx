"use client";

import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { useTranslation } from "react-i18next";

export function PageLoader() {
  const { t } = useTranslation();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 py-24">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
        >
          <Leaf className="h-5 w-5" strokeWidth={2.25} />
        </motion.span>
      </div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm text-muted-foreground"
      >
        {t("loader.text")}
      </motion.p>
    </main>
  );
}
