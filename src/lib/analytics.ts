export type TrackParams = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, params?: TrackParams) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  try {
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params ?? {});
      return;
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...(params ?? {}) });
    }
  } catch {
    // no-op
  }
}

