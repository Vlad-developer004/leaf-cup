import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight, Heart } from "lucide-react";
import { auth } from "@/auth";
import { getFavoriteProducts } from "@/lib/favorites";
import { getCategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "@/components/product-art";
import { FavoriteButton } from "@/components/favorite-button";
import { TiltCard } from "@/components/tilt-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("favorites.title") + " — Leaf & Cup",
  };
}

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const products = await getFavoriteProducts(session.user.id, locale);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          {t("favorites.accountBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{t("favorites.title")}</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("favorites.title")}
      </h1>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border py-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-muted-foreground">
            {t("favorites.empty")}
          </p>
          <Button asChild className="mt-2 px-6">
            <Link href="/catalog">{t("favorites.toCatalogBtn")}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={(index % 4) * 0.06}>
              <TiltCard className="overflow-hidden rounded-xl">
                <Link
                  href={`/catalog/${product.slug}`}
                  className="flex flex-col ring-1 ring-foreground/10 transition-shadow hover:shadow-xl"
                >
                  <ProductArt
                    icon={getCategoryIcon(product.category.slug)}
                    images={product.images}
                    alt={product.name}
                    className="aspect-4/3 w-full"
                    overlay={
                      <FavoriteButton
                        productId={product.id}
                        initialFavorited
                        className="absolute top-3 right-3 z-10"
                      />
                    }
                  />
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <span className="text-xs text-muted-foreground">
                      {product.category.name}
                    </span>
                    <h3 className="font-heading font-medium">{product.name}</h3>
                    <span className="mt-auto pt-2 font-heading font-medium">
                      {formatPrice(product.priceAmount, product.currency)}
                    </span>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
