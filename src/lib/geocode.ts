/**
 * OpenStreetMap Nominatim (usage policy: https://operations.osmfoundation.org/policies/nominatim/).
 * Set NOMINATIM_USER_AGENT in production, e.g. "YourApp/1.0 (you@domain.com)".
 */
export type GeocodeHit = {
  lat: number;
  lon: number;
  displayName: string;
};

export class GeocodeUnavailableError extends Error {
  constructor(message = "Geocoding service unavailable") {
    super(message);
    this.name = "GeocodeUnavailableError";
  }
}

export type GeocodeSuggestion = {
  lat: number;
  lon: number;
  displayName: string;
};

export async function geocodeSuggestions(
  query: string,
  limit = 5,
): Promise<GeocodeSuggestion[]> {
  const q = query.trim();
  if (!q) return [];

  const userAgent =
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "DestinyBlueprint/1.0 (add NOMINATIM_USER_AGENT in env for production)";

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        "User-Agent": userAgent,
        // Prefer English place names so UI/PDF match Latin input (pinyin, English) instead of local script.
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
  } catch {
    throw new GeocodeUnavailableError();
  }

  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  return data
    .map((hit) => {
      const lat = Number(hit.lat);
      const lon = Number(hit.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return { lat, lon, displayName: hit.display_name };
    })
    .filter(Boolean) as GeocodeSuggestion[];
}

export async function geocodeLocation(
  query: string,
): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const userAgent =
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "DestinyBlueprint/1.0 (add NOMINATIM_USER_AGENT in env for production)";

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        "User-Agent": userAgent,
        "Accept-Language": "en",
      },
      cache: "no-store",
    });
  } catch {
    throw new GeocodeUnavailableError();
  }

  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  const hit = data[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lon = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  return { lat, lon, displayName: hit.display_name };
}
