import { sql, updateStreak as dbUpdateStreak } from "@/lib/db";

export async function bumpStreak(userId: string): Promise<number> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    return await dbUpdateStreak(userId, today);
  } catch (error) {
    console.error("Failed to bump streak:", error);
    throw new Error("Failed to update streak");
  }
}

export async function getStreak(userId: string): Promise<number> {
  try {
    const rows = await sql`
      SELECT current_streak FROM streaks WHERE user_id = ${userId} LIMIT 1
    `;
    return rows[0]?.current_streak ?? 0;
  } catch (error) {
    console.error("Failed to get streak:", error);
    return 0;
  }
}
