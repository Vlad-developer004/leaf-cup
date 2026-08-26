import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PromoCodeFormDialog } from "@/components/admin/promo-code-form-dialog";
import { PromoCodeRowActions } from "@/components/admin/promo-code-row-actions";
import { getAdminPromoCodes } from "@/lib/admin/promo-codes";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/reveal";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("admin.promoCodesTitle") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

function formatDiscount(promoCode: { type: string; value: number; currency: string | null }) {
  return promoCode.type === "PERCENT"
    ? `${promoCode.value}%`
    : formatPrice(promoCode.value, promoCode.currency ?? "EUR");
}

export default async function AdminPromoCodesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const promoCodes = await getAdminPromoCodes();
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("admin.promoCodesTitle")}</h1>
        <PromoCodeFormDialog trigger={<Button>{t("admin.addPromoCode")}</Button>} />
      </div>

      <Reveal className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminPromoCodes.code")}</TableHead>
              <TableHead>{t("adminPromoCodes.discount")}</TableHead>
              <TableHead>{t("adminPromoCodes.status")}</TableHead>
              <TableHead>{t("adminPromoCodes.redemptions")}</TableHead>
              <TableHead>{t("adminPromoCodes.expires")}</TableHead>
              <TableHead className="text-right">{t("adminPromoCodes.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {t("adminPromoCodes.empty")}
                </TableCell>
              </TableRow>
            ) : (
              promoCodes.map((promoCode) => {
                const isExpired = !!promoCode.expiresAt && promoCode.expiresAt < now;
                return (
                  <TableRow key={promoCode.id}>
                    <TableCell className="font-medium">{promoCode.code}</TableCell>
                    <TableCell>{formatDiscount(promoCode)}</TableCell>
                    <TableCell>
                      {isExpired ? (
                        <Badge variant="secondary">{t("adminPromoCodes.expired")}</Badge>
                      ) : (
                        <Badge variant={promoCode.isActive ? "default" : "secondary"}>
                          {promoCode.isActive ? t("adminPromoCodes.active") : t("adminPromoCodes.inactive")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {promoCode.timesRedeemed}
                      {promoCode.maxRedemptions !== null
                        ? ` / ${promoCode.maxRedemptions}`
                        : ` (${t("adminPromoCodes.noLimit")})`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {promoCode.expiresAt
                        ? promoCode.expiresAt.toLocaleDateString(locale)
                        : t("adminPromoCodes.noExpiry")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <PromoCodeFormDialog
                          trigger={
                            <Button variant="ghost" size="sm">
                              {t("admin.edit")}
                            </Button>
                          }
                          promoCodeId={promoCode.id}
                          initialValues={{
                            code: promoCode.code,
                            type: promoCode.type,
                            value:
                              promoCode.type === "PERCENT"
                                ? String(promoCode.value)
                                : String(promoCode.value / 100),
                            currency: promoCode.currency ?? "EUR",
                            isActive: promoCode.isActive,
                            expiresAt: promoCode.expiresAt
                              ? promoCode.expiresAt.toISOString().slice(0, 10)
                              : "",
                            minSubtotalEuros:
                              promoCode.minSubtotal !== null ? String(promoCode.minSubtotal / 100) : "",
                            maxRedemptions:
                              promoCode.maxRedemptions !== null ? String(promoCode.maxRedemptions) : "",
                          }}
                        />
                        <PromoCodeRowActions promoCodeId={promoCode.id} isActive={promoCode.isActive} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}
