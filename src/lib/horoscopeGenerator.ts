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

Today's 四化: ${hualu}化禄、${huaquan}化权、${huake}化科、${huaji}化忌

Rules:
- Write in TRADITIONAL CHINESE (繁體中文), warm and grounded tone
- Open with ONE line: "針對您今天的運勢核心提醒" followed by a brief intro naming today's 四化 stars
- Then 4 bullet points, each starting with an emoji relevant to the theme:
  • ⚠️ for 化忌 (obstacles / caution)
  • 👑 for 化权 (authority / leadership)
  • 🌟 for 化科 (recognition / fame)
  • 🛡️ / 💰 / 🌊 for 化禄 (blessings / prosperity — pick most fitting)
- Each bullet: first explain what this transformation MEANS practically today (work, money, relationships, health), then give one concrete suggestion
- Use the project's star names EXACTLY as given: "${hualu}", "${huaquan}", "${huake}", "${huaji}"
- NO generic fluff like "great things are coming" — be SPECIFIC about what each star's transformation implies
- End with one short closing line of encouragement
- Target length: 250-350 Chinese characters total
- Format: plain text, no markdown formatting`;
}

// ═══════════════════════════════════════════════════════════════════════
// User Prompt
// ═══════════════════════════════════════════════════════════════════════

function buildUserPrompt(daily: DailyTransit): string {
  return `Date: ${daily.date}
Heavenly Stem: ${daily.stem} (${daily.stemDescription})
Today's 四化: ${daily.summary}

写一份今日紫微斗数运势提醒（Traditional Chinese），按系统提示的格式输出。`;
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
      max_tokens: 800,
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
      max_tokens: 800,
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

  return `針對您今天的運勢核心提醒

結合今天的流日四化（${hualu}化祿、${huaquan}化權、${huake}化科、${huaji}化忌），以下幾點是您今天在生活中可以特別留意的共性趨向：

• 💰 資源與機會（${hualu}化祿）：
今日化祿之星帶來資源流動與機遇。適合把握人際互動中的善意，但不宜冒進投機。留意來自熟悉圈子的消息，可能藏有對您有利的資訊。

• 👑 決策與影響力（${huaquan}化權）：
今日化權之星強化您的決斷力與話語權。在工作或團隊中，您可能會被賦予更多責任。遇到分歧時，以理服人比強勢壓制更有效。

• 🌟 聲譽與助力（${huake}化科）：
今日化科之星帶來名聲與貴人運。您的專業表現容易被看見，適合展現才華。遇到難題時，容易得到同事或平輩的協助與推薦。

• ⚠️ 謹慎與防範（${huaji}化忌）：
今日化忌之星提示需要收斂的領域。不宜進行大額投資或簽署重要合約，容易出現資金延誤或超支。人際溝通也需多一分耐心，避免因誤解產生摩擦。

今天的星象提醒我們：順勢而為，化忌為警，化祿為機。保持覺察，從容應對。`;
}

// ═══════════════════════════════════════════════════════════════════════
// Main Generator — 3-tier fallback
// ═══════════════════════════════════════════════════════════════════════

function validateHoroscope(text: string): string {
  const cleaned = text.trim();
  if (cleaned.length < 80) throw new Error("Horoscope too short");
  if (cleaned.length > 1200) return cleaned.slice(0, 1200);
  return cleaned;
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
        highlightedStars: [
          daily.sihua.hualu,
          daily.sihua.huaquan,
          daily.sihua.huake,
          daily.sihua.huaji,
        ],
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
        highlightedStars: [
          daily.sihua.hualu,
          daily.sihua.huaquan,
          daily.sihua.huake,
          daily.sihua.huaji,
        ],
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
    highlightedStars: [
      daily.sihua.hualu,
      daily.sihua.huaquan,
      daily.sihua.huake,
      daily.sihua.huaji,
    ],
    transitSummary: daily.summary,
    source: "template",
  };
}
