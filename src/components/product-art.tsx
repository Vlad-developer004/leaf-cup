import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProductArt({
  icon: Icon,
  images,
  alt,
  className,
  sizes,
  id,
  overlay,
}: {
  icon: LucideIcon;
  images?: string[];
  alt?: string;
  className?: string;
  sizes?: string;
  id?: string;
  overlay?: ReactNode;
}) {
  const image = images?.[0];

  if (image) {
    return (
      <div id={id} className={cn("relative overflow-hidden bg-secondary", className)}>
        <Image
          src={image}
          alt={alt ?? ""}
          fill
          sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {overlay}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-accent to-secondary",
        className
      )}
    >
      <Icon
        strokeWidth={1}
        className="absolute inset-0 m-auto h-2/3 w-2/3 text-primary/15 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-3"
      />
      {overlay}
    </div>
  );
}
