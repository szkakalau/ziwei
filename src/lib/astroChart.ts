import { astro } from "iztro";

/**
 * Map clock time to iztro time slot index 0–12 (early Rat through late Rat).
 */
export function solarTimeToTimeIndex(hour: number, minute: number): number {
  const h = hour + minute / 60;
  if (hour === 0) return 0;
  if (hour === 23) return 12;
  if (h >= 1 && h < 3) return 1;
  if (h >= 3 && h < 5) return 2;
  if (h >= 5 && h < 7) return 3;
  if (h >= 7 && h < 9) return 4;
  if (h >= 9 && h < 11) return 5;
  if (h >= 11 && h < 13) return 6;
  if (h >= 13 && h < 15) return 7;
  if (h >= 15 && h < 17) return 8;
  if (h >= 17 && h < 19) return 9;
  if (h >= 19 && h < 21) return 10;
  if (h >= 21 && h < 23) return 11;
  return 6;
}

export function buildChartFromLocalClock({
  birthDate,
  birthTime,
  gender,
}: {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  gender: "male" | "female";
}) {
  const [y, m, d] = birthDate.split("-").map(Number);
  const [hh, mm] = birthTime.split(":").map(Number);
  const timeIndex = solarTimeToTimeIndex(Number(hh) || 12, Number(mm) || 0);
  const genderName = gender === "male" ? "男" : "女";
  return astro.bySolar(`${y}-${m}-${d}`, timeIndex, genderName, true, "en-US");
}

/**
 * Build a chart from apparent solar calendar components (after timezone + true solar correction).
 * iztro expects gender as Chinese characters internally; UI uses en-US for all surfaced labels.
 */
export function buildChartFromApparentSolar({
  year,
  month,
  day,
  hour,
  minute,
  gender,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: "male" | "female";
}) {
  const solarDateStr = `${year}-${month}-${day}`;
  const timeIndex = solarTimeToTimeIndex(hour, minute);
  // iztro expects these exact gender tokens for internal lookup (not shown in UI).
  const genderName = gender === "male" ? "男" : "女";
  return astro.bySolar(solarDateStr, timeIndex, genderName, true, "en-US");
}
