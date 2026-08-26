import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin/categories";
import { getAdminProductById } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Изменить товар — Админ-панель — Leaf & Cup",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        Изменить товар
      </h1>
      <ProductForm
        categories={categories}
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
