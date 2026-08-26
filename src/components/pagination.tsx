import { Link } from "@/components/localized-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-2">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted",
          page === 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={makeHref(n)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors",
            n === page
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted"
          )}
        >
          {n}
        </Link>
      ))}
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted",
          page === totalPages && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
