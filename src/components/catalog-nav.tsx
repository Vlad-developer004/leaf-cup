import { Link } from "@/components/localized-link";

export function CatalogNav({
  categories,
  dict,
}: {
  categories: { slug: string; name: string }[];
  dict: { title: string };
}) {
  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/catalog"
        className="text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        {dict.title}
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/catalog?category=${category.slug}`}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
