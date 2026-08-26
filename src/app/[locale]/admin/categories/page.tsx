import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { getAdminCategories } from "@/lib/admin/categories";
import { localizeCategories } from "@/lib/translations";
import { Reveal } from "@/components/reveal";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("admin.categoriesTitle") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminCategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const categories = await getAdminCategories();

  const localizedCategories = await localizeCategories(categories, locale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("admin.categoriesTitle")}</h1>
        <CategoryFormDialog trigger={<Button>{t("admin.addCategory")}</Button>} />
      </div>

      <Reveal className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.name")}</TableHead>
              <TableHead>{t("admin.slug")}</TableHead>
              <TableHead>{t("admin.productsCount")}</TableHead>
              <TableHead className="text-right">{t("admin.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{localizedCategories[index].name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell>{category._count.products}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CategoryFormDialog
                      trigger={
                        <Button variant="ghost" size="sm">
                          {t("admin.edit")}
                        </Button>
                      }
                      categoryId={category.id}
                      initialValues={{
                        name: category.name,
                        slug: category.slug,
                        description: category.description ?? "",
                      }}
                    />
                    <DeleteCategoryButton
                      categoryId={category.id}
                      productCount={category._count.products}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}
