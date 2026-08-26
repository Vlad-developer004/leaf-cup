import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    [
      "id",
      "customerEmail",
      "status",
      "totalAmount",
      "currency",
      "promoCode",
      "discountAmount",
      "shippingCountry",
      "shippingCity",
      "createdAt",
    ],
    orders.map((o) => [
      o.id,
      o.user.email,
      o.status,
      (o.totalAmount / 100).toFixed(2),
      o.currency,
      o.promoCode ?? "",
      (o.discountAmount / 100).toFixed(2),
      o.shippingCountry,
      o.shippingCity,
      o.createdAt.toISOString(),
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
