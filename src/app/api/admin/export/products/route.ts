import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["id", "name", "slug", "category", "price", "currency", "stock", "featured", "active", "createdAt"],
    products.map((p) => [
      p.id,
      p.name,
      p.slug,
      p.category.name,
      (p.priceAmount / 100).toFixed(2),
      p.currency,
      p.stock,
      p.isFeatured,
      p.isActive,
      p.createdAt.toISOString(),
    ]),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
