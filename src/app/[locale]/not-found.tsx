"use client";

import { Link } from "@/components/localized-link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("common");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <Reveal className="flex flex-col items-center gap-4">
        <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          404
        </span>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-foreground">
          <PackageSearch className="h-7 w-7" strokeWidth={1.5} />
        </span>
        <h1 className="font-heading text-2xl font-medium tracking-tight md:text-3xl">
          {t("notFound.title")}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("notFound.description")}
        </p>
        <Button asChild size="lg" className="mt-2 gap-2 px-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            {t("notFound.homeBtn")}
          </Link>
        </Button>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-8 text-sm text-muted-foreground">
          <Link href="/catalog" className="hover:text-foreground">
            {t("notFound.catalogLink")}
          </Link>
          <Link href="/about" className="hover:text-foreground">
            {t("notFound.aboutLink")}
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            {t("notFound.contactLink")}
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
