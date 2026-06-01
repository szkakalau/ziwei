import { updateStreak as dbUpdateStreak } from "@/lib/db";

export async function bumpStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  return dbUpdateStreak(userId, today);
}

export async function getStreak(userId: string): Promise<number> {
  const { sql } = await import("@/lib/db");
  const rows = await sql`
    SELECT current_streak FROM streaks WHERE user_id = ${userId} LIMIT 1
  `;
  return rows[0]?.current_streak ?? 0;
}
