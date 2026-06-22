import { describe, it, expect, vi } from "vitest";

// Real @neondatabase/serverless behavior: a DATE column (oid 1082) is parsed
// by pg-types `parseDate` into a JS Date object — NOT a string. Mocking it as
// a string hides the streak-reset bug, so the mock here returns a Date.
vi.mock("@neondatabase/serverless", () => ({
  neon: () => {
    const calls: { query: string; values: unknown[] }[] = [];
    const fn = async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const q = strings.join("?");
      calls.push({ query: q, values });
      if (q.includes("SELECT * FROM streaks")) {
        if (values.includes("nonexistent")) return [];
        // last_check_date as a Date object, matching the real driver
        return [{
          user_id: "u1",
          current_streak: 5,
          longest_streak: 7,
          last_check_date: new Date(2026, 4, 31), // May 31 2026, local midnight
        }];
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
