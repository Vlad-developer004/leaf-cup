"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";
import { createProduct, updateProduct, type ProductFormInput } from "@/lib/admin/product-actions";

type Category = { id: string; name: string };

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  priceEuros: string;
  currency: string;
  stock: string;
  categoryId: string;
  imagesText: string;
  isFeatured: boolean;
  isActive: boolean;
};

export function ProductForm({
  categories,
  productId,
  initialValues,
}: {
  categories: Category[];
  productId?: string;
  initialValues?: ProductFormValues;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = !!productId;
  const [values, setValues] = useState<ProductFormValues>(
    initialValues ?? {
      name: "",
      slug: "",
      description: "",
      priceEuros: "",
      currency: "EUR",
      stock: "0",
      categoryId: categories[0]?.id ?? "",
      imagesText: "",
      isFeatured: false,
      isActive: true,
    }
  );
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(name: string) {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const input: ProductFormInput = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      priceEuros: values.priceEuros,
      currency: values.currency,
      stock: values.stock,
      categoryId: values.categoryId,
      imagesText: values.imagesText,
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(productId, input)
        : await createProduct(input);

      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">{t("adminProductForm.name")}</Label>
          <Input
            id="name"
            required
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="slug">{t("adminProductForm.slug")}</Label>
          <Input
            id="slug"
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setValues((prev) => ({ ...prev, slug: e.target.value }));
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">{t("adminProductForm.description")}</Label>
          <Textarea
            id="description"
            required
            rows={4}
            value={values.description}
            onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priceEuros">{t("adminProductForm.price")}</Label>
          <Input
            id="priceEuros"
            type="number"
            step="0.01"
            min="0"
            required
            value={values.priceEuros}
            onChange={(e) => setValues((prev) => ({ ...prev, priceEuros: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency">{t("adminProductForm.currency")}</Label>
          <Select
            value={values.currency}
            onValueChange={(currency) => setValues((prev) => ({ ...prev, currency }))}
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">{t("adminProductForm.stock")}</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            required
            value={values.stock}
            onChange={(e) => setValues((prev) => ({ ...prev, stock: e.target.value }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">{t("adminProductForm.category")}</Label>
          <Select
            value={values.categoryId}
            onValueChange={(categoryId) => setValues((prev) => ({ ...prev, categoryId }))}
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="images">{t("adminProductForm.images")}</Label>
          <Textarea
            id="images"
            rows={3}
            placeholder="https://…"
            value={values.imagesText}
            onChange={(e) => setValues((prev) => ({ ...prev, imagesText: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="isFeatured"
            checked={values.isFeatured}
            onCheckedChange={(isFeatured) => setValues((prev) => ({ ...prev, isFeatured }))}
          />
          <Label htmlFor="isFeatured">{t("adminProductForm.featuredLabel")}</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="isActive"
            checked={values.isActive}
            onCheckedChange={(isActive) => setValues((prev) => ({ ...prev, isActive }))}
          />
          <Label htmlFor="isActive">{t("adminProductForm.activeLabel")}</Label>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? t("adminProductForm.submitPending")
            : isEditing
              ? t("adminProductForm.submitSave")
              : t("adminProductForm.submitCreate")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          {t("adminProductForm.cancel")}
        </Button>
      </div>
    </form>
  );
}
