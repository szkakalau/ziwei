import { find as findTimezones1970 } from "geo-tz";
import { find as findTimezonesAll } from "geo-tz/all";
import { DateTime, FixedOffsetZone } from "luxon";
import { apparentSolarFromUtcInstant } from "@/lib/apparentSolar";
import { GeocodeUnavailableError, geocodeLocation } from "@/lib/geocode";
import {
  buildChartFromApparentSolar,
  buildChartFromLocalClock,
} from "@/lib/astroChart";
import { sanitizeChartForEnglishSiteSafe } from "@/lib/chartSanitize";

export type BirthChartInput = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

export type BirthChartMeta = {
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
  isApproximate?: boolean;
};

export type BirthChartSuccess = {
  ok: true;
  chart: unknown;
  meta: BirthChartMeta;
};

export type BirthChartFailure = {
  ok: false;
  errorCode:
    | "LOCATION_NOT_FOUND"
    | "GEOCODE_UNAVAILABLE"
    | "TIMEZONE_UNKNOWN"
    | "INVALID_DATETIME";
};

/** Try 1970-reduced DB first, then full DB (covers more coordinates). */
function timezonesAtPoint(lat: number, lon: number): string[] {
  try {
    const z = findTimezones1970(lat, lon);
    if (z.length > 0) return z;
  } catch {
    /* fall through */
  }
  try {
    const z = findTimezonesAll(lat, lon);
    if (z.length > 0) return z;
  } catch {
    /* fall through */
  }
  return [];
}

/** Mean solar time offset from longitude (minutes east of UTC), clamped to ±14h. */
function meanSolarOffsetMinutes(longitudeEast: number): number {
  const raw = Math.round(longitudeEast * 4);
  return Math.max(-840, Math.min(840, raw));
}

function utcOffsetLabel(totalMinutes: number): string {
  const sign = totalMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (m === 0) return `${sign}${h}`;
  return `${sign}${h}:${String(m).padStart(2, "0")}`;
}

/** Latin-only query (e.g. pinyin) but geocoder returned local script — show what the user typed for labels. */
function placeLabelForDisplay(userLocation: string, geocoderDisplayName: string): string {
  const q = userLocation.trim();
  const userIsLatinOnly =
    q.length > 0 &&
    Array.from(q).every((ch) => {
      const cp = ch.codePointAt(0) ?? 0;
      return cp <= 0xff;
    });
  const displayHasNonLatin = Array.from(geocoderDisplayName).some(
    (ch) => (ch.codePointAt(0) ?? 0) > 0xff,
  );
  if (userIsLatinOnly && displayHasNonLatin) return q;
  return geocoderDisplayName;
}

export async function computeBirthChart(
  input: BirthChartInput,
): Promise<BirthChartSuccess | BirthChartFailure> {
  let geo;
  try {
    geo = await geocodeLocation(input.location);
  } catch (e) {
    if (e instanceof GeocodeUnavailableError) {
      if (input.allowFallback) {
        const chart = buildChartFromLocalClock({
          birthDate: input.birthDate,
          birthTime: input.birthTime?.trim() || "12:00",
          gender: input.gender,
        });
        return {
          ok: true,
          chart: sanitizeChartForEnglishSiteSafe(chart),
          meta: {
            timezone: "Approximate",
            latitude: 0,
            longitude: 0,
            placeLabel: input.location || "Unknown",
            apparentSolarDate: input.birthDate,
            apparentSolarTime: input.birthTime?.trim() || "12:00",
            isApproximate: true,
          },
        };
      }
      return { ok: false, errorCode: "GEOCODE_UNAVAILABLE" };
    }
    if (input.allowFallback) {
      const chart = buildChartFromLocalClock({
        birthDate: input.birthDate,
        birthTime: input.birthTime?.trim() || "12:00",
        gender: input.gender,
      });
      return {
        ok: true,
        chart: sanitizeChartForEnglishSiteSafe(chart),
        meta: {
          timezone: "Approximate",
          latitude: 0,
          longitude: 0,
          placeLabel: input.location || "Unknown",
          apparentSolarDate: input.birthDate,
          apparentSolarTime: input.birthTime?.trim() || "12:00",
          isApproximate: true,
        },
      };
    }
    return { ok: false, errorCode: "GEOCODE_UNAVAILABLE" };
  }
  if (!geo) {
    return { ok: false, errorCode: "LOCATION_NOT_FOUND" };
  }

  const zones = timezonesAtPoint(geo.lat, geo.lon);
  const ianaZone = zones[0];

  let zoneForLuxon: string | FixedOffsetZone;
  let timezoneLabel: string;
  let usedLongitudeTimezoneFallback: boolean;

  if (ianaZone != null) {
    zoneForLuxon = ianaZone;
    timezoneLabel = ianaZone;
    usedLongitudeTimezoneFallback = false;
  } else {
    const offsetMin = meanSolarOffsetMinutes(geo.lon);
    zoneForLuxon = FixedOffsetZone.instance(offsetMin);
    timezoneLabel = `Estimated mean solar (UTC${utcOffsetLabel(offsetMin)})`;
    usedLongitudeTimezoneFallback = true;
  }

  const parts = input.birthDate.split("-").map(Number);
  const y = parts[0];
  const mo = parts[1];
  const d = parts[2];
  if (!y || !mo || !d) {
    return { ok: false, errorCode: "INVALID_DATETIME" };
  }

  const rawTime = input.birthTime?.trim() || "12:00";
  const [hStr, mStr] = rawTime.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr) || 0;
  const safeHour = Number.isFinite(hour) ? hour : 12;

  const civil = DateTime.fromObject(
    {
      year: y,
      month: mo,
      day: d,
      hour: safeHour,
      minute,
      second: 0,
      millisecond: 0,
    },
    { zone: zoneForLuxon },
  );

  if (!civil.isValid) {
    return { ok: false, errorCode: "INVALID_DATETIME" };
  }

  const utc = civil.toUTC();
  const apparent = apparentSolarFromUtcInstant(utc, geo.lon);

  let chart: ReturnType<typeof buildChartFromApparentSolar>;
  try {
    chart = buildChartFromApparentSolar({
      year: apparent.year,
      month: apparent.month,
      day: apparent.day,
      hour: apparent.hour,
      minute: apparent.minute,
      gender: input.gender,
    });
  } catch {
    return { ok: false, errorCode: "INVALID_DATETIME" };
  }

  const chartPayload = sanitizeChartForEnglishSiteSafe(chart);

  const apparentSolarDate = `${apparent.year}-${String(apparent.month).padStart(2, "0")}-${String(apparent.day).padStart(2, "0")}`;
  const apparentSolarTime = `${String(apparent.hour).padStart(2, "0")}:${String(apparent.minute).padStart(2, "0")}`;

  return {
    ok: true,
    chart: chartPayload,
    meta: {
      timezone: timezoneLabel,
      latitude: geo.lat,
      longitude: geo.lon,
      placeLabel: placeLabelForDisplay(input.location, geo.displayName),
      apparentSolarDate,
      apparentSolarTime,
      ...(usedLongitudeTimezoneFallback ? { isApproximate: true } : {}),
    },
  };
}
