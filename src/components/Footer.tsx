import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/affiliate", label: "Affiliate" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Ziwei AI. For reflection and
          entertainment only—not medical, legal, or financial advice.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-zinc-600">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-violet-700">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
