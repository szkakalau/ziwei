import { sql } from "./client";

/** Update (or create) a user's streak. Returns the new current_streak. */
export async function updateStreak(
  userId: string,
  today: string,
): Promise<number> {
  // Try an atomic INSERT first — ON CONFLICT DO NOTHING avoids the TOCTOU
  // race where two concurrent requests both see no row and both try INSERT,
  // causing a duplicate-key 500 error.
  const inserted = await sql`
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_check_date)
    VALUES (${userId}, 1, 1, ${today}::date)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING current_streak
  `;
  if (inserted.length > 0) {
    return inserted[0].current_streak as number;
  }

  // Row already existed — use a single atomic UPDATE instead of separate
  // SELECT → compute → UPDATE steps. Two concurrent requests for the same
  // user both hit this UPDATE; PostgreSQL's row-level locking serializes
  // them so each sees the other's result — no lost increments (P1-1).
  const todayDate = new Date(today + "T12:00:00Z");
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

  const updated = await sql`
    UPDATE streaks SET
      current_streak = CASE
        WHEN last_check_date = ${yesterdayStr}::date THEN current_streak + 1
        WHEN last_check_date = ${today}::date THEN current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(
        longest_streak,
        CASE
          WHEN last_check_date = ${yesterdayStr}::date THEN current_streak + 1
          ELSE 1
        END
      ),
      last_check_date = ${today}::date,
      updated_at = now()
    WHERE user_id = ${userId}
    RETURNING current_streak
  `;

  return (updated[0]?.current_streak as number) ?? 1;
}
