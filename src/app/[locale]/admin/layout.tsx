import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import initTranslations from "@/lib/i18n";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);

  if (!session?.user) {
    redirect("/sign-in");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminNav
        dict={{
          dashboard: t("adminNav.dashboard"),
          products: t("adminNav.products"),
          categories: t("adminNav.categories"),
          orders: t("adminNav.orders"),
          promoCodes: t("adminNav.promoCodes"),
        }}
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</div>
    </div>
  );
}
