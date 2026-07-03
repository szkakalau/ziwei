import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock neon serverless
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray) => {
    const query = strings.join("?");
    if (query.includes("FROM users WHERE email")) return [];
    if (query.includes("INSERT INTO users")) return [{ id: "test-id", email: "test@example.com" }];
    return [];
  },
}));

// Set SESSION_SECRET for most tests (individual tests override)
const DEFAULT_SECRET = "test-secret-key-for-unit-tests-32chars";

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: () => new Map(),
}));

// Mock iron-session with a shared session store
const sessions = new Map<string, Record<string, unknown>>();
vi.mock("iron-session", () => ({
  getIronSession: async () => ({
    get userId() {
      return sessions.get("destinyblueprint-session")?.userId as string | undefined;
    },
    set userId(v: string | undefined) {
      const s = sessions.get("destinyblueprint-session") ?? {};
      s.userId = v ?? null;
      sessions.set("destinyblueprint-session", s);
    },
    save: async function () {
      sessions.set("destinyblueprint-session", { userId: (sessions.get("destinyblueprint-session") as Record<string, unknown> | undefined)?.userId ?? null });
    },
    destroy: function () {
      sessions.delete("destinyblueprint-session");
    },
  }),
}));

beforeEach(() => {
  process.env.SESSION_SECRET = DEFAULT_SECRET;
  sessions.clear();
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════
// registerUser
// ═══════════════════════════════════════════════════════════════════════

describe("registerUser", () => {
  it("rejects weak passwords (too short)", async () => {
    vi.resetModules();
    const { registerUser } = await import("@/lib/auth");
    await expect(registerUser("test@test.com", "123")).rejects.toThrow(
      "Password must be at least 10 characters",
    );
  });

  it("rejects passwords missing complexity (no uppercase)", async () => {
    vi.resetModules();
    const { registerUser } = await import("@/lib/auth");
    await expect(registerUser("test@test.com", "abcdefghij")).rejects.toThrow(
      "uppercase",
    );
  });

  it("rejects duplicate emails", async () => {
    vi.resetModules();
    const { registerUser } = await import("@/lib/auth");
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "existing", email: "test@test.com", password_hash: "hash",
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    await expect(registerUser("test@test.com", "Password123")).rejects.toThrow(
      "Email already registered",
    );
  });

  it("catches TOCTOU 23505 race and throws DUPLICATE_EMAIL", async () => {
    vi.resetModules();
    const { registerUser } = await import("@/lib/auth");
    const db = await import("@/lib/db");

    // getUserByEmail returns null (no user found) → passes duplicate check
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce(null);
    // createUser throws Postgres 23505 — another request won the race
    const pgError = Object.assign(new Error("duplicate key"), { code: "23505" });
    vi.spyOn(db, "createUser").mockRejectedValueOnce(pgError);

    await expect(registerUser("new@test.com", "Password123")).rejects.toThrow(
      "Email already registered",
    );
  });

  it("rejects invalid email format", async () => {
    vi.resetModules();
    const { registerUser } = await import("@/lib/auth");
    await expect(registerUser("not-an-email", "Password123")).rejects.toThrow(
      "Invalid email address",
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// loginUser
// ═══════════════════════════════════════════════════════════════════════

describe("loginUser", () => {
  it("returns user on valid credentials", async () => {
    vi.resetModules();
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Password123", 1);
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@test.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");
    const user = await loginUser("test@test.com", "Password123");
    expect(user.email).toBe("test@test.com");
  });

  it("throws INVALID_CREDENTIALS for nonexistent email (constant-time defense)", async () => {
    vi.resetModules();
    const db = await import("@/lib/db");
    // getUserByEmail returns null — user doesn't exist
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce(null);

    const { loginUser } = await import("@/lib/auth");
    await expect(loginUser("no@user.com", "Password123")).rejects.toThrow(
      "Invalid email or password",
    );
  });

  it("throws INVALID_CREDENTIALS for wrong password", async () => {
    vi.resetModules();
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("CorrectPassword1", 1);
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@test.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");
    await expect(loginUser("test@test.com", "WrongPassword1")).rejects.toThrow(
      "Invalid email or password",
    );
  });

  it("normalizes email — lowercases and strips + aliases", async () => {
    vi.resetModules();
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Password123", 1);
    const db = await import("@/lib/db");
    const getUserByEmailSpy = vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@example.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");

    // Test with uppercase and +alias → should be normalized to "test@example.com"
    const user = await loginUser("Test+Alias@Example.com", "Password123");
    expect(user.email).toBe("test@example.com");
    // Verify getUserByEmail was called with normalized email
    expect(getUserByEmailSpy).toHaveBeenCalledWith("test@example.com");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// SESSION_SECRET validation
// ═══════════════════════════════════════════════════════════════════════

describe("SESSION_SECRET validation", () => {
  it("throws SESSION_MISCONFIGURED when SESSION_SECRET is not set", async () => {
    delete (process.env as Record<string, string>).SESSION_SECRET;
    vi.resetModules();

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Password123", 1);
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@test.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");
    await expect(loginUser("test@test.com", "Password123")).rejects.toThrow(
      "SESSION_SECRET environment variable is required",
    );
  });

  it("throws SESSION_MISCONFIGURED when SESSION_SECRET is too short (< 32 chars)", async () => {
    process.env.SESSION_SECRET = "short";
    vi.resetModules();

    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("Password123", 1);
    const db = await import("@/lib/db");
    vi.spyOn(db, "getUserByEmail").mockResolvedValueOnce({
      id: "user-1", email: "test@test.com", password_hash: hash,
      birth_date: null, birth_time: null, birth_place: null, chart_data: null,
      subscription_status: "free", trial_ends_at: null, stripe_customer_id: null,
      created_at: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { loginUser } = await import("@/lib/auth");
    await expect(loginUser("test@test.com", "Password123")).rejects.toThrow(
      "SESSION_SECRET must be at least 32 characters",
    );
  });
});
