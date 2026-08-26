"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAddress, updateAddress, type AddressInput } from "@/lib/account/address-actions";

const emptyValues: AddressInput = {
  fullName: "",
  addressLine: "",
  city: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
};

export function AddressFormDialog({
  trigger,
  addressId,
  initialValues,
  dict,
}: {
  trigger: React.ReactNode;
  addressId?: string;
  initialValues?: AddressInput;
  dict: {
    titleNew: string;
    titleEdit: string;
    fullName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    defaultLabel: string;
    submitAdd: string;
    submitEdit: string;
    submitPending: string;
  };
}) {
  const router = useRouter();
  const isEditing = !!addressId;
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<AddressInput>(initialValues ?? emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateAddress(addressId, values)
        : await createAddress(values);
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
            <DialogTitle>{isEditing ? dict.titleEdit : dict.titleNew}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="addr-fullName">{dict.fullName}</Label>
              <Input
                id="addr-fullName"
                required
                value={values.fullName}
                onChange={(e) => setValues((prev) => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="addr-addressLine">{dict.addressLine}</Label>
              <Input
                id="addr-addressLine"
                required
                value={values.addressLine}
                onChange={(e) => setValues((prev) => ({ ...prev, addressLine: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-city">{dict.city}</Label>
              <Input
                id="addr-city"
                required
                value={values.city}
                onChange={(e) => setValues((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-postalCode">{dict.postalCode}</Label>
              <Input
                id="addr-postalCode"
                required
                value={values.postalCode}
                onChange={(e) => setValues((prev) => ({ ...prev, postalCode: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-country">{dict.country}</Label>
              <Input
                id="addr-country"
                required
                value={values.country}
                onChange={(e) => setValues((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-phone">{dict.phone}</Label>
              <Input
                id="addr-phone"
                type="tel"
                required
                value={values.phone}
                onChange={(e) => setValues((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={values.isDefault}
              onCheckedChange={(checked) =>
                setValues((prev) => ({ ...prev, isDefault: checked }))
              }
              aria-label={dict.defaultLabel}
            />
            <Label>{dict.defaultLabel}</Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.submitPending : isEditing ? dict.submitEdit : dict.submitAdd}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
