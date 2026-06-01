import type { ChartLike } from "@/lib/personalitySnapshot";

export interface HoroscopeOutput {
  text: string;
  highlightedStars: string[];
  transitSummary: string;
  source: "deepseek" | "openai" | "template";
}

const HOROSCOPE_SYSTEM_PROMPT = `You are a Zi Wei Dou Shu (紫微斗数) astrologer writing a daily horoscope.

Rules:
- Write 100-150 words in English, warm and specific
- Reference the user's chart stars and today's transits by name
- Be uplifting but grounded — no generic "great things are coming" fluff
- Format: plain text, no markdown, no emojis
- End with one actionable insight for today`;

function buildUserPrompt(userChart: ChartLike, transitSummary: string): string {
  const starBlob = (userChart.palaces ?? [])
    .flatMap((p) => [...(p.majorStars ?? []), ...(p.minorStars ?? [])])
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean)
    .join(", ");

  return `Today's transits: ${transitSummary}

User's chart stars: ${starBlob}

Write today's daily horoscope based on these transits and this person's natal chart.`;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: HOROSCOPE_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.9,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`DeepSeek returned ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: HOROSCOPE_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.9,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`OpenAI returned ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

/** Fallback template — guaranteed to return something */
function templateHoroscope(stars: string[]): string {
  const starNames = stars.length > 0 ? stars.join(" and ") : "your chart";
  const templates = [
    `Today, ${starNames} shape your energy in subtle but meaningful ways. You may notice a shift in how you approach decisions — trust your instincts when they feel unusually clear. A conversation you have today could plant a seed that grows over the coming weeks. Stay open to unexpected input from people you respect. Your focus is sharpest in the morning hours, so tackle anything requiring deep thought before midday.`,
    `With ${starNames} influencing your chart today, you're in a reflective mode. This is a good day to revisit a plan you set aside — you'll see it with fresh eyes now. Someone from your past may cross your mind; there's a reason for that. Pay attention to recurring themes in your thoughts today. The universe is nudging you toward closure on something you've been avoiding.`,
    `The influence of ${starNames} brings a gentle assertiveness to your day. You'll find it easier than usual to say what you mean without second-guessing yourself. A practical matter that's been stalled may suddenly find resolution — be ready to act when the opening appears. Your emotional clarity is above average today, making it a good time for honest conversations.`,
  ];
  const idx = new Date().getDate() % templates.length;
  return templates[idx];
}

function validateHoroscope(text: string): string {
  if (text.length < 60) throw new Error("Horoscope too short");
  if (text.length > 600) text = text.slice(0, 600);
  return text;
}

/**
 * Generate a daily horoscope with three-tier fallback:
 * 1. DeepSeek (primary — cheapest)
 * 2. OpenAI (fallback — most reliable)
 * 3. Template (guaranteed — no API needed)
 */
export async function generateHoroscope(
  userChart: ChartLike,
  transitSummary: string,
): Promise<HoroscopeOutput> {
  const prompt = buildUserPrompt(userChart, transitSummary);

  // Tier 1: DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const text = await callDeepSeek(prompt);
      return {
        text: validateHoroscope(text),
        highlightedStars: extractStars(userChart),
        transitSummary,
        source: "deepseek",
      };
    } catch {
      // Fall through to OpenAI
    }
  }

  // Tier 2: OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const text = await callOpenAI(prompt);
      return {
        text: validateHoroscope(text),
        highlightedStars: extractStars(userChart),
        transitSummary,
        source: "openai",
      };
    } catch {
      // Fall through to template
    }
  }

  // Tier 3: Template (guaranteed)
  const stars = extractStars(userChart);
  return {
    text: templateHoroscope(stars),
    highlightedStars: stars,
    transitSummary,
    source: "template",
  };
}

function extractStars(chart: ChartLike): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const palace of chart.palaces ?? []) {
    for (const star of [...(palace.majorStars ?? []), ...(palace.minorStars ?? [])]) {
      const name = typeof star === "string" ? star : star?.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    }
  }
  return result.slice(0, 5);
}
