import { getSupportEmail } from "@/lib/brand";

export type ChartSummary = {
  placeLabel?: string;
  apparentSolarDate?: string;
  apparentSolarTime?: string;
  isApproximate?: boolean;
  errorCode?: string | null;
  /** Pre-formatted full chart text (e.g. formatChartCompact output). When
   *  present, operators get the full palace→star mapping instead of just
   *  place/date/time, so they can write the reading without re-computing. */
  chartText?: string;
};

export type DeliveryWindow = {
  turnaroundHours: number;
  orderedAtIso: string;
  dueAtIso: string;
  orderedAtLabel: string;
  dueAtLabel: string;
};

export type OpsOrderPayload = {
  sessionId: string;
  userId?: string;
  customerEmail: string;
  focusArea: string;
  question: string;
  birthDate: string;
  birthTime: string;
  location: string;
  gender: "male" | "female";
  allowFallback: boolean;
  deliveryWindow: DeliveryWindow;
  customerReplyMailto: string;
  chartSummary?: ChartSummary;
};

function formatUtcLabel(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function getReadingTurnaroundHours() {
  const raw = process.env.READING_TURNAROUND_HOURS?.trim();
  const parsed = raw ? Number(raw) : 48;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 48;
  }
  return Math.round(parsed);
}

export function buildDeliveryWindow(orderedAtIso: string): DeliveryWindow {
  const turnaroundHours = getReadingTurnaroundHours();
  const orderedAt = new Date(orderedAtIso);
  const dueAt = new Date(orderedAt.getTime() + turnaroundHours * 60 * 60 * 1000);

  return {
    turnaroundHours,
    orderedAtIso,
    dueAtIso: dueAt.toISOString(),
    orderedAtLabel: `${formatUtcLabel(orderedAtIso)} UTC`,
    dueAtLabel: `${formatUtcLabel(dueAt.toISOString())} UTC`,
  };
}

export function getOrderNotificationRecipients(): string[] {
  const raw = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (!raw) {
    return [getSupportEmail()];
  }

  const recipients = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return recipients.length ? recipients : [getSupportEmail()];
}

export function buildCustomerReplyMailto(args: {
  customerEmail: string;
  sessionId: string;
}) {
  const subject = `Your Zi Wei reading order ${args.sessionId}`;
  // TODO: extract to i18n dictionary for localization
  const body = [
    "Hi,",
    "",
    "Thanks again for your order. Here is your personalized Zi Wei reading:",
    "",
    "[Write your reading here]",
    "",
    "Best,",
    "DestinyBlueprint",
  ].join("\n");

  return `mailto:${encodeURIComponent(args.customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function sendOpsWebhook(payload: OpsOrderPayload) {
  const url = process.env.OPS_WEBHOOK_URL?.trim();
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "DestinyBlueprintOpsWebhook/1.0",
      },
      body: JSON.stringify({
        type: "ziwei.consultation_order.created",
        ...payload,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`OPS_WEBHOOK_FAILED:${response.status}`);
    }
  } catch (error) {
    console.error("Failed to send ops webhook:", error);
    throw error;
  }
}
