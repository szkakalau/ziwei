// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  birth_date: "1990-06-15",
  birth_time: "12:00",
  birth_place: { lat: 22.54, lng: 114.06, tz: "Asia/Shanghai" },
  chart_data: { palaces: [] },
  subscription_status: "active" as const,
  trial_ends_at: null,
};

// Mocks — vitest hoists vi.mock() above imports
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn(() => null) }));

const mockCheckSubscription = vi.fn(() => null);
vi.mock("@/lib/subscriptionGuard", () => ({ checkSubscription: mockCheckSubscription }));

const mockGetHoroscope = vi.fn(() => null);
const mockUpsertHoroscope = vi.fn(() => undefined);
vi.mock("@/lib/db", () => ({
  getHoroscope: mockGetHoroscope,
  upsertHoroscope: mockUpsertHoroscope,
}));

const mockComputeChart = vi.fn(() => ({ palaces: [] }));
vi.mock("@/lib/chartCache", () => ({ computeOrGetCachedChart: mockComputeChart }));

const mockGenerate = vi.fn(() => ({
  text: "Fresh horoscope text that is long enough for validation.",
  highlightedStars: ["Architect"],
  transitSummary: "Daily transit",
  source: "deepseek" as const,
}));
vi.mock("@/lib/horoscopeGenerator", () => ({ generateHoroscope: mockGenerate }));

const mockSendPush = vi.fn(() => Promise.resolve());
vi.mock("@/lib/pushService", () => ({ sendDailyPush: mockSendPush }));

const mockDailyTransit = {
  date: "2026-06-17",
  stem: "壬",
  stemDescription: "Yang Water",
  summary: "Tian Liang·Sage Star 化禄、Zi Wei·Emperor Star 化权、Zuo Fu·Left Hand Star 化科、Wu Qu·Marshal Star 化忌",
  sihua: { hualu: "sage", huaquan: "emperor", huake: "zuofu", huaji: "general" },
  display: {
    hualu: { pinyin: "Tian Liang", alias: "Sage Star", keywords: [] },
    huaquan: { pinyin: "Zi Wei", alias: "Emperor Star", keywords: [] },
    huake: { pinyin: "Zuo Fu", alias: "Left Hand Star", keywords: [] },
    huaji: { pinyin: "Wu Qu", alias: "Marshal Star", keywords: [] },
  },
};
vi.mock("@/lib/dailyTransit", () => ({ getDailyTransit: vi.fn(() => mockDailyTransit) }));

describe("POST /api/generate-daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to sensible defaults
    mockCheckSubscription.mockReturnValue(null);
    mockGetHoroscope.mockResolvedValue(null);
    mockComputeChart.mockResolvedValue({ palaces: [] });
    mockGenerate.mockResolvedValue({
      text: "Fresh horoscope text that is long enough for validation.",
      highlightedStars: ["Architect"],
      transitSummary: "Daily transit",
      source: "deepseek" as const,
    });
    mockUpsertHoroscope.mockResolvedValue(undefined);
    mockSendPush.mockResolvedValue(undefined);
  });

  it("returns 401 when user is not authenticated", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const { POST } = await import("../route");
    const res = await POST();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.error).toBe("NOT_AUTHENTICATED");
  });

  it("returns 402 when subscription is missing or expired", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockCheckSubscription.mockReturnValue({ ok: false, error: "SUBSCRIPTION_REQUIRED", status: 402 });

    const { POST } = await import("../route");
    const res = await POST();

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toBe("SUBSCRIPTION_REQUIRED");
  });

  it("succeeds with template fallback even without birth_date or chart_data", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({ ...mockUser, birth_date: null, chart_data: null });

    // computeOrGetCachedChart will be called but may throw — fallback chart is empty
    mockComputeChart.mockRejectedValue(new Error("No birth data"));
    mockGenerate.mockResolvedValue({
      text: "Template-based insight for today.",
      highlightedStars: [],
      transitSummary: "Daily transit",
      source: "template" as const,
    });

    const { POST } = await import("../route");
    const res = await POST();

    // Route no longer returns 400 — it always generates via template fallback
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBeTruthy();
  });

  it("returns cached horoscope when already generated today", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockGetHoroscope.mockResolvedValue({
      horoscope_text: "Your patterns align today, Architect.",
      highlighted_stars: ["Architect", "Executor"],
      transit_summary: mockDailyTransit.summary,
      date: "2026-06-17",
      source: "deepseek",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { POST } = await import("../route");
    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBe("Your patterns align today, Architect.");
    expect(body.source).toBe("cached");
    expect(body.highlightedStars).toEqual(["Architect", "Executor"]);
  });

  it("generates and returns a fresh horoscope when not cached", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    const { POST } = await import("../route");
    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBeTruthy();
    expect(body.source).toBe("deepseek");
    expect(body.highlightedStars).toEqual(["Architect"]);
  });

  it("falls back to template when AI generation fails", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockGenerate.mockResolvedValue({
      text: "Template-based insight that is long enough for validation checks.",
      highlightedStars: ["Architect"],
      transitSummary: "Daily transit",
      source: "template" as const,
    });

    const { POST } = await import("../route");
    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.source).toBe("template");
  });

  it("gracefully degrades to template when chart computation throws", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    // Chart computation fails
    mockComputeChart.mockRejectedValue(new Error("Chart service down"));

    const { POST } = await import("../route");
    const res = await POST();

    // Should still return 200 via template fallback (no chart data needed)
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBeTruthy();
  });

  it("succeeds with template when user has birth_date but no chart_data (real user scenario)", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({
      ...mockUser,
      chart_data: null,
      birth_place: null,
      birth_date: "1978-11-09",
      birth_time: "20:15",
    });

    // computeOrGetCachedChart tries DB cache (miss), then computes fresh
    mockComputeChart.mockResolvedValue({ palaces: [] });

    const { POST } = await import("../route");
    const res = await POST();

    // Should succeed — template fallback always works
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBeTruthy();
  });
});

describe("GET /api/generate-daily", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns horoscope when cached", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockGetHoroscope.mockResolvedValue({
      horoscope_text: "Cached reading for today.",
      highlighted_stars: ["Radiator"],
      date: "2026-06-17",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const { GET } = await import("../route");
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBe("Cached reading for today.");
  });

  it("returns horoscope: null when not yet generated today", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    mockGetHoroscope.mockResolvedValue(null);

    const { GET } = await import("../route");
    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.horoscope).toBeNull();
  });

  it("returns 401 when not authenticated", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    const { GET } = await import("../route");
    const res = await GET();

    expect(res.status).toBe(401);
  });
});
