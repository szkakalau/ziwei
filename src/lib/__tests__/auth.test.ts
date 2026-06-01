import { describe, it, expect, vi } from "vitest";

// Mock neon serverless
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray) => {
    const query = strings.join("?");
    if (query.includes("FROM users WHERE email")) return [];
    if (query.includes("INSERT INTO users")) return [{ id: "test-id", email: "test@example.com" }];
    return [];
  },
}));

// Set SESSION_SECRET for tests
process.env.SESSION_SECRET = "test-secret-key-for-unit-tests-32chars";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: () => new Map(),
}));

// Mock iron-session
vi.mock("iron-session", () => {
  const sessions = new Map<string, Record<string, unknown>>();
  return {
    getIronSession: async () => ({
      userId: sessions.get("destinyblueprint-session")?.userId,
      save: async function () {
        sessions.set("destinyblueprint-session", { userId: this.userId ?? null });
      },
      destroy: function () {
        sessions.delete("destinyblueprint-session");
      },
    }),
  };
});

describe("Auth (unit)", () => {
  it("registerUser rejects weak passwords", async () => {
    const { registerUser } = await import("@/lib/auth");
    await expect(registerUser("test@test.com", "123")).rejects.toThrow("Password must be at least 8 characters");
  });

  it("registerUser rejects duplicate emails", async () => {
    // Mock existing user
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "existing", email: "test@test.com", password_hash: "hash",
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { registerUser } = await import("@/lib/auth");
    await expect(registerUser("test@test.com", "password123")).rejects.toThrow("Email already registered");
  });

  it("loginUser returns user on valid credentials", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("password123", 1);
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@test.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");
    const user = await loginUser("test@test.com", "password123");
    expect(user.email).toBe("test@test.com");
  });
});
