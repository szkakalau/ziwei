import { describe, it, expect, vi } from "vitest";

// Mock neon for sql used by getStreak (streak.ts imports sql from @/lib/db)
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const q = strings.join("?");
    if (q.includes("FROM streaks WHERE user_id")) {
      if (values[0] === "no-streak") return [];
      return [{ current_streak: 7 }];
    }
    return [];
  },
}));

// Mock the DB-layer updateStreak so we can verify bumpStreak passes the right args
const mockDbUpdateStreak = vi.fn();

// We need to mock @/lib/db — but we also import it for `sql`.
// Use vi.mock with a factory that re-exports the real sql plus our spy.
vi.mock("@/lib/db", async () => {
  const actual = await vi.importActual<typeof import("@/lib/db")>("@/lib/db");
  return {
    ...actual,
    updateStreak: mockDbUpdateStreak,
  };
});

describe("bumpStreak", () => {
  it("computes today's date and delegates to dbUpdateStreak", async () => {
    mockDbUpdateStreak.mockResolvedValueOnce(8);

    const { bumpStreak } = await import("@/lib/streak");
    const result = await bumpStreak("u1");

    expect(result).toBe(8);
    expect(mockDbUpdateStreak).toHaveBeenCalledTimes(1);
    // First arg is userId, second is today in YYYY-MM-DD
    const todayStr = new Date().toISOString().slice(0, 10);
    expect(mockDbUpdateStreak).toHaveBeenCalledWith("u1", todayStr);
  });

  it("throws wrapped error on DB failure", async () => {
    mockDbUpdateStreak.mockRejectedValueOnce(new Error("DB down"));

    const { bumpStreak } = await import("@/lib/streak");
    await expect(bumpStreak("u1")).rejects.toThrow("Failed to update streak");
  });
});

describe("getStreak", () => {
  it("returns current_streak when user has a record", async () => {
    const { getStreak } = await import("@/lib/streak");
    const streak = await getStreak("has-streak");
    expect(streak).toBe(7);
  });

  it("returns 0 when user has no streak record", async () => {
    const { getStreak } = await import("@/lib/streak");
    const streak = await getStreak("no-streak");
    expect(streak).toBe(0);
  });
});
