import { DateTime } from "luxon";

/**
 * Equation of time in minutes (low-precision approximation, typically within ~1 minute of NOAA tables).
 */
export function equationOfTimeMinutes(dayOfYear: number): number {
  const B = (2 * Math.PI * (dayOfYear - 81)) / 364;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
}

/**
 * Apparent solar time as wall-clock components derived from the UTC instant and birth longitude.
 * Longitude uses the standard convention: degrees east of Greenwich (positive east).
 *
 * Combines mean solar offset (4 minutes per degree of longitude) with the equation of time.
 */
export function apparentSolarFromUtcInstant(
  utc: DateTime,
  longitudeEastDegrees: number,
): { year: number; month: number; day: number; hour: number; minute: number } {
  if (!utc.isValid) {
    throw new Error("Invalid UTC DateTime");
  }

  const eotMin = equationOfTimeMinutes(utc.ordinal);
  const dayStartUtc = utc.startOf("day");
  let minutes =
    utc.diff(dayStartUtc, "minutes").minutes +
    longitudeEastDegrees * 4 +
    eotMin;

  let cal = dayStartUtc;
  while (minutes < 0) {
    minutes += 24 * 60;
    cal = cal.minus({ days: 1 });
  }
  while (minutes >= 24 * 60) {
    minutes -= 24 * 60;
    cal = cal.plus({ days: 1 });
  }

  const hour = Math.floor(minutes / 60);
  const minute = Math.floor(minutes % 60);

  return {
    year: cal.year,
    month: cal.month,
    day: cal.day,
    hour,
    minute,
  };
}
