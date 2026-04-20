import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

export default function LandingNavbar({ formAnchorId }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/55 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:min-h-16 sm:gap-4 sm:px-6 sm:py-0">
        <Link
          href="/#top"
          className="font-display text-base font-semibold tracking-tight text-ink sm:text-lg"
        >
          DestinyBlueprint
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="min-h-11 px-3 text-[11px] font-semibold uppercase tracking-wider transition-transform hover:scale-[1.02] sm:min-h-11 sm:px-4 sm:text-xs"
        >
          <a
            href={`#${formAnchorId}`}
            onClick={() => track("cta_nav_unlock_click")}
          >
            Unlock My Full Report
          </a>
        </Button>
      </div>
    </header>
  );
}

