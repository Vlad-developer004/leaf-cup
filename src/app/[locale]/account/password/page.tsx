import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PasswordForm } from "@/components/account/password-form";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("password.title") + " — Leaf & Cup",
  };
}

export default async function PasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("password.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("password.title")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("password.title")}
      </h1>

      {user.passwordHash ? (
        <PasswordForm
          dict={{
            currentPassword: t("passwordForm.currentPassword"),
            newPassword: t("passwordForm.newPassword"),
            confirmPassword: t("passwordForm.confirmPassword"),
            success: t("passwordForm.success"),
            submitIdle: t("passwordForm.submitIdle"),
            submitPending: t("passwordForm.submitPending"),
          }}
        />
      ) : (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          {t("password.googleLogin")}
        </div>
      )}
    </main>
  );
}
