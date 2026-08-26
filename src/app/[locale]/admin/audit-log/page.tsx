import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAuditLog } from "@/lib/admin/audit-log";
import { Reveal } from "@/components/reveal";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminAuditLog.title") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminAuditLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();

  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/admin");
  }

  const entries = await getAuditLog();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminAuditLog.title")}</h1>

      <Reveal className="rounded-xl border divide-y">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("adminAuditLog.empty")}</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm">{entry.summary}</span>
                <span className="text-xs text-muted-foreground">{entry.actorEmail}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                  entry.createdAt
                )}
              </span>
            </div>
          ))
        )}
      </Reveal>
    </div>
  );
}
