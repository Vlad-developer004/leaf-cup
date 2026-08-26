import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/lib/admin/categories";
import { localizeCategories } from "@/lib/translations";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminProductForm.titleNew") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const categories = await getAdminCategories();
  const localizedCategories = await localizeCategories(categories, locale);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminProductForm.titleNew")}</h1>
      <ProductForm categories={localizedCategories} />
    </div>
  );
}
