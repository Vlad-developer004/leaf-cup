"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { slugify } from "@/lib/slugify";
import { createCategory, updateCategory } from "@/lib/admin/category-actions";

type CategoryFormValues = { name: string; slug: string; description: string };

export function CategoryFormDialog({
  trigger,
  categoryId,
  initialValues,
}: {
  trigger: React.ReactNode;
  categoryId?: string;
  initialValues?: CategoryFormValues;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const isEditing = !!categoryId;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CategoryFormValues>(
    initialValues ?? { name: "", slug: "", description: "" }
  );
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleNameChange(name: string) {
    setValues((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateCategory(categoryId, values)
        : await createCategory(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? t("adminCategoryForm.titleEdit") : t("adminCategoryForm.titleNew")}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">{t("adminCategoryForm.name")}</Label>
            <Input
              id="cat-name"
              required
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">{t("adminCategoryForm.slug")}</Label>
            <Input
              id="cat-slug"
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setValues((prev) => ({ ...prev, slug: e.target.value }));
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-description">{t("adminCategoryForm.description")}</Label>
            <Textarea
              id="cat-description"
              rows={3}
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t("adminCategoryForm.submitPending")
                : isEditing
                  ? t("adminCategoryForm.submitSave")
                  : t("adminCategoryForm.submitCreate")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
