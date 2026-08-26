import type { Metadata } from "next";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("terms.metaTitle"),
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <main className="flex-1 px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("terms.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("terms.lastUpdated")}</p>

        <div className="mt-4 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {t("terms.notice")}
        </div>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
          <Section title={t("terms.s1Title")}>
            {t("terms.s1Content")}
          </Section>

          <Section title={t("terms.s2Title")}>
            {t("terms.s2Content")}
          </Section>

          <Section title={t("terms.s3Title")}>
            {t("terms.s3Content")}
          </Section>

          <Section title={t("terms.s4Title")}>
            {t("terms.s4Content")}
          </Section>

          <Section title={t("terms.s5Title")}>
            {t("terms.s5Content")}
          </Section>

          <Section title={t("terms.s6Title")}>
            {t("terms.s6Content")}
          </Section>

          <Section title={t("terms.s7Title")}>
            {t("terms.s7Content")}
          </Section>

          <Section title={t("terms.s8Title")}>
            {t("terms.s8Content")}
          </Section>

          <Section title={t("terms.s9Title")}>
            {t("terms.s9Content")}
          </Section>

          <Section title={t("terms.s10Title")}>
            {t("terms.s10Content")}
            <a href="mailto:hello@leafandcup.example" className="text-foreground underline-offset-4 hover:underline">
              hello@leafandcup.example
            </a>
            .
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-medium text-foreground">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
