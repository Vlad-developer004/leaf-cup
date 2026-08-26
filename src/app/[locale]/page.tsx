import { Link } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategories } from "@/lib/get-categories";
import { getFavoriteProductIds } from "@/lib/favorites";
import { localizeProducts } from "@/lib/translations";
import { ProductArt } from "@/components/product-art";
import { HeroVisual } from "@/components/hero-visual";
import { TiltCard } from "@/components/tilt-card";
import { FavoriteButton } from "@/components/favorite-button";
import initTranslations from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();
  const [categories, rawFeaturedProducts, favoriteIds] = await Promise.all([
    getCategories(locale),
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    session?.user?.id ? getFavoriteProductIds(session.user.id) : Promise.resolve(new Set<string>()),
  ]);
  const featuredProducts = await localizeProducts(rawFeaturedProducts, locale);

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-24">
        <Reveal className="flex flex-col gap-6">
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {t("home.subtitle")}
          </span>
          <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight md:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-md text-muted-foreground">
            {t("home.description")}
          </p>
          <div>
            <Button asChild size="lg" className="px-6">
              <Link href="#featured" className="gap-2">
                {t("home.cta")}
                <ArrowRight className="transition-transform duration-200 group-hover/button:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </Reveal>
        <HeroVisual />
      </section>

      <section className="border-t">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden border-x bg-border sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Reveal key={category.id} delay={index * 0.08} className="group bg-background">
                <Link
                  href={`/catalog?category=${category.slug}`}
                  className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-muted"
                >
                  <Icon
                    strokeWidth={1.5}
                    className="h-6 w-6 text-primary transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110 group-hover:rotate-6"
                  />
                  <span className="font-heading font-medium">{category.name}</span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="featured" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <Reveal className="mb-10 flex flex-col gap-2">
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            {t("home.featuredTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("home.featuredDesc")}
          </p>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08}>
              <TiltCard className="overflow-hidden rounded-xl">
                <Link href={`/catalog/${product.slug}`}>
                  <Card className="h-full overflow-hidden pt-0 shadow-none transition-shadow duration-200 hover:shadow-xl">
                    <ProductArt
                      icon={getCategoryIcon(product.category.slug)}
                      images={product.images}
                      alt={product.name}
                      priority={index === 0}
                      className="aspect-4/3 w-full rounded-t-xl"
                      overlay={
                        <FavoriteButton
                          productId={product.id}
                          initialFavorited={favoriteIds.has(product.id)}
                          className="absolute top-3 right-3 z-10"
                        />
                      }
                    />
                    <CardHeader>
                      <Badge variant="secondary" className="mb-1 w-fit">
                        {product.category.name}
                      </Badge>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <span className="font-heading font-medium">
                        {formatPrice(product.priceAmount, product.currency)}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden border-t bg-secondary/40">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary),transparent_85%),transparent)] blur-3xl"
        />
        <Reveal className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-16 text-center md:py-24">
          <h2 className="font-heading max-w-xl text-2xl font-medium tracking-tight md:text-3xl">
            {t("home.bottomTitle")}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            {t("home.bottomDesc")}
          </p>
        </Reveal>
      </section>
    </main>
  );
}
