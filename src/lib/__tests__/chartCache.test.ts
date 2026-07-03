import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════════
// Mock computeBirthChart (dynamic import in chartCache.ts)
// ═══════════════════════════════════════════════════════════════════════

const mockComputeBirthChart = vi.fn();

vi.mock("@/lib/computeBirthChart", () => ({
  computeBirthChart: (...args: unknown[]) => mockComputeBirthChart(...args),
}));

// Mock neon for getUserById / updateUserChart
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const q = strings.join("?");
    // getUserById: return no row (no cached chart)
    if (q.includes("FROM users WHERE id")) return [];
    // updateUserChart: no-op
    if (q.includes("UPDATE users SET")) return [];
    return [];
  },
}));

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe("computeOrGetCachedChart", () => {
  beforeEach(() => {
    vi.resetModules();
    mockComputeBirthChart.mockReset();
  });

  const params = {
    userId: "u1",
    birthDate: "1995-06-15",
    birthTime: "08:30",
    locationLabel: "30.5,120.2",
    allowFallback: true,
  };

  const computedChart = {
    palaces: [
      { name: "Soul", majorStars: [{ name: "emperor" }], minorStars: [] },
    ],
  };

  it("computes and persists chart when no cache exists", async () => {
    mockComputeBirthChart.mockResolvedValueOnce({
      ok: true,
      chart: computedChart,
      meta: { latitude: 30.5, longitude: 120.2, timezone: "Asia/Shanghai" },
    });

    const { computeOrGetCachedChart } = await import("@/lib/chartCache");
    const result = await computeOrGetCachedChart(params);

    expect(result).toEqual(computedChart);
    expect(mockComputeBirthChart).toHaveBeenCalledTimes(1);
    expect(mockComputeBirthChart).toHaveBeenCalledWith(
      expect.objectContaining({ birthDate: "1995-06-15" }),
    );
  });

  it("returns empty chart when computation fails", async () => {
    mockComputeBirthChart.mockResolvedValueOnce({
      ok: false,
      chart: null,
      meta: null,
    });

    const { computeOrGetCachedChart } = await import("@/lib/chartCache");
    const result = await computeOrGetCachedChart(params);

    expect(result).toEqual({ palaces: [] });
  });

  it("returns cached chart when valid cache exists in DB", async () => {
    // Override neon mock for this specific test
    vi.resetModules();
    vi.doMock("@neondatabase/serverless", () => ({
      neon: () => async (strings: TemplateStringsArray) => {
        const q = strings.join("?");
        if (q.includes("FROM users WHERE id")) {
          return [{
            id: "u1",
            chart_data: { palaces: [{ name: "CachedSoul" }] },
            birth_date: "1995-06-15",
            birth_time: "08:30",
            birth_place: { lat: 30, lng: 120, tz: "Asia/Shanghai" },
          }];
        }
        return [];
      },
    }));

    const { computeOrGetCachedChart } = await import("@/lib/chartCache");
    const result = await computeOrGetCachedChart(params);

    expect(result).toEqual({ palaces: [{ name: "CachedSoul" }] });
    // computeBirthChart should NOT have been called
    expect(mockComputeBirthChart).not.toHaveBeenCalled();
  });
});

describe("computeChartFromStored", () => {
  beforeEach(() => {
    vi.resetModules();
    mockComputeBirthChart.mockReset();
  });

  it("returns computed chart on success", async () => {
    const chart = {
      palaces: [{ name: "Soul", majorStars: [], minorStars: [] }],
    };
    mockComputeBirthChart.mockResolvedValueOnce({
      ok: true,
      chart,
      meta: { latitude: 30, longitude: 120, timezone: "Asia/Shanghai" },
    });

    const { computeChartFromStored } = await import("@/lib/chartCache");
    const result = await computeChartFromStored({
      birthDate: "1990-01-01",
      birthTime: "12:00",
      location: "30,120",
      allowFallback: true,
    });

    expect(result).toEqual(chart);
  });

  it("returns empty chart when computation fails", async () => {
    mockComputeBirthChart.mockResolvedValueOnce({
      ok: false,
      chart: null,
      meta: null,
    });

    const { computeChartFromStored } = await import("@/lib/chartCache");
    const result = await computeChartFromStored({
      birthDate: "1990-01-01",
      birthTime: "12:00",
      location: "30,120",
    });

    expect(result).toEqual({ palaces: [] });
  });
});
