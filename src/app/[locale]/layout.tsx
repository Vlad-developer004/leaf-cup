import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieConsent } from "@/components/cookie-consent";
import { ScrollProgress } from "@/components/scroll-progress";
import { FlyToCartLayer } from "@/components/fly-to-cart";
import "../globals.css";
import initTranslations from "@/lib/i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import { dir } from 'i18next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { resources } = await initTranslations(locale, ['common']);

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <TranslationsProvider locale={locale} namespaces={['common']} resources={resources}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ScrollProgress />
            <FlyToCartLayer />
            <SiteHeader locale={locale} />
            {children}
            <SiteFooter locale={locale} />
            <CookieConsent />
          </ThemeProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
