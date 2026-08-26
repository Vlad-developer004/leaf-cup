import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AddressFormDialog } from "@/components/account/address-form-dialog";
import { AddressCard } from "@/components/account/address-card";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("addresses.title") + " — Leaf & Cup",
  };
}

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("addresses.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("addresses.title")}</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight md:text-3xl">
          {t("addresses.title")}
        </h1>
        <AddressFormDialog
          trigger={<Button>{t("addresses.addAddressBtn")}</Button>}
          dict={{
            titleNew: t("addressForm.titleNew"),
            titleEdit: t("addressForm.titleEdit"),
            fullName: t("addressForm.fullName"),
            addressLine: t("addressForm.addressLine"),
            city: t("addressForm.city"),
            postalCode: t("addressForm.postalCode"),
            country: t("addressForm.country"),
            phone: t("addressForm.phone"),
            defaultLabel: t("addressForm.defaultLabel"),
            submitAdd: t("addressForm.submitAdd"),
            submitEdit: t("addressForm.submitEdit"),
            submitPending: t("addressForm.submitPending"),
          }}
        />
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border py-16 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground">{t("addresses.empty")}</p>
          <AddressFormDialog
            trigger={<Button className="mt-2 px-6">{t("addresses.addAddressBtn")}</Button>}
            dict={{
              titleNew: t("addressForm.titleNew"),
              titleEdit: t("addressForm.titleEdit"),
              fullName: t("addressForm.fullName"),
              addressLine: t("addressForm.addressLine"),
              city: t("addressForm.city"),
              postalCode: t("addressForm.postalCode"),
              country: t("addressForm.country"),
              phone: t("addressForm.phone"),
              defaultLabel: t("addressForm.defaultLabel"),
              submitAdd: t("addressForm.submitAdd"),
              submitEdit: t("addressForm.submitEdit"),
              submitPending: t("addressForm.submitPending"),
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              dict={{
                defaultBadge: t("addressCard.defaultBadge"),
                editAria: t("addressCard.editAria"),
                makeDefault: t("addressCard.makeDefault"),
                delete: t("addressCard.delete"),
                deleteTitle: t("addressCard.deleteTitle"),
                deleteDesc: t("addressCard.deleteDesc"),
                cancelBtn: t("addressCard.cancelBtn"),
                deleteBtn: t("addressCard.deleteBtn"),
              }}
              formDict={{
                titleNew: t("addressForm.titleNew"),
                titleEdit: t("addressForm.titleEdit"),
                fullName: t("addressForm.fullName"),
                addressLine: t("addressForm.addressLine"),
                city: t("addressForm.city"),
                postalCode: t("addressForm.postalCode"),
                country: t("addressForm.country"),
                phone: t("addressForm.phone"),
                defaultLabel: t("addressForm.defaultLabel"),
                submitAdd: t("addressForm.submitAdd"),
                submitEdit: t("addressForm.submitEdit"),
                submitPending: t("addressForm.submitPending"),
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
