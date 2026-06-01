import { describe, it, expect, vi } from "vitest";

vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray) => {
    const q = strings.join("?");
    if (q.includes("SELECT * FROM streaks")) {
      if (q.includes("'nonexistent'")) return [];
      return [{ user_id: "u1", current_streak: 5, longest_streak: 7, last_check_date: "2026-05-31" }];
    }
    return [];
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
});
