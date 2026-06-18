/**
 * Daily Transit — computes the current day's Heavenly Stem (日干) and
 * its corresponding 四化 (4 Transformations) based on Zi Wei Dou Shu rules.
 *
 * The 十干四化 table is one of the foundational rules of ZWDS:
 * each of the 10 Heavenly Stems maps to exactly 4 transforming stars
 * (化禄·化权·化科·化忌).
 */

import { getStarNaming, type StarNaming } from "@/lib/zwdsNaming";

// ═══════════════════════════════════════════════════════════════════════
// Heavenly Stem → 四化 stars (iztro canonical keys)
// ═══════════════════════════════════════════════════════════════════════

export interface SiHuaEntry {
  /** iztro key of the star that undergoes 化禄 (Prosperity) */
  hualu: string;
  /** iztro key of the star that undergoes 化权 (Authority) */
  huaquan: string;
  /** iztro key of the star that undergoes 化科 (Fame) */
  huake: string;
  /** iztro key of the star that undergoes 化忌 (Taboo / Obstacle) */
  huaji: string;
}

export interface DailyTransit {
  /** Today's date in ISO (YYYY-MM-DD) */
  date: string;
  /** Heavenly Stem name (e.g. "甲", "壬") */
  stem: string;
  /** English description of the stem */
  stemDescription: string;
  /** The 4 transformation stars for today */
  sihua: SiHuaEntry;
  /** Pre-formatted display names using project naming */
  display: {
    hualu: StarNaming;
    huaquan: StarNaming;
    huake: StarNaming;
    huaji: StarNaming;
  };
  /** Human-readable transit summary for the prompt */
  summary: string;
}

/** Heavenly Stems in order (index 0 = 甲, 1 = 乙, ..., 9 = 癸) */
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

const STEM_DESCRIPTIONS: Record<string, string> = {
  "甲": "Yang Wood — growth, initiation, expansion",
  "乙": "Yin Wood — flexibility, adaptation, refinement",
  "丙": "Yang Fire — brilliance, visibility, passion",
  "丁": "Yin Fire — focus, precision, sustained warmth",
  "戊": "Yang Earth — stability, foundation, consolidation",
  "己": "Yin Earth — nurturing, cultivation, patience",
  "庚": "Yang Metal — decisiveness, cutting through, transformation",
  "辛": "Yin Metal — elegance, refinement, detail",
  "壬": "Yang Water — flow, communication, movement",
  "癸": "Yin Water — depth, intuition, hidden currents",
};

/**
 * 十天干四化表 — the canonical ZWDS rule for daily transformations.
 * Keyed by Heavenly Stem (甲～癸), values are iztro canonical keys.
 */
const SIHUA_TABLE: Record<string, SiHuaEntry> = {
  "甲": { hualu: "upright",  huaquan: "rebel",       huake: "general",       huaji: "sun" },
  "乙": { hualu: "advisor",  huaquan: "sage",        huake: "emperor",       huaji: "moon" },
  "丙": { hualu: "fortunate",huaquan: "advisor",     huake: "wenchang",      huaji: "upright" },
  "丁": { hualu: "moon",     huaquan: "fortunate",   huake: "advisor",       huaji: "judge" },
  "戊": { hualu: "wolf",     huaquan: "moon",        huake: "youbi",         huaji: "advisor" },
  "己": { hualu: "general",  huaquan: "wolf",        huake: "sage",          huaji: "wenqu" },
  "庚": { hualu: "sun",      huaquan: "general",     huake: "moon",          huaji: "fortunate" },
  "辛": { hualu: "judge",    huaquan: "sun",         huake: "wenqu",         huaji: "wenchang" },
  "壬": { hualu: "sage",     huaquan: "emperor",     huake: "zuofu",         huaji: "general" },
  "癸": { hualu: "rebel",    huaquan: "judge",       huake: "moon",          huaji: "wolf" },
};

/**
 * Compute the day Heavenly Stem (日干) for any Gregorian date.
 *
 * Uses the standard Chinese calendar formula: day stem is derived from
 * the number of days since a known 甲 day. January 1, 1900 was a 甲戌 day
 * (stem = 0 = 甲).
 *
 * Algorithm: dayStemIndex = (julianDayNumber(date) + 9) % 10
 * where JDN of 1900-01-01 = 2415021 and 2415021 + 9 ≡ 0 (mod 10).
 */
function computeDayStem(date: Date): string {
  const jdn = gregorianToJDN(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const stemIndex = (jdn + 9) % 10;
  return STEMS[stemIndex];
}

/**
 * Convert a Gregorian date to Julian Day Number.
 * Uses the standard algorithm valid for all dates after 1582-10-15.
 */
function gregorianToJDN(y: number, m: number, d: number): number {
  // Adjust January and February
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716))
       + Math.floor(30.6001 * (m + 1))
       + d + B - 1524;
}

/**
 * Get today's complete transit data including 四化.
 * Returns null if star naming lookup fails (should never happen).
 */
export function getDailyTransit(date?: Date): DailyTransit {
  const d = date ?? new Date();
  const stem = computeDayStem(d);
  const sihua = SIHUA_TABLE[stem];

  const dateStr = d.toISOString().slice(0, 10);

  const hualuName = getStarNaming(sihua.hualu);
  const huaquanName = getStarNaming(sihua.huaquan);
  const huakeName = getStarNaming(sihua.huake);
  const huajiName = getStarNaming(sihua.huaji);

  if (!hualuName || !huaquanName || !huakeName || !huajiName) {
    // Should never happen — all sihua keys are valid
    throw new Error(`Star naming lookup failed for daily transit on ${dateStr}`);
  }

  const summary = [
    `${hualuName.pinyin}·${hualuName.alias} → Hua Lu`,
    `${huaquanName.pinyin}·${huaquanName.alias} → Hua Quan`,
    `${huakeName.pinyin}·${huakeName.alias} → Hua Ke`,
    `${huajiName.pinyin}·${huajiName.alias} → Hua Ji`,
  ].join(" | ");

  return {
    date: dateStr,
    stem,
    stemDescription: STEM_DESCRIPTIONS[stem] ?? "",
    sihua,
    display: {
      hualu: hualuName,
      huaquan: huaquanName,
      huake: huakeName,
      huaji: huajiName,
    },
    summary,
  };
}
