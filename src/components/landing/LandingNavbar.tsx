import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { Compass } from "lucide-react";

type Props = {
  formAnchorId: string;
};

export default function LandingNavbar({ formAnchorId }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-void/75 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      {/* Top accent line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
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
        <Button
          asChild
          variant="outline"
          size="sm"
          className="min-h-9 border-gold/20 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-muted transition-all hover:border-cinnabar/40 hover:bg-cinnabar/[0.08] hover:text-ink sm:min-h-10 sm:px-4 sm:text-xs"
        >
          <a
            href={`#${formAnchorId}`}
            onClick={() => track("cta_nav_email_reading_click")}
          >
            <span className="hidden sm:inline">Get My Free Snapshot</span>
            <span className="sm:hidden">Free Snapshot</span>
          </a>
        </Button>
      </div>
    </header>
  );
}
