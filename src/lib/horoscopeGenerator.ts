import type { ChartLike } from "@/lib/personalitySnapshot";
import { getDailyTransit, type DailyTransit } from "@/lib/dailyTransit";


export interface HoroscopeOutput {
  text: string;
  highlightedStars: string[];
  transitSummary: string;
  source: "deepseek" | "openai" | "template";
}

// ═══════════════════════════════════════════════════════════════════════
// System Prompt — Structured Daily Reading
// ═══════════════════════════════════════════════════════════════════════

function buildSystemPrompt(daily: DailyTransit): string {
  const hualu = `${daily.display.hualu.pinyin}·${daily.display.hualu.alias}`;
  const huaquan = `${daily.display.huaquan.pinyin}·${daily.display.huaquan.alias}`;
  const huake = `${daily.display.huake.pinyin}·${daily.display.huake.alias}`;
  const huaji = `${daily.display.huaji.pinyin}·${daily.display.huaji.alias}`;

  return `You are a Zi Wei Dou Shu (Purple Star Astrology) daily guide writer. Write today's horoscope based on the 4 daily transformation stars (流日四化) provided.

Today's Four Transformations (四化): ${hualu} → Hua Lu (Opportunity), ${huaquan} → Hua Quan (Authority), ${huake} → Hua Ke (Recognition), ${huaji} → Hua Ji (Caution)

Rules:
- Write in clear, practical ENGLISH — warm and grounded tone
- Open with ONE line: "Your core guidance for today" followed by a brief intro naming today's transformation stars
- Then 4 bullet points, each starting with an emoji relevant to the theme:
  • 💰 or 🛡️ or 🌊 for Hua Lu (opportunity / blessings — pick most fitting)
  • 👑 for Hua Quan (authority / decision-making)
  • 🌟 for Hua Ke (recognition / visibility)
  • ⚠️ for Hua Ji (obstacles / caution areas)
- Each bullet: first explain what this transformation MEANS practically today (work, money, relationships, health), then give one concrete, actionable suggestion
- Use the project's star names EXACTLY as given: "${hualu}", "${huaquan}", "${huake}", "${huaji}"
- NO generic fluff like "great things are coming" — be SPECIFIC about what each star's transformation implies for daily life
- End with one short closing line of encouragement
- Target length: 200-300 words
- Format: plain text, no markdown formatting`;
}

// ═══════════════════════════════════════════════════════════════════════
// User Prompt
// ═══════════════════════════════════════════════════════════════════════

function buildUserPrompt(daily: DailyTransit): string {
  return `Date: ${daily.date}
Heavenly Stem: ${daily.stem} (${daily.stemDescription})
Today's transformations: ${daily.summary}

Write today's Zi Wei Dou Shu horoscope in English following the system prompt format.`;
}

// ═══════════════════════════════════════════════════════════════════════
// API Callers
// ═══════════════════════════════════════════════════════════════════════

async function callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`DeepSeek returned ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`OpenAI returned ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

// ═══════════════════════════════════════════════════════════════════════
// Template Fallback — structured, no API needed
// ═══════════════════════════════════════════════════════════════════════

function templateHoroscope(daily: DailyTransit): string {
  const hualu = `${daily.display.hualu.pinyin}·${daily.display.hualu.alias}`;
  const huaquan = `${daily.display.huaquan.pinyin}·${daily.display.huaquan.alias}`;
  const huake = `${daily.display.huake.pinyin}·${daily.display.huake.alias}`;
  const huaji = `${daily.display.huaji.pinyin}·${daily.display.huaji.alias}`;

  return `Your core guidance for today

With today's daily transformations — ${hualu} (Hua Lu), ${huaquan} (Hua Quan), ${huake} (Hua Ke), ${huaji} (Hua Ji) — here are the key themes to watch:

• 💰 Opportunity & Flow (${hualu} → Hua Lu):
Hua Lu brings resource movement and opportunity. Today favors receiving goodwill from others, but avoid impulsive speculation. Pay attention to messages from familiar circles — they may carry useful information for you.

• 👑 Decisions & Influence (${huaquan} → Hua Quan):
Hua Quan strengthens your decisiveness and authority. At work or in teams, you may be given more responsibility. When disagreements arise, persuading with reason works better than pushing hard.

• 🌟 Visibility & Support (${huake} → Hua Ke):
Hua Ke brings recognition and helpful connections. Your expertise is more likely to be noticed today — a good moment to showcase your skills. If you hit a snag, colleagues or peers are likely to step in with assistance or a recommendation.

• ⚠️ Caution & Boundary (${huaji} → Hua Ji):
Hua Ji signals areas that call for restraint. Avoid large investments or signing important contracts today, as delays or overspending are likely. In communication, a little extra patience goes a long way — misunderstandings can escalate quickly under this influence.

Today's stars remind us: flow with the opportunities, heed the cautions, and stay present. A steady, aware approach turns every transit into useful insight.`;
}

// ═══════════════════════════════════════════════════════════════════════
// Main Generator — 3-tier fallback
// ═══════════════════════════════════════════════════════════════════════

function validateHoroscope(text: string): string {
  const cleaned = text.trim();
  if (cleaned.length < 80) throw new Error("Horoscope too short");

  const MAX_CHARS = 2000;
  if (cleaned.length <= MAX_CHARS) return cleaned;

  // Truncate at the last sentence boundary before MAX_CHARS.
  // Search backwards from MAX_CHARS for `. `, `! `, `?\n`, `.\n`, or `\n\n`.
  const truncateAt = cleaned.lastIndexOf(". ", MAX_CHARS);
  const exclaim = cleaned.lastIndexOf("! ", MAX_CHARS);
  const question = cleaned.lastIndexOf("? ", MAX_CHARS);
  const dotNewline = cleaned.lastIndexOf(".\n", MAX_CHARS);
  const para = cleaned.lastIndexOf("\n\n", MAX_CHARS);

  const cut = Math.max(truncateAt, exclaim, question, dotNewline, para);

  // If a reasonable sentence boundary found (within last 300 chars), use it.
  // Otherwise fall back to the last space to avoid mid-word cut.
  if (cut > MAX_CHARS - 300 && cut < MAX_CHARS) {
    return cleaned.slice(0, cut + 1).trimEnd(); // +1 to keep the period
  }

  const lastSpace = cleaned.lastIndexOf(" ", MAX_CHARS);
  if (lastSpace > MAX_CHARS - 100) {
    return cleaned.slice(0, lastSpace).trimEnd() + "…";
  }

  return cleaned.slice(0, MAX_CHARS).trimEnd() + "…";
}

/**
 * Return today's 四化 stars as raw iztro canonical keys.
 * The frontend resolves display names, briefs, and keywords from these keys
 * via formatStarName(), getStarBrief(), and getStarKeywords().
 */
function formatHighlightedStars(daily: DailyTransit): string[] {
  return [
    daily.sihua.hualu,
    daily.sihua.huaquan,
    daily.sihua.huake,
    daily.sihua.huaji,
  ];
}

/**
 * Generate a daily horoscope with three-tier fallback:
 * 1. DeepSeek (primary)
 * 2. OpenAI (fallback)
 * 3. Template (guaranteed — no API, always returns valid output)
 *
 * The horoscope is now transit-driven: it uses the actual 流日四化
 * (4 daily transformation stars) computed from the day's Heavenly Stem,
 * rather than matching against the user's natal chart stars.
 */
export async function generateHoroscope(
  userChart: ChartLike,
  transitSummary: string,
): Promise<HoroscopeOutput> {
  // Signature compatibility: userChart and transitSummary are kept for
  // backward compatibility with callers. The daily transit is now computed
  // internally from the current date's Heavenly Stem.
  void userChart;
  void transitSummary;

  // Compute today's real 四化 transit data
  const daily = getDailyTransit();

  const systemPrompt = buildSystemPrompt(daily);
  const userPrompt = buildUserPrompt(daily);

  // Tier 1: DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const text = await callDeepSeek(systemPrompt, userPrompt);
      return {
        text: validateHoroscope(text),
        highlightedStars: formatHighlightedStars(daily),
        transitSummary: daily.summary,
        source: "deepseek",
      };
    } catch {
      // Fall through to OpenAI
    }
  }

  // Tier 2: OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const text = await callOpenAI(systemPrompt, userPrompt);
      return {
        text: validateHoroscope(text),
        highlightedStars: formatHighlightedStars(daily),
        transitSummary: daily.summary,
        source: "openai",
      };
    } catch {
      // Fall through to template
    }
  }

  // Tier 3: Template (guaranteed)
  return {
    text: validateHoroscope(templateHoroscope(daily)),
    highlightedStars: formatHighlightedStars(daily),
    transitSummary: daily.summary,
    source: "template",
  };
}
