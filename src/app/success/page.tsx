import { Suspense } from "react";
import SuccessClient from "./successClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-20 font-body text-ink-muted">
          Loading…
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}

