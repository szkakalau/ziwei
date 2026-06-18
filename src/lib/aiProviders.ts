/**
 * Shared AI provider abstraction with automatic fallback.
 * Used by horoscope, chat, compatibility, yearly-reading, and birthday-reading routes.
 *
 * Fallback chain: DeepSeek → OpenAI → error
 * Template fallback is handled per-route (content-specific).
 */

interface AiProvider {
  name: string;
  model: string;
  call: (params: {
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
  }) => Promise<string>;
}

function createProvider(
  name: string,
  url: string,
  envKey: string,
  model: string,
): AiProvider | null {
  const apiKey = process.env[envKey];
  if (!apiKey) return null;

  return {
    name,
    model,
    call: async (params) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: params.messages,
          max_tokens: params.maxTokens ?? 800,
          temperature: params.temperature ?? 0.8,
        }),
        signal: AbortSignal.timeout(params.timeoutMs ?? 25_000),
      });
      if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
      const json = await res.json();
      const text = (json.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new Error(`${name}: empty response`);
      return text;
    },
  };
}

const providers: AiProvider[] = [
  createProvider("deepseek", "https://api.deepseek.com/chat/completions", "DEEPSEEK_API_KEY", "deepseek-chat"),
  createProvider("openai", "https://api.openai.com/v1/chat/completions", "OPENAI_API_KEY", "gpt-4o-mini"),
].filter((p): p is AiProvider => p !== null);

/**
 * Call AI with automatic fallback across configured providers.
 * Returns the text response and the provider name that served it.
 * Throws if all providers fail.
 */
export async function callAiWithFallback(params: {
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{ text: string; provider: string }> {
  if (providers.length === 0) {
    throw new Error("No AI providers configured — set DEEPSEEK_API_KEY or OPENAI_API_KEY");
  }

  const errors: string[] = [];
  for (const p of providers) {
    try {
      const text = await p.call({
        messages: params.messages,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
        timeoutMs: params.timeoutMs,
      });
      return { text, provider: p.name };
    } catch (err) {
      errors.push(`${p.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  throw new Error(`All AI providers unavailable: ${errors.join("; ")}`);
}

/** Check if at least one AI provider is configured. */
export function hasAiProvider(): boolean {
  return providers.length > 0;
}
