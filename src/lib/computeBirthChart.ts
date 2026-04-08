import { find as findTimezones } from "geo-tz";
import { DateTime } from "luxon";
import { apparentSolarFromUtcInstant } from "@/lib/apparentSolar";
import { GeocodeUnavailableError, geocodeLocation } from "@/lib/geocode";
import { buildChartFromApparentSolar } from "@/lib/astroChart";
import { sanitizeChartForEnglishSite } from "@/lib/chartSanitize";

export type BirthChartInput = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
};

export type BirthChartMeta = {
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
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

export async function computeBirthChart(
  input: BirthChartInput,
): Promise<BirthChartSuccess | BirthChartFailure> {
  let geo;
  try {
    geo = await geocodeLocation(input.location);
  } catch (e) {
    if (e instanceof GeocodeUnavailableError) {
      return { ok: false, errorCode: "GEOCODE_UNAVAILABLE" };
    }
    return { ok: false, errorCode: "GEOCODE_UNAVAILABLE" };
  }
  if (!geo) {
    return { ok: false, errorCode: "LOCATION_NOT_FOUND" };
  }

  const zones = findTimezones(geo.lat, geo.lon);
  if (!zones.length) {
    return { ok: false, errorCode: "TIMEZONE_UNKNOWN" };
  }
  const zone = zones[0];

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
    { zone },
  );

  if (!civil.isValid) {
    return { ok: false, errorCode: "INVALID_DATETIME" };
  }

  const utc = civil.toUTC();
  const apparent = apparentSolarFromUtcInstant(utc, geo.lon);

  const chart = buildChartFromApparentSolar({
    year: apparent.year,
    month: apparent.month,
    day: apparent.day,
    hour: apparent.hour,
    minute: apparent.minute,
    gender: input.gender,
  });

  const chartPayload = sanitizeChartForEnglishSite(chart);

  const apparentSolarDate = `${apparent.year}-${String(apparent.month).padStart(2, "0")}-${String(apparent.day).padStart(2, "0")}`;
  const apparentSolarTime = `${String(apparent.hour).padStart(2, "0")}:${String(apparent.minute).padStart(2, "0")}`;

  return {
    ok: true,
    chart: chartPayload,
    meta: {
      timezone: zone,
      latitude: geo.lat,
      longitude: geo.lon,
      placeLabel: geo.displayName,
      apparentSolarDate,
      apparentSolarTime,
    },
  };
}
