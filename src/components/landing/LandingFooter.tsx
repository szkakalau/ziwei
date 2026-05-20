import Link from "next/link";
import { Mail } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-mist/50">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jade/30 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-xs">
          <p className="font-display text-lg font-semibold text-ink">DestinyBlueprint</p>
          <p className="mt-2 font-body text-sm text-ink-dim">
            © 2024 DestinyBlueprint. All rights reserved.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 font-body text-sm text-ink-muted">
          <li>
            <Link href="/privacy" className="transition-colors hover:text-gold">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="transition-colors hover:text-gold">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/contact" className="transition-colors hover:text-gold">
              Contact Us
            </Link>
          </li>
        </ul>
        <a
          href="mailto:support@destinyblueprint.xyz"
          className="inline-flex items-center gap-2 font-body text-sm text-ink-muted transition-colors hover:text-gold"
        >
          <Mail className="h-4 w-4 shrink-0" aria-hidden />
          support@destinyblueprint.xyz
        </a>
      </div>
    </footer>
  );
}
