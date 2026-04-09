import type { BirthChartMeta } from "@/lib/computeBirthChart";

const MAX_CHART_JSON_CHARS = 28_000;

/**
 * Turn computed chart + birth meta into a single user prompt for the LLM.
 * Chart JSON is capped to stay within model context limits.
 */
export function chartToAiPrompt(params: {
  chart: unknown;
  meta: BirthChartMeta;
}): string {
  const { meta } = params;
  let chartJson: string;
  try {
    chartJson = JSON.stringify(params.chart, null, 2);
  } catch {
    chartJson = String(params.chart);
  }
  if (chartJson.length > MAX_CHART_JSON_CHARS) {
    chartJson = `${chartJson.slice(0, MAX_CHART_JSON_CHARS)}\n\n[…truncated for length…]`;
  }

  return `You are an expert Zi Wei Dou Shu (Purple Star astrology) consultant writing a paid client report in English.

Birth context (after timezone / true-solar handling where applicable):
- Apparent solar date used for the chart: ${meta.apparentSolarDate}
- Apparent solar time used for the chart: ${meta.apparentSolarTime}
- Place label: ${meta.placeLabel}
- Approximate chart: ${meta.isApproximate ? "yes (timezone/true-solar corrections may be incomplete)" : "no"}

Below is the structured Zi Wei chart data (palaces, stars, etc.) as JSON from our engine. Use it as the factual basis; do not invent stars or palace positions that contradict the JSON.

--- CHART JSON ---
${chartJson}
--- END CHART ---

Write a single cohesive destiny reading with these sections (use clear headings):
1) Personality & core drives
2) Career & vocation
3) Wealth & resources
4) Love & relationships
5) Strengths & blind spots / risks
6) Ten-year luck cycles (describe phases and how to work with timing; stay consistent with the chart themes)

Style: professional, warm, specific to this chart (reference palace names and key stars where helpful). No medical or legal claims.

Length: aim for roughly 4,000–6,000 words. Use plain paragraphs; no JSON in the answer.`;
}
