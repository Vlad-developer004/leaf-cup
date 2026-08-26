"use client";

import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const { t } = useTranslation();

  return (
    <form className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          placeholder={t("about.newsletterEmailPlaceholder")}
          disabled
          className="pl-9"
          title={t("about.newsletterComingSoon")}
        />
      </div>
      <Button type="button" disabled title={t("about.newsletterComingSoon")} className="sm:px-6">
        {t("about.newsletterSubscribeBtn")}
      </Button>
    </form>
  );
}
