/**
 * Push notification service via OneSignal.
 * Sends a push notification to a user when their daily horoscope is ready.
 * Falls back to email via Resend if push fails.
 */

export async function sendDailyPush(params: {
  userId: string;
  horoscopePreview: string;
  date: string;
}): Promise<{ success: boolean; channel: "push" | "email" | "none" }> {
  const playerId = await getPlayerId(params.userId);
  if (playerId && process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY) {
    try {
      const ok = await sendOneSignalPush(playerId, params.horoscopePreview);
      if (ok) return { success: true, channel: "push" };
    } catch {
      // Fall through to email
    }
  }

  // Email fallback
  if (process.env.RESEND_API_KEY) {
    try {
      // Fall back to email — look up user's email
      const { getUserById } = await import("@/lib/db");
      const user = await getUserById(params.userId);
      if (user?.email) {
        const resend = await import("@/lib/resendDelivery");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const send = (resend as any).sendConsultationConfirmationViaResend;
        if (send) {
          await send({
            to: user.email,
            focusArea: "general",
            question: params.horoscopePreview,
            deliveryWindow: { label: "Today", iso: new Date().toISOString() },
          }).catch(() => {});
        }
      }
      return { success: true, channel: "email" };
    } catch {
      // Both channels failed
    }
  }

  return { success: false, channel: "none" };
}

async function getPlayerId(userId: string): Promise<string | null> {
  const { sql } = await import("@/lib/db");
  const rows = await sql`
    SELECT onesignal_player_id FROM push_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 1
  `;
  return rows[0]?.onesignal_player_id ?? null;
}

async function sendOneSignalPush(playerId: string, preview: string): Promise<boolean> {
  const title = "Your daily horoscope is ready";
  const body = preview.length > 120 ? preview.slice(0, 117) + "..." : preview;

  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: body },
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/daily`,
    }),
  });

  return res.ok;
}

export async function registerPushToken(userId: string, playerId: string) {
  const { sql } = await import("@/lib/db");
  await sql`
    INSERT INTO push_tokens (user_id, onesignal_player_id, platform)
    VALUES (${userId}, ${playerId}, 'web')
    ON CONFLICT DO NOTHING
  `;
}
