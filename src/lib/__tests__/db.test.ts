import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════════
// Shared neon mock — returns results keyed by SQL pattern
// ═══════════════════════════════════════════════════════════════════════

const DB: Record<string, unknown[]> = {
  users: [
    { id: "u1", email: "a@b.com", password_hash: "hash",
      birth_date: "2000-01-01", birth_time: "12:00", birth_place: { lat: 30, lng: 120, tz: "Asia/Shanghai" },
      chart_data: { palaces: [{ name: "Soul" }] },
      subscription_status: "active", trial_ends_at: null, stripe_customer_id: null,
      has_used_trial: false, consultation_focus: null, consultation_question: null,
      chat_count: 3, created_at: new Date("2026-01-01T00:00:00Z"),
    },
  ],
  horoscopes: [
    { id: "h1", user_id: "u1", date: new Date("2026-07-03"),
      horoscope_text: "Your core guidance for today…", transit_summary: "test transit",
      highlighted_stars: ["emperor", "advisor"], generated_at: new Date(),
    },
  ],
};

function mockNeonQuery(strings: TemplateStringsArray, ...values: unknown[]): unknown[] {
  const q = strings.join("?");

  // ── users ──────────────────────────────────────────────────────────
  if (q.includes("FROM users WHERE email")) {
    const email = values[0];
    return DB.users.filter((u) => (u as Record<string, unknown>).email === email);
  }
  if (q.includes("FROM users WHERE id") && q.includes("LIMIT 1")) {
    const id = values[0];
    return DB.users.filter((u) => (u as Record<string, unknown>).id === id);
  }
  if (q.includes("INSERT INTO users")) {
    const row = { id: "new-id", email: values[0] };
    return [row];
  }
  if (q.includes("UPDATE users SET") && q.includes("subscription_status")) return [];
  if (q.includes("UPDATE users SET") && q.includes("chat_count")) return [{ chat_count: 4 }];
  if (q.includes("FROM users") && q.includes("subscript_status")) return DB.users;

  // ── horoscopes ────────────────────────────────────────────────────
  if (q.includes("daily_horoscopes") && q.includes("user_id")) {
    const uid = values[0];
    const date = values[1];
    const match = DB.horoscopes.filter((h) => {
      const hr = h as Record<string, unknown>;
      return hr.user_id === uid;
    });
    return match.length > 0 ? [match[0]] : [];
  }
  if (q.includes("INSERT INTO daily_horoscopes")) return [];

  // ── streaks ───────────────────────────────────────────────────────
  if (q.includes("FROM streaks WHERE user_id")) return [{ current_streak: 7 }];

  return [];
}

vi.mock("@neondatabase/serverless", () => ({
  neon: () => mockNeonQuery,
}));

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe("getUserByEmail", () => {
  it("returns user when found", async () => {
    const { getUserByEmail } = await import("@/lib/db");
    const user = await getUserByEmail("a@b.com");
    expect(user).toBeTruthy();
    expect((user as Record<string, unknown>).id).toBe("u1");
  });

  it("returns null when not found", async () => {
    const { getUserByEmail } = await import("@/lib/db");
    const user = await getUserByEmail("no@user.com");
    expect(user).toBeNull();
  });
});

describe("getUserById", () => {
  it("returns user when found", async () => {
    const { getUserById } = await import("@/lib/db");
    const user = await getUserById("u1");
    expect(user).toBeTruthy();
  });

  it("returns null when not found", async () => {
    const { getUserById } = await import("@/lib/db");
    const user = await getUserById("nonexistent");
    expect(user).toBeNull();
  });
});

describe("createUser", () => {
  it("returns id and email on success", async () => {
    const { createUser } = await import("@/lib/db");
    const user = await createUser({ email: "new@test.com", passwordHash: "hash" });
    expect(user).toEqual({ id: "new-id", email: "new@test.com" });
  });
});

describe("updateSubscription", () => {
  it("does not throw", async () => {
    const { updateSubscription } = await import("@/lib/db");
    await expect(updateSubscription("u1", { status: "active" })).resolves.toBeUndefined();
  });
});

describe("getHoroscope", () => {
  it("returns cached horoscope for matching user+date", async () => {
    const { getHoroscope } = await import("@/lib/db");
    const h = await getHoroscope("u1", "2026-07-03");
    expect(h).toBeTruthy();
    expect((h as Record<string, unknown>).horoscope_text).toContain("Your core guidance");
  });

  it("returns null for non-existent user+date", async () => {
    const { getHoroscope } = await import("@/lib/db");
    const h = await getHoroscope("u99", "2099-01-01");
    expect(h).toBeNull();
  });
});

describe("upsertHoroscope", () => {
  it("does not throw on insert", async () => {
    const { upsertHoroscope } = await import("@/lib/db");
    await expect(
      upsertHoroscope({
        userId: "u1", date: "2026-07-03",
        horoscopeText: "Test", transitSummary: "summary",
        highlightedStars: ["emperor"],
      }),
    ).resolves.toBeUndefined();
  });
});

describe("getActiveUsers", () => {
  it("returns active users array", async () => {
    const { getActiveUsers } = await import("@/lib/db");
    const users = await getActiveUsers();
    expect(Array.isArray(users)).toBe(true);
  });
});

describe("incrementChatCount", () => {
  it("returns allowed flag and used count", async () => {
    const { incrementChatCount } = await import("@/lib/db");
    const result = await incrementChatCount("u1");
    expect(result).toEqual({ allowed: true, used: 4 });
  });
});
