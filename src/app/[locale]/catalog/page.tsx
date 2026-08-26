import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategories } from "@/lib/get-categories";
import { getFavoriteProductIds } from "@/lib/favorites";
import { ProductArt } from "@/components/product-art";
import { Pagination } from "@/components/pagination";
import { TiltCard } from "@/components/tilt-card";
import { Reveal } from "@/components/reveal";
import { FavoriteButton } from "@/components/favorite-button";
import { cn } from "@/lib/utils";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("catalog.title") + " — Leaf & Cup",
  };
}

const PAGE_SIZE = 8;

export default async function CatalogPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { category: activeSlug, page: pageParam } = await searchParams;
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const where = {
    isActive: true,
    ...(activeSlug ? { category: { slug: activeSlug } } : {}),
  };

  const session = await auth();
  const [categories, totalCount, favoriteIds] = await Promise.all([
    getCategories(),
    prisma.product.count({ where }),
    session?.user?.id ? getFavoriteProductIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "asc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const activeCategory = categories.find((c) => c.slug === activeSlug);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (activeSlug) params.set("category", activeSlug);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/catalog${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium tracking-tight md:text-3xl">
          {activeCategory ? activeCategory.name : t("catalog.title")}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory
            ? activeCategory.description
            : t("catalog.description")}
        </p>
      </div>

      <nav className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/catalog"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !activeSlug
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:bg-muted"
          )}
        >
          {t("catalog.allProducts")}
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog?category=${category.slug}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              activeSlug === category.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="text-muted-foreground">{t("catalog.empty")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 0.06}>
              <TiltCard className="overflow-hidden rounded-xl">
                <Link
                  href={`/catalog/${product.slug}`}
                  className="flex flex-col ring-1 ring-foreground/10 transition-shadow hover:shadow-xl"
                >
                  <ProductArt
                    icon={getCategoryIcon(product.category.slug)}
                    images={product.images}
                    alt={product.name}
                    className="aspect-4/3 w-full"
                    overlay={
                      <FavoriteButton
                        productId={product.id}
                        initialFavorited={favoriteIds.has(product.id)}
                        className="absolute top-3 right-3 z-10"
                      />
                    }
                  />
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <span className="text-xs text-muted-foreground">
                      {product.category.name}
                    </span>
                    <h3 className="font-heading font-medium">{product.name}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {product.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-heading font-medium">
                        {formatPrice(product.priceAmount, product.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.stock > 0 ? `${t("catalog.inStock")}${product.stock}` : t("catalog.outOfStock")}
                      </span>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </main>
  );
}
