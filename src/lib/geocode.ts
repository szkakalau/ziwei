/**
 * OpenStreetMap Nominatim (usage policy: https://operations.osmfoundation.org/policies/nominatim/).
 * Set NOMINATIM_USER_AGENT in production, e.g. "YourApp/1.0 (you@domain.com)".
 */
export type GeocodeHit = {
  lat: number;
  lon: number;
  displayName: string;
};

export async function geocodeLocation(
  query: string,
): Promise<GeocodeHit | null> {
  const q = query.trim();
  if (!q) return null;

  const userAgent =
    process.env.NOMINATIM_USER_AGENT?.trim() ||
    "ZiweiMarketingSite/1.0 (add NOMINATIM_USER_AGENT in env for production)";

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": userAgent },
    cache: "no-store",
  });

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
