import { describe, it, expect, vi, beforeEach } from "vitest";

// Module-level providers array is built at import time from process.env.
// We reset modules between tests and control env vars before each import.
//
// IMPORTANT: AbortSignal.timeout() is used inside createProvider(). In the
// test environment (Node.js), this is available since Node 17.3.

beforeEach(() => {
  vi.resetModules();
  // Clear AI provider env vars — each test sets what it needs
  delete (process.env as Record<string, string>).DEEPSEEK_API_KEY;
  delete (process.env as Record<string, string>).OPENAI_API_KEY;
});

// ═══════════════════════════════════════════════════════════════════════
// hasAiProvider
// ═══════════════════════════════════════════════════════════════════════

describe("hasAiProvider", () => {
  it("returns false when no provider keys are configured", async () => {
    const { hasAiProvider } = await import("@/lib/aiProviders");
    expect(hasAiProvider()).toBe(false);
  });

  it("returns true when DEEPSEEK_API_KEY is set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    const { hasAiProvider } = await import("@/lib/aiProviders");
    expect(hasAiProvider()).toBe(true);
  });

  it("returns true when OPENAI_API_KEY is set", async () => {
    process.env.OPENAI_API_KEY = "sk-test-oai";
    const { hasAiProvider } = await import("@/lib/aiProviders");
    expect(hasAiProvider()).toBe(true);
  });

  it("returns true when both keys are set", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    process.env.OPENAI_API_KEY = "sk-test-oai";
    const { hasAiProvider } = await import("@/lib/aiProviders");
    expect(hasAiProvider()).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// callAiWithFallback — fallback chain
// ═══════════════════════════════════════════════════════════════════════

describe("callAiWithFallback", () => {
  // Shared test data
  const messages = [{ role: "user", content: "Hello" }];

  function mockAiResponse(text: string) {
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: text } }] }),
    } as Response;
  }

  function mockHttpError(status: number) {
    return {
      ok: false,
      status,
      json: async () => ({}),
    } as Response;
  }

  function mockEmptyResponse() {
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "" } }] }),
    } as Response;
  }

  // ── Success paths ─────────────────────────────────────────────────

  it("returns text and provider name when first provider succeeds", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    process.env.OPENAI_API_KEY = "sk-test-oai";

    global.fetch = vi.fn().mockResolvedValue(mockAiResponse("DeepSeek horoscope text"));

    const { callAiWithFallback } = await import("@/lib/aiProviders");
    const result = await callAiWithFallback({ messages });

    expect(result.text).toBe("DeepSeek horoscope text");
    expect(result.provider).toBe("deepseek");
  });

  it("falls back to second provider when first fails", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    process.env.OPENAI_API_KEY = "sk-test-oai";

    // First call (deepseek) → HTTP 500, second call (openai) → success
    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("deepseek: HTTP 500"))
      .mockResolvedValueOnce(mockAiResponse("OpenAI fallback text"));

    const { callAiWithFallback } = await import("@/lib/aiProviders");
    const result = await callAiWithFallback({ messages });

    expect(result.text).toBe("OpenAI fallback text");
    expect(result.provider).toBe("openai");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  // ── Failure paths ─────────────────────────────────────────────────

  it("throws when all providers fail", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    process.env.OPENAI_API_KEY = "sk-test-oai";

    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("deepseek: HTTP 500"))
      .mockRejectedValueOnce(new Error("openai: HTTP 503"));

    const { callAiWithFallback } = await import("@/lib/aiProviders");

    await expect(callAiWithFallback({ messages })).rejects.toThrow("All AI providers unavailable");
  });

  it("throws when no providers are configured", async () => {
    // Both env keys already cleared in beforeEach
    const { callAiWithFallback } = await import("@/lib/aiProviders");

    await expect(callAiWithFallback({ messages })).rejects.toThrow(
      "No AI providers configured",
    );
  });

  it("rejects empty response body from provider", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";

    global.fetch = vi.fn().mockResolvedValue(mockEmptyResponse());

    const { callAiWithFallback } = await import("@/lib/aiProviders");

    await expect(callAiWithFallback({ messages })).rejects.toThrow("All AI providers unavailable");
    // Should include the empty-response error for deepseek
    await expect(callAiWithFallback({ messages })).rejects.toThrow("empty response");
  });

  // ── Error aggregation ──────────────────────────────────────────────

  it("includes all provider errors in the thrown message", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-ds";
    process.env.OPENAI_API_KEY = "sk-test-oai";

    global.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("deepseek: HTTP 500"))
      .mockRejectedValueOnce(new Error("openai: HTTP 429"));

    const { callAiWithFallback } = await import("@/lib/aiProviders");

    await expect(callAiWithFallback({ messages })).rejects.toThrow("deepseek");
    await expect(callAiWithFallback({ messages })).rejects.toThrow("openai");
  });
});
