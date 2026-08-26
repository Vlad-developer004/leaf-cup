import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { MessageCircle, Mail, Clock } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("contact.metaTitle"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <Reveal className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {t("contact.contactUs")}
          </span>
          <h1 className="font-heading text-2xl font-medium tracking-tight md:text-3xl">
            {t("contact.title")}
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground">
            <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("contact.description")}
          </p>
          <Button asChild size="lg" className="px-8">
            <a href="mailto:hello@leafandcup.example">{t("contact.emailButton")}</a>
          </Button>
        </Reveal>

        <Reveal
          delay={0.2}
          className="mt-16 grid w-full gap-6 border-t pt-10 sm:grid-cols-2"
        >
          <div className="flex flex-col items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-sm font-medium">Email</span>
            <a
              href="mailto:hello@leafandcup.example"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              hello@leafandcup.example
            </a>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-sm font-medium">{t("contact.responseTimeLabel")}</span>
            <span className="text-sm text-muted-foreground">{t("contact.responseTimeValue")}</span>
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-8 text-sm text-muted-foreground"
        >
          <Link href="/about" className="hover:text-foreground">
            {t("contact.links.about")}
          </Link>
          <Link href="/catalog" className="hover:text-foreground">
            {t("contact.links.catalog")}
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            {t("contact.links.terms")}
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            {t("contact.links.privacy")}
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
