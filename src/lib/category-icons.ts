import { Coffee, CookingPot, Gift, Leaf, Sprout, Wrench, type LucideIcon } from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  tea: Leaf,
  cups: Coffee,
  teapots: CookingPot,
  sets: Gift,
  accessories: Wrench,
  matcha: Sprout,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return categoryIcons[slug] ?? Leaf;
}
