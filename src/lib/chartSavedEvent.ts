/** Fired on `window` after a birth chart is stored in session/local storage (see BirthFormModal). */
export const CHART_SAVED_EVENT = "destinyblueprint-chart-saved";

export function dispatchChartSaved(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CHART_SAVED_EVENT));
}
