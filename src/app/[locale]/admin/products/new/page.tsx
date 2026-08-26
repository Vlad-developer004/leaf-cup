import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin/categories";

export const metadata: Metadata = {
  title: "Новый товар — Админ-панель — Leaf & Cup",
};

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">Новый товар</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
