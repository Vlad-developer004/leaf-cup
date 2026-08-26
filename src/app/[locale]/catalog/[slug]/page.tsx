import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCategoryIcon } from "@/lib/category-icons";
import { ProductArt } from "@/components/product-art";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/reveal";
import { localizeProduct } from "@/lib/translations";
import initTranslations from "@/lib/i18n";

async function getProduct(slug: string, locale: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isActive) return null;
  return localizeProduct(product, locale);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const product = await getProduct(slug, locale);
  return { title: product ? `${product.name} — Leaf & Cup` : t("product.notFoundTitle") };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const product = await getProduct(slug, locale);
  if (!product) notFound();

  const session = await auth();
  const isFavorited = session?.user?.id
    ? !!(await prisma.favorite.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
      }))
    : false;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/catalog" className="hover:text-foreground">
          {t("product.catalogBreadcrumb")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/catalog?category=${product.category.slug}`}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className="group">
          <ProductArt
            id="product-hero-image"
            icon={getCategoryIcon(product.category.slug)}
            images={product.images}
            alt={product.name}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="aspect-square w-full rounded-2xl shadow-lg"
            overlay={
              <FavoriteButton
                productId={product.id}
                initialFavorited={isFavorited}
                className="absolute top-4 right-4 z-10 h-10 w-10"
              />
            }
          />
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {product.category.name}
            </span>
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              {product.name}
            </h1>
            <span className="font-heading text-xl font-medium">
              {formatPrice(product.priceAmount, product.currency)}
            </span>
          </div>
          <p className="max-w-md text-muted-foreground">{product.description}</p>
          <div>
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              imageUrl={product.images[0]}
            />
          </div>
          <Accordion type="single" collapsible className="border-t">
            <AccordionItem value="care">
              <AccordionTrigger>{t(`product.careTitle_${product.category.slug}`, { defaultValue: t("product.careTitle_default") })}</AccordionTrigger>
              <AccordionContent>{t(`product.careText_${product.category.slug}`, { defaultValue: t("product.careText_default") })}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>{t("product.shippingTitle")}</AccordionTrigger>
              <AccordionContent>{t("product.shippingText")}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Reveal>
      </div>
    </main>
  );
}
