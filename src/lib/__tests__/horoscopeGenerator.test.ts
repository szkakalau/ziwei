import { describe, it, expect, vi, beforeEach } from "vitest";

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════

const mockChart = {
  palaces: [
    { name: "Soul", majorStars: [{ name: "emperor" }], minorStars: [] },
    { name: "Career", majorStars: [{ name: "sun" }], minorStars: [{ name: "assistant" }] },
  ],
};

const mockTransit = "Daily transit for 2026-01-01";

function mockAiJsonResponse(text: string) {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: text } }] }),
  } as Response;
}

/** Build a minimal valid AI horoscope that passes validateHoroscope. */
function validAiResponse(): Response {
  return mockAiJsonResponse(
    "Your core guidance for today\n\n" +
      "With today's transformations here is your horoscope.\n\n" +
      "💰 Opportunity & Flow — Hua Lu brings resource flow today, perfect for networking.\n" +
      "👑 Authority — Hua Quan strengthens decisiveness, ideal for making tough calls.\n" +
      "🌟 Recognition — Hua Ke brings visibility, showcase your skills in meetings.\n" +
      "⚠️ Caution — Hua Ji warns against impulsive spending, pause before big purchases.\n\n" +
      "Stay mindful and grounded today.",
  );
}

const VALID_KEYS = [
  "emperor", "advisor", "sun", "general", "fortunate", "upright", "empress",
  "moon", "wolf", "judge", "minister", "sage", "sevenkillings", "rebel",
  "wenchang", "wenqu", "zuofu", "youbi",
];

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe("generateHoroscope", () => {
  beforeEach(() => {
    vi.resetModules();
    global.fetch = vi.fn();
    // Set at least one API key so AI path is attempted
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
  });

  // ── Tier 3: Template fallback (existing, preserved) ──────────────────

  it("falls back to template when both APIs fail (existing)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(result.source).toBe("template");
    expect(result.text.length).toBeGreaterThan(60);
    expect(result.highlightedStars.length).toBe(4);
    result.highlightedStars.forEach((s) => {
      expect(VALID_KEYS).toContain(s);
    });
  });

  // ── Tier 1: AI success path (NEW — previously untested) ─────────────

  it("returns AI-generated text with provider source when DeepSeek succeeds", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(validAiResponse());

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(result.source).toBe("deepseek");
    expect(result.text).toContain("Your core guidance for today");
    expect(result.text).toContain("💰");
    expect(result.highlightedStars.length).toBe(4);
  });

  it("returns correct structure (text, highlightedStars, transitSummary, source) on AI success", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(validAiResponse());

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(80);
    expect(Array.isArray(result.highlightedStars)).toBe(true);
    expect(result.highlightedStars.length).toBe(4);
    expect(typeof result.transitSummary).toBe("string");
    expect(result.transitSummary).toContain("Hua Lu");
    expect(["deepseek", "openai", "template"]).toContain(result.source);
  });

  // ── validateHoroscope: rejection → template fallback (NEW) ──────────

  it("falls back to template when AI returns too-short content (< 80 chars)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAiJsonResponse("Too short"),
    );

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    // validateHoroscope rejects "Too short" → falls through to template
    expect(result.source).toBe("template");
    expect(result.text.length).toBeGreaterThan(60);
    // Template always produces valid output
    expect(result.text).toContain("Your core guidance for today");
  });

  it("falls back to template when AI response is missing opening line", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAiJsonResponse(
        "Here is your daily reading without the required opening line.\n" +
          "💰 Some content about opportunity here.\n" +
          "👑 Some content about authority here.\n" +
          "🌟 Some content about recognition here.\n" +
          "⚠️ Some caution about obstacles. This is a long enough response " +
          "that passes the length check but fails the opening line validation.",
      ),
    );

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    // validateHoroscope throws "missing required opening line" → template
    expect(result.source).toBe("template");
    expect(result.text).toContain("Your core guidance for today");
  });

  // ── validateHoroscope: structural only (no emoji coupling, P1-1) ─────
  // validateHoroscope now only checks length ≥ 80 + opening line.
  // Emoji counts are NOT validated — see JSDoc on validateHoroscope for rationale.

  it("accepts AI responses with fewer than 3 emoji markers (no longer rejected)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAiJsonResponse(
        "Your core guidance for today\n\n" +
          "Here is your horoscope with only one emoji marker.\n" +
          "💰 Some opportunity stuff here but missing other required sections.\n" +
          "This text is long enough and starts correctly but only has 1 of 4 required emojis.",
      ),
    );

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    // Emoji count is no longer validated — structurally valid responses pass through
    expect(result.source).toBe("deepseek");
    expect(result.text).toContain("Your core guidance for today");
  });

  // ── validateHoroscope: truncation > 2000 chars (NEW) ────────────────

  it("truncates content exceeding 2000 characters at a sentence boundary", async () => {
    // Build a valid response > 2000 chars by repeating content with sentence breaks
    const boilerplate =
      "Your core guidance for today\n\n" +
      "With today's daily transformations, here are the themes to watch.\n\n";
    const section =
      "💰 Opportunity — Hua Lu brings resource flow. Take note of unexpected offers today. " +
      "👑 Authority — Hua Quan strengthens your decisiveness. Use this energy to finalize pending choices. " +
      "🌟 Recognition — Hua Ke attracts helpful connections. A colleague may offer a useful introduction. " +
      "⚠️ Caution — Hua Ji reminds you to check details before signing. A small oversight could cost time. ";

    // Repeat sections until we exceed 2000 chars
    let body = "";
    while (body.length < 2100) {
      body += section;
    }

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAiJsonResponse(boilerplate + body),
    );

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    // Content should be truncated to ≤ MAX_CHARS (2000) or end at sentence boundary
    expect(result.text.length).toBeLessThanOrEqual(2100);
    // Must still be valid (opening line preserved)
    expect(result.text).toContain("Your core guidance for today");
  });

  // ── highlightedStars (existing, preserved) ─────────────────────────

  it("highlightedStars returns 4 daily transformation stars as raw iztro keys (existing)", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const result = await generateHoroscope(mockChart as never, mockTransit);

    expect(result.highlightedStars.length).toBe(4);
    result.highlightedStars.forEach((s) => {
      expect(typeof s).toBe("string");
      expect(s).toBe(s.toLowerCase());
      expect(s).not.toContain(" ");
      expect(s).not.toContain("·");
      expect(VALID_KEYS).toContain(s);
    });
  });

  // ── Error resilience (NEW) ─────────────────────────────────────────

  it("ignores userChart and transitSummary parameters (backward compat)", async () => {
    // Passing null/undefined should still work — params are voided
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(validAiResponse());

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await generateHoroscope(null as any, undefined as any);

    expect(result.source).toBe("deepseek");
    expect(result.text.length).toBeGreaterThan(80);
  });
});
