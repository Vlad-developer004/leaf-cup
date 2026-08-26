import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { getTeamData } from "@/lib/admin/team";
import { GrantRoleDialog } from "@/components/admin/grant-role-dialog";
import { RevokeRoleButton } from "@/components/admin/revoke-role-button";
import { CancelInviteButton } from "@/components/admin/cancel-invite-button";
import { Reveal } from "@/components/reveal";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminTeam.title") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

export default async function AdminTeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }

  const { admins, invites } = await getTeamData();
  const roleLabel = { ADMIN: t("adminTeam.roleAdmin"), SUPERADMIN: t("adminTeam.roleSuperadmin") };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminTeam.title")}</h1>

      <GrantRoleDialog />

      <Reveal className="flex flex-col gap-3 rounded-xl border p-6">
        <span className="font-heading font-medium">{t("adminTeam.currentAdminsTitle")}</span>
        {admins.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminTeam.noAdmins")}</p>
        ) : (
          <div className="flex flex-col divide-y">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {admin.firstName} {admin.lastName}{" "}
                    {admin.id === session.user.id && (
                      <span className="text-muted-foreground">{t("adminTeam.you")}</span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={admin.role === "SUPERADMIN" ? "default" : "secondary"}>
                    {roleLabel[admin.role as "ADMIN" | "SUPERADMIN"]}
                  </Badge>
                  {admin.id !== session.user.id && <RevokeRoleButton userId={admin.id} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>

      <Reveal delay={0.08} className="flex flex-col gap-3 rounded-xl border p-6">
        <span className="font-heading font-medium">{t("adminTeam.pendingInvitesTitle")}</span>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("adminTeam.noInvites")}</p>
        ) : (
          <div className="flex flex-col divide-y">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{invite.email}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("adminTeam.invitedByLabel")}: {invite.invitedBy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t("adminTeam.pendingBadge")}</Badge>
                  <Badge variant={invite.role === "SUPERADMIN" ? "default" : "secondary"}>
                    {roleLabel[invite.role as "ADMIN" | "SUPERADMIN"]}
                  </Badge>
                  <CancelInviteButton inviteId={invite.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
