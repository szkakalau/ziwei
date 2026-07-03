import { describe, it, expect, vi } from "vitest";

// Mock @neondatabase/serverless to simulate atomic UPDATE behavior.
// updateStreak() now uses INSERT ON CONFLICT DO NOTHING (for new users) and
// a single atomic UPDATE ... RETURNING (for existing users) — no more SELECT.
// The mock must return what the real PostgreSQL CASE logic would produce for
// a user whose last_check_date is 2026-05-31 with current_streak = 5.
vi.mock("@neondatabase/serverless", () => ({
  neon: () => {
    const fn = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const q = strings.join("?");

      // INSERT ... ON CONFLICT DO NOTHING — empty for existing users
      if (q.includes("INSERT INTO streaks")) return [];

      // UPDATE ... RETURNING current_streak — emulate PostgreSQL CASE logic:
      //   WHEN last_check_date = yesterday → current_streak + 1
      //   WHEN last_check_date = today     → current_streak (no change)
      //   ELSE                             → 1 (reset)
      if (q.includes("UPDATE streaks SET")) {
        const yesterdayStr = values[0]; // first CASE WHEN compares against yesterday
        const todayStr = values[1];     // second CASE WHEN compares against today

        if (yesterdayStr === "2026-05-31") {
          // yesterday matches last_check_date → 5 + 1 = 6
          return [{ current_streak: 6 }];
        }
        if (todayStr === "2026-05-31") {
          // today matches last_check_date → no bump → 5
          return [{ current_streak: 5 }];
        }
        // neither → reset to 1
        return [{ current_streak: 1 }];
      }

      // getStreak() still uses SELECT
      if (q.includes("SELECT current_streak FROM streaks")) {
        if (values.includes("nonexistent")) return [];
        return [{ current_streak: 7 }];
      }

      return [];
    };
    return fn;
  },
}));

describe("getStreak", () => {
  it("returns 0 for user with no streak record", async () => {
    const { getStreak } = await import("@/lib/streak");
    const streak = await getStreak("nonexistent");
    expect(streak).toBe(0);
  });
});

describe("updateStreak", () => {
  it("is exported from db module", async () => {
    const { updateStreak } = await import("@/lib/db");
    expect(typeof updateStreak).toBe("function");
  });

  it("increments streak when last visit was yesterday (driver returns Date)", async () => {
    // last_check_date = May 31 (Date object from driver); today = Jun 1 → should bump 5 → 6.
    // BUG: Date object !== "2026-06-01" string comparison falls through to reset → returns 1.
    const { updateStreak } = await import("@/lib/db");
    const result = await updateStreak("u1", "2026-06-01");
    expect(result).toBe(6);
  });

  it("returns current streak without bumping when already checked in today", async () => {
    const { updateStreak } = await import("@/lib/db");
    const result = await updateStreak("u1", "2026-05-31");
    expect(result).toBe(5);
  });
});
