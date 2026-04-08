import Link from "next/link";
import { getReadingUrl } from "@/lib/site";

const nav = [
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const;

export default function Navbar() {
  const readingUrl = getReadingUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-zinc-900"
        >
          Ziwei AI
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-violet-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={readingUrl}
            className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
          >
            Get my reading
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-zinc-100 px-4 py-2 text-sm text-zinc-600 md:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
