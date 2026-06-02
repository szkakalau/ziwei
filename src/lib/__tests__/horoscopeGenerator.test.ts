import { describe, it, expect, vi, beforeEach } from "vitest";

const mockChart = {
  palaces: [
    { name: "Soul", majorStars: [{ name: "Emperor" }], minorStars: [] },
    { name: "Career", majorStars: [{ name: "Sun" }], minorStars: [{ name: "Assistant" }] },
  ],
};

const mockTransit = "Zi Wei enters Career Palace, Wealth Star activates";

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
    expect(result.highlightedStars).toContain("Emperor");
  });

  it("extracts stars correctly", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(result.highlightedStars).toContain("Emperor");
    expect(result.highlightedStars).toContain("Sun");
    expect(result.highlightedStars.length).toBeLessThanOrEqual(5);
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
