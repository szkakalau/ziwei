import { sql } from "./client";

/** Get a users daily horoscope for a specific date. */
export async function getHoroscope(userId: string, date: string) {
  const rows = await sql`
    SELECT * FROM daily_horoscopes
    WHERE user_id = ${userId} AND date = ${date}::date
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Upsert a daily horoscope (idempotent on user_id + date). */
export async function upsertHoroscope(params: {
  userId: string;
  date: string;
  horoscopeText: string;
  transitSummary?: string;
  highlightedStars?: string[];
}): Promise<void> {
  await sql`
    INSERT INTO daily_horoscopes (user_id, date, horoscope_text, transit_summary, highlighted_stars)
    VALUES (
      ${params.userId},
      ${params.date}::date,
      ${params.horoscopeText},
      ${params.transitSummary ?? null},
      ${JSON.stringify(params.highlightedStars ?? [])}::jsonb
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      horoscope_text = EXCLUDED.horoscope_text,
      transit_summary = EXCLUDED.transit_summary,
      highlighted_stars = EXCLUDED.highlighted_stars,
      generated_at = now()
  `;
}
