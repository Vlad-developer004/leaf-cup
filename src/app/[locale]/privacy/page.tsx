import type { Metadata } from "next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("privacy.metaTitle"),
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return (
    <main className="flex-1 px-6 py-16">
      <article className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("privacy.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("privacy.lastUpdated")}</p>

        <div className="mt-4 rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          {t("privacy.notice")}
        </div>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
          <Section title={t("privacy.s1Title")}>
            {t("privacy.s1Content")}
          </Section>

          <Section title={t("privacy.s2Title")}>
            {t("privacy.s2Content")}
          </Section>

          <Section id="cookies" title={t("privacy.s3Title")}>
            <p className="mb-4">
              {t("privacy.s3Content1")}
            </p>
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("privacy.tCookie")}</TableHead>
                    <TableHead>{t("privacy.tPurpose")}</TableHead>
                    <TableHead>{t("privacy.tRetention")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">authjs.session-token</TableCell>
                    <TableCell className="whitespace-normal">{t("privacy.tAuthjs")}</TableCell>
                    <TableCell>{t("privacy.tDays")}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">cartId</TableCell>
                    <TableCell className="whitespace-normal">
                      {t("privacy.tCartId")}
                    </TableCell>
                    <TableCell>{t("privacy.tDays")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="mt-4">
              {t("privacy.s3Content2")}
            </p>
          </Section>

          <Section title={t("privacy.s4Title")}>
            {t("privacy.s4Content")}
          </Section>

          <Section title={t("privacy.s5Title")}>
            {t("privacy.s5Content")}
          </Section>

          <Section title={t("privacy.s6Title")}>
            {t("privacy.s6Content")}
          </Section>

          <Section title={t("privacy.s7Title")}>
            {t("privacy.s7Content")}
          </Section>

          <Section title={t("privacy.s8Title")}>
            {t("privacy.s8Content")}
            <a href="mailto:privacy@leafandcup.example" className="text-foreground underline-offset-4 hover:underline">
              privacy@leafandcup.example
            </a>
            .
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-2 text-base font-medium text-foreground">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
