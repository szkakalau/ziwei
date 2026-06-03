import Link from "next/link";
import { Mail, Compass } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-mist/50">
      {/* Top accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jade/25 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link
              href="/#top"
              className="inline-flex items-center gap-2 font-display text-lg font-semibold text-ink transition-colors hover:text-gold"
            >
              <Compass className="h-5 w-5 text-gold/60" aria-hidden />
              DestinyBlueprint
            </Link>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-dim">
              Ancient Zi Wei Dou Shu astrology, delivered with modern precision.
              Daily AI horoscopes and human-written email readings based on your unique birth chart.
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
              © {new Date().getFullYear()} DestinyBlueprint. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Pages</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/#top" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Legal</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/privacy" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="font-body text-sm text-ink-muted transition-colors hover:text-gold">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">Get in touch</p>
            <a
              href="mailto:support@destinyblueprint.xyz"
              className="mt-3 inline-flex items-center gap-2 font-body text-sm text-ink-muted transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              support@destinyblueprint.xyz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
