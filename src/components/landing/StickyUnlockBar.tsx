"use client";

import { Button } from "@/components/ui/button";

type Props = {
  onContinue: () => void;
  pending?: boolean;
  priceLabel?: string;
  error?: string | null;
};

export default function StickyUnlockBar({ onContinue, pending, priceLabel = "$4.99/mo", error }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/[0.08] bg-white/90 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <p className="font-body text-sm text-ink-muted">
          Unlock your full Zi Wei reading — {priceLabel} with a 7-day free trial. Includes daily AI horoscopes + a human-written email reading.
        </p>
        <div className="flex flex-col items-end gap-2">
          {error ? (
            <p className="font-body text-sm text-cinnabar" role="alert">
              {error}
            </p>
          ) : null}
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
    </div>
  );
}
