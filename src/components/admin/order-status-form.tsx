"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/admin/order-actions";
import { getOrderStatusLabels } from "@/lib/order-status";
import { OrderStatus } from "@/generated/prisma/client";

export function OrderStatusForm({
  orderId,
  allowedNextStatuses,
}: {
  orderId: string;
  allowedNextStatuses: OrderStatus[];
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">(allowedNextStatuses[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (allowedNextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("adminOrderStatusForm.finalStatus")}</p>;
  }

  const statusLabels = getOrderStatusLabels(t);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nextStatus) return;
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <Select value={nextStatus} onValueChange={(value) => setNextStatus(value as OrderStatus)}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowedNextStatuses.map((status) => (
            <SelectItem key={status} value={status}>
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isPending}>
        {isPending ? t("adminOrderStatusForm.submitPending") : t("adminOrderStatusForm.submitIdle")}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </form>
  );
}
