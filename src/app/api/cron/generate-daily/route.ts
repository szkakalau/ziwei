import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "NOT_CONFIGURED" }, { status: 500 });
  }
  const headerSecret = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (headerSecret !== cronSecret) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { getActiveUsers, upsertHoroscope } = await import("@/lib/db");
    const users = await getActiveUsers();

    if (users.length === 0) {
      return NextResponse.json({ ok: true, generated: 0, message: "No active users" });
    }

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const { computeChartFromStored } = await import("@/lib/chartCache");
    const today = new Date().toISOString().slice(0, 10);
    const transitSummary = `Daily transit for ${today}`;

    let generated = 0;
    let failed = 0;
    const batchSize = 5;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      const results = await Promise.allSettled(
        batch.map(async (user) => {
          if (!user.birth_place || !user.chart_data) return;

          const bp = user.birth_place as { lat: number; lng: number; tz: string };
          const chart = await computeChartFromStored({
            birthDate: user.birth_date ?? "1990-01-01",
            birthTime: user.birth_time ?? "12:00",
            location: `${bp.lat},${bp.lng}`,
            allowFallback: true,
          });

          const result = await generateHoroscope(chart, transitSummary);

          await upsertHoroscope({
            userId: user.id,
            date: today,
            horoscopeText: result.text,
            transitSummary: result.transitSummary,
            highlightedStars: result.highlightedStars,
          });

          // Send push notification
          const { sendDailyPush } = await import("@/lib/pushService");
          await sendDailyPush({
            userId: user.id,
            horoscopePreview: result.text.slice(0, 120),
            date: today,
          }).catch(() => {});
        }),
      );

      for (const r of results) {
        if (r.status === "fulfilled") generated++;
        else { failed++; console.error("[cron] user generation failed:", r.reason); }
      }
    }

    return NextResponse.json({ ok: true, generated, failed, total: users.length });
  } catch (err) {
    console.error("[cron] generation failed:", err);
    return NextResponse.json(
      { ok: false, error: "CRON_FAILED" },
      { status: 500 },
    );
  }
}
