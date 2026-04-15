const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

/**
 * Calls DeepSeek Chat API (OpenAI-compatible).
 * Env: DEEPSEEK_API_KEY (required). Optional: DEEPSEEK_MODEL (default deepseek-chat).
 */
export async function generateDeepSeekReport(userPrompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("MISSING_DEEPSEEK_API_KEY");
  }

  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "你是严谨的紫微斗数顾问：只根据用户消息中的命盘 JSON 立论，不编造星曜与宫位；输出为简体中文，语气温和克制，避免绝对化断语与医疗法律投资建议。",
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  const data = (await res.json()) as ChatCompletionResponse;

  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText;
    throw new Error(`DEEPSEEK_HTTP_${res.status}: ${msg}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("DEEPSEEK_EMPTY_RESPONSE");
  }

  return text;
}
