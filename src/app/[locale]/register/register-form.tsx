"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Link } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { syncCartOnLogin } from "@/lib/cart-actions";

type FieldErrors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "terms", string[]>>;

export type RegisterDict = {
  firstNameLabel: string;
  lastNameLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordHint: string;
  termsError: string;
  termsAgree: string;
  termsAnd: string;
  errorGeneric: string;
  submitIdle: string;
  submitPending: string;
};

export function RegisterForm({ dict, termsLink, privacyLink }: { dict: RegisterDict; termsLink: string; privacyLink: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const password = formData.get("password");

    if (!formData.get("terms")) {
      setErrors({ terms: [dict.termsError] });
      return;
    }

    setPending(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setPending(false);
      if (data?.error) {
        setErrors(data.error);
      } else {
        setFormError(dict.errorGeneric);
      }
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setPending(false);

    if (result?.error) {
      router.push("/sign-in");
      return;
    }

    await syncCartOnLogin();
    router.push("/");
    router.refresh();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="firstName">{dict.firstNameLabel}</Label>
          <Input id="firstName" name="firstName" autoComplete="given-name" required />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName[0]}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lastName">{dict.lastNameLabel}</Label>
          <Input id="lastName" name="lastName" autoComplete="family-name" required />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{dict.emailLabel}</Label>
        <Input id="email" name="email" type="email" placeholder={dict.emailPlaceholder} autoComplete="email" required />
        {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{dict.passwordLabel}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password[0]}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{dict.passwordHint}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="flex items-start gap-2.5">
          <Checkbox id="terms" name="terms" className="mt-0.5" />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            {dict.termsAgree}
            <Link href="/terms" className="text-foreground underline-offset-4 hover:underline">
              {termsLink}
            </Link>
            {dict.termsAnd}
            <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">
              {privacyLink}
            </Link>
            .
          </label>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms[0]}</p>}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
        {pending ? dict.submitPending : dict.submitIdle}
      </Button>
    </form>
  );
}
