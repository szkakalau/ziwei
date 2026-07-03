import { describe, it, expect } from "vitest";
import { getDailyTransit } from "@/lib/dailyTransit";

// ═══════════════════════════════════════════════════════════════════════
// 日干算法验证参考:
//   gregorianToJDN(1900, 1, 1) = 2415021
//   stemIndex = (2415021 + 9) % 10 = 0 = 甲
// 因此 new Date("1900-01-01T12:00:00Z") → 甲日
// ═══════════════════════════════════════════════════════════════════════

describe("getDailyTransit", () => {
  // ── JDN / day stem correctness ──────────────────────────────────────

  it("computes correct stem for 1900-01-01 (known 甲 day)", () => {
    const result = getDailyTransit(new Date("1900-01-01T12:00:00Z"));
    expect(result.stem).toBe("甲");
    expect(result.date).toBe("1900-01-01");
  });

  it("computes correct stem for 2026-01-01 (乙 day)", () => {
    // 2026-01-01 JDN = 2461042 → (2461042 + 9) % 10 = 1 = 乙
    const result = getDailyTransit(new Date("2026-01-01T12:00:00Z"));
    expect(result.stem).toBe("乙");
  });

  it("returns different stems for consecutive days", () => {
    const day1 = getDailyTransit(new Date("2026-01-01T12:00:00Z"));
    const day2 = getDailyTransit(new Date("2026-01-02T12:00:00Z"));
    expect(day1.stem).not.toBe(day2.stem);
  });

  // ── Structure & completeness ────────────────────────────────────────

  it("returns all required fields with correct types", () => {
    const result = getDailyTransit(new Date("2000-06-15T12:00:00Z"));

    expect(typeof result.date).toBe("string");
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    expect(typeof result.stem).toBe("string");
    expect(result.stem).toHaveLength(1);

    expect(typeof result.stemDescription).toBe("string");
    expect(result.stemDescription.length).toBeGreaterThan(10);

    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(10);

    // sihua entries
    expect(typeof result.sihua.hualu).toBe("string");
    expect(typeof result.sihua.huaquan).toBe("string");
    expect(typeof result.sihua.huake).toBe("string");
    expect(typeof result.sihua.huaji).toBe("string");

    // display names
    expect(result.display.hualu).toBeTruthy();
    expect(result.display.huaquan).toBeTruthy();
    expect(result.display.huake).toBeTruthy();
    expect(result.display.huaji).toBeTruthy();
  });

  it("all 10 stems produce valid sihua entries with valid star namings", () => {
    // Dates that produce each stem (precomputed via gregorianToJDN):
    // stemIndex 0=甲: 1900-01-01, 1=乙: 2026-01-01, 2=丙: 2026-01-02,
    // 3=丁: 2026-01-03, 4=戊: 2026-01-04, 5=己: 2026-01-05,
    // 6=庚: 2026-01-06, 7=辛: 2026-01-07, 8=壬: 2026-01-08, 9=癸: 2026-01-09
    const stemsSeen = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const date = new Date(Date.UTC(2026, 0, 1 + i, 12, 0, 0));
      const result = getDailyTransit(date);
      stemsSeen.add(result.stem);

      // Every stem's sihua must reference valid iztro keys (non-empty strings)
      expect(result.sihua.hualu.length).toBeGreaterThan(0);
      expect(result.sihua.huaquan.length).toBeGreaterThan(0);
      expect(result.sihua.huake.length).toBeGreaterThan(0);
      expect(result.sihua.huaji.length).toBeGreaterThan(0);

      // Display names must resolve successfully
      expect(result.display.hualu.pinyin.length).toBeGreaterThan(0);
      expect(result.display.huaquan.pinyin.length).toBeGreaterThan(0);
      expect(result.display.huake.pinyin.length).toBeGreaterThan(0);
      expect(result.display.huaji.pinyin.length).toBeGreaterThan(0);

      // Summary must include all 4 transformation lines
      expect(result.summary).toContain("Hua Lu");
      expect(result.summary).toContain("Hua Quan");
      expect(result.summary).toContain("Hua Ke");
      expect(result.summary).toContain("Hua Ji");
    }

    expect(stemsSeen.size).toBe(10);
  });

  // ── Date parameter handling ─────────────────────────────────────────

  it("defaults to current date when no argument passed", () => {
    const result = getDailyTransit();
    expect(typeof result.stem).toBe("string");
    expect(result.date).toBe(new Date().toISOString().slice(0, 10));
  });

  it("uses UTC components so dateStr matches input date regardless of timezone", () => {
    // A date at midnight UTC+14 should still produce the same date string
    const date = new Date("2026-07-03T12:00:00Z");
    const result = getDailyTransit(date);
    expect(result.date).toBe("2026-07-03");
  });

  // ── Edge cases ──────────────────────────────────────────────────────

  it("year boundary works correctly (Dec 31 → Jan 1)", () => {
    const dec31 = getDailyTransit(new Date("2025-12-31T12:00:00Z"));
    const jan1 = getDailyTransit(new Date("2026-01-01T12:00:00Z"));

    // Both should produce valid stems
    expect(dec31.stem).toHaveLength(1);
    expect(jan1.stem).toHaveLength(1);

    // Consecutive days = different stems
    expect(dec31.stem).not.toBe(jan1.stem);
  });

  it("leap year Feb 29 produces valid result", () => {
    const feb29 = getDailyTransit(new Date("2024-02-29T12:00:00Z"));
    expect(feb29.stem).toHaveLength(1);
    expect(feb29.date).toBe("2024-02-29");
  });
});
