import { Link } from "@/components/localized-link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  makeHref,
}: {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: "asc" | "desc";
  makeHref: (sort: string, dir: "asc" | "desc") => string;
}) {
  const isActive = currentSort === sortKey;
  const nextDir: "asc" | "desc" = isActive && currentDir === "asc" ? "desc" : "asc";
  const Icon = isActive ? (currentDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <TableHead>
      <Link
        href={makeHref(sortKey, nextDir)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        <Icon className={isActive ? "size-3.5 text-foreground" : "size-3.5 text-muted-foreground/50"} />
      </Link>
    </TableHead>
  );
}
