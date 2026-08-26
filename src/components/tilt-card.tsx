"use client";

import type { ReactNode } from "react";
import { motion, useMotionTemplate, useSpring } from "motion/react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const rotateX = useSpring(0, { stiffness: 300, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 20 });
  const scale = useSpring(1, { stiffness: 300, damping: 20 });
  const glowX = useSpring(50, { stiffness: 300, damping: 30 });
  const glowY = useSpring(50, { stiffness: 300, damping: 30 });
  const glow = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, color-mix(in oklch, var(--primary), transparent 82%), transparent 70%)`;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set((0.5 - py) * 10);
    glowX.set(px * 100);
    glowY.set(py * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => scale.set(1.02)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 800 }}
      className={cn("group relative", className)}
    >
      <motion.div
        aria-hidden
        style={{ backgroundImage: glow }}
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      {children}
    </motion.div>
  );
}
