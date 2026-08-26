import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "./reset-password-form";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("auth.resetPasswordTitle") + " — Leaf & Cup",
  };
}

export default async function ResetPasswordPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ token?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { token } = await searchParams;
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{t("auth.resetPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.resetPasswordSubtitle")}
          </p>
        </div>

        <ResetPasswordForm token={token ?? null} dict={{
          submitIdle: t("auth.resetPasswordSubmitIdle"),
          submitPending: t("auth.resetPasswordSubmitPending"),
          newPasswordLabel: t("auth.newPasswordLabel"),
          confirmPasswordLabel: t("auth.confirmPasswordLabel"),
          passwordHint: t("auth.passwordHint"),
          tokenError: t("auth.resetPasswordTokenError"),
          matchError: t("auth.resetPasswordMatchError"),
          genericError: t("auth.resetPasswordGenericError"),
        }} />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("auth.rememberedPassword")}{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
