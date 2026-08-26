"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GoogleIcon, AppleIcon } from "@/components/icons";

export function OAuthButtons({ dict }: { dict: { google: string; apple: string } }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2.5"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <GoogleIcon className="size-4" />
        {dict.google}
      </Button>
      <Button type="button" variant="outline" size="lg" className="w-full gap-2.5" disabled>
        <AppleIcon className="size-4" />
        {dict.apple}
      </Button>
    </div>
  );
}
