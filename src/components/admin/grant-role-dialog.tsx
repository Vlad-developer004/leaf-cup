"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { grantRole } from "@/lib/admin/team-actions";

export function GrantRoleDialog() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "SUPERADMIN">("ADMIN");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await grantRole({ email, role });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEmail("");
      setRole("ADMIN");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border p-6">
      <span className="font-heading font-medium">{t("adminTeam.inviteTitle")}</span>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grant-email">{t("adminTeam.emailLabel")}</Label>
          <Input
            id="grant-email"
            type="email"
            required
            placeholder={t("adminTeam.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grant-role">{t("adminTeam.roleLabel")}</Label>
          <Select value={role} onValueChange={(value: "ADMIN" | "SUPERADMIN") => setRole(value)}>
            <SelectTrigger id="grant-role" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">{t("adminTeam.roleAdmin")}</SelectItem>
              <SelectItem value="SUPERADMIN">{t("adminTeam.roleSuperadmin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? t("adminTeam.grantPending") : t("adminTeam.grantBtn")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{t("adminTeam.hint")}</p>
    </form>
  );
}
