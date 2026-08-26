"use client";

import { Link } from "@/components/localized-link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion } from "motion/react";
import { Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function MobileNav({
  categories,
}: {
  categories: { slug: string; name: string }[];
}) {
  const { t } = useTranslation();
  const links = [{ slug: "", name: t("mobileNav.allProducts") }, ...categories];

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label={t("mobileNav.openMenu")}>
          <Menu className="h-5 w-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-4 right-4 left-4 z-50 flex max-h-[calc(100vh-2rem)] flex-col rounded-2xl bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/10 duration-150 outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-top-4 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div className="flex items-center gap-2.5">
              <motion.span
                whileHover={{ scale: 1.08, rotate: -6 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              >
                <Leaf className="h-4 w-4" strokeWidth={2.25} />
              </motion.span>
              <DialogPrimitive.Title className="font-heading text-base font-medium tracking-tight">
                Leaf &amp; Cup
              </DialogPrimitive.Title>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle className="h-7 w-7" />
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon-sm" aria-label={t("mobileNav.closeMenu")}>
                  <X />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>
          <nav className="flex flex-col gap-1 overflow-y-auto p-3">
            {links.map((link, index) => (
              <motion.div
                key={link.slug || "all"}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <DialogPrimitive.Close asChild>
                  <Link
                    href={link.slug ? `/catalog?category=${link.slug}` : "/catalog"}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                      link.slug
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                </DialogPrimitive.Close>
              </motion.div>
            ))}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
