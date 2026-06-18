"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { Compass } from "lucide-react";

type Props = {
  formAnchorId?: string;
};

export default function LandingNavbar({ formAnchorId = "" }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-gold/[0.06] bg-void/70 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
      {/* Top accent — gold/star gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 via-star/30 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:min-h-16 sm:gap-4 sm:px-6">
        <Link
          href="/#top"
          className="flex items-center gap-1.5 font-display text-base font-semibold tracking-tight text-ink transition-colors hover:text-gold sm:gap-2 sm:text-lg"
        >
          <Compass className="h-4 w-4 text-gold/60 sm:h-5 sm:w-5" aria-hidden />
          <span className="hidden xs:inline">DestinyBlueprint</span>
          <span className="xs:hidden">DB</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/daily"
            className="hidden font-body text-sm text-ink-dim transition-colors hover:text-ink-muted sm:inline"
          >
            Daily
          </Link>
          <Link
            href="/pricing"
            className="hidden font-body text-sm text-ink-dim transition-colors hover:text-ink-muted sm:inline"
          >
            Pricing
          </Link>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="min-h-9 border-gold/15 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted transition-all hover:border-cinnabar/30 hover:bg-cinnabar/[0.06] hover:text-ink sm:min-h-10 sm:px-4 sm:text-xs"
          >
            <a
              href={formAnchorId ? `#${formAnchorId}` : "/#top"}
              onClick={() => track("cta_nav_email_reading_click")}
            >
              <span className="hidden sm:inline">Get My Free Snapshot</span>
              <span className="sm:hidden">Free Snapshot</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
