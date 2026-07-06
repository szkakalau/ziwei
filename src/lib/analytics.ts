export type TrackParams = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, params?: TrackParams) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    rdt?: (...args: unknown[]) => void;
  };

  try {
    // GA4
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params ?? {});
    } else if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event, ...(params ?? {}) });
    }

    // Reddit Pixel
    if (typeof w.rdt === "function") {
      w.rdt("track", event, params ?? {});
    }
  } catch {
    // no-op
  }
}

