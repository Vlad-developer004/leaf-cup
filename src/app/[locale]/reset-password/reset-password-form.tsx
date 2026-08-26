"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ResetPasswordDict = {
  submitIdle: string;
  submitPending: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  passwordHint: string;
  tokenError: string;
  matchError: string;
  genericError: string;
};

export function ResetPasswordForm({ token, dict }: { token: string | null; dict: ResetPasswordDict }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(dict.tokenError);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(dict.matchError);
      return;
    }

    setPending(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setPending(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(typeof data?.error === "string" ? data.error : dict.genericError);
      return;
    }

    router.push("/sign-in");
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{dict.newPasswordLabel}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        <p className="text-xs text-muted-foreground">{dict.passwordHint}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">{dict.confirmPasswordLabel}</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? dict.submitPending : dict.submitIdle}
      </Button>
    </form>
  );
}
