import Image from "next/image";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-center border-b px-6 py-4">
      <Image
        src="/images/logo.png"
        alt="Leaf & Cup"
        width={858}
        height={892}
        className="h-14 w-auto"
        priority
      />
    </header>
  );
}
