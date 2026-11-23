import { getCachedCategories } from "@/lib/catalog-cache";

export function getCategories(locale: string) {
  return getCachedCategories(locale);
}
