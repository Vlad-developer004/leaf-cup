"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/account/password-actions";

export function PasswordForm({
  dict,
}: {
  dict: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    success: string;
    submitIdle: string;
    submitPending: string;
  };
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border p-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">{dict.currentPassword}</Label>
        <PasswordInput
          id="currentPassword"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">{dict.newPassword}</Label>
        <PasswordInput
          id="newPassword"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{dict.confirmPassword}</Label>
        <PasswordInput
          id="confirmPassword"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-foreground">{dict.success}</p>}

      <Button type="submit" size="lg" className="w-full sm:w-fit sm:px-8" disabled={isPending}>
        {isPending ? dict.submitPending : dict.submitIdle}
      </Button>
    </form>
  );
}
