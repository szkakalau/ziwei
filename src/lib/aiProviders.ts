/**
 * Shared AI provider abstraction. Used by horoscope, chat, compatibility,
 * yearly-reading, and birthday-reading routes to avoid duplicated fallback logic.
 */

interface AiProvider {
  name: string;
  call: (params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens?: number;
    temperature?: number;
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
    call: async (params) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: params.messages,
          max_tokens: params.maxTokens ?? 500,
          temperature: params.temperature ?? 0.8,
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) throw new Error(`${name}: ${res.status}`);
      const json = await res.json();
      const text = (json.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new Error(`${name}: empty response`);
      return text;
    },
  };
}

const providers = [
  createProvider("deepseek", "https://api.deepseek.com/chat/completions", "DEEPSEEK_API_KEY", "deepseek-chat"),
  createProvider("openai", "https://api.openai.com/v1/chat/completions", "OPENAI_API_KEY", "gpt-4o-mini"),
].filter(Boolean) as AiProvider[];

export async function callAiWithFallback(params: {
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
}): Promise<{ text: string; provider: string }> {
  for (const p of providers) {
    try {
      const text = await p.call({
        model: "deepseek-chat",
        messages: params.messages,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
      });
      return { text, provider: p.name };
    } catch {
      continue;
    }
  }
  throw new Error("All AI providers unavailable");
}
