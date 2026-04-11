import type { BirthChartMeta } from "@/lib/computeBirthChart";

const MAX_CHART_JSON_CHARS = 26_000;

export type PaidPalaceInterpretation = {
  palaceKey: string;
  title: string;
  paragraphs: string[];
};

type OpenAiChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function chartJsonForPrompt(chart: unknown): string {
  let chartJson: string;
  try {
    chartJson = JSON.stringify(chart, null, 2);
  } catch {
    chartJson = String(chart);
  }
  if (chartJson.length > MAX_CHART_JSON_CHARS) {
    chartJson = `${chartJson.slice(0, MAX_CHART_JSON_CHARS)}\n\n[…truncated…]`;
  }
  return chartJson;
}

function buildUserPrompt(chart: unknown, meta: BirthChartMeta, palaceKeys: string[]): string {
  const chartJson = chartJsonForPrompt(chart);
  const keysLine = palaceKeys.join(", ");
  return `Birth context (true solar / timezone adjusted where applicable):
- Apparent solar date used for the chart: ${meta.apparentSolarDate}
- Apparent solar time used for the chart: ${meta.apparentSolarTime}
- Place label: ${meta.placeLabel}
- Approximate chart: ${meta.isApproximate ? "yes" : "no"}

The chart JSON below uses iztro English palace keys in array order. Palace keys in order: ${keysLine}

--- CHART JSON ---
${chartJson}
--- END ---

Return ONLY a JSON object with this exact shape (no markdown fences):
{
  "palaces": [
    {
      "palaceKey": "<must match one key from the list, in the SAME order as chart.palaces>",
      "title": "<short English palace title, e.g. Life (Soul / Ming) Palace>",
      "paragraphs": ["<80-160 words of professional Zi Wei interpretation in English>", "<optional second paragraph 40-100 words>"]
    }
  ]
}

Rules:
- There must be exactly 12 objects in palaces, same order as chart.palaces (first JSON palace first).
- palaceKey must exactly equal the "name" field of that palace from the JSON.
- Ground every claim in the JSON (stars, brightness, mutagen if present, stems/branches if present). Do not invent stars or move stars between palaces.
- Write for an intelligent Western reader; define rare jargon briefly when needed.
- No medical, legal, or financial advice; no deterministic fate claims; frame as traditional symbolic reading.
- English only in title and paragraphs.`;
}

function normalizeInterpretations(
  palaceKeys: string[],
  parsed: unknown,
): PaidPalaceInterpretation[] {
  const obj = parsed as {
    palaces?: Array<{
      palaceKey?: string;
      title?: string;
      paragraphs?: string[] | string;
    }>;
  };
  const list = obj?.palaces;
  if (!Array.isArray(list) || list.length !== 12) {
    throw new Error(`Expected 12 palaces from model, got ${Array.isArray(list) ? list.length : "none"}`);
  }

  const byKey = new Map<string, (typeof list)[0]>();
  for (const row of list) {
    const k = String(row?.palaceKey ?? "").trim();
    if (k) byKey.set(k, row);
  }

  const out: PaidPalaceInterpretation[] = [];
  for (let i = 0; i < 12; i++) {
    const expectedKey = palaceKeys[i] ?? "";
    const row = byKey.get(expectedKey) ?? list[i];
    const key = String(row?.palaceKey ?? "").trim() || expectedKey;
    const title = String(row?.title ?? "").trim() || expectedKey;
    let paras: string[] = [];
    if (Array.isArray(row?.paragraphs)) {
      paras = row!.paragraphs!.map((p) => String(p).trim()).filter(Boolean);
    } else if (typeof row?.paragraphs === "string") {
      paras = row.paragraphs
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
    }
    if (paras.length === 0) {
      paras = ["(No interpretation text returned for this palace.)"];
    }
    out.push({ palaceKey: key || expectedKey, title, paragraphs: paras });
  }
  return out;
}

type LlmProvider = "deepseek" | "openai";

function resolvePalaceLlm(): {
  provider: LlmProvider;
  apiKey: string;
  base: string;
  model: string;
} {
  const dsKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (dsKey) {
    return {
      provider: "deepseek",
      apiKey: dsKey,
      base: (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com/v1").replace(/\/$/, ""),
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    };
  }
  const oaKey = process.env.OPENAI_API_KEY?.trim();
  if (oaKey) {
    return {
      provider: "openai",
      apiKey: oaKey,
      base: (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    };
  }
  throw new Error(
    "No LLM API key: set DEEPSEEK_API_KEY (preferred for paid PDF Part II) or OPENAI_API_KEY",
  );
}

/**
 * Twelve English palace interpretations via OpenAI-compatible Chat Completions.
 * Prefers **DeepSeek** (`DEEPSEEK_API_KEY`); otherwise **OpenAI** (`OPENAI_API_KEY`).
 */
export async function fetchPaidPalaceInterpretations(params: {
  chart: unknown;
  meta: BirthChartMeta;
}): Promise<PaidPalaceInterpretation[]> {
  const { provider, apiKey, base, model } = resolvePalaceLlm();

  const palaces = (params.chart as { palaces?: Array<{ name?: string }> })?.palaces;
  if (!Array.isArray(palaces) || palaces.length !== 12) {
    throw new Error("Chart must contain exactly 12 palaces for paid PDF");
  }
  const palaceKeys = palaces.map((p) => String(p.name ?? "").trim()).filter(Boolean);
  if (palaceKeys.length !== 12) {
    throw new Error("Every palace must have a non-empty name key");
  }

  const userPrompt = buildUserPrompt(params.chart, params.meta, palaceKeys);

  const body: Record<string, unknown> = {
    model,
    temperature: 0.35,
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert Zi Wei Dou Shu (Purple Star Astrology) consultant. You output only valid JSON as instructed.",
      },
      { role: "user", content: userPrompt },
    ],
  };

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = (await res.json()) as OpenAiChatResponse;
  if (!res.ok) {
    const msg = raw?.error?.message ?? res.statusText;
    throw new Error(`${provider} HTTP ${res.status}: ${msg}`);
  }

  const content = raw.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error(`${provider} returned empty content`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.trim());
  } catch {
    throw new Error(`${provider} returned non-JSON content`);
  }

  return normalizeInterpretations(palaceKeys, parsed);
}
