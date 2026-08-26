import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/account/profile-form";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("profile.title") + " — Leaf & Cup",
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { firstName: true, lastName: true, email: true, phone: true, image: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("profile.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("profile.title")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("profile.title")}
      </h1>

      <ProfileForm
        initialValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? "",
          image: user.image,
        }}
        email={user.email}
        dict={{
          changePhotoLabel: t("profileForm.changePhotoLabel"),
          photoLabel: t("profileForm.photoLabel"),
          uploadPhotoBtn: t("profileForm.uploadPhotoBtn"),
          firstNameLabel: t("profileForm.firstNameLabel"),
          lastNameLabel: t("profileForm.lastNameLabel"),
          emailNote: t("profileForm.emailNote"),
          phoneLabel: t("profileForm.phoneLabel"),
          submitIdle: t("profileForm.submitIdle"),
          submitPending: t("profileForm.submitPending"),
          submitSuccess: t("profileForm.submitSuccess"),
          errorFileSelect: t("profileForm.errorFileSelect"),
          errorFileSize: t("profileForm.errorFileSize"),
          errorFileProcess: t("profileForm.errorFileProcess"),
        }}
      />
    </main>
  );
}
