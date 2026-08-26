"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18nConfig, type Locale } from "@/i18nConfig";

const LOCALE_LABELS: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  de: "Deutsch",
};

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  function switchTo(nextLocale: Locale) {
    if (nextLocale === locale) return;

    // pathname всегда начинается с "/", segments[0] === ""
    const segments = pathname.split("/");
    if ((i18nConfig.locales as string[]).includes(segments[1])) {
      segments.splice(1, 1);
    }
    const rest = segments.join("/") || "/";

    setLocaleCookie(nextLocale);

    const nextPath =
      nextLocale === i18nConfig.defaultLocale ? rest : `/${nextLocale}${rest === "/" ? "" : rest}`;
    router.push(nextPath);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="px-2 text-xs font-semibold tracking-wide text-muted-foreground hover:text-foreground"
          aria-label={t("languageSwitcher.ariaLabel")}
        >
          {locale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {i18nConfig.locales.map((l) => (
          <DropdownMenuItem key={l} className="justify-between" onSelect={() => switchTo(l)}>
            {LOCALE_LABELS[l]}
            {l === locale && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
