import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin/categories";
import { getAdminProductById } from "@/lib/admin/products";
import { localizeCategories } from "@/lib/translations";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminProductForm.titleEdit") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);
  if (!product) notFound();
  const localizedCategories = await localizeCategories(categories, locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        {t("adminProductForm.titleEdit")}
      </h1>
      <ProductForm
        categories={localizedCategories}
        productId={product.id}
        initialValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceEuros: (product.priceAmount / 100).toString(),
          currency: product.currency,
          stock: product.stock.toString(),
          categoryId: product.categoryId,
          imagesText: product.images.join("\n"),
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
