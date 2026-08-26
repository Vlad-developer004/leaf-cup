"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPromoCode, updatePromoCode } from "@/lib/admin/promo-code-actions";

type PromoCodeFormValues = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: string;
  currency: string;
  isActive: boolean;
  expiresAt: string;
  minSubtotalEuros: string;
  maxRedemptions: string;
};

const emptyValues: PromoCodeFormValues = {
  code: "",
  type: "PERCENT",
  value: "",
  currency: "EUR",
  isActive: true,
  expiresAt: "",
  minSubtotalEuros: "",
  maxRedemptions: "",
};

export function PromoCodeFormDialog({
  trigger,
  promoCodeId,
  initialValues,
}: {
  trigger: React.ReactNode;
  promoCodeId?: string;
  initialValues?: PromoCodeFormValues;
}) {
  const router = useRouter();
  const isEditing = !!promoCodeId;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PromoCodeFormValues>(initialValues ?? emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updatePromoCode(promoCodeId, values)
        : await createPromoCode(values);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValues(initialValues ?? emptyValues);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Изменить промокод" : "Новый промокод"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-code">Код</Label>
            <Input
              id="promo-code"
              required
              value={values.code}
              onChange={(e) => setValues((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-type">Тип скидки</Label>
              <Select
                value={values.type}
                onValueChange={(type: "PERCENT" | "FIXED") =>
                  setValues((prev) => ({ ...prev, type }))
                }
              >
                <SelectTrigger id="promo-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENT">Процент</SelectItem>
                  <SelectItem value="FIXED">Фиксированная сумма</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-value">
                {values.type === "PERCENT" ? "Процент (1–100)" : "Сумма скидки"}
              </Label>
              <Input
                id="promo-value"
                type="number"
                step={values.type === "PERCENT" ? "1" : "0.01"}
                min="0"
                required
                value={values.value}
                onChange={(e) => setValues((prev) => ({ ...prev, value: e.target.value }))}
              />
            </div>
          </div>

          {values.type === "FIXED" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-currency">Валюта</Label>
              <Select
                value={values.currency}
                onValueChange={(currency) => setValues((prev) => ({ ...prev, currency }))}
              >
                <SelectTrigger id="promo-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-min-subtotal">Мин. сумма заказа</Label>
              <Input
                id="promo-min-subtotal"
                type="number"
                step="0.01"
                min="0"
                placeholder="Без ограничения"
                value={values.minSubtotalEuros}
                onChange={(e) => setValues((prev) => ({ ...prev, minSubtotalEuros: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="promo-max-redemptions">Лимит использований</Label>
              <Input
                id="promo-max-redemptions"
                type="number"
                step="1"
                min="0"
                placeholder="Без ограничения"
                value={values.maxRedemptions}
                onChange={(e) => setValues((prev) => ({ ...prev, maxRedemptions: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="promo-expires">Действует до</Label>
            <Input
              id="promo-expires"
              type="date"
              value={values.expiresAt}
              onChange={(e) => setValues((prev) => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="promo-active"
              checked={values.isActive}
              onCheckedChange={(isActive) => setValues((prev) => ({ ...prev, isActive }))}
            />
            <Label htmlFor="promo-active">Активен</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохраняем…" : isEditing ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
