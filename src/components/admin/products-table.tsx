"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import { SortableHeader } from "@/components/admin/sortable-header";
import { bulkSetProductActive } from "@/lib/admin/product-actions";
import { formatPrice } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  priceAmount: number;
  currency: string;
  stock: number;
  isActive: boolean;
  category: { name: string };
};

export function ProductsTable({
  products,
  dict,
  sort,
  dir,
  filters,
}: {
  products: Product[];
  dict: {
    name: string;
    category: string;
    price: string;
    stock: string;
    status: string;
    actions: string;
    empty: string;
    active: string;
    hidden: string;
    edit: string;
    selectedCount: string;
    bulkShow: string;
    bulkHide: string;
  };
  sort?: "name" | "price" | "stock";
  dir?: "asc" | "desc";
  filters?: { category?: string; q?: string };
}) {
  const makeSortHref = (nextSort: string, nextDir: "asc" | "desc") => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.q) params.set("q", filters.q);
    params.set("sort", nextSort);
    params.set("dir", nextDir);
    return `/admin/products?${params.toString()}`;
  };
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkSetActive(isActive: boolean) {
    startTransition(async () => {
      await bulkSetProductActive([...selected], isActive);
      setSelected(new Set());
      router.refresh();
    });
  }

  const selectedCountLabel = useMemo(
    () => dict.selectedCount.replace("{{count}}", String(selected.size)),
    [dict.selectedCount, selected.size]
  );

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">{selectedCountLabel}</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" disabled={isPending} onClick={() => bulkSetActive(true)}>
              {dict.bulkShow}
            </Button>
            <Button size="sm" variant="outline" disabled={isPending} onClick={() => bulkSetActive(false)}>
              {dict.bulkHide}
            </Button>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <SortableHeader label={dict.name} sortKey="name" currentSort={sort} currentDir={dir} makeHref={makeSortHref} />
            <TableHead>{dict.category}</TableHead>
            <SortableHeader label={dict.price} sortKey="price" currentSort={sort} currentDir={dir} makeHref={makeSortHref} />
            <SortableHeader label={dict.stock} sortKey="stock" currentSort={sort} currentDir={dir} makeHref={makeSortHref} />
            <TableHead>{dict.status}</TableHead>
            <TableHead className="text-right">{dict.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                {dict.empty}
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(product.id)}
                    onCheckedChange={() => toggleOne(product.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                <TableCell>{formatPrice(product.priceAmount, product.currency)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? dict.active : dict.hidden}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      {dict.edit}
                    </Link>
                    <ProductRowActions productId={product.id} isActive={product.isActive} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
