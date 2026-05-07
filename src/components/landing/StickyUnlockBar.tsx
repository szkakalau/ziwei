"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onContinue: () => void;
  pending?: boolean;
  priceLabel?: string;
};

export default function StickyUnlockBar({ onContinue, pending, priceLabel = "$99" }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-void/75 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="font-body text-sm text-ink-muted">
          Book your human Zi Wei email reading for {priceLabel} and get delivery within 24-48 hours
        </p>
        <Button
          type="button"
          variant="cta"
          className="w-full sm:w-auto"
          disabled={pending}
          onClick={onContinue}
        >
          {pending ? "Opening secure checkout..." : "Continue To Checkout"}
        </Button>
      </div>
    </div>
  );
}
