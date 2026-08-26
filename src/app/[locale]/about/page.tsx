import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { ProductArt } from "@/components/product-art";
import { Leaf } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("about.metaTitle"),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <main className="flex-1 px-6 py-16 md:py-24">
      <article className="mx-auto max-w-2xl">
        <Reveal className="flex flex-col gap-2 text-center">
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {t("about.ourHistory")}
          </span>
          <h1 className="font-heading text-2xl font-medium tracking-tight md:text-3xl">{t("about.title")}</h1>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground"
        >
          <p>{t("about.paragraph1")}</p>
          <p>{t("about.paragraph2")}</p>
        </Reveal>

        <Reveal delay={0.2} className="mt-10">
          <ProductArt
            icon={Leaf}
            images={["/products/set-morning-ritual.avif"]}
            alt={t("about.imageAlt")}
            sizes="(min-width: 768px) 672px, 100vw"
            className="aspect-4/3 w-full rounded-2xl shadow-lg"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-16 flex flex-col items-center gap-2 text-center">
          <h2 className="font-heading text-xl font-medium tracking-tight">{t("about.newsletterTitle")}</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("about.newsletterDescription")}
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <NewsletterForm />
        </Reveal>
      </article>
    </main>
  );
}
