"use client";

import { Link } from "@/components/localized-link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {t("cookieConsent.text")}{" "}
          <Link href="/privacy#cookies" className="text-foreground underline-offset-4 hover:underline">
            {t("cookieConsent.readMore")}
          </Link>
          .
        </p>
        <Button onClick={dismiss} className="shrink-0 px-6">
          {t("cookieConsent.accept")}
        </Button>
      </div>
    </div>
  );
}
