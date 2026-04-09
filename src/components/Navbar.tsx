import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";
import ReadingNavLink from "@/components/ReadingNavLink";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/75 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:gap-4 sm:px-6 sm:py-0">
        <Link
          href="/"
          className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg"
        >
          {BRAND_NAME}
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ReadingNavLink
            href={readingUrl}
            className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-sm border border-gold/35 bg-gradient-to-br from-cinnabar to-cinnabar-deep px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ink shadow-[0_0_24px_-4px_rgba(201,84,60,0.5)] transition-all hover:border-gold/50 hover:brightness-110 sm:px-4 sm:text-xs"
          >
            Get my reading
          </ReadingNavLink>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto overscroll-x-contain border-t border-white/5 px-4 py-2.5 text-sm text-ink-muted [-webkit-overflow-scrolling:touch] md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap hover:text-gold"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
