import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Heart,
  Lock,
  MapPin,
  Package,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("account.title") + " — Leaf & Cup",
  };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const [user, ordersCount, addressesCount, favoritesCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { passwordHash: true, emailAnnouncements: true, emailBagReminder: true },
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.address.count({ where: { userId: session.user.id } }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
  ]);

  const initials = (session.user.name ?? session.user.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const notificationsOn = user.emailAnnouncements || user.emailBagReminder;

  const menuItems: {
    href: string;
    icon: LucideIcon;
    label: string;
    subtitle: string;
  }[] = [
    {
      href: "/account/profile",
      icon: UserRound,
      label: t("account.profileLabel"),
      subtitle: `${session.user.name} · ${session.user.email}`,
    },
    {
      href: "/account/orders",
      icon: Package,
      label: t("account.ordersLabel"),
      subtitle: ordersCount > 0 ? `${t("account.ordersCount")}${ordersCount}` : t("account.ordersEmpty"),
    },
    {
      href: "/account/notifications",
      icon: Bell,
      label: t("account.notificationsLabel"),
      subtitle: notificationsOn ? t("account.notificationsOn") : t("account.notificationsOff"),
    },
    {
      href: "/account/favorites",
      icon: Heart,
      label: t("account.favoritesLabel"),
      subtitle: favoritesCount > 0 ? `${t("account.favoritesCount")}${favoritesCount}` : t("account.favoritesEmpty"),
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: t("account.addressesLabel"),
      subtitle: addressesCount > 0 ? `${t("account.addressesCount")}${addressesCount}` : t("account.addressesEmpty"),
    },
    {
      href: "/account/password",
      icon: Lock,
      label: t("account.passwordLabel"),
      subtitle: user.passwordHash ? t("account.passwordChange") : t("account.passwordGoogle"),
    },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 md:py-16">
      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        {t("account.title")}
      </h1>

      <div className="mb-6 flex items-center gap-4 rounded-xl border p-6">
        <Avatar className="h-14 w-14">
          {session.user.image && <AvatarImage src={session.user.image} alt="" />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-heading font-medium">{session.user.name}</p>
          <p className="text-sm text-muted-foreground">{session.user.email}</p>
        </div>
      </div>

      <div className="flex flex-col divide-y rounded-xl border">
        {menuItems.map(({ href, icon: Icon, label, subtitle }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground transition-transform duration-200 ease-out group-hover:scale-105">
              <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-heading font-medium">{label}</span>
              <span className="truncate text-sm text-muted-foreground">{subtitle}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </main>
  );
}
