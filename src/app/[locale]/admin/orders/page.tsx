import { Link } from "@/components/localized-link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Reveal } from "@/components/reveal";
import { SortableHeader } from "@/components/admin/sortable-header";
import { getAdminOrders, type OrderSortKey } from "@/lib/admin/orders";
import { getOrderStatusLabels, orderStatusBadgeVariant } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";
import { OrderStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

import initTranslations from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  return {
    title: t("adminOrders.title") + " — " + t("admin.title") + " — Leaf & Cup",
  };
}

const statusFilters = (t: (key: string) => string): { value?: OrderStatus; label: string }[] => {
  const statusLabels = getOrderStatusLabels(t);
  return [
    { value: undefined, label: t("adminOrders.filterAll") },
    ...Object.values(OrderStatus).map((status) => ({
      value: status,
      label: statusLabels[status],
    })),
  ];
};

export default async function AdminOrdersPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string; sort?: string; dir?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { t } = await initTranslations(locale, ["common"]);
  const { page: pageParam, status: statusParam, q, sort: sortParam, dir: dirParam } = await searchParams;
  const activeStatus = Object.values(OrderStatus).includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const sort = (["date", "amount"] as const).includes(sortParam as OrderSortKey)
    ? (sortParam as OrderSortKey)
    : undefined;
  const dir = dirParam === "asc" ? "asc" : "desc";

  const { orders, page, totalPages } = await getAdminOrders({
    page: Number(pageParam) || 1,
    status: activeStatus,
    search: q,
    sort,
    dir,
  });
  const statusLabels = getOrderStatusLabels(t);

  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (activeStatus) params.set("status", activeStatus);
    if (q) params.set("q", q);
    if (sort) { params.set("sort", sort); params.set("dir", dir); }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  };

  const makeSortHref = (nextSort: string, nextDir: "asc" | "desc") => {
    const params = new URLSearchParams();
    if (activeStatus) params.set("status", activeStatus);
    if (q) params.set("q", q);
    params.set("sort", nextSort);
    params.set("dir", nextDir);
    return `/admin/orders?${params.toString()}`;
  };

  const exportHref = "/api/admin/export/orders";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-medium tracking-tight">{t("adminOrders.title")}</h1>
        <Button asChild variant="outline">
          <a href={exportHref}>{t("adminOrders.exportCsv")}</a>
        </Button>
      </div>

      <form className="flex gap-2" action="/admin/orders">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        <Input name="q" placeholder={t("adminOrders.searchPlaceholder")} defaultValue={q} className="max-w-sm" />
        <Button type="submit" variant="outline">
          {t("adminOrders.searchBtn")}
        </Button>
      </form>

      <nav className="flex flex-wrap gap-2">
        {statusFilters(t).map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/orders?status=${filter.value}` : "/admin/orders"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activeStatus === filter.value
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-muted"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      <Reveal className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminOrders.number")}</TableHead>
              <TableHead>{t("adminOrders.customer")}</TableHead>
              <SortableHeader label={t("adminOrders.date")} sortKey="date" currentSort={sort} currentDir={dir} makeHref={makeSortHref} />
              <SortableHeader label={t("adminOrders.amount")} sortKey="amount" currentSort={sort} currentDir={dir} makeHref={makeSortHref} />
              <TableHead>{t("adminOrders.status")}</TableHead>
              <TableHead className="text-right">{t("adminOrders.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {t("adminOrders.empty")}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                      order.createdAt
                    )}
                  </TableCell>
                  <TableCell>{formatPrice(order.totalAmount, order.currency)}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusBadgeVariant[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {t("adminOrders.open")}
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Reveal>

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </div>
  );
}
