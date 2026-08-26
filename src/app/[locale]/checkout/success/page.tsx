import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SuccessView } from "./success-view";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("checkout.metaSuccessTitle") + " — Leaf & Cup",
  };
}

export default async function CheckoutSuccessPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ order?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const { order: orderId } = await searchParams;
  if (!orderId) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  return <SuccessView order={order} dict={{
    successTitle: t("checkout.successTitle"),
    successDesc: t("checkout.successDesc"),
    pendingTitle: t("checkout.pendingTitle"),
    pendingDesc: t("checkout.pendingDesc"),
    failedTitle: t("checkout.failedTitle"),
    failedDesc: t("checkout.failedDesc"),
    retryBtn: t("checkout.retryBtn"),
    total: t("checkout.total"),
    discount: t("cart.discount"),
    homeBtn: t("checkout.homeBtn"),
    successDemoNote: t("checkout.successDemoNote")
  }} />;
}
