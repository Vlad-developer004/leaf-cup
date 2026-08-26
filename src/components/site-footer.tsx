import { Link } from "@/components/localized-link";
import { getCategories } from "@/lib/get-categories";
import { LogoMark } from "@/components/logo-mark";
import initTranslations from "@/lib/i18n";

export async function SiteFooter({ locale }: { locale: string }) {
  const categories = await getCategories(locale);
  const { t } = await initTranslations(locale, ["common"]);

  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-3 md:py-16">
        <div className="flex flex-col gap-3">
          <LogoMark />
          <p className="max-w-xs text-sm text-muted-foreground">
            {t("footer.slogan")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">{t("footer.catalog")}</span>
          <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/catalog" className="hover:text-foreground">
              {t("footer.allProducts")}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("footer.info")}</span>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                {t("footer.about")}
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                {t("footer.contact")}
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                {t("footer.terms")}
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                {t("footer.privacy")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">{t("footer.contacts")}</span>
            <a
              href="mailto:hello@leafandcup.example"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              hello@leafandcup.example
            </a>
          </div>
        </div>
      </div>

      <div className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
        {t("footer.copyright", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
