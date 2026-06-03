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
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:min-h-16 sm:px-6">
        <Link
          href="/#top"
          className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:text-gold"
        >
          <Compass className="h-5 w-5 text-gold/60" aria-hidden />
          DestinyBlueprint
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="min-h-10 border-gold/20 px-4 text-xs font-semibold uppercase tracking-wider text-ink-muted transition-all hover:border-cinnabar/40 hover:bg-cinnabar/[0.08] hover:text-ink"
        >
          <a
            href={`#${formAnchorId}`}
            onClick={() => track("cta_nav_email_reading_click")}
          >
            Get My Free Snapshot
          </a>
        </Button>
      </div>
    </header>
  );
}
