"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { AddressFormDialog } from "@/components/account/address-form-dialog";
import { deleteAddress, setDefaultAddress, type AddressInput } from "@/lib/account/address-actions";

type Address = AddressInput & { id: string };

export function AddressCard({
  address,
  dict,
  formDict,
}: {
  address: Address;
  dict: {
    defaultBadge: string;
    editAria: string;
    makeDefault: string;
    delete: string;
    deleteTitle: string;
    deleteDesc: string;
    cancelBtn: string;
    deleteBtn: string;
  };
  formDict: {
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
  const [isPending, startTransition] = useTransition();

  function handleSetDefault() {
    startTransition(async () => {
      await setDefaultAddress(address.id);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAddress(address.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-heading font-medium text-foreground">{address.fullName}</span>
            {address.isDefault && <Badge variant="secondary">{dict.defaultBadge}</Badge>}
          </div>
          <span className="text-muted-foreground">
            {address.addressLine}, {address.city} {address.postalCode}, {address.country}
          </span>
          <span className="text-muted-foreground">{address.phone}</span>
        </div>
        <AddressFormDialog
          addressId={address.id}
          initialValues={address}
          dict={formDict}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={dict.editAria}>
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      <div className="flex items-center gap-4 border-t pt-3">
        {!address.isDefault && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleSetDefault}
            className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
          >
            {dict.makeDefault}
          </button>
        )}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {dict.delete}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dict.deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>{dict.deleteDesc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{dict.cancelBtn}</AlertDialogCancel>
              <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
                {dict.deleteBtn}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
