import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Reveal } from "@/components/reveal";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { getAdminProducts } from "@/lib/admin/products";
import { getAdminCategories } from "@/lib/admin/categories";
import { formatPrice } from "@/lib/format";
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
  searchParams: Promise<{ page?: string; category?: string; q?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const { page: pageParam, category: activeSlug, q } = await searchParams;

  const [{ products, page, totalPages }, categories] = await Promise.all([
    getAdminProducts({ page: Number(pageParam) || 1, search: q, categorySlug: activeSlug }),
    getAdminCategories(),
  ]);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (activeSlug) params.set("category", activeSlug);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminProducts.title")}</h1>
        <Button asChild>
          <Link href="/admin/products/new">{t("adminProducts.addProduct")}</Link>
        </Button>
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
        {categories.map((category) => (
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminProducts.name")}</TableHead>
              <TableHead>{t("adminProducts.category")}</TableHead>
              <TableHead>{t("adminProducts.price")}</TableHead>
              <TableHead>{t("adminProducts.stock")}</TableHead>
              <TableHead>{t("adminProducts.status")}</TableHead>
              <TableHead className="text-right">{t("adminProducts.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {t("adminProducts.empty")}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                  <TableCell>{formatPrice(product.priceAmount, product.currency)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? t("adminProducts.active") : t("adminProducts.hidden")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        {t("adminProducts.edit")}
                      </Link>
                      <ProductRowActions productId={product.id} isActive={product.isActive} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Reveal>

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
