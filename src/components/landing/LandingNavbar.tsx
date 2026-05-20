import Link from "next/link";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

export default function LandingNavbar({ formAnchorId }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-void/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cinnabar/40 via-gold/50 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:min-h-16 sm:px-6">
        <Link
          href="/#top"
          className="font-display text-lg font-semibold tracking-tight text-ink"
        >
          DestinyBlueprint
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="min-h-11 border-gold/25 px-4 text-xs font-semibold uppercase tracking-wider hover:border-cinnabar/40 hover:bg-cinnabar/10"
        >
          <a
            href={`#${formAnchorId}`}
            onClick={() => track("cta_nav_email_reading_click")}
          >
            Start My Reading
          </a>
        </Button>
      </div>
    </header>
  );
}
