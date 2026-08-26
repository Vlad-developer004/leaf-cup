import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsForm } from "@/components/account/notifications-form";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("notifications.title") + " — Leaf & Cup",
  };
}

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { emailAnnouncements: true, emailBagReminder: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("notifications.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("notifications.title")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("notifications.title")}
      </h1>

      <NotificationsForm
        initialValues={{
          emailAnnouncements: user.emailAnnouncements,
          emailBagReminder: user.emailBagReminder,
        }}
        dict={{
          announcementsTitle: t("notificationsForm.announcementsTitle"),
          announcementsDesc: t("notificationsForm.announcementsDesc"),
          bagTitle: t("notificationsForm.bagTitle"),
          bagDesc: t("notificationsForm.bagDesc"),
          success: t("notificationsForm.success"),
          submitIdle: t("notificationsForm.submitIdle"),
          submitPending: t("notificationsForm.submitPending"),
        }}
      />
    </main>
  );
}
