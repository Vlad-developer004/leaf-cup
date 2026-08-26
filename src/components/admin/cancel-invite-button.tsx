"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cancelInvite } from "@/lib/admin/team-actions";

export function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      await cancelInvite(inviteId);
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" className="text-muted-foreground" disabled={isPending} onClick={handleCancel}>
      {t("adminTeam.cancelInviteBtn")}
    </Button>
  );
}
