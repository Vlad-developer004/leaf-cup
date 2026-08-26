import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/pagination";
import { Reveal } from "@/components/reveal";
import { ProductsTable } from "@/components/admin/products-table";
import { getAdminProducts, type ProductSortKey } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";
import { localizeCategories, localizeProducts } from "@/lib/translations";
import { cn } from "@/lib/utils";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminProducts.title") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminProductsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string; sort?: string; dir?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const { page: pageParam, category: activeSlug, q, sort: sortParam, dir: dirParam } = await searchParams;

  const sort = (["name", "price", "stock"] as const).includes(sortParam as ProductSortKey)
    ? (sortParam as ProductSortKey)
    : undefined;
  const dir = dirParam === "desc" ? "desc" : "asc";

  const [{ products, page, totalPages }, categories] = await Promise.all([
    getAdminProducts({ page: Number(pageParam) || 1, search: q, categorySlug: activeSlug, sort, dir }),
    getAdminCategories(),
  ]);
  const [localizedCategories, localizedProducts] = await Promise.all([
    localizeCategories(categories, locale),
    localizeProducts(products, locale),
  ]);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (activeSlug) params.set("category", activeSlug);
    if (q) params.set("q", q);
    if (sort) { params.set("sort", sort); params.set("dir", dir); }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  const exportHref = "/api/admin/export/products";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminProducts.title")}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={exportHref}>{t("adminProducts.exportCsv")}</a>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">{t("adminProducts.addProduct")}</Link>
          </Button>
        </div>
      </div>

      <form className="flex gap-2" action="/admin/products">
        {activeSlug && <input type="hidden" name="category" value={activeSlug} />}
        <Input name="q" placeholder={t("adminProducts.searchPlaceholder")} defaultValue={q} className="max-w-sm" />
        <Button type="submit" variant="outline">
          {t("adminProducts.searchBtn")}
        </Button>
      </form>

      <nav className="flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            !activeSlug
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:bg-muted"
          )}
        >
          {t("adminProducts.allCategories")}
        </Link>
        {localizedCategories.map((category) => (
          <Link
            key={category.id}
            href={`/admin/products?category=${category.slug}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activeSlug === category.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <Reveal className="rounded-xl border">
        <ProductsTable
          products={localizedProducts}
          sort={sort}
          dir={dir}
          filters={{ category: activeSlug, q }}
          dict={{
            name: t("adminProducts.name"),
            category: t("adminProducts.category"),
            price: t("adminProducts.price"),
            stock: t("adminProducts.stock"),
            status: t("adminProducts.status"),
            actions: t("adminProducts.actions"),
            empty: t("adminProducts.empty"),
            active: t("adminProducts.active"),
            hidden: t("adminProducts.hidden"),
            edit: t("adminProducts.edit"),
            selectedCount: t("adminProducts.selectedCount"),
            bulkShow: t("adminProducts.bulkShow"),
            bulkHide: t("adminProducts.bulkHide"),
          }}
        />
      </Reveal>

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
