/**
 * Loads Noto Sans SC (subset OTF) for embedding in PDF. Cached per server instance.
 * Override with NOTO_SANS_SC_OTF_URL if you self-host a smaller subset.
 */
let cached: Uint8Array | null = null;

export async function loadNotoSansScOtfBytes(): Promise<Uint8Array> {
  if (cached) return cached;
  const url =
    process.env.NOTO_SANS_SC_OTF_URL?.trim() ||
    "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download Chinese PDF font (${res.status})`);
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  cached = buf;
  return buf;
}

export function clearNotoSansScFontCacheForTests() {
  cached = null;
}
