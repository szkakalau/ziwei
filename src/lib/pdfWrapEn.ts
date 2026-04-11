import type { PDFFont } from "pdf-lib";

/** Wrap English (and mixed) text to fit maxWidth using actual glyph widths — avoids overflow past page margins. */
export function wrapEnLinesByWidth(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let cur = "";

  const pushWord = (w: string) => {
    if (!w) return;
    if (font.widthOfTextAtSize(w, size) <= maxWidth) {
      const trial = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
        cur = trial;
        return;
      }
      if (cur) lines.push(cur);
      cur = w;
      return;
    }
    if (cur) {
      lines.push(cur);
      cur = "";
    }
    let chunk = "";
    for (const ch of Array.from(w)) {
      const trial = chunk + ch;
      if (font.widthOfTextAtSize(trial, size) > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk = trial;
      }
    }
    if (chunk) cur = cur ? `${cur} ${chunk}` : chunk;
  };

  for (const w of words) {
    pushWord(w);
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}
