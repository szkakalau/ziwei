type StarLike = {
  name?: string;
  brightness?: string;
  mutagen?: string;
};

type PalaceLike = {
  name?: string;
  isBodyPalace?: boolean;
  heavenlyStem?: string;
  earthlyBranch?: string;
  majorStars?: StarLike[];
  minorStars?: StarLike[];
  adjectiveStars?: StarLike[];
  changsheng12?: string;
  boshi12?: string;
  jiangqian12?: string;
  suiqian12?: string;
  decadal?: { range?: number[]; heavenlyStem?: string; earthlyBranch?: string };
  ages?: number[];
};

type AstrolabeLike = {
  solarDate?: string;
  time?: string;
  timeRange?: string;
  gender?: string;
  fiveElementsClass?: string;
  soul?: string;
  body?: string;
  earthlyBranchOfSoulPalace?: string;
  earthlyBranchOfBodyPalace?: string;
  chineseDate?: string;
  palaces?: PalaceLike[];
};

function fmtStar(s: StarLike): string {
  const n = (s.name ?? "").trim();
  if (!n) return "";
  const b = (s.brightness ?? "").trim();
  const m = (s.mutagen ?? "").trim();
  let t = n;
  if (b) t += `（${b}）`;
  if (m) t += `〔${m}〕`;
  return t;
}

function joinStars(stars: StarLike[] | undefined, limit: number): string {
  if (!stars?.length) return "";
  return stars
    .map(fmtStar)
    .filter(Boolean)
    .slice(0, limit)
    .join("、");
}

function joinPlainStarNames(stars: StarLike[] | undefined, limit: number): string {
  if (!stars?.length) return "";
  return stars
    .map((s) => (s.name ?? "").trim())
    .filter(Boolean)
    .slice(0, limit)
    .join("、");
}

/**
 * Plain-text lines for the paid PDF “紫微盘” block (Traditional chart facts, zh-CN labels).
 */
export function formatChineseAstrolabeForPdf(astrolabe: unknown): string[] {
  const a = astrolabe as AstrolabeLike;
  const lines: string[] = [];

  lines.push("紫微斗数 · 本命盘（真盘）");
  lines.push("");

  if (a.solarDate) lines.push(`阳历：${a.solarDate}`);
  if (a.timeRange || a.time) lines.push(`时辰：${a.timeRange ?? a.time}`);
  if (a.gender) lines.push(`性别：${a.gender}`);
  if (a.chineseDate) lines.push(`农历四柱：${a.chineseDate}`);
  if (a.fiveElementsClass) lines.push(`五行局：${a.fiveElementsClass}`);
  if (a.soul) lines.push(`命主：${a.soul}`);
  if (a.body) lines.push(`身主：${a.body}`);
  if (a.earthlyBranchOfSoulPalace) lines.push(`命宫地支：${a.earthlyBranchOfSoulPalace}`);
  if (a.earthlyBranchOfBodyPalace) lines.push(`身宫地支：${a.earthlyBranchOfBodyPalace}`);

  lines.push("");
  lines.push("—— 十二宫星曜 ——");
  lines.push("");

  const palaces = Array.isArray(a.palaces) ? a.palaces : [];
  for (const p of palaces) {
    const stem = (p.heavenlyStem ?? "").trim();
    const branch = (p.earthlyBranch ?? "").trim();
    const ganzhi = stem && branch ? `${stem}${branch}` : stem || branch || "—";
    const bodyTag = p.isBodyPalace ? " · 身宫同宫" : "";
    lines.push(`【${p.name ?? "宫"}】${ganzhi}${bodyTag}`);

    const majors = joinStars(p.majorStars, 12);
    const minors = joinPlainStarNames(p.minorStars, 16);
    const adj = joinPlainStarNames(p.adjectiveStars, 14);

    lines.push(majors ? `主星：${majors}` : "主星：—");
    lines.push(minors ? `辅星：${minors}` : "辅星：—");
    lines.push(adj ? `杂曜：${adj}` : "杂曜：—");

    const sx = [p.changsheng12, p.boshi12, p.jiangqian12, p.suiqian12].filter(Boolean).join(" · ");
    if (sx) lines.push(`神煞：${sx}`);

    const dec = p.decadal;
    if (dec?.range?.length === 2) {
      lines.push(
        `大限：${dec.range[0]}–${dec.range[1]}岁（${(dec.heavenlyStem ?? "") + (dec.earthlyBranch ?? "")}）`,
      );
    }
    if (p.ages?.length) {
      lines.push(`小限年龄点：${p.ages.slice(0, 6).join("、")}${p.ages.length > 6 ? "…" : ""}`);
    }
    lines.push("");
  }

  return lines;
}
