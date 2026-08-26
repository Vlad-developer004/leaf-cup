"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { setProductActive } from "@/lib/admin/product-actions";

export function ProductRowActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  function setActive(next: boolean) {
    startTransition(async () => {
      await setProductActive(productId, next);
      router.refresh();
    });
  }

  if (!isActive) {
    return (
      <Button variant="ghost" size="sm" disabled={isPending} onClick={() => setActive(true)}>
        {t("adminProductRowActions.show")}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          {t("adminProductRowActions.hide")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("adminProductRowActions.hideDialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("adminProductRowActions.hideDialogDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("adminProductRowActions.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={() => setActive(false)}>
            {t("adminProductRowActions.confirmHide")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
