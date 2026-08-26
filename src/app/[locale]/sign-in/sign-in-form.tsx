"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Link } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncCartOnLogin } from "@/lib/cart-actions";

function getSafeCallbackUrl(value: string | null) {
  if (value && /^\/(?!\/)/.test(value)) {
    return value;
  }
  return "/";
}

export type SignInDict = {
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  forgotPassword: string;
  errorInvalid: string;
  submitIdle: string;
  submitPending: string;
};

export function SignInForm({ dict }: { dict: SignInDict }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      setError(dict.errorInvalid);
      return;
    }

    await syncCartOnLogin();
    router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{dict.emailLabel}</Label>
        <Input id="email" name="email" type="email" placeholder={dict.emailPlaceholder} autoComplete="email" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{dict.passwordLabel}</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {dict.forgotPassword}
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? dict.submitPending : dict.submitIdle}
      </Button>
    </form>
  );
}
