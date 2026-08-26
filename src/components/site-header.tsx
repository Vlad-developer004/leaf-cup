import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { CartLink } from "@/components/cart-link";
import { LogoMark } from "@/components/logo-mark";
import { CatalogNav } from "@/components/catalog-nav";
import { getCategories } from "@/lib/get-categories";
import { getCartItemCount } from "@/lib/cart";

import initTranslations from "@/lib/i18n";

export async function SiteHeader({ locale }: { locale: string }) {
  const [categories, cartCount] = await Promise.all([getCategories(), getCartItemCount()]);
  const { t } = await initTranslations(locale, ["common"]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-2.5 sm:px-6">
        <div className="flex items-center gap-3 lg:gap-10">
          <MobileNav categories={categories} />
          <LogoMark />
          <div className="hidden lg:block">
            <CatalogNav categories={categories} dict={{ title: t("catalogNav.title") }} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <CartLink count={cartCount} size="icon-lg" />
          <UserNav locale={locale} />
        </div>
      </div>
    </header>
  );
}
