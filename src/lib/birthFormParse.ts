/** Accepts YYYY-M-D or YYYY-MM-DD; returns padded YYYY-MM-DD or null. */
export function normalizeYyyyMmDd(input: string): string | null {
  const t = input.trim();
  const m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const y = m[1];
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  return isValidYyyyMmDd(iso) ? iso : null;
}

/** Gregorian date string YYYY-MM-DD (for APIs / iztro). */
export function isValidYyyyMmDd(s: string): boolean {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return false;
  const y = Number(t.slice(0, 4));
  const m = Number(t.slice(5, 7));
  const d = Number(t.slice(8, 10));
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/** 24-hour H:MM or HH:MM */
export function isValid24hTime(s: string): boolean {
  const t = s.trim();
  if (!t) return true;
  if (!/^([01]?\d|2[0-3]):([0-5]\d)$/.test(t)) return false;
  return true;
}

export function pad24hTime(s: string): string {
  const t = s.trim();
  if (!t) return "12:00";
  const [h, m] = t.split(":");
  const hh = h.padStart(2, "0");
  const mm = m.padStart(2, "0");
  return `${hh}:${mm}`;
}
