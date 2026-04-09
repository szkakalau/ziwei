/**
 * Remove fields that iztro still localizes in Chinese even when language is en-US.
 */
export function sanitizeChartForEnglishSite(chart: unknown): unknown {
  const clone = JSON.parse(JSON.stringify(chart)) as Record<string, unknown>;
  delete clone.lunarDate;
  delete clone.rawDates;
  return clone;
}

/** Same as {@link sanitizeChartForEnglishSite} but never throws (e.g. non-JSON chart). */
export function sanitizeChartForEnglishSiteSafe(chart: unknown): unknown {
  try {
    return sanitizeChartForEnglishSite(chart);
  } catch {
    return chart;
  }
}
