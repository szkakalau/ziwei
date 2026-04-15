"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onUnlock: () => void;
  pending?: boolean;
  priceLabel?: string;
};

export default function StickyUnlockBar({ onUnlock, pending, priceLabel = "$9" }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void/75 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="font-body text-sm text-ink-muted">
          Unlock your full 12-palace analysis, 10-year cycle forecast and more for just {priceLabel}
        </p>
        <Button
          type="button"
          variant="cta"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={onUnlock}
        >
          {pending ? "Opening secure checkout…" : "Unlock Full Report Now · 30-Day Guarantee"}
        </Button>
      </div>
    </div>
  );
}

