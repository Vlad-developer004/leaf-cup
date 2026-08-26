"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePromoCode, setPromoCodeActive } from "@/lib/admin/promo-code-actions";

export function PromoCodeRowActions({
  promoCodeId,
  isActive,
}: {
  promoCodeId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      await setPromoCodeActive(promoCodeId, !isActive);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deletePromoCode(promoCodeId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" disabled={isPending} onClick={toggleActive}>
        {isActive ? t("adminPromoCodeRowActions.deactivate") : t("adminPromoCodeRowActions.activate")}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {t("adminPromoCodeRowActions.deleteBtn")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("adminPromoCodeRowActions.dialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("adminPromoCodeRowActions.dialogDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("adminPromoCodeRowActions.cancel")}</AlertDialogCancel>
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {t("adminPromoCodeRowActions.confirmBtn")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
