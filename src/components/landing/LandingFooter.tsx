import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-mist/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-sm text-ink-dim">
            © 2024 DestinyBlueprint. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-muted">
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
          <p className="font-body text-sm text-ink-dim">
            support@destinyblueprint.xyz
          </p>
        </div>
      </div>
    </footer>
  );
}

