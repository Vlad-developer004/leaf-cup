"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const mainY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const accentY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary),transparent_78%),transparent)] blur-2xl"
      />

      <motion.div
        style={{ y: mainY }}
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-secondary shadow-xl"
      >
        <Image
          src="/products/teapot-tetsubin.avif"
          alt="Чугунный заварник тэцубин"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </motion.div>

      <motion.div
        style={{ y: accentY }}
        className="absolute -bottom-8 -left-6 h-32 w-32 sm:h-44 sm:w-44"
      >
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full overflow-hidden rounded-xl border-4 border-background shadow-lg"
        >
          <div className="relative h-full w-full">
            <Image
              src="/products/bi-luo-chun.avif"
              alt="Билочунь, зелёный чай"
              fill
              sizes="176px"
              className="object-cover"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
