"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { i18nConfig } from "@/i18nConfig";

// Обычный next/link не знает о текущей локали — ссылка вида href="/about"
// на /en/... странице вела бы обратно на русскую версию (дефолтная локаль
// без префикса). Эта обёртка сама добавляет текущий префикс локали к
// относительным ссылкам, кроме дефолтной (ru), у которой префикса нет.
export function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const params = useParams();
  const locale = (params?.locale as string) || i18nConfig.defaultLocale;

  let finalHref = href;
  if (
    typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    locale !== i18nConfig.defaultLocale
  ) {
    finalHref = `/${locale}${href}`;
  }

  return <NextLink href={finalHref} {...props} />;
}
