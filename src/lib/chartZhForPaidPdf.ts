import type { BirthChartMeta } from "@/lib/computeBirthChart";
import { buildChartFromApparentSolar } from "@/lib/astroChart";

/** Same apparent-solar split as paid PDF / checkout metadata handling. */
export function apparentPartsFromMeta(meta: BirthChartMeta) {
  const [y, mo, d] = meta.apparentSolarDate.split("-").map(Number);
  const [h, mi] = meta.apparentSolarTime.split(":").map(Number);
  return {
    year: y,
    month: mo,
    day: d,
    hour: Number.isFinite(h) ? h : 12,
    minute: Number.isFinite(mi) ? mi : 0,
  };
}

/**
 * Plain JSON zh-CN astrolabe for PDF grid (same engine as /api/birth-chart + iztro zh-CN).
 */
export function buildZhChartPlainForMeta(
  meta: BirthChartMeta,
  gender: "male" | "female",
): unknown {
  const parts = apparentPartsFromMeta(meta);
  const raw = buildChartFromApparentSolar({
    ...parts,
    gender,
    locale: "zh-CN",
  });
  return JSON.parse(
    JSON.stringify(raw, (_k, v) => (typeof v === "function" ? undefined : v)),
  );
}
