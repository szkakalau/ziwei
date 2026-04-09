import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

const links = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/affiliate", label: "Affiliate" },
] as const;

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-mist/50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-12">
        <p className="max-w-md font-body text-sm text-ink-dim">
          © {new Date().getFullYear()} {BRAND_NAME}. For reflection and
          entertainment only—not medical, legal, or financial advice.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-muted">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="transition-colors hover:text-gold">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
