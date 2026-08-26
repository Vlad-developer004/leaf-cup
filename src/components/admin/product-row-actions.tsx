"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
        Показать
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Скрыть
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Скрыть товар?</AlertDialogTitle>
          <AlertDialogDescription>
            Товар пропадёт из каталога, но останется в базе и в истории уже оформленных заказов.
            Его всегда можно будет показать снова.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={() => setActive(false)}>
            Скрыть
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
