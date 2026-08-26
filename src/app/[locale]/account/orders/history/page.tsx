import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { getOrdersForUser } from "@/lib/orders";
import { OrderList } from "@/components/account/order-list";

export const metadata: Metadata = {
  title: "История заказов — Leaf & Cup",
};

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const orders = await getOrdersForUser(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/account" className="hover:text-foreground">
          Личный кабинет
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/account/orders" className="hover:text-foreground">
          Заказы
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">История</span>
      </nav>

      <h1 className="mb-8 font-heading text-2xl font-medium tracking-tight md:text-3xl">
        История заказов
      </h1>

      <OrderList orders={orders} emptyText="У вас пока нет заказов." />
    </main>
  );
}
