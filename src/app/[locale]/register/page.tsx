import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { OAuthButtons } from "@/components/oauth-buttons";
import { RegisterForm } from "./register-form";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("auth.registerTitle") + " — Leaf & Cup",
  };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl font-medium tracking-tight">{t("auth.registerTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.registerSubtitle")}
          </p>
        </div>

        <RegisterForm dict={{
          firstNameLabel: t("auth.firstNameLabel"),
          lastNameLabel: t("auth.lastNameLabel"),
          emailLabel: t("auth.emailLabel"),
          emailPlaceholder: t("auth.emailPlaceholder"),
          passwordLabel: t("auth.passwordLabel"),
          passwordHint: t("auth.passwordHint"),
          termsError: t("auth.termsError"),
          termsAgree: t("auth.termsAgree"),
          termsAnd: t("auth.termsAnd"),
          errorGeneric: t("auth.errorGeneric"),
          submitIdle: t("auth.registerSubmitIdle"),
          submitPending: t("auth.registerSubmitPending"),
        }} termsLink={t("contact.links.terms")} privacyLink={t("contact.links.privacy")} />

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{t("auth.or")}</span>
          <Separator className="flex-1" />
        </div>

        <OAuthButtons dict={{ google: t("auth.googleBtn"), apple: t("auth.appleBtn") }} />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t("auth.hasAccount")}{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
