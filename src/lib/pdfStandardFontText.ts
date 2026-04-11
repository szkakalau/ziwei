/**
 * pdf-lib StandardFonts use PDF WinAnsi encoding. drawText throws on CJK and many Unicode punctuation marks.
 * Normalize to a safe subset so paid PDF downloads do not 500 when birth metadata contains non-Latin text.
 */
export function toPdfStandardFontText(input: string): string {
  const normalized = input
    .replace(/\u2014|\u2013/g, "-")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2018|\u2019|\u2032/g, "'")
    .replace(/\u2026/g, "...")
    .replace(/\u2022|\u00b7/g, "*")
    .replace(/\u00a0/g, " ");

  let out = "";
  for (const ch of normalized) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0x09 || cp === 0x0a || cp === 0x0d) {
      out += " ";
      continue;
    }
    if (cp < 0x20) continue;
    if (cp >= 0x20 && cp <= 0x7e) {
      out += ch;
      continue;
    }
    if (cp <= 0xff) {
      out += ch;
      continue;
    }
    out += "?";
  }
  return out;
}
