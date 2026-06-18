/**
 * Shared chart formatting utility — translates raw iztro star keys into
 * project naming (Pinyin · English Alias) for AI prompts.
 *
 * This is the single source of truth for all chart→text formatting.
 * Every AI route (chat, yearly, compatibility, birthday, etc.) uses
 * these functions so the model receives consistent, readable star names
 * instead of raw iztro keys like "emperor" or "wolf".
 */

import {
  getStarNaming,
  getStarClass,
} from "@/lib/zwdsNaming";

/** A single star reference (from iztro chart JSON). */
interface StarRef {
  name?: string;
}

/** A palace from iztro chart JSON. */
interface PalaceRef {
  name?: string;
  majorStars?: StarRef[];
  minorStars?: StarRef[];
}

/** Minimal chart shape accepted by all formatters. */
interface ChartLike {
  palaces?: PalaceRef[];
}

// ═══════════════════════════════════════════════════════════════════════
// Star name translation
// ═══════════════════════════════════════════════════════════════════════

/**
 * Translate a raw iztro star key to its project display name.
 * Example: "emperor" → "Zi Wei · Emperor Star"
 * Falls back to the raw name if not found.
 */
function translateStar(raw: string): string {
  const naming = getStarNaming(raw);
  if (!naming) return raw;
  return `${naming.pinyin} · ${naming.alias}`;
}

/**
 * Get just the pinyin for a star (for compact formatting).
 * Example: "emperor" → "Zi Wei"
 */
function translateStarPinyin(raw: string): string {
  return getStarNaming(raw)?.pinyin ?? raw;
}

// ═══════════════════════════════════════════════════════════════════════
// Chart → Text formatters (use per-route)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Compact palace list for chat / daily prompts.
 * Format: "Self Palace: Zi Wei · Emperor Star, Tian Ji · Strategist Star"
 */
export function formatChartCompact(chart: ChartLike): string {
  return (chart.palaces ?? [])
    .map((p) => {
      const major = (p.majorStars ?? [])
        .map((s) => s?.name)
        .filter(Boolean) as string[];
      const minor = (p.minorStars ?? [])
        .map((s) => s?.name)
        .filter(Boolean) as string[];
      const all = [...major, ...minor].map(translateStar);
      return `${p.name ?? "Unknown"} Palace: ${all.join(", ") || "empty"}`;
    })
    .join("\n");
}

/**
 * Detailed chart summary for yearly/compatibility/birthday readings.
 * Groups stars by class (Major / Auspicious / Inauspicious / Transformation)
 * and labels important palaces with their dominant stars.
 *
 * Format:
 * ```
 * Core Self Palace: Zi Wei (Emperor Star), Tian Ji (Strategist Star)
 *
 * Major Stars: Zi Wei · Emperor Star, Wu Qu · Marshal Star
 * Auspicious Stars: Zuo Fu · Left Hand Star
 * Inauspicious Stars: Di Kong · Void Star
 * ```
 */
export function formatChartDetailed(chart: ChartLike): string {
  const palaces = chart.palaces ?? [];

  // Key palaces first
  const keyPalaces = ["命宫", "Self", "夫妻", "Spouse", "官禄", "Career", "财帛", "Wealth", "福德", "Fortune"];
  const keyLines: string[] = [];

  for (const palace of palaces) {
    const pName = palace.name ?? "";
    const isKey = keyPalaces.some((k) => pName.toLowerCase().includes(k.toLowerCase()));
    if (!isKey) continue;

    const stars = [
      ...(palace.majorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
      ...(palace.minorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
    ];
    if (stars.length === 0) continue;

    const labeled = stars.map(translateStarPinyin).join(", ");
    keyLines.push(`${pName} Palace: ${labeled}`);
  }

  // All stars grouped by class
  const seen = new Set<string>();
  const classes: Record<string, string[]> = {
    major: [],
    auspicious: [],
    inauspicious: [],
    transformation: [],
    minor: [],
  };

  for (const palace of palaces) {
    const all = [
      ...(palace.majorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
      ...(palace.minorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
    ];
    for (const raw of all) {
      if (seen.has(raw)) continue;
      seen.add(raw);
      const cls = getStarClass(raw);
      const label = translateStar(raw);
      if (classes[cls]) classes[cls].push(label);
    }
  }

  const sections: string[] = [];

  if (keyLines.length > 0) {
    sections.push("KEY PALACES:\n" + keyLines.join("\n"));
  }

  if (classes.major.length > 0)
    sections.push("MAJOR STARS: " + classes.major.join(", "));
  if (classes.auspicious.length > 0)
    sections.push("AUSPICIOUS STARS: " + classes.auspicious.join(", "));
  if (classes.inauspicious.length > 0)
    sections.push("INAUSPICIOUS STARS: " + classes.inauspicious.join(", "));
  if (classes.transformation.length > 0)
    sections.push("TRANSFORMATION STARS: " + classes.transformation.join(", "));

  return sections.join("\n\n");
}

/**
 * Simplified one-line summary for notifications / previews.
 * Example: "Zi Wei · Emperor Star, Wu Qu · Marshal Star, ..." (top 6)
 */
export function formatChartPreview(chart: ChartLike, maxStars = 6): string {
  const seen = new Set<string>();
  const labels: string[] = [];

  for (const palace of chart.palaces ?? []) {
    const all = [
      ...(palace.majorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
      ...(palace.minorStars ?? []).map((s) => s?.name).filter(Boolean) as string[],
    ];
    for (const raw of all) {
      if (seen.has(raw)) continue;
      seen.add(raw);
      labels.push(translateStar(raw));
      if (labels.length >= maxStars) return labels.join(", ");
    }
  }

  return labels.join(", ") || "No chart data";
}
