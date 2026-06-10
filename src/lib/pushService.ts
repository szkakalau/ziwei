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
    } catch (err) {
      console.error("[push] OneSignal delivery failed:", err);
      // Fall through to email
    }
  }

  // Email fallback — send the daily horoscope directly, not a purchase confirmation
  if (process.env.RESEND_API_KEY) {
    try {
      const { getUserById } = await import("@/lib/db");
      const user = await getUserById(params.userId);
      if (user?.email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM!,
          to: user.email,
          subject: `Your daily horoscope — ${params.date}`,
          html: `<p>${params.horoscopePreview}</p>`,
        }).catch((err) => {
          console.error("[push] Resend email fallback failed:", err);
        });
      }
      return { success: true, channel: "email" };
    } catch (err) {
      console.error("[push] Email fallback setup failed:", err);
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
  // Unicode-safe truncation: slice by code points, not code units
  const body = preview.length > 120
    ? Array.from(preview).slice(0, 117).join("") + "..."
    : preview;

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
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/daily`,
    }),
  });

  return res.ok;
}

export async function registerPushToken(userId: string, playerId: string) {
  const { sql } = await import("@/lib/db");
  await sql`
    INSERT INTO push_tokens (user_id, onesignal_player_id, platform)
    VALUES (${userId}, ${playerId}, 'web')
    ON CONFLICT (user_id, onesignal_player_id) DO NOTHING
  `;
}
