import "server-only";
import { prisma } from "@/lib/prisma";
import { i18nConfig } from "@/i18nConfig";

type EntityType = "PRODUCT" | "CATEGORY";
type TranslationEntry = { name?: string; description?: string };

async function getTranslationsMap(
  entityType: EntityType,
  entityIds: string[],
  locale: string
): Promise<Map<string, TranslationEntry>> {
  if (entityIds.length === 0) return new Map();

  const rows = await prisma.translation.findMany({
    where: { entityType, entityId: { in: entityIds }, locale },
  });

  const map = new Map<string, TranslationEntry>();
  for (const row of rows) {
    const entry = map.get(row.entityId) ?? {};
    if (row.field === "NAME") entry.name = row.value;
    if (row.field === "DESCRIPTION") entry.description = row.value;
    map.set(row.entityId, entry);
  }
  return map;
}

type LocalizableCategory = { id: string; name: string; description: string | null };
type LocalizableProduct<C extends LocalizableCategory | undefined> = {
  id: string;
  name: string;
  description: string;
  category: C;
};

function isDefaultLocale(locale: string) {
  return locale === i18nConfig.defaultLocale;
}

export async function localizeCategories<T extends LocalizableCategory>(
  categories: T[],
  locale: string
): Promise<T[]> {
  if (isDefaultLocale(locale)) return categories;

  const map = await getTranslationsMap(
    "CATEGORY",
    categories.map((c) => c.id),
    locale
  );

  return categories.map((category) => {
    const t = map.get(category.id);
    return t
      ? { ...category, name: t.name ?? category.name, description: t.description ?? category.description }
      : category;
  });
}

export async function localizeProducts<C extends LocalizableCategory | undefined, T extends LocalizableProduct<C>>(
  products: T[],
  locale: string
): Promise<T[]> {
  if (isDefaultLocale(locale) || products.length === 0) return products;

  const categoryIds = [...new Set(products.map((p) => p.category?.id).filter((id): id is string => !!id))];

  const [productMap, categoryMap] = await Promise.all([
    getTranslationsMap(
      "PRODUCT",
      products.map((p) => p.id),
      locale
    ),
    getTranslationsMap("CATEGORY", categoryIds, locale),
  ]);

  return products.map((product) => {
    const pt = productMap.get(product.id);
    const ct = product.category ? categoryMap.get(product.category.id) : undefined;

    if (!pt && !ct) return product;

    return {
      ...product,
      name: pt?.name ?? product.name,
      description: pt?.description ?? product.description,
      ...(product.category
        ? {
            category: {
              ...product.category,
              name: ct?.name ?? product.category.name,
              description: ct?.description ?? product.category.description,
            },
          }
        : {}),
    };
  });
}

export async function localizeProduct<C extends LocalizableCategory | undefined, T extends LocalizableProduct<C>>(
  product: T,
  locale: string
): Promise<T> {
  const [localized] = await localizeProducts([product], locale);
  return localized;
}
