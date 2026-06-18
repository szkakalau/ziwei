import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChart = {
  palaces: [
    { name: "Soul", majorStars: [{ name: "emperor" }], minorStars: [] },
    { name: "Career", majorStars: [{ name: "sun" }], minorStars: [{ name: "assistant" }] },
  ],
};

const mockTransit = "Daily transit for 2026-01-01";

describe("generateHoroscope", () => {
  beforeEach(() => {
    vi.resetModules();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it("falls back to template when both APIs fail", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(result.source).toBe("template");
    expect(result.text.length).toBeGreaterThan(60);
    // highlightedStars now returns project display names "Pinyin · Alias"
    // for today's 4 daily transformation stars (流日四化)
    expect(result.highlightedStars.length).toBe(4);
    result.highlightedStars.forEach((s) => {
      expect(s).toMatch(/·/); // "Pinyin · Alias" format
    });
  });

  it("highlightedStars returns 4 daily transformation stars in display format", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    // Always returns exactly 4 stars (today's 四化)
    expect(result.highlightedStars.length).toBe(4);
    // Each star is formatted as "Pinyin · Alias"
    result.highlightedStars.forEach((s) => {
      expect(s).toMatch(/^[A-Z][a-z]+(?: [A-Z][a-z]+)* · [A-Z][a-z]+(?: [A-Z][a-z]+)*$/);
    });
    // Verify no raw iztro keys leak through
    result.highlightedStars.forEach((s) => {
      expect(s).not.toMatch(/^(emperor|wolf|rebel|judge|general|sun|moon|sage|advisor|fortunate|upright|minister|empress|sevenkillings)$/);
    });
  });

  it("returns template source when no API keys configured", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("no key"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    // Clear env keys to force template fallback
    const orig = process.env.DEEPSEEK_API_KEY;
    delete (process.env as Record<string, string>).DEEPSEEK_API_KEY;
    delete (process.env as Record<string, string>).OPENAI_API_KEY;

    const result = await generateHoroscope(mockChart as never, mockTransit);
    expect(result.source).toBe("template");

    if (orig) process.env.DEEPSEEK_API_KEY = orig;
  });
});
